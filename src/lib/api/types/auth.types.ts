export interface ChangePasswordPayload {
    currentPassword: string;
    newPassword: string;
    confirmedPassword: string;
}

export interface ChangePasswordResponse {
    success: boolean;
    message: string;
}