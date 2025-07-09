import { Request, Response } from 'express'
import { PatientDetailService } from '~/services/patient.services'
import { ResponseHandle } from '~/utils/Response'

export class PatientController {
  public patientDetailService: PatientDetailService

  constructor() {
    this.patientDetailService = new PatientDetailService()
    this.addPatientDetail = this.addPatientDetail.bind(this)
  }

  public async addPatientDetail(req: Request, res: Response): Promise<void> {
    console.log('addPatientDetail Controller')
    try {
      const { appointmentId } = req.params
      const { description, status } = req.body
      console.log('appointmentId: ', appointmentId)

      if (!appointmentId || !description || !status) {
        ResponseHandle.responseError(res, null, 'All fields are required', 400)
        return
      }

      const result = await this.patientDetailService.addPatientDetail(appointmentId, description, status)

      if (!result.success) {
        ResponseHandle.responseError(res, null, result.message, 400)
        return
      }
      ResponseHandle.responseSuccess(res, result, 'Patient detail added successfully', 201)
    } catch (error) {
      console.error('Error adding patient detail: ', error)
      ResponseHandle.responseError(res, error, 'Failed to add patient detail', 500)
    }
  }
}
