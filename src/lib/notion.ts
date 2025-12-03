import { Client } from "@notionhq/client";
import type { CreatePageResponse } from "@notionhq/client/build/src/api-endpoints";

// --- Notion client setup ---

let notionClient: Client | null = null;

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is not set in environment`);
  }
  return value;
}

export function getNotionClient(): Client {
  if (!notionClient) {
    const token = requireEnv("NOTION_TOKEN");
    notionClient = new Client({ auth: token });
  }
  return notionClient;
}

function getPortalDbId() {
  return requireEnv("NOTION_PORTAL_DB_ID");
}

function getFeedbackDbId() {
  return requireEnv("NOTION_FEEDBACK_DB_ID");
}

function getProjectsDbId() {
  return requireEnv("NOTION_PROJECTS_DB_ID");
}

function getPostsDbId() {
  return requireEnv("NOTION_POSTS_DB_ID");
}

// --- Helpers ---

function richTextToPlainText(richText: any[] | undefined): string {
  if (!Array.isArray(richText)) return "";
  return richText.map((r) => r.plain_text ?? "").join("");
}

function getTextLikeValue(prop: any | undefined): string {
  if (!prop) return "";
  if (typeof prop.url === "string") return prop.url;
  if (Array.isArray(prop.rich_text)) return richTextToPlainText(prop.rich_text);
  if (Array.isArray(prop.title)) return richTextToPlainText(prop.title);
  return "";
}

function extractFileUrlFromProp(prop: any | undefined): string | undefined {
  if (!prop || !Array.isArray(prop.files) || !prop.files.length) return undefined;
  const file = prop.files[0];
  if (file.external?.url) return file.external.url;
  if (file.file?.url) return file.file.url;
  return undefined;
}

async function fetchAllBlocks(pageId: string) {
  const blocks: any[] = [];
  const notion = getNotionClient();
  let cursor: string | undefined;

  do {
    const response = await notion.blocks.children.list({
      block_id: pageId,
      start_cursor: cursor,
      page_size: 50,
    });

    blocks.push(...response.results);
    cursor = response.has_more ? response.next_cursor ?? undefined : undefined;
  } while (cursor);

  return blocks;
}

function extractMediaFromBlocks(blocks: any[]): PortalMediaItem[] {
  const media: PortalMediaItem[] = [];

  for (const block of blocks) {
    if (block.type === "video") {
      const url = block.video?.external?.url ?? block.video?.file?.url;
      if (url) {
        media.push({
          type: "video",
          url,
          caption: richTextToPlainText(block.video.caption),
        });
      }
    }

    if (block.type === "image") {
      const url = block.image?.external?.url ?? block.image?.file?.url;
      if (url) {
        media.push({
          type: "image",
          url,
          caption: richTextToPlainText(block.image.caption),
        });
      }
    }

    if (block.type === "file") {
      const url = block.file?.external?.url ?? block.file?.file?.url;
      if (url) {
        media.push({
          type: "file",
          url,
          caption: richTextToPlainText(block.file.caption),
        });
      }
    }

    if (block.type === "embed" || block.type === "bookmark") {
      const url = block[block.type]?.url;
      if (url) {
        media.push({
          type: "embed",
          url,
          caption: richTextToPlainText(block[block.type].caption),
        });
      }
    }
  }

  return media;
}

function extractNotesFromBlocks(blocks: any[]): string[] {
  return blocks
    .filter((block) => block.type === "paragraph" || block.type === "callout")
    .map((block) =>
      block[block.type]?.rich_text ? richTextToPlainText(block[block.type].rich_text) : ""
    )
    .filter(Boolean);
}

// --- Types ---

export type PortalRecentPost = {
  id: string; // Notion page id of the Post
  postId: string; // slug-like Post ID (falls back to Notion id)
  title: string;
  projectName: string; // from Projects.Name
  projectId: string; // from Projects.Project ID (slug)
};

export type PortalMediaItem = {
  type: "video" | "image" | "file" | "embed";
  url: string;
  caption?: string;
};

export type PortalPostSummary = {
  id: string;
  postId: string;
  title: string;
  status?: string;
  createdAt?: string;
  thumbnail?: string;
};

export type PortalProject = {
  id: string;
  projectId: string;
  name: string;
  status?: string;
  summary?: string;
};

export type PortalProjectsForClient = {
  active: PortalProject[];
  archived: PortalProject[];
};

export type PortalPage = {
  id: string;
  userId: string;
  title: string;
  content: string;
};

export type FeedbackRole = "Client" | "Studio";

// Make sure these match the Select options in your Notion Feedback DB
export type FeedbackStatus = "Comment" | "Needs Changes" | "Approved";
// ^ note: "Needs Changes" capitalisation should match your Notion select exactly

export type PortalFeedbackMessage = {
  id: string;
  author: string;
  role: FeedbackRole;
  message: string;
  createdAt: string;
  timecodeSec?: number;
  status?: FeedbackStatus;
};

export type ProjectPage = {
  id: string;
  title: string;
  projectId: string;
};

export type PostPage = {
  id: string;
  title: string;
  postId: string;
};

export type PortalPostDetail = PostPage & {
  status?: string;
  createdAt?: string;
  media: PortalMediaItem[];
  notes: string[];
};

// --- Portal page helpers ---
// Add this function to src/lib/notion.ts

// Add this function to src/lib/notion.ts

/**
 * Get all posts awaiting client review for a given client
 * These are posts with Status = "Client Review"
 */
export async function getPostsAwaitingReview(
  userId: string
): Promise<PortalRecentPost[]> {
  const notion = getNotionClient();
  const projectsDbId = getProjectsDbId();
  const postsDbId = getPostsDbId();
  // 1. Resolve the Portal Page for this client
  const portalPage = await getPortalPageByClientId(userId);
  if (!portalPage) {
    return [];
  }

  // 2. Find all visible Work Projects linked to this Portal Page
  const projectsRes = await notion.databases.query({
    database_id: projectsDbId,
    filter: {
      and: [
        {
          property: "Portal Page",
          relation: { contains: portalPage.id },
        },
        {
          // Client Visible (formula outputs true/false)
          property: "Client Visible",
          formula: {
            checkbox: {
              equals: true,
            },
          },
        },
        {
          // Hide Project must be unchecked (false)
          property: "Hide Project",
          checkbox: {
            equals: false,
          },
        },
        {
          property: "Category",
          select: { equals: "Work Project" },
        },
      ],
    },
    page_size: 100,
  });

  if (!projectsRes.results.length) {
    return [];
  }

  const projectIds: string[] = [];
  const projectMap = new Map<string, { name: string; projectId: string }>();

  for (const result of projectsRes.results) {
    const page = result as any;
    const nameProp = page.properties["Name"];
    const projectIdProp = page.properties["Project ID"];

    const name = nameProp?.title
      ? richTextToPlainText(nameProp.title)
      : "Untitled project";
    const projectIdSlug = getTextLikeValue(projectIdProp) || page.id;

    projectIds.push(page.id);
    projectMap.set(page.id, {
      name,
      projectId: projectIdSlug,
    });
  }

  if (projectIds.length === 0) {
    return [];
  }

  // 3. Query Posts DB for posts in "Client Review" status
  // Note: Using "status" type instead of "select" - Notion has a dedicated Status property type
  const postsRes = await notion.databases.query({
    database_id: postsDbId,
    filter: {
      and: [
        {
          // Project relation is any of this client's visible projects
          or: projectIds.map((id) => ({
            property: "Project",
            relation: { contains: id },
          })),
        },
        {
          // Status must be "Client Review" - using status property type
          property: "Status",
          status: { equals: "Client Review" },
        },
        {
          // Exclude purely internal posts
          property: "Category",
          select: { does_not_equal: "Internal Post" },
        },
      ],
    },
    sorts: [
      {
        property: "Created",
        direction: "descending",
      },
    ],
    page_size: 50, // Get up to 50 posts needing review
  });

  if (!postsRes.results.length) {
    return [];
  }

  const reviewPosts: PortalRecentPost[] = [];

  for (const result of postsRes.results) {
    const page = result as any;
    const titleProp = page.properties["Name"];
    const postIdProp = page.properties["Post ID"];
    const projectRelProp = page.properties["Project"];

    const title = titleProp?.title
      ? richTextToPlainText(titleProp.title)
      : "Untitled post";
    const postIdSlug = getTextLikeValue(postIdProp) || page.id;

    const projectRelId: string | undefined = projectRelProp?.relation?.[0]?.id;

    const projectMeta = projectRelId ? projectMap.get(projectRelId) : undefined;

    reviewPosts.push({
      id: page.id,
      postId: postIdSlug,
      title,
      projectName: projectMeta?.name ?? "Unknown project",
      projectId: projectMeta?.projectId ?? "",
    });
  }

  return reviewPosts;
}

export async function getPortalPageByClientId(
  userId: string
): Promise<PortalPage | null> {
  if (!userId) {
    throw new Error("userId is required");
  }

  const notion = getNotionClient();
  const portalDbId = getPortalDbId();

  const response = await notion.databases.query({
    database_id: portalDbId,
    filter: {
      property: "User ID",
      rich_text: {
        equals: userId,
      },
    },
    page_size: 1,
  });

  if (!response.results.length) return null;

  const page = response.results[0] as any;

  const titleProp = page.properties["Name"];
  const clientIdProp = page.properties["User ID"];
  const contentProp = page.properties["Content"];

  const title = titleProp?.title ? richTextToPlainText(titleProp.title) : "";
  const clientIdValue = clientIdProp?.rich_text
    ? richTextToPlainText(clientIdProp.rich_text)
    : "";
  const content = contentProp?.rich_text
    ? richTextToPlainText(contentProp.rich_text)
    : "";

  return {
    id: page.id,
    userId: clientIdValue,
    title,
    content,
  };
}

// --- Project helpers ---

/**
 * Find the Project page for a given client + project slug,
 * and ensure it’s linked to that client’s Portal Page.
 */
export async function getProjectPageForClientProject(options: {
  userId: string;
  projectId: string; // slug used in URL
}): Promise<ProjectPage | null> {
  const { userId, projectId } = options;
  const notion = getNotionClient();
  const projectsDbId = getProjectsDbId();

  // First resolve the portal page for security
  const portalPage = await getPortalPageByClientId(userId);
  if (!portalPage) return null;

  // Find the project with Project ID = projectId
  const projectsRes = await notion.databases.query({
    database_id: projectsDbId,
    filter: {
      property: "Project ID",
      url: {
        equals: projectId,
      },
    },
    page_size: 1,
  });

  if (!projectsRes.results.length) return null;

  const projectPage = projectsRes.results[0] as any;

  // Optional security: ensure project is linked back to this Portal Page
  const portalRelation = projectPage.properties["Portal Page"];
  if (portalRelation && Array.isArray(portalRelation.relation)) {
    const linkedPortalIds = portalRelation.relation.map((r: any) => r.id);
    if (!linkedPortalIds.includes(portalPage.id)) {
      // Project exists but is not linked to this client's portal → treat as not found
      return null;
    }
  }

  const titleProp = projectPage.properties["Name"];
  const projectIdProp = projectPage.properties["Project ID"];

  return {
    id: projectPage.id,
    title: titleProp?.title ? richTextToPlainText(titleProp.title) : "",
    projectId: getTextLikeValue(projectIdProp),
  };
}

// --- Post helpers ---

/**
 * Lookup a Post by its slug within a given Project + Client.
 * This is what your feedback route is using.
 */
export async function getPostBySlugForProject(options: {
  userId: string;
  projectId: string;
  postSlug: string;
}): Promise<PostPage | null> {
  const { userId, projectId, postSlug } = options;
  const notion = getNotionClient();
  const postsDbId = getPostsDbId();

  // 1. Resolve the project page for this client + project
  const projectPage = await getProjectPageForClientProject({ userId, projectId });
  if (!projectPage) return null;

  // 2. Query Posts DB where:
  //    - Post ID = postSlug
  //    - Project relation contains this project page
  const postsRes = await notion.databases.query({
    database_id: postsDbId,
    filter: {
      and: [
        {
          property: "Post ID",
          url: { equals: postSlug },
        },
        {
          property: "Project",
          relation: { contains: projectPage.id },
        },
      ],
    },
    page_size: 1,
  });

  if (!postsRes.results.length) return null;

  const postPage = postsRes.results[0] as any;

  const titleProp = postPage.properties["Name"];
  const postIdProp = postPage.properties["Post ID"];

  return {
    id: postPage.id,
    title: titleProp?.title ? richTextToPlainText(titleProp.title) : "",
    postId: getTextLikeValue(postIdProp),
  };
}

// --- Projects list for portal home ---

export async function getProjectsForPortal(
  userId: string
): Promise<PortalProjectsForClient> {
  const notion = getNotionClient();
  const projectsDbId = getProjectsDbId();
  // 1. Find this client's Portal Page
  const portalPage = await getPortalPageByClientId(userId);
  if (!portalPage) {
    return { active: [], archived: [] };
  }

  // 2. Query Projects DB for projects linked to this Portal Page
  const res = await notion.databases.query({
    database_id: projectsDbId,
    filter: {
      property: "Portal Page",
      relation: {
        contains: portalPage.id,
      },
    },
  });

  const active: PortalProject[] = [];
  const archived: PortalProject[] = [];

  for (const result of res.results) {
    const page = result as any;
    const nameProp = page.properties["Name"];
    const projectIdProp = page.properties["Project ID"];
    const statusProp = page.properties["Status"];
    const summaryProp = page.properties["Summary"];

    const project: PortalProject = {
      id: page.id,
      name: nameProp?.title ? richTextToPlainText(nameProp.title) : "Untitled",
      projectId: getTextLikeValue(projectIdProp) || page.id,
      status: statusProp?.select?.name,
      summary: summaryProp?.rich_text
        ? richTextToPlainText(summaryProp.rich_text)
        : undefined,
    };

    const isArchived = project.status === "Archived"; // adjust if your statuses differ
    if (isArchived) {
      archived.push(project);
    } else {
      active.push(project);
    }
  }

  return { active, archived };
}

// --- Recent / latest visible posts for portal home ---

export async function getRecentVisiblePostsForPortal(
  userId: string,
  limit = 5
): Promise<PortalRecentPost[]> {
  const notion = getNotionClient();
  const projectsDbId = getProjectsDbId();
  const postsDbId = getPostsDbId();
  // 1. Resolve the Portal Page for this client
  const portalPage = await getPortalPageByClientId(userId);
  if (!portalPage) {
    return [];
  }

  // 2. Find all visible Work Projects linked to this Portal Page
  const projectsRes = await notion.databases.query({
    database_id: projectsDbId,
    filter: {
      and: [
        {
          property: "Portal Page",
          relation: { contains: portalPage.id },
        },
        {
          // Client Visible (formula outputs true/false)
          property: "Client Visible",
          formula: {
            checkbox: {
              equals: true,
            },
          },
        },
        {
          // Hide Project must be unchecked (false)
          property: "Hide Project",
          checkbox: {
            equals: false,
          },
        },
        {
          property: "Category",
          select: { equals: "Work Project" },
        },
      ],
    },
    page_size: 100,
  });


  if (!projectsRes.results.length) {
    return [];
  }

  const projectIds: string[] = [];
  const projectMap = new Map<string, { name: string; projectId: string }>();

  for (const result of projectsRes.results) {
    const page = result as any;
    const nameProp = page.properties["Name"];
    const projectIdProp = page.properties["Project ID"];

    const name = nameProp?.title
      ? richTextToPlainText(nameProp.title)
      : "Untitled project";
    const projectIdSlug = getTextLikeValue(projectIdProp) || page.id;

    projectIds.push(page.id);
    projectMap.set(page.id, {
      name,
      projectId: projectIdSlug,
    });
  }

  if (projectIds.length === 0) {
    return [];
  }

  // 3. Query Posts DB for posts in those projects, visible to clients
  const postsRes = await notion.databases.query({
    database_id: postsDbId,
    filter: {
      and: [
        {
          // Project relation is any of this client's visible projects
          or: projectIds.map((id) => ({
            property: "Project",
            relation: { contains: id },
          })),
        },
        {
          // Exclude purely internal posts
          property: "Category",
          select: { does_not_equal: "Internal Post" },
        },
      ],
    },
    sorts: [
      {
        property: "Created",
        direction: "descending",
      },
    ],
    page_size: limit,
  });

  if (!postsRes.results.length) {
    return [];
  }

  const recent: PortalRecentPost[] = [];

  for (const result of postsRes.results) {
    const page = result as any;
    const titleProp = page.properties["Name"];
    const postIdProp = page.properties["Post ID"];
    const projectRelProp = page.properties["Project"];

    const title = titleProp?.title
      ? richTextToPlainText(titleProp.title)
      : "Untitled post";
    const postIdSlug = getTextLikeValue(postIdProp) || page.id;

    const projectRelId: string | undefined = projectRelProp?.relation?.[0]?.id;

    const projectMeta = projectRelId ? projectMap.get(projectRelId) : undefined;

    recent.push({
      id: page.id,
      postId: postIdSlug,
      title,
      projectName: projectMeta?.name ?? "Unknown project",
      projectId: projectMeta?.projectId ?? "",
    });
  }

  return recent;
}

export async function getLatestVisiblePostForPortal(
  userId: string
): Promise<PortalRecentPost | null> {
  const posts = await getRecentVisiblePostsForPortal(userId, 1);
  return posts.length > 0 ? posts[0] : null;
}

export async function getProjectBySlug(userId: string, projectId: string) {
  return getProjectPageForClientProject({ userId, projectId });
}

export async function getPostsForProject(
  userId: string,
  projectId: string
): Promise<PortalPostSummary[]> {
  const notion = getNotionClient();
  const postsDbId = getPostsDbId();
  const project = await getProjectPageForClientProject({ userId, projectId });
  if (!project) return [];

  const res = await notion.databases.query({
    database_id: postsDbId,
    filter: {
      and: [
        {
          property: "Project",
          relation: { contains: project.id },
        },
        {
          property: "Category",
          select: { does_not_equal: "Internal Post" },
        },
      ],
    },
    sorts: [
      {
        property: "Created",
        direction: "descending",
      },
    ],
    page_size: 50,
  });

  return res.results.map((result: any) => {
    const titleProp = result.properties?.["Name"];
    const postIdProp = result.properties?.["Post ID"];
    const statusProp = result.properties?.["Status"];
    const thumbProp =
      result.properties?.["Thumbnail"] ??
      result.properties?.["Preview"] ??
      result.properties?.["Cover"];

    return {
      id: result.id,
      title: titleProp?.title ? richTextToPlainText(titleProp.title) : "Untitled post",
      postId: getTextLikeValue(postIdProp) || result.id,
      status: statusProp?.status?.name ?? statusProp?.select?.name,
      createdAt: result.created_time,
      thumbnail: extractFileUrlFromProp(thumbProp),
    } satisfies PortalPostSummary;
  });
}

export async function getPostBySlug(
  userId: string,
  postId: string
): Promise<PostPage | null> {
  // Without project scoping, fall back to the stricter helper
  return getPostBySlugForProject({ userId, projectId: "", postSlug: postId });
}

export async function getPostWithContentForProject(options: {
  userId: string;
  projectId: string;
  postSlug: string;
}): Promise<PortalPostDetail | null> {
  const { userId, projectId, postSlug } = options;
  const notion = getNotionClient();
  const postsDbId = getPostsDbId();

  const projectPage = await getProjectPageForClientProject({ userId, projectId });
  if (!projectPage) return null;

  const postsRes = await notion.databases.query({
    database_id: postsDbId,
    filter: {
      and: [
        {
          property: "Post ID",
          url: { equals: postSlug },
        },
        {
          property: "Project",
          relation: { contains: projectPage.id },
        },
        {
          property: "Category",
          select: { does_not_equal: "Internal Post" },
        },
      ],
    },
    page_size: 1,
  });

  if (!postsRes.results.length) return null;

  const postPage = postsRes.results[0] as any;
  const titleProp = postPage.properties["Name"];
  const postIdProp = postPage.properties["Post ID"];
  const statusProp = postPage.properties["Status"];
  const linkProp = postPage.properties["Link"];
  const blocks = await fetchAllBlocks(postPage.id);

  const mediaFromBlocks = extractMediaFromBlocks(blocks);

  // Fallback to a Link property if no media blocks exist
  if (!mediaFromBlocks.length && linkProp?.url) {
    mediaFromBlocks.push({ type: "embed", url: linkProp.url });
  }

  return {
    id: postPage.id,
    title: titleProp?.title ? richTextToPlainText(titleProp.title) : "",
    postId: getTextLikeValue(postIdProp),
    status: statusProp?.status?.name ?? statusProp?.select?.name,
    createdAt: postPage.created_time,
    media: mediaFromBlocks,
    notes: extractNotesFromBlocks(blocks),
  };
}

// --- Feedback helpers ---

export async function createFeedbackForPost(options: {
  postPageId: string; // Notion page id of the Post (not slug)
  portalPageId: string; // Notion page id of the Portal Page
  authorEmail: string;
  authorName?: string | null;
  role: FeedbackRole;
  message: string;
  timecodeSec?: number;
  status?: FeedbackStatus;
}): Promise<CreatePageResponse> {
  const notion = getNotionClient();
  const feedbackDbId = getFeedbackDbId();
  const {
    postPageId,
    portalPageId,
    authorEmail,
    authorName,
    role,
    message,
    timecodeSec,
    status,
  } = options;

  const title = `Feedback – ${authorName || authorEmail}`;

  const created = await notion.pages.create({
    parent: { database_id: feedbackDbId },
    properties: {
      Name: {
        title: [{ text: { content: title } }],
      },
      Post: {
        relation: [{ id: postPageId }],
      },
      // Note: your DB calls this "Portal Pages" (plural)
      "Portal Pages": {
        relation: [{ id: portalPageId }],
      },
      "Author Email": {
        email: authorEmail,
      },
      Role: {
        select: { name: role },
      },
      ...(status
        ? {
            Status: { select: { name: status } },
          }
        : {}),
      Message: {
        rich_text: [{ text: { content: message } }],
      },
      // Your schema: "Timecode" (Number)
      ...(timecodeSec !== undefined
        ? {
            Timecode: { number: timecodeSec },
          }
        : {}),
    },
  });

  return created;
}

export async function getFeedbackForPost(
  postPageId: string
): Promise<PortalFeedbackMessage[]> {
  const notion = getNotionClient();
  const feedbackDbId = getFeedbackDbId();
  const res = await notion.databases.query({
    database_id: feedbackDbId,
    filter: {
      property: "Post",
      relation: { contains: postPageId },
    },
    sorts: [
      {
        timestamp: "created_time",
        direction: "ascending",
      },
    ],
  });

  return res.results.map((page: any) => {
    const messageProp = page.properties?.["Message"];
    const roleProp = page.properties?.["Role"];
    const statusProp = page.properties?.["Status"];
    const authorNameProp = page.properties?.["Author Name"];
    const timecodeProp = page.properties?.["Timecode"];

    return {
      id: page.id,
      author:
        authorNameProp?.created_by?.name ||
        page.properties?.["Author Email"]?.email ||
        "Guest",
      role: (roleProp?.select?.name as FeedbackRole) ?? "Client",
      message: messageProp?.rich_text
        ? richTextToPlainText(messageProp.rich_text)
        : "",
      createdAt: page.created_time,
      timecodeSec: timecodeProp?.number ?? undefined,
      status: statusProp?.select?.name as FeedbackStatus | undefined,
    };
  });
}
