
import moment from "moment";
import { PotentialDonor } from "~/models/schemas/potentialDonor.schema";
import { InfoRequesterEmergency, PotentialDonorCriteria } from "~/models/schemas/requests/user.requests";
import { EmergencyRequestReqBody, UpdateEmergencyRequestReqBody } from "~/models/schemas/slot.schema";

import { User } from "~/models/schemas/user.schema";
import databaseServices from "~/services/database.services";

export class StaffRepository {
    async getPotentialList(): Promise<PotentialDonor[]>{
        try{
            const result = await databaseServices.query(
                `SELECT * FROM PotentialDonor `
            )
            return result.map((item: any) => ({
                Potential_ID: item.Potential_ID,
                User_ID: item.User_ID, 
                Status: item.Status,
                Note: item.Note || '',
                Staff_ID: item.Staff_ID ||''
            })) as PotentialDonor[];
        }
        catch (error) {
            console.error('Error in getPotentialList:', error);
            throw error;
        }
    }
    async getMemberList():Promise<User[]>{
        try{
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
        }catch (error) {
            console.error('Error in getMemberList:', error);
            throw error;
        }
    }
    async addMemberToPotentialList(userId: string,staffId: string,note:string): Promise<void> {
        try {
            const lastRow = await databaseServices.query(
                `SELECT TOP 1 Potential_ID FROM PotentialDonor
                 ORDER BY CAST(SUBSTRING(Potential_ID, 3, LEN(Potential_ID) - 2) AS INT) DESC`
              );
              let newPotentialId = 'PD001';
              if(lastRow.length){
                const lastId = lastRow[0].Potential_ID as string;
                const num = parseInt(lastId.slice(2), 10) + 1;
                newPotentialId = 'PD' + String(num).padStart(3, '0');
              }
              const query = `INSERT INTO PotentialDonor (Potential_ID, User_ID, Status, Note, Staff_ID)
                            VALUES (?, ?, 'Pending', ?, ?)`;
              await databaseServices.query(query,[newPotentialId,userId,note, staffId])
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
                Emergency_ID, Requester_ID, Volume, BloodType_ID, Needed_Before, Status, Created_At, Updated_At
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, GETDATE())
        `;
            await databaseServices.query(query, [
                newEmergencyId,
                data.Requester_ID,
                data.Volume,
                data.BloodType_ID,
                data.Needed_Before,
                data.Status,
                data.Created_At,
            ]);
    
            return { Emergency_ID: newEmergencyId, ...data };
        } catch (error) {
            console.error('Error in createEmergencyRequest:', error);
            throw error;
        }
    }
    public async checkRecentEmergencyRequest(userId: string): Promise<boolean> {
        try {
            const query = `
                SELECT COUNT(*) AS count
                FROM EmergencyRequest
                WHERE Requester_ID = ? AND Created_At >= DATEADD(SECOND, -10, GETDATE())
            `;
            const result = await databaseServices.query(query, [userId]);
            console.log('Spam check result:', result[0].count); // Debug kết quả
            return result[0].count > 0; // Trả về true nếu đã có yêu cầu trong 1 giờ qua
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
                            U.User_Name,
                            ER.Requester_ID,
                            B.Blood_group + B.RHFactor AS BloodType,
                            ER.Volume, 
                            ER.Needed_Before,
                            ER.Priority,
                            ER.sourceType,
                            ER.Potential_ID,
                            ER.Place,
                            ER.Status
                        FROM EmergencyRequest ER
                        JOIN Users U ON ER.Requester_ID = U.User_ID
                        JOIN BloodType B ON ER.BloodType_ID = B.BloodType_ID;`;
            const result = await databaseServices.query(query);
            return result.map((item: any) => ({
                Requester_ID: item.Requester_ID,
                User_Name: item.User_Name,
                BloodType: item.BloodType,
                Volume: item.Volume,
                Needed_Before: item.Needed_Before,
                Priority: item.Priority,
                sourceType: item.sourceType,
                Potential_ID: item.Potential_ID,
                Place: item.Place,
                Status: item.Status
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
    
    public async getProfileRequesterById(User_Id: string): Promise<InfoRequesterEmergency []> {
        try {
            const query = `
            SELECT E.Requester_ID as User_Id,
                    U.User_Name,
                    U.YOB as Date_Of_Birth,
                    U.Address As Full_Address,
                    U.Phone,
                    U.Email,
                    U.Gender 
                        FROM EmergencyRequest E JOIN Users U 
                        ON E.Requester_ID = U.User_ID 
                        WHERE E.Requester_ID = ?
                        AND U.Status = 'Active'`;
            const rows: any[] = await databaseServices.query(query, [User_Id]);
            return rows.map(item => {
                const parts = item.Full_Address.split(',').map((p: string) => p.trim());
                const ward    = parts[1] || '';
                const city    = parts[2] || '';
                return {
                        User_ID:       item.User_Id,
                        User_Name:     item.User_Name,
                        Date_Of_Birth: moment(item.Date_Of_Birth).format('YYYY-MM-DD'),
                        Full_Address:  item.Full_Address,
                        WardOrCommune: ward,
                        City:city,
                        Phone:item.Phone,
                        Email:item.Email,
                        Gender:item.Gender
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
        requesterId: string
    ): Promise<PotentialDonorCriteria[]> {
        // 1) Lấy nhóm máu từ EmergencyRequest
        const req = (await databaseServices.query(
        `
        SELECT ER.BloodType_ID AS requestedBTID
        FROM EmergencyRequest ER
        WHERE ER.Requester_ID = ?
            AND ER.Status       = 'Pending'
        `,
        [requesterId]
        )) as any[];

        if (!req.length) return [];
        const requestedBTID = req[0].requestedBTID;

        // 2) Chạy batch T‑SQL bạn cung cấp
        const rows = (await databaseServices.query(
        `
        DECLARE @BTID       VARCHAR(20)  = ?;       -- nhóm máu người nhận
        DECLARE @ReceiverID NVARCHAR(20) = ?;       -- requesterId
        DECLARE @ADDR       NVARCHAR(200);
        DECLARE @PHUONG     NVARCHAR(100);
        DECLARE @QUAN       NVARCHAR(100);

        -- Lấy address của requester
        SELECT @ADDR = Address
        FROM Users
        WHERE User_ID = @ReceiverID;

        -- Tách phường & quận
        SET @PHUONG = LTRIM(RTRIM(PARSENAME(REPLACE(@ADDR, ', ', '.'), 2)));
        SET @QUAN   = LTRIM(RTRIM(PARSENAME(REPLACE(@ADDR, ', ', '.'), 1)));

        WITH DonorMatches AS (
            SELECT
            PD.Potential_ID            AS potentialId,
            U.User_ID                  AS userId,
            U.User_Name                AS userName,
            B.Blood_group + B.RHFactor AS bloodType,
            U.History                  AS history,
            U.Address                  AS address,

            -- parse ngày hiến gần nhất từ History
            TRY_CONVERT(
                DATE,
                SUBSTRING(
                U.History,
                CHARINDEX(' on ', U.History) + LEN(' on '),
                10
                ),
                23
            ) AS donationDate
            FROM PotentialDonor PD
            JOIN Users U ON PD.User_ID = U.User_ID
            JOIN BloodType B ON U.BloodType_ID = B.BloodType_ID
            JOIN BloodCompatibility BC
            ON BC.Donor_Blood_ID    = U.BloodType_ID
            AND BC.Receiver_Blood_ID = @BTID
            AND BC.Is_Compatible     = 1
            WHERE
            U.Status      = 'Active'
            AND U.History IS NOT NULL
            AND CHARINDEX(' on ', U.History) > 0
            AND CHARINDEX(' at', U.History) > CHARINDEX(' on ', U.History)
        )
        SELECT
            dm.*,
            DATEDIFF(MONTH, dm.donationDate, GETDATE()) AS monthsSince,
            CASE
            WHEN
                LTRIM(RTRIM(PARSENAME(REPLACE(dm.address, ', ', '.'), 2))) = @PHUONG
                AND LTRIM(RTRIM(PARSENAME(REPLACE(dm.address, ', ', '.'), 1))) = @QUAN
            THEN 1
            WHEN
                LTRIM(RTRIM(PARSENAME(REPLACE(dm.address, ', ', '.'), 1))) = @QUAN
            THEN 2
            ELSE NULL
            END AS proximity
        FROM DonorMatches dm
        WHERE
            dm.donationDate IS NOT NULL
            AND DATEDIFF(MONTH, dm.donationDate, GETDATE()) >= 3
            AND CASE
                WHEN
                    LTRIM(RTRIM(PARSENAME(REPLACE(dm.address, ', ', '.'), 2))) = @PHUONG
                    AND LTRIM(RTRIM(PARSENAME(REPLACE(dm.address, ', ', '.'), 1))) = @QUAN
                THEN 1
                WHEN
                    LTRIM(RTRIM(PARSENAME(REPLACE(dm.address, ', ', '.'), 1))) = @QUAN
                THEN 2
                END = (
                SELECT MIN(
                    CASE
                    WHEN
                        LTRIM(RTRIM(PARSENAME(REPLACE(address, ', ', '.'), 2))) = @PHUONG
                        AND LTRIM(RTRIM(PARSENAME(REPLACE(address, ', ', '.'), 1))) = @QUAN
                    THEN 1
                    WHEN
                        LTRIM(RTRIM(PARSENAME(REPLACE(address, ', ', '.'), 1))) = @QUAN
                    THEN 2
                    END
                )
                FROM DonorMatches
                )
        ORDER BY dm.userName;
        `,
        // bind vào hai dấu hỏi tương ứng
        [requestedBTID, requesterId]
        )) as any[];

        // 3) Map về DTO
        return rows.map(r => ({
        potentialId:  r.potentialId,
        userId:       r.userId,
        userName:     r.userName,
        bloodType:    r.bloodType,
        lastDonation: r.donationDate
            ? (r.donationDate as Date).toISOString().slice(0, 10)
            : "",
        address:      r.address,
        proximity:    r.proximity,      // 1 = same ward, 2 = same city
        monthsSince:  r.monthsSince     // >= 3
        }));
    }
    
}