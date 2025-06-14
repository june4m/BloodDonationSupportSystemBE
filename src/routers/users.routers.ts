import { Router } from 'express'
import SlotController from '~/controller/SlotController'
import UserController from '~/controller/UserController'

const router = Router()
const userController = new UserController()
const slotController = new SlotController()

router.post('/login', (req, res) => userController.login(req, res))
router.post('/logout', (req, res) => userController.logout(req, res))
router.get('/getSlotList', slotController.getSlotList)
router.post('/registerSlot', slotController.registerDonationBlood)
router.post('/createSlot', slotController.createSlot)
export default router
