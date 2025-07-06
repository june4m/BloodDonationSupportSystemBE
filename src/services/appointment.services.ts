import { AppointmentRepository } from './../repository/appointment.repository';

export class appointmentServices{
    private appointmentRepository : AppointmentRepository
    constructor(){
        this.appointmentRepository = new AppointmentRepository;
    }

    async updateStatus(appointmentId: string, status: 'A' | 'R' | 'P', rejectReason?: string, verifiedBloodType?: string) {
        return this.appointmentRepository.updateAppointmentStatus(appointmentId, status, rejectReason, verifiedBloodType);
    }

    async getHistoryByUser(userId: string) {
        const data = await this.appointmentRepository.getAppointmentsByUser(userId);
        return this.formatAppointmentData(data);
    }

    async getAllAppointmentList() {
        const data = await this.appointmentRepository.getAllAppointmentList();
        console.log("[DEBUG][Service] Dữ liệu nhận từ repo getAllAppointmentList:", data); // DEBUG
        return this.formatAppointmentData(data);
    }

    private formatAppointmentData(data: any[]): any[] {
        return data.map(item => ({
            ...item,
            Start_Time: this.formatTime(item.Start_Time),
            End_Time: this.formatTime(item.End_Time)
        }));
    }

    private formatTime(timeStr?: string | null): string | null {
        if (!timeStr) return null;
        
        // Nếu timeStr đã là định dạng TIME (HH:mm:ss), trả về trực tiếp
        if (typeof timeStr === 'string' && /^\d{2}:\d{2}:\d{2}$/.test(timeStr)) {
            return timeStr;
        }
        
        // Nếu là Date object hoặc string có thể parse thành Date
        try {
            const time = new Date(timeStr);
            if (isNaN(time.getTime())) {
                return null;
            }
            return time.toTimeString().slice(0, 8); // Trả về HH:mm:ss
        } catch (error) {
            return null;
        }
    }
}