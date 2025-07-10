import { Request, Response } from 'express'
import { PatientDetail } from '~/models/schemas/patient.schema'
import { PatientDetailService } from '~/services/patient.services'
import { ResponseHandle } from '~/utils/Response'

export class PatientController {
  public patientDetailService: PatientDetailService

  constructor() {
    this.patientDetailService = new PatientDetailService()
    this.addPatientDetail = this.addPatientDetail.bind(this)
    this.updatePatientDetail = this.updatePatientDetail.bind(this)
  }

  public async addPatientDetail(req: Request, res: Response): Promise<void> {
    try {
      const { appointmentId } = req.params
      const { description, status } = req.body

      if (!appointmentId || !description || !status) {
        ResponseHandle.responseError(res, null, 'Phải nhập hết các trường!', 400)
        return
      }

      const result = await this.patientDetailService.addPatientDetail(appointmentId, description, status)

      if (result.success) {
        ResponseHandle.responseSuccess(res, result.data, 'Thêm hồ sơ bệnh án cho cuộc hẹn thành công!', 201)
      } else {
        ResponseHandle.responseError(res, null, result.message, 400)
      }
    } catch (error) {
      console.log('error: ', error)
      ResponseHandle.responseError(res, error, 'Thêm hồ sơ bệnh án thất bại!', 500)
    }
  }

  public async updatePatientDetail(req: Request, res: Response): Promise<void> {
    console.log('updatePatientDetail Controller')
    try {
      const { appointmentId } = req.params
      const { description, status } = req.body

      if (!appointmentId || (!description && !status)) {
        ResponseHandle.responseError(res, null, 'Ít nhất một trường (description hoặc status) là bắt buộc', 400)
        return
      }
      const result = await this.patientDetailService.updatePatientDetailByAppointmentId(
        appointmentId,
        description,
        status
      )
      console.log('Controller result: ', result)

      if (result.success) {
        ResponseHandle.responseSuccess(res, null, result.message, 200)
      } else {
        ResponseHandle.responseError(res, null, result.message, 400)
      }
    } catch (error: any) {
      console.error('Error in controller:', error)
      ResponseHandle.responseError(res, error, 'Failed to update patient detail', 500)
    }
  }
}
