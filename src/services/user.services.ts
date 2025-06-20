import { User, Auth, LoginCredentials, UpdateUserFields } from '~/models/schemas/user.schema'
import { UserRepository } from '~/repository/user.repository'
import { USERS_MESSAGES } from '~/constant/message'
import { UserPayload } from '~/middleware/authMiddleware'
export class UserService {
  public userRepository: UserRepository

  constructor() {
    this.userRepository = new UserRepository()
  }

  async authUser(credentials: LoginCredentials): Promise<Auth> {
    try {
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
        user_name: user.User_Name,
        user_role: user.User_Role
      }
    }
    return null
  }

  async checkEmailExists(email: string) {
    const users = await this.userRepository.findByEmail(email)
    return Array.isArray(users) && users.length > 0
  }

  public async editProfileService(
    currentUser: UserPayload,
    targetUserId: string,
    updateData: any
  ): Promise<{ message: string }> {
    const targetUser = await this.userRepository.findById(targetUserId)
    if (!targetUser) {
      throw { statusCode: 404, message: 'User not found' }
    }

    const updateFields: UpdateUserFields = {}

    if (currentUser.user_role === 'admin') {
      if (updateData.User_Name) updateFields.User_Name = updateData.User_Name
      if (updateData.YOB) updateFields.YOB = updateData.YOB
      if (updateData.Address) updateFields.Address = updateData.Address
      if (updateData.Phone) updateFields.Phone = updateData.Phone
      if (updateData.Gender) updateFields.Gender = updateData.Gender
      if (updateData.BloodType_ID) updateFields.BloodType_ID = updateData.BloodType_ID
      if (updateData.User_Role) updateFields.User_Role = updateData.User_Role
    } else if (currentUser.user_role === 'staff') {
      if (targetUser.User_Role !== 'member') {
        throw { statusCode: 403, message: 'Staff is only updated for Members' }
      }
      if (updateData.BloodType_ID) {
        updateFields.BloodType_ID = updateData.BloodType_ID
      } else {
        throw { statusCode: 400, message: 'Staff can only update BloodType_ID' }
      }
    } else if (currentUser.user_role === 'member') {
      if (currentUser.user_id !== targetUserId) {
        throw { statusCode: 403, message: 'Members can only edit themselves' }
      }
      if (updateData.User_Name) updateFields.User_Name = updateData.User_Name
      if (updateData.YOB) updateFields.YOB = updateData.YOB
      if (updateData.Address) updateFields.Address = updateData.Address
      if (updateData.Phone) updateFields.Phone = updateData.Phone
      if (updateData.Gender) updateFields.Gender = updateData.Gender
    } else {
      throw { statusCode: 403, message: 'Invalid Role' }
    }

    if (Object.keys(updateFields).length === 0) {
      throw { statusCode: 400, message: 'No valid data to update' }
    }

    await this.userRepository.updateUserFields(targetUserId, updateFields)
    return { message: 'Update successful' }
  }
}
