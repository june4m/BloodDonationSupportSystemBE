import { USERS_MESSAGES } from '~/constant/message'
import { RegisterReqBody } from '~/models/schemas/requests/user.requests'
import { User, Users } from '~/models/schemas/user.schema'
import AdminRepository from '~/repository/admin.repository'

export class AdminService {
  public adminRepository: AdminRepository

  constructor() {
    this.adminRepository = new AdminRepository()
  }

  async findUserLogin(email: string): Promise<User | null> {
    console.log('findUserLogin AdminService')
    const users = await this.adminRepository.findByEmail(email)
    if (Array.isArray(users) && users.length > 0) {
      const user = users[0]
      return {
        email: user.email,
        password: user.password,
        user_id: user.user_id,
        user_name: user.user_name,
        user_role: user.user_role || 'staff'
      } as User
    }
    return null
  }

  public async signupStaffAccount(
    body: Pick<RegisterReqBody, 'email' | 'password' | 'name' | 'date_of_birth' | 'bloodType_id'>
  ): Promise<User> {
    console.log('signupStaffAccount AdminService')
    const { email, password, name, date_of_birth, bloodType_id } = body
    console.log('email, password, confirm_password, name, date_of_birth')

    if (!(email && password && name && date_of_birth)) {
      throw new Error(USERS_MESSAGES.VALIDATION_ERROR)
    }

    const existing = await this.findUserLogin(email.toLowerCase())

    if (existing) {
      throw new Error(USERS_MESSAGES.EMAIL_HAS_BEEN_USED)
    }

    const newUser = await this.adminRepository.createStaffAccount({
      email,
      password,
      name,
      date_of_birth,
      bloodType_id
    })
    return newUser
  }

  public async updateUserRole(userId: string, newRole: string): Promise<any> {
    try {
      const user = await this.adminRepository.findById(userId)

      if (!user) {
        throw new Error('User not found')
      }

      const updatedUser = await this.adminRepository.updateUserRole(userId, newRole)
      return updatedUser
    } catch (error) {
      throw error
    }
  }
  public async getAllUserList(): Promise<Users[]> {
    try {
      const users = await this.adminRepository.getAllUsers()
      return users;
    } catch (error) {
      throw new Error('Failed to get user list')
    }
  }
  public async bannedUser(userId: string): Promise<any>{
    try {
      const result = await this.adminRepository.bannedUser(userId);
      return result;

    } catch (error) {
      throw new Error('Failed to ban user');
    }
  }
  public async unbanUser(userId: string):Promise<any>{
    try {
      const result = await this.adminRepository.unbanUser(userId);
      return result;
    } catch (error) {
      throw new Error('Failed to unban user');

    }
  }
}
