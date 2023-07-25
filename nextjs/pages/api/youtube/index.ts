import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import fetch from 'node-fetch';

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    const { channelIds } = req.query;

    let channelIdsFormatted = []

    if (!channelIds) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    channelIdsFormatted = typeof channelIds === 'string' ? [channelIds] : channelIds

    try {
      // Fetch videos from YouTube API based on channel IDs
      const videos = await fetchVideosByChannelIds(channelIdsFormatted);

      // Store videos in the database as materials
      const materials = await Promise.all(
        videos.map((video) =>
          prisma.material.upsert({
            where: {
              url: video.url,
            },
            create: {
              name: video.title,
              type: 'video',
              category: video.category,
              url: video.url,
              imageUrl: video.imageUrl,
              publishedAt: video.publishedAt,
              publisher: {
                connectOrCreate: {
                  where: {
                    externalId: video.channelId,
                  },
                  create: {
                    name: video.channelName,
                    url: `https://www.youtube.com/channel/${video.channelId}`,
                    type: 'youtube',
                    externalId: video.channelId,
                  }
                }
              }
            },
            update: {
              name: video.title,
              type: 'video',
              category: video.category,
              url: video.url,
              imageUrl: video.imageUrl,
              publishedAt: video.publishedAt,
              publisher: {
                connectOrCreate: {
                  where: {
                    externalId: video.channelId,
                  },
                  create: {
                    name: video.channelName,
                    url: `https://www.youtube.com/channel/${video.channelId}`,
                    type: 'youtube',
                    externalId: video.channelId,
                  }
                }
              }
            },
            include: {
              publisher: true,
            },
          })
        )
      );

      res.status(200).json({ success: true, materials });
    } catch (error) {
      console.error('Error fetching or storing videos:', error);
      res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}

async function fetchVideosByChannelIds(channelIds: string[]): Promise<Video[]> {
  const apiKey = 'REDACTED_YOUTUBE_API_KEY';

  const url = `https://www.googleapis.com/youtube/v3/search?key=${apiKey}&videoCaption=closedCaption&order=date&part=snippet&type=video&videoEmbeddable=true&eventType=completed&channelId=${channelIds.join(
    ','
  )}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (response.ok) {
      const videos = data.items
        // .filter((item: any) => item.snippet.embeddable) // Filter out videos not allowed to be embedded
        .map((item: any) => {
          console.log({ item })
          console.log(item.snippet.thumbnails)

          // const tags = item.snippet.tags[0]
          // const category = item.snippet.categoryId || tags.length ? tags[0] : "other"

          return {
            //https://developers.google.com/youtube/v3/docs/videos?hl=ja#resource
            title: item.snippet.title,
            category: "other",
            channelName: item.snippet.channelTitle,
            channelId: item.snippet.channelId,
            imageUrl: item.snippet.thumbnails.high.url,
            // description: item.snippet.description,
            // tags: item.snippet.tags,
            url: `https://www.youtube.com/embed/${item.id.videoId}`,
            publishedAt: item.snippet.publishedAt,
          }
        });

      console.log({
        videos
      })
      return videos;
    } else {
      throw new Error(`Failed to fetch videos: ${data.error?.message}`);
    }

  } catch (error) {
    console.error('Error fetching videos:', error);
    throw error;
  }

}