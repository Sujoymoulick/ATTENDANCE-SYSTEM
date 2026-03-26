'use server'

import { clearSession } from '@/lib/auth'

export async function logoutAction() {
    await clearSession()
    return { success: true }
}
