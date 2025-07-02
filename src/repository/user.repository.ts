
import { body } from 'express-validator';

import Database from '../services/database.services'
import { User } from '~/models/schemas/user.schema'
import { RegisterReqBody } from '~/models/schemas/requests/user.requests';
import databaseServices from '../services/database.services';
import { parse } from 'path';

/**
 * Repository class for user-related with database
 */
export class UserRepository {
  async findByEmail(email: string): Promise<User> {
    const rows = await databaseServices.query(
      `
      SELECT
        User_ID   AS user_id,
        Email     AS email,
        Password  AS password,
        User_Name AS user_name,
        User_Role AS user_role
      FROM Users
      WHERE LOWER(Email) = LOWER(?)
      `,
      [email]
    )
    return rows
  }
  async findById(userId: string): Promise<User | null> {
    const rows = await databaseServices.query(
      `
      SELECT
        User_ID   AS user_id,
        Email     AS email,
        Password  AS password,
        User_Name AS user_name,
        User_Role AS user_role,
        Phone AS phone,
        Address AS address,
        YOB AS date_of_birth,
        BloodType_ID AS bloodtype_id
      FROM Users
      WHERE User_ID = ?
      `,
      [userId]
    )
    return rows[0] ?? null
  }
  async updateUserRole(userId: string, role: string): Promise<void> {
    try {
      const result = await Database.query(
        `UPDATE Users
            SET User_Role = ?
            WHERE User_ID = ?
            `,
        [role, userId]
      )
    } catch (error) {
      console.error('Error in updateUserRole', error);
      throw error;
    }
  }
  async update(userId: string, updates: Partial<User>): Promise<User> {
    try {
      const allowedUpdates: Partial<User> = {};
      if (updates.phone !== undefined) allowedUpdates.phone = updates.phone;
      if (updates.user_name !== undefined) allowedUpdates.user_name = updates.user_name;

      if (Object.keys(allowedUpdates).length === 0) {
        throw new Error('No valid fields to update');
      }
      const query = `UPDATE Users SET ? WHERE User_ID = ?`;
      const result = await Database.query(query, [allowedUpdates, userId]);
      if (result.affectedRows === 0) {
        throw new Error('No user found or update failed');
      }
      const updatedUser = await this.findById(userId);
      if (!updatedUser) throw new Error('Update faileed to retrieve user');
      return updatedUser

    } catch (error) {
      console.error('Error in update:', error);
      throw error;
    }
  }

  async updateBloodType(userId: string, bloodType: string): Promise<User> {
    try {
      const query = `UPDATE Users SET Blood_Type = ? WHERE User_ID = ?`;
      const result = await Database.query(query, [bloodType, userId]);
      if (result.affectedRows === 0) {
        throw new Error('No user found or update failed');
      }

      const updatedUser = await this.findById(userId);
      if (!updatedUser) throw new Error('Update failed to retrieve user');
      return updatedUser;
    } catch (error) {
      console.error('Error in updateBloodType:', error);
      throw error;
    }
  }
  async createAccount(body: Pick<RegisterReqBody, 'email' | 'password' | 'name' | 'date_of_birth'>): Promise<User> {
    const { email, password, name, date_of_birth } = body
    const lastRow = await databaseServices.query(
      `SELECT TOP 1 User_ID FROM Users
      ORDER BY CAST (SUBSTRING(User_ID,2,LEN(User_ID) - 1) AS INT) DESC`
    )
    let newId = 'U001'
    if (lastRow.length) {
      const lastId = lastRow[0].User_ID as string
      const num = parseInt(lastId.slice(1), 10) + 1
      newId = 'U' + String(num).padStart(3, '0');
    }
    const sql = `
      INSERT INTO Users
        (User_ID, User_Name, YOB, Email, Password,Status, User_Role, Admin_ID)
      VALUES (@param1, @param2, @param3, @param4, @param5,'Active', 'member','U001')
      `
    await databaseServices.queryParam(sql, [
      newId,
      name,
      date_of_birth,
      email,
      password
    ])
    const created = await databaseServices.query(
      `SELECT * FROM Users WHERE User_ID = @param1`,
      [newId]
    )
    return created[0]
  }
}
