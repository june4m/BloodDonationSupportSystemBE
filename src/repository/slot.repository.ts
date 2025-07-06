import { Appointment } from '~/models/schemas/slot.schema'
import databaseServices from '../services/database.services'
import Database from '../services/database.services'
export class SlotRepository {
  async createSlot(slotData: any) {
    console.log('CreateSlot Repository')
    let newSlotId = 'S001'
    const lastId = `
      SELECT TOP 1 Slot_ID
      FROM Slot
      ORDER BY CAST(SUBSTRING(Slot_ID, 2, LEN(Slot_ID) - 1) AS INT) DESC
      `

    const lastIdResult = await Database.query(lastId)
    if (lastIdResult.length > 0) {
      const lastSlotId = lastIdResult[0].Slot_ID // ex: 'S005'
      const numericPart = parseInt(lastSlotId.slice(1)) // => 5
      const nextId = numericPart + 1
      newSlotId = 'S' + String(nextId).padStart(3, '0') // => 'S006'
    }

    try {
      const { ...fields } = slotData
      // Validate định dạng giờ HH:mm:ss cho Start_Time và End_Time
      const timeRegex = /^([01]\d|2[0-3]):[0-5]\d:[0-5]\d$/;
      if (!fields.Start_Time || !timeRegex.test(fields.Start_Time)) {
        throw new Error('Start_Time phải đúng định dạng HH:mm:ss!');
      }
      if (!fields.End_Time || !timeRegex.test(fields.End_Time)) {
        throw new Error('End_Time phải đúng định dạng HH:mm:ss!');
      }
      const checkDuplicate = await Database.query(
        `SELECT * FROM Slot WHERE Slot_Date = ? AND Start_Time = ? AND End_Time = ?`,
        [fields.Slot_Date, fields.Start_Time, fields.End_Time]
      );
      if (checkDuplicate.length > 0) {
        throw new Error('Đã tồn tại ca hiến máu với ngày và khung giờ này!');
      }
      const insertQuery = `INSERT INTO Slot( Slot_ID, Slot_Date,Start_Time, Volume, Max_Volume,End_Time, Status, Admin_ID
                ) Values(?,?,?,'0','200',?,'A','U001')`
      const params = [
        newSlotId,
        fields.Slot_Date,
        fields.Start_Time,
        fields.End_Time,
      ]
      const result = await Database.queryParam(insertQuery, params)
      console.log('Repository', result)

      return result
    } catch (error) {
      throw error
    }
  }

  async getSlot(status: string, formatTodayDate: string) {
    console.log('Slot repo')
    try {
      const slotData = await Database.query(
        `
        SELECT Slot_ID, Slot_Date, 
          CONVERT(varchar(8), Start_Time, 108) AS Start_Time, 
          CONVERT(varchar(8), End_Time, 108) AS End_Time,
          Volume, Max_Volume, Status, Admin_ID
        FROM Slot 
        WHERE Status = ? AND CAST(slot_date AS DATE) >= ?
        `,
        [status, formatTodayDate]
      )
      console.log('[DEBUG][BE][DB] Slot data lấy từ DB:', slotData)
      return slotData
    } catch (error) {
      throw error
    }
  }

  async registerSlot(appointmentData: Appointment) {
    console.log('register repo')
    // Chỉ chặn nếu user đã đăng ký đúng ca này
    const checkQuery = `SELECT TOP 1 * FROM AppointmentGiving WHERE User_ID = ? AND Slot_ID = ?`;
    const checkResult = await Database.query(checkQuery, [appointmentData.User_ID, appointmentData.Slot_ID]);
    if (checkResult.length > 0) {
      throw new Error('Bạn đã đăng ký ca hiến máu này!');
    }
    let newAppointmentID = 'AP001'
    const lastId = `
      SELECT TOP 1 Appointment_ID
      FROM AppointmentGiving
      ORDER BY CAST(SUBSTRING(Appointment_ID, 3, LEN(Appointment_ID) - 1) AS INT) DESC
      `
    const lastIdResult = await Database.query(lastId)
    console.log('lastIdResult: ', lastIdResult)
    if (lastIdResult.length > 0) {
      const lastAppointmentID = lastIdResult[0].Appointment_ID // ex: 'AP005'
      const numericPart = parseInt(lastAppointmentID.slice(2)) // => 5
      const nextId = numericPart + 1
      newAppointmentID = 'AP' + String(nextId).padStart(3, '0') // => 'AP006'
    }
    console.log('start try')
    try {
      const { ...fields } = appointmentData
      // Đảm bảo volume luôn là 1 nếu không truyền lên
      const volume = fields.Volume ? fields.Volume : 1;
      const insertQuery = `
        INSERT INTO AppointmentGiving (Appointment_ID, Slot_ID, User_ID, Status, Health_Declaration, Volume)
        VALUES (?, ?, ?, 'P', ?, ?)
        `
      const params = [newAppointmentID, fields.Slot_ID, fields.User_ID, JSON.stringify(fields.Health_Declaration || null), volume]
      const addAppointment = await Database.queryParam(insertQuery, params)
      console.log(addAppointment)
      return addAppointment
    } catch (error) {
      throw error
    }
  }
}
