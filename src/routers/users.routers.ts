import { Router } from 'express'
import SlotController from '~/controller/SlotController'
import UserController from '~/controller/UserController'
import { verifyToken } from '~/midleware/auth.midleware'
import { authorize } from '~/midleware/authorization.midleware'
import { body } from 'express-validator'
import AppointmentController from '~/controller/AppointmentControler'

const router = Router()
const userController = new UserController()
const slotController = new SlotController()
const appointmentController = new AppointmentController()
// const appointmentController = new AppointmentController()

router.post('/signup', userController.register)
router.post(
  '/login',
  body('email').isEmail().withMessage('Email không hợp lệ'),
  body('password').notEmpty().withMessage('Password là bắt buộc'),
  userController.login
)

router.post('/logout', verifyToken, userController.logout)

router.get('/getMe', verifyToken, userController.getMe)
// lấy danh sách slot
router.get('/getSlotList', slotController.getSlotList)

//member đăng kí slot
router.post('/registerSlot', slotController.registerDonationBlood)

// router.post('/getAppointmentList',
//      authorize (['staff']),
//      appointmentController.getAppointmentList)

router.post('/createSlot', verifyToken, authorize(['admin']), slotController.createSlot)

//router.put('/editProfile', verifyToken, authorize(['member']), userController.editProfile)

//router.get('/getAppointmentById/:appointmentId', appointmentController.getAppointmentById)
router.post('/appointment/:appointmentId/addVolume', appointmentController.updateVolume)
router.get('/appointment', appointmentController.getAppointmentList)

export default router
