import { Request, Response } from 'express'
import { AppointmentServices } from '~/services/appointment.services'
import { ResponseHandle } from '~/utils/Response'

class AppointmentController {
  private appointmentService: AppointmentServices
  constructor() {
    this.appointmentService = new AppointmentServices()
    this.getAppointmentById = this.getAppointmentById.bind(this)
    this.updateVolume = this.updateVolume.bind(this)
    this.getAppointmentList = this.getAppointmentList.bind(this)
    this.updateStatus = this.updateStatus.bind(this)
    this.rejectAppointment = this.rejectAppointment.bind(this)
    this.getAppointmentDetailsByUserId = this.getAppointmentDetailsByUserId.bind(this)
  }

  async getAppointmentById(req: Request, res: Response): Promise<void> {
    try {
      const appointmentId = req.params.appointmentId
      const result = await this.appointmentService.getAppointmentById(appointmentId)
      ResponseHandle.responseSuccess(res, result, 'Appointment fetched successfully', 200)
    } catch (error: any) {
      ResponseHandle.responseError(res, error, error.message || 'Failed to fetch appointment', 400)
    }
  }

  async updateVolume(req: Request, res: Response): Promise<void> {
    try {
      const appointmentId = req.params.appointmentId
      const { volume } = req.body
      const result = await this.appointmentService.updateAppointmentVolume(appointmentId, volume)
      ResponseHandle.responseSuccess(res, result, 'Volume updated successfully', 200)
    } catch (error: any) {
      ResponseHandle.responseError(res, error, error.message || 'Failed to update appointment', 400)
    }
  }

  async getAppointmentList(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.appointmentService.getAppointmentList()
      ResponseHandle.responseSuccess(res, result, 'Appointments fetched successfully', 200)
    } catch (error: any) {
      ResponseHandle.responseError(res, error, error.message || 'Failed to fetch appointments', 400)
    }
  }

  public async updateStatus(req: Request, res: Response): Promise<void> {
    try {
      console.log('updateStatus Appointment Controller')
      const { appointmentId } = req.params
      const { newStatus } = req.body

      if (!appointmentId || !newStatus) {
        ResponseHandle.responseError(res, null, 'Appointment ID and New Status are required', 400)
        return
      }

      const result = await this.appointmentService.updateStatusForAppointment(appointmentId, newStatus)
      console.log('result: ', result)

      if (result.success) {
        ResponseHandle.responseSuccess(res, null, result.message, 200)
      } else {
        ResponseHandle.responseError(res, null, result.message, 400)
      }
    } catch (error: any) {
      console.error('Error in updateStatus controller:', error)
      ResponseHandle.responseError(res, error, 'Failed to update appointment status', 500)
    }
  }

  public async rejectAppointment(req: Request, res: Response): Promise<void> {
    console.log('rejectAppointment Appointment Controller')
    try {
      const { appointmentId } = req.params
      const { reasonReject } = req.body

      if (!appointmentId || !reasonReject) {
        ResponseHandle.responseError(res, null, 'Appointment ID and Reason Reject are required', 400)
        return
      }

      const result = await this.appointmentService.rejectAppointment(appointmentId, reasonReject)
      console.log('Appointment Controller Result: ', result)

      if (result.success) {
        ResponseHandle.responseSuccess(res, result.data, 'Appointment rejected successfully', 200)
      } else {
        ResponseHandle.responseError(res, null, result.message, 400)
      }
    } catch (error) {
      ResponseHandle.responseError(res, error, 'Failed to reject appointment', 500)
    }
  }

  public async getAppointmentDetailsByUserId(req: Request, res: Response): Promise<void> {
    console.log('getAppointmentDetails Appointment Controller')
    try {
      const userId = req.user.user_id
      console.log('userId: ', userId)
      if (!userId) {
        ResponseHandle.responseError(res, null, 'User ID is required', 400)
        return
      }

      const result = await this.appointmentService.getAppointmentDetailsByUserId(userId)
      console.log('Controller result: ', result)
      if (result.success) {
        ResponseHandle.responseSuccess(res, result.data, 'Appointment details fetched successfully', 200)
      } else {
        ResponseHandle.responseError(res, null, result.message, 400)
      }
    } catch (error: any) {
      console.error('Error fetching appointment details: ', error)
      ResponseHandle.responseError(res, error, 'Failed to fetch appointment details', 500)
    }
  }
}

export default AppointmentController
