import { PotentialDonor } from "~/models/schemas/potentialDonor.schema";
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
}