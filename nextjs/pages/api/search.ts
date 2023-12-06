import { NextApiRequest, NextApiResponse } from 'next';
import { search } from "models/material";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { query, tag } = req.query;

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!query && !tag) {
    return res.status(400).json({ error: 'query or tag is required' });
  }

  let queryToSearch = query as string;

  if (tag) {
    queryToSearch = getQueryByTag(tag as string)
  }

  const materials = await search(queryToSearch)

  return res.status(200).json({ materials });
}

function getQueryByTag(tag: string): string {

  const stock = `'Stock Market' | 'S&P 500' | 'NASDAQ' | 'FTSE 100' | 'Nikkei 225' | 'Hang Seng' | 'Dow Jones' | 'Earnings Report' | 'Stock Exchange'`
  const startup = `'fundraise' | 'raise funds' | raise <-> $ | 'startup' | 'seed investment' | 'seed round' | 'Unicorn' | 'IPO' | 'Series A' | 'Series B' | 'Series C' | 'Series D' | 'venture capital' | 'angel investor'`;
  const japan = `'Japan' | 'Japanese' | 'Tokyo' | 'Kyoto' | 'Osaka' | 'Hiroshima' | 'Nagasaki' | 'Yokohama' | 'Nagoya' | 'Sapporo' | 'Fukuoka' | 'Kobe' | 'Sendai' | 'Nara' | 'Kanazawa' | 'Kumamoto' | 'Kagoshima' | 'Okinawa' | 'Hokkaido' | 'Honshu' | 'Shikoku' | 'Kyushu' | 'Japanese government' | 'Japanese economy' | 'Japanese politics' | 'Japanese society' | 'Japanese culture' | 'Japanese history' | 'Japanese food' | 'Japanese cuisine' | 'Japanese language' | 'Japanese literature' | 'Japanese art' | 'Japanese music' | 'Japanese film' | 'Japanese anime' | 'Japanese manga' | 'Japanese sports'`
  const space = `'SpaceX' | 'Starlink' | 'Starship' | 'Falcon 9' | 'Falcon Heavy' | 'Dragon Capsule' | 'NASA' | 'ISS' | 'International Space Station' | 'Mars' | 'Moon' | 'Asteroid' | 'Satellite' | 'Rocket' | 'Spacecraft' | 'Space Shuttle' | 'Space Station' | 'Space Travel' | 'Space Exploration' | 'Space Tourism' | 'Space Force' | 'Space Junk' | 'Space Debris' | 'Space Weather'  `
  const fintech = `'fintech' | 'financial technology' | 'financial services' | 'financial institution' | 'bank' | 'banking' | 'banker' | 'bank account' | 'bank loan' | 'banking system' | 'banking industry' | 'banking sector' | 'banking service' | 'banking app' | 'banking app' | 'banking platform' | 'banking product' | 'banking technology' | 'banking innovation' | 'banking regulation' | 'banking law' | 'banking policy'`
  const sdgs = `'SDGs' | 'Sustainable Development Goals' | 'Sustainable Development Goal' | 'Sustainable Development' | 'Sustainability' | 'Sustainable' | 'Climate change' | 'COP28'`
  switch (tag) {
    case 'stock':
      return stock
    case 'startup':
      return startup
    case 'japan':
      return japan
    case 'space':
      return space
    case 'fintech':
      return fintech
    case 'sdgs':
      return sdgs
    default:
      return ""
  }
}
