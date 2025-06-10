import { SlotService } from '~/services/slot.services'
import { Request, Response } from 'express'
import { ResponseHandle } from '~/utils/Response'
class SlotController {
  public slotService: SlotService
  constructor() {
    this.slotService = new SlotService()
    this.createSlot = this.createSlot.bind(this)
  }

  public async createSlot(req: Request, res: Response): Promise<any> {
    console.log('Create Slot1')
    const slotData = req.body
    try {
      console.log('Create Slot')

      console.log(slotData)
      const createSlot = await this.slotService.createSlot(slotData)
      return ResponseHandle.responseSuccess(res, createSlot, 'Success', 200)
    } catch (error) {
      console.log('error create')
      return ResponseHandle.responseError(res, error, 'Fail', 400)
    }
  }
}
export default SlotController
