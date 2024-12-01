<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { type Post } from '~~/types/post';

// กำหนดประเภทของโพสต์
// type Post = {
//     id: number
//     title: string
//     content: string
//     imageUrl: string
//     createdAt: string
//     updatedAt: string
// }

const posts = ref<Post[]>([]);
const title = ref('');
const content = ref('');
const image = ref<File | null>(null);

const fetchPosts = async () => {
    posts.value = await $fetch<Post[]>('/api/posts');
};

const createPost = async () => {
    if (!title.value || !content.value || !image.value) {
        alert('Title, Content, and Image are required');
        return;
    }

    const formData = new FormData();
    formData.append('title', title.value);
    formData.append('content', content.value);
    formData.append('image', image.value);

    try {
        await $fetch('/api/posts', {
            method: 'POST',
            body: formData,
        });

        await fetchPosts();
    } catch (error) {
        console.error('Error creating post:', error);
        alert('Failed to create post');
    }
};

const updatePost = async (postId: number, newTitle: string, newContent: string) => {
    const updatedData = { title: newTitle, content: newContent };
    try {
        await $fetch(`/api/posts/${postId}`, {
            method: 'PUT',
            body: JSON.stringify(updatedData),
            headers: {
                'Content-Type': 'application/json',
            },
        });
        await fetchPosts();
    } catch (error) {
        console.error('Error updating post:', error);
        alert('Failed to update post');
    }
};

const deletePost = async (postId: number) => {
    const confirmed = confirm('Are you sure you want to delete this post?');
    if (confirmed) {
        try {
            await $fetch(`/api/posts/${postId}`, {
                method: 'DELETE',
            });
            await fetchPosts();
        } catch (error) {
            console.error('Error deleting post:', error);
            alert('Failed to delete post');
        }
    }
};

const isModalOpen = ref(false);
const editForm = ref({
    id: 0,
    title: '',
    content: '',
});

const openEditModal = (post: Post) => {
    editForm.value = { ...post };
    isModalOpen.value = true;
};

const closeModal = () => {
    isModalOpen.value = false;
};

const confirmUpdate = async () => {
    if (editForm.value.id) {
        await updatePost(editForm.value.id, editForm.value.title, editForm.value.content);
        closeModal();
    }
};

const handleFileChange = (e: Event) => {
    const fileInput = e.target as HTMLInputElement;
    if (fileInput.files && fileInput.files[ 0 ]) {
        image.value = fileInput.files[ 0 ];
    } else {
        image.value = null;
    }
};

onMounted(fetchPosts);

useHead({
    title: 'Home',
});
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
                    <!-- <h3 class="font-bold">{{ post.id }}</h3> -->
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
                <h1>{{editForm.id}}</h1>
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
