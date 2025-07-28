import moment from 'moment'
import { PotentialDonor } from '~/models/schemas/potentialDonor.schema'
import { bloodUnitCreateReqBody, bloodUnitUpdateReqBody } from '~/models/schemas/requests/bloodbank.requests.schema'
import { InfoRequesterEmergency, PotentialDonorCriteria } from '~/models/schemas/requests/user.requests'
import { EmergencyRequestReqBody, UpdateEmergencyRequestReqBody } from '~/models/schemas/slot.schema'

import { CreateReportReqBody, User } from '~/models/schemas/user.schema'
import databaseServices from '~/services/database.services'
import { sendEmailService } from '~/services/email.services'

export class StaffRepository {
  async getPotentialList(): Promise<PotentialDonor[]> {
    try {
      const result = await databaseServices.query(`SELECT * FROM PotentialDonor `)
      return result.map((item: any) => ({
        Potential_ID: item.Potential_ID,
        User_ID: item.User_ID,
        Status: item.Status,
        Note: item.Note || '',
        Staff_ID: item.Staff_ID || ''
      })) as PotentialDonor[]
    } catch (error) {
      console.error('Error in getPotentialList:', error)
      throw error
    }
  }
  async getMemberList(): Promise<User[]> {
    try {
      const result = await databaseServices.query(`SELECT * FROM Users WHERE User_Role = 'member'`)
      return result.map((item: any) => ({
        User_ID: item.User_ID,
        User_Name: item.User_Name,
        Email: item.Email,
        Phone: item.Phone || '',
        Blood_Type: item.Blood_Type || '',
        Date_Of_Birth: item.Date_Of_Birth || null,
        User_Role: item.User_Role
      })) as User[]
    } catch (error) {
      console.error('Error in getMemberList:', error)
      throw error
    }
  }
  async addMemberToPotentialList(userId: string, staffId: string, note: string): Promise<void> {
    try {
      const lastRow = await databaseServices.query(
        `SELECT TOP 1 Potential_ID FROM PotentialDonor
                 ORDER BY CAST(SUBSTRING(Potential_ID, 3, LEN(Potential_ID) - 2) AS INT) DESC`
      )
      let newPotentialId = 'PD001'
      if (lastRow.length) {
        const lastId = lastRow[0].Potential_ID as string
        const num = parseInt(lastId.slice(2), 10) + 1
        newPotentialId = 'PD' + String(num).padStart(3, '0')
      }
      const query = `INSERT INTO PotentialDonor (Potential_ID, User_ID, Status, Note, Staff_ID)
                            VALUES (?, ?, 'Pending', ?, ?)`
      await databaseServices.query(query, [newPotentialId, userId, note, staffId])
    } catch (error) {
      console.error('Error in addMemberToPotentialList:', error)
      throw error
    }
  }
  public async createEmergencyRequest(data: EmergencyRequestReqBody): Promise<any> {
    try {
      const lastRow = await databaseServices.query(
        `SELECT TOP 1 Emergency_ID FROM EmergencyRequest
                 ORDER BY CAST(SUBSTRING(Emergency_ID, 3, LEN(Emergency_ID) - 2) AS INT) DESC`
      )

      let newEmergencyId = 'ER001'
      if (lastRow.length) {
        const lastId = lastRow[0].Emergency_ID as string
        const num = parseInt(lastId.slice(2), 10) + 1
        newEmergencyId = 'ER' + String(num).padStart(3, '0')
      }

      const query = `
            INSERT INTO EmergencyRequest (
                Emergency_ID, Requester_ID, Volume, BloodType_ID, Needed_Before, Status, Created_At, Updated_At, reason_Need
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, GETDATE(), ?)
        `
      await databaseServices.query(query, [
        newEmergencyId,
        data.Requester_ID,
        data.Volume,
        data.BloodType_ID,
        data.Needed_Before,
        data.Status,
        data.Created_At,
        data.reason_Need
      ])

      return { Emergency_ID: newEmergencyId, ...data }
    } catch (error) {
      console.error('Error in createEmergencyRequest:', error)
      throw error
    }
  }
  public async checkRecentEmergencyRequest(userId: string): Promise<boolean> {
    try {
      const query = `
            SELECT COUNT(*) AS cnt
            FROM EmergencyRequest
            WHERE Requester_ID = ?
              AND Status    NOT IN  ('Completed', 'Rejected')
          `
      const result = await databaseServices.query(query, [userId])
      // Nếu cnt > 0 nghĩa là vẫn còn request chưa complete
      return result[0].cnt > 0
    } catch (error) {
      console.error('Error in checkRecentEmergencyRequest:', error)
      throw error
    }
  }
  async checkPotentialDonorExists(userId: string): Promise<boolean> {
    try {
      const query = `
              SELECT COUNT(*) AS count
              FROM PotentialDonor
              WHERE User_ID = ?
          `
      const result = await databaseServices.query(query, [userId])
      return result[0].count > 0
    } catch (error) {
      console.error('Error in checkPotentialDonorExists:', error)
      throw error
    }
  }
  public async getAllEmergencyRequests(): Promise<EmergencyRequestReqBody[]> {
    try {
      const query = `SELECT 
                            ER.Emergency_ID,
                            U.User_Name,
                            ER.Requester_ID,
                            ER.BloodType_ID,
                            B.Blood_group + B.RHFactor AS BloodType,
                            ER.Volume, 
                            ER.Needed_Before,
                            ER.Priority,
                            ER.sourceType,
                            ER.Potential_ID,
                            ER.Place,
                            ER.Status,
                            D.User_ID                       AS Donor_ID,
                            ER.reason_Need,
							ER.isDeleted
                        FROM EmergencyRequest ER
                        JOIN Users U ON ER.Requester_ID = U.User_ID
                        JOIN BloodType B ON ER.BloodType_ID = B.BloodType_ID
                        LEFT JOIN PotentialDonor PD ON ER.Potential_ID = PD.Potential_ID
                        LEFT JOIN Users D ON PD.User_ID = D.User_ID WHERE ER.isDeleted = '1';`
      const result = await databaseServices.query(query)
      return result.map((item: any) => ({
        Emergency_ID: item.Emergency_ID,
        Requester_ID: item.Requester_ID,
        User_Name: item.User_Name,
        BloodType_ID: item.BloodType_ID,
        BloodType: item.BloodType,
        Volume: item.Volume,
        Needed_Before: item.Needed_Before,
        Priority: item.Priority,
        sourceType: item.sourceType,
        Potential_ID: item.Potential_ID,
        Place: item.Place,
        Status: item.Status,
        reason_Need: item.reason_Need,
        Donor_ID: item.Donor_ID
      })) as EmergencyRequestReqBody[]
    } catch (error) {
      console.error('Error in getEmergencyRequests:', error)
      throw error
    }
  }
  public async updateEmergencyRequest(data: UpdateEmergencyRequestReqBody): Promise<any> {
    try {
      const fieldsToUpdate: string[] = []
      const values: any[] = []

      if (data.Priority !== undefined) {
        fieldsToUpdate.push('Priority = ?')
        values.push(data.Priority)
      }
      if (data.Status !== undefined) {
        fieldsToUpdate.push('Status = ?')
        values.push(data.Status)
      }
      if (data.Staff_ID !== undefined) {
        fieldsToUpdate.push('Staff_ID = ?')
        values.push(data.Staff_ID)
      }
      if (data.Updated_At !== undefined) {
        fieldsToUpdate.push('Updated_At = ?')
        values.push(data.Updated_At)
      }
      if (data.sourceType !== undefined) {
        fieldsToUpdate.push('sourceType = ?')
        values.push(data.sourceType)
      }
      if (data.Place !== undefined) {
        fieldsToUpdate.push('Place = ?')
        values.push(data.Place)
      }
      if (data.isDeleted !== undefined) {
        fieldsToUpdate.push('isDeleted = ?')
        values.push(data.isDeleted)
      }

      if (fieldsToUpdate.length === 0) {
        throw new Error('No fields provided for update')
      }

      const query = `
                UPDATE EmergencyRequest
                SET ${fieldsToUpdate.join(', ')}
                WHERE Emergency_ID = ?
            `
      values.push(data.Emergency_ID)

      await databaseServices.query(query, values)

      return { success: true, message: 'Emergency request updated successfully' }
    } catch (error) {
      console.error('Error in updateEmergencyRequest:', error)
      throw error
    }
  }

  public async getBloodBank(): Promise<any[]> {
    try {
      const query = `SELECT B.BloodType_ID,
                        BT.Blood_group + BT.RHFactor as BloodGroup,
                        B.Volume,
                        BU.Expiration_Date,
                        BU.Status
                        FROM BloodBank B 
                        JOIN BloodType BT ON B.BloodType_ID = BT.BloodType_ID 
                        JOIN BloodUnit BU ON BU.BloodType_ID = B.BloodType_ID
                        WHERE BU.Status = 'Available'`
      const result = await databaseServices.query(query)

      // Map kết quả trả về thành danh sách các đối tượng
      return result.map((item: any) => ({
        BloodType_ID: item.BloodType_ID,
        BloodGroup: item.BloodGroup,
        Volume: item.Volume,
        Expiration_Date: item.Expiration_Date,
        Status: item.Status
      }))
    } catch (error) {
      console.error('Error in getBloodBank:', error)
      throw error
    }
  }

  public async getProfileRequesterById(User_Id: string): Promise<InfoRequesterEmergency[]> {
    try {
      const query = `
            SELECT U.User_ID as User_Id,
                   U.User_Name,
                   U.YOB as Date_Of_Birth,
				   B.Blood_group + B.RHFactor as BloodGroup,
                   U.Address As Full_Address,
                   U.Phone,
                   U.Email,
                   U.Gender 
            FROM Users U JOIN BloodType B ON U.BloodType_ID = B.BloodType_ID
            WHERE U.User_ID = ?
              AND U.Status = 'Active'`
      const rows: any[] = await databaseServices.query(query, [User_Id])
      return rows.map((item) => {
        return {
          User_ID: item.User_Id,
          User_Name: item.User_Name,
          BloodGroup: item.BloodGroup,
          Date_Of_Birth: moment(item.Date_Of_Birth).format('YYYY-MM-DD'),
          Full_Address: item.Full_Address,
          Phone: item.Phone,
          Email: item.Email,
          Gender: item.Gender
        }
      })
    } catch (error) {
      console.error('Error in getProfileRequesterById:', error)
      throw error
    }
  }
  /**
   * Lấy danh sách potential theo 3 tiêu chí
   *  1) cùng Xã/Phường/Quận, Thành phố=> tiêu chí khoảng cách nè
   *  2) nhóm máu tương thích => Cùng nhóm
   *  3) lần hiến gần nhất >= 3 tháng
   */
  public async getPotentialDonorCriteria(emergencyId: string): Promise<PotentialDonorCriteria[]> {
    // 1) Lấy nhóm máu từ EmergencyRequest
    const req = (await databaseServices.query(
      `
        SELECT ER.BloodType_ID AS requestedBTID,
               ER.Requester_ID AS requesterID
        FROM EmergencyRequest ER
        WHERE ER.Emergency_ID = ? 
            AND ER.Status = 'Pending' OR ER.Status = 'Rejected'
        `,
      [emergencyId]
    )) as any[]

    if (!req.length) return []
    const requestedBTID = req[0].requestedBTID
    const requesterId = req[0].requesterID // Thêm dòng này

    // 2) Chạy batch T‑SQL bạn cung cấp
    const rows = (await databaseServices.query(
      `
        DECLARE @BTID VARCHAR(20) = ? ;         -- Nhóm máu người nhận
        DECLARE @ReceiverID NVARCHAR(20) = ? ;   -- ID người nhận

        DECLARE @ADDR NVARCHAR(200);
        DECLARE @PHUONG NVARCHAR(100);
        DECLARE @QUAN NVARCHAR(100);

        -- Lấy địa chỉ người nhận
        SELECT @ADDR = Address FROM Users WHERE User_ID = @ReceiverID;

        -- Tách phường & quận từ địa chỉ
        SET @PHUONG = LTRIM(RTRIM(PARSENAME(REPLACE(@ADDR, ', ', '.'), 2)));
        SET @QUAN   = LTRIM(RTRIM(PARSENAME(REPLACE(@ADDR, ', ', '.'), 1)));

        -- Tìm người hiến phù hợp, không trùng userId
        WITH DonorMatches AS (
        SELECT
            PD.Potential_ID AS potentialId,
            U.User_ID       AS userId,
            U.User_Name     AS userName,
            U.Email AS Email,
            B.Blood_group + B.RHFactor AS bloodType,
            U.Address,
            U.History,
            TRY_CONVERT(DATE, SUBSTRING(U.History, CHARINDEX(' on ', U.History) + 4, 10)) AS donationDate
        FROM PotentialDonor PD
        JOIN Users U ON PD.User_ID = U.User_ID
        JOIN BloodType B ON U.BloodType_ID = B.BloodType_ID
        JOIN BloodCompatibility BC ON BC.Donor_Blood_ID = U.BloodType_ID
                                    AND BC.Receiver_Blood_ID = @BTID
                                    AND BC.Is_Compatible = 1
        WHERE 
        PD.Status = 'Approved' AND
            U.Status = 'Active'
            AND U.History IS NOT NULL
            AND CHARINDEX(' on ', U.History) > 0
            AND CHARINDEX(' at', U.History) > CHARINDEX(' on ', U.History)
        ),
        Filtered AS (
        SELECT *,
                DATEDIFF(MONTH, donationDate, GETDATE()) AS monthsSince,
                CASE
                WHEN LTRIM(RTRIM(PARSENAME(REPLACE(Address, ', ', '.'), 2))) = @PHUONG
                    AND LTRIM(RTRIM(PARSENAME(REPLACE(Address, ', ', '.'), 1))) = @QUAN THEN 1
                WHEN LTRIM(RTRIM(PARSENAME(REPLACE(Address, ', ', '.'), 1))) = @QUAN THEN 2
                ELSE NULL
                END AS proximity
        FROM DonorMatches
        WHERE donationDate IS NOT NULL AND DATEDIFF(MONTH, donationDate, GETDATE()) >= 3
        ),
        Ranked AS (
        SELECT *, ROW_NUMBER() OVER (PARTITION BY userId ORDER BY proximity) AS rn
        FROM Filtered
        WHERE proximity IS NOT NULL
        )

        SELECT *
        FROM Ranked
        WHERE rn = 1
        AND proximity = (SELECT MIN(proximity) FROM Ranked)
        ORDER BY userName;

        `,
      [requestedBTID, requesterId]
    )) as any[]

    // 3) Map về DTO
    return rows.map((r) => ({
      potentialId: r.potentialId,
      userId: r.userId,
      userName: r.userName,
      bloodType: r.bloodType,
      lastDonation: r.donationDate ? (r.donationDate as Date).toISOString().slice(0, 10) : '',
      address: r.Address,
      proximity: r.proximity, // 1 = same ward, 2 = same city
      monthsSince: r.monthsSince,
      email: r.Email // >= 3
    }))
  }
  public async sendEmergencyEmailFixed(donorEmail: string, donorName: string): Promise<any> {
    try {
      const subject = `🩸 Cần sự hỗ trợ khẩn cấp - Hiến máu cứu người`

      const htmlContent = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ddd;">
                    <div style="background-color: #dc3545; color: white; padding: 20px; text-align: center;">
                        <h1>🩸 YÊU CẦU HIẾN MÁU KHẨN CẤP</h1>
                        <p>Trung tâm Hiến máu Đại Việt Blood</p>
                    </div>
                    
                    <div style="padding: 30px;">
                        <h2 style="color: #dc3545;">Kính chào ${donorName},</h2>
                        
                        <div style="background-color: #fff3cd; padding: 20px; border-left: 4px solid #ffc107; margin: 20px 0; border-radius: 5px;">
                            <p style="font-size: 18px; font-weight: bold; color: #856404; margin: 0; line-height: 1.6;">
                                Hiện bên chúng tôi đang có 1 bệnh nhân cần máu khẩn cấp, bạn có thể hỗ trợ hiến máu để trao sự sống cho họ được không?
                            </p>
                        </div>
                        
                        <div style="background-color: #d4edda; padding: 20px; border-left: 4px solid #28a745; margin: 20px 0; border-radius: 5px;">
                            <h3 style="color: #155724; margin: 0 0 15px 0;">❤️ Tại sao việc hiến máu quan trọng?</h3>
                            <ul style="color: #155724; margin: 0; padding-left: 20px; line-height: 1.8;">
                                <li>Máu không thể sản xuất nhân tạo</li>
                                <li>Mỗi lần hiến máu có thể cứu được tới 3 sinh mạng</li>
                                <li>Bạn là hy vọng cuối cùng của bệnh nhân</li>
                                <li>Hiến máu an toàn và không ảnh hưởng đến sức khỏe</li>
                            </ul>
                        </div>
                        
                        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
                            <h3 style="color: #666; margin: 0 0 15px 0;">📝 Lưu ý trước khi hiến máu:</h3>
                            <ul style="color: #666; margin: 0; padding-left: 20px; line-height: 1.8;">
                                <li>Ăn uống đầy đủ trước khi hiến máu</li>
                                <li>Ngủ đủ giấc và có sức khỏe tốt</li>
                                <li>Không uống rượu bia 24h trước khi hiến</li>
                                <li>Mang theo CCCD/CMND khi đến hiến máu</li>
                            </ul>
                        </div>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <div style="background-color: #dc3545; color: white; padding: 25px; border-radius: 10px;">
                                <h3 style="margin: 0 0 15px 0;">🚨 LIÊN HỆ NGAY</h3>
                                <p style="margin: 0 0 15px 0; font-size: 16px;">Vui lòng liên hệ với chúng tôi để được hỗ trợ:</p>
                                <p style="margin: 0; font-size: 20px; font-weight: bold;">
                                    📞 Hotline: 1900-1234
                                </p>
                                <p style="margin: 10px 0 0 0; font-size: 16px;">
                                    ✉️ Email: support@bloodcenter.com
                                </p>
                            </div>
                        </div>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <p style="font-size: 20px; color: #dc3545; font-weight: bold; margin: 0;">
                                Cảm ơn bạn đã sẵn sàng cứu người! 🙏
                            </p>
                            <p style="font-size: 16px; color: #666; margin: 10px 0 0 0;">
                                Mỗi giọt máu của bạn là một sự sống được cứu!
                            </p>
                        </div>
                    </div>
                    
                    <div style="background-color: #343a40; color: white; padding: 20px; text-align: center;">
                        <p style="margin: 0; font-size: 14px;">
                            <strong>Trung tâm Hiến máu Đại Việt Blood</strong><br>
                            "Giọt máu nghĩa tình - Trao sự sống, nhận hạnh phúc"<br>
                            Địa chỉ: 123 Đường ABC, Quận 1, TP.HCM<br>
                            Hotline: 1900-1234 | Email: support@bloodcenter.com
                        </p>
                    </div>
                </div>
            `

      await sendEmailService(donorEmail, subject, htmlContent)

      return {
        success: true,
        message: 'Email sent successfully',
        data: {
          donorEmail,
          donorName,
          sentAt: new Date().toISOString()
        }
      }
    } catch (error) {
      console.error('Error in sendEmergencyEmailFixed:', error)
      throw error
    }
  }
  public async rejectEmergencyRequest(emergencyId: string, staffId: string, reasonReject: string): Promise<any> {
    try {
      const query = `
                UPDATE EmergencyRequest
                SET Status = 'Rejected',
                    reason_Reject = ?,
                    Staff_ID = ?,
                    Updated_At = GETDATE()
                WHERE Emergency_ID = ?
            `
      const result = await databaseServices.queryParam(query, [reasonReject, staffId, emergencyId])
      console.log('Result: ', result)

      // Sửa kiểm tra affectedRows cho đúng
      let affectedRows = 0
      if (result?.affectedRows !== undefined) {
        affectedRows = result.affectedRows
      } else if (Array.isArray(result?.rowsAffected)) {
        affectedRows = result.rowsAffected[0]
      } else if (typeof result?.rowsAffected === 'number') {
        affectedRows = result.rowsAffected
      }

      if (affectedRows <= 0) {
        throw new Error('Emergency request not found or unable to reject')
      }

      // Lấy thông tin chi tiết của yêu cầu sau khi cập nhật
      const selectQuery = `
                SELECT Emergency_ID, Status, reason_Reject, Staff_ID, Updated_At, isDeleted
                FROM EmergencyRequest
                WHERE Emergency_ID = ?
            `
      const updatedRequest = await databaseServices.query(selectQuery, [emergencyId])

      return {
        success: true,
        message: 'Emergency request rejected successfully',
        data: updatedRequest[0]
      }
    } catch (error) {
      console.error('Error in rejectEmergencyRequest:', error)
      throw error
    }
  }
  public async checkPotentialInOtherEmergency(potentialId: string): Promise<boolean> {
    try {
      const query = `
                SELECT COUNT(*) AS count
                FROM EmergencyRequest
                WHERE Potential_ID = ?
                  AND Status <> 'Completed' OR  Status <> 'Rejected'
            `
      const result = await databaseServices.query(query, [potentialId])
      return result[0].count > 0 // Nếu count > 0 nghĩa là Potential_ID đang được sử dụng trong Emergency khác chưa hoàn thành
    } catch (error) {
      console.error('Error in checkPotentialInOtherEmergency:', error)
      throw error
    }
  }
  public async addPotentialDonorByStaffToEmergency(
    emergencyId: string,
    potentialId: string,
    staffId: string
  ): Promise<any> {
    try {
      const isPotentialInOtherEmergency = await this.checkPotentialInOtherEmergency(potentialId)
      if (isPotentialInOtherEmergency) {
        throw new Error('Potential donor is already assigned to another emergency that is not complete')
      }
      const emergencyQuery = `
                SELECT Emergency_ID, Status, Potential_ID 
                FROM EmergencyRequest 
                WHERE Emergency_ID = ? AND Status = 'Pending'
            `
      const emergencyResult = await databaseServices.query(emergencyQuery, [emergencyId])
      if (!emergencyResult.length) {
        throw new Error('Emergency request not found or not pending')
      }
      const updateQuery = `
                UPDATE EmergencyRequest 
                SET Potential_ID = ?, 
                    Staff_ID = ?, 
                    Updated_At = GETDATE()
                WHERE Emergency_ID = ?
            `
      await databaseServices.query(updateQuery, [potentialId, staffId, emergencyId])

      return {
        success: true,
        message: 'Potential donor assigned to emergency successfully',
        data: {
          Emergency_ID: emergencyId,
          Potential_ID: potentialId,
          Staff_ID: staffId,
          Updated_At: new Date()
        }
      }
    } catch (error) {
      console.error('Error in addPotentialDonorByStaffToEmergency:', error)
      throw error
    }
  }
  public async cancelEmergencyRequestByMember(emergencyId: string, memberId: string): Promise<any> {
    try {
      const query = `
                UPDATE EmergencyRequest
                SET isDeleted = '0',
                Status = 'Rejected',
                Updated_At = GETDATE()
                WHERE Emergency_ID = ? AND Requester_ID = ?
            `
      const result = await databaseServices.query(query, [emergencyId, memberId])

      let affectedRows = 0
      if (result?.affectedRows !== undefined) {
        affectedRows = result.affectedRows
      } else if (Array.isArray(result?.rowsAffected)) {
        affectedRows = result.rowsAffected[0]
      } else if (typeof result?.rowsAffected === 'number') {
        affectedRows = result.rowsAffected
      }

      if (affectedRows <= 0) {
        throw new Error('Emergency request not found or unable to reject')
      }

      return { success: true, message: 'Emergency request canceled by member successfully' }
    } catch (error) {
      console.error('Error in cancelEmergencyRequestByMember:', error)
      throw error
    }
  }
  public async getInfoEmergencyRequestsByMember(memberId: string): Promise<EmergencyRequestReqBody[]> {
    try {
      const query = `
                SELECT Emergency_ID, Requester_ID,reason_Need, BT.Blood_group + BT.RHFactor as BloodGroup, Volume, Needed_Before, Status, Created_At, Updated_At, isDeleted,reason_Reject
                FROM EmergencyRequest E JOIN BloodType BT ON E.BloodType_ID = BT.BloodType_ID
                WHERE Requester_ID = ?  AND isDeleted = '1'
                ORDER BY Created_At DESC
            `
      const result = await databaseServices.query(query, [memberId])

      return result.map((item: any) => ({
        Emergency_ID: item.Emergency_ID,
        Requester_ID: item.Requester_ID,
        reason_Need: item.reason_Need,
        BloodGroup: item.BloodGroup,
        Volume: item.Volume,
        Needed_Before: item.Needed_Before,
        Status: item.Status,
        Created_At: item.Created_At,
        Updated_At: item.Updated_At,
        isDeleted: item.isDeleted,
        reason_Reject: item.reason_Reject
      }))
    } catch (error) {
      console.error('Error in getEmergencyRequestsByMember:', error)
      throw error
    }
  }
  public async createReport(data: CreateReportReqBody): Promise<any> {
    try {
      const checkQuery = `
                SELECT COUNT(*) AS count
    FROM SummaryBlood
    WHERE Staff_ID = ? AND CAST(Report_Date AS DATE) = CAST(GETDATE() AS DATE)
            `
      const result = await databaseServices.query(checkQuery, [data.staff_id])

      if (result[0].count > 0) {
        throw new Error('You can only create one report per day.')
      }

      // 1. Tạo ID mới cho SummaryBlood
      const lastRow = await databaseServices.query(
        `SELECT TOP 1 SummaryBlood_ID 
                 FROM SummaryBlood
                 ORDER BY CAST(SUBSTRING(SummaryBlood_ID, 3, LEN(SummaryBlood_ID) - 2) AS INT) DESC`
      )

      let newSummaryBloodId = 'SB001'
      if (lastRow.length) {
        const lastId = lastRow[0].SummaryBlood_ID as string
        const num = parseInt(lastId.slice(2), 10) + 1
        newSummaryBloodId = 'SB' + String(num).padStart(3, '0')
      }

      // 2. Insert vào bảng SummaryBlood
      const summaryQuery = `
                INSERT INTO SummaryBlood (
                    SummaryBlood_ID, Title, Report_Date, Description, Staff_ID, Status
                )
                VALUES (?, ?, GETDATE(), ?, ?, 'Submitted')
            `
      await databaseServices.queryParam(summaryQuery, [
        newSummaryBloodId,
        data.title || null,
        data.description || null,
        data.staff_id
      ])

      // 3. Lặp và insert vào SummaryBlood_Detail
      if (data.details && data.details.length > 0) {
        const lastDetail = await databaseServices.query(
          `SELECT TOP 1 Report_Detail_ID 
                     FROM SummaryBlood_Detail
                     ORDER BY CAST(SUBSTRING(Report_Detail_ID, 4, LEN(Report_Detail_ID) - 3) AS INT) DESC`
        )

        let nextDetailNum = 1
        if (lastDetail.length) {
          const lastId = lastDetail[0].Report_Detail_ID as string
          nextDetailNum = parseInt(lastId.slice(3), 10) + 1
        }

        const detailQuery = `
                    INSERT INTO SummaryBlood_Detail (
                        Report_Detail_ID, VolumeIn, VolumeOut, Note, SummaryBlood_ID
                    )
                    VALUES (?, ?, ?, ?, ?)
                `

        for (const item of data.details) {
          const newDetailId = 'SBD' + String(nextDetailNum++).padStart(3, '0')

          await databaseServices.queryParam(detailQuery, [
            newDetailId,
            item.volumeIn || null,
            item.volumeOut || null,
            item.note || null,
            newSummaryBloodId
          ])
        }
      }

      return {
        success: true,
        message: 'Report created successfully',
        data: { SummaryBlood_ID: newSummaryBloodId }
      }
    } catch (error) {
      console.error('Error in createReport:', error)
      throw error
    }
  }
  public async updateReport(data: CreateReportReqBody): Promise<any> {
    try {
      // Kiểm tra xem báo cáo có tồn tại hay không
      const checkQuery = `
                SELECT COUNT(*) AS count
                FROM SummaryBlood
                WHERE SummaryBlood_ID = ? AND Staff_ID = ?
            `
      const checkResult = await databaseServices.queryParam(checkQuery, [data.summaryBlood_Id, data.staff_id])

      if (!checkResult || checkResult.length === 0) {
        throw new Error('Report not found or you do not have permission to update this report.')
      }

      // Cập nhật thông tin báo cáo
      const fieldsToUpdate: string[] = []
      const values: any[] = []

      if (data.title !== undefined) {
        fieldsToUpdate.push('Title = ?')
        values.push(data.title)
      }
      if (data.description !== undefined) {
        fieldsToUpdate.push('Description = ?')
        values.push(data.description)
      }

      if (fieldsToUpdate.length > 0) {
        const updateQuery = `
                    UPDATE SummaryBlood
                    SET ${fieldsToUpdate.join(', ')}
                    WHERE SummaryBlood_ID = ?
                `
        values.push(data.summaryBlood_Id)
        await databaseServices.query(updateQuery, values)
      }

      // Cập nhật chi tiết báo cáo nếu có
      if (data.details && data.details.length > 0) {
        for (const detail of data.details) {
          const detailFieldsToUpdate: string[] = []
          const detailValues: any[] = []

          if (detail.volumeIn !== undefined) {
            detailFieldsToUpdate.push('VolumeIn = ?')
            detailValues.push(detail.volumeIn)
          }
          if (detail.volumeOut !== undefined) {
            detailFieldsToUpdate.push('VolumeOut = ?')
            detailValues.push(detail.volumeOut)
          }
          if (detail.note !== undefined) {
            detailFieldsToUpdate.push('Note = ?')
            detailValues.push(detail.note)
          }

          if (detailFieldsToUpdate.length > 0) {
            const detailUpdateQuery = `
                            UPDATE SummaryBlood_Detail
                            SET ${detailFieldsToUpdate.join(', ')}
                            WHERE Report_Detail_ID = ?
                        `
            detailValues.push(detail.Report_Detail_ID)
            await databaseServices.query(detailUpdateQuery, detailValues)
          }
        }
      }

      return { success: true, message: 'Report updated successfully' }
    } catch (error) {
      console.error('Error in updateReport:', error)
      throw error
    }
  }
  public async getLatestReportByStaff(staffId: string): Promise<any> {
    try {
      const query = `
                SELECT S.SummaryBlood_ID, S.Title, S.Report_Date, S.Description, S.Staff_ID, S.Status,
                       SD.Report_Detail_ID, SD.VolumeIn, SD.VolumeOut, SD.Note
                FROM SummaryBlood S
                LEFT JOIN SummaryBlood_Detail SD ON S.SummaryBlood_ID = SD.SummaryBlood_ID
                WHERE S.Staff_ID = ? AND CAST(S.Report_Date AS DATE) = CAST(GETDATE() AS DATE)
                ORDER BY S.Report_Date DESC
            `
      const result = await databaseServices.query(query, [staffId])

      if (!result.length) {
        throw new Error('No report found for today.')
      }

      // Group details by `SummaryBlood_ID`
      const groupedReports = result.reduce((acc: any, item: any) => {
        const {
          SummaryBlood_ID,
          Title,
          Report_Date,
          Description,
          Staff_ID,
          Status,
          Report_Detail_ID,
          VolumeIn,
          VolumeOut,
          Note
        } = item

        if (!acc[SummaryBlood_ID]) {
          acc[SummaryBlood_ID] = {
            SummaryBlood_ID,
            Title,
            Report_Date,
            Description,
            Staff_ID,
            Status,
            Details: []
          }
        }

        if (Report_Detail_ID) {
          acc[SummaryBlood_ID].Details.push({
            Report_Detail_ID,
            VolumeIn,
            VolumeOut,
            Note
          })
        }

        return acc
      }, {})

      return Object.values(groupedReports)[0] // Return the latest report
    } catch (error) {
      console.error('Error in getLatestReportByStaff:', error)
      throw error
    }
  }
  public async getAllBloodUnit(): Promise<bloodUnitUpdateReqBody[]> {
    try {
      const query = `SELECT BU.BloodUnit_ID,
                        BU.BloodType_ID,
                        BT.Blood_group + BT.RHFactor as BloodGroup,
                        BU.Volume,
						BU.Collected_Date,
                        BU.Expiration_Date,
                        BU.Status,
                        BU.Staff_ID
                        FROM BloodUnit BU 
                        JOIN BloodType BT ON BU.BloodType_ID = BT.BloodType_ID`
      const result = await databaseServices.query(query)

      // Map kết quả trả về thành danh sách các đối tượng
      return result.map((item: any) => ({
        BloodUnit_ID: item.BloodUnit_ID,
        BloodType_ID: item.BloodType_ID,
        BloodGroup: item.BloodGroup,
        Volume: item.Volume,
        Collected_Date: item.Collected_Date,
        Expiration_Date: item.Expiration_Date,
        Status: item.Status,
        Staff_ID: item.Staff_ID
      })) as bloodUnitUpdateReqBody[]
    } catch (error) {
      console.error('Error in getAllBloodUnitByStaff:', error)
      throw error
    }
  }
  public async createBloodUnitByStaff(data: bloodUnitCreateReqBody): Promise<any> {
    try {
      // Kiểm tra xem lô máu đã tồn tại trong ngày hay chưa
      const checkQuery = `
                SELECT COUNT(*) AS count
                FROM BloodUnit
                WHERE BloodType_ID = ? AND CAST(Collected_Date AS DATE) = CAST(GETDATE() AS DATE)
            `
      const checkResult = await databaseServices.query(checkQuery, [data.BloodType_ID])

      if (checkResult[0].count > 0) {
        throw new Error('Blood unit for this blood type has already been created today.')
      }

      // Tạo ID mới cho BloodUnit
      const lastRow = await databaseServices.query(
        `SELECT TOP 1 BloodUnit_ID 
                 FROM BloodUnit
                 ORDER BY CAST(SUBSTRING(BloodUnit_ID, 3, LEN(BloodUnit_ID) - 2) AS INT) DESC`
      )

      let newBloodUnitId = 'BU001'
      if (lastRow.length) {
        const lastId = lastRow[0].BloodUnit_ID as string
        const num = parseInt(lastId.slice(2), 10) + 1
        newBloodUnitId = 'BU' + String(num).padStart(3, '0')
      }

      // Thêm mới lô máu
      const insertQuery = `
                INSERT INTO BloodUnit (
                    BloodUnit_ID, BloodType_ID, Volume, Collected_Date, Expiration_Date, Status, Staff_ID
                )
                VALUES (?, ?, ?, GETDATE(), ?, ?, ?)
            `
      await databaseServices.query(insertQuery, [
        newBloodUnitId,
        data.BloodType_ID,
        data.Volume,
        data.Expiration_Date || null,
        data.Status || 'Available',
        data.Staff_ID
      ])

      return {
        success: true,
        message: 'Blood unit created successfully',
        data: {
          BloodUnit_ID: newBloodUnitId,
          BloodType_ID: data.BloodType_ID,
          Volume: data.Volume,
          Collected_Date: new Date().toISOString().slice(0, 10),
          Expiration_Date: data.Expiration_Date || null,
          Status: data.Status || 'Available',
          Staff_ID: data.Staff_ID
        }
      }
    } catch (error) {
      console.error('Error in createBloodUnitByStaff:', error)
      throw error
    }
  }
  public async updateBloodUnitByStaff(data: {
    BloodUnit_ID: string
    Status?: string
    Expiration_Date?: string
    Staff_ID: string
  }): Promise<any> {
    try {
      // Kiểm tra xem lô máu có tồn tại hay không
      const checkQuery = `
                SELECT COUNT(*) AS count
                FROM BloodUnit
                WHERE BloodUnit_ID = ?
            `
      const checkResult = await databaseServices.query(checkQuery, [data.BloodUnit_ID])

      if (checkResult[0].count === 0) {
        throw new Error('Blood unit not found.')
      }

      // Cập nhật thông tin lô máu
      const fieldsToUpdate: string[] = []
      const values: any[] = []

      if (data.Status !== undefined) {
        fieldsToUpdate.push('Status = ?')
        values.push(data.Status)
      }
      if (data.Expiration_Date !== undefined) {
        fieldsToUpdate.push('Expiration_Date = ?')
        values.push(data.Expiration_Date)
      }
      if (data.Staff_ID !== undefined) {
        fieldsToUpdate.push('Staff_ID = ?')
        values.push(data.Staff_ID)
      }

      if (fieldsToUpdate.length === 0) {
        throw new Error('No fields provided for update.')
      }

      const updateQuery = `
                UPDATE BloodUnit
                SET ${fieldsToUpdate.join(', ')}
                WHERE BloodUnit_ID = ?
            `
      values.push(data.BloodUnit_ID)

      await databaseServices.query(updateQuery, values)

      return {
        success: true,
        message: 'Blood unit updated successfully',
        data: {
          BloodUnit_ID: data.BloodUnit_ID,
          Status: data.Status,
          Expiration_Date: data.Expiration_Date,
          Staff_ID: data.Staff_ID
        }
      }
    } catch (error) {
      console.error('Error in updateBloodUnitByStaff:', error)
      throw error
    }
  }

  public async getAllActiveMembers(): Promise<any[]> {
    console.log('getAllActiveMember Repo')
    const query = `
    SELECT *
    FROM Users
    WHERE User_Role = 'member' AND isDelete = 1
  `
    const result = await databaseServices.query(query)

    if (Array.isArray(result)) {
      return result
    }

    return result?.recordset ?? []
  }
}
