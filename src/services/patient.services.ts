import { AppointmentRepository } from '~/repository/appointment.repository'
import { PatientDetailRepository } from '~/repository/patient.repository'
import { SlotRepository } from '~/repository/slot.repository'
import { PatientDetail } from '~/models/schemas/patient.schema'
import { UserRepository } from '~/repository/user.repository'

export class PatientDetailService {
  public patientDetailRepository: PatientDetailRepository
  public slotRepository: SlotRepository
  public appointmentRepository: AppointmentRepository
  public userRepository: UserRepository

  constructor() {
    this.patientDetailRepository = new PatientDetailRepository()
    this.slotRepository = new SlotRepository()
    this.appointmentRepository = new AppointmentRepository()
    this.userRepository = new UserRepository()
  }

  public async addPatientDetail(appointmentId: string, description: string, status: string): Promise<any> {
    try {
      console.log('addPatientDetail Services')
      const appointment = await this.appointmentRepository.getAppointmentById(appointmentId)
      console.log('appointment: ', appointment)

      if (!appointment) {
        console.log('Không tìm thấy cuộc hẹn!')
        throw new Error('Thêm hồ sơ bệnh án thất bại!')
      }

      const { Appointment_ID: appointment_id, User_ID: user_id, Slot_ID: slot_id } = appointment
      console.log('Appointment_ID: ', appointment_id)
      console.log('UserID: ', user_id), console.log('Slot_ID: ', slot_id)

      const isDuplicate = await this.patientDetailRepository.checkDuplicatePatientDetail(appointmentId)
      console.log('isDuplicate: ', isDuplicate)
      if (isDuplicate) {
        throw new Error('Hồ sơ bệnh án của bệnh nhân đã tồn tại ở cuộc hẹn này rồi!')
      }

      const slot = await this.slotRepository.getSlotById(slot_id)
      console.log('slot: ', slot)

      const medicalHistoryDate = slot.Slot_Date
      console.log('medicalHistoryDate: ', medicalHistoryDate)

      const patientDetailData: PatientDetail = {
        Patient_ID: '',
        User_ID: user_id,
        Description: description,
        Status: status,
        MedicalHistory: medicalHistoryDate,
        Appointment_ID: appointmentId
      }

      const result = await this.patientDetailRepository.addPatientDetail(patientDetailData)
      if (!result) {
        throw new Error('Thêm hồ sơ bệnh án thất bại!')
      }
      return { success: true, message: 'Thêm hồ sơ bệnh án cho cuộc hẹn thành công!', data: result }
    } catch (error: any) {
      console.error('Error adding patient detail:', error)
      return { success: false, message: error.message || 'Thêm hồ sơ bệnh án thất bại vì bị lỗi!' }
    }
  }

  public async updatePatientDetailByAppointmentId(
    appointmentId: string,
    description?: string,
    status?: string
  ): Promise<any> {
    console.log('updatePatientDetailByAppointmentId Services')
    try {
      const patientDetailData: PatientDetail = {
        Appointment_ID: appointmentId,
        Description: description,
        Status: status
      }
      console.log('patientDetailData: ', patientDetailData)

      const result = await this.patientDetailRepository.updatePatientDetailByAppointmentId(patientDetailData)
      console.log('Services result: ', result)
      return result
    } catch (error: any) {
      console.error('Error updating patient detail:', error)
      return { success: false, message: error.message || 'Failed to update patient detail' }
    }
  }
}
