import { Request, Response } from 'express'
import { PatientDetail } from '~/models/schemas/patient.schema'
import { PatientDetailService } from '~/services/patient.services'
import { ResponseHandle } from '~/utils/Response'

export class PatientController {
  public patientDetailService: PatientDetailService

  constructor() {
    this.patientDetailService = new PatientDetailService()
    this.addPatientDetail = this.addPatientDetail.bind(this)
    this.addPatientDetailV2 = this.addPatientDetailV2.bind(this)
    this.updatePatientDetail = this.updatePatientDetail.bind(this)
    this.getPatientDetailsByAppointmentId = this.getPatientDetailsByAppointmentId.bind(this)
    this.getLatestPatientDetail = this.getLatestPatientDetail.bind(this)
    this.getAllPatientDetails = this.getAllPatientDetails.bind(this)
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

  public async addPatientDetailV2(req: Request, res: Response): Promise<void> {
    console.log('addPatientDetailV2 Controller')
    try {
      const { appointmentId } = req.params
      const { description, status } = req.body

      if (!appointmentId || !description || !status) {
        ResponseHandle.responseError(res, null, 'Phải nhập đầy đủ các trường!', 400)
        return
      }

      const result = await this.patientDetailService.addPatientDetailV2(appointmentId, description, status)
      console.log('Controller result: ', result)

      if (result.success) {
        ResponseHandle.responseSuccess(res, result.data, 'Thêm hồ sơ bệnh án thành công!', 201)
      } else {
        ResponseHandle.responseError(res, null, result.message, 400)
      }
    } catch (error) {
      console.error('addPatientDetailV2 error:', error)
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

  public async getPatientDetailsByAppointmentId(req: Request, res: Response): Promise<void> {
    console.log('getPatientDetailsByAppointmentId Controller')

    try {
      const { appointmentId } = req.params

      if (!appointmentId) {
        ResponseHandle.responseError(res, null, 'Appointment ID is required', 400)
        return
      }

      const result = await this.patientDetailService.getPatientDetailsByAppointmentId(appointmentId)
      console.log('Controller result: ', result)

      if (result.success) {
        ResponseHandle.responseSuccess(res, result.data, 'Patient details fetched successfully', 200)
      } else {
        ResponseHandle.responseError(res, null, result.message, 400)
      }
    } catch (error: any) {
      console.error('Error in controller:', error)
      ResponseHandle.responseError(res, error, 'Failed to fetch patient details', 500)
    }
  }

  public async getLatestPatientDetail(req: Request, res: Response): Promise<void> {
    console.log('getLatestPatientDetail Controller')
    try {
      const { userId } = req.params

      const result = await this.patientDetailService.getLatestPatientDetail(userId)
      console.log('Controller result: ', result)

      if (result.success) {
        ResponseHandle.responseSuccess(res, result.data, 'Lấy hồ sơ bệnh án mới nhất thành công!', 200)
      } else {
        ResponseHandle.responseError(res, null, result.message, 404)
      }
    } catch (error) {
      console.error('getLatestPatientDetail controller error:', error)
      ResponseHandle.responseError(res, error, 'Lỗi lấy hồ sơ bệnh án!', 500)
    }
  }

  public async getAllPatientDetails(req: Request, res: Response): Promise<void> {
    console.log('getAllPatientDetails Controller')
    try {
      const userId = req.user?.user_id

      const result = await this.patientDetailService.getAllPatientDetails(userId)

      if (result.success) {
        ResponseHandle.responseSuccess(res, result.data, 'Lấy danh sách hồ sơ bệnh án thành công!', 200)
      } else {
        ResponseHandle.responseError(res, null, result.message, 404)
      }
    } catch (error) {
      console.error('getAllPatientDetails controller error:', error)
      ResponseHandle.responseError(res, error, 'Lỗi lấy danh sách hồ sơ bệnh án!', 500)
    }
  }
}
