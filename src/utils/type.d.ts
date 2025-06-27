import { Request } from 'express'
import { TokenPayLoad } from './models/schemas/requests/user.requests'
import { JwtPayload } from 'jsonwebtoken'
declare module 'express-serve-static-core' {
  interface Request {
    decode_authorization?: TokenPayLoad
    decode_refresh_token?: TokenPayLoad
    decode_email_verify_token?: TokenPayLoad
    decode_forgot_password_token?: TokenPayLoad
    user?: JwtPayload & TokenPayLoad;
  }
}
