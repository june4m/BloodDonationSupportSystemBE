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

      const user = await this.findUserLogin(credentials.email)

      if (!user) {
        return {
          success: false,
          message: USERS_MESSAGES.EMAIL_OR_PASSWORD_IS_INCORRECT
        }
      }
      if (!user.password) {
        return {
          success: false,
          message: USERS_MESSAGES.EMAIL_OR_PASSWORD_IS_INCORRECT
        }
      }
      return {
        success: true,
        message: USERS_MESSAGES.LOGIN_SUCCESS
      }
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  async findUserLogin(email: string): Promise<User> {
    const user = await this.userRepository.findByEmail(email)
    return user
  }
}
