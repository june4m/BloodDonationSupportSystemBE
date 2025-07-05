export interface SlotCreation {
  Slot_Date: Date | string;
  Start_Time: string;
  End_Time: string;
  Volume?: number;
  Max_Volume: number;
  Status: 'A' | 'F'; // 'A': Active, 'F': Full
  Admin_ID: string; // Bắt buộc, liên kết với admin
}

export interface Slot {
  Slot_ID: string;
  Slot_Date: string;
  Start_Time: string;
  End_Time: string;
  Volume: number;
  Max_Volume: number;
  Status: 'A' | 'F';
  Admin_ID: string; // Liên kết với admin
}

export interface slotDTO {
  Slot_ID: string;
  Slot_Date: string | null;
  Start_Time: string | null;
  End_Time: string | null;
  Volume: number;
  Max_Volume: number;
  Status: 'A' | 'F';
  Admin_ID: string;
  User_Name?: string;
  Phone?: string;
  Blood_Type?: string;
}

export interface Appointment {
  Appointment_ID: string;
  User_ID: string; // Chỉ member
  Slot_ID: string;
  Volume?: number;
  Status?: 'A' | 'C'; // P: Pending, C: Completed
}
export interface EmergencyRequestReqBody {
  Emergency_ID?: string
  Requester_ID: string
  BloodType_ID: string
  Needed_Before: string
  Volume: number
  Priority?: string
  Status: 'Pending' | 'Approved' | 'Completed'
  Created_At?: string
  Updated_At?: string
  Potential_ID?: string
  Appointment_ID?: string
  Staff_ID?: string
  Slot_ID?: string
}
export interface UpdateEmergencyRequestReqBody {
  Emergency_ID: string;
  Priority: 'High' | 'Medium' | 'Low';
  Status: 'Pending' | 'Approved' | 'Completed';
  Potential_ID?: string; // Tùy chọn
  Appointment_ID?: string; // Tùy chọn
  Staff_ID: string;
  Updated_At: string;
}
export class SlotFactory {
  static createDetailSlot(data: Slot, isCSV: boolean = false): slotDTO {
    const formatDate = (dateStr?: string | null): string | null => {
      if (!dateStr) return null;
      const date = new Date(dateStr);
      return isNaN(date.getTime()) ? null : date.toISOString().slice(0, 10);
    };

    const formatTime = (timeStr?: string | null): string | null => {
      if (!timeStr) return null;
      const time = new Date(`1970-01-01T${timeStr}Z`);
      return isNaN(time.getTime()) ? null : time.toISOString().slice(11, 19);
    };

    return {
      Slot_ID: data.Slot_ID,
      Slot_Date: formatDate(data.Slot_Date),
      Start_Time: formatTime(data.Start_Time),
      End_Time: formatTime(data.End_Time),
      Volume: data.Volume,
      Max_Volume: data.Max_Volume,
      Status: data.Status,
      Admin_ID: data.Admin_ID,
    };
  }
}