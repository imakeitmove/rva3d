// src/lib/notion/portfolio.ts
import { Client } from "@notionhq/client";
import type { NotionPortfolioItem } from "@/types/portfolio";

// ----------------------
// Notion client
// ----------------------

if (!process.env.NOTION_TOKEN) {
  throw new Error("NOTION_TOKEN is not set in environment");
}

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

// NOTE: if your env var has a different name, change this to match.
const PORTFOLIO_DB_ID = process.env.NOTION_PORTFOLIO_DB_ID;

// ----------------------
// Helpers
// ----------------------

type RawNotionPage = {
  id: string;
  properties: Record<string, any>;
  cover?: any;
  created_time?: string;
};

function extractPlainTextFromTitle(prop: any | undefined): string {
  if (!prop) return "";
  if (Array.isArray(prop)) {
    // sometimes people accidentally pass the title array directly
    return prop.map((t: any) => t.plain_text ?? "").join("");
  }

  if (Array.isArray(prop.title)) {
    return prop.title.map((t: any) => t.plain_text ?? "").join("");
  }

  return "";
}

function extractPlainTextFromRichText(prop: any | undefined): string {
  if (!prop || !Array.isArray(prop.rich_text)) return "";
  return prop.rich_text.map((t: any) => t.plain_text ?? "").join("");
}

function extractFileUrl(prop: any | undefined): string | undefined {
  if (!prop || !Array.isArray(prop.files) || prop.files.length === 0) return undefined;
  const file = prop.files[0];
  if (file.external?.url) return file.external.url;
  if (file.file?.url) return file.file.url;
  return undefined;
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// ----------------------
// Mapping Notion -> NotionPortfolioItem
// ----------------------

function mapPageToPortfolioItem(page: RawNotionPage): NotionPortfolioItem {
  const properties = page.properties ?? {};

  // Title: try several common property names (case-insensitive-ish)
  const titleProp =
    (properties["Name"] ??
      properties["Title"] ??
      properties["name"] ??
      properties["title"]) || undefined;

  let title = extractPlainTextFromTitle(titleProp);
  if (!title) title = "Untitled";

  // Slug / ID (for URLs)
  const slugProp =
    properties["Slug"] ??
    properties["slug"] ??
    properties["Post ID"] ??
    properties["Post Id"] ??
    properties["ID"];

  let slug =
    extractPlainTextFromRichText(slugProp) ||
    slugify(title) ||
    page.id.replace(/-/g, "");

  // Excerpt / summary
  const excerptProp =
    properties["Excerpt"] ??
    properties["Summary"] ??
    properties["Description"] ??
    properties["Excerpt / Summary"];

  const excerpt = extractPlainTextFromRichText(excerptProp);

  // Thumbnail image
  const thumbnailProp =
    properties["Thumbnail"] ??
    properties["Thumbnail Image"] ??
    properties["Image"] ??
    properties["Cover"];

  const thumbnail = extractFileUrl(thumbnailProp);

  // Cover image (page cover first, then any fallback property)
  let coverImage: string | undefined;
  if (page.cover) {
    if (page.cover.type === "external") {
      coverImage = page.cover.external?.url;
    } else if (page.cover.type === "file") {
      coverImage = page.cover.file?.url;
    }
  }
  if (!coverImage) {
    coverImage = extractFileUrl(properties["Hero Image"] ?? properties["Cover Image"]);
  }

  // Tags / categories
  const tagsProp =
    properties["Tags"] ??
    properties["Tag"] ??
    properties["Category"] ??
    properties["Categories"];

  let tags: string[] = [];
  if (tagsProp?.multi_select) {
    tags = tagsProp.multi_select.map((t: any) => t.name).filter(Boolean);
  } else if (tagsProp?.select?.name) {
    tags = [tagsProp.select.name];
  }

  // Date
  const dateProp =
    properties["Created"] ??
    properties["Publish Date"] ??
    properties["Date"] ??
    properties["Created At"];

  const publishedAtRaw =
    dateProp?.created_time ?? dateProp?.date?.start ?? dateProp?.date?.end ?? null;
  const publishedAt = publishedAtRaw
    ? new Date(publishedAtRaw)
    : page.created_time
      ? new Date(page.created_time)
      : new Date();

  // You can extend this mapping to include any extra fields
  const item: NotionPortfolioItem = {
    id: page.id,
    title,
    slug,
    thumbnail,
    coverImage,
    excerpt,
    tags,
    publishedAt,
  };

  return item;
}

// ----------------------
// Public API
// ----------------------

export async function getPortfolioItems(): Promise<NotionPortfolioItem[]> {
  if (!PORTFOLIO_DB_ID) {
    console.warn(
      "NOTION_PORTFOLIO_DB_ID is not set in environment. Returning an empty portfolio list."
    );
    return [];
  }

  const pages: RawNotionPage[] = [];
  let cursor: string | undefined;

  do {
    const res: any = await notion.databases.query({
      database_id: PORTFOLIO_DB_ID,
      start_cursor: cursor,
      page_size: 50,
      sorts: [
        {
          property: "Created",
          direction: "descending",
        },
      ],
    });

    pages.push(...(res.results as RawNotionPage[]));
    cursor = res.next_cursor ?? undefined;
  } while (cursor);

  return pages.map(mapPageToPortfolioItem);
}

// Aliases, in case other parts of the app use different names.
export const fetchPortfolioItems = getPortfolioItems;
export const getNotionPortfolioItems = getPortfolioItems;