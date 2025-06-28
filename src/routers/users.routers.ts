
import { Router } from 'express'
import SlotController from '~/controller/SlotController'
import UserController from '~/controller/UserController'
import { verifyToken } from '~/midleware/auth.midleware'
import { authorize } from '~/midleware/authorization.midleware'
import { body } from 'express-validator'
import StaffController from '~/controller/StaffController'
const router = Router()
const userController = new UserController()
const slotController = new SlotController()
const staffController = new StaffController()
// const appointmentController = new AppointmentController()

router.post('/signup', userController.register)
router.post('/login',
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

router.post('/getPotentialDonorList',
    verifyToken,
    authorize(['staff']),
    staffController.getPotentialList)
export default router
