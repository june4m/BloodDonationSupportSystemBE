import { JwtPayload } from 'jsonwebtoken';
export interface User {
  email: string
  password: string
}

export interface Auth {
  success: boolean
  message?: string
  statusCode?: number
  data?:{
    user_email: string
    user_name: string
  }
}

