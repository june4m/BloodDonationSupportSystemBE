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
}