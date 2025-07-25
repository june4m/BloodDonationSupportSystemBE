export interface bloodUnitCreateReqBody{
    BloodUnit_ID?: string;
    BloodType_ID: string;
    BloodGroup?: string;
    Volume: number;
    Collected_Date: string;
    Expiration_Date?: string;
    Status?: string;
    Staff_ID?: string;
}
export interface bloodUnitUpdateReqBody{
    BloodUnit_ID?: string;
    BloodType_ID: string;
    BloodGroup?: string;
    Volume: number;
    Collected_Date: string;
    Expiration_Date?: string;
    Status?: string;
    Staff_ID?: string;
}