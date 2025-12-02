import { Client } from "@notionhq/client";

// --- Notion client setup ---

if (!process.env.NOTION_TOKEN) {
  throw new Error("NOTION_TOKEN is not set in environment");
}

export const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

const PORTAL_DB_ID = process.env.NOTION_PORTAL_DB_ID as string;
if (!PORTAL_DB_ID) {
  throw new Error("NOTION_PORTAL_DB_ID is not set in environment");
}

const FEEDBACK_DB_ID = process.env.NOTION_FEEDBACK_DB_ID as string;
if (!FEEDBACK_DB_ID) {
  throw new Error("NOTION_FEEDBACK_DB_ID is not set in environment");
}

const PROJECTS_DB_ID = process.env.NOTION_PROJECTS_DB_ID as string;
const POSTS_DB_ID = process.env.NOTION_POSTS_DB_ID as string;

if (!PROJECTS_DB_ID) {
  throw new Error("NOTION_PROJECTS_DB_ID is not set in environment");
}
if (!POSTS_DB_ID) {
  throw new Error("NOTION_POSTS_DB_ID is not set in environment");
}

// --- Helpers ---

function richTextToPlainText(richText: any[] | undefined): string {
  if (!Array.isArray(richText)) return "";
  return richText.map((r) => r.plain_text ?? "").join("");
}

// --- Types ---

export type PortalRecentPost = {
  id: string;      // Notion page id of the Post
  postId: string;  // slug-like Post ID (falls back to Notion id)
  title: string;
  projectName: string; // from Projects.Name
  projectId: string;   // from Projects.Project ID (slug)
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
  portalUserId: string; // matches Notion "User ID" property
  title: string;
  content: string;
};

export type FeedbackRole = "Client" | "Studio";

// Make sure these match the Select options in your Notion Feedback DB
export type FeedbackStatus = "Comment" | "Needs Changes" | "Approved";

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

// --- Portal page helpers ---

/**
 * Get all posts awaiting client review for a given portal user.
 * These are posts with Status = "Client Review".
 */
export async function getPostsAwaitingReview(
  portalUserId: string
): Promise<PortalRecentPost[]> {
  // 1. Resolve the Portal Page for this portal user
  const portalPage = await getPortalPageByPortalUserId(portalUserId);
  if (!portalPage) {
    return [];
  }

  // 2. Find all visible Work Projects linked to this Portal Page
  const projectsRes = await notion.databases.query({
    database_id: PROJECTS_DB_ID,
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
    const projectIdSlug = projectIdProp?.rich_text
      ? richTextToPlainText(projectIdProp.rich_text)
      : page.id;

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
  const postsRes = await notion.databases.query({
    database_id: POSTS_DB_ID,
    filter: {
      and: [
        {
          // Project relation is any of this portal user's visible projects
          or: projectIds.map((id) => ({
            property: "Project",
            relation: { contains: id },
          })),
        },
        {
          // Status must be "Client Review" (status property type)
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
    page_size: 50,
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
    const postIdSlug = postIdProp?.rich_text
      ? richTextToPlainText(postIdProp.rich_text)
      : page.id;

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

/**
 * Look up a Portal Page in the Portal Users DB by its "User ID" property.
 */
export async function getPortalPageByPortalUserId(
  portalUserId: string
): Promise<PortalPage | null> {
  if (!portalUserId) {
    throw new Error("portalUserId is required");
  }

  const response = await notion.databases.query({
    database_id: PORTAL_DB_ID,
    filter: {
      property: "User ID", // Notion property name
      rich_text: {
        equals: portalUserId,
      },
    },
    page_size: 1,
  });

  if (!response.results.length) return null;

  const page = response.results[0] as any;

  const titleProp = page.properties["Name"];
  const portalUserIdProp = page.properties["User ID"];
  const contentProp = page.properties["Content"];

  const title = titleProp?.title ? richTextToPlainText(titleProp.title) : "";
  const portalUserIdValue = portalUserIdProp?.rich_text
    ? richTextToPlainText(portalUserIdProp.rich_text)
    : "";
  const content = contentProp?.rich_text
    ? richTextToPlainText(contentProp.rich_text)
    : "";

  return {
    id: page.id,
    portalUserId: portalUserIdValue,
    title,
    content,
  };
}

// --- Project helpers ---

/**
 * Find the Project page for a given portalUserId + project slug,
 * and ensure it’s linked to that portal user's Portal Page.
 */
export async function getProjectPageForClientProject(options: {
  portalUserId: string;
  projectId: string; // slug used in URL
}): Promise<ProjectPage | null> {
  const { portalUserId, projectId } = options;

  // First resolve the portal page for security
  const portalPage = await getPortalPageByPortalUserId(portalUserId);
  if (!portalPage) return null;

  // Find the project with Project ID = projectId
  const projectsRes = await notion.databases.query({
    database_id: PROJECTS_DB_ID,
    filter: {
      property: "Project ID",
      rich_text: {
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
      // Project exists but is not linked to this portal user → treat as not found
      return null;
    }
  }

  const titleProp = projectPage.properties["Name"];
  const projectIdProp = projectPage.properties["Project ID"];

  return {
    id: projectPage.id,
    title: titleProp?.title ? richTextToPlainText(titleProp.title) : "",
    projectId: projectIdProp?.rich_text
      ? richTextToPlainText(projectIdProp.rich_text)
      : "",
  };
}

// --- Post helpers ---

/**
 * Lookup a Post by its slug within a given Project + portal user.
 * This is what your feedback route is using.
 */
export async function getPostBySlugForProject(options: {
  portalUserId: string;
  projectId: string;
  postSlug: string;
}): Promise<PostPage | null> {
  const { portalUserId, projectId, postSlug } = options;

  // 1. Resolve the project page for this portal user + project
  const projectPage = await getProjectPageForClientProject({
    portalUserId,
    projectId,
  });
  if (!projectPage) return null;

  // 2. Query Posts DB where:
  //    - Post ID = postSlug
  //    - Project relation contains this project page
  const postsRes = await notion.databases.query({
    database_id: POSTS_DB_ID,
    filter: {
      and: [
        {
          property: "Post ID",
          rich_text: { equals: postSlug },
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
    postId: postIdProp?.rich_text
      ? richTextToPlainText(postIdProp.rich_text)
      : "",
  };
}

// --- Projects list for portal home ---

export async function getProjectsForPortal(
  portalUserId: string
): Promise<PortalProjectsForClient> {
  // 1. Find this portal user's Portal Page
  const portalPage = await getPortalPageByPortalUserId(portalUserId);
  if (!portalPage) {
    return { active: [], archived: [] };
  }

  // 2. Query Projects DB for projects linked to this Portal Page
  const res = await notion.databases.query({
    database_id: PROJECTS_DB_ID,
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
      name: nameProp?.title
        ? richTextToPlainText(nameProp.title)
        : "Untitled",
      projectId: projectIdProp?.rich_text
        ? richTextToPlainText(projectIdProp.rich_text)
        : page.id,
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
  portalUserId: string,
  limit = 5
): Promise<PortalRecentPost[]> {
  // 1. Resolve the Portal Page for this portal user
  const portalPage = await getPortalPageByPortalUserId(portalUserId);
  if (!portalPage) {
    return [];
  }

  // 2. Find all visible Work Projects linked to this Portal Page
  const projectsRes = await notion.databases.query({
    database_id: PROJECTS_DB_ID,
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
    const projectIdSlug = projectIdProp?.rich_text
      ? richTextToPlainText(projectIdProp.rich_text)
      : page.id;

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
    database_id: POSTS_DB_ID,
    filter: {
      and: [
        {
          // Project relation is any of this portal user's visible projects
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
    const postIdSlug = postIdProp?.rich_text
      ? richTextToPlainText(postIdProp.rich_text)
      : page.id;

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
  portalUserId: string
): Promise<PortalRecentPost | null> {
  const posts = await getRecentVisiblePostsForPortal(portalUserId, 1);
  return posts.length > 0 ? posts[0] : null;
}

// Stubs you can flesh out later
export async function getProjectBySlug(portalUserId: string, projectId: string) {
  // You can just call getProjectPageForClientProject here and map the fields if needed
}

export async function getPostsForProject(
  portalUserId: string,
  projectId: string
) {
  // Posts where Project = that project & Client Visible = true
}

export async function getPostBySlug(portalUserId: string, postId: string) {
  // Alternate version if you want a URL like /posts/[postId] without project in the path
}

// --- Feedback helpers ---

export async function createFeedbackForPost(options: {
  postPageId: string;   // Notion page id of the Post (not slug)
  portalPageId: string; // Notion page id of the Portal Page
  authorEmail: string;
  authorName?: string | null;
  role: FeedbackRole;
  message: string;
  timecodeSec?: number;
  status?: FeedbackStatus;
}) {
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

  await notion.pages.create({
    parent: { database_id: FEEDBACK_DB_ID },
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
      ...(authorName
        ? {
            "Author Name": {
              rich_text: [{ text: { content: authorName } }],
            },
          }
        : {}),
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
      ...(timecodeSec !== undefined
        ? {
            Timecode: { number: timecodeSec },
          }
        : {}),
      Source: {
        select: { name: "Portal" },
      },
    },
  });
}
