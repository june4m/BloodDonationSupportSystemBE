import { Router } from 'express'
import UserController from '~/controller/UserController'


const router = Router()
const userController = new UserController()

router.post('/login', (req, res) => userController.login(req, res))
router.post('/logout',(req,res)=>userController.logout(req,res))
export default router
