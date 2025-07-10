import { Appointment } from '~/models/schemas/appointment.schema'
import { AppointmentRepository } from './../repository/appointment.repository'
import { PatientDetailRepository } from '~/repository/patient.repository'
import { UserRepository } from '~/repository/user.repository'

export class AppointmentServices {
  public appointmentRepository: AppointmentRepository
  public patientRepository: PatientDetailRepository
  public userRepository: UserRepository
  constructor() {
    this.appointmentRepository = new AppointmentRepository()
    this.patientRepository = new PatientDetailRepository()
    this.userRepository = new UserRepository()
  }

  async getAppointmentById(appointmentId: string): Promise<Appointment> {
    console.log('Appointment Service, getAppointmentById')

    try {
      const appointment = await this.appointmentRepository.findAppointmentByID(appointmentId)
      if (!appointment) {
        throw new Error('Appointment not found')
      }
      return appointment
    } catch (error) {
      throw error
    }
  }

  async updateAppointmentVolume(appointmentId: string, volume: number): Promise<any> {
    console.log('Appointment Services, updateVolume')
    if (!appointmentId || volume === undefined || volume === null) {
      throw new Error('Appoint_ID and Volume are required!')
    }
    try {
      const appointment = await this.appointmentRepository.findAppointmentByID(appointmentId)
      if (!appointmentId) {
        throw new Error('Appointment not found')
      }
      const result = await this.appointmentRepository.updateVolume(appointmentId, volume)
      await this.appointmentRepository.updateUserHistoryAfterDonation(appointmentId)
      return result
    } catch (error) {
      throw error
    }
  }

  async getAppointmentList(): Promise<Appointment[]> {
    try {
      const appointments = await this.appointmentRepository.getAllAppointmentList()
      return appointments
    } catch (error) {
      throw error
    }
  }

  public async updateStatusForAppointment(appointmentId: string, newStatus: string): Promise<any> {
    try {
      console.log('updateStatusForAppointment Appointment Services')
      console.log('appointmentId đây nè: ', appointmentId)

      const currentStatus = await this.appointmentRepository.getCurrentStatus(appointmentId)
      console.log('currentStatus: ', currentStatus)
      if (!currentStatus) {
        throw new Error('Không có cuộc hẹn này!')
      }

      const patientDetail = await this.patientRepository.getPatientDetailByAppointmentId(appointmentId)
      console.log('patientDetail: ', patientDetail)
      if (!patientDetail) {
        throw new Error('Chưa có hồ sơ bệnh án đối với cuộc hẹn này!')
      }

      const user = await this.userRepository.getUserById(patientDetail.User_ID)
      console.log('user: ', user)
      if (!user || !user.BloodType_ID) {
        throw new Error('Chưa xác nhận nhóm máu cho bệnh nhân!')
      }

      if (currentStatus === 'Pending') {
        if (newStatus !== 'Processing' && newStatus !== 'Canceled') {
          throw new Error('From Pending, you can only change status to Processing or Canceled')
        }
      }

      if (currentStatus === 'Processing') {
        if (newStatus !== 'Completed' && newStatus !== 'Canceled') {
          throw new Error('From Processing, you can only change status to Completed or Canceled')
        }
      }

      if (currentStatus === 'Completed' || currentStatus === 'Canceled') {
        throw new Error('Appointment is already completed or canceled. Status cannot be updated.')
      }

      const result = await this.appointmentRepository.updateAppointmentStatus(appointmentId, newStatus)
      console.log('result updateAppointmentStatus: ', result)
      if (!result) {
        throw new Error('Failed to update appointment status')
      }

      return { success: true, message: 'Appointment status updated successfully' }
    } catch (error: any) {
      console.error('Error updating appointment status:', error)
      return { success: false, message: error.message || 'Failed to update appointment status' }
    }
  }
}
