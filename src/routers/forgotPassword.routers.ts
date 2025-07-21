import express from 'express'
import ForgotPasswordController from '~/controller/ForgotPasswordController'

const router = express.Router()
const forgotPasswordController = new ForgotPasswordController()

/**
 * @route POST /api/forgot-password
 * @desc Gửi mã khôi phục mật khẩu qua email
 * @access Public
 * @body { identifier: string } - email hoặc số điện thoại
 */
router.post('/forgot-password', forgotPasswordController.forgotPassword)

/**
 * @route POST /api/verify-reset-token
 * @desc Xác thực mã khôi phục mật khẩu
 * @access Public
 * @body { token: string } - mã 6 chữ số
 */
router.post('/verify-reset-token', forgotPasswordController.verifyResetToken)

/**
 * @route POST /api/reset-password
 * @desc Khôi phục mật khẩu mới
 * @access Public
 * @body { token: string, new_password: string }
 */
router.post('/reset-password', forgotPasswordController.resetPassword)

export default router
