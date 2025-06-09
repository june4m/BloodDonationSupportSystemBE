// route.ts
import { Router } from 'express'
import UserController from './controller/UserController'

const router = Router()
const userController = new UserController()

router.post('/login', (req, res) => userController.login(req, res))

export default router
