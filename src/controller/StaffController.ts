import { UpdateMeReqBody } from './../models/schemas/requests/user.requests';
import { Appointment } from './../models/schemas/slot.schema';
import { body, param } from 'express-validator';
import HTTP_STATUS from "~/constant/httpStatus";
import { EmergencyRequestReqBody } from '~/models/schemas/slot.schema';

import { staffServices } from "~/services/staff.services";

class StaffController{
    private staffServices: staffServices
    constructor() {
        this.staffServices = new staffServices();
        this.getPotentialList = this.getPotentialList.bind(this);
        this.getMemberList = this.getMemberList.bind(this);
        this.addMemberToPotentialList = this.addMemberToPotentialList.bind(this);
        this.createEmergencyRequest = this.createEmergencyRequest.bind(this);
        this.getAllEmergencyRequests = this.getAllEmergencyRequests.bind(this);
        this.handleEmergencyRequest = this.handleEmergencyRequest.bind(this);
        this.getBloodBank = this.getBloodBank.bind(this);
    }
    public async getPotentialList(req: any, res: any): Promise<void> {
        try{
            const potentialDonors = await this.staffServices.getPotentialList();
            res.status(HTTP_STATUS.OK).json({
                success: true,
                data: potentialDonors,
                message: 'Potential donors retrieved successfully'
            });
        }catch (error: any) {
            console.error('Error in getPotentialList:', error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: 'Failed to retrieve potential donors',
                error: error.message || 'Internal Server Error'
            });
        }
    }
    public async getMemberList(req: any, res: any): Promise<void> {
        try {
            const members = await this.staffServices.getMemberList();
            res.status(HTTP_STATUS.OK).json({
                success: true,
                data: members,
                message: 'Members retrieved successfully'
            });
        } catch (error: any) {
            console.error('Error in getMemberList:', error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: 'Failed to retrieve members',
                error: error.message || 'Internal Server Error'
            });
        }
    }
    public async addMemberToPotentialList(req: any, res: any): Promise<void> {
        try {
            const userId = req.body.User_ID as string
            const staffId = req.user?.user_id; 
            const note = req.body.note as string || '';
            if (!userId || !staffId){
                res.status(HTTP_STATUS.BAD_REQUEST).json({
                    success: false,
                    message: 'User ID and Staff ID are required'
                });
                return;
            }
            const isDuplicate = await this.staffServices.checkPotentialDonorExists(userId);
            if (isDuplicate) {
                res.status(HTTP_STATUS.BAD_REQUEST).json({
                    success: false,
                    message: 'User already exists in the potential donor list'
                });
                return;
            }
            await this.staffServices.addMemberToPotentialList(userId, staffId, note);
            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: 'Member added to potential list successfully'
            });
        }catch (error: any) {
            console.error('Error in addMemberToPotentialList:', error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: 'Failed to add member to potential list',
                error: error.message || 'Internal Server Error'
            });
        }
    }    
    public async createEmergencyRequest(req: any, res: any): Promise<void> {
        try {
            const { BloodType_ID, Volume, Needed_Before } = req.body;
    
            // Kiểm tra dữ liệu đầu vào
            if (!BloodType_ID || !Volume || !Needed_Before) {
                res.status(400).json({
                    success: false,
                    message: 'BloodType_ID, Volume, and Needed_Before are required',
                });
                return;
            }
    
            // Lấy Requester_ID từ token
            const Requester_ID = req.user?.user_id;
            console.log('Requester_ID:', Requester_ID); // Debug giá trị
    
            // Kiểm tra spam
            const isSpam = await this.staffServices.isSpamRequest(Requester_ID);
            if (isSpam) {
                res.status(429).json({
                    success: false,
                    message: 'You have already submitted a request recently. Please wait before submitting another request.',
                });
                return;
            }
    
            // Gọi service để tạo yêu cầu máu khẩn cấp
            const emergencyRequest = await this.staffServices.createEmergencyRequest({
                Requester_ID,
                Volume,
                BloodType_ID,
                Needed_Before,
                Status: 'Pending',
                Created_At: new Date().toISOString(),
            });
    
            res.status(200).json({
                success: true,
                message: 'Emergency blood request created successfully',
                data: emergencyRequest,
            });
        } catch (error: any) {
            console.error('Error in createEmergencyRequest:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to create emergency blood request',
                error: error.message || 'Internal server error',
            });
        }
    }
    public async getAllEmergencyRequests(req: any, res: any): Promise<void> {
        try {
            const emergencyRequests = await this.staffServices.getAllEmergencyRequests();
            res.status(200).json({
                success: true,
                data: emergencyRequests,
                message: 'Emergency requests retrieved successfully',
            });
        } catch (error: any) {
            console.error('Error in getAllEmergencyRequests:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve emergency requests',
                error: error.message || 'Internal server error',
            });
        }
    }
    public async handleEmergencyRequest(req: any, res: any): Promise<void> {
        try {
            const emergencyId = req.params.emergencyId; // Lấy emergencyId từ URL
            const { Priority, Status, Potential_ID, Appointment_ID } = req.body;
            const Staff_ID = req.user?.user_id;
    
            if (!emergencyId || !Priority || !Status) {
                res.status(HTTP_STATUS.BAD_REQUEST).json({
                    success: false,
                    message: 'Emergency_ID, Priority, and Status are required',
                });
                return;
            }
    
            const updateReqEmergency = await this.staffServices.updateEmergencyRequest({
                Emergency_ID: emergencyId,
                Priority,
                Status,
                Potential_ID: Potential_ID || null,
                Appointment_ID: Appointment_ID || null,
                Staff_ID,
                Updated_At: new Date().toISOString(),
            });
    
            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: 'Emergency request handled successfully',
                data: updateReqEmergency,
            });
        } catch (error: any) {
            console.error('Error in handleEmergencyRequest:', error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: 'Failed to handle emergency request',
                error: error.message || 'Internal server error',
            });
        }
    }
    public async getBloodBank(req: any, res: any): Promise<void> {
        try {
            const bloodBank = await this.staffServices.getBloodBank();
            res.status(HTTP_STATUS.OK).json({
                success: true,
                data: bloodBank,
                message: 'Blood bank retrieved successfully'
            });
        } catch (error: any) {
            console.error('Error in getBloodBank:', error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: 'Failed to retrieve blood bank',
                error: error.message || 'Internal Server Error'
            });
        }
    }
}
export default StaffController;