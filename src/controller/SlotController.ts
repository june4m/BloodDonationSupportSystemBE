import { Request, Response } from 'express'
import { SlotService } from '~/services/slot.services'
import { ResponseHandle } from '~/utils/Response'

class SlotController {
  private slotService: SlotService

  constructor() {
    this.slotService = new SlotService()
    this.createSlot = this.createSlot.bind(this)
    this.getSlotList = this.getSlotList.bind(this)
    this.registerDonationBlood = this.registerDonationBlood.bind(this)
  }

  /** [POST] /api/slots/createSlot */
  public async createSlot(req: Request, res: Response): Promise<void> {
    try {
      const slotData = req.body
      console.log('[DEBUG][BE] Body nhận từ FE khi tạo ca:', slotData)
      const result = await this.slotService.createSlot(slotData)
      ResponseHandle.responseSuccess(res, result, 'Slot created successfully', 200)
    } catch (err: any) {
      ResponseHandle.responseError(res, err, err.message || 'Failed to create slot', 400)
    }
  }

  /** [GET] /api/slots/getSlotList */
  public async getSlotList(req: Request, res: Response): Promise<void> {
    try {
      const status = 'A'
      const result = await this.slotService.getSlot(status)
      console.log('[DEBUG][BE] Dữ liệu trả về FE getSlotList:', result)
      ResponseHandle.responseSuccess(res, result, 'Slots fetched successfully', 200)
    } catch (err: any) {
      ResponseHandle.responseError(res, err, err.message || 'Failed to fetch slots', 400)
    }
  }

  public async registerDonationBlood(req: Request, res: Response): Promise<void> {
    try {
      const slotId = req.body.Slot_ID
      const userId = req.body.User_ID
      const healthDeclaration = req.body.Health_Declaration
      // Thêm Appointment_ID rỗng để khớp kiểu
      const appointment = {
        Appointment_ID: '',
        Slot_ID: slotId,
        User_ID: userId,
        Health_Declaration: healthDeclaration
      }
      const result = await this.slotService.registerBloodDonation(appointment)
      ResponseHandle.responseSuccess(res, result, 'Registered successfully', 200)
    } catch (err: any) {
      ResponseHandle.responseError(res, err, err.message || 'Registration failed', 400)
    }
  }
}

export default SlotController
