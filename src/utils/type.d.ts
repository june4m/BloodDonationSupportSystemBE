import { Request } from 'express'
import { TokenPayLoad } from './models/schemas/requests/user.requests'
import { JwtPayload } from 'jsonwebtoken'
import { UserPayload } from './middleware/authenticateJWT'

declare module 'express' {
  interface Request {
    decode_authorization?: TokenPayLoad
    decode_refresh_token?: TokenPayLoad
    decode_email_verify_token?: TokenPayLoad
    decode_forgot_password_token?: TokenPayLoad
    user?: UserPayload
  }
}
