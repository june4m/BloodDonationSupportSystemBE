import { Router } from 'express'
import SlotController from '~/controller/SlotController'
import UserController from '~/controller/UserController'
import { verifyToken } from '~/midleware/auth.midleware'
import { authorize } from '~/midleware/authorization.midleware'
import { body } from 'express-validator'
const router = Router()
const userController = new UserController()
const slotController = new SlotController()

router.post('/login',
    body('email').isEmail().withMessage('Email không hợp lệ'),
    body('password').notEmpty().withMessage('Password là bắt buộc'),
     userController.login)


router.post('/logout',
     verifyToken,
     userController.logout)


// lấy danh sách slot
router.get('/getSlotList', 
    slotController.getSlotList)


//member đăng kí slot
router.post('/registerSlot',
    authorize(['member']),
     slotController.registerDonationBlood)



router.post('/createSlot',
    verifyToken,
    authorize(['admin']),
    slotController.createSlot)

    
export default router
