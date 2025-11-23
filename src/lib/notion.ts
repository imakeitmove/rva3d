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
