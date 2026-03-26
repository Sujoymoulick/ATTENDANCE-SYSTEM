'use server'

import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function submitAttendanceAction(classSessionId: string, answer?: string) {
    const session = await getSession()
    if (!session?.user) return { error: 'Unauthorized' }

    const studentId = session.user.id

    // Check if they already submitted
    const existing = await prisma.attendance.findUnique({
        where: { studentId_classSessionId: { studentId, classSessionId } }
    })
    if (existing) return { error: 'Attendance already recorded' }

    // Get class and quiz
    const classSession = await prisma.classSession.findUnique({
        where: { id: classSessionId },
        include: { quizzes: true }
    })

    if (!classSession) return { error: 'Class not found' }

    const now = new Date()
    if (now < classSession.startTime || now > classSession.endTime) {
        // If they try outside time window, auto-mark absent.
        await prisma.attendance.create({
            data: { studentId, classSessionId, status: 'ABSENT' }
        })
        return { error: 'Outside of allowed attendance time window', status: 'ABSENT' }
    }

    // Quiz evaluation
    const quiz = classSession.quizzes[0]
    let status = 'PRESENT'

    if (quiz) {
        if (!answer) return { error: 'Quiz answer required' }
        if (answer.trim().toLowerCase() !== quiz.correctAnswer.trim().toLowerCase()) {
            status = 'ABSENT'
        }
    }

    await prisma.attendance.create({
        data: { studentId, classSessionId, status }
    })

    return { success: true, status }
}

export async function getQuizAction(classSessionId: string) {
    const session = await getSession()
    if (!session?.user) return { error: 'Unauthorized' }

    const classSession = await prisma.classSession.findUnique({
        where: { id: classSessionId },
        include: { quizzes: true }
    })

    if (!classSession) return { error: 'Class not found' }

    const quiz = classSession.quizzes[0]
    if (!quiz) return { quiz: null }

    return {
        quiz: {
            question: quiz.question,
            options: JSON.parse(quiz.options) as string[]
        }
    }
}
