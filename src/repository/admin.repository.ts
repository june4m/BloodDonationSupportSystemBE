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
    body: Pick<RegisterReqBody, 'email' | 'password' | 'name' | 'date_of_birth'| 'bloodType_id'>
  ): Promise<User> {
    console.log('createStaffAccount AdminRepo')
    const { email, password, name, date_of_birth, bloodType_id } = body
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
      (User_ID, User_Name, YOB, Email, Password, Status, User_Role, Admin_ID,BloodType_ID)
    VALUES (?, ?, ?, ?, ?, 'Active', 'staff', 'U001',?)
    `
    await databaseServices.queryParam(sql, [newId, name, date_of_birth, email, password,bloodType_id])
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
        const result = await databaseServices.queryParam(query, [userId]);

        let affectedRows = 0;
            if (result?.affectedRows !== undefined) {
                affectedRows = result.affectedRows;
            } else if (Array.isArray(result?.rowsAffected)) {
                affectedRows = result.rowsAffected[0];
            } else if (typeof result?.rowsAffected === "number") {
                affectedRows = result.rowsAffected;
            }

            if (affectedRows <= 0) {
                throw new Error('Ban failed: User not found or already banned');
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
        const result = await databaseServices.queryParam(query, [userId]);

        let affectedRows = 0;
            if (result?.affectedRows !== undefined) {
                affectedRows = result.affectedRows;
            } else if (Array.isArray(result?.rowsAffected)) {
                affectedRows = result.rowsAffected[0];
            } else if (typeof result?.rowsAffected === "number") {
                affectedRows = result.rowsAffected;
            }

            if (affectedRows <= 0) {
                throw new Error('Unban failed or user not found');
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
            U.User_ID,
            U.User_Name,
            U.Email,
            U.Phone,
            U.Gender,
            U.YOB,
            B.Blood_group + B.RHFactor AS BloodGroup,
            U.Status,
            U.User_Role,
            U.isDelete,
            U.Donation_Count
            FROM Users U JOIN BloodType B ON U.BloodType_ID = B.BloodType_ID`;
      const users = await databaseServices.query(sql)
      return users.map((user: any) => ({
        User_ID: user.User_ID,
        User_Name: user.User_Name,
        Email: user.Email,
        Phone: user.Phone,
        Gender: user.Gender,
        YOB: user.YOB,
        BloodGroup: user.BloodGroup,
        Status: user.Status,
        User_Role: user.User_Role,
        isDelete: user.isDelete,
        Donation_Count: user.Donation_Count
      }))
    } catch (error) {
      throw new Error('Failed to get user list')
    }
  }
  async getAllReportByAdmin(): Promise<any[]> {
    try {
      const query = ` SELECT U.User_Name,
            SB.Title,
            SB.Description,
            SD.VolumeIn,
            SD.VolumeOut, 
            SD.Note, 
            U.Phone, 
            U.Email FROM SummaryBlood SB 
            JOIN SummaryBlood_Detail  SD ON SB.SummaryBlood_ID = SD.SummaryBlood_ID 
            JOIN Users U ON SB.Staff_ID = U.User_ID`;
      const any = await databaseServices.query(query);
      return  any.map((row: any) => ({
        User_Name: row.User_Name,
        Title: row.Title,
        Description: row.Description,
        VolumeIn: row.VolumeIn,
        VolumeOut: row.VolumeOut,
        Note: row.Note,
        Phone: row.Phone,
        Email: row.Email
      }));
      
    } catch (error) {
      throw new Error('Failed to retrieve reports');
    }
  }
}

export default AdminRepository
