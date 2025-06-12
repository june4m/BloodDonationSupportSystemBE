import { SlotService } from '~/services/slot.services'
import { Request, Response } from 'express'
import { ResponseHandle } from '~/utils/Response'
import { error } from 'console'
class SlotController {
  public slotService: SlotService
  constructor() {
    this.slotService = new SlotService()
    this.createSlot = this.createSlot.bind(this)
    this.getSlotList = this.getSlotList.bind(this)
    this.registerDonationBlood = this.registerDonationBlood.bind(this)
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

  public async getSlotList(req: Request, res: Response): Promise<any> {
    console.log('get slot')
    const status = 'A'
    try {
      console.log(status)
      const getSlot = await this.slotService.getSlot(status)
      return ResponseHandle.responseSuccess(res, getSlot, 'Success', 200)
    } catch (error) {
      console.log('error get slot')
      return ResponseHandle.responseError(res, error, 'Fail', 400)
    }
  }

  public async registerDonationBlood(req: Request, res: Response): Promise<any> {
    console.log('registerDonationBlood 1')
    const registerData = req.body
    try {
      console.log('registerDonationBlood')
      const registerDonationBlood = await this.slotService.registerBloodDonation(registerData)
      return ResponseHandle.responseSuccess(res, registerDonationBlood, 'Success', 200)
    } catch (error) {
      console.log('Error RegisterDonationBlood')
      return ResponseHandle.responseError(res, error, 'Fail', 400)
    }
  }
}

export default SlotController
