'use server'

import { prisma } from '@/lib/prisma'
import bcryptjs from 'bcryptjs'
import { setSession } from '@/lib/auth'

export async function loginAction(formData: FormData) {
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    if (!email || !password) {
        return { error: 'Please enter both email and password' }
    }

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
        return { error: 'Invalid credentials' }
    }

    const isValid = await bcryptjs.compare(password, user.password)
    if (!isValid) {
        return { error: 'Invalid credentials' }
    }

    // Create JWT session
    await setSession({
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
    })

    return { success: true, role: user.role.toLowerCase() }
}
