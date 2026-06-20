import { NextFunction, Request, Response } from 'express'
import { constants } from 'http2'
import sharp from 'sharp'
import BadRequestError from '../errors/bad-request-error'

export const uploadFile = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (!req.file) {
        return next(new BadRequestError('Файл не загружен'))
    }
    try {
        const {file} = req

        // Минимальный размер файла (2 KB)
        const MIN_SIZE = 2 * 1024
        if (file.size < MIN_SIZE) {
            return next(
                new BadRequestError('Файл слишком маленький (минимум 2KB)')
            )
        }

        // Максимальный размер файла (10 MB)
        const MAX_SIZE = 10 * 1024 * 1024
        if (file.size > MAX_SIZE) {
            return next(
                new BadRequestError('Файл слишком большой (максимум 10MB)')
            )
        }

        // Проверка MIME-типа
        if (!file.mimetype.startsWith('image/')) {
            return next(new BadRequestError('Файл должен быть изображением'))
        }

        // Проверка через sharp (реальное содержимое)
        let metadata
        try {
            metadata = await sharp(file.path).metadata()
        } catch {
            return next(
                new BadRequestError(
                    'Файл повреждён или не является изображением'
                )
            )
        }

        if (!metadata.width || !metadata.height) {
            return next(new BadRequestError('Некорректное изображение'))
        }

        // Безопасное имя файла уже сгенерировано в file.ts
        const fileName = process.env.UPLOAD_PATH
            ? `/${process.env.UPLOAD_PATH}/${file.filename}`
            : `/${file.filename}`

        return res.status(constants.HTTP_STATUS_CREATED).send({
            fileName,
            originalName: file.originalname,
        })
    } catch (error) {
        return next(error)
    }
}

export default {}