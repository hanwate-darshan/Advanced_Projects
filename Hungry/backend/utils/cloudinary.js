import { v2 as cloudinary } from 'cloudinary'
import fs from "fs"
import path from "path"

const uploadOnCloudinary = async (file) => {
    try {
        if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
            cloudinary.config({
                cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
                api_key: process.env.CLOUDINARY_API_KEY,
                api_secret: process.env.CLOUDINARY_API_SECRET
            });
            const result = await cloudinary.uploader.upload(file)
            if (fs.existsSync(file)) {
                fs.unlinkSync(file)
            }
            return result.secure_url
        }
    } catch (error) {
        console.warn("Cloudinary upload failed, falling back to local file storage:", error?.message || error)
    }

    // Fallback: If Cloudinary fails (e.g. 403 or network issue), keep local file and return local URL
    if (file && fs.existsSync(file)) {
        const filename = path.basename(file)
        const port = process.env.PORT || 8000
        return `http://localhost:${port}/public/${filename}`
    }
    return null
}

export default uploadOnCloudinary