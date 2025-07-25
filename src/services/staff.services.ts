
import { log } from 'console';
import { promises } from 'dns';
import { body } from 'express-validator';
import { bloodUnitCreateReqBody, bloodUnitUpdateReqBody } from '~/models/schemas/requests/bloodbank.requests.schema';
import { PotentialDonorCriteria } from '~/models/schemas/requests/user.requests';
import { EmergencyRequestReqBody, UpdateEmergencyRequestReqBody } from '~/models/schemas/slot.schema';
import { CreateReportReqBody } from '~/models/schemas/user.schema';

import { StaffRepository } from "~/repository/staff.repository"

export class staffServices{
    private staffRepository: StaffRepository;
    constructor() {
        this.staffRepository = new StaffRepository();
    }
    async getPotentialList() {
        try {
            const potentialDonors = await this.staffRepository.getPotentialList();
            return potentialDonors;
        } catch (error) {
            console.error('Cannot get PotentialDonorList in getPotentialList:', error);
            throw error;
        }
    }
    async getMemberList(){
        try {
            const members = await this.staffRepository.getMemberList();
            return members;
        } catch (error) {
            console.error('Cannot get MemberList in getMemberList:', error);
            throw error;
        }
    }
    async addMemberToPotentialList(userId: string, staffId: string, note: string): Promise<void> {
        try {
          await this.staffRepository.addMemberToPotentialList(userId, staffId, note);
        } catch (error) {
          console.error('Cannot add member to potential list:', error);
          throw error;
        }
    }
    async addEmergencyRequest(body: EmergencyRequestReqBody): Promise<void> {
        try {
          await this.staffRepository.createEmergencyRequest(body);
        } catch (error) {
          console.error('Error in addEmergencyRequest:', error);
          throw error;
        }
    }
    async checkPotentialDonorExists(userId: string): Promise<boolean> {
      try {
        const result = await this.staffRepository.checkPotentialDonorExists(userId);
        return result;
      } catch (error) {
        console.error('Error in checkPotentialDonorExists:', error);
        throw error;
      }
    }
    public async createEmergencyRequest(data: EmergencyRequestReqBody): Promise<any> {
      try {
          const emergencyRequest = await this.staffRepository.createEmergencyRequest(data);
          return emergencyRequest;
      } catch (error) {
          console.error('Error in createEmergencyRequest:', error);
          throw error;
      }
    }
    public async isSpamRequest(userId: string): Promise<boolean> {
      try {
          const isSpam = await this.staffRepository.checkRecentEmergencyRequest(userId);
          console.log('isSpam:', isSpam); 
          return isSpam;
      } catch (error) {
          console.error('Error in isSpamRequest:', error);
          throw error;
      }
    }
    public async getAllEmergencyRequests(): Promise<EmergencyRequestReqBody[]> {
      try {
          const emergencyRequests = await this.staffRepository.getAllEmergencyRequests();
          return emergencyRequests;
      } catch (error) {
          console.error('Error in getAllEmergencyRequests:', error);
          throw error;
      }
    }
    public async updateEmergencyRequest(data: UpdateEmergencyRequestReqBody): Promise<any> {
      try {
          const updatedRequest = await this.staffRepository.updateEmergencyRequest(data);
          return updatedRequest;
      } catch (error) {
          console.error('Error in updateEmergencyRequest:', error);
          throw error;
      }
    } 
    public async getBloodBank(): Promise<any> {
      try {
          const bloodBank = await this.staffRepository.getBloodBank();
          return bloodBank;
      } catch (error) {
          console.error('Error in getBloodBank:', error);
          throw error;
      }
    }
    public async getProfileRequester(User_Id: string): Promise<any> {
      try {
          const requesterProfile = await this.staffRepository.getProfileRequesterById(User_Id);
          return requesterProfile;
      } catch (error) {
          console.error('Error in getProfileRequester:', error);
          throw error;
      }
    }
    public async getPotentialDonorCriteria(emergencyId: string): Promise<any> {
      try {
          const potentialDonors = await this.staffRepository.getPotentialDonorCriteria(emergencyId);
          return potentialDonors;
      } catch (error) {
          console.error('Error in getPotentialDonorCriteria:', error);
          throw error;
      }
    }
    public async sendEmergencyEmailFixed(
      donorEmail: string,
      donorName: string
    ): Promise<any> {
        try {
            const result = await this.staffRepository.sendEmergencyEmailFixed(
                donorEmail,
                donorName
            );
            return result;
        } catch (error) {
            console.error('Error in sendEmergencyEmailFixed:', error);
            throw error;
        }
    }
    public async addPotentialDonorByStaffToEmergency(
      emergencyId: string,
      potentialId: string,
      staffId: string
    ): Promise<any> {
        try {
            // Gọi repository để thực hiện logic
            const result = await this.staffRepository.addPotentialDonorByStaffToEmergency(
                emergencyId,
                potentialId,
                staffId
            );
            return result;
        } catch (error) {
            console.error('Error in addPotentialDonorByStaffToEmergency:', error);
            throw error;
        }
    }
    public async rejectEmergencyRequest(emergencyId: string, staffId: string, reason_Reject: string): Promise<any> {
      try {
          const result = await this.staffRepository.rejectEmergencyRequest(emergencyId, staffId, reason_Reject);
          return result;
      } catch (error) {
          console.error('Error in rejectEmergencyRequest:', error);
          throw error;
      }
    }
    public async cancelEmergencyRequestByMember(emergencyId: string, memberId: string): Promise<any> {
      try {
          const result = await this.staffRepository.cancelEmergencyRequestByMember(emergencyId, memberId);
          return result;
      } catch (error) {
          console.error('Error in cancelEmergencyRequestByMember:', error);
          throw error;
      }
    }
    public async getInfoEmergencyRequestsByMember(memberId: string): Promise<EmergencyRequestReqBody[]> {
      try {
          const emergencyRequests = await this.staffRepository.getInfoEmergencyRequestsByMember(memberId);
          return emergencyRequests;
      } catch (error) {
          console.error('Error in getDeletedEmergencyRequestsByMember:', error);
          throw error;
      }
    }
  
    public async createReport(data: CreateReportReqBody): Promise<any> {
      try {
          return await this.staffRepository.createReport(data);
      } catch (error) {
          console.error('Error in createReport:', error);
          throw error;
      }
    }
    public async getLatestReportByStaff(staffId: string): Promise<any> {
      try {
          return await this.staffRepository.getLatestReportByStaff(staffId);
      } catch (error) {
          console.error('Error in getLatestReportByStaff:', error);
          throw error;
      }
    }
    public async updateReport(data: CreateReportReqBody): Promise<any> {
      try {
          return await this.staffRepository.updateReport(data);
      } catch (error) {
          console.error('Error in updateReport:', error);
          throw error;
      }
    }
    public async getAllBloodUnit(): Promise<bloodUnitUpdateReqBody[]> {
      try {
          const bloodUnits = await this.staffRepository.getAllBloodUnit();
          return bloodUnits;
      } catch (error) {
          console.error('Error in getAllBloodUnit:', error);
          throw error;
      }
    }
    public async createBloodUnit(data: bloodUnitCreateReqBody): Promise<any> {
      try {
          const bloodUnit = await this.staffRepository.createBloodUnitByStaff(data);
          return bloodUnit;
      } catch (error) {
          console.error('Error in createBloodUnit:', error);
          throw error;
      }
    }
    public async updateBloodUnitByStaff(data: { BloodUnit_ID: string; Status?: string; Expiration_Date?: string; Staff_ID: string }): Promise<any> {
      try {
          return await this.staffRepository.updateBloodUnitByStaff(data);
      } catch (error) {
          console.error('Error in updateBloodUnitByStaff:', error);
          throw error;
      }
    }
    
    
}