import { Appointment, AppointmentReminder } from '~/models/schemas/appointment.schema'
import { AppointmentRepository } from './../repository/appointment.repository'
import databaseServices from './database.services'

export class appointmentServices {
  private appointmentRepository: AppointmentRepository
  constructor() {
    this.appointmentRepository = new AppointmentRepository()
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
  async findBeetweenDate (start: Date, end: Date): Promise<AppointmentReminder[]> {
    try {

      const appointments = await this.appointmentRepository.findBeetweenDate(start, end);
      return appointments;
    } catch (error) {
      console.error('Error in findBeetweenDate:', error);
      throw new Error('Failed to retrieve appointments between dates');
    }
  }
}
