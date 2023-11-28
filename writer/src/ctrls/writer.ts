import { createContentfulEntry, NewsArticleFields } from '../helpers/contentful';

export async function writer() {

  const entryFields: NewsArticleFields = {
    title: "Breaking News: TypeScript and Contentful Integration",
    content: {
      content: "<h1>Introduction</h1><p>This is a sample content for the news article...</p>",
      // Note: RichText would typically have a more complex structure
    },
    images: [
      {
        sys: {
          id: "imageId456",
          linkType: "Asset",
          type: "Link",
        },
        fields: {
          // Assuming 'fields' within the 'image' asset have a structure like this
          file: {
            url: "//images.contentful.com/spaceId/imageId456/landscape.jpg",
            details: { size: 102400, image: { width: 800, height: 600 } },
            fileName: "landscape.jpg",
            contentType: "image/jpeg",
          }
        }
      }
    ],
    references: [
      {
        sys: {
          id: "referenceId789",
          linkType: "Entry",
          type: "Link",
        },
        fields: {
          // Assuming 'fields' within the 'reference' entry have a structure
          title: "Related Article: Advanced TypeScript Patterns",
          // ...other fields that the 'reference' entry might have
        }
      }
    ],
  };

  const id = await createContentfulEntry(entryFields)

  return { status: 'ok', id };

}