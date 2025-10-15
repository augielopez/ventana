export type ParameterType = 'text' | 'date' | 'daterange' | 'dropdown' | 'number';

export interface ReportParameter {
    name: string;
    label: string;
    type: ParameterType;
    required: boolean;
    options?: { label: string; value: string }[];
    placeholder?: string;
}

export interface Report {
    id: string;
    name: string;
    description: string;
    parameters: ReportParameter[];
}

export interface ReportRun {
    id: string;
    reportId: string;
    reportName: string;
    parameters: { [key: string]: any };
    runDate: Date;
    status: 'completed' | 'failed' | 'running';
    downloadUrl?: string;
    runBy: string;
}


