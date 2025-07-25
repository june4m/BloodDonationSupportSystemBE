import { log } from 'console';
import { UpdateMeReqBody } from './../models/schemas/requests/user.requests';
import { Appointment } from './../models/schemas/slot.schema';
import { body, param } from 'express-validator';
import HTTP_STATUS from "~/constant/httpStatus";
import { EmergencyRequestReqBody } from '~/models/schemas/slot.schema';

import { staffServices } from "~/services/staff.services";
import { CreateReportReqBody } from '~/models/schemas/user.schema';

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
        this.getProfileRequesterById = this.getProfileRequesterById.bind(this);
        this.getPotentialDonorCriteria = this.getPotentialDonorCriteria.bind(this);
        this.sendEmergencyEmailFixed = this.sendEmergencyEmailFixed.bind(this);
        this.assignPotentialToEmergency = this.assignPotentialToEmergency.bind(this);
        this.rejectEmergencyRequest = this.rejectEmergencyRequest.bind(this);
        this.getInfoEmergencyRequestsByMember = this.getInfoEmergencyRequestsByMember.bind(this);
        this.cancelEmergencyRequestByMember = this.cancelEmergencyRequestByMember.bind(this);
        this.createReport = this.createReport.bind(this);
        this.getLatestReport = this.getLatestReport.bind(this);
        this.updateReport = this.updateReport.bind(this);
        this.getAllBloodUnit = this.getAllBloodUnit.bind(this);
        this.createBloodUnit = this.createBloodUnit.bind(this);
        this.updateBloodUnit = this.updateBloodUnit.bind(this);
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
            const { BloodType_ID, Volume, Needed_Before,reason_Need } = req.body;
    
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
                    message: 'Bạn đang có một yêu cầu khẩn cấp đang chờ xử lý. Vui lòng chờ đến khi hoàn thành mới được tạo thêm.',
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
                reason_Need
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
            const emergencyId = req.params.emergencyId; 
            const { Priority, Status,  Place, sourceType} = req.body;
            const Potential_ID = req.params.Potential_ID || null; 
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
                Place: Place || null,
                sourceType: sourceType || null,
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
    public async getProfileRequesterById(req: any, res: any): Promise<void> {
        try {
            const User_Id = req.params.userId; 
            if (!User_Id) {
                res.status(HTTP_STATUS.BAD_REQUEST).json({
                    success: false,
                    message: 'User_Id is required',
                });
                return;
            }
            const requesterProfile = await this.staffServices.getProfileRequester(User_Id);
            console.log('Requester Profile:', requesterProfile); // Debug thông tin người yêu cầu
            
            res.status(HTTP_STATUS.OK).json({
                success: true,
                data: requesterProfile,
                message: 'Requester profile retrieved successfully'
            });
        } catch (error: any) {
            console.error('Error in getProfileRequesterById:', error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: 'Failed to retrieve requester profile',
                error: error.message || 'Internal Server Error'
            });
        }
    }
    public async getPotentialDonorCriteria(req: any, res: any): Promise<void> {
        try {
            const emergencyId = req.params.emergencyId;
            
            if (!emergencyId) {
                res.status(HTTP_STATUS.BAD_REQUEST).json({
                    success: false,
                    message: 'Emergency ID is required',
                });
                return;
            }

            const potentialDonors = await this.staffServices.getPotentialDonorCriteria(emergencyId);
            
            res.status(HTTP_STATUS.OK).json({
                success: true,
                data: potentialDonors,
                message: 'Potential donors retrieved successfully based on criteria'
            });
        } catch (error: any) {
            console.error('Error in getPotentialDonorCriteria:', error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: 'Failed to retrieve potential donors',
                error: error.message || 'Internal Server Error'
            });
        }
    }
    public async sendEmergencyEmailFixed(req: any, res: any): Promise<void> {
        try {
            const { donorEmail, donorName } = req.params;
            
            if (!donorEmail || !donorName) {
                res.status(HTTP_STATUS.BAD_REQUEST).json({
                    success: false,
                    message: 'Donor email and name are required in params'
                });
                return;
            }

            const result = await this.staffServices.sendEmergencyEmailFixed(
                donorEmail,
                donorName
            );
            
            res.status(HTTP_STATUS.OK).json({
                success: result.success,
                message: result.message,
                data: result.data
            });
            
        } catch (error: any) {
            console.error('Error in sendEmergencyEmailFixed:', error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: 'Failed to send emergency email',
                error: error.message
            });
        }
    }
    public async assignPotentialToEmergency(req: any, res: any): Promise<void> {
        try {
            const { emergencyId, potentialId } = req.params;
            const staffId = req.user?.user_id; // Lấy từ token
            console.log('Staff ID:', staffId);
            if (!emergencyId || !potentialId) {
                res.status(HTTP_STATUS.BAD_REQUEST).json({
                    success: false,
                    message: 'Emergency ID and Potential ID are required'
                });
                return;
            }
            if (!staffId) {
                res.status(HTTP_STATUS.UNAUTHORIZED).json({
                    success: false,
                    message: 'Unauthorized: Staff ID is required'
                });
                return;
            }
            const result = await this.staffServices.addPotentialDonorByStaffToEmergency(
                emergencyId,
                potentialId,
                staffId
            );
    
            res.status(HTTP_STATUS.OK).json({
                success: result.success,
                message: result.message,
                data: result.data
            });
        } catch (error: any) {
            console.error('Error in assignPotentialToEmergency:', error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: error.message || 'Failed to assign potential donor to emergency'
            });
        }
    }
    public async rejectEmergencyRequest(req: any, res: any): Promise<void> {
        try {
            const { emergencyId } = req.params; 
            const staffId = req.user?.user_id; 
            const { reason_Reject } = req.body; // Lấy lý do từ chối từ body

            if (!emergencyId) {
                res.status(400).json({
                    success: false,
                    message: 'Emergency ID is required',
                });
                return;
            }

            if (!staffId) {
                res.status(401).json({
                    success: false,
                    message: 'Unauthorized: Staff ID is required',
                });
                return;
            }

            if (!reason_Reject) {
                res.status(400).json({
                    success: false,
                    message: 'Reason for rejection is required',
                });
                return;
            }

            // Gọi service để xử lý logic từ chối yêu cầu
            const result = await this.staffServices.rejectEmergencyRequest(emergencyId, staffId, reason_Reject);

            res.status(200).json({
                success: true,
                message: 'Emergency request rejected successfully',
                data: result,
            });
        } catch (error: any) {
            console.error('Error in rejectEmergencyRequest:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to reject emergency request',
                error: error.message || 'Internal server error',
            });
        }
    }
    public async cancelEmergencyRequestByMember(req: any, res: any): Promise<void> {
        try {
            const { emergencyId } = req.params; 
            const memberId = req.user?.user_id; 
    
            if (!emergencyId) {
                res.status(400).json({
                    success: false,
                    message: 'Emergency ID is required',
                });
                return;
            }
    
            if (!memberId) {
                res.status(401).json({
                    success: false,
                    message: 'Unauthorized: Member ID is required',
                });
                return;
            }

            const result = await this.staffServices.cancelEmergencyRequestByMember(emergencyId, memberId);
            res.status(200).json({
                success: true,
                message: 'Emergency request canceled by member successfully',
                data: result,
            });
        } catch (error: any) {
            console.error('Error in cancelEmergencyRequestByMember:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to cancel emergency request by member',
                error: error.message || 'Internal server error',
            });
        }
    }
    public async getInfoEmergencyRequestsByMember(req: any, res: any): Promise<void> {
        try {
            const memberId = req.user?.user_id; // Lấy Member_ID từ token (được gắn bởi middleware)
    
            if (!memberId) {
                res.status(401).json({
                    success: false,
                    message: 'Unauthorized: Member ID is required',
                });
                return;
            }
            const emergencyRequests = await this.staffServices.getInfoEmergencyRequestsByMember(memberId);
    
            res.status(200).json({
                success: true,
                message: 'Get Info your Emergency requests retrieved successfully',
                data: emergencyRequests,
            });
        } catch (error: any) {
            console.error('Error in getInfoEmergencyRequestsByMember:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve info emergency requests',
                error: error.message || 'Internal server error',
            });
        }
    }
    public async createReport(req: any, res: any): Promise<void> {
        try {
          const { title, description, details } = req.body;
          const staff_id = req.user?.user_id;
      
          if (!staff_id || !details || !Array.isArray(details) || details.length === 0) {
            res.status(400).json({
              success: false,
              message: 'Missing staff_id or details[]',
            });
            return;
          }
      
          const reportData: CreateReportReqBody = {
            title,
            description,
            staff_id,
            details,
          };
      
          const result = await this.staffServices.createReport(reportData);
      
          res.status(201).json({
            success: true,
            message: result.message,
            data: result.data,
          });
        } catch (error: any) {
          console.error('Error in createReport:', error);
          res.status(500).json({
            success: false,
            message: 'Failed to create report',
            error: error.message || 'Internal server error',
          });
        }
    }
    public async getLatestReport(req: any, res: any): Promise<void> {
        try {
            const staffId = req.user?.user_id; // Lấy Staff_ID từ token
            
            if (!staffId) {
                res.status(HTTP_STATUS.UNAUTHORIZED).json({
                    success: false,
                    message: 'Unauthorized: Staff ID is required'
                });
                return;
            }
            
            const latestReport = await this.staffServices.getLatestReportByStaff(staffId);
            
            res.status(HTTP_STATUS.OK).json({
                success: true,
                data: latestReport,
                message: 'Latest report retrieved successfully'
            });
        } catch (error: any) {
            console.error('Error in getLatestReport:', error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: 'Failed to retrieve latest report',
                error: error.message || 'Internal Server Error'
            });
        }
    }
    public async updateReport(req: any, res: any): Promise<void> {
        try {
            const { title, description, details } = req.body;
            const staff_id = req.user?.user_id; // Lấy Staff_ID từ token
            const summaryBlood_Id = req.params.summaryBlood_Id; // Lấy từ params
            const Report_Detail_ID = req.params.Report_Detail_ID; // Lấy từ params
    
            if (!summaryBlood_Id || !staff_id || !Report_Detail_ID) {
                res.status(400).json({
                    success: false,
                    message: 'SummaryBlood_ID, Report_Detail_ID, and Staff_ID are required',
                });
                return;
            }
    
            const reportData: CreateReportReqBody = {
                summaryBlood_Id,
                title,
                description,
                staff_id,
                details: [
                    {
                        Report_Detail_ID,
                        ...details[0], // Nếu có nhiều chi tiết, bạn cần xử lý logic phù hợp
                    },
                ],
            };
    
            const result = await this.staffServices.updateReport(reportData);
    
            res.status(200).json({
                success: true,
                message: result.message,
            });
        } catch (error: any) {
            console.error('Error in updateReport:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update report',
                error: error.message || 'Internal server error',
            });
        }
    }
    public async getAllBloodUnit(req: any, res: any): Promise<void> {
        try {
            const bloodUnits = await this.staffServices.getAllBloodUnit();
            res.status(HTTP_STATUS.OK).json({
                success: true,
                data: bloodUnits,
                message: 'Blood units retrieved successfully'
            });
        } catch (error: any) {
            console.error('Error in getAllBloodUnit:', error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: 'Failed to retrieve blood units',
                error: error.message || 'Internal Server Error'
            });
        }
    }
    public async createBloodUnit(req: any, res: any): Promise<void> {
        try {
            const { BloodType_ID, Volume, Expiration_Date } = req.body;
            const staffId = req.user?.user_id; 
            if( !staffId) {
                res.status(HTTP_STATUS.UNAUTHORIZED).json({
                    success: false,
                    message: 'Unauthorized: Staff ID is required'
                });
            }
            if (!BloodType_ID || !Volume || !Expiration_Date) {
                res.status(HTTP_STATUS.BAD_REQUEST).json({
                    success: false,
                    message: 'BloodType_ID, Volume, Expiration_Date are required'
                });
                return;
            }
            const newBloodUnit = await this.staffServices.createBloodUnit({
                BloodType_ID,
                Volume,
                Expiration_Date,
                Collected_Date: new Date().toISOString().slice(0, 10), 
                Status: 'Available',
                Staff_ID: staffId
            });
    
            res.status(HTTP_STATUS.CREATED).json({
                success: true,
                data: newBloodUnit,
                message: 'Blood unit created successfully'
            });
        } catch (error: any) {
            console.error('Error in createBloodUnit:', error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: 'Failed to create blood unit',
                error: error.message || 'Internal Server Error'
            });
        }
    }
    public async updateBloodUnit(req: any, res: any): Promise<void> {
        try {
            const BloodUnit_ID = req.params.BloodUnit_ID;
            const { Status, Expiration_Date } = req.body; // Lấy từ body

            const staffId = req.user?.user_id; // Lấy Staff_ID từ token
            console.log('BloodUnit_ID:', BloodUnit_ID); // Debug giá trị
            console.log('Request Body:', req.body); 
            
            if(!staffId){
                res.status(HTTP_STATUS.UNAUTHORIZED).json({
                    success: false,
                    message: 'Unauthorized: Staff ID is required'
                });
                return;
            }
            if (!BloodUnit_ID ) {
                res.status(HTTP_STATUS.BAD_REQUEST).json({
                    success: false,
                    message: 'BloodUnit_ID  are required'
                });
                return;
            }
            if (!Status && !Expiration_Date) {
                res.status(HTTP_STATUS.BAD_REQUEST).json({
                    success: false,
                    message: 'At least one field (Status or Expiration_Date) is required'
                });
                return;
            }      
            const updatedBloodUnit = await this.staffServices.updateBloodUnitByStaff({
                BloodUnit_ID,
                Status,
                Expiration_Date,
                Staff_ID: staffId
            });
    
            res.status(HTTP_STATUS.OK).json({
                success: true,
                data: updatedBloodUnit,
                message: 'Blood unit updated successfully'
            });
        } catch (error: any) {
            console.error('Error in updateBloodUnit:', error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: 'Failed to update blood unit',
                error: error.message || 'Internal Server Error'
            });
        }
    }

}
export default StaffController;