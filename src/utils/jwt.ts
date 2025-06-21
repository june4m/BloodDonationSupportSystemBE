//File này lưu hàm dùng để tạo ra 1 token
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import { resolve } from 'path'
import { TokenPayLoad } from '~/models/schemas/requests/user.requests'

dotenv.config()
export const signToken = ({
  payload,
  privateKey,
  options = { algorithm: 'HS256',expiresIn: process.env.ACCESS_TOKEN_EXPIRE_IN  }
}: {
  payload: string | Buffer | object
  privateKey: string
  options?: jwt.SignOptions
}) => {
  return new Promise<string>((resolve, reject) => {
    jwt.sign(payload, privateKey, options, (error, token) => {
      if (error) throw reject(error)
      else return resolve(token!)
    })
  })
}

//hàm kiểm tra token có khớp chữ ký không và trả về payload của token đó
export const verifyToken = ({ token, privateKey }: { token: string; privateKey: string }) => {
  return new Promise<TokenPayLoad>((resolve, reject) => {
    jwt.verify(token, privateKey, (error, decode) => {
      if (error) throw reject(error)
      else return resolve(decode as TokenPayLoad)
    })
  })
}
