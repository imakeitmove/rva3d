// lib/notion/portfolio.ts
import { Client } from '@notionhq/client';
import type {
  BlockObjectResponse,
  GetPageResponse,
  ListBlockChildrenResponse,
  PageObjectResponse,
  PartialBlockObjectResponse,
  QueryDatabaseResponse,
} from '@notionhq/client/build/src/api-endpoints';
import type { NotionPortfolioItem } from '@/types/portfolio';

// Initialize Notion client
const notion = new Client({
  auth: process.env.NOTION_PORTFOLIO_TOKEN,
});

const PORTFOLIO_DATABASE_ID = process.env.NOTION_PORTFOLIO_DB || '';

type QueryResult = QueryDatabaseResponse['results'][number];

function hasPageProperties(
  page: QueryResult | GetPageResponse,
): page is PageObjectResponse {
  return page.object === 'page' && 'properties' in page;
}

function isBlockObject(
  block: ListBlockChildrenResponse['results'][number],
): block is BlockObjectResponse | PartialBlockObjectResponse {
  return block.object === 'block';
}

// Debug logging (remove after fixing)
if (typeof window === 'undefined') { // Only log on server
  console.log('🔍 Notion Config Check:');
  console.log('  Token exists:', !!process.env.NOTION_PORTFOLIO_TOKEN);
  console.log('  Token preview:', process.env.NOTION_PORTFOLIO_TOKEN?.substring(0, 15) + '...');
  console.log('  Database ID:', PORTFOLIO_DATABASE_ID);
  console.log('  Database ID length:', PORTFOLIO_DATABASE_ID?.length || 0);
  
  if (!PORTFOLIO_DATABASE_ID) {
    console.error('❌ NOTION_PORTFOLIO_DB is not set in environment variables!');
  }
  if (!process.env.NOTION_PORTFOLIO_TOKEN) {
    console.error('❌ NOTION_PORTFOLIO_TOKEN is not set in environment variables!');
  }
}

interface FilePropertyValue {
  files: Array<{ file?: { url: string }; external?: { url: string } }>;
}

interface NotionPageProperties extends Record<string, unknown> {
  title?: { title: Array<{ plain_text: string }> };
  Name?: { title: Array<{ plain_text: string }> };
  name?: { title: Array<{ plain_text: string }> };
  Slug?: { rich_text: Array<{ plain_text: string }> };
  slug?: { rich_text: Array<{ plain_text: string }> };
  category?: { select: { name: string } | null };
  Category?: { select: { name: string } | null };
  tags?: { multi_select: Array<{ name: string }> };
  Tags?: { multi_select: Array<{ name: string }> };
  published_at?: { date: { start: string } | null };
  'Published At'?: { date: { start: string } | null };
  PublishedAt?: { date: { start: string } | null };
  excerpt?: { rich_text: Array<{ plain_text: string }> };
  Excerpt?: { rich_text: Array<{ plain_text: string }> };
  cover_image?: { url: string } | null;
  thumbnail?: FilePropertyValue;
  Thumbnail?: FilePropertyValue;
}

/**
 * Fetch all portfolio items from Notion
 */
export async function getPortfolioItems(): Promise<NotionPortfolioItem[]> {
  // Validation
  if (!PORTFOLIO_DATABASE_ID) {
    console.error('❌ Cannot fetch portfolio: NOTION_PORTFOLIO_DB not configured');
    return [];
  }
  
  if (!process.env.NOTION_PORTFOLIO_TOKEN) {
    console.error('❌ Cannot fetch portfolio: NOTION_PORTFOLIO_TOKEN not configured');
    return [];
  }

  try {
    console.log('📡 Fetching portfolio from Notion...');
    
    const response = await notion.databases.query({
      database_id: PORTFOLIO_DATABASE_ID,
      filter: {
        property: 'Status',
        status: {
          equals: 'Featured',
        },
      },
      sorts: [
        {
          property: 'Published At',
          direction: 'descending',
        },
      ],
    });

    console.log(`✅ Fetched ${response.results.length} featured portfolio items`);
    
    const pages = response.results.filter(hasPageProperties);

    // Debug: Log the first item's properties to see the structure
    if (pages.length > 0) {
      console.log('🔍 First item properties:', Object.keys(pages[0].properties || {}));
    }

    const items = pages.map(page => transformNotionPageToPortfolioItem(page));
    
    console.log(`✅ Transformed ${items.length} portfolio items`);
    if (items.length > 0) {
      console.log('📄 First item:', { 
        id: items[0].id, 
        title: items[0].title,
        slug: items[0].slug 
      });
    }
    
    return items;
  } catch (error) {
    console.error('❌ Error fetching portfolio from Notion:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
    }
    return [];
  }
}

/**
 * Fetch a single portfolio item by ID
 */
export async function getPortfolioItem(pageId: string): Promise<NotionPortfolioItem | null> {
  try {
    const page = await notion.pages.retrieve({ page_id: pageId });
    if (!hasPageProperties(page)) {
      console.error('Retrieved page is missing properties');
      return null;
    }

    return transformNotionPageToPortfolioItem(page);
  } catch (error) {
    console.error('Error fetching portfolio item from Notion:', error);
    return null;
  }
}

/**
 * Fetch a portfolio item by slug
 */
export async function getPortfolioItemBySlug(slug: string): Promise<NotionPortfolioItem | null> {
  try {
    const response = await notion.databases.query({
      database_id: PORTFOLIO_DATABASE_ID,
      filter: {
        property: 'Slug',
        rich_text: {
          equals: slug,
        },
      },
    });

    if (response.results.length === 0) {
      return null;
    }

    const page = response.results.find(hasPageProperties);
    if (!page) {
      return null;
    }

    return transformNotionPageToPortfolioItem(page);
  } catch (error) {
    console.error('Error fetching portfolio item by slug:', error);
    return null;
  }
}

/**
 * Fetch page content blocks for a portfolio item
 */
export async function getPortfolioItemContent(pageId: string): Promise<Array<BlockObjectResponse | PartialBlockObjectResponse>> {
  try {
    const blocks = await notion.blocks.children.list({
      block_id: pageId,
    });

    return blocks.results.filter(isBlockObject);
  } catch (error) {
    console.error('Error fetching portfolio item content:', error);
    return [];
  }
}

/**
 * Transform a Notion page to our portfolio item format
 */
function transformNotionPageToPortfolioItem(page: PageObjectResponse): NotionPortfolioItem {
  const properties = page.properties as NotionPageProperties;
  
  console.log('🔄 Transforming page:', page.id);
  console.log('   Properties available:', Object.keys(properties));

  // Extract title - try common property names
  let title = 'Untitled';
  const titleProperty = properties.Name ?? properties.name ?? properties.title;

  if (titleProperty?.title?.[0]) {
    title = titleProperty.title[0].plain_text;
  }

  console.log('   Extracted title:', title);

  // Extract or generate slug
  const slugProperty = properties.slug ?? properties.Slug;
  let slug = slugProperty?.rich_text?.[0]?.plain_text || '';
  if (!slug) {
    // Generate slug from title
    slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  
  // Extract category
  const categoryProperty = properties.category ?? properties.Category;
  const category = categoryProperty?.select?.name || undefined;

  // Extract tags
  const tagsProperty = properties.tags ?? properties.Tags;
  const tags = tagsProperty?.multi_select?.map(tag => tag.name) || [];

  // Extract published date
  const publishedProperty =
    properties.published_at ||
    properties['Published At'] ||
    properties.PublishedAt;

  const publishedDate = publishedProperty?.date?.start;
  const publishedAt = publishedDate ? new Date(publishedDate) : new Date();

  // Extract excerpt
  const excerptProperty = properties.excerpt ?? properties.Excerpt;
  const excerpt = excerptProperty?.rich_text?.[0]?.plain_text || undefined;
  
  // Extract cover image
  let coverImage: string | undefined;
  if (page.cover) {
    if (page.cover.type === 'external') {
      coverImage = page.cover.external.url;
    } else if (page.cover.type === 'file') {
      coverImage = page.cover.file.url;
    }
  }
  
  // Extract thumbnail (fallback to cover)
  let thumbnail: string | undefined;
  const thumbnailProp = properties.thumbnail?.files?.[0] ||
                       properties.Thumbnail?.files?.[0];
  if (thumbnailProp) {
    thumbnail = thumbnailProp.file?.url || thumbnailProp.external?.url;
  }
  thumbnail = thumbnail || coverImage;
  
  return {
    id: page.id,
    title,
    slug,
    coverImage,
    thumbnail,
    category,
    tags,
    publishedAt,
    excerpt,
  };
}

/**
 * Get portfolio statistics
 */
export async function getPortfolioStats() {
  try {
    const items = await getPortfolioItems();
    
    const categories = new Map<string, number>();
    const tags = new Map<string, number>();
    
    items.forEach(item => {
      if (item.category) {
        categories.set(item.category, (categories.get(item.category) || 0) + 1);
      }
      
      item.tags?.forEach(tag => {
        tags.set(tag, (tags.get(tag) || 0) + 1);
      });
    });
    
    return {
      totalItems: items.length,
      categories: Object.fromEntries(categories),
      tags: Object.fromEntries(tags),
      latestUpdate: items[0]?.publishedAt || new Date(),
    };
  } catch (error) {
    console.error('Error fetching portfolio stats:', error);
    return {
      totalItems: 0,
      categories: {},
      tags: {},
      latestUpdate: new Date(),
    };
  }
}

/**
 * Search portfolio items
 */
export async function searchPortfolio(query: string): Promise<NotionPortfolioItem[]> {
  try {
    const response = await notion.databases.query({
      database_id: PORTFOLIO_DATABASE_ID,
      filter: {
        or: [
          {
            property: 'Title',
            title: {
              contains: query,
            },
          },
          {
            property: 'Excerpt',
            rich_text: {
              contains: query,
            },
          },
          {
            property: 'Tags',
            multi_select: {
              contains: query,
            },
          },
        ],
      },
    });

    const pages = response.results.filter(hasPageProperties);
    return pages.map(page => transformNotionPageToPortfolioItem(page));
  } catch (error) {
    console.error('Error searching portfolio:', error);
    return [];
  }
}

/**
 * Get items by category
 */
export async function getPortfolioByCategory(category: string): Promise<NotionPortfolioItem[]> {
  try {
    const response = await notion.databases.query({
      database_id: PORTFOLIO_DATABASE_ID,
      filter: {
        property: 'Category',
        select: {
          equals: category,
        },
      },
      sorts: [
        {
          property: 'Published At',
          direction: 'descending',
        },
      ],
    });

    const pages = response.results.filter(hasPageProperties);
    return pages.map(page => transformNotionPageToPortfolioItem(page));
  } catch (error) {
    console.error('Error fetching portfolio by category:', error);
    return [];
  }
}

/**
 * Get items by tag
 */
export async function getPortfolioByTag(tag: string): Promise<NotionPortfolioItem[]> {
  try {
    const response = await notion.databases.query({
      database_id: PORTFOLIO_DATABASE_ID,
      filter: {
        property: 'Tags',
        multi_select: {
          contains: tag,
        },
      },
      sorts: [
        {
          property: 'Published At',
          direction: 'descending',
        },
      ],
    });

    const pages = response.results.filter(hasPageProperties);
    return pages.map(page => transformNotionPageToPortfolioItem(page));
  } catch (error) {
    console.error('Error fetching portfolio by tag:', error);
    return [];
  }
}