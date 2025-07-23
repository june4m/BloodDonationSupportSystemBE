import { UserRepository } from './../repository/user.repository'
import { Appointment } from './../models/schemas/slot.schema'
import { error } from 'console'
import { format } from 'path'
import { SlotRepository } from '~/repository/slot.repository'
import { Slot, slotDTO, SlotFactory } from '~/models/schemas/slot.schema'
import databaseServices from './database.services'
export class SlotService {
  private slotRepository: SlotRepository
  private userRepository: UserRepository
  constructor() {
    this.slotRepository = new SlotRepository()
    this.userRepository = new UserRepository()
  }

  async createSlot(slotData: Slot): Promise<slotDTO> {
    return this.slotRepository.createSlot(slotData)
  }

  async getSlot(status: string): Promise<slotDTO[]> {
    console.log('Slot Service, getSlot')

    const today = new Date()
    const formatTodayDate = today.toISOString().split('T')[0]
    console.log('Today:', formatTodayDate)

    try {
      // Lấy dữ liệu thô từ repo (mảng)
      const rawResult = await this.slotRepository.getSlot(status, formatTodayDate)
      console.log('Raw Result:', rawResult)

      // Map từng phần tử qua factory để format dữ liệu
      const formattedResult = rawResult.map((item: any) => SlotFactory.createDetailSlot(item))
      console.log('Formatted Result:', formattedResult)

      return formattedResult
    } catch (error) {
      throw error
    }
  }

  async getSlotById(slotId: string): Promise<slotDTO[]> {
    console.log('Slot Service, getSlot')

    const today = new Date()
    const formatTodayDate = today.toISOString().split('T')[0]
    console.log('Today:', formatTodayDate)

    try {
      // Lấy dữ liệu thô từ repo (mảng)
      const rawResult = await this.slotRepository.getSlot(slotId, formatTodayDate)
      console.log('Raw Result:', rawResult)

      // Map từng phần tử qua factory để format dữ liệu
      const formattedResult = rawResult.map((item: any) => SlotFactory.createDetailSlot(item))
      console.log('Formatted Result:', formattedResult)

      return formattedResult
    } catch (error) {
      throw error
    }
  }

  async checkSlotExist(slotDate: string, startTime: string, endTime: string): Promise<boolean> {
    console.log('Checking for duplicate slot...')

    try {
      const query = `
      SELECT COUNT(*) AS Count
      FROM Slot
      WHERE Slot_Date = ? 
        AND Start_Time = ? 
        AND End_Time = ?
    `
      const params = [slotDate, startTime, endTime]
      const result = await databaseServices.queryParam(query, params)

      // Kiểm tra nếu result có Count và là một mảng hợp lệ
      if (result && result.recordsets && result.recordsets[0] && result.recordsets[0][0].Count !== undefined) {
        return result.recordsets[0][0].Count > 0
      } else {
        console.log('No count or invalid result structure')
        return false
      }
    } catch (error) {
      console.error('Error checking slot existence:', error)
      throw error
    }
  }

  public async registerBloodDonation(data: Appointment): Promise<any> {
    if (!data.Slot_ID || !data.User_ID) {
      throw new Error('Slot_ID and User_ID are required')
    }
    const user = await this.userRepository.findById(data.User_ID)
    console.log('Received data in Service:', data)
    if (!user) {
      throw new Error('User not found')
    }

    console.log('UserID param:', data.User_ID)
    const lastDonation = await this.slotRepository.getLastDonationByUserId(data.User_ID)
    console.log('lastDonation:', lastDonation)

    const currentSlot = await this.slotRepository.getSlotById(data.Slot_ID)
    const nextSlotDate = new Date(currentSlot.Slot_Date)

    if (lastDonation && lastDonation.Status !== 'Canceled') {
      const lastDate = new Date(lastDonation.donation_date)
      const diffMonths =
        (nextSlotDate.getFullYear() - lastDate.getFullYear()) * 12 + (nextSlotDate.getMonth() - lastDate.getMonth())

      if (diffMonths < 3) {
        const nextDonationDate = new Date(lastDate)
        nextDonationDate.setMonth(nextDonationDate.getMonth() + 3)
        throw new Error(
          `Bạn chỉ có thể hiến máu một lần trong 3 tháng. ` +
            `Lần hiến máu gần nhất của bạn là vào ngày ${lastDate.toISOString().split('T')[0]}. ` +
            `Bạn có thể hiến máu lại vào ngày ${nextDonationDate.toISOString().split('T')[0]}.`
        )
      }
    }
    return this.slotRepository.registerSlot(data)
  }
}
