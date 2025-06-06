import { Request, Response } from 'express'

import { UserService } from '../services/user.service'
import { User } from '~/models/schemas/user.schema'
import { ResponseHandle } from '~/utils/Response'
class UserController {
  public userService: UserService
  constructor() {
    this.userService = new UserService()
    this.login = this.login.bind(this)
  }
  public async login(req: Request, res: Response): Promise<any> {
    console.log('call login')
    const { email, password } = req.body
    console.log(req.body)
    if (typeof email !== 'string' || email.trim() === '') {
      console.log('No email')
      return res.status(400).json({ msg: 'Email is required' })
    }
    if (typeof password !== 'string' || password.trim() === '') {
      console.log('No Password')
      return res.status(400).json({ msg: 'Pass is required' })
    }
    try {
      const credentials: User = {
        email,
        password
      }
      const result = await this.userService.authUser(credentials)
      if (!result.success) {
        // Trả về lỗi với message rõ ràng
        return ResponseHandle.responseError(res, null, result.message, result.statusCode || 400)
      }
      return ResponseHandle.responseSuccess(res, result)
    } catch (error) {
      console.error('Login error:', error)
      return ResponseHandle.responseError(res, error, 'login fail', 400)
    }
  }
}

export default UserController
