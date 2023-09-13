import { PrismaClient } from '@prisma/client';
import { fetchAndStoreRSS } from '../../common/fetchRSS';

const prisma = new PrismaClient();

console.log("Seeding the database...");

const main = async () => {
  await fetchAndStoreRSS()
  // Customize this object with the proper values for your database

  // const createMaterials = materials.map(material =>
  //   prisma.material.upsert({
  //     where: { url: material.url },
  //     update: material, // this will update the existing material with the new data
  //     create: material, // this will create a new material if one doesn't exist with the specified URL
  //   })
  // );
  // await prisma.$transaction(createMaterials);
  // await prisma.$disconnect();
};

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });