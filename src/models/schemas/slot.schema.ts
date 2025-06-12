export interface Slot {
  slot_id: string
  slot_date: string
  start_time: string
  end_time: string
  volume: number
  max_volume: number
  status: string
  user_id: string
}
export interface slotDTO {
  slot_id: string
  slot_date: string | null
  start_time: string | null
  end_time: string | null
  volume: number
  max_volume: number
  status: string
  user_id: string
}

export class SlotFactory {
  static createDetailSlot(data: any, isCSV: boolean = false): slotDTO {
    // Format ngày YYYY-MM-DD
    const formatDate = (dateStr?: string | null): string | null => {
      if (!dateStr) return null
      return new Date(dateStr).toISOString().slice(0, 10) // Lấy 10 ký tự đầu YYYY-MM-DD
    }

    // Format giờ HH:mm:ss
    const formatTime = (timeStr?: string | null): string | null => {
      if (!timeStr) return null
      return new Date(timeStr).toISOString().slice(11, 19) // Lấy phần giờ phút giây
    }

    return {
      slot_id: data.Slot_ID,
      slot_date: formatDate(data.Slot_Date),
      start_time: formatTime(data.Start_Time),
      end_time: formatTime(data.End_Time),
      volume: data.Volume,
      max_volume: data.Max_Volume,
      status: data.Status,
      user_id: data.User_ID
    }
  }
}
