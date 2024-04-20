import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // ... you will write your Prisma Client queries here
    await prisma.user.create({
        data: {
            login_id: 'admin_manga',
            email_address: 'llechi0420@gmail.com',
            password: "llechi04200113",
            name: "管理者",
            authority: {
                create: { name: 'administrator' },
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