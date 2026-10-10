import multer from "multer"
import fs from "fs"

const uploadDir = "./public"
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true })
}

const storage = multer.diskStorage({
   destination: (req, file, cb) => {
    cb(null, uploadDir)
   },
   filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/\s+/g, '_')
    cb(null, `${Date.now()}-${safeName}`)
   }
})

export const upload = multer({ storage })