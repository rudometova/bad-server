import { Router } from 'express'
import {
    deleteCustomer,
    getCustomerById,
    getCustomers,
    updateCustomer,
} from '../controllers/customers'
import auth, { roleGuardMiddleware } from '../middlewares/auth'
import { celebrate, Joi } from 'celebrate'
import { Role } from '../models/user'

const customerRouter = Router()

// Только администраторы могут получать список всех пользователей
customerRouter.get('/', auth, roleGuardMiddleware(Role.Admin), getCustomers)

customerRouter.get(
    '/:id',
    celebrate({
        params: Joi.object({
            id: Joi.string().hex().length(24).required(),
        }),
    }),
    auth,
    roleGuardMiddleware(Role.Admin),
    getCustomerById
)

// Только администраторы могут обновлять пользователей
customerRouter.patch('/:id', auth, roleGuardMiddleware(Role.Admin), updateCustomer)

// Только администраторы могут удалять пользователей
customerRouter.delete('/:id', auth, roleGuardMiddleware(Role.Admin), deleteCustomer)

export default customerRouter