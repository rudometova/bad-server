import { Router } from 'express'
import { celebrate, Joi } from 'celebrate'
import {
    createProduct,
    deleteProduct,
    getProducts,
    updateProduct,
} from '../controllers/products'
import auth, { roleGuardMiddleware } from '../middlewares/auth'
import {
    validateObjId,
    validateProductBody,
    validateProductUpdateBody,
} from '../middlewares/validations'
import { Role } from '../models/user'

const productRouter = Router()

// GET /product — публичный доступ
productRouter.get(
    '/',
    celebrate({
        query: Joi.object({
            page: Joi.number().integer().min(1).default(1),
            limit: Joi.number().integer().min(1).max(50).default(5),
        }),
    }),
    getProducts
)

// POST /product — только администраторы
productRouter.post(
    '/',
    auth,
    roleGuardMiddleware(Role.Admin),
    celebrate({
        body: Joi.object({
            title: Joi.string().min(2).max(30).required(),
            description: Joi.string().max(1000).allow(''),
            category: Joi.string().required(),
            price: Joi.number().min(0).allow(null),
            image: Joi.object({
                fileName: Joi.string()
                    .pattern(/^[a-zA-Z0-9._-]+$/)
                    .required(),
                originalName: Joi.string(),
            }),
        }).unknown(false),
    }),
    validateProductBody,
    createProduct
)

// DELETE /product — только администраторы
productRouter.delete(
    '/:productId',
    auth,
    roleGuardMiddleware(Role.Admin),
    validateObjId,
    deleteProduct
)

// PATCH /product — только администраторы
productRouter.patch(
    '/:productId',
    auth,
    roleGuardMiddleware(Role.Admin),
    validateObjId,
    validateProductUpdateBody,
    updateProduct
)

export default productRouter