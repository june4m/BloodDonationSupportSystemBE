export interface User {
  email: string
  password: string
}

export interface Auth {
  success: boolean
  message: string

  data?: {
    user: User
  }
}
