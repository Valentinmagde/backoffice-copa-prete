export type NotificationStatus = 'SENT' | 'FAILED' | 'PENDING';
export type NotificationType = 'PRESELECTION' | 'REJECTION' | 'BULK' | 'INDIVIDUAL';
export type SentByType = 'AUTOMATIC' | 'MANUAL' | 'BULK';

export interface Notification {
    id: number;
    recipientName: string;
    recipientEmail: string;
    applicationCode: string;
    type: NotificationType;
    status: NotificationStatus;
    subject: string;
    message?: string;
    sentAt: string;
    error?: string;
    sentBy: {
        id: number;
        name: string;
        email: string;
        role: string;
    };
    sentByType: SentByType;
    triggerAction?: 'PRESELECTION' | 'REJECTION' | 'SELECTION';
}

export interface NotificationFilters {
    search?: string;
    channel?: 'EMAIL' | 'SMS' | 'IN_APP';
    type?: NotificationType;
    status?: NotificationStatus;
    isSent?: boolean;
    sentByType?: SentByType;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
}

export interface PaginatedNotifications {
    data: Notification[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export type NotificationChannel = 'EMAIL' | 'SMS' | 'BOTH';

export interface SendEmailDto {
    type: NotificationType;
    channel?: NotificationChannel;
    beneficiaryIds: number[];
    subject?: string;
    message?: string;
    useAutoTemplate?: boolean;
}

export interface EmailTemplate {
    id: number;
    name: string;
    type: NotificationType;
    subject: string;
    body: string;
    isActive: boolean;
    variables: string[];
}