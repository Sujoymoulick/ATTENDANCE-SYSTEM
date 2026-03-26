import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import EditInstitutionForm from './EditInstitutionForm'

export default async function EditInstitutionPage({ params }: { params: { id: string } }) {
    const institution = await prisma.institution.findUnique({
        where: { id: params.id }
    })

    if (!institution) redirect('/admin')

    return <EditInstitutionForm institution={institution} />
}
