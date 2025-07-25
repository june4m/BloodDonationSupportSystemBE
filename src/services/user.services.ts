import { LoginReqBody, RegisterReqBody } from './../models/schemas/requests/user.requests'
import { User, Auth } from '~/models/schemas/user.schema'
import { UserRepository } from '~/repository/user.repository'
import { USERS_MESSAGES } from '~/constant/message'
import { error } from 'console'
import bcrypt from 'bcrypt'
import { body } from 'express-validator'
import { PotentialDonor } from '~/models/schemas/potentialDonor.schema'
export class UserService {
  public userRepository: UserRepository

  constructor() {
    this.userRepository = new UserRepository()
  }

  async authUser(credentials: LoginReqBody): Promise<Auth> {
    try {
      const user = await this.findUserLogin(credentials.email)
      console.log(' authUser: user fetched from DB', user)
      if (!user) {
        return {
          success: false,
          message: USERS_MESSAGES.EMAIL_OR_PASSWORD_IS_INCORRECT,
          statusCode: 400
        }
      }
      console.log(' authUser: stored password', user.password)
      if (!user.password) {
        return {
          success: false,
          message: USERS_MESSAGES.EMAIL_OR_PASSWORD_IS_INCORRECT,
          statusCode: 400
        }
      }

      const stored = user.password!
      let isPasswordValid = false

      // Nếu stored là hash (bcrypt thường bắt đầu bằng “$2b$”)
      if (stored.startsWith('$2')) {
        isPasswordValid = await bcrypt.compare(credentials.password, stored)
      } else {
        // fallback: nếu bạn còn lưu plaintext trong DB
        isPasswordValid = credentials.password === stored
      }

      if (!isPasswordValid) {
        return {
          success: false,
          message: USERS_MESSAGES.EMAIL_OR_PASSWORD_IS_INCORRECT,
          statusCode: 400
        }
      }
      console.log('authUser: isPasswordValid?', isPasswordValid)
      let userRole: 'admin' | 'staff' | 'member' = 'member'
      if (user.user_role && ['admin', 'staff', 'member'].includes(user.user_role)) {
        userRole = user.user_role as 'admin' | 'staff' | 'member'
      }
      return {
        success: true,
        message: USERS_MESSAGES.LOGIN_SUCCESS,
        statusCode: 200,
        data: {
          user_id: user.user_id,
          user_name: user.user_name,
          user_role: userRole
        }
      }
    } catch (error) {
      console.error('Login error:', error)
      return {
        success: false,
        message: 'Internal Server error',
        statusCode: 500
      }
    }
  }

  async findUserLogin(email: string): Promise<User | null> {
    const users = await this.userRepository.findByEmail(email)
    if (Array.isArray(users) && users.length > 0) {
      const user = users[0]
      return {
        email: user.email,
        password: user.password,
        user_id: user.user_id,
        user_name: user.user_name,
        user_role: user.user_role || 'member',
        isDelete: user.isDelete
      } as User
    }
    return null
  }

  async checkEmailExists(email: string) {
    const users = await this.userRepository.findByEmail(email)
    return Array.isArray(users) && users.length > 0
  }
  async updateBloodType(userId: string, bloodType: string): Promise<User> {
    try {
      if (!userId || !bloodType) {
        throw new Error('User_ID and Blood_Type are required')
      }
      const user = await this.userRepository.findById(userId)
      if (!user) throw new Error('User not found')
      const updatedUser = await this.userRepository.updateBloodType(userId, bloodType)
      return updatedUser
    } catch (error) {
      console.error('Error updating blood type:', error)
      throw error
    }
  }

  public async register(body: Pick<RegisterReqBody, 'email' | 'password' | 'name' | 'date_of_birth'>): Promise<User> {
    const { email, password, name, date_of_birth } = body

    if (!(email && password && name && date_of_birth)) {
      throw new Error(USERS_MESSAGES.VALIDATION_ERROR)
    }

    const existing = await this.findUserLogin(email.toLowerCase())

    if (existing) {
      throw new Error(USERS_MESSAGES.EMAIL_HAS_BEEN_USED)
    }

    const newUser = await this.userRepository.createAccount({
      email,
      password,
      name,
      date_of_birth
    })
    return newUser
  }

  public async findById(userId: string): Promise<User | null> {
    return await this.userRepository.findById(userId)
  }

  async updateProfile(
    userId: string,
    data: { User_Name?: string; YOB?: string; Address?: string; Phone?: string; Gender?: string }
  ): Promise<any> {
    if (!userId) {
      throw new Error('User ID is required')
    }

    const user = await this.userRepository.findById(userId)
    if (!user) {
      throw new Error('User not found')
    }

    const { User_Name, YOB, Address, Phone, Gender } = data
    if (!User_Name && !YOB && !Address && !Phone && !Gender) {
      throw new Error('At least one field must be provided for update')
    }

    const result = await this.userRepository.updateUserProfile(userId, { User_Name, YOB, Address, Phone, Gender })
    return result
  }

  async confirmBloodByStaff(userId: string, bloodTypeInput: string): Promise<any> {
    if (!userId || !bloodTypeInput) {
      throw new Error('User ID and Blood Type are required')
    }

    // Tách nhóm máu và RhFactor
    const bloodTypeInputClean = bloodTypeInput.replace(/\s+/g, '').toUpperCase()
    const bloodGroup = bloodTypeInputClean.slice(0, -1)
    const rhFactor = bloodTypeInputClean.slice(-1)
    console.log('bloodGroup: ', bloodGroup)
    console.log('rhFactor: ', rhFactor)

    const validGroups = new Set(['A', 'B', 'AB', 'O'])
    const validRh = new Set(['+', '-'])
    if (!validGroups.has(bloodGroup) || !validRh.has(rhFactor)) {
      throw new Error('Nhóm máu nhập vào không hợp lệ!')
    }

    const bloodType = await this.userRepository.findBloodTypeByGroupAndRh(bloodGroup, rhFactor)
    if (!bloodType) {
      throw new Error('Invalid Blood Type provided')
    }

    const result = await this.userRepository.updateUserBloodType(userId, bloodType.BloodType_ID)
    return result
  }

  public async addPotential(potentialData: Omit<PotentialDonor, 'Potential_ID' | 'Status'>): Promise<any> {
    try {
      if (!potentialData.User_ID || !potentialData.Admin_ID) {
        throw new Error('Missing required fields')
      }

      const isDuplicate = await this.userRepository.checkDuplicatePotential(potentialData.User_ID)
      if (isDuplicate) {
        throw new Error('Người dùng này đã tồn tại trong danh sách người hiến tiềm năng và chưa bị từ chối.')
      }

      const insertResult = await this.userRepository.addPotential({
        Potential_ID: '',
        ...potentialData
      })
      console.log('insertResult: ', insertResult)

      return { success: true, data: insertResult, message: 'Thêm người hiến máu tiềm năng thành công!' }
    } catch (error: any) {
      console.error('addPotential Service Error:', error)
      return { success: false, message: error.message }
    }
  }

  public async updatePotentialStatus(potentialId: string, newStatus: string): Promise<any> {
    try {
      if (!potentialId || !newStatus) {
        throw new Error('Missing required fields')
      }

      const allowedStatuses = ['Approved', 'Rejected']
      if (!allowedStatuses.includes(newStatus)) {
        throw new Error('Chỉ được cập nhật thành Approved hoặc Rejected')
      }

      const potential = await this.userRepository.getPotentialById(potentialId)
      console.log('potential: ', potential)

      if (!potential) {
        throw new Error('Không tìm người hiến tiềm năng cần cập nhật')
      }

      const result = await this.userRepository.updatePotentialStatus(potentialId, newStatus)
      return { success: true, data: result, message: 'Cập nhật trạng thái thành công!' }
    } catch (error: any) {
      console.error('updatePotentialStatus Service Error:', error)
      return { success: false, message: error.message }
    }
  }

  public async getAllPotential(): Promise<any> {
    console.log('getAllPotential Service')
    try {
      const list = await this.userRepository.getAllPotential()
      console.log('list:', list)

      if (!list || list.length === 0) {
        return { success: false, message: 'Không có người hiến máu tiềm năng nào.' }
      }

      return { success: true, data: list }
    } catch (error: any) {
      console.error('getAllPotential Service Error:', error)
      return { success: false, message: error.message }
    }
  }
}
