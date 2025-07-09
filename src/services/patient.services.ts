import { AppointmentRepository } from '~/repository/appointment.repository'
import { PatientDetailRepository } from '~/repository/patient.repository'
import { SlotRepository } from '~/repository/slot.repository'
import { PatientDetail } from '~/models/schemas/patient.schema'

export class PatientDetailService {
  public patientDetailRepository: PatientDetailRepository
  public slotRepository: SlotRepository
  public appointmentRepository: AppointmentRepository

  constructor() {
    this.patientDetailRepository = new PatientDetailRepository()
    this.slotRepository = new SlotRepository()
    this.appointmentRepository = new AppointmentRepository()
  }

  // Hàm thêm chi tiết bệnh nhân
  public async addPatientDetail(appointmentId: string, description: string, status: string): Promise<any> {
    console.log('addPatientDetail Services')
    // Lấy thông tin User_ID và Slot_ID từ bảng AppointmentGiving thông qua appointment_id
    console.log('Services - appointmentId: ', appointmentId)
    const appointment = await this.appointmentRepository.getAppointmentById(appointmentId)
    console.log('Services - appointment : ', appointment)
    if (!appointment) {
      throw new Error('Appointment not found')
    }

    const { User_ID: user_id, Slot_ID: slot_id } = appointment
    console.log('user_id: ', user_id)
    console.log('slot_id: ', slot_id)
    // Lấy Slot_Date từ bảng Slot thông qua slot_id
    const slot = await this.slotRepository.getSlotById(slot_id)
    console.log('slot: ', slot)
    if (!slot) {
      throw new Error('Slot not found')
    }

    const medicalHistoryDate = new Date(slot.Slot_Date).toISOString().split('T')[0]
    console.log('medicalHistory: ', medicalHistoryDate)
    const patientDetailData: PatientDetail = {
      Patient_ID: '', // Patient_ID sẽ được tạo trong repository
      userId: user_id,
      description: description,
      status: status,
      medicalHistory: medicalHistoryDate // Ngày lịch sử y tế
    }
    console.log('Service - patientDetailData: ', patientDetailData)
    const result = await this.patientDetailRepository.addPatientDetail(patientDetailData)

    return result
  }
}
