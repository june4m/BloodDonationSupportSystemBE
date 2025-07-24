
export interface User {  
  user_id: string
  user_name: string
  yob?: string
  address?: string
  phone?: string
  gender?: string
  bloodtype_id?: string
  status?: string
  history?: string
  account_status?: string
  email: string
  password: string
  user_role?: 'admin' | 'staff' | 'member',
  isDelete?: boolean
}
export interface Users {  
    User_ID: string
    User_Name: string
    Email: string
    Phone: string
    Gender: string
    YOB: string
    BloodType_ID: string
    Status: string
    User_Role: string
    isDeleted: string
    Donation_Count: string
}
export interface Auth {
  success: boolean
  message?: string
  statusCode?: number
  data?: {
    user_id: string
    user_name: string
    user_role: 'admin' | 'staff' | 'member'
  }
}
export interface CreateReportReqBody {
  staff_id: string;
  title?: string;
  description?: string;
  details: {
    volumeIn?: number;
    volumeOut?: number;
    note?: string;
  }[];
}