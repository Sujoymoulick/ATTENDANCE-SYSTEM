'use server'

import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

async function checkAdmin() {
    const session = await getSession()
    if (!session?.user || session.user.role !== 'ADMIN') {
        throw new Error('Unauthorized')
    }
}

export async function createInstitutionAction(formData: FormData) {
    try {
        await checkAdmin()

        const name = formData.get('name') as string
        const type = formData.get('type') as string

        if (!name || !type) return { error: 'Missing fields' }

        await prisma.institution.create({
            data: { name, type }
        })

        revalidatePath('/admin')
        return { success: true }
    } catch (error: any) {
        return { error: error.message || 'Failed to create institution' }
    }
}

export async function updateInstitutionAction(id: string, formData: FormData) {
    try {
        await checkAdmin()

        const name = formData.get('name') as string
        const type = formData.get('type') as string

        if (!name || !type) return { error: 'Missing fields' }

        await prisma.institution.update({
            where: { id },
            data: { name, type }
        })

        revalidatePath('/admin')
        return { success: true }
    } catch (error: any) {
        return { error: error.message || 'Failed to update institution' }
    }
}

export async function createUserAction(formData: FormData) {
    try {
        await checkAdmin()

        const name = formData.get('name') as string
        const email = formData.get('email') as string
        const password = formData.get('password') as string
        const role = formData.get('role') as string
        const institutionId = formData.get('institutionId') as string

        if (!name || !email || !password || !role) return { error: 'Missing fields' }

        await prisma.user.create({
            data: {
                name,
                email,
                password, // Note: In a real app, hash password before saving
                role,
                institutionId: institutionId || null
            }
        })

        revalidatePath('/admin/users')
        return { success: true }
    } catch (error: any) {
        return { error: error.message || 'Failed to create user' }
    }
}

export async function updateUserAction(id: string, formData: FormData) {
    try {
        await checkAdmin()

        const name = formData.get('name') as string
        const email = formData.get('email') as string
        const role = formData.get('role') as string
        const institutionId = formData.get('institutionId') as string

        if (!name || !email || !role) return { error: 'Missing fields' }

        await prisma.user.update({
            where: { id },
            data: {
                name,
                email,
                role,
                institutionId: institutionId || null
            }
        })

        revalidatePath('/admin/users')
        return { success: true }
    } catch (error: any) {
        return { error: error.message || 'Failed to update user' }
    }
}
