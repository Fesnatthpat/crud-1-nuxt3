import { PrismaClient } from "@prisma/client"

// นำเข้า PrismaClient เพื่อเชื่อมต่อและจัดการฐานข้อมูล
const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    // ดึง `id` จาก router parameter
    const id = getRouterParam(event, 'id')

    // ตรวจสอบว่า `id` มีค่าหรือไม่ ถ้าไม่มีให้โยน error
    if (!id) {
        throw createError({
            statusCode: 400, // รหัส HTTP สำหรับคำขอที่ผิดพลาด
            message: 'Invalid id', // ข้อความ error ที่จะแสดง
        })
    }

    // ใช้ Prisma ลบข้อมูล post ที่มี `id` ตรงกับค่าที่ได้รับ
    await prisma.post.delete({
        where: { id: Number(id) }, // แปลง id เป็นตัวเลขเพื่อใช้ค้นหาในฐานข้อมูล
    })

    // ส่งคืนข้อความยืนยันการลบสำเร็จ
    return {
        message: 'Post deleted successfully!'
    }
})
