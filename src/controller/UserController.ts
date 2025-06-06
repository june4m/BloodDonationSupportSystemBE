import { Request, Response } from 'express'
import { UserService } from '../services/user.service'
import { User } from '~/models/schemas/user.schema'
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
      return res.status(200).json({ msg: 'Login successful (mocked)' })
    } catch (error) {
      console.error('Login error:', error)
      res.status(400).json({
        msg: 'User already exists'
      })
      return res.status(500).json({ msg: 'Server error' })
    }
  }
}

export default UserController
