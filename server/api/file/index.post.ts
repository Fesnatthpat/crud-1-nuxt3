import { writeFile } from 'fs/promises'

import { v4 } from 'uuid'

export default defineEventHandler(async (event) => {
    const formdata: any = await readMultipartFormData(event)

    const file = formdata.file((item: any) => item.name == 'file')

    const originalFileName = file.filename

    const path = '../public/uploads/'  + v4() + '.' + originalFileName.split('.').pop()

    await writeFile(path, file.data)
    return {
        path
    }
})