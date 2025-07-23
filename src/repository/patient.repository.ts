import { PatientDetail, PatientDetailV2 } from '~/models/schemas/patient.schema'
import databaseServices from '~/services/database.services'
import Database from '../services/database.services'

export class PatientDetailRepository {
  public async createNextPatientId(): Promise<string> {
    const sql = `
    SELECT TOP 1 Patient_ID
    FROM Patient_Detail
    ORDER BY CAST(SUBSTRING(Patient_ID, 2, LEN(Patient_ID) - 1) AS INT) DESC
  `
    const result = await Database.query(sql)
    let nextId = 'P001'
    if (result.length > 0) {
      const lastId = result[0].Patient_ID
      const numeric = parseInt(lastId.slice(1)) + 1
      nextId = 'P' + String(numeric).padStart(3, '0')
    }
    return nextId
  }

  public async checkDuplicatePatientDetail(appointmentId: string): Promise<boolean> {
    const query = `
      SELECT COUNT(*) AS count 
      FROM Patient_Detail pd
      JOIN AppointmentGiving ag ON ag.Appointment_ID = pd.Appointment_ID
      JOIN Slot s ON s.Slot_ID = ag.Slot_ID
      WHERE pd.Appointment_ID = ?
    `
    const result = await Database.query(query, [appointmentId])
    return result[0].count > 0
  }

  public async addPatientDetail(patientDetailData: PatientDetail): Promise<any> {
    let newPatientId = 'P001'
    const lastId = `
          SELECT TOP 1 Patient_ID
          FROM Patient_Detail
          ORDER BY CAST(SUBSTRING(Patient_ID, 2, LEN(Patient_ID) - 1) AS INT) DESC
          `

    const lastIdResult = await Database.query(lastId)
    console.log('lastIdResult: ', lastIdResult[0])
    if (lastIdResult.length > 0) {
      const lastPatientId = lastIdResult[0].Patient_ID // ex: 'S005'
      console.log('lastPatientId: ', lastPatientId)
      const numericPart = parseInt(lastPatientId.slice(1)) // => 5
      console.log('numericPart: ', numericPart)
      const nextId = numericPart + 1
      console.log('nextId: ', nextId)
      newPatientId = 'P' + String(nextId).padStart(3, '0') // => 'S006'
      console.log('newPatientId: ', newPatientId)
    }

    const query = `
      INSERT INTO Patient_Detail (Patient_ID, User_ID, Description, Status, MedicalHistory, Appointment_ID)
      VALUES (?, ?, ?, ?, ?, ?)
    `
    const params = [
      newPatientId,
      patientDetailData.User_ID,
      patientDetailData.Description,
      patientDetailData.Status,
      patientDetailData.MedicalHistory,
      patientDetailData.Appointment_ID
    ]
    const result = await Database.query(query, params)
    if (result && result.affectedRows > 0) {
      return { success: true, patientId: newPatientId }
    } else {
      return { success: false }
    }
  }

  public async addPatientDetailV2(patientDetailData: PatientDetailV2): Promise<{ success: boolean }> {
    console.log('addPatientDetailV2 Repo')
    const query = `
    INSERT INTO Patient_Detail (Patient_ID, Description, Status, MedicalHistory, Appointment_ID)
    VALUES (?, ?, ?, ?, ?)
  `
    const params = [
      patientDetailData.Patient_ID,
      patientDetailData.Description,
      patientDetailData.Status,
      patientDetailData.MedicalHistory,
      patientDetailData.Appointment_ID
    ]
    const result = await Database.queryParam(query, params)
    const affected = result?.rowsAffected?.[0] ?? 0
    console.log('affected: ', affected)

    return { success: affected > 0 }
  }

  public async getPatientDetailByAppointmentId(appointmentId: string): Promise<any> {
    const query = `
    SELECT * FROM Patient_Detail
    WHERE Appointment_ID = ?
  `
    const result = await databaseServices.queryParam(query, [appointmentId])
    console.log('result getPatientDetailByAppointmentId: ', result)
    return result.recordset.length > 0 ? result.recordset[0] : null
  }

  public async updatePatientDetailByAppointmentId(patientDetailData: PatientDetail): Promise<any> {
    console.log('updatePatientDetailByAppointmentId Repo')

    let query = 'UPDATE Patient_Detail SET'
    const params: any[] = []

    if (patientDetailData.Description !== undefined) {
      query += ' Description = ?,'
      params.push(patientDetailData.Description)
    }

    if (patientDetailData.Status !== undefined) {
      query += ' Status = ?,'
      params.push(patientDetailData.Status)
    }

    query = query.slice(0, -1) + ' WHERE Appointment_ID = ?'
    params.push(patientDetailData.Appointment_ID)
    console.log('params: ', params)

    const result = await databaseServices.queryParam(query, params)
    console.log('Repo result: ', result)

    if (result && result.rowsAffected && result.rowsAffected[0] > 0) {
      return { success: true, message: 'Cập nhật hồ sơ của bệnh nhân thành công' }
    }
    return { success: false, message: 'Cập nhật hồ sơ của bệnh nhân thất bại' }
  }

  public async getAllPatientDetailByAppointmentId(appointmentId: string): Promise<any> {
    console.log('getAllPatientDetailByAppointmentId Repo')
    const query = `SELECT * FROM Patient_Detail WHERE Appointment_ID = ?`

    const result = await databaseServices.queryParam(query, [appointmentId])
    console.log('Repo result: ', result)
    if (result && result.recordset && result.recordset.length > 0) {
      return result.recordset[0]
    } else {
      return null
    }
  }

  public async deletePatientDetail(appointmentId: string): Promise<any> {
    const query = `DELETE FROM Patient_Detail WHERE Appointment_ID = ?`
    const result = await databaseServices.queryParam(query, [appointmentId])
    console.log('Patient Repo Result: ', result)
    return result
  }

  public async getLatestPatientDetailOfUser(appointmentId: string): Promise<PatientDetailV2 | null> {
    console.log('getLatestPatientDetailOfUser Repo')
    const query = `
    SELECT TOP 1 pd.*, ag.User_ID, s.Start_Time
    FROM AppointmentGiving ag
    JOIN Slot s ON ag.Slot_ID = s.Slot_ID
    JOIN Patient_Detail pd ON ag.Appointment_ID = pd.Appointment_ID
    WHERE ag.User_ID = ?
    ORDER BY pd.Patient_ID DESC
  `
    const result = await Database.queryParam(query, [appointmentId])
    console.log('Repo result: ', result)
    if (result && result.recordset && result.recordset.length > 0) {
      return result.recordset[0]
    }
    return null
  }

  public async getAllPatientDetailsByUserId(userId: string): Promise<PatientDetailV2[]> {
    console.log('getAllPatientDetailsByUserId Repo')
    const query = `
    SELECT pd.*, ag.User_ID, s.Start_Time, s.End_Time
    FROM AppointmentGiving ag
    JOIN Patient_Detail pd ON ag.Appointment_ID = pd.Appointment_ID
    JOIN Slot s ON ag.Slot_ID = s.Slot_ID
    WHERE ag.User_ID = ?
    ORDER BY pd.Patient_ID DESC
  `
    const result = await Database.queryParam(query, [userId])
    console.log('getAllPatientDetailsByUserId result:', result)

    if (result && result.recordset) {
      return result.recordset
    }

    return []
  }
}
