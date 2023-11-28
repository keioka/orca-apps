import contentful, { Entry, Asset } from 'contentful-management'

export interface NewsArticleFields {
  title: string; // 'Symbol' type in Contentful is equivalent to a string
  author: ContentfulLink<Entry>; // Assuming 'Entry' is another content type you have defined
  publishedDate: string; // 'Date' type in Contentful is a string in ISO format
  content: RichText; // 'RichText' type requires a specific structure
  images: ContentfulLink<Asset>[]; // Array of links to assets
  references: ContentfulLink<Entry>[]; // Array of links to other entries
}

// Additional types for supporting structures
interface ContentfulLink<T> {
  sys: {
    id: string;
    linkType: string;
    type: string;
  };
  fields?: T;
}

interface RichText {
  // Define the structure of RichText based on your needs
  // This can be complex as it involves nodes, marks, etc.
  // For a simple example:
  content: string;
}


export async function createContentfulEntry(
  entryFields: NewsArticleFields
): Promise<Entry> {
  const spaceId = 'hqek9g5wvgtp';
  const accessToken = 'REDACTED_EDENAI_API_KEY';
  const contentTypeId = 'newsArticle';

  const client = contentful.createClient({
    host: "preview.contentful.com",
    accessToken: accessToken,
  });

  try {
    const space = await client.getSpace(spaceId);
    const environment = await space.getEnvironment('master'); // Assuming the 'master' environment
    const entry = await environment.createEntry(contentTypeId, { fields: entryFields });

    return entry;
  } catch (error) {
    console.error(error);
    throw new Error(`Failed to create entry: ${error}`);
  }
}
