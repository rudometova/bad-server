import { errors } from 'celebrate'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import csrf from 'csurf'
import 'dotenv/config'
import express, { json, urlencoded } from 'express'
import mongoose from 'mongoose'
import path from 'path'
import { DB_ADDRESS } from './config'
import errorHandler from './middlewares/error-handler'
import serveStatic from './middlewares/serverStatic'
import routes from './routes'
import rateLimit from 'express-rate-limit'

// Настройка Rate Limiting (защита от DDoS)
const limiter = rateLimit({
    windowMs: 60 * 1000, // 1 минута
    max: 50, // максимум 50 запросов с одного IP
    message: 'Слишком много запросов, попробуйте позже',
    standardHeaders: true,
    legacyHeaders: false,
})

const { PORT = 3000 } = process.env
const app = express()

// Rate Limiting подключаем самым первым
app.use(limiter)

app.use(cookieParser())

// Настройка CORS
app.use(cors({ origin: process.env.ORIGIN_ALLOW, credentials: true }))

// CSRF-защита
const csrfProtection = csrf({ cookie: true })
app.use(csrfProtection)

// Эндпоинт для получения CSRF-токена
app.get('/auth/csrf-token', (req, res) => {
    res.json({
        csrfToken: req.csrfToken(),
    })
})

app.use(serveStatic(path.join(__dirname, 'public')))

app.use(urlencoded({ extended: true }))
app.use(json())

app.options('*', cors())
app.use(routes)
app.use(errors())
app.use(errorHandler)

const bootstrap = async () => {
    try {
        await mongoose.connect(DB_ADDRESS)
        await app.listen(PORT, () => console.log('ok'))
    } catch (error) {
        console.error(error)
    }
}

bootstrap()