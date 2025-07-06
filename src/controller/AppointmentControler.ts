import { Request, Response } from 'express';
import { appointmentServices } from '~/services/appointment.services';
import { ResponseHandle } from '~/utils/Response';

class AppointmentController {
    private appointmentService = new appointmentServices();

    // Staff xác nhận/từ chối/chỉnh sửa
    confirmAppointment = async (req: Request, res: Response): Promise<void> => {
        try {
            const { Appointment_ID, Status, Reject_Reason, Verified_BloodType } = req.body;
            if (!Appointment_ID || !Status || !['A', 'R', 'P'].includes(Status)) {
                ResponseHandle.responseError(res, null, 'Invalid data', 400);
                return;
            }
            await this.appointmentService.updateStatus(Appointment_ID, Status, Reject_Reason, Verified_BloodType);
            ResponseHandle.responseSuccess(res, null, 'Appointment updated', 200);
        } catch (err) {
            ResponseHandle.responseError(res, err, 'Update failed', 500);
        }
    }

    // Member xem lịch sử
    getHistory = async (req: Request, res: Response): Promise<void> => {
        try {
            const { userId } = req.query;
            if (!userId) {
                ResponseHandle.responseError(res, null, 'Missing userId', 400);
                return;
            }
            const data = await this.appointmentService.getHistoryByUser(userId as string);
            ResponseHandle.responseSuccess(res, data, 'Fetched', 200);
        } catch (err) {
            ResponseHandle.responseError(res, err, 'Fetch failed', 500);
        }
    }

    getAllAppointments = async (req: Request, res: Response): Promise<void> => {
        try {
            const data = await this.appointmentService.getAllAppointmentList();
            console.log("[DEBUG][Controller] Dữ liệu trả về FE getAllAppointments:", data); // DEBUG
            res.json({ data });
        } catch (err) {
            res.status(500).json({ error: 'Failed to fetch appointments' });
        }
    }
}

export default new AppointmentController();