import { AppointmentRepository } from './../repository/appointment.repository';

export class appointmentServices{
    private appointmentRepository : AppointmentRepository
    constructor(){
        this.appointmentRepository = new AppointmentRepository;
    }
}