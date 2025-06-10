import { error } from 'console'
import { format } from 'path'
import { SlotRepository } from '~/repository/slot.repository'
import { Slot } from '~/models/schemas/slot.schema'
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
}
