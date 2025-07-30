import { Appointment, AppointmentReminder } from '~/models/schemas/appointment.schema'
import { AppointmentRepository } from './../repository/appointment.repository'
import { PatientDetailRepository } from '~/repository/patient.repository'
import { UserRepository } from '~/repository/user.repository'
import databaseServices from './database.services'

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

      const user = await this.userRepository.getUserByAppointmentId(appointmentId)
      console.log('user: ', user)
      if (!user || !user.BloodType_ID) {
        throw new Error('Chưa xác nhận nhóm máu cho bệnh nhân!')
      }

      if (currentStatus === 'Pending') {
        if (newStatus !== 'Processing' && newStatus !== 'Canceled') {
          throw new Error(
            'Từ trạng thái Đang chờ xử lý, bạn chỉ có thể thay đổi trạng thái thành Đang xử lý hoặc Đã hủy!'
          )
        }
      }

      if (currentStatus === 'Processing') {
        if (newStatus !== 'Completed' && newStatus !== 'Canceled') {
          throw new Error(
            'Từ trạng thái Đang xử lý, bạn chỉ có thể thay đổi trạng thái thành Đã hoàn thành hoặc Đã hủy!'
          )
        }
      }

      if (currentStatus === 'Completed' || currentStatus === 'Canceled') {
        throw new Error('Không thể cập nhật trạng thái đối với cuộc hẹn đã hoàn tất hoặc bị hủy!')
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

  public async rejectAppointment(appointmentId: string, reasonReject: string): Promise<any> {
    console.log('rejectAppointment Appointment Services')
    try {
      const appointment = await this.appointmentRepository.getAppointmentById(appointmentId)
      console.log('appointment: ', appointment)
      if (!appointment) {
        return { success: false, message: 'Appointment not found' }
      }

      const result = await this.appointmentRepository.rejectAppointment(appointmentId, 'Canceled', reasonReject)
      console.log('Service result: ', result)

      if (result.success) {
        return { success: true, message: 'Appointment rejected successfully', data: result.data }
      }

      return { success: false, message: 'Failed to update appointment status' }
    } catch (error: any) {
      console.error('Error rejecting appointment: ', error)
      return { success: false, message: error.message || 'Failed to reject appointment' }
    }
  }

  public async getAppointmentDetailsByUserId(userId: string): Promise<any> {
    console.log('getAppointmentDetails Appointment Services')
    try {
      const appointmentDetails = await this.appointmentRepository.getAppointmentDetailsByUserId(userId)
      console.log('appointmentDetails: ', appointmentDetails)
      if (!appointmentDetails) {
        throw new Error('Appointment details not found')
      }
      return { success: true, data: appointmentDetails }
    } catch (error: any) {
      return { success: false, message: error.message || 'Failed to get appointment details' }
    }
  }

  public async cancelAppointmentForMember(appointmentId: string): Promise<any> {
    try {
      const appointment = await this.appointmentRepository.getSlotDateByAppointmentId(appointmentId)
      console.log('appointment: ', appointment)

      if (!appointment) {
        return { success: false, message: 'Appointment not found' }
      }

      if (appointment.Status !== 'Pending') {
        return {
          success: false,
          message: 'Chỉ có thể hủy những cuộc hẹn chưa được chấp thuận (Đang chờ xử lý)! '
        }
      }

      const slotDate = new Date(appointment.Slot_Date)
      const today = new Date()
      // xóa phần time, chỉ so sánh ngày
      today.setHours(0, 0, 0, 0)
      slotDate.setHours(0, 0, 0, 0)

      console.log('Today:', today)
      console.log('Slot Date:', slotDate)

      if (slotDate <= today) {
        return { success: false, message: 'Bạn chỉ có thể hủy cuộc hẹn trước 1 ngày diễn ra cuộc hẹn!' }
      }

      const appointmentTarget = await this.appointmentRepository.deleteApointment(appointmentId)
      console.log('appointmentTarget result Services: ', appointmentTarget)
      if (!appointmentTarget) {
        return { success: false, message: 'Failed to delete appointment' }
      }

      return { success: true, message: 'Bạn đã hủy cuộc hẹn thành công!' }
    } catch (error: any) {
      return { success: true, message: error.message || 'Failed to delete patient_detail and appointment' }
    }
  }

  async findBeetweenDate(start: Date, end: Date): Promise<AppointmentReminder[]> {
    try {
      const appointments = await this.appointmentRepository.findBeetweenDate(start, end)
      return appointments
    } catch (error) {
      console.error('Error in findBeetweenDate:', error)
      throw new Error('Failed to retrieve appointments between dates')
    }
  }
}
