import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export default defineEventHandler(async () => {

    const posts = await prisma.post.findMany()

    console.log(posts)
    return posts
})