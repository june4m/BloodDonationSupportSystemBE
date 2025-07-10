
import { PotentialDonor } from "~/models/schemas/potentialDonor.schema";
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
            const query = `SELECT * FROM EmergencyRequest`;
            const result = await databaseServices.query(query);
            return result.map((item: any) => ({
                Emergency_ID: item.Emergency_ID,
                Requester_ID: item.Requester_ID,
                Volume: item.Volume,
                BloodType_ID: item.BloodType_ID,
                Needed_Before: item.Needed_Before,
                Status: item.Status,
                Created_At: item.Created_At,
                Updated_At: item.Updated_At
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
}