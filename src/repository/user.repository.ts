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
        User_Role AS user_role,
        YOB       AS yob,
        Address   AS address,
        Phone     AS phone,
        Gender    AS gender,
        BloodType_ID AS bloodtype_id
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
        YOB       AS yob,
        Address   AS address,
        Phone     AS phone,
        Gender    AS gender,
        BloodType_ID AS bloodtype_id
      FROM Users
      WHERE User_ID = ?
      `,
      [userId]
    )
    return rows[0] ?? null
  }
  async updateUserRole(userId: string,role: string): Promise<void>{
      try{
        const result = await Database.query(
            `UPDATE Users
            SET User_Role = ?
            WHERE User_ID = ?
            `,
            [role, userId]
        )
      }catch(error){
        console.error('Error in updateUserRole', error);
        throw error;
      }
  }
  async update(userId: string, updates: Partial<User>):Promise<User>{
    try {
      const allowedUpdates: Partial<User> = {};
      if (updates.phone !== undefined) allowedUpdates.phone = updates.phone;
      if (updates.user_name !== undefined) allowedUpdates.user_name = updates.user_name;
      if (updates.yob !== undefined) allowedUpdates.yob = updates.yob;
      if (updates.address !== undefined) allowedUpdates.address = updates.address;
      if (updates.gender !== undefined) allowedUpdates.gender = updates.gender;
      if (updates.bloodtype_id !== undefined) allowedUpdates.bloodtype_id = updates.bloodtype_id;

      console.log('[DEBUG][updateUser] userId:', userId);
      console.log('[DEBUG][updateUser] allowedUpdates:', allowedUpdates);

      if (Object.keys(allowedUpdates).length === 0) {
        console.error('[DEBUG][updateUser] No valid fields to update');
        throw new Error('No valid fields to update');
      }

      // Xây dựng truy vấn UPDATE động
      const updateFields: string[] = [];
      const params: any[] = [];
      if (allowedUpdates.phone !== undefined) {
        updateFields.push('Phone = ?');
        params.push(allowedUpdates.phone);
      }
      if (allowedUpdates.user_name !== undefined) {
        updateFields.push('User_Name = ?');
        params.push(allowedUpdates.user_name);
      }
      if (allowedUpdates.yob !== undefined) {
        updateFields.push('YOB = ?');
        params.push(allowedUpdates.yob);
      }
      if (allowedUpdates.address !== undefined) {
        updateFields.push('Address = ?');
        params.push(allowedUpdates.address);
      }
      if (allowedUpdates.gender !== undefined) {
        updateFields.push('Gender = ?');
        params.push(allowedUpdates.gender);
      }
      if (allowedUpdates.bloodtype_id !== undefined) {
        updateFields.push('BloodType_ID = ?');
        params.push(allowedUpdates.bloodtype_id);
      }
      params.push(userId); // cho WHERE clause
      const query = `UPDATE Users SET ${updateFields.join(', ')} WHERE User_ID = ?`;
      console.log('[DEBUG][updateUser] SQL:', query);
      console.log('[DEBUG][updateUser] params:', params);
      const result = await Database.query(query, params);
      if (result && typeof result === 'object') {
        if (Array.isArray(result.rowsAffected) && result.rowsAffected[0] === 0) {
          console.error('[DEBUG][updateUser] No user found or update failed (rowsAffected=0)');
          throw new Error('No user found or update failed');
        }
        if (typeof result.affectedRows === 'number' && result.affectedRows === 0) {
          console.error('[DEBUG][updateUser] No user found or update failed');
          throw new Error('No user found or update failed');
        }
      }
      const updatedUser = await this.findById(userId);
      if(!updatedUser) throw new Error('Update failed to retrieve user');
      return updatedUser
    } catch (error) {
      console.error('Error in update:', error);
      throw error;
    }
  }

  async updateBloodType(userId: string, bloodType: string): Promise<User> {
    try {
      const query = `UPDATE Users SET BloodType_ID = ? WHERE User_ID = ?`;
      const result = await Database.query(query, [bloodType, userId]);
      if (result && typeof result === 'object') {
        if (Array.isArray(result.rowsAffected) && result.rowsAffected[0] === 0) {
          throw new Error('No user found or update failed');
        }
        if (typeof result.affectedRows === 'number' && result.affectedRows === 0) {
          throw new Error('No user found or update failed');
        }
      }
      const updatedUser = await this.findById(userId);
      if (!updatedUser) throw new Error('Update failed to retrieve user');
      return updatedUser;
    } catch (error) {
      console.error('Error in updateBloodType:', error);
      throw error;
    }
  }
  async createAccount(body: Pick<RegisterReqBody,'email' | 'password' | 'name' | 'date_of_birth' | 'phone'>): Promise<User>{
    const { email, password, name, date_of_birth, phone } = body
    const lastRow = await databaseServices.query(
      `SELECT TOP 1 User_ID FROM Users
      ORDER BY CAST (SUBSTRING(User_ID,2,LEN(User_ID) - 1) AS INT) DESC`
    )
    let newId = 'U001'
    if(lastRow.length){
      const lastId = lastRow[0].User_ID as string
      const num =parseInt(lastId.slice(1),10) + 1
      newId = 'U' + String(num).padStart(3,'0');
    }
    const sql = `
      INSERT INTO Users
        (User_ID, User_Name, YOB, Email, Password, Phone, User_Role)
      VALUES (?, ?, ?, ?, ?, ?, 'member')
      `
    await databaseServices.queryParam(sql,[
      newId,
      name,
      date_of_birth,
      email,
      password,
      phone
    ])
    const created = await databaseServices.query(
      `SELECT * FROM Users WHERE User_ID = ?`,
      [newId]
    )
    return created[0]
  }
  async getAllBloodTypes() {
    const rows = await databaseServices.query(
      `SELECT BloodType_ID, Blood_group, RHFactor FROM BloodType`
    );
    return rows;
  }
}
