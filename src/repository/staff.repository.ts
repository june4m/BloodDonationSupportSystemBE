import moment from "moment";
import { PotentialDonor } from "~/models/schemas/potentialDonor.schema";
import { InfoRequesterEmergency, PotentialDonorCriteria } from "~/models/schemas/requests/user.requests";
import { EmergencyRequestReqBody, UpdateEmergencyRequestReqBody } from "~/models/schemas/slot.schema";

import { User } from "~/models/schemas/user.schema";
import databaseServices from "~/services/database.services";
import { sendEmailService } from "~/services/email.services";

export class StaffRepository {
    async getPotentialList(): Promise<PotentialDonor[]> {
        try {
            const result = await databaseServices.query(
                `SELECT * FROM PotentialDonor `
            )
            return result.map((item: any) => ({
                Potential_ID: item.Potential_ID,
                User_ID: item.User_ID,
                Status: item.Status,
                Note: item.Note || '',
                Staff_ID: item.Staff_ID || ''
            })) as PotentialDonor[];
        }
        catch (error) {
            console.error('Error in getPotentialList:', error);
            throw error;
        }
    }
    async getMemberList(): Promise<User[]> {
        try {
            const result = await databaseServices.query(
                `SELECT * FROM Users WHERE User_Role = 'member'`
            )
            return result.map((item: any) => ({
                User_ID: item.User_ID,
                User_Name: item.User_Name,
                Email: item.Email,
                Phone: item.Phone || '',
                Blood_Type: item.Blood_Type || '',
                Date_Of_Birth: item.Date_Of_Birth || null,
                User_Role: item.User_Role
            })) as User[];
        } catch (error) {
            console.error('Error in getMemberList:', error);
            throw error;
        }
    }
    async addMemberToPotentialList(userId: string, staffId: string, note: string): Promise<void> {
        try {
            const lastRow = await databaseServices.query(
                `SELECT TOP 1 Potential_ID FROM PotentialDonor
                 ORDER BY CAST(SUBSTRING(Potential_ID, 3, LEN(Potential_ID) - 2) AS INT) DESC`
            );
            let newPotentialId = 'PD001';
            if (lastRow.length) {
                const lastId = lastRow[0].Potential_ID as string;
                const num = parseInt(lastId.slice(2), 10) + 1;
                newPotentialId = 'PD' + String(num).padStart(3, '0');
            }
            const query = `INSERT INTO PotentialDonor (Potential_ID, User_ID, Status, Note, Staff_ID)
                            VALUES (?, ?, 'Pending', ?, ?)`;
            await databaseServices.query(query, [newPotentialId, userId, note, staffId])
        } catch (error) {
            console.error('Error in addMemberToPotentialList:', error);
            throw error;
        }
    }
    public async createEmergencyRequest(data: EmergencyRequestReqBody): Promise<any> {
        try {
            const lastRow = await databaseServices.query(
                `SELECT TOP 1 Emergency_ID FROM EmergencyRequest
                 ORDER BY CAST(SUBSTRING(Emergency_ID, 3, LEN(Emergency_ID) - 2) AS INT) DESC`
            );

            let newEmergencyId = 'ER001';
            if (lastRow.length) {
                const lastId = lastRow[0].Emergency_ID as string;
                const num = parseInt(lastId.slice(2), 10) + 1;
                newEmergencyId = 'ER' + String(num).padStart(3, '0');
            }

            const query = `
            INSERT INTO EmergencyRequest (
                Emergency_ID, Requester_ID, Volume, BloodType_ID, Needed_Before, Status, Created_At, Updated_At, reason_Need
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, GETDATE(), ?)
        `;
            await databaseServices.query(query, [
                newEmergencyId,
                data.Requester_ID,
                data.Volume,
                data.BloodType_ID,
                data.Needed_Before,
                data.Status,
                data.Created_At,
                data.reason_Need
            ]);

            return { Emergency_ID: newEmergencyId, ...data };
        } catch (error) {
            console.error('Error in createEmergencyRequest:', error);
            throw error;
        }
    }
    public async checkRecentEmergencyRequest(
        userId: string
      ): Promise<boolean> {
        try {
          const query = `
            SELECT COUNT(*) AS cnt
            FROM EmergencyRequest
            WHERE Requester_ID = ?
              AND Status       <> 'Complete'
          `;
          const result = await databaseServices.query(query, [userId]);
          // Nếu cnt > 0 nghĩa là vẫn còn request chưa complete
          return result[0].cnt > 0;
        } catch (error) {
          console.error('Error in checkRecentEmergencyRequest:', error);
          throw error;
        }
      }
    async checkPotentialDonorExists(userId: string): Promise<boolean> {
        try {
            const query = `
              SELECT COUNT(*) AS count
              FROM PotentialDonor
              WHERE User_ID = ?
          `;
            const result = await databaseServices.query(query, [userId]);
            return result[0].count > 0;
        } catch (error) {
            console.error('Error in checkPotentialDonorExists:', error);
            throw error;
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
                            D.User_ID                       AS Donor_ID
                        FROM EmergencyRequest ER
                        JOIN Users U ON ER.Requester_ID = U.User_ID
                        JOIN BloodType B ON ER.BloodType_ID = B.BloodType_ID
                        LEFT JOIN PotentialDonor PD ON ER.Potential_ID = PD.Potential_ID
                        LEFT JOIN Users D ON PD.User_ID = D.User_ID;`;
            const result = await databaseServices.query(query);
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
                Donor_ID: item.Donor_ID,
            })) as EmergencyRequestReqBody[];

        } catch (error) {
            console.error('Error in getEmergencyRequests:', error);
            throw error;
        }
    }
    public async updateEmergencyRequest(data: UpdateEmergencyRequestReqBody): Promise<any> {
        try {
            const query = `
                UPDATE EmergencyRequest
                SET Priority = ?, Status = ?, Potential_ID = ?, Appointment_ID = ?, Staff_ID = ?, Updated_At = ?
                WHERE Emergency_ID = ?
            `;
            await databaseServices.query(query, [
                data.Priority,
                data.Status,
                data.Potential_ID,
                data.Appointment_ID,
                data.Staff_ID,
                data.Updated_At,
                data.Emergency_ID,
            ]);

            return { success: true, message: 'Emergency request updated successfully' };
        } catch (error) {
            console.error('Error in updateEmergencyRequest:', error);
            throw error;
        }
    }
    public async getBloodBank(): Promise<any[]> {
        try {
            const query = `SELECT BloodBank_ID, BloodUnit_ID, Volume,Storage_Date, Status, Last_Update FROM BloodBank`;
            const result = await databaseServices.query(query);

            // Map kết quả trả về thành danh sách các đối tượng
            return result.map((item: any) => ({
                BloodBank_ID: item.BloodBank_ID,
                BloodUnit_ID: item.BloodUnit_ID,
                Volume: item.Volume,
                Storage_Date: item.Storage_Date,
                Status: item.Status,
                Updated_At: item.Updated_At,
            }));
        } catch (error) {
            console.error('Error in getBloodBank:', error);
            throw error;
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
              AND U.Status = 'Active'`;
            const rows: any[] = await databaseServices.query(query, [User_Id]);
            return rows.map(item => {
                return {
                    User_ID: item.User_Id,
                    User_Name: item.User_Name,
                    BloodGroup: item.BloodGroup,
                    Date_Of_Birth: moment(item.Date_Of_Birth).format('YYYY-MM-DD'),
                    Full_Address: item.Full_Address,
                    Phone: item.Phone,
                    Email: item.Email,
                    Gender: item.Gender
                };
            });
        } catch (error) {
            console.error('Error in getProfileRequesterById:', error);
            throw error;
        }
    }
    /**
     * Lấy danh sách potential theo 3 tiêu chí
     *  1) cùng Xã/Phường/Quận, Thành phố=> tiêu chí khoảng cách nè
     *  2) nhóm máu tương thích => Cùng nhóm
     *  3) lần hiến gần nhất >= 3 tháng
     */
    public async getPotentialDonorCriteria(
        emergencyId: string,
    ): Promise<PotentialDonorCriteria[]> {
        // 1) Lấy nhóm máu từ EmergencyRequest
        const req = (await databaseServices.query(
            `
        SELECT ER.BloodType_ID AS requestedBTID,
               ER.Requester_ID AS requesterID
        FROM EmergencyRequest ER
        WHERE ER.Emergency_ID = ? 
            AND ER.Status = 'Pending'
        `,
            [emergencyId]
        )) as any[];

        if (!req.length) return [];
        const requestedBTID = req[0].requestedBTID;
        const requesterId = req[0].requesterID; // Thêm dòng này

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
        )) as any[];

        // 3) Map về DTO
        return rows.map(r => ({
            potentialId: r.potentialId,
            userId: r.userId,
            userName: r.userName,
            bloodType: r.bloodType,
            lastDonation: r.donationDate
                ? (r.donationDate as Date).toISOString().slice(0, 10)
                : "",
            address: r.Address,
            proximity: r.proximity,      // 1 = same ward, 2 = same city
            monthsSince: r.monthsSince ,
            email: r.Email,    // >= 3
        }));
    }
    public async sendEmergencyEmailFixed(
        donorEmail: string,
        donorName: string
    ): Promise<any> {
        try {
            const subject = `🩸 Cần sự hỗ trợ khẩn cấp - Hiến máu cứu người`;
            
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
            `;

            await sendEmailService(donorEmail, subject, htmlContent);
            
            return {
                success: true,
                message: 'Email sent successfully',
                data: {
                    donorEmail,
                    donorName,
                    sentAt: new Date().toISOString()
                }
            };
            
        } catch (error) {
            console.error('Error in sendEmergencyEmailFixed:', error);
            throw error;
        }
    }

    public async checkPotentialInOtherEmergency(potentialId: string): Promise<boolean> {
        try {
            const query = `
                SELECT COUNT(*) AS count
                FROM EmergencyRequest
                WHERE Potential_ID = ?
                  AND Status <> 'Complete'
            `;
            const result = await databaseServices.query(query, [potentialId]);
            return result[0].count > 0; // Nếu count > 0 nghĩa là Potential_ID đang được sử dụng trong Emergency khác chưa hoàn thành
        } catch (error) {
            console.error('Error in checkPotentialInOtherEmergency:', error);
            throw error;
        }
    }
    public async addPotentialDonorByStaffToEmergency(
        emergencyId: string,
        potentialId: string,
        staffId: string
    ): Promise<any> {
        try {
            
            const isPotentialInOtherEmergency = await this.checkPotentialInOtherEmergency(potentialId);
            if (isPotentialInOtherEmergency) {
                throw new Error('Potential donor is already assigned to another emergency that is not complete');
            }
            const emergencyQuery = `
                SELECT Emergency_ID, Status, Potential_ID 
                FROM EmergencyRequest 
                WHERE Emergency_ID = ? AND Status = 'Pending'
            `;
            const emergencyResult = await databaseServices.query(emergencyQuery, [emergencyId]);
            if (!emergencyResult.length) {
                throw new Error('Emergency request not found or not pending');
            }
            const updateQuery = `
                UPDATE EmergencyRequest 
                SET Potential_ID = ?, 
                    Staff_ID = ?, 
                    Updated_At = GETDATE()
                WHERE Emergency_ID = ?
            `;
            await databaseServices.query(updateQuery, [potentialId, staffId, emergencyId]);
    
            return {
                success: true,
                message: 'Potential donor assigned to emergency successfully',
                data: {
                    Emergency_ID: emergencyId,
                    Potential_ID: potentialId,
                    Staff_ID: staffId,
                    Updated_At: new Date(),
                }
            };
        } catch (error) {
            console.error('Error in addPotentialDonorByStaffToEmergency:', error);
            throw error;
        }
    }

}