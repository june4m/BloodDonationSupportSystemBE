export interface PasswordResetToken {
    token: string
    user_id: string
    expires_at: Date
    created_at: Date
    is_used: boolean
}

export interface ForgotPasswordRequest {
    identifier: string // email hoặc phone
}

export interface ResetPasswordRequest {
    token: string
    new_password: string
}
