import { Request, Response } from 'express'
import { UserService } from '~/services/user.services'
import { ResponseHandle } from '~/utils/Response'
import { ForgotPasswordRequest, ResetPasswordRequest } from '~/models/schemas/passwordReset.schema'
import { USERS_MESSAGES } from '~/constant/message'

class ForgotPasswordController {
    private userService: UserService

    constructor() {
        this.userService = new UserService()
        this.forgotPassword = this.forgotPassword.bind(this)
        this.verifyResetToken = this.verifyResetToken.bind(this)
        this.resetPassword = this.resetPassword.bind(this)
    }

    /**
     * Gửi mã khôi phục mật khẩu qua email
     */
    public async forgotPassword(req: Request, res: Response): Promise<void> {
        try {
            const { identifier }: ForgotPasswordRequest = req.body

            // Validate input
            if (!identifier || identifier.trim() === '') {
                ResponseHandle.responseError(
                    res,
                    null,
                    USERS_MESSAGES.FORGOT_PASSWORD_IDENTIFIER_REQUIRED,
                    400
                )
                return
            }

            // Validate email or phone format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            const phoneRegex = /^[0-9]{10,11}$/

            if (!emailRegex.test(identifier) && !phoneRegex.test(identifier)) {
                ResponseHandle.responseError(
                    res,
                    null,
                    USERS_MESSAGES.FORGOT_PASSWORD_IDENTIFIER_INVALID,
                    400
                )
                return
            }

            const result = await this.userService.forgotPassword(identifier)

            if (result.success) {
                ResponseHandle.responseSuccess(res, null, result.message, 200)
            } else {
                ResponseHandle.responseError(res, null, result.message, 400)
            }
        } catch (error: any) {
            console.error('Forgot password controller error:', error)
            ResponseHandle.responseError(
                res,
                error,
                error.message || 'Có lỗi xảy ra khi xử lý yêu cầu khôi phục mật khẩu',
                500
            )
        }
    }

    /**
     * Xác thực mã khôi phục mật khẩu
     */
    public async verifyResetToken(req: Request, res: Response): Promise<void> {
        try {
            const { token } = req.body

            if (!token || token.trim() === '') {
                ResponseHandle.responseError(
                    res,
                    null,
                    USERS_MESSAGES.RESET_TOKEN_REQUIRED,
                    400
                )
                return
            }

            // Validate token format (6 digits)
            if (!/^\d{6}$/.test(token)) {
                ResponseHandle.responseError(
                    res,
                    null,
                    USERS_MESSAGES.RESET_TOKEN_INVALID_FORMAT,
                    400
                )
                return
            }

            const result = await this.userService.verifyResetToken(token)

            if (result.success) {
                ResponseHandle.responseSuccess(res, result.user, result.message, 200)
            } else {
                ResponseHandle.responseError(res, null, result.message, 400)
            }
        } catch (error: any) {
            console.error('Verify reset token controller error:', error)
            ResponseHandle.responseError(
                res,
                error,
                error.message || 'Có lỗi xảy ra khi xác thực mã khôi phục',
                500
            )
        }
    }

    /**
     * Khôi phục mật khẩu mới
     */
    public async resetPassword(req: Request, res: Response): Promise<void> {
        try {
            const { token, new_password }: ResetPasswordRequest = req.body

            // Validate input
            if (!token || token.trim() === '') {
                ResponseHandle.responseError(
                    res,
                    null,
                    USERS_MESSAGES.RESET_TOKEN_REQUIRED,
                    400
                )
                return
            }

            if (!new_password || new_password.trim() === '') {
                ResponseHandle.responseError(
                    res,
                    null,
                    USERS_MESSAGES.NEW_PASSWORD_REQUIRED,
                    400
                )
                return
            }

            // Validate token format (6 digits)
            if (!/^\d{6}$/.test(token)) {
                ResponseHandle.responseError(
                    res,
                    null,
                    USERS_MESSAGES.RESET_TOKEN_INVALID_FORMAT,
                    400
                )
                return
            }

            // Validate password strength
            if (new_password.length < 6) {
                ResponseHandle.responseError(
                    res,
                    null,
                    USERS_MESSAGES.NEW_PASSWORD_TOO_SHORT,
                    400
                )
                return
            }

            const result = await this.userService.resetPassword(token, new_password)

            if (result.success) {
                ResponseHandle.responseSuccess(res, null, result.message, 200)
            } else {
                ResponseHandle.responseError(res, null, result.message, 400)
            }
        } catch (error: any) {
            console.error('Reset password controller error:', error)
            ResponseHandle.responseError(
                res,
                error,
                error.message || 'Có lỗi xảy ra khi khôi phục mật khẩu',
                500
            )
        }
    }
}

export default ForgotPasswordController
