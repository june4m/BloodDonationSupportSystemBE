
import { log } from 'console';
import { promises } from 'dns';
import { body } from 'express-validator';
import { PotentialDonorCriteria } from '~/models/schemas/requests/user.requests';
import { EmergencyRequestReqBody, UpdateEmergencyRequestReqBody } from '~/models/schemas/slot.schema';

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
          console.log('isSpam:', isSpam); // Debug kết quả
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
    public async getPotentialDonorCriteria(requesterId: string): Promise<any> {
      try {
          const potentialDonors = await this.staffRepository.getPotentialDonorCriteria(requesterId);
          return potentialDonors;
      } catch (error) {
          console.error('Error in getPotentialDonorCriteria:', error);
          throw error;
      }
  }
    
}