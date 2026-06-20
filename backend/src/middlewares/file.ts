import { Request, Express } from 'express'
import multer, { FileFilterCallback } from 'multer'
import { mkdirSync } from 'fs'
import path, { join } from 'path'
import { v4 as uuidv4 } from 'uuid'

type DestinationCallback = (error: Error | null, destination: string) => void
type FileNameCallback = (error: Error | null, filename: string) => void

// Безопасная директория для загрузки (без пользовательского ввода)
const UPLOAD_DIR = join(__dirname, '../public/uploads')

const storage = multer.diskStorage({
    destination: (
        _req: Request,
        _file: Express.Multer.File,
        cb: DestinationCallback
    ) => {
        mkdirSync(UPLOAD_DIR, { recursive: true })
        cb(null, UPLOAD_DIR)
    },

    filename: (
        _req: Request,
        file: Express.Multer.File,
        cb: FileNameCallback
    ) => {
        // Генерируем уникальное имя файла (защита от Path Traversal)
        const ext = path.extname(file.originalname)
        const safeName = `${uuidv4()}${ext}`
        cb(null, safeName)
    },
})

// Разрешённые типы файлов (без SVG из-за XSS-рисков)
const allowedTypes = [
    'image/png',
    'image/jpg',
    'image/jpeg',
    'image/gif',
]

const fileFilter = (
    _req: Request,
    file: Express.Multer.File,
    cb: FileFilterCallback
) => {
    if (!allowedTypes.includes(file.mimetype)) {
        return cb(null, false)
    }
    return cb(null, true)
}

export default multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5 МБ
    },
})