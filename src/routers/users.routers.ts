import { Router } from 'express'
import express from 'express'
import SlotController from '~/controller/SlotController'
import UserController from '~/controller/UserController'
import { authenticateJWT } from '~/middleware/authMiddleware'

const router = express.Router()
const userController = new UserController()
const slotController = new SlotController()

router.post('/login', (req, res) => userController.login(req, res))
router.post('/logout', (req, res) => userController.logout(req, res))
router.get('/getSlotList', slotController.getSlotList)
router.post('/registerSlot', slotController.registerDonationBlood)
router.post('/createSlot', slotController.createSlot)
router.put('/:id', authenticateJWT, userController.editProfile)
export default router
