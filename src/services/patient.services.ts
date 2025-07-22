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

  public async addPatientDetailV2(appointmentId: string, description: string, status: string): Promise<any> {
    console.log('addPatientDetail Service')
    try {
      const appointment = await this.appointmentRepository.getAppointmentById(appointmentId)
      if (!appointment) throw new Error('Không tìm thấy cuộc hẹn!')

      const { Appointment_ID: appointment_id, User_ID: user_id, Slot_ID: slot_id } = appointment
      console.log('Appointment_ID: ', appointment_id)
      console.log('UserID: ', user_id), console.log('Slot_ID: ', slot_id)

      const isDuplicate = await this.patientDetailRepository.checkDuplicatePatientDetail(appointmentId)
      console.log('isDuplicate: ', isDuplicate)
      if (isDuplicate) {
        throw new Error('Hồ sơ bệnh án của bệnh nhân đã tồn tại ở cuộc hẹn này rồi!')
      }

      const slot = await this.slotRepository.getSlotById(slot_id)
      if (!slot) throw new Error('Không tìm thấy slot tương ứng!')

      const medicalHistoryDate = slot.Slot_Date
      const newPatientId = await this.patientDetailRepository.createNextPatientId()

      const patientDetailData: PatientDetail = {
        Patient_ID: newPatientId,
        Description: description,
        Status: status,
        MedicalHistory: medicalHistoryDate,
        Appointment_ID: appointmentId
      }

      const inserted = await this.patientDetailRepository.addPatientDetailV2(patientDetailData)
      if (!inserted.success) throw new Error('Thêm hồ sơ bệnh án thất bại!')

      await this.userRepository.updatePatientId(user_id, newPatientId)

      return { success: true, data: { patientId: newPatientId } }
    } catch (error: any) {
      console.error('addPatientDetailV2 Service Error:', error)
      return { success: false, message: error.message || 'Lỗi không xác định' }
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

  public async getPatientDetailsByAppointmentId(appointmentId: string): Promise<any> {
    try {
      console.log('getPatientDetailsByAppointmentId Services')
      const patientDetails = await this.patientDetailRepository.getAllPatientDetailByAppointmentId(appointmentId)
      console.log('patientDetails: ', patientDetails)

      if (!patientDetails) {
        return { success: false, message: 'No patient details found for this appointment.' }
      }
      return { success: true, data: patientDetails }
    } catch (error: any) {
      console.error('Error fetching patient details:', error)
      return { success: false, message: error.message || 'Failed to fetch patient details' }
    }
  }

  public async getLatestPatientDetail(userID: string): Promise<any> {
    console.log('getLatestPatientDetail Service')
    try {
      const detail = await this.patientDetailRepository.getLatestPatientDetailOfUser(userID)
      console.log('detail: ', detail)
      if (!detail) {
        return { success: false, message: 'Không tìm thấy hồ sơ bệnh án!' }
      }
      return { success: true, data: detail }
    } catch (error: any) {
      console.error('getLatestPatientDetail Error:', error)
      return { success: false, message: error.message }
    }
  }

  public async getAllPatientDetails(userId: string): Promise<any> {
    console.log('getAllPatientDetails Service')
    try {
      const list = await this.patientDetailRepository.getAllPatientDetailsByUserId(userId)
      console.log('list: ', list)

      if (!list || list.length === 0) {
        return { success: false, message: 'Không tìm thấy hồ sơ bệnh án nào cho người dùng này.' }
      }

      const formattedList = list.map((item: any) => ({
        ...item,
        MedicalHistory: item.MedicalHistory ? new Date(item.MedicalHistory).toISOString().substring(0, 10) : null,
        Start_Time: item.Start_Time ? new Date(item.Start_Time).toISOString().substring(11, 19) : null
      }))

      return { success: true, data: formattedList }
    } catch (error: any) {
      console.error('getAllPatientDetails Error:', error)
      return { success: false, message: error.message }
    }
  }
}
