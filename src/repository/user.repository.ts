import { body } from 'express-validator'

import Database from '../services/database.services'
import { User } from '~/models/schemas/user.schema'
import { RegisterReqBody } from '~/models/schemas/requests/user.requests'
import databaseServices from '../services/database.services'
import { parse } from 'path'
import { log } from 'console'

/**
 * Repository class for user-related with database
 */
export class UserRepository {
  async findByEmail(email: string): Promise<User> {
    log('Finding user by email:', email)
    const rows = await databaseServices.query(
      `
      SELECT
            User_ID   AS user_id,
            Email     AS email,
            Password  AS password,
            User_Name AS user_name,
            User_Role AS user_role,
            isDelete  AS isDelete
        FROM Users
        WHERE LOWER(Email) = LOWER(?);
      `,
      [email]
    )
    return rows
  }

  async findById(userId: string): Promise<User | null> {
    const rows = await databaseServices.query(
      `
      SELECT
        U.User_ID         AS user_id,
        U.Email           AS email,
        U.Password        AS password,
        U.User_Name       AS user_name,
        U.User_Role       AS user_role,
        U.Phone           AS phone,
        U.Gender          AS gender,
        U.Address         AS address,
        CONVERT(VARCHAR(10), U.YOB, 23) AS date_of_birth,
        U.BloodType_ID    AS bloodtype_id,
        B.Blood_group     AS blood_group,
        (SELECT STRING_AGG(bg, ', ')
		      FROM (
            SELECT DISTINCT BT2.Blood_group AS bg
            FROM   BloodCompatibility BC
            JOIN   BloodType BT2 ON BC.Receiver_Blood_ID = BT2.BloodType_ID
            WHERE  BC.Component_ID   = 'CP001'
            AND  BC.Is_Compatible  = 1
            AND  BC.Donor_Blood_ID = U.BloodType_ID
          ) AS distinct_groups
	      ) AS rbc_compatible_to
      FROM Users U
      LEFT JOIN BloodType B ON U.BloodType_ID = B.BloodType_ID 
      WHERE U.User_ID = ? AND U.isDelete = '1';
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
      console.error('Error in updateUserRole', error)
      throw error
    }
  }
  async update(userId: string, updates: Partial<User>): Promise<User> {
    try {
      const allowedUpdates: Partial<User> = {}
      if (updates.phone !== undefined) allowedUpdates.phone = updates.phone
      if (updates.user_name !== undefined) allowedUpdates.user_name = updates.user_name

      if (Object.keys(allowedUpdates).length === 0) {
        throw new Error('No valid fields to update')
      }
      const query = `UPDATE Users SET ? WHERE User_ID = ? AND isDelete = '1'`
      const result = await Database.query(query, [allowedUpdates, userId])
      if (result.affectedRows === 0) {
        throw new Error('No user found or update failed')
      }
      const updatedUser = await this.findById(userId)
      if (!updatedUser) throw new Error('Update faileed to retrieve user')
      return updatedUser
    } catch (error) {
      console.error('Error in update:', error)
      throw error
    }
  }

  async updateBloodType(userId: string, bloodType: string): Promise<User> {
    try {
      const query = `UPDATE Users SET Blood_Type = ? WHERE User_ID = ? AND isDelete = '1'`
      const result = await Database.query(query, [bloodType, userId])
      if (result.affectedRows === 0) {
        throw new Error('No user found or update failed')
      }

      const updatedUser = await this.findById(userId)
      if (!updatedUser) throw new Error('Update failed to retrieve user')
      return updatedUser
    } catch (error) {
      console.error('Error in updateBloodType:', error)
      throw error
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
      newId = 'U' + String(num).padStart(3, '0')
    }
    const sql = `
      INSERT INTO Users
        (User_ID, User_Name, YOB, Email, Password,Status, User_Role, Admin_ID, isDelete)
      VALUES (@param1, @param2, @param3, @param4, @param5,'Active', 'member','U001','1')
      `
    await databaseServices.queryParam(sql, [newId, name, date_of_birth, email, password])
    const created = await databaseServices.query(`SELECT * FROM Users WHERE User_ID = @param1`, [newId])
    return created[0]
  }

  async updateUserProfile(
    userId: string,
    data: { User_Name?: string; YOB?: string; Address?: string; Phone?: string; Gender?: string }
  ): Promise<any> {
    let query = 'UPDATE Users SET'
    const params: any[] = []
    const updates: string[] = []

    if (data.User_Name) {
      updates.push(' User_Name = ?')
      params.push(data.User_Name)
    }
    if (data.YOB) {
      updates.push(' YOB = ?')
      params.push(data.YOB)
    }
    if (data.Address) {
      updates.push(' Address = ?')
      params.push(data.Address)
    }
    if (data.Phone) {
      updates.push(' Phone = ?')
      params.push(data.Phone)
    }
    if (data.Gender) {
      updates.push(' Gender = ?')
      params.push(data.Gender)
    }

    if (updates.length === 0) {
      throw new Error('No fields provided to update')
    }

    query += updates.join(',')
    query += ' WHERE User_ID = ?'
    params.push(userId)

    try {
      const result = await databaseServices.queryParam(query, params)
      console.log('User profile updated:', result)
      return result
    } catch (error) {
      console.log('Failed to update user profile:', error)
      throw error
    }
  }

  async findBloodTypeByGroupAndRh(bloodGroup: string, rhFactor: string): Promise<any> {
    const query = `SELECT * FROM BloodType WHERE Blood_group = ? AND RHFactor = ?`
    const result = await databaseServices.queryParam(query, [bloodGroup, rhFactor])
    return result.recordset[0] ?? null
  }

  async updateUserBloodType(userId: string, bloodTypeId: string): Promise<any> {
    const query = `UPDATE Users SET BloodType_ID = ? WHERE User_ID = ?`
    const result = await databaseServices.queryParam(query, [bloodTypeId, userId])
    return result
  }

  public async getUserById(userId: string): Promise<any> {
    const query = `
    SELECT * FROM Users
    WHERE User_ID = ? AND isDelete = '1'
  `
    const result = await databaseServices.queryParam(query, [userId])
    console.log('result getUserById: ', result)
    return result.recordset.length > 0 ? result.recordset[0] : null
  }

  public async updatePatientId(userId: string, patientId: string): Promise<void> {
    console.log('updatePatientId repo')
    const query = `UPDATE Users SET Patient_ID = ? WHERE User_ID = ?`
    const result = await Database.query(query, [patientId, userId])
    console.log('updatePatientId result: ', result)
    return result
  }
}
