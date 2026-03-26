'use server'

import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function createClassAction(formData: FormData) {
    const session = await getSession()
    if (!session?.user) return { error: 'Unauthorized' }

    const title = formData.get('title') as string
    const startTime = formData.get('startTime') as string
    const duration = parseInt(formData.get('duration') as string)
    const question = formData.get('question') as string
    const optionsStr = formData.get('options') as string
    const correctAnswer = formData.get('correctAnswer') as string

    if (!title || !startTime || !duration) return { error: 'Missing required class fields' }

    try {
        const startObj = new Date(startTime)
        const endObj = new Date(startObj.getTime() + duration * 60000)

        const classSession = await prisma.classSession.create({
            data: {
                title,
                teacherId: session.user.id,
                startTime: startObj,
                endTime: endObj,
            }
        })

        if (question && optionsStr && correctAnswer) {
            // split options by comma
            const optionsArray = optionsStr.split(',').map(o => o.trim())
            await prisma.quiz.create({
                data: {
                    classSessionId: classSession.id,
                    question,
                    options: JSON.stringify(optionsArray),
                    correctAnswer: correctAnswer.trim(),
                }
            })
        }

        return { success: true }
    } catch (error: any) {
        return { error: 'Failed to create class: ' + error.message }
    }
}
