import { UserRepository } from './../repository/user.repository';
import { Appointment } from './../models/schemas/slot.schema';
import { error } from 'console'
import { format } from 'path'
import { SlotRepository } from '~/repository/slot.repository'
import { Slot, slotDTO, SlotFactory } from '~/models/schemas/slot.schema'
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

  public async registerBloodDonation(data: Appointment): Promise<any> {
    if (!data.Slot_ID || !data.User_ID) {
      throw new Error('Slot_ID and User_ID are required')
    }
    const user = await this.userRepository.findById(data.User_ID)
    if (!user) {
      throw new Error('User not found')
    }
    return this.slotRepository.registerSlot(data)
  }
}
