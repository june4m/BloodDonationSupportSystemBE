import { PotentialDonor } from "~/models/schemas/potentialDonor.schema";
import { EmergencyRequestReqBody } from "~/models/schemas/slot.schema";

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
    async addEmergencyRequest(data: EmergencyRequestReqBody): Promise<void> {
        try {
         
          const lastAppointmentRow = await databaseServices.query(
            `SELECT TOP 1 Appointment_ID FROM AppointmentGiving
             ORDER BY CAST(SUBSTRING(Appointment_ID, 3, LEN(Appointment_ID) - 2) AS INT) DESC`
          );
      
          let newAppointmentId = 'AP001';
          if (lastAppointmentRow.length) {
            const lastId = lastAppointmentRow[0].Appointment_ID as string;
            const num = parseInt(lastId.slice(2), 10) + 1;
            newAppointmentId = 'AP' + String(num).padStart(3, '0');
          }
      
        
          const appointmentQuery = `
            INSERT INTO AppointmentGiving (
              Appointment_ID, Slot_ID, User_ID, Volume, Status
            )
            VALUES (?, ?, ?, ?, ?)
          `;
          await databaseServices.query(appointmentQuery, [
            newAppointmentId,
            data.Slot_ID || null,
            data.User_ID || null,
            data.Volume || null,
            'Pending',
          ]);
      
         
          const lastEmergencyRow = await databaseServices.query(
            `SELECT TOP 1 Emergency_ID FROM EmergencyRequest
             ORDER BY CAST(SUBSTRING(Emergency_ID, 3, LEN(Emergency_ID) - 2) AS INT) DESC`
          );
      
          let newEmergencyId = 'ER001';
          if (lastEmergencyRow.length) {
            const lastId = lastEmergencyRow[0].Emergency_ID as string;
            const num = parseInt(lastId.slice(2), 10) + 1;
            newEmergencyId = 'ER' + String(num).padStart(3, '0');
          }
      
      
          const emergencyQuery = `
            INSERT INTO EmergencyRequest (
              Emergency_ID, Volume, Priority, Status, Needed_Before, Created_At, Updated_At, Potential_ID, Appointment_ID, BloodType_ID,
              Requester_Name, Requester_Phone, Requester_Address
            )
            VALUES (?, ?, ?, ?, ?, GETDATE(), GETDATE(), ?, ?, ?, ?, ?, ?)
          `;
          await databaseServices.query(emergencyQuery, [
            newEmergencyId,
            data.Volume || null,
            data.Priority || 'Normal',
            data.Status || 'Pending',
            data.Needed_Before || null,
            data.Potential_ID || null,
            newAppointmentId, 
            data.BloodType_ID || null,
            data.Requester_Name,
            data.Requester_Phone,
            data.Requester_Address || null,
          ]);
        } catch (error) {
          console.error('Error in addEmergencyRequest:', error);
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
    
}