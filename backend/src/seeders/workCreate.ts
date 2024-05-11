import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    //work新規作成
    const newWork = await prisma.work.create({
        data: {
            explanation: 'first work',
            user_id: 1,
            title: 'naruto',
        }
    })

    //workimages新規作成
    const workImagesData = [
        { file_name: 'https://placehold.jp/300x200.png', work_id: newWork.id },
    ]

    await Promise.all(workImagesData.map(async (imageData) => {
        await prisma.work_image.create({
            data: imageData,
        })
    }))
    const allWorks = await prisma.work.findMany()
    console.dir(allWorks, { depth: null })
}

main()
  .catch((e => {
    throw e
  }))
  .finally(async () => {
    await prisma.$disconnect()
  })