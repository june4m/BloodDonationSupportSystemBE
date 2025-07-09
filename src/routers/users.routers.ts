import { Router } from 'express'
import SlotController from '~/controller/SlotController'
import UserController from '~/controller/UserController'
import { verifyToken } from '~/midleware/auth.midleware'
import { authorize } from '~/midleware/authorization.midleware'
import { body } from 'express-validator'
import AppointmentController from '~/controller/AppointmentControler'
import StaffController from '~/controller/StaffController'
import AdminController from '~/controller/AdminController'
import { PatientController } from '~/controller/PatientController'
const router = Router()
const userController = new UserController()
const slotController = new SlotController()
const appointmentController = new AppointmentController()
const staffController = new StaffController()
const adminController = new AdminController()
const patientController = new PatientController()
// const appointmentController = new AppointmentController()

router.post('/signup/staff', verifyToken, authorize(['admin']), adminController.signupStaffAccount)

router.post('/signup', userController.register)

router.post('/login', userController.login)

router.post('/logout', verifyToken, userController.logout)

router.get('/getMe', verifyToken, userController.getMe)
// lấy danh sách slot
router.get('/getSlotList', slotController.getSlotList)

//member đăng kí slot
router.post('/registerSlot', verifyToken, authorize(['member']), slotController.registerDonationBlood)

// router.post('/getAppointmentList',
//      authorize (['staff']),
//      appointmentController.getAppointmentList)

router.post('/createSlot', verifyToken, authorize(['admin']), slotController.createSlot)

// danh sach tiem nam
router.get('/getPotentialDonorList', verifyToken, authorize(['staff']), staffController.getPotentialList)

router.get('/getMemberList', verifyToken, authorize(['staff']), staffController.getMemberList)

router.post('/addMemberToPotentialList', verifyToken, authorize(['staff']), staffController.addMemberToPotentialList)

router.post(
  '/appointment/:appointmentId/addVolume',
  verifyToken,
  authorize(['staff']),
  appointmentController.updateVolume
)

router.get('/appointment', verifyToken, authorize(['staff']), appointmentController.getAppointmentList)

router.put('/profile', verifyToken, authorize(['member']), userController.updateProfile)

router.put(
  '/users/:userId/confirmBloodTypeByStaff',
  verifyToken,
  authorize(['staff']),
  userController.confirmBloodByStaff
)

router.put('/profile/updateRole/:userId', verifyToken, authorize(['admin']), adminController.updateUserRole)

router.post('/patientDetail', verifyToken, authorize(['staff']), patientController.addPatientDetail)

router.post('/patientDetail/:appointmentId', verifyToken, authorize(['staff']), patientController.addPatientDetail)

export default router
