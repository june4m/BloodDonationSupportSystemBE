import { appointmentServices } from '~/services/appointment.services'
import { Request, Response } from 'express'
import { ResponseHandle } from '~/utils/Response'

class AppointmentController {
  private appointmentService: appointmentServices
  constructor() {
    this.appointmentService = new appointmentServices()
    this.getAppointmentById = this.getAppointmentById.bind(this)
    this.updateVolume = this.updateVolume.bind(this)
    this.getAppointmentList = this.getAppointmentList.bind(this)
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
}

export default AppointmentController
