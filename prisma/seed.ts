import { PrismaClient } from '@prisma/client'
import bcryptjs from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    const hash = await bcryptjs.hash('password', 10)

    const institute = await prisma.institution.create({
        data: {
            name: 'Global University',
            type: 'COLLEGE',
        }
    })

    await prisma.user.create({
        data: {
            name: 'Admin User',
            email: 'admin@test.com',
            password: hash,
            role: 'ADMIN',
            institutionId: institute.id,
        }
    })

    await prisma.user.create({
        data: {
            name: 'John Teacher',
            email: 'teacher@test.com',
            password: hash,
            role: 'TEACHER',
            institutionId: institute.id,
        }
    })

    await prisma.user.create({
        data: {
            name: 'Alice Student',
            email: 'student@test.com',
            password: hash,
            role: 'STUDENT',
            institutionId: institute.id,
        }
    })

    console.log('Seed completed successfully.')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
