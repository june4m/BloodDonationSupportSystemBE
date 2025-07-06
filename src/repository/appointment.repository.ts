import { param } from 'express-validator';
import { Appointment } from './../models/schemas/slot.schema';

import databaseServices from "~/services/database.services";

export class AppointmentRepository{
    async getAllAppointmentList (){
        console.log("Appointment repo delete");
        const query = `
            SELECT ag.Appointment_ID, ag.User_ID, u.User_Name, ag.Slot_ID, s.Slot_Date, 
                   CAST(s.Start_Time AS TIME) AS Start_Time, 
                   CAST(s.End_Time AS TIME) AS End_Time, 
                   ag.Status, ag.Reject_Reason,
                   ag.Health_Declaration,
                   ag.Verified_BloodType,
                   u.Phone,
                   bt.Blood_group
            FROM AppointmentGiving ag
            JOIN Users u ON ag.User_ID = u.User_ID
            LEFT JOIN BloodType bt ON u.BloodType_ID = bt.BloodType_ID
            JOIN Slot s ON ag.Slot_ID = s.Slot_ID
            ORDER BY CAST(SUBSTRING(ag.Appointment_ID, 3, LEN(ag.Appointment_ID) - 1) AS INT) ASC
        `;
        try {
            const result = await databaseServices.query(query);
            console.log("[DEBUG][Repo] Kết quả truy vấn getAllAppointmentList:", result);
            return result
        } catch (error) {
            console.error("[BUG][Repo] Lỗi truy vấn getAllAppointmentList", error);
            throw error
        }
    }
    async deleteApointment(appointmentID: string){
        console.log("Appointment repo delete");
        const query = `DELETE FROM AppointmentGiving WHERE Appointment_ID = ?`
        try {
            const result = await databaseServices.query(query,[appointmentID]);
            return result
        } catch (error) {
            throw new Error('Appointment ID not existsent to delete')
        }
    }
    async findAppointmentByID(appointmentID: string){
        console.log("Appointment repo find Appointment");
        const query = `select * from AppointmentGiving WHERE Appointment_ID = ?`
        try {
            const result = await databaseServices.query(query,[appointmentID]);
            return result
        } catch (error) {
            throw new Error('Appointment ID not existsent')
        }
    }

    async updateAppointmentStatus(appointmentId: string, status: 'A' | 'R' | 'P', rejectReason?: string, verifiedBloodType?: string) {
        let query;
        let params;
        if (status === 'A' || status === 'P' || status === 'R') {
            query = `UPDATE AppointmentGiving SET Status = ?, Reject_Reason = ?, Verified_BloodType = ? WHERE Appointment_ID = ?`;
            params = [status, status === 'R' ? rejectReason : null, verifiedBloodType || null, appointmentId];
        } else {
            query = `UPDATE AppointmentGiving SET Status = ? WHERE Appointment_ID = ?`;
            params = [status, appointmentId];
        }
        return databaseServices.query(query, params);
    }

    async getAppointmentsByUser(userId: string) {
        const query = `
          SELECT ag.Appointment_ID, ag.Slot_ID, s.Slot_Date, 
                 CAST(s.Start_Time AS TIME) AS Start_Time, 
                 CAST(s.End_Time AS TIME) AS End_Time, 
                 ag.Status, ag.Reject_Reason
          FROM AppointmentGiving ag
          JOIN Slot s ON ag.Slot_ID = s.Slot_ID
          WHERE ag.User_ID = ?
          ORDER BY s.Slot_Date DESC
        `;
        return databaseServices.query(query, [userId]);
    }


}