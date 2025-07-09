import { AppointmentRepository } from '~/repository/appointment.repository'
import { PatientDetailRepository } from '~/repository/patient.repository'
import { SlotService } from './slot.services'
import { AppointmentServices } from './appointment.services'
import { SlotRepository } from '~/repository/slot.repository'
import { PatientDetail } from '~/models/schemas/patient.schema'
import { UserRepository } from '~/repository/user.repository'
import { ResponseHandle } from '~/utils/Response'
import { Response } from 'express'

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
    console.log('addPatientDetail Services')
    console.log('Services - appointmentId: ', appointmentId)

    const appointment = await this.appointmentRepository.getAppointmentById(appointmentId)
    console.log('Services - appointment : ', appointment)

    if (!appointment) {
      throw new Error('Appointment not found')
    }

    const { User_ID: user_id, Slot_ID: slot_id } = appointment
    console.log('user_id: ', user_id)
    console.log('slot_id: ', slot_id)

    // const slot = await this.slotRepository.getSlotById(slot_id)
    // console.log('slot: ', slot)

    // if (!slot) {
    //   throw new Error('Slot not found')
    // }

    //mới thêm
    if (appointment.Status === 'Pending') {
      const user = await this.userRepository.findById(user_id)
      console.log('user: ', user)
      if (!user) {
        throw new Error('User not found')
      }

      if (!user.bloodtype_id) {
        return {
          success: false,
          message: 'Chưa xác nhận nhóm máu cho người này. Phải xác nhận nhóm máu cho người này trước!'
        }
      }

      const slot = await this.slotRepository.getSlotById(slot_id)
      if (!slot) {
        throw new Error('Slot not found')
      }

      const medicalHistoryDate = new Date(slot.Slot_Date).toISOString().split('T')[0]
      console.log('medicalHistory: ', medicalHistoryDate)

      const isDuplicate = await this.patientDetailRepository.checkDuplicatePatientDetail(user_id, medicalHistoryDate)
      if (isDuplicate) {
        return { success: false, message: 'Hồ sơ bệnh án đã tồn tại ở lần khám này!' }
      }

      const patientDetailData: PatientDetail = {
        Patient_ID: '', // Patient_ID sẽ được tạo trong repository
        userId: user_id,
        description: description,
        status: status,
        medicalHistory: medicalHistoryDate
      }

      console.log('Service - patientDetailData: ', patientDetailData)

      const result = await this.patientDetailRepository.addPatientDetail(patientDetailData)
      console.log('Patient detail added successfully')

      // Nếu bệnh án đã được thêm thành công, cập nhật trạng thái AppointmentGiving
      const updateStatusResult = await this.patientDetailRepository.updateAppointmentStatus(appointmentId, 'Processing')
      console.log('Appointment status updated to Processing', updateStatusResult)

      return result
    } else {
      return {
        success: false,
        message: 'Trạng thái của cuộc hẹn này không phải Pending'
      }
    }
  }
}
