export interface PotentialDonor {
  Potential_ID: string
  User_ID: string
  Status?: 'Approved' | 'Rejected'
  Note?: string
  Admin_ID?: string
}
