import { celebrate, Joi } from 'celebrate'

export const validateLogin = celebrate({
    body: Joi.object({
        email: Joi.string().email().required(),

        password: Joi.string().required(),
    }),
})

export const validateRegister = celebrate({
    body: Joi.object({
        email: Joi.string().email().required(),

        password: Joi.string().min(6).required(),

        name: Joi.string().min(2).max(30).required(),
    }),
})

export const validateUpdateUser = celebrate({
    body: Joi.object({
        name: Joi.string().min(2).max(30),

        email: Joi.string().email(),
    }),
})

export const validateUpdateProduct = celebrate({
    params: Joi.object({
        productId: Joi.string().hex().length(24).required(),
    }),

    body: Joi.object({
        title: Joi.string().min(2).max(30),

        description: Joi.string().max(1000),

        category: Joi.string(),

        price: Joi.number().min(0).allow(null),

        image: Joi.object({
            fileName: Joi.string().pattern(/^[a-zA-Z0-9._-]+$/),

            originalName: Joi.string(),
        }),
    })
        .min(1)
        .unknown(false),
})
