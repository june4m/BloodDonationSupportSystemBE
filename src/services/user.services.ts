import { User, Auth } from '~/models/schemas/user.schema'
import { UserRepository } from '~/repository/user.repository'
import { USERS_MESSAGES } from '~/constant/message'
export class UserService {
  public userRepository: UserRepository

  constructor() {
    this.userRepository = new UserRepository()
  }

  async authUser(credentials: User): Promise<Auth> {
    try {
      const loginIdKey = 'user_id'
      const passwordKey = 'password'
      const user_name = 'user_name'
      const user = await this.findUserLogin(credentials.email)

      if (!user) {
        return {
          success: false,
          message: USERS_MESSAGES.EMAIL_OR_PASSWORD_IS_INCORRECT,
          statusCode: 400
        }
      }
      if (!user.password) {
        return {
          success: false,
          message: USERS_MESSAGES.EMAIL_OR_PASSWORD_IS_INCORRECT,
          statusCode: 400
        }
      }

      const isPasswordValid = credentials.password.trim() === user.password.trim()

      if (!isPasswordValid) {
        return {
          success: false,
          message: USERS_MESSAGES.EMAIL_OR_PASSWORD_IS_INCORRECT,
          statusCode: 400
        }
      }
      return {
        success: true,
        message: USERS_MESSAGES.LOGIN_SUCCESS,
        statusCode: 200,
        data: {
          user_id: user.user_id,
          user_email: user.email,
          user_name: user.user_name,
          user_role: user.user_role
        }
      }
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  async findUserLogin(
    email: string
  ): Promise<{ user_id: string; email: string; password: string; user_name: string; user_role: string } | null> {
    const users = await this.userRepository.findByEmail(email)
    if (Array.isArray(users) && users.length > 0) {
      const user = users[0]
      return {
        user_id: user.User_ID,
        email: user.Email,
        password: user.Password,
        user_name: user.User_name,
        user_role: user.Account_Role_ID
      }
    }
    return null
  }
  async checkEmailExists(email: string) {
    const users = await this.userRepository.findByEmail(email)
    return Array.isArray(users) && users.length > 0
  }
}
