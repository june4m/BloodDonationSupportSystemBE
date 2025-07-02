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
        this.addEmergencyRequest = this.addEmergencyRequest.bind(this);
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
            const note = req.query.note as string || '';
            if (!userId || !staffId){
                res.status(HTTP_STATUS.BAD_REQUEST).json({
                    success: false,
                    message: 'User ID and Staff ID are required'
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
    public async addEmergencyRequest(req: any, res: any): Promise<void> {
        try {
          const body: EmergencyRequestReqBody = req.body;
      
          // Kiểm tra dữ liệu đầu vào
          if (!body.BloodType_ID || !body.Volume || !body.Needed_Before || !body.Requester_Name || !body.Requester_Phone) {
            res.status(HTTP_STATUS.BAD_REQUEST).json({
              success: false,
              message: 'Blood Type ID, Volume, Needed Before, Requester Name, and Requester Phone are required',
            });
            return;
          }
      
          await this.staffServices.addEmergencyRequest(body);
          res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Emergency request created successfully',
          });
        } catch (error: any) {
          console.error('Error in addEmergencyRequest:', error);
          res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Failed to create emergency request',
            error: error.message || 'Internal Server Error',
          });
        }
    }
}
export default StaffController;