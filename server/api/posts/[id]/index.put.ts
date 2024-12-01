import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id');
    const body = await readBody(event);

    if (!id || !body.title || !body.content) {
        throw createError({
            statusCode: 400,
            message: 'Invalid data',
        });
    }

    let newImageUrl = undefined;

    if (body.image) {
        const base64Image = body.image;
        const imageBuffer = Buffer.from(base64Image, 'base64');

        const imageName = `post-${id}-${Date.now()}.jpg`;
        const uploadPath = path.join(process.cwd(), 'public/uploads', imageName);

        console.log('Saving image to:', uploadPath);

        await fs.writeFile(uploadPath, imageBuffer);
        newImageUrl = `/uploads/${imageName}`;
    }

    const updatedPost = await prisma.post.update({
        where: { id: Number(id) },
        data: {
            title: body.title,
            content: body.content,
            imageUrl: newImageUrl || undefined,
        },
    });

    console.log('Updated post:', updatedPost);

    return updatedPost;
});
