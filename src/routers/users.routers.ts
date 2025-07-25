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
import BlogController from '~/controller/BlogController'
const router = Router()
const userController = new UserController()
const slotController = new SlotController()
const appointmentController = new AppointmentController()
const staffController = new StaffController()
const adminController = new AdminController()
const patientController = new PatientController()
const blogController = new BlogController()
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

router.put('/profile', verifyToken, authorize(['member', 'staff']), userController.updateProfile)

router.put(
  '/users/:userId/confirmBloodTypeByStaff',
  verifyToken,
  authorize(['staff']),
  userController.confirmBloodByStaff
)

router.put('/profile/updateRole/:userId', verifyToken, authorize(['admin']), adminController.updateUserRole)

router.post(
  '/patientDetail/:appointmentId/patient',
  verifyToken,
  authorize(['staff']),
  patientController.addPatientDetail
)

router.post(
  '/patientDetailV2/:appointmentId/patient',
  verifyToken,
  authorize(['staff']),
  patientController.addPatientDetailV2
)

router.get('/patientDetail/latest/:userId', verifyToken, authorize(['staff']), patientController.getLatestPatientDetail)
router.get('/patientDetail/all', verifyToken, authorize(['member']), patientController.getAllPatientDetails)

router.get(
  '/patientDetail/:appointmentId',
  verifyToken,
  authorize(['member', 'staff']),
  patientController.getPatientDetailsByAppointmentId
)

router.put(
  '/patientDetail/:appointmentId/update',
  verifyToken,
  authorize(['staff']),
  patientController.updatePatientDetail
)

router.put('/appointment/:appointmentId/status', verifyToken, authorize(['staff']), appointmentController.updateStatus)

router.put(
  '/appointment/:appointmentId/reject',
  verifyToken,
  authorize(['staff']),
  appointmentController.rejectAppointment
)

router.get(
  '/appointment/details',
  verifyToken,
  authorize(['member']),
  appointmentController.getAppointmentDetailsByUserId
)

router.put(
  '/appointment/:appointmentId/cancelByMember',
  verifyToken,
  authorize(['member']),
  appointmentController.cancelAppointmentForMember
)

router.post('/requestEmergencyBlood', verifyToken, authorize(['member']), staffController.createEmergencyRequest)
router.get('/getEmergencyRequestList', verifyToken, authorize(['staff']), staffController.getAllEmergencyRequests)

router.post(
  '/handleEmergencyRequest/:emergencyId',
  verifyToken,
  authorize(['staff']),
  staffController.handleEmergencyRequest
)

router.get('/getBloodBank', verifyToken, authorize(['staff', 'admin']), staffController.getBloodBank)

router.get('/blogs', blogController.getBlogs)
router.get('/blogs/:blogId', blogController.getBlogById)
router.post('/blogs/create', verifyToken, authorize(['admin']), blogController.createBlog)
router.put('/blogs/:blogId', verifyToken, authorize(['admin']), blogController.updateBlog)
router.delete('/blogs/:blogId', verifyToken, authorize(['admin']), blogController.deleteBlog)

router.get('/getProfileER/:userId', verifyToken, authorize(['staff']), staffController.getProfileRequesterById)

router.get(
  '/getPotentialDonorPlus/:emergencyId',
  verifyToken,
  authorize(['staff']),
  staffController.getPotentialDonorCriteria
)
router.post(
  '/sendEmergencyEmail/:donorEmail/:donorName',
  verifyToken,
  authorize(['staff']),
  staffController.sendEmergencyEmailFixed
)

router.put(
  '/updateEmergencyRequest/:emergencyId/:potentialId',
  verifyToken,
  authorize(['staff']),
  staffController.assignPotentialToEmergency
)

router.put(
  '/rejectEmergency/:emergencyId/reject',
  verifyToken,
  authorize(['staff']),
  staffController.rejectEmergencyRequest
)

router.put(
  '/cancelEmergencyByMember/:emergencyId/cancel',
  verifyToken,
  authorize(['member']),
  staffController.cancelEmergencyRequestByMember
)
router.get(
  '/getInfoEmergencyRequestsByMember',
  verifyToken,
  authorize(['member']),
  staffController.getInfoEmergencyRequestsByMember
)

router.get('/getAllUsers', verifyToken, authorize(['admin']), adminController.getAllUserList)
router.put('/unbanUser/:userId', verifyToken, authorize(['admin']), adminController.unbanUser)

router.put('/bannedUser/:userId', verifyToken, authorize(['admin']), adminController.bannedUser)

router.get('/users/member', verifyToken, authorize(['admin', 'staff']), staffController.getAllActiveMembers)
router.post('/potential/:userId', verifyToken, authorize(['admin']), userController.addPotential)
router.put(
  '/potential/:potentialId/status',
  verifyToken,
  authorize(['staff', 'admin']),
  userController.updatePotentialStatus
)
router.get('/potential', verifyToken, authorize(['staff', 'admin']), userController.getAllPotential)

router.post('/createReport', verifyToken, authorize(['staff']), staffController.createReport)
router.get('/getLatestReport', verifyToken, authorize(['staff']), staffController.getLatestReport)
router.put(
  '/updateReport/:summaryBlood_Id/:Report_Detail_ID',
  verifyToken,
  authorize(['staff']),
  staffController.updateReport
)
router.get('/getAllBloodUnit', verifyToken, authorize(['staff', 'admin']), staffController.getAllBloodUnit)

router.post('/createBloodUnit', verifyToken, authorize(['staff']), staffController.createBloodUnit)

router.put('/updateBloodUnit/:BloodUnit_ID', verifyToken, authorize(['staff']), staffController.updateBloodUnit)

router.get('/getAllReports', verifyToken, authorize(['admin']), adminController.getAllReport)

export default router
