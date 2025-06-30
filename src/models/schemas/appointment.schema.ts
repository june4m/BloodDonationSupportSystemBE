export interface Appointment {
  Appointment_ID: string
  Slot_ID: string
  User_ID: string
  Volume?: number
  Status?: 'A' | 'C'
}

export interface UpdateVolumePayload {
  appointmentId: string
  volume: number
}
