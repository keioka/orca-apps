import { PrismaClient } from '@prisma/client';
import { fetchAndStoreRSS } from '../../common/fetchRSS';
import business from '../seedData/business.json';
import technology from '../seedData/tech.json';
import science from '../seedData/science.json';
import health from '../seedData/health.json';
import sports from '../seedData/sports.json';
import entertainment from '../seedData/entertainment.json';
import general from '../seedData/general.json';
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));


console.log("Seeding the database...");

const main = async () => {
  // Customize this object with the proper values for your database

  await addInitialPublisherAndMaterials()
  // const createMaterials = materials.map(material =>
  //   prisma.material.upsert({
  //     where: { url: material.url },
  //     update: material, // this will update the existing material with the new data
  //     create: material, // this will create a new material if one doesn't exist with the specified URL
  //   })
  // );
  // await prisma.$transaction(createMaterials);
  // await prisma.$disconnect();
  console.log("Seeding successful!")
  process.exit(0);
};

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })



async function addInitialPublisherAndMaterials() {
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