import { sendEmail } from './EmailController';
import cron from 'node-cron';
import moment from 'moment-timezone';

import { sendEmailService } from '~/services/email.services'; // Adjust the import to the correct sendEmail function
import { AppointmentServices } from '~/services/appointment.services';

class ScheduleCronJobController {
    private appointmentService: AppointmentServices;
    constructor() {
        this.appointmentService = new AppointmentServices();
    }
    
    public  init(){
        cron.schedule(
            `0 20 * * * `,
            async () =>{
                try {
                    const tomorrowStart = moment().tz('Asia/Ho_Chi_Minh').add(1, 'day').startOf('day').toDate();
                    const tomorrowEnd = moment().tz('Asia/Ho_Chi_Minh').add(1, 'day').endOf('day').toDate();

                    // Lấy danh sách các cuộc hẹn vào ngày mai
                    const appointments = await this.appointmentService.findBeetweenDate(tomorrowStart, tomorrowEnd);

                    // Gửi email cho từng người dùng
                    for (const appointment of appointments) {
                        const emailContent = `
                            Xin chào ${appointment.User_Name},<br><br>
                            Bạn có lịch hiến máu vào ngày ${moment(appointment.Slot_Date).format('DD/MM/YYYY')} lúc ${appointment.Start_Time}.<br>
                            Vui lòng đến đúng giờ.<br><br>
                            Cảm ơn bạn đã đóng góp cho cộng đồng!
                        `;

                        await sendEmailService(appointment.Email, 'Nhắc nhở hiến máu', emailContent);
                        console.log(`Email sent to ${appointment.Email}`);
                    }
                } catch (error) {
                    console.error('Error in sending reminder emails:', error);
                }
            }
        )
    }
}
export default ScheduleCronJobController;