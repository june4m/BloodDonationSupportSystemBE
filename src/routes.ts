// route.ts
import { Router } from 'express'
import UserController from './controller/UserController'
import SlotController from './controller/SlotController'
const router = Router()
const userController = new UserController()
const slotController = new SlotController()
// router.post('/login', (req, res) => userController.login(req, res))
router.post('/createSlot', slotController.createSlot)
router.post('/login', slotController.createSlot)
export default router
