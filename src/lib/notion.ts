import { Client } from "@notionhq/client";

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

export type PortalPage = {
  id: string;
  clientId: string;
  title: string;
  content: string;
};

function richTextToPlainText(richText: any[]): string {
  return richText.map((r) => r.plain_text ?? "").join("");
}

export async function getPortalPageByClientId(
  clientId: string
): Promise<PortalPage | null> {
  if (!clientId) {
    throw new Error("clientId is required");
  }

  const response = await notion.databases.query({
    database_id: PORTAL_DB_ID,
    filter: {
      property: "Client ID",
      rich_text: {
        equals: clientId,
      },
    },
    page_size: 1,
  });

  if (!response.results.length) return null;

  const page = response.results[0] as any;

  const titleProp = page.properties["Name"];
  const clientIdProp = page.properties["Client ID"];
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
    clientId: clientIdValue,
    title,
    content,
  };
}

// Pseudocode shapes, you'll plug in actual Notion queries

export async function getProjectsForPortal(clientId: string) {
  // 1. Find the portal page by Client ID
  // 2. Read its `Work Projects` relation
  // 3. For each related project, pull:
  //    - Name
  //    - Project ID
  //    - Status
  //    - Summary
}

export async function getLatestVisiblePostForPortal(clientId: string) {
  // 1. Get projects for portal
  // 2. Query Posts DB for posts whose Project is in that set
  // 3. Filter `Client Visible = true`
  // 4. Sort by Created desc & take first
}

export async function getRecentVisiblePostsForPortal(clientId: string, limit = 5) {
  // Same as above, but take top N
}

export async function getProjectBySlug(clientId: string, projectId: string) {
  // 1. Find project with `Project ID = projectId`
  // 2. Confirm it's linked to this client's Portal Page (security)
  // 3. Return its metadata
}

export async function getPostsForProject(clientId: string, projectId: string) {
  // Posts where Project = that project & Client Visible = true
}

export async function getPostBySlug(clientId: string, postId: string) {
  // 1. Find post with `Post ID = postId`
  // 2. Walk back to Project → Portal Page to confirm the clientId matches
  // 3. Return details: title, summary, Link, Feedback Form URL, etc.
}
