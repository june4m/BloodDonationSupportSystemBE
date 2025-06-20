import Database from '../services/database.services'
import { User } from '~/models/schemas/user.schema'
/**
 * Repository class for user-related with database
 */
export class UserRepository {
  async findByEmail(email: string): Promise<User> {
    try {
      const result = await Database.query(
        `SELECT 
          User_ID,
          Email,
          Password,
          User_Name,
          User_Role
        FROM Users
        WHERE Email = ?`,
        [email]
      )
      return result
    } catch (error) {
      console.error('Error in findByEmail', error)
      throw error
    }
  }

  async findById(userId: string): Promise<User | null> {
    try {
      const result = await Database.query(
        `SELECT 
          User_ID,
          Email,
          Password,
          User_Name,
          User_Role,
          BloodType_ID,
          YOB,
          Address,
          Phone,
          Gender
        FROM Users
        WHERE User_ID = ?`,
        [userId]
      )
      return result.length > 0 ? result[0] : null
    } catch (error) {
      console.error('Error in findById', error)
      throw error
    }
  }

  async updateUserFields(userId: string, fields: Partial<User>): Promise<void> {
    try {
      const keys = Object.keys(fields)
      if (keys.length === 0) return

      const updates = keys.map((key) => `${key} = ?`).join(', ')
      const values = keys.map((key) => (fields as any)[key])

      values.push(userId)

      const sql = `UPDATE Users SET ${updates} WHERE User_ID = ?`
      await Database.query(sql, values)
    } catch (error) {
      console.error('Error in updateUserFields', error)
      throw error
    }
  }
}
