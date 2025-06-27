import { param } from 'express-validator';
import { Appointment } from './../models/schemas/slot.schema';

import databaseServices from "~/services/database.services";

export class AppointmentRepository{
    async getAllAppointmentList (){
        console.log("Appointment repo delete");
        const query = `select * from AppointmentGiving`
        try {
            const result = await databaseServices.query(query);
            return result
        } catch (error) {
            console.error("Nothing appointment to print", error);
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
    //Omit<T,K> kiểu có thể nhận tất cả mọi thứ trừ cột AppointmentID
    // async editApointment(appointmentID: string, updates: Partial<Omit<Appointment, 'Appointment_ID'>>): Promise<Appointment>{
    //     console.log("Appointment repo find Appointment");
    //     const allowedFields:(keyof Omit<Appointment, 'Appointment_ID'>)[]=[
    //         'User_ID',
    //         'Slot_ID',
    //         'Volume',
    //         'Status'
    //     ]
    //     const setClaudes: string [] = []
    //     const params: any[] = []
    //     for(const field of allowedFields){
    //         if(updates[field]!==undefined){
    //             setClaudes.push(`${field} = ?`)
    //             params.push(updates[field])
    //         }
    //     }
    //     if(setClaudes.length ===0){
    //         throw new Error('Nothing to update');
    //     }
        
    // }
}