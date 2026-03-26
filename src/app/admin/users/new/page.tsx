import { prisma } from '@/lib/prisma'
import NewUserForm from './NewUserForm'

export default async function NewUserPage() {
    const institutions = await prisma.institution.findMany({
        orderBy: { name: 'asc' }
    })

    return <NewUserForm institutions={institutions} />
}
