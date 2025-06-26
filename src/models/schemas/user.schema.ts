
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
  user_role?: 'admin' | 'staff' | 'member'
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
