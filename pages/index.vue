<script setup lang="ts">
// นำเข้า ref และ onMounted จาก Vue เพื่อจัดการกับ state และ lifecycle hooks
import { ref, onMounted } from 'vue';
// นำเข้า type Post สำหรับกำหนดโครงสร้างข้อมูลโพสต์
import { type Post } from '~~/types/post';

// ประกาศตัวแปรที่ใช้เก็บข้อมูลโพสต์ทั้งหมด (posts) เป็น array ของ Post
const posts = ref<Post[]>([])
// ตัวแปรเก็บค่าชื่อเรื่องโพสต์
const title = ref('')
// ตัวแปรเก็บค่าคอนเทนต์ของโพสต์
const content = ref('')
// ตัวแปรเก็บไฟล์รูปภาพที่ผู้ใช้เลือก
const image = ref<File | null>(null)

// ฟังก์ชันสำหรับดึงข้อมูลโพสต์ทั้งหมดจาก API
const fetchPosts = async () => {
    posts.value = await $fetch<Post[]>('/api/posts') // ใช้ $fetch เพื่อดึงข้อมูลจาก endpoint
}

// ฟังก์ชันสำหรับสร้างโพสต์ใหม่
const createPost = async () => {
    // ตรวจสอบว่า title, content และ image มีค่าหรือไม่
    if (!title.value || !content.value || !image.value) {
        alert('Title, Content, and Image are required') // แจ้งเตือนถ้ามีช่องว่าง
        return
    }

    // สร้าง FormData สำหรับส่งข้อมูลแบบ multipart/form-data
    const formData = new FormData()
    formData.append('title', title.value)
    formData.append('content', content.value)
    formData.append('image', image.value)

    try {
        // ส่งข้อมูลไปยัง API เพื่อสร้างโพสต์ใหม่
        await $fetch('/api/posts', {
            method: 'POST',
            body: formData,
        });

        await fetchPosts() // อัปเดตข้อมูลโพสต์หลังจากสร้างเสร็จ
    } catch (error) {
        console.error('Error creating post:', error) // แสดงข้อผิดพลาดใน console
        alert('Failed to create post') // แจ้งเตือนข้อผิดพลาด
    }
}

// ฟังก์ชันสำหรับอัปเดตโพสต์ที่มีอยู่
const updatePost = async (postId: number, newTitle: string, newContent: string) => {
    const updatedData = { title: newTitle, content: newContent } // เตรียมข้อมูลใหม่
    try {
        // ส่งข้อมูลไปยัง API เพื่ออัปเดตโพสต์
        await $fetch(`/api/posts/${postId}`, {
            method: 'PUT',
            body: JSON.stringify(updatedData),
            headers: {
                'Content-Type': 'application/json',
            },
        })
        await fetchPosts() // อัปเดตข้อมูลโพสต์หลังจากแก้ไขเสร็จ
    } catch (error) {
        console.error('Error updating post:', error) // แสดงข้อผิดพลาดใน console
        alert('Failed to update post') // แจ้งเตือนข้อผิดพลาด
    }
}

// ฟังก์ชันสำหรับลบโพสต์
const deletePost = async (postId: number) => {
    const confirmed = confirm('Are you sure you want to delete this post?') // ยืนยันก่อนลบ
    if (confirmed) {
        try {
            await $fetch(`/api/posts/${postId}`, { method: 'DELETE' }) // ส่งคำขอลบโพสต์
            await fetchPosts() // อัปเดตข้อมูลโพสต์หลังจากลบเสร็จ
        } catch (error) {
            console.error('Error deleting post:', error) // แสดงข้อผิดพลาดใน console
            alert('Failed to delete post') // แจ้งเตือนข้อผิดพลาด
        }
    }
}

// ตัวแปรสำหรับควบคุมการแสดง Modal
const isModalOpen = ref(false)
// ตัวแปรเก็บข้อมูลแบบฟอร์มสำหรับการแก้ไขโพสต์
const editForm = ref({
    id: 0,
    title: '',
    content: '',
})

// ฟังก์ชันเปิด Modal สำหรับแก้ไขโพสต์
const openEditModal = (post: Post) => {
    editForm.value = { ...post }; // ตั้งค่าฟอร์มด้วยข้อมูลโพสต์ที่เลือก
    isModalOpen.value = true // เปิด Modal
}

// ฟังก์ชันปิด Modal
const closeModal = () => {
    isModalOpen.value = false;
}

// ฟังก์ชันยืนยันการแก้ไขโพสต์
const confirmUpdate = async () => {
    if (editForm.value.id) { // ตรวจสอบว่า id มีค่า
        await updatePost(editForm.value.id, editForm.value.title, editForm.value.content)
        closeModal() // ปิด Modal หลังอัปเดตเสร็จ
    }
}

// ฟังก์ชันจัดการการเปลี่ยนไฟล์
const handleFileChange = (e: Event) => {
    const fileInput = e.target as HTMLInputElement
    if (fileInput.files && fileInput.files[0]) { // ตรวจสอบว่ามีไฟล์ที่เลือก
        image.value = fileInput.files[0] // ตั้งค่าไฟล์ลงในตัวแปร image
    } else {
        image.value = null; // รีเซ็ตค่า image ถ้าไม่มีไฟล์
    }
}

// ดึงข้อมูลโพสต์เมื่อคอมโพเนนต์ถูก mount
onMounted(fetchPosts)

// ตั้งค่าหัวข้อหน้าเว็บ
useHead({
    title: 'Home',
})
</script>


<template>
    <div class="container mx-auto p-8">
        <h1 class="text-2xl font-bold mb-4">Create Post</h1>
        <form @submit.prevent="createPost" class="space-y-4">
            <input v-model="title" type="text" placeholder="Title" class="w-full border p-2" />
            <textarea v-model="content" placeholder="Content" class="w-full border p-2"></textarea>
            <input type="file" @change="handleFileChange" class="w-full border p-2" />
            <button class="bg-blue-500 text-white px-4 py-2">Submit</button>
        </form>

        <h2 class="text-xl font-bold mt-8">Posts</h2>
    </div>

    <div class="container mx-auto">
        <div class="grid grid-cols-1 md:grid-cols-3 sm:grid-cols-2 lg:grid-cols-4 m-2 gap-2">
            <div v-for="post in posts" :key="post.id" class="border-2 bg-slate-600 rounded-md p-2">
                <div class="mx-auto overflow-hidden">
                    <h3 class="font-bold">{{ post.title }}</h3>
                    <p class="p-2">{{ post.content }}</p>
                    <p class="p-2">{{ post.createdAt }}</p>
                    <img class="w-full h-full" :src="post.imageUrl" alt="" />
                </div>
                <div class="flex justify-between mt-2">
                    <button @click="openEditModal(post)" class="bg-yellow-500 text-white px-2 py-1">Edit</button>
                    <button @click="deletePost(post.id)" class="bg-red-500 text-white px-2 py-1">Delete</button>
                </div>
            </div>
        </div>
    </div>

    <!-- Modal -->
    <div v-if="isModalOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-5">
        <div class="bg-white rounded-lg shadow-lg p-6 w-full md:w-1/3">
            <h3 class="text-xl font-bold mb-4">Edit Post</h3>
            <form @submit.prevent="confirmUpdate" class="space-y-4">
                <h1>{{ editForm.id }}</h1>
                <input v-model="editForm.title" type="text" placeholder="Title" class="w-full border p-2" />
                <textarea v-model="editForm.content" placeholder="Content" class="w-full border p-2"></textarea>
                <div class="flex justify-end">
                    <button @click="closeModal" type="button"
                        class="bg-gray-500 text-white px-4 py-2 mr-2">Cancel</button>
                    <button type="submit" class="bg-green-500 text-white px-4 py-2">Save</button>
                </div>
            </form>
        </div>
    </div>
</template>
