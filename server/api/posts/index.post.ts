import { PrismaClient } from '@prisma/client';
import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
    // อ่านข้อมูลจาก multipart form data
    const body = await readMultipartFormData(event);

    // ดึงข้อมูล title, content และ image
    const title = body?.find((item) => item.name === 'title')?.data?.toString();
    const content = body?.find((item) => item.name === 'content')?.data?.toString();
    const imageBuffer = body?.find((item) => item.name === 'image')?.data as Buffer;
    const imageFileName = body?.find((item) => item.name === 'image')?.filename;

    // ตรวจสอบว่ามีข้อมูลที่จำเป็นครบถ้วน
    if (!title || !content || !imageBuffer || !imageFileName) {
        throw createError({ statusCode: 400, message: 'Missing required fields' });
    }

    // สร้างโฟลเดอร์สำหรับเก็บไฟล์ถ้าไม่มี
    const uploadsDir = path.join(process.cwd(), 'public/uploads');
    await fs.mkdir(uploadsDir, { recursive: true });

    // สร้างชื่อไฟล์ใหม่ด้วย UUID เพื่อป้องกันการซ้ำ
    const filePath = path.join(uploadsDir, `${uuidv4()}_${imageFileName}`);
    
    // บันทึกไฟล์ที่อัปโหลดไปยังโฟลเดอร์
    await fs.writeFile(filePath, imageBuffer);

    // สร้างโพสต์ในฐานข้อมูล
    const post = await prisma.post.create({
        data: {
            title,
            content,
            imageUrl: `/uploads/${path.basename(filePath)}`, // เก็บ URL ของไฟล์ในฐานข้อมูล
        },
    });

    // คืนค่าโพสต์ที่ถูกสร้าง
    return post;
});
