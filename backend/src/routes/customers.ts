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

customerRouter.get('/', auth, roleGuardMiddleware(Role.Admin), getCustomers)
customerRouter.get(
    '/:id',
    celebrate({
        params: Joi.object({
            id: Joi.string().hex().length(24).required(),
        }),
    }),
    auth,
    getCustomerById
)
customerRouter.patch('/:id', auth, updateCustomer)
customerRouter.delete('/:id', auth, deleteCustomer)

export default customerRouter
