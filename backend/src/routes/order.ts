import { Router } from 'express'
import {
    createOrder,
    deleteOrder,
    getOrderByNumber,
    getOrderCurrentUserByNumber,
    getOrders,
    getOrdersCurrentUser,
    updateOrder,
} from '../controllers/order'
import auth, { roleGuardMiddleware } from '../middlewares/auth'
import { validateOrderBody } from '../middlewares/validations'
import { Role } from '../models/user'

const orderRouter = Router()

// Создание заказа — только для авторизованных пользователей
orderRouter.post('/', auth, validateOrderBody, createOrder)

// Получение всех заказов — только для администраторов
orderRouter.get('/all', auth, roleGuardMiddleware(Role.Admin), getOrders)

// Получение своих заказов — для авторизованных пользователей
orderRouter.get('/all/me', auth, getOrdersCurrentUser)

// Получение заказа по номеру — только для администраторов
orderRouter.get(
    '/:orderNumber',
    auth,
    roleGuardMiddleware(Role.Admin),
    getOrderByNumber
)

// Получение своего заказа по номеру — для авторизованных пользователей
orderRouter.get('/me/:orderNumber', auth, getOrderCurrentUserByNumber)

// Обновление заказа — только для администраторов
orderRouter.patch(
    '/:orderNumber',
    auth,
    roleGuardMiddleware(Role.Admin),
    updateOrder
)

// Удаление заказа — только для администраторов
orderRouter.delete('/:id', auth, roleGuardMiddleware(Role.Admin), deleteOrder)

export default orderRouter