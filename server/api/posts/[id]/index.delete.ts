import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id')

    if (!id) {
        throw createError({
            statusCode: 400,
            message: 'Invalid id',
        })
    }

    await prisma.post.delete({
        where: {id: Number(id)},
    })
    return {
        message: 'Post deleted successfully!'
    }

})