import { Router } from 'express'
import {
    getCurrentUser,
    getCurrentUserRoles,
    login,
    logout,
    refreshAccessToken,
    register,
    updateCurrentUser,
} from '../controllers/auth'
import auth from '../middlewares/auth'
import {
    validateLogin,
    validateRegister,
    validateUpdateUser,
} from '../utils/validate'
import csrf from 'csurf'

const authRouter = Router()

const csrfProtection = csrf({ cookie: true })

authRouter.get('/csrf-token', csrfProtection, (req, res) => {
    return res.json({ csrfToken: req.csrfToken() })
})

authRouter.get('/user', auth, getCurrentUser)
authRouter.patch('/me', validateUpdateUser, auth, updateCurrentUser)
authRouter.get('/user/roles', auth, getCurrentUserRoles)
authRouter.post('/login', csrfProtection, validateLogin, login)
authRouter.get('/token', refreshAccessToken)
authRouter.get('/logout', logout)
authRouter.post('/register', csrfProtection, validateRegister, register)

export default authRouter
