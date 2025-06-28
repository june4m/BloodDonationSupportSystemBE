import HTTP_STATUS from "~/constant/httpStatus";
import { staffServices } from "~/services/staff.services";

class StaffController{
    private staffServices: staffServices
    constructor() {
        this.staffServices = new staffServices();
        this.getPotentialList = this.getPotentialList.bind(this);
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
}
export default StaffController;