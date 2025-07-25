import { Request, response, Response } from 'express'
import { User } from '~/models/schemas/user.schema'
import { UserService } from '~/services/user.services'
import { ResponseHandle } from '~/utils/Response'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import bcrypt from 'bcrypt'
import ms from 'ms'

import { LoginReqBody, RegisterReqBody } from '~/models/schemas/requests/user.requests'
import { signToken } from '~/utils/jwt'
dotenv.config()

class UserController {
  public userService: UserService
  constructor() {
    this.userService = new UserService()
    this.login = this.login.bind(this)
    this.register = this.register.bind(this)
    this.logout = this.logout.bind(this)
    this.editProfile = this.editProfile.bind(this)
    this.getMe = this.getMe.bind(this)
    this.updateProfile = this.updateProfile.bind(this)
    this.confirmBloodByStaff = this.confirmBloodByStaff.bind(this)
    this.addPotential = this.addPotential.bind(this)
    this.updatePotentialStatus = this.updatePotentialStatus.bind(this)
    this.getAllPotential = this.getAllPotential.bind(this)
  }
  public async login(req: Request<{}, {}, LoginReqBody>, res: Response): Promise<any> {
    console.log('Call Login')
    const { email, password } = req.body
    console.log(req.body)

    if (typeof email !== 'string' || email.trim() === '') {
      console.log('No Email')
      return res.status(400).json({ msg: 'Email is required!' })
    }
    if (typeof password !== 'string' || password.trim() === '') {
      console.log('No Password')
      return res.status(400).json({ msg: 'Pass is required!' })
    }
    try {
      const credentials: Partial<User> = {
        email,
        password
      }
      const user = await this.userService.findUserLogin(email)
      if (!user) {
        return ResponseHandle.responseError(res, null, 'Không tìm thấy tài khoản', 404)
      }
      if (user.isDelete === false) {
        return ResponseHandle.responseError(res, null, 'Tài khoản của bạn đã bị khóa', 403)
      }
      const result = await this.userService.authUser(credentials as User)
      if (!result.success) {
        // Trả về lỗi với message rõ ràng
        return ResponseHandle.responseError(res, null, result.message, result.statusCode || 400)
      }

      //
      const payload = {
        user_id: result.data?.user_id,
        user_name: result.data?.user_name as string,
        user_role: result.data?.user_role,
        token_type: 'access_token'
      }
      const expiresIn = process.env.ACCESS_TOKEN_EXPIRE_IN
      const secret = (process.env.JWT_SECRET_ACCESS_TOKEN || process.env.JWT_SECRET) as string

      const token = await signToken({
        payload,
        privateKey: secret,
        options: { algorithm: 'HS256', expiresIn }
      })
      console.log('token: ', token)
      console.log('userID: ', payload.user_id)
      console.log('userName: ', payload.user_name)
      console.log('user-role: ', payload.user_role)

      const maxAge = typeof expiresIn === 'string' ? ms(expiresIn) : 900000
      res.cookie('token', token, { httpOnly: true, maxAge }) //, secure: false, sameSite: 'lax'
      return ResponseHandle.responseSuccess(
        res,
        {
          user_id: result.data?.user_id,
          user_name: result.data?.user_name,
          user_role: result.data?.user_role
        },
        `Hello, ${payload.user_name}`,
        200
      )
    } catch (error) {
      console.error('Login error:', error)
      return ResponseHandle.responseError(res, error, 'Login Fail', 500)
    }
  }

  public async register(req: Request<{}, {}, RegisterReqBody>, res: Response): Promise<void> {
    try {
      const { email, password, confirm_password, name, date_of_birth } = req.body
      if (!email || !password || !confirm_password || !name || !date_of_birth) {
        ResponseHandle.responseError(res, null, 'Email and password are required', 400)
        return
      }
      if (password !== confirm_password) {
        res.status(400).json({ message: 'Passwords do not match' })
        return
      }
      const emailExists = await this.userService.checkEmailExists(email)
      if (emailExists) {
        ResponseHandle.responseError(res, null, 'Email already exists', 400)
        return
      }
      const hashedPassword = await bcrypt.hash(password, 10) // Mã hóa password
      const result = await this.userService.register({
        email,
        password: hashedPassword,
        name,
        date_of_birth
      })
      ResponseHandle.responseSuccess(res, result, 'Registration successful', 201)
    } catch (error) {
      console.error('Register error:', error)
      ResponseHandle.responseError(res, error, 'Registration failed', 500)
    }
  }

  public async logout(req: Request, res: Response): Promise<any> {
    try {
      res.clearCookie('token', { httpOnly: true })
      return ResponseHandle.responseSuccess(res, null, 'Logout Success fully', 200)
    } catch (error) {
      console.error('Logout Error: ', error)
      return ResponseHandle.responseError(res, error, 'Logout failed', 500)
    }
  }

  public async editProfile(req: Request, res: Response): Promise<any> {
    try {
      const userId = req.user?.user_id
      if (!userId) {
        return ResponseHandle.responseError(res, null, 'Unauthorized', 401)
      }
      const { phone, user_name } = req.body
      const updates: Partial<User> = {}
      if (phone) updates.phone = phone
      if (user_name) updates.user_name = user_name

      // // Nếu có bloodtype_id thì gọi hàm updateBloodType riêng
      // if (bloodtype_id) {
      //   const updatedUser = await this.userService.updateBloodType(userId, bloodtype_id)
      //   return ResponseHandle.responseSuccess(res, updatedUser, 'Profile updated', 200)
      // }

      if (Object.keys(updates).length === 0) {
        return ResponseHandle.responseError(res, null, 'No fields to update', 400)
      }

      const updatedUser = await this.userService.updateBloodType(userId, updates.bloodtype_id || '') // Sửa lại logic
      return ResponseHandle.responseSuccess(res, updatedUser, 'Profile updated', 200)
    } catch (error) {
      console.error('Edit profile error:', error)
      return ResponseHandle.responseError(res, error, 'Update failed', 500)
    }
  }

  public async updateBloodTypeByStaff(
    req: Request<{ userId: string }, {}, { bloodType_ID: string }>,
    res: Response
  ): Promise<void> {
    try {
      const { userId } = req.params
      const { bloodType_ID } = req.body
      if (!userId || !bloodType_ID) {
        ResponseHandle.responseError(res, null, 'User_ID and BloodType_ID are required', 400)
        return
      }
      const updatedUser = await this.userService.updateBloodType(userId, bloodType_ID)
      ResponseHandle.responseSuccess(res, updatedUser, 'Blood type updated by staff', 200)
    } catch (err: any) {
      ResponseHandle.responseError(res, err, err.message || 'Update failed', 400)
    }
  }

  public async getMe(req: Request, res: Response): Promise<any> {
    try {
      const userId = req.user?.user_id // Lấy user_id từ middleware
      if (!userId) {
        return ResponseHandle.responseError(res, null, 'Unauthorized', 401)
      }

      const user = await this.userService.findById(userId)
      if (!user) {
        return ResponseHandle.responseError(res, null, 'User not found', 404)
      }

      return ResponseHandle.responseSuccess(res, user, 'User information retrieved successfully', 200)
    } catch (error) {
      console.error('GetMe error:', error)
      return ResponseHandle.responseError(res, error, 'Failed to retrieve user information', 500)
    }
  }

  public async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user.user_id
      const { User_Name, YOB, Address, Phone, Gender } = req.body

      const result = await this.userService.updateProfile(userId, { User_Name, YOB, Address, Phone, Gender })

      ResponseHandle.responseSuccess(res, result, 'Profile updated successfully', 200)
    } catch (error: any) {
      ResponseHandle.responseError(res, error, error.message || 'Failed to update profile', 400)
    }
  }

  public async confirmBloodByStaff(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params.userId
      const { bloodType } = req.body

      const result = await this.userService.confirmBloodByStaff(userId, bloodType)
      ResponseHandle.responseSuccess(res, result, 'Blood type confirmed successfully', 200)
    } catch (error: any) {
      ResponseHandle.responseError(res, error, error.message || 'Failed to confirm blood type', 400)
    }
  }

  public async addPotential(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params.userId
      const { Note } = req.body
      const adminId = req.user?.user_id

      if (!userId || !adminId) {
        ResponseHandle.responseError(res, null, 'Missing required fields', 400)
        return
      }

      const result = await this.userService.addPotential({
        User_ID: userId,
        Note,
        Admin_ID: adminId
      })

      if (result.success) {
        ResponseHandle.responseSuccess(res, result.data, result.message, 201)
      } else {
        ResponseHandle.responseError(res, null, result.message, 400)
      }
    } catch (error: any) {
      console.error('addPotential Controller Error:', error)
      ResponseHandle.responseError(res, error, 'Thêm người hiến máu tiềm năng thất bại', 500)
    }
  }

  public async updatePotentialStatus(req: Request, res: Response): Promise<void> {
    try {
      const { potentialId } = req.params
      const { Status } = req.body

      if (!Status) {
        ResponseHandle.responseError(res, null, 'The Status field is required!', 400)
        return
      }

      const result = await this.userService.updatePotentialStatus(potentialId, Status)

      if (result.success) {
        ResponseHandle.responseSuccess(res, result.data, result.message, 200)
      } else {
        ResponseHandle.responseError(res, null, result.message, 400)
      }
    } catch (error: any) {
      console.error('updatePotentialStatus Controller Error:', error)
      ResponseHandle.responseError(res, error, 'Cập nhật trạng thái thất bại', 500)
    }
  }

  public async getAllPotential(req: Request, res: Response): Promise<void> {
    console.log('getAllPotential Controller')
    try {
      const result = await this.userService.getAllPotential()
      console.log('Controller result:', result)

      if (result.success) {
        ResponseHandle.responseSuccess(res, result.data, 'Lấy danh sách người hiến máu tiềm năng thành công!', 200)
      } else {
        ResponseHandle.responseError(res, null, result.message, 404)
      }
    } catch (error: any) {
      console.error('getAllPotential Controller Error:', error)
      ResponseHandle.responseError(res, error, 'Lỗi lấy danh sách người hiến máu tiềm năng!', 500)
    }
  }
}

export default UserController
