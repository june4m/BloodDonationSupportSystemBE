import { Router } from 'express'
import SlotController from '~/controller/SlotController'
import UserController from '~/controller/UserController'
import { verifyToken } from '~/midleware/auth.midleware'
import { authorize } from '~/midleware/authorization.midleware'
import { body } from 'express-validator'
import AppointmentController from '~/controller/AppointmentControler'
// const appointmentController = new AppointmentController()

const router = Router()
const userController = new UserController()
const slotController = new SlotController()

router.post('/signup', userController.register)
router.post('/login',
    body('email').isEmail().withMessage('Email không hợp lệ'),
    body('password').notEmpty().withMessage('Password là bắt buộc'),
     userController.login)


router.post('/logout',
     verifyToken,
     userController.logout)

router.get('/getMe', verifyToken, userController.getMe)
// lấy danh sách slot
router.get('/getSlotList', 
    slotController.getSlotList)


//member đăng kí slot
router.post('/registerSlot',
     slotController.registerDonationBlood)


// router.post('/getAppointmentList',
//      authorize (['staff']),
//      appointmentController.getAppointmentList)

router.post('/createSlot',
    verifyToken,
    authorize(['admin']),
    slotController.createSlot)

router.post('/appointments/confirm', AppointmentController.confirmAppointment)
router.get('/appointments/history', verifyToken, AppointmentController.getHistory)
router.get('/appointments/list', AppointmentController.getAllAppointments)
router.get('/getAllAppointments', AppointmentController.getAllAppointments)

router.post('/updateUser', verifyToken, userController.editProfile)

router.get('/bloodtypes', userController.getBloodTypes)

export default router