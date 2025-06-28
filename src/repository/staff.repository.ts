import { PotentialDonor } from "~/models/schemas/potentialDonor.schema";
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
    async addMemberToPotentialList(userId: string,note:string, staffId: string): Promise<void> {
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
}