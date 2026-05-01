import { apiClient } from "../client/base-client";
import { EmailTemplate, Notification, NotificationFilters, NotificationStatus, NotificationType, PaginatedNotifications, SendEmailDto, SentByType } from "../types/notification.types";

class NotificationApi {
    private readonly base = '/notifications';

    async getNotifications(filters: NotificationFilters = {}): Promise<PaginatedNotifications> {
        const queryParams = new URLSearchParams();

        if (filters.search) queryParams.append('search', filters.search);
        if (filters.channel) queryParams.append('channel', filters.channel);
        if (filters.type) queryParams.append('type', filters.type);
        if (filters?.status === 'SENT') queryParams.append('isSent', 'true');
        if (filters?.status === 'FAILED') queryParams.append('isSent', 'false');
        if (filters.sentByType) queryParams.append('sentByType', filters.sentByType);
        if (filters.startDate) queryParams.append('startDate', filters.startDate);
        if (filters.endDate) queryParams.append('endDate', filters.endDate);
        if (filters.page) queryParams.append('page', filters.page.toString());
        if (filters.limit) queryParams.append('limit', filters.limit.toString());

        const url = `${this.base}/history/preselect-reject/${queryParams.toString() ? `?${queryParams}` : ''}`;
        const response = await apiClient.get(url); 
        
        return {
            data: response.data.map((item: any) => this.mapNotification(item)),
            meta: response.meta,
        }
    }

    async getNotificationById(id: number): Promise<Notification> {
        return apiClient.get(`${this.base}/${id}`);
    }

    async sendEmail(dto: SendEmailDto): Promise<{ success: boolean; message: string; count: number }> {
        return apiClient.post(`${this.base}/send`, dto);
    }

    async resendEmail(notificationId: number): Promise<{ success: boolean; message: string }> {
        return apiClient.post(`${this.base}/${notificationId}/resend`);
    }

    async deleteNotification(notificationId: number): Promise<{ success: boolean }> {
        return apiClient.delete(`${this.base}/${notificationId}`);
    }

    async deleteMultipleNotifications(ids: number[]): Promise<{ success: boolean; count: number }> {
        return apiClient.delete(`${this.base}/batch`, { data: { ids } });
    }

    async getTemplates(): Promise<EmailTemplate[]> {
        return apiClient.get(`${this.base}/templates`);
    }

    async getCandidatesForNotification(filters?: { status?: string; search?: string }): Promise<Array<{
        id: number;
        name: string;
        email: string;
        applicationCode: string;
        status: string;
        rejectionReason?: string;
    }>> {
        const params = new URLSearchParams();
        if (filters?.status) params.append('status', filters.status);
        if (filters?.search) params.append('search', filters.search);

        const url = `${this.base}/candidates${params.toString() ? `?${params}` : ''}`;
        return apiClient.get(url);
    }

    async exportNotifications(filters: NotificationFilters): Promise<Blob> {
        const queryParams = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value) queryParams.append(key, String(value));
        });

        const url = `${this.base}/export${queryParams.toString() ? `?${queryParams}` : ''}`;
        const response = await fetch(url, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            },
        });
        return response.blob();
    }

    async sendPreselectedEmail(id: number, comment: string): Promise<any> {
        return apiClient.post(`${this.base}/send/preselected/${id}`, { comment });
    }

    async sendRejectedEmail(id: number, reason: string): Promise<any> {
        return apiClient.post(`${this.base}/send/rejected/${id}`, { reason });
    }

    async sendBatchEmails(dto: { type: 'PRESELECTION' | 'REJECTION'; beneficiaryIds: number[]; message: string }): Promise<any> {
        return apiClient.post(`${this.base}/send/batch`, dto);
    }

    async sendAutoEmail(dto: { beneficiaryId: number; type: 'PRESELECTION' | 'REJECTION' | 'SELECTION' }): Promise<any> {
        return apiClient.post(`${this.base}/send/${dto.type === 'PRESELECTION' ? 'preselected' : 'rejected'}/${dto.beneficiaryId}`, dto);
    }

    async sendBatchAutoEmails(dto: { type: 'PRESELECTION' | 'REJECTION' | 'SELECTION'; beneficiaryIds: number[] }): Promise<any> {
        return apiClient.post(`${this.base}/send/batch/auto`, dto);
    }

    /**
     * Map une notification de l'API vers l'interface Notification
     */
    private mapNotification (apiNotification: any): Notification {
        const recipient = apiNotification.recipient || {};
        
        return {
            id: apiNotification.id,
            recipientName: `${recipient.firstName || ''} ${recipient.lastName || ''}`.trim() || 'N/A',
            recipientEmail: recipient.email || 'N/A',
            applicationCode: apiNotification.context?.applicationCode || `BEN-${apiNotification.context?.beneficiaryId || 'N/A'}`,
            type: this.getNotificationType(apiNotification.notificationType),
            status: this.getNotificationStatus(apiNotification.isSent, apiNotification.context),
            subject: apiNotification.title,
            message: this.getMessage(apiNotification.context, apiNotification.content),
            sentAt: apiNotification.sentAt || apiNotification.createdAt,
            error: this.getError(apiNotification.context),
            sentBy: {
                id: recipient.id || 0,
                name: `${recipient.firstName || ''} ${recipient.lastName || ''}`.trim() || 'Système',
                email: recipient.email || 'system@copa-prete.bi',
                role: 'SYSTEM',
            },
            channel: apiNotification.channel ?? 'EMAIL',
            sentByType: this.getSentByType(apiNotification.context),
            triggerAction: this.getTriggerAction(apiNotification.context),
        };
    };

    /**
     * Extrait le message du contenu HTML
     */
    private extractMessageFromHtml = (html: string): string | undefined => {
        // Chercher le texte dans la raison-box
        const reasonMatch = html.match(/<div class="reason-box">[\s\S]*?<p>(.*?)<\/p>[\s\S]*?<\/div>/i);
        if (reasonMatch && reasonMatch[1]) {
            return reasonMatch[1].replace(/<[^>]*>/g, '').trim();
        }
        
        // Chercher dans le comment-box
        const commentMatch = html.match(/<div class="comment-box">[\s\S]*?<p>(.*?)<\/p>[\s\S]*?<\/div>/i);
        if (commentMatch && commentMatch[1]) {
            return commentMatch[1].replace(/<[^>]*>/g, '').trim();
        }
        
        return undefined;
    };

    /**
     * Détermine le type de notification
     */
    private getNotificationType = (notificationType: string): NotificationType => {
        switch (notificationType) {
            case 'PRESELECTION':
                return 'PRESELECTION';
            case 'REJECTION':
                return 'REJECTION';
            case 'BULK':
                return 'BULK';
            case 'INDIVIDUAL':
                return 'INDIVIDUAL';
            default:
                return 'INDIVIDUAL';
        }
    };

    /**
     * Détermine le statut de la notification
     */
    private getNotificationStatus = (isSent: boolean, context?: any): NotificationStatus => {
        if (context?.error) return 'FAILED';
        if (isSent) return 'SENT';
        return 'FAILED';
    };

    /**
     * Détermine le type d'envoi
     */
    private getSentByType = (context?: any): SentByType => {
        if (context?.sentBy === 'AUTOMATIC') return 'AUTOMATIC';
        if (context?.sentBy === 'MANUAL') return 'MANUAL';
        if (context?.emailType === 'bulk') return 'BULK';
        return 'MANUAL';
    };

    /**
     * Extrait le message ou la raison du contexte
     */
    private getMessage = (context?: any, htmlContent?: string): string | undefined => {
        if (context?.reason) return context.reason;
        if (context?.comment) return context.comment;
        if (htmlContent) return this.extractMessageFromHtml(htmlContent);
        return undefined;
    };

    /**
     * Récupère l'erreur si présente
     */
    private getError = (context?: any): string | undefined => {
        return context?.error;
    };

    /**
     * Extrait l'action déclencheuse
     */
    private getTriggerAction = (context?: any): 'PRESELECTION' | 'REJECTION' | 'SELECTION' | undefined => {
        if (context?.triggerAction === 'PRESELECTION') return 'PRESELECTION';
        if (context?.triggerAction === 'REJECTION') return 'REJECTION';
        if (context?.triggerAction === 'SELECTION') return 'SELECTION';
        return undefined;
    };
}

export const notificationApi = new NotificationApi();
