import { fetchAndStoreRSS } from '../common/fetchRSS';
import business from '../db/seedData/business.json';
import technology from '../db/seedData/tech.json';
import science from '../db/seedData/science.json';
import health from '../db/seedData/health.json';
import sports from '../db/seedData/sports.json';
import entertainment from '../db/seedData/entertainment.json';
import general from '../db/seedData/general.json';

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

}