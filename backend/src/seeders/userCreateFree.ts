import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // ... you will write your Prisma Client queries here
    await prisma.user.create({
        data: {
            login_id: 'artist',
            email_address: 'miwastrong777@icloud.com',
            password: "1234",
            name: "free",
            authority: {
                create: { name: 'user' },
            },
        },
    })
  
    const allUsers = await prisma.user.findMany({
        include: {
            authority: true,
        },
    })
    console.dir(allUsers, { depth: null })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    globalThis.process.exit(1)
  })