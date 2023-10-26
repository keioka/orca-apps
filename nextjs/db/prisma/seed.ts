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

  try {
    await addInitialPublisherAndMaterials()
  } catch (error) {
    console.error(error)
  }
  // const createMaterials = materials.map(material =>
  //   prisma.material.upsert({
  //     where: { url: material.url },
  //     update: material, // this will update the existing material with the new data
  //     create: material, // this will create a new material if one doesn't exist with the specified URL
  //   })
  // );
  // await prisma.$transaction(createMaterials);
  // await prisma.$disconnect();
  try {
    await addLanguages()
  } catch (error) {
    console.error(error)
  }

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

async function addLanguages() {
  const prisma = new PrismaClient();
  try {
    const languages = [
      { code: 'en', name: 'English' },
      { code: 'fr', name: 'French' },
      { code: 'es', name: 'Spanish' },
      { code: 'de', name: 'German' },
      { code: 'it', name: 'Italian' },
      { code: 'pt', name: 'Portuguese' },
      { code: 'ru', name: 'Russian' },
      { code: 'zh', name: 'Chinese' },
      { code: 'ja', name: 'Japanese' },
      { code: 'ko', name: 'Korean' },
      { code: 'ar', name: 'Arabic' },
      { code: 'hi', name: 'Hindi' },
      { code: 'ur', name: 'Urdu' },
      { code: 'bn', name: 'Bengali' },
      { code: 'sw', name: 'Swahili' },
      { code: 'nl', name: 'Dutch' },
      { code: 'el', name: 'Greek' },
      { code: 'tr', name: 'Turkish' },
      { code: 'sv', name: 'Swedish' },
      { code: 'pl', name: 'Polish' },
      { code: 'fi', name: 'Finnish' },
      { code: 'he', name: 'Hebrew' },
      { code: 'id', name: 'Indonesian' },
      { code: 'ta', name: 'Tamil' },
      { code: 'te', name: 'Telugu' },
      { code: 'th', name: 'Thai' },
      { code: 'fa', name: 'Persian' },
      { code: 'gu', name: 'Gujarati' },
      { code: 'kn', name: 'Kannada' },
      { code: 'ml', name: 'Malayalam' },
      { code: 'or', name: 'Odia' },
      { code: 'pa', name: 'Punjabi' },
      { code: 'mr', name: 'Marathi' },
      { code: 'ne', name: 'Nepali' },
      { code: 'uk', name: 'Ukrainian' },
      { code: 'vi', name: 'Vietnamese' },
      { code: 'ro', name: 'Romanian' },
      { code: 'hu', name: 'Hungarian' },
      { code: 'cs', name: 'Czech' },
      { code: 'sr', name: 'Serbian' },
      { code: 'hr', name: 'Croatian' },
      { code: 'bg', name: 'Bulgarian' },
      { code: 'da', name: 'Danish' },
      { code: 'no', name: 'Norwegian' },
      { code: 'sk', name: 'Slovak' },
    ];

    // for (const language of languages) {
    await prisma.language.createMany({
      data: languages,
      skipDuplicates: true
    });
    // }
  } catch (error) {
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}