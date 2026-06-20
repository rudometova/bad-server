import { NextFunction, Request, Response } from 'express'
import { constants } from 'http2'
import { Error as MongooseError } from 'mongoose'
import { join } from 'path'
import BadRequestError from '../errors/bad-request-error'
import ConflictError from '../errors/conflict-error'
import NotFoundError from '../errors/not-found-error'
import Product from '../models/product'
import movingFile from '../utils/movingFile'

// Безопасные фиксированные пути
const TEMP_DIR = join(__dirname, '../public/temp')
const UPLOAD_DIR = join(__dirname, '../public/uploads')

// GET /product
const getProducts = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { page = 1, limit = 5 } = req.query

        // Валидация page и limit (защита от DoS)
        const pageNum = Math.max(1, Number(page) || 1)
        const limitNum = Math.min(50, Math.max(1, Number(limit) || 5))

        const options = {
            skip: (pageNum - 1) * limitNum,
            limit: limitNum,
        }
        const products = await Product.find({}, null, options)
        const totalProducts = await Product.countDocuments({})
        const totalPages = Math.ceil(totalProducts / limitNum)
        return res.send({
            items: products,
            pagination: {
                totalProducts,
                totalPages,
                currentPage: pageNum,
                pageSize: limitNum,
            },
        })
    } catch (err) {
        return next(err)
    }
}

// POST /product
const createProduct = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { description, category, price, title, image } = req.body

        // Переносим картинку из временной папки (безопасные пути)
        if (image) {
            movingFile(
                image.fileName,
                TEMP_DIR,
                UPLOAD_DIR
            )
        }

        const product = await Product.create({
            description,
            image,
            category,
            price,
            title,
        })
        return res.status(constants.HTTP_STATUS_CREATED).send(product)
    } catch (error) {
        if (error instanceof MongooseError.ValidationError) {
            return next(new BadRequestError(error.message))
        }
        if (error instanceof Error && error.message.includes('E11000')) {
            return next(
                new ConflictError('Товар с таким заголовком уже существует')
            )
        }
        return next(error)
    }
}

// PUT /product
const updateProduct = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { productId } = req.params
        const { image } = req.body

        // Переносим картинку из временной папки (безопасные пути)
        if (image) {
            movingFile(
                image.fileName,
                TEMP_DIR,
                UPLOAD_DIR
            )
        }

        // Разрешаем только определённые поля для обновления
        const allowedUpdates = ['title', 'description', 'category', 'price', 'image']
        const updateData: any = {}
        allowedUpdates.forEach(field => {
            if (req.body[field] !== undefined) {
                updateData[field] = req.body[field]
            }
        })

        // Валидация price
        if (updateData.price !== undefined && updateData.price !== null && typeof updateData.price !== 'number') {
            return next(new BadRequestError('Некорректная цена'))
        }

        const product = await Product.findByIdAndUpdate(
            productId,
            updateData,
            { runValidators: true, new: true }
        ).orFail(() => new NotFoundError('Нет товара по заданному id'))
        return res.send(product)
    } catch (error) {
        if (error instanceof MongooseError.ValidationError) {
            return next(new BadRequestError(error.message))
        }
        if (error instanceof MongooseError.CastError) {
            return next(new BadRequestError('Передан не валидный ID товара'))
        }
        if (error instanceof Error && error.message.includes('E11000')) {
            return next(
                new ConflictError('Товар с таким заголовком уже существует')
            )
        }
        return next(error)
    }
}

// DELETE /product
const deleteProduct = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { productId } = req.params
        const product = await Product.findByIdAndDelete(productId).orFail(
            () => new NotFoundError('Нет товара по заданному id')
        )
        return res.send(product)
    } catch (error) {
        if (error instanceof MongooseError.CastError) {
            return next(new BadRequestError('Передан не валидный ID товара'))
        }
        return next(error)
    }
}

export { createProduct, deleteProduct, getProducts, updateProduct }