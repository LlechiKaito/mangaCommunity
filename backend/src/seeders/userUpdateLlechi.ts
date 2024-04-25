import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash("llechi04200113", saltRounds);

    await prisma.user.update({
        where: {
            login_id: 'admin_manga', // ユーザーを特定するための条件
        },
        data: {
            password: hashedPassword, // ハッシュ化されたパスワードを更新
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
