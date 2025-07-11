import { PatientDetail } from '~/models/schemas/patient.schema'
import databaseServices from '~/services/database.services'
import Database from '../services/database.services'

export class PatientDetailRepository {
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
      newPatientId = 'S' + String(nextId).padStart(3, '0') // => 'S006'
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
}
