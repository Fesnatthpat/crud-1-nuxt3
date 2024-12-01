import { type Post } from "~~/types/post"

export default () => {
    const config = useRuntimeConfig()
    const POST_URL = config.public.postUrlAPI

    const get = async <T>(endpoint: string) => {
        return useFetch<T>(`${POST_URL}${endpoint}`)
    }

    const getAllPosts = async () => {
        return get<Post[]>('/posts')
    }

    return {
        getAllPosts
    }
}