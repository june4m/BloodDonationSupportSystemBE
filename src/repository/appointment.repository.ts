import { param } from 'express-validator'
import { Appointment } from './../models/schemas/slot.schema'

import databaseServices from '~/services/database.services'

export class AppointmentRepository {
  async getAllAppointmentList() {
    console.log('Appointment repo getAppointmentList')
    const query = `SELECT 
      A.Appointment_ID AS Appointment_ID,
      U.User_Name AS Name,
      U.Email AS Email,
      U.Phone As Phone,
      S.Slot_Date AS DATE,
      B.Blood_group,
      A.Volume
    FROM AppointmentGiving A
    JOIN Users U ON A.User_ID = U.User_ID
    JOIN Slot S ON A.Slot_ID = S.Slot_ID
    JOIN BloodType B ON U.BloodType_ID = B.BloodType_ID`
    try {
      const result = await databaseServices.query(query)
      return result
    } catch (error) {
      console.error('Nothing appointment to print', error)
      throw error
    }
  }
  async deleteApointment(appointmentID: string) {
    console.log('Appointment repo delete')
    const query = `DELETE FROM AppointmentGiving WHERE Appointment_ID = ?`
    try {
      const result = await databaseServices.query(query, [appointmentID])
      return result
    } catch (error) {
      throw new Error('Appointment ID not existsent to delete')
    }
  }
  async findAppointmentByID(appointmentID: string) {
    console.log('Appointment repo find Appointment')
    const query = `select * from AppointmentGiving WHERE Appointment_ID = ?`
    try {
      const result = await databaseServices.query(query, [appointmentID])
      return result
    } catch (error) {
      throw new Error('Appointment ID not exist')
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

  async updateVolume(appointmentId: string, volume: number): Promise<void> {
    console.log('updateVolume repository')
    const query = `UPDATE AppointmentGiving SET Volume = ? WHERE Appointment_ID = ?`
    const params = [volume, appointmentId]

    try {
      const result = await databaseServices.queryParam(query, params)
      console.log('Volume updated: ', result)
    } catch (error) {
      console.log('Failed to update volume: ', error)
      throw error
    }
  }

  async updateUserHistoryAfterDonation(appointmentId: string): Promise<void> {
    try {
      const query = `
        SELECT A.User_ID, A.Slot_ID, A.Volume, S.Slot_Date, S.Start_Time
        FROM AppointmentGiving A
        JOIN Slot S ON A.Slot_ID = S.Slot_ID
        WHERE A.Appointment_ID = ?
        `
      const result = await databaseServices.query(query, [appointmentId])
      if (query.length === 0) {
        throw new Error('Appointment not found or Slot not linked')
      }

      const { User_ID, Volume, Slot_Date, Start_Time } = result[0]

      //format
      const dateStr = new Date(Slot_Date).toISOString().split('T')[0]
      let timeStr = ''
      if (typeof Start_Time === 'string') {
        timeStr = Start_Time.substring(0, 8)
      } else if (Start_Time instanceof Date) {
        timeStr = Start_Time.toISOString().substring(11, 19) // Lấy đúng giờ, phút, giây
      } else {
        timeStr = '00:00:00'
      }
      const historyText = `Đã hiến ${Volume}ml vào ngày ${dateStr} lúc ${timeStr} | `

      //lấy history hiện tại
      const getHistoryQuery = `SELECT History FROM Users WHERE User_ID = ?`
      const historyResult = await databaseServices.query(getHistoryQuery, [User_ID])
      const currentHistory = historyResult[0]?.History || ''

      //nối history mới vào
      const newHistory = currentHistory + historyText
      const updateHistoryQuery = `UPDATE Users SET History = ? WHERE User_ID = ?`
      await databaseServices.query(updateHistoryQuery, [newHistory, User_ID])
      console.log('Updated user history after donation')
    } catch (error) {
      console.log('Failed to update user history: ', error)
      throw error
    }
  }

  public async getAppointmentById(appointmentId: string): Promise<any | null> {
    console.log('getAppointmentById Appointment Repo')
    const query = `
    SELECT User_ID, Slot_ID, Status
    FROM AppointmentGiving
    WHERE Appointment_ID = ?
    `
    const result = await databaseServices.queryParam(query, [appointmentId])
    console.log('getAppointmentById result: ', result)
    if (result && result.recordset && result.recordset.length > 0) {
      console.log('result.recordset[0]: ', result.recordset[0])
      return result.recordset[0]
    }
    return null
  }
}
