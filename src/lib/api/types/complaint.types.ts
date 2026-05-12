export type ComplaintStatus = 'RECEIVED' | 'UNDER_REVIEW' | 'RESOLVED' | 'REJECTED' | 'CLOSED';

export type ComplaintTypeCode = 'tech' | 'selection' | 'behavior' | 'corruption' | 'vbg' | 'other';

export interface Complaint {
  id: number;
  referenceNumber: string;
  complaintType: { id: number; name: string };
  complaintTypeId: number;
  isAnonymous: boolean;
  fullName: string | null;
  contactInfo: string | null;
  incidentDate: string | null;
  incidentLocation: string | null;
  description: string;
  status: { id: number; code: string; name: string } | null;
  statusId: number | null;
  isConfidential: boolean;
  submissionIp: string | null;
  submittedAt: string;
  responseProvided: string | null;
  processedAt: string | null;
  generatedVbgAlert: boolean;
  createdAt: string;
  updatedAt: string;
}
