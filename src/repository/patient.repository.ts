import { PatientDetail } from '~/models/schemas/patient.schema'
import databaseServices from '~/services/database.services'
import Database from '../services/database.services'

export class PatientDetailRepository {
  public async addPatientDetail(patientDetailData: PatientDetail): Promise<any> {
    let newPatientID = 'P001'
    const lastId = `
          SELECT TOP 1 Patient_ID
          FROM Patient_Detail
          ORDER BY CAST(SUBSTRING(Patient_ID, 3, LEN(Patient_ID) - 1) AS INT) DESC
          `
    const lastIdResult = await Database.query(lastId)
    console.log('lastIdResult: ', lastIdResult)
    if (lastIdResult.length > 0) {
      const lastPatientID = lastIdResult[0].Patient_ID
      console.log('lastPatientID:', lastPatientID)
      const numericPart = parseInt(lastPatientID.slice(2))
      console.log('numericPart: ', numericPart)
      const nextId = numericPart + 1
      newPatientID = 'P' + String(nextId).padStart(3, '0')
      console.log('newPatientID: ', newPatientID)
    }
    console.log('start try')
    try {
      const { ...fields } = patientDetailData
      const insertQuery = `
        INSERT INTO Patient_Detail (Patient_ID, User_ID, Description, Status, MedicalHistory)
        VALUES (?, ?, ?, ?, ?)
        `
      const params = [newPatientID, fields.userId, fields.description, fields.status, fields.medicalHistory]
      console.log('patient repo params: ', params)

      const result = await databaseServices.queryParam(insertQuery, params)
      console.log('addPatient Detail Repository result:', result)
      return result
    } catch (error) {
      throw error
    }
  }
}
