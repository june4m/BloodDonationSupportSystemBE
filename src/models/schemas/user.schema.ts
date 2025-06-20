import { JwtPayload } from 'jsonwebtoken'
// export interface User {
//   email: string
//   password: string

// }
export interface User {
  User_ID: string
  User_Name: string
  Email: string
  Password: string
  User_Role: string
  YOB?: Date
  Address?: string
  Phone?: string
  Gender?: string
  BloodType_ID?: string
  Status?: string
  History?: string
  Notification?: string
  Account_Status_ID?: string
  Admin_ID?: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface Auth {
  success: boolean
  message?: string
  statusCode?: number
  data?: {
    user_id: string
    user_email: string
    user_name: string
    user_role: string
  }
}

export interface UpdateUserFields {
  User_Name?: string
  YOB?: Date
  Address?: string
  Phone?: string
  Gender?: string
  BloodType_ID?: string
  User_Role?: string
}
