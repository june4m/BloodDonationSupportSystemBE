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
            User_name
        FROM Users
        WHERE email = ?`,
        [email]
      )
      return result
    } catch (error) {
      console.error('Error in findByEmail', error)
      throw error
    }
  }
}
