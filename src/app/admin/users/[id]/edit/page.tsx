import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import EditUserForm from './EditUserForm'

export default async function EditUserPage({ params }: { params: { id: string } }) {
    const user = await prisma.user.findUnique({
        where: { id: params.id }
    })

    if (!user) redirect('/admin/users')

    const institutions = await prisma.institution.findMany({
        orderBy: { name: 'asc' }
    })

    return <EditUserForm user={user} institutions={institutions} />
}
