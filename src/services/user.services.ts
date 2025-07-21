import { LoginReqBody, RegisterReqBody } from './../models/schemas/requests/user.requests'
import { User, Auth } from '~/models/schemas/user.schema'
import { ForgotPasswordRequest, ResetPasswordRequest } from '~/models/schemas/passwordReset.schema'
import { UserRepository } from '~/repository/user.repository'
import { USERS_MESSAGES } from '~/constant/message'
import { error } from 'console'
import bcrypt from 'bcrypt'
import { body } from 'express-validator'
import crypto from 'crypto'
import { sendEmailService } from './email.services'
import { tokenStorage } from '~/utils/tokenStorage'
export class UserService {
  public userRepository: UserRepository

  constructor() {
    this.userRepository = new UserRepository()
  }

  async authUser(credentials: LoginReqBody): Promise<Auth> {
    try {
      const user = await this.findUserLogin(credentials.email)
      console.log(' authUser: user fetched from DB', user)
      if (!user) {
        return {
          success: false,
          message: USERS_MESSAGES.EMAIL_OR_PASSWORD_IS_INCORRECT,
          statusCode: 400
        }
      }
      console.log(' authUser: stored password', user.password)
      if (!user.password) {
        return {
          success: false,
          message: USERS_MESSAGES.EMAIL_OR_PASSWORD_IS_INCORRECT,
          statusCode: 400
        }
      }

      const stored = user.password!
      let isPasswordValid = false

      // Nếu stored là hash (bcrypt thường bắt đầu bằng “$2b$”)
      if (stored.startsWith('$2')) {
        isPasswordValid = await bcrypt.compare(credentials.password, stored)
      } else {
        // fallback: nếu bạn còn lưu plaintext trong DB
        isPasswordValid = credentials.password === stored
      }

      if (!isPasswordValid) {
        return {
          success: false,
          message: USERS_MESSAGES.EMAIL_OR_PASSWORD_IS_INCORRECT,
          statusCode: 400
        }
      }
      console.log('authUser: isPasswordValid?', isPasswordValid)
      let userRole: 'admin' | 'staff' | 'member' = 'member'
      if (user.user_role && ['admin', 'staff', 'member'].includes(user.user_role)) {
        userRole = user.user_role as 'admin' | 'staff' | 'member'
      }
      return {
        success: true,
        message: USERS_MESSAGES.LOGIN_SUCCESS,
        statusCode: 200,
        data: {
          user_id: user.user_id,
          user_name: user.user_name,
          user_role: userRole
        }
      }
    } catch (error) {
      console.error('Login error:', error)
      return {
        success: false,
        message: 'Internal Server error',
        statusCode: 500
      }
    }
  }

  async findUserLogin(email: string): Promise<User | null> {
    const users = await this.userRepository.findByEmail(email)
    if (Array.isArray(users) && users.length > 0) {
      const user = users[0]
      return {
        email: user.email,
        password: user.password,
        user_id: user.user_id,
        user_name: user.user_name,
        user_role: user.user_role || 'member',
        isDelete: user.isDelete,
      } as User
    }
    return null
  }

  async checkEmailExists(email: string) {
    const users = await this.userRepository.findByEmail(email)
    return Array.isArray(users) && users.length > 0
  }
  async updateBloodType(userId: string, bloodType: string): Promise<User> {
    try {
      if (!userId || !bloodType) {
        throw new Error('User_ID and Blood_Type are required')
      }
      const user = await this.userRepository.findById(userId)
      if (!user) throw new Error('User not found')
      const updatedUser = await this.userRepository.updateBloodType(userId, bloodType)
      return updatedUser
    } catch (error) {
      console.error('Error updating blood type:', error)
      throw error
    }
  }

  public async register(body: Pick<RegisterReqBody, 'email' | 'password' | 'name' | 'date_of_birth'>): Promise<User> {
    const { email, password, name, date_of_birth } = body

    if (!(email && password && name && date_of_birth)) {
      throw new Error(USERS_MESSAGES.VALIDATION_ERROR)
    }

    const existing = await this.findUserLogin(email.toLowerCase())

    if (existing) {
      throw new Error(USERS_MESSAGES.EMAIL_HAS_BEEN_USED)
    }

    const newUser = await this.userRepository.createAccount({
      email,
      password,
      name,
      date_of_birth
    })
    return newUser
  }

  public async findById(userId: string): Promise<User | null> {
    return await this.userRepository.findById(userId)
  }

  async updateProfile(
    userId: string,
    data: { User_Name?: string; YOB?: string; Address?: string; Phone?: string; Gender?: string }
  ): Promise<any> {
    if (!userId) {
      throw new Error('User ID is required')
    }

    const user = await this.userRepository.findById(userId)
    if (!user) {
      throw new Error('User not found')
    }

    const { User_Name, YOB, Address, Phone, Gender } = data
    if (!User_Name && !YOB && !Address && !Phone && !Gender) {
      throw new Error('At least one field must be provided for update')
    }

    const result = await this.userRepository.updateUserProfile(userId, { User_Name, YOB, Address, Phone, Gender })
    return result
  }

  async confirmBloodByStaff(userId: string, bloodTypeInput: string): Promise<any> {
    if (!userId || !bloodTypeInput) {
      throw new Error('User ID and Blood Type are required')
    }

    // Tách nhóm máu và RhFactor
    const bloodTypeInputClean = bloodTypeInput.replace(/\s+/g, '').toUpperCase()
    const bloodGroup = bloodTypeInputClean.slice(0, -1)
    const rhFactor = bloodTypeInputClean.slice(-1)
    console.log('bloodGroup: ', bloodGroup)
    console.log('rhFactor: ', rhFactor)

    const validGroups = new Set(['A', 'B', 'AB', 'O'])
    const validRh = new Set(['+', '-'])
    if (!validGroups.has(bloodGroup) || !validRh.has(rhFactor)) {
      throw new Error('Nhóm máu nhập vào không hợp lệ!')
    }

    const bloodType = await this.userRepository.findBloodTypeByGroupAndRh(bloodGroup, rhFactor)
    if (!bloodType) {
      throw new Error('Invalid Blood Type provided')
    }

    const result = await this.userRepository.updateUserBloodType(userId, bloodType.BloodType_ID)
    return result
  }

  // Forgot Password Methods
  async forgotPassword(identifier: string): Promise<{ success: boolean; message: string }> {
    try {
      // Tìm user bằng email hoặc phone
      const user = await this.userRepository.findByEmailOrPhone(identifier)

      if (!user) {
        return {
          success: false,
          message: 'Không tìm thấy tài khoản với email hoặc số điện thoại này'
        }
      }

      // Tạo mã reset token (6 chữ số)
      const resetCode = Math.floor(100000 + Math.random() * 900000).toString()

      // Tạo token hash để lưu vào database (an toàn hơn)
      const hashedToken = crypto.createHash('sha256').update(resetCode).digest('hex')

      // Token hết hạn sau 15 phút
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000)

      // Lưu token vào in-memory storage
      tokenStorage.storeToken(resetCode, user.user_id, user.email, user.user_name, expiresAt)

      // Gửi email với mã reset
      const emailSubject = 'Mã khôi phục mật khẩu - Đại Việt Blood'
      const emailContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #d32f2f;">Khôi phục mật khẩu</h2>
          <p>Xin chào <strong>${user.user_name}</strong>,</p>
          <p>Bạn đã yêu cầu khôi phục mật khẩu cho tài khoản của mình.</p>
          <div style="background-color: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0;">
            <h3 style="color: #d32f2f; margin: 0;">Mã khôi phục của bạn:</h3>
            <div style="font-size: 24px; font-weight: bold; color: #d32f2f; margin: 10px 0; letter-spacing: 3px;">
              ${resetCode}
            </div>
          </div>
          <p><strong>Lưu ý:</strong></p>
          <ul>
            <li>Mã này có hiệu lực trong <strong>15 phút</strong></li>
            <li>Chỉ sử dụng mã này một lần duy nhất</li>
            <li>Không chia sẻ mã này với bất kỳ ai</li>
          </ul>
          <p>Nếu bạn không yêu cầu khôi phục mật khẩu, vui lòng bỏ qua email này.</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
          <p style="color: #666; font-size: 12px;">
            Email này được gửi từ hệ thống Đại Việt Blood.<br>
            Vui lòng không trả lời email này.
          </p>
        </div>
      `

      // Tạm thời bỏ qua gửi email để test, chỉ log mã ra console
      console.log(`RESET CODE for ${user.email}: ${resetCode}`)

      // Uncomment dòng này khi đã cấu hình email
      try {
        await sendEmailService(user.email, emailSubject, emailContent)
        console.log(`Email sent successfully to ${user.email}`)
      } catch (emailError) {
        console.error('Email sending failed, but reset code still valid:', emailError)
        // Vẫn cho phép reset thành công ngay cả khi email gửi lỗi
      }

      return {
        success: true,
        message: 'Mã khôi phục mật khẩu đã được gửi đến email của bạn'
      }

    } catch (error) {
      console.error('Forgot password error:', error)
      return {
        success: false,
        message: 'Có lỗi xảy ra khi gửi mã khôi phục. Vui lòng thử lại sau'
      }
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    try {
      // Tìm token hợp lệ trong memory
      const tokenData = tokenStorage.getValidToken(token)

      if (!tokenData) {
        return {
          success: false,
          message: 'Mã khôi phục không hợp lệ hoặc đã hết hạn'
        }
      }

      // Hash mật khẩu mới
      const saltRounds = 10
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds)

      // Cập nhật mật khẩu
      await this.userRepository.updatePassword(tokenData.userId, hashedPassword)

      // Đánh dấu token đã được sử dụng và xóa khỏi memory
      tokenStorage.deleteToken(token)

      return {
        success: true,
        message: 'Mật khẩu đã được khôi phục thành công'
      }

    } catch (error) {
      console.error('Reset password error:', error)
      return {
        success: false,
        message: 'Có lỗi xảy ra khi khôi phục mật khẩu. Vui lòng thử lại sau'
      }
    }
  }

  async verifyResetToken(token: string): Promise<{ success: boolean; message: string; user?: any }> {
    try {
      const tokenData = tokenStorage.getValidToken(token)

      if (!tokenData) {
        return {
          success: false,
          message: 'Mã khôi phục không hợp lệ hoặc đã hết hạn'
        }
      }

      return {
        success: true,
        message: 'Mã khôi phục hợp lệ',
        user: {
          user_id: tokenData.userId,
          email: tokenData.email,
          user_name: tokenData.userName
        }
      }

    } catch (error) {
      console.error('Verify reset token error:', error)
      return {
        success: false,
        message: 'Có lỗi xảy ra khi xác thực mã khôi phục'
      }
    }
  }

  // Cleanup expired tokens (có thể chạy định kỳ)
  async cleanupExpiredTokens(): Promise<void> {
    try {
      tokenStorage.cleanupExpiredTokens()
    } catch (error) {
      console.error('Cleanup expired tokens error:', error)
    }
  }
}
