import { Request, Response } from 'express'
import { RegisterReqBody } from '~/models/schemas/requests/user.requests'
import { ResponseHandle } from '~/utils/Response'
import bcrypt from 'bcrypt'
import { AdminService } from '~/services/admin.services'
import { USERS_MESSAGES } from '~/constant/message'

class AdminController {
  public adminService: AdminService
  constructor() {
    this.adminService = new AdminService()
    this.signupStaffAccount = this.signupStaffAccount.bind(this)
    this.updateUserRole = this.updateUserRole.bind(this)
  }

  public async signupStaffAccount(req: Request<{}, {}, RegisterReqBody>, res: Response): Promise<void> {
    try {
      const { email, password, confirm_password, name, date_of_birth } = req.body
      if (!email || !password || !confirm_password || !name || !date_of_birth) {
        ResponseHandle.responseError(res, null, 'Email and password are required', 400)
        return
      }
      if (password !== confirm_password) {
        res.status(400).json({ message: 'Passwords do not match' })
        return
      }
      const hashedPassword = await bcrypt.hash(password, 10) // Mã hóa password
      const result = await this.adminService.signupStaffAccount({
        email,
        password: hashedPassword,
        name,
        date_of_birth
      })
      ResponseHandle.responseSuccess(res, result, 'Staff account registered successfully', 201)
    } catch (error: any) {
      if (error.message === USERS_MESSAGES.EMAIL_HAS_BEEN_USED) {
        ResponseHandle.responseError(res, error, 'Email has already been used', 400)
      } else {
        ResponseHandle.responseError(res, error, 'Staff registration failed', 500)
      }
    }
  }

  public async updateUserRole(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params
      const { newRole } = req.body

      if (!newRole || !['member', 'staff', 'admin'].includes(newRole)) {
        ResponseHandle.responseError(res, null, 'Invalid role provided', 400)
        return
      }

      const result = await this.adminService.updateUserRole(userId, newRole)

      if (result) {
        ResponseHandle.responseSuccess(res, result, 'User role updated successfully', 200)
      } else {
        ResponseHandle.responseError(res, null, 'User not found', 404)
      }
    } catch (error) {
      console.error('Error updating role:', error)
      ResponseHandle.responseError(res, error, 'Failed to update role', 500)
    }
  }
}

export default AdminController
