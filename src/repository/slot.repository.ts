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
      const insertQuery = `INSERT INTO Slot( Slot_ID, Slot_Date,Start_Time, Volume, Max_Volume,End_Time, Status, User_ID
                ) Values(?,?,?,?,?,?,?,?)`
      const params = [
        newSlotId,
        fields.Slot_Date,
        fields.Start_Time,
        fields.Volume,
        fields.Max_Volume,
        fields.End_Time,
        fields.Status,
        fields.User_ID
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
        SELECT * FROM Slot 
        WHERE Status = ? AND CAST(slot_date AS DATE) >= ?
        `,
        [status, formatTodayDate]
      )
      console.log(slotData)
      return slotData
    } catch (error) {
      throw error
    }
  }

  async registerSlot(appointmentData: any) {
    console.log('register repo')
    let newSlotId = 'AP001'
    const lastId = `
      SELECT TOP 1 Appointment_ID
      FROM AppointmentGiving
      ORDER BY CAST(SUBSTRING(Appointment_ID, 3, LEN(Appointment_ID) - 1) AS INT) DESC
      `
    const lastIdResult = await Database.query(lastId)
    console.log('lastIdResult: ', lastIdResult)
    if (lastIdResult.length > 0) {
      const lastSlotId = lastIdResult[0].Appointment_ID // ex: 'AP005'
      const numericPart = parseInt(lastSlotId.slice(2)) // => 5
      const nextId = numericPart + 1
      newSlotId = 'AP' + String(nextId).padStart(3, '0') // => 'AP006'
    } // else {
    //   console.log('fail update slotid')
    // }
    console.log('start try')
    try {
      const { ...fields } = appointmentData
      const insertQuery = `
        INSERT INTO AppointmentGiving (Appointment_ID, Slot_ID, User_ID, Status)
        VALUES (?, ?, ?, 'A')
        `
      const params = [newSlotId, fields.Slot_ID, fields.User_ID]
      const addAppointment = await Database.queryParam(insertQuery, params)
      //       await Database.query(
      //         `UPDATE Slot
      // SET Volume += 1
      // WHERE Slot_ID = ?`,
      //         [fields.Slot_ID]
      //       )
      console.log(addAppointment)
      return addAppointment
    } catch (error) {
      throw error
    }
  }
}
