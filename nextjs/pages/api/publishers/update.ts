import { addPublishers } from "@/common/addPublishers";
import { NextApiRequest, NextApiResponse } from "next";
import business from '@/db/seedData/business.json';
import technology from '@/db/seedData/tech.json';
import science from '@/db/seedData/science.json';
import health from '@/db/seedData/health.json';
import sports from '@/db/seedData/sports.json';
import entertainment from '@/db/seedData/entertainment.json';
import general from '@/db/seedData/general.json';
import politics from '@/db/seedData/politics.json';
import artCulture from '@/db/seedData/art_culture.json';
import realEstate from '@/db/seedData/real_estate.json';
import environment from '@/db/seedData/environment.json';
import finance from '@/db/seedData/finance.json';
import gaming from '@/db/seedData/gaming.json';
// import lifestyle from '@/db/seedData/lifestyle.json';
import usNews from '@/db/seedData/us_news.json';
import worldNews from '@/db/seedData/world_news.json';
import vc from '@/db/seedData/vc.json';


export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "POST") {
    const { category } = req.body;
    let publishers = []

    if (!category) {
      return res.status(400).json({ error: "Missing required parameters" });
    }

    if (category === "all") {
      publishers = [
        { data: business, category: "business" },
        { data: technology, category: "tech" },
        { data: science, category: "science" },
        { data: health, category: "health" },
        { data: sports, category: "sports" },
        { data: entertainment, category: "entertainment" },
        { data: general, category: "general" },
        { data: politics, category: "politics" },
        { data: artCulture, category: "art_culture" },
        { data: realEstate, category: "real_estate" },
        { data: environment, category: "environment" },
        { data: finance, category: "finance" },
        { data: gaming, category: "gaming" },
        // {data:lifestyle, category: "lifestyle"},
        { data: usNews, category: "us_news" },
        { data: worldNews, category: "world_news" },
        { data: vc, category: "vc" },
      ]
      // ...technology,
      // ...science,
      // ...health,
      // ...sports,
      // ...entertainment,
      // ...general,
      // ...politics,
      // ...artCulture,
      // ...realEstate,
      // ...environment,
      // ...finance,
      // ...gaming,
      // // ...lifestyle,
      // ...usNews,
      // ...worldNews,
      // ...vc,
      let totalCount = 0
      await Promise.all(publishers.map(async (publisher) => {
        try {
          const publishersAdded = await addPublishers(publisher.data, publisher.category)
          totalCount += publishersAdded.count
        } catch (error) {
          console.error("Error adding publishers:", error);
        }
      }))
      return res.status(201).json({ message: "Publishers added", publishersAdded: { count: totalCount } });
    }

    try {
      switch (category) {
        case "business":
          publishers = business
          break;
        case "tech":
          publishers = technology
          break;
        case "science":
          publishers = science
          break;
        case "health":
          publishers = health
          break;
        case "sports":
          publishers = sports
          break;
        case "entertainment":
          publishers = entertainment
          break;
        case "general":
          publishers = general
          break;
        case "politics":
          publishers = politics
          break;
        case "art_culture":
          publishers = artCulture
          break;
        case "real_estate":
          publishers = realEstate
          break;
        case "environment":
          publishers = environment
          break;
        case "finance":
          publishers = finance
          break;
        case "gaming":
          publishers = gaming
          break;
        // case "lifestyle":
        //   publishers = lifestyle
        //   break;
        case "us_news":
          publishers = usNews
          break;
        case "world_news":
          publishers = worldNews
          break;
        case "vc":
          publishers = vc
          break;

        default:
          console.log("No category specified")
          publishers = []
          break;
      }

      const publishersAdded = await addPublishers(publishers, category)
      res.status(201).json({ message: "Publishers added", publishersAdded });
    } catch (error) {
      console.error("Error adding publishers:", error);
      res.status(500).json({ error: "Error adding publishers" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
};