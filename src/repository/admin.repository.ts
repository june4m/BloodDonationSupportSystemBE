import { RegisterReqBody } from '~/models/schemas/requests/user.requests'
import { User, Users } from '~/models/schemas/user.schema'
import databaseServices from '~/services/database.services'

class AdminRepository {
  async findById(userId: string): Promise<User | null> {
    console.log('findById AdminRepo')
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
      WHERE U.User_ID = ?;
      `,
      [userId]
    )
    return rows[0] ?? null
  }

  async findByEmail(email: string): Promise<User> {
    console.log('gindByEmail AdminRepo')
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

  async createStaffAccount(
    body: Pick<RegisterReqBody, 'email' | 'password' | 'name' | 'date_of_birth'>
  ): Promise<User> {
    console.log('createStaffAccount AdminRepo')
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
      (User_ID, User_Name, YOB, Email, Password, Status, User_Role, Admin_ID)
    VALUES (?, ?, ?, ?, ?, 'Active', 'staff', 'U001')
    `
    await databaseServices.queryParam(sql, [newId, name, date_of_birth, email, password])
    const created = await databaseServices.query(`SELECT * FROM Users WHERE User_ID = ?`, [newId])
    return created[0]
  }

  async updateUserRole(userId: string, newRole: string): Promise<any> {
    console.log('updateUserRole AdminRepo')
    const sql = `
    UPDATE Users
    SET User_Role = ?
    WHERE User_ID = ?
  `
    try {
      const result = await databaseServices.queryParam(sql, [newRole, userId])
      return result
    } catch (error) {
      throw new Error('Failed to update user role')
    }
  }
  async bannedUser(userId: string): Promise<any> {
    try {
        const query = `
            UPDATE Users
            SET isDelete = '0'
            WHERE User_ID = ?
        `;
        const result = await databaseServices.query(query, [userId]);

        if (result.affectedRows === 0) {
            throw new Error('User not found or unable to ban user');
        }

        return { success: true, message: 'User has been banned successfully' };
    } catch (error) {
        console.error('Error in bannedUser:', error);
        throw error;
    }
  }
  async unbanUser(userId: string): Promise<any> {
    try {
        const query = `
            UPDATE Users
            SET isDelete = '1'
            WHERE User_ID = ?
        `;
        const result = await databaseServices.query(query, [userId]);

        if (result.affectedRows === 0) {
            throw new Error('User not found or unable to ban user');
        }

        return { success: true, message: 'User has been banned successfully' };
    } catch (error) {
        console.error('Error in bannedUser:', error);
        throw error;
    }
  }
  async getAllUsers(): Promise<Users[]> {
    try {
      const sql = `SELECT 
            User_ID,
            User_Name,
            Email,
            Phone,
            Gender,
            YOB,
            BloodType_ID,
            Status,
            User_Role,
            isDelete,
            Donation_Count
            FROM Users`;
      const users = await databaseServices.query(sql)
      return users.map((user: any) => ({
        User_ID: user.User_ID,
        User_Name: user.User_Name,
        Email: user.Email,
        Phone: user.Phone,
        Gender: user.Gender,
        YOB: user.YOB,
        BloodType_ID: user.BloodType_ID,
        Status: user.Status,
        User_Role: user.User_Role,
        isDelete: user.isDelete,
        Donation_Count: user.Donation_Count
      }))
    } catch (error) {
      throw new Error('Failed to get user list')
    }
  }
}

export default AdminRepository
