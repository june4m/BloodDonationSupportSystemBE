import { Request, Response } from 'express'
import { User } from '~/models/schemas/user.schema'
import { UserService } from '~/services/user.services'
import { ResponseHandle } from '~/utils/Response'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import { error } from 'console'
import ms from 'ms'
import { RegisterReqBody } from '~/models/schemas/requests/user.requests'
dotenv.config()

class UserController {
  public userService: UserService
  constructor() {
    this.userService = new UserService()
    this.login = this.login.bind(this)
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
      const credentials: User = {
        email,
        password,
      }
      const result = await this.userService.authUser(credentials)
      if (!result.success) {
        // Trả về lỗi với message rõ ràng
        return ResponseHandle.responseError(res, null, result.message, result.statusCode || 400)
      }

      //
      const payload = {
<<<<<<< HEAD
        user_id: result.data?.user_id || email,
        token_type: 'access_token'
      }
      const expiresIn = process.env.ACCESS_TOKEN_EXPIRE_IN
      const secret = (process.env.JWT_SECRET_ACCESS_TOKEN || process.env.JWT_SECRET) as string

      // const token = jwt.sign(payload,secret,{expiresIn})
      // const maxAge = typeof expiresIn === 'string' ? ms(expiresIn) : 900000;
      // res.cookie('token',token, {httpOnly: true, maxAge})
      return ResponseHandle.responseSuccess(res, { user_id: result.data?.user_id || email })
=======
        user_email: result.data?.user_email || email,
        user_name: (result.data?.user_name) as string,
        token_type: 'access_token',
      };
      const expiresIn = process.env.ACCESS_TOKEN_EXPIRE_IN
      const secret = (process.env.JWT_SECRET_ACCESS_TOKEN || process.env.JWT_SECRET) as string

      const token = jwt.sign(payload,secret,{expiresIn})
      console.log('token: ',token);
      console.log('userEmail', payload.user_email);
      console.log('userName: ', payload.user_name);
      
      
      
      const maxAge = typeof expiresIn === 'string' ? ms(expiresIn) : 900000;
      res.cookie('token',token, {httpOnly: true, maxAge})
      return ResponseHandle.responseSuccess(res,{user_email: result.data?.user_email|| email, user_name: result.data?.user_name ?? name})
>>>>>>> 6f97daf9558934e92470218bec5506078729aa58
    } catch (error) {
      console.error('Login error:', error)
      return ResponseHandle.responseError(res, error, 'Login Fail', 400)
    }
  }

<<<<<<< HEAD
  public async logout(req: Request, res: Response): Promise<any> {
=======
  public async register(req: Request<{},{},RegisterReqBody>, res: Response): Promise<any>{
    try {
      const {email, password} = req.body;
      
    } catch (error) {
      
    }
  }
  public async logout(req: Request, res: Response):Promise<any>{
>>>>>>> 6f97daf9558934e92470218bec5506078729aa58
    try {
      res.clearCookie('token', { httpOnly: true })
      return ResponseHandle.responseSuccess(res, null, 'Logout Success fully', 200)
    } catch (error) {
<<<<<<< HEAD
      console.error('Logout Error: ', error)
      return ResponseHandle.responseError(res, error, 'Logout failed', 500)
=======
      console.error('Logout Error: ', error);
      return ResponseHandle.responseError(res,error,'Logout failed', 500)
>>>>>>> 6f97daf9558934e92470218bec5506078729aa58
    }
  }
  public async editProfile(req: Request, res: Response): Promise<any>{

  }
}

export default UserController
