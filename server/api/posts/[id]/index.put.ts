import { PrismaClient } from '@prisma/client'; 
import fs from 'fs/promises'; 
import path from 'path'; 

// สร้างอินสแตนซ์ของ PrismaClient เพื่อเชื่อมต่อฐานข้อมูล
const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
    // ดึง `id` จาก router parameter
    const id = getRouterParam(event, 'id');
    // อ่านข้อมูลจาก body ของ request
    const body = await readBody(event);

    // ตรวจสอบว่ามีข้อมูล `id`, `title` และ `content` ครบหรือไม่ ถ้าไม่ครบจะโยน error
    if (!id || !body.title || !body.content) {
        throw createError({
            statusCode: 400, // รหัส HTTP สำหรับคำขอที่ผิดพลาด
            message: 'Invalid data', // ข้อความ error
        });
    }

    // ตัวแปรสำหรับเก็บ URL ของภาพใหม่ (เริ่มต้น undefined)
    let newImageUrl = undefined;

    // ตรวจสอบว่ามีภาพถูกส่งมาใน `body.image` หรือไม่
    if (body.image) {
        const base64Image = body.image; // รับข้อมูลภาพในรูป base64
        const imageBuffer = Buffer.from(base64Image, 'base64'); // แปลง base64 เป็น buffer

        // ตั้งชื่อไฟล์รูปภาพใหม่
        const imageName = `post-${id}-${Date.now()}.jpg`;
        const uploadPath = path.join(process.cwd(), 'public/uploads', imageName); // เส้นทางที่ใช้บันทึกไฟล์

        console.log('Saving image to:', uploadPath); // แสดงเส้นทางไฟล์ที่บันทึกใน log

        await fs.writeFile(uploadPath, imageBuffer); // เขียนไฟล์ภาพลงในระบบไฟล์
        newImageUrl = `/uploads/${imageName}`; // สร้าง URL สำหรับภาพที่อัปโหลด
    }

    // อัปเดตข้อมูล post ในฐานข้อมูล
    const updatedPost = await prisma.post.update({
        where: { id: Number(id) }, // ระบุ id ของ post ที่ต้องการอัปเดต
        data: {
            title: body.title, // อัปเดตชื่อเรื่อง
            content: body.content, // อัปเดตเนื้อหา
            imageUrl: newImageUrl || undefined, // อัปเดต URL ของภาพ (ถ้ามี)
        },
    });

    console.log('Updated post:', updatedPost); // แสดงข้อมูล post ที่ถูกอัปเดตใน log

    // ส่งคืนข้อมูล post ที่ถูกอัปเดต
    return updatedPost;
});
