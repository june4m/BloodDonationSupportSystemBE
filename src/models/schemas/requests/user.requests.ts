import { Appointment } from './../slot.schema';
import { JwtPayload } from 'jsonwebtoken'
import { ParsedQs } from 'qs'
import * as core from 'express-serve-static-core'
export interface RegisterReqBody {
  name: string
  email: string
  password: string
  confirm_password: string
  date_of_birth: string
  bloodType_id?: string
}

export interface LoginReqBody {
  email: string
  password: string
}
export interface TokenPayLoad extends JwtPayload {
  user_id: string
  token_type: TokenPayLoad
}
export interface LogoutReqBody {
  refresh_token: string
}
export interface VerifyEmailReqQuery extends ParsedQs {
  email_verify_token: string
}
export interface VerifyForgotPasswordTokenReqBody {
  forgot_password_token: string
}

export interface ResetPasswordReqBody {
  password: string
  confirm_password: string
  forgot_password_token: string
}
export interface UpdateMeReqBody {
  user_name?: string
  date_of_birth?: string
  bio?: string
  address?: string
  website?: string
  avatarUrl?: string
}
export interface ChangePasswordReqBody {
  old_password: string
  password: string
  confirm_password: string
}
export interface RefreshTokenReqBody {
  refresh_token: string
}
export interface InfoRequesterEmergency{
  User_ID: string;
  User_Name: string;
  BloodGroup: string;
  Date_Of_Birth: string;
  Full_Address: string;               
  Phone: string;
  Email: string;
  Gender: string;
}
export interface PotentialDonorCriteria {
  userId: string;
  userName: string;
  bloodType: string;
  lastDonation: string;  
  address: string;
  potentialId: string;
  email: string;
}
