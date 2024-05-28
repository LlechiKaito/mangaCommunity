import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
    const saltRounds = 10;
    let hashedPassword = await bcrypt.hash("llechi04200113", saltRounds);

    await prisma.user.create({
        data: {
            login_id: 'admin_manga',
            email_address: 'llechi0420@gmail.com',
            password: hashedPassword,
            name: "管理者",
            authority: {
                create: { name: 'administrator' },
            },
        },
    })

    hashedPassword = await bcrypt.hash("1234", saltRounds);

    await prisma.user.create({
        data: {
            login_id: 'artist',
            email_address: 'miwastrong777@icloud.com',
            password: hashedPassword,
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
