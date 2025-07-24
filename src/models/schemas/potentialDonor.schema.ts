export interface PotentialDonor {
  Potential_ID: string
  User_ID: string
  Status?: 'Pending' | 'Approved' | 'Rejected'
  Note?: string
  Staff_ID?: string
}
