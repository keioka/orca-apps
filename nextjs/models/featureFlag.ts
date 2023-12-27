import prisma from '../db'

export function fetchAllActive(isProd: boolean) {
  return prisma.featureFlag.findMany({
    where: {
      isActive: true,
      isReleaseProd: isProd
    }
  })
}