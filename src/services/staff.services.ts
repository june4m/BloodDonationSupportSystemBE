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
}