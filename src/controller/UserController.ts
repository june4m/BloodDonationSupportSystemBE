import { Request, Response } from 'express'
import { LoginCredentials, UpdateUserFields, User } from '~/models/schemas/user.schema'
import { UserService } from '~/services/user.services'
import { ResponseHandle } from '~/utils/Response'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import ms from 'ms'
import { RegisterReqBody } from '~/requests/user.requests'
import { UserRepository } from '~/repository/user.repository'
dotenv.config()

class UserController {
  public userService: UserService
  public userRepository: UserRepository

  constructor() {
    this.userService = new UserService()
    this.userRepository = new UserRepository()
    this.login = this.login.bind(this)
    this.editProfile = this.editProfile.bind(this)
  }

  public async login(req: Request, res: Response): Promise<any> {
    console.log('Call Login')
    const { email, password, name } = req.body
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
      const credentials: LoginCredentials = {
        email,
        password
      }
      const result = await this.userService.authUser(credentials)
      if (!result.success) {
        return ResponseHandle.responseError(res, null, result.message, result.statusCode || 400)
      }
      //
      const payload = {
        user_id: result.data?.user_id,
        user_email: result.data?.user_email || email,
        user_name: result.data?.user_name as string,
        user_role: result.data?.user_role,
        token_type: 'access_token'
      }
      const expiresIn = process.env.ACCESS_TOKEN_EXPIRE_IN
      const secret = (process.env.JWT_SECRET_ACCESS_TOKEN || process.env.JWT_SECRET) as string

      const token = jwt.sign(payload, secret, { expiresIn })
      console.log('token: ', token)
      console.log('userID: ', payload.user_id)
      console.log('userEmail: ', payload.user_email)
      console.log('userName: ', payload.user_name)
      console.log('user-role: ', payload.user_role)

      const maxAge = typeof expiresIn === 'string' ? ms(expiresIn) : 900000
      res.cookie('token', token, { httpOnly: true, maxAge }) //, secure: false, sameSite: 'lax'
      return ResponseHandle.responseSuccess(res, {
        user_id: result.data?.user_id,
        user_email: result.data?.user_email || email,
        user_name: result.data?.user_name ?? name,
        user_role: result.data?.user_role
      })
    } catch (error) {
      console.error('Login error:', error)
      return ResponseHandle.responseError(res, error, 'Login Fail', 400)
    }
  }

  public async register(req: Request<{}, {}, RegisterReqBody>, res: Response): Promise<any> {
    try {
      const { email, password } = req.body
    } catch (error) {}
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
    const { id } = req.params
    const currentUser = req.user
    const updateData = req.body

    if (!currentUser) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    try {
      const result = await this.userService.editProfileService(currentUser, id, updateData)
      return ResponseHandle.responseSuccess(res, null, result.message, 200)
    } catch (error: any) {
      console.error('Edit Profile Error:', error)
      return ResponseHandle.responseError(res, error, error.message || 'Update failed', error.statusCode || 500)
    }
  }
}

export default UserController
