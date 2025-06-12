import { error } from 'console'
import { format } from 'path'
import { SlotRepository } from '~/repository/slot.repository'
import { Slot, slotDTO, SlotFactory } from '~/models/schemas/slot.schema'
export class SlotService {
  private slotRepository: SlotRepository
  constructor() {
    this.slotRepository = new SlotRepository()
  }

  async createSlot(slotData: any): Promise<Slot> {
    console.log('formatData Services')
    try {
      const formatData = {
        Slot_Date: slotData.Slot_Date,
        Start_Time: slotData.Start_Time,
        Volume: slotData.Volume,
        Max_Volume: slotData.Max_Volume,
        End_Time: slotData.End_Time,
        Status: slotData.Status,
        User_ID: slotData.User_ID
      }
      console.log('Format Data', formatData)
      const result = await this.slotRepository.createSlot(formatData)

      console.log('Result', result)
      return result
    } catch (error) {
      throw error
    }
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
}
