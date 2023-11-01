import { fetchAndStoreRSS } from '../common/fetchRSS';
import business from '../db/seedData/business.json';
import technology from '../db/seedData/tech.json';
import science from '../db/seedData/science.json';
import health from '../db/seedData/health.json';
import sports from '../db/seedData/sports.json';
import entertainment from '../db/seedData/entertainment.json';
import general from '../db/seedData/general.json';
import politics from '../db/seedData/politics.json';
import artCulture from '../db/seedData/art_culture.json';
import realEstate from '../db/seedData/real_estate.json';
import environment from '../db/seedData/environment.json';
import finance from '../db/seedData/finance.json';
import gaming from '../db/seedData/gaming.json';
// import lifestyle from '../db/seedData/lifestyle.json';
import usNews from '../db/seedData/us_news.json';
import worldNews from '../db/seedData/world_news.json';
import vc from '../db/seedData/vc.json';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function addInitialPublisherAndMaterials() {
  const SLEEP_TIME = 10000

  await Promise.all(business.map(async (publisher) => {
    const { url, name } = publisher;
    await sleep(SLEEP_TIME)
    return await fetchAndStoreRSS({ url, name, category: "business" })
  }))

  await Promise.all(technology.map(async (publisher) => {
    const { url, name } = publisher;
    await sleep(SLEEP_TIME)
    return await fetchAndStoreRSS({ url, name, category: "tech" })
  }))

  await Promise.all(science.map(async (publisher) => {
    const { url, name } = publisher;
    await sleep(SLEEP_TIME)
    return await fetchAndStoreRSS({ url, name, category: "science" })
  }))

  await Promise.all(health.map(async (publisher) => {
    const { url, name } = publisher;
    await sleep(SLEEP_TIME)
    return await fetchAndStoreRSS({ url, name, category: "health" })
  }))

  await Promise.all(sports.map(async (publisher) => {
    const { url, name } = publisher;
    await sleep(SLEEP_TIME)
    return await fetchAndStoreRSS({ url, name, category: "sports" })
  }))

  await Promise.all(entertainment.map(async (publisher) => {
    const { url, name } = publisher;
    await sleep(SLEEP_TIME)
    return await fetchAndStoreRSS({ url, name, category: "entertainment" })
  }))

  await Promise.all(general.map(async (publisher) => {
    const { url, name } = publisher;
    await sleep(SLEEP_TIME)
    return await fetchAndStoreRSS({ url, name, category: "general" })
  }))

  await Promise.all(politics.map(async (publisher) => {
    const { url, name } = publisher;
    await sleep(SLEEP_TIME)
    return await fetchAndStoreRSS({ url, name, category: "politics" })
  }))

  await Promise.all(artCulture.map(async (publisher) => {
    const { url, name } = publisher;
    await sleep(SLEEP_TIME)
    return await fetchAndStoreRSS({ url, name, category: "art_culture" })
  }))


  await Promise.all(realEstate.map(async (publisher) => {
    const { url, name } = publisher;
    await sleep(SLEEP_TIME)
    return await fetchAndStoreRSS({ url, name, category: "real_estate" })
  }))

  await Promise.all(environment.map(async (publisher) => {
    const { url, name } = publisher;
    await sleep(SLEEP_TIME)
    return await fetchAndStoreRSS({ url, name, category: "environment" })
  }))

  await Promise.all(finance.map(async (publisher) => {
    const { url, name } = publisher;
    await sleep(SLEEP_TIME)
    return await fetchAndStoreRSS({ url, name, category: "finance" })
  }))

  await Promise.all(gaming.map(async (publisher) => {
    const { url, name } = publisher;
    await sleep(SLEEP_TIME)
    return await fetchAndStoreRSS({ url, name, category: 'gaming' })
  }))

  await Promise.all(lifestyle.map(async (publisher) => {
    const { url, name } = publisher;
    await sleep(SLEEP_TIME)
    return await fetchAndStoreRSS({ url, name, category: 'lifestyle' })
  }))

  await Promise.all(usNews.map(async (publisher) => {
    const { url, name } = publisher;
    await sleep(SLEEP_TIME)
    return await fetchAndStoreRSS({ url, name, category: 'us_news' })
  }))

  await Promise.all(worldNews.map(async (publisher) => {
    const { url, name } = publisher;
    await sleep(SLEEP_TIME)
    return await fetchAndStoreRSS({ url, name, category: 'world_news' })
  }))

}