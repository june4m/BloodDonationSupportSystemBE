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
}
