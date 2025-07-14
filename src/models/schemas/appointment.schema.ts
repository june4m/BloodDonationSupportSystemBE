export interface Appointment {
  Appointment_ID: string
  Slot_ID: string
  User_ID: string
  Volume?: number
  Status?: 'Pending' | 'Processing' | 'Completed' | 'Canceled'
}

export interface UpdateVolumePayload {
  appointmentId: string
  volume: number
}

export interface AppointmentReminder {
  Appointment_ID: string;
  User_Name:      string;
  Email:          string;
  Slot_Date:      Date;
  Start_Time:     string;
}