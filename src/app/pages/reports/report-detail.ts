import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DatePicker } from 'primeng/datepicker';
import { Select } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { Tooltip } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';
import { Report, ReportParameter, ReportRun } from '@/types/report';

@Component({
    selector: 'app-report-detail',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ButtonModule,
        InputTextModule,
        DatePicker,
        Select,
        TableModule,
        ToastModule,
        Tooltip
    ],
    providers: [MessageService],
    template: `
        <p-toast position="top-right" />
        
        <div class="card">
            <!-- Report Header -->
            <div class="mb-6">
                <h1 class="text-3xl font-bold text-surface-900 dark:text-surface-0 mb-2">
                    {{ report?.name }}
                </h1>
                <p class="text-surface-600 dark:text-surface-400">
                    {{ report?.description }}
                </p>
            </div>

            <!-- Parameter Form -->
            <div class="card bg-surface-50 dark:bg-surface-800 mb-6">
                <div class="font-semibold text-xl mb-4">Report Parameters</div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <ng-container *ngFor="let param of report?.parameters">
                        <!-- Text Input -->
                        <div *ngIf="param.type === 'text'" class="flex flex-col gap-2">
                            <label [for]="param.name" class="font-semibold">
                                {{ param.label }}
                                <span *ngIf="param.required" class="text-red-500">*</span>
                            </label>
                            <input 
                                pInputText 
                                [id]="param.name"
                                [(ngModel)]="formData[param.name]"
                                [placeholder]="param.placeholder || ''"
                                class="w-full"
                            />
                        </div>

                        <!-- Date Input -->
                        <div *ngIf="param.type === 'date'" class="flex flex-col gap-2">
                            <label [for]="param.name" class="font-semibold">
                                {{ param.label }}
                                <span *ngIf="param.required" class="text-red-500">*</span>
                            </label>
                            <p-datepicker 
                                [(ngModel)]="formData[param.name]"
                                [showIcon]="true"
                                dateFormat="mm/dd/yy"
                                [placeholder]="param.placeholder || 'MM/DD/YYYY'"
                                [inputId]="param.name"
                                styleClass="w-full"
                            />
                        </div>

                        <!-- Dropdown -->
                        <div *ngIf="param.type === 'dropdown'" class="flex flex-col gap-2">
                            <label [for]="param.name" class="font-semibold">
                                {{ param.label }}
                                <span *ngIf="param.required" class="text-red-500">*</span>
                            </label>
                            <p-select
                                [(ngModel)]="formData[param.name]"
                                [options]="param.options || []"
                                optionLabel="label"
                                optionValue="value"
                                [placeholder]="'Select ' + param.label"
                                [inputId]="param.name"
                                styleClass="w-full"
                            />
                        </div>

                        <!-- Number Input -->
                        <div *ngIf="param.type === 'number'" class="flex flex-col gap-2">
                            <label [for]="param.name" class="font-semibold">
                                {{ param.label }}
                                <span *ngIf="param.required" class="text-red-500">*</span>
                            </label>
                            <input 
                                pInputText 
                                type="number"
                                [id]="param.name"
                                [(ngModel)]="formData[param.name]"
                                [placeholder]="param.placeholder || ''"
                                class="w-full"
                            />
                        </div>
                    </ng-container>
                </div>

                <!-- Action Buttons -->
                <div class="flex justify-end gap-2">
                    <button 
                        pButton 
                        label="Clear" 
                        icon="pi pi-times" 
                        severity="secondary"
                        (click)="clearForm()"
                        [disabled]="isRunning"
                    ></button>
                    <button 
                        pButton 
                        [label]="isRunning ? 'Running...' : 'Run Report'" 
                        [icon]="isRunning ? 'pi pi-spin pi-spinner' : 'pi pi-play'" 
                        (click)="runReport()"
                        [disabled]="isRunning || !isFormValid()"
                    ></button>
                </div>
            </div>

            <!-- Run History -->
            <div class="card">
                <div class="font-semibold text-xl mb-4">Run History</div>
                
                <p-table 
                    [value]="runHistory" 
                    [paginator]="true" 
                    [rows]="10"
                    [tableStyle]="{ 'min-width': '60rem' }"
                    *ngIf="runHistory.length > 0"
                >
                    <ng-template pTemplate="header">
                        <tr>
                            <th pSortableColumn="runDate">
                                Run Date
                                <p-sortIcon field="runDate" />
                            </th>
                            <th>Parameters</th>
                            <th pSortableColumn="status">
                                Status
                                <p-sortIcon field="status" />
                            </th>
                            <th pSortableColumn="runBy">
                                Run By
                                <p-sortIcon field="runBy" />
                            </th>
                            <th>Actions</th>
                        </tr>
                    </ng-template>
                    <ng-template pTemplate="body" let-run>
                        <tr>
                            <td>{{ run.runDate | date:'MM/dd/yyyy hh:mm a' }}</td>
                            <td>
                                <div class="text-sm">
                                    <div *ngFor="let param of getParameterSummary(run.parameters)" class="text-surface-600 dark:text-surface-400">
                                        {{ param }}
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span 
                                    class="px-2 py-1 rounded text-xs font-semibold"
                                    [ngClass]="{
                                        'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200': run.status === 'completed',
                                        'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200': run.status === 'failed',
                                        'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200': run.status === 'running'
                                    }"
                                >
                                    {{ run.status | titlecase }}
                                </span>
                            </td>
                            <td>{{ run.runBy }}</td>
                            <td>
                                <button 
                                    *ngIf="run.status === 'completed'"
                                    pButton 
                                    icon="pi pi-download" 
                                    severity="secondary"
                                    [rounded]="true"
                                    [text]="true"
                                    (click)="downloadReport(run)"
                                    pTooltip="Download Report"
                                ></button>
                            </td>
                        </tr>
                    </ng-template>
                </p-table>

                <div *ngIf="runHistory.length === 0" class="text-center py-12">
                    <i class="pi pi-history text-6xl text-surface-400 dark:text-surface-600 mb-4"></i>
                    <p class="text-surface-600 dark:text-surface-400">No run history available</p>
                    <p class="text-surface-500 dark:text-surface-500 text-sm mt-2">
                        Run this report to see the history here
                    </p>
                </div>
            </div>
        </div>
    `
})
export class ReportDetail implements OnInit {
    report: Report | null = null;
    formData: { [key: string]: any } = {};
    runHistory: ReportRun[] = [];
    isRunning: boolean = false;

    // Sample reports data
    private reports: Report[] = [];

    constructor(
        private route: ActivatedRoute,
        private messageService: MessageService
    ) {}

    ngOnInit(): void {
        this.initializeReports();
        
        this.route.params.subscribe(params => {
            const reportId = params['id'];
            if (reportId) {
                this.loadReport(reportId);
            }
        });
    }

    private initializeReports(): void {
        this.reports = [
            {
                id: 'member-demographics',
                name: 'Member Demographics Report',
                description: 'Comprehensive report showing member demographic information including age, gender, location, and plan details.',
                parameters: [
                    {
                        name: 'startDate',
                        label: 'Start Date',
                        type: 'date',
                        required: true,
                        placeholder: 'MM/DD/YYYY'
                    },
                    {
                        name: 'endDate',
                        label: 'End Date',
                        type: 'date',
                        required: true,
                        placeholder: 'MM/DD/YYYY'
                    },
                    {
                        name: 'lineOfBusiness',
                        label: 'Line of Business',
                        type: 'dropdown',
                        required: false,
                        options: [
                            { label: 'All', value: 'all' },
                            { label: 'Medicare', value: 'medicare' },
                            { label: 'Medicaid', value: 'medicaid' },
                            { label: 'Marketplace', value: 'marketplace' },
                            { label: 'Commercial', value: 'commercial' }
                        ]
                    }
                ]
            },
            {
                id: 'claims-summary',
                name: 'Claims Summary Report',
                description: 'Detailed summary of claims data including claim amounts, status, processing dates, and member information.',
                parameters: [
                    {
                        name: 'startDate',
                        label: 'Start Date',
                        type: 'date',
                        required: true,
                        placeholder: 'MM/DD/YYYY'
                    },
                    {
                        name: 'endDate',
                        label: 'End Date',
                        type: 'date',
                        required: true,
                        placeholder: 'MM/DD/YYYY'
                    },
                    {
                        name: 'memberId',
                        label: 'Member ID',
                        type: 'text',
                        required: false,
                        placeholder: 'Enter Member ID'
                    },
                    {
                        name: 'claimStatus',
                        label: 'Claim Status',
                        type: 'dropdown',
                        required: false,
                        options: [
                            { label: 'All', value: 'all' },
                            { label: 'Approved', value: 'approved' },
                            { label: 'Pending', value: 'pending' },
                            { label: 'Denied', value: 'denied' },
                            { label: 'In Review', value: 'review' }
                        ]
                    }
                ]
            },
            {
                id: 'provider-directory',
                name: 'Provider Directory Report',
                description: 'Complete listing of healthcare providers including specialties, locations, contact information, and network status.',
                parameters: [
                    {
                        name: 'specialty',
                        label: 'Specialty',
                        type: 'dropdown',
                        required: false,
                        options: [
                            { label: 'All', value: 'all' },
                            { label: 'Primary Care', value: 'primary-care' },
                            { label: 'Cardiology', value: 'cardiology' },
                            { label: 'Dermatology', value: 'dermatology' },
                            { label: 'Orthopedics', value: 'orthopedics' },
                            { label: 'Pediatrics', value: 'pediatrics' }
                        ]
                    },
                    {
                        name: 'location',
                        label: 'Location',
                        type: 'text',
                        required: false,
                        placeholder: 'City or ZIP Code'
                    },
                    {
                        name: 'networkStatus',
                        label: 'Network Status',
                        type: 'dropdown',
                        required: false,
                        options: [
                            { label: 'All', value: 'all' },
                            { label: 'In-Network', value: 'in-network' },
                            { label: 'Out-of-Network', value: 'out-of-network' }
                        ]
                    }
                ]
            },
            {
                id: 'utilization-analysis',
                name: 'Utilization Analysis Report',
                description: 'Analysis of healthcare service utilization patterns, costs, and trends across member populations.',
                parameters: [
                    {
                        name: 'startDate',
                        label: 'Start Date',
                        type: 'date',
                        required: true,
                        placeholder: 'MM/DD/YYYY'
                    },
                    {
                        name: 'endDate',
                        label: 'End Date',
                        type: 'date',
                        required: true,
                        placeholder: 'MM/DD/YYYY'
                    },
                    {
                        name: 'serviceType',
                        label: 'Service Type',
                        type: 'dropdown',
                        required: false,
                        options: [
                            { label: 'All', value: 'all' },
                            { label: 'Inpatient', value: 'inpatient' },
                            { label: 'Outpatient', value: 'outpatient' },
                            { label: 'Emergency', value: 'emergency' },
                            { label: 'Pharmacy', value: 'pharmacy' }
                        ]
                    }
                ]
            },
            {
                id: 'enrollment-report',
                name: 'Enrollment Report',
                description: 'Member enrollment statistics including new enrollments, terminations, and active member counts by plan.',
                parameters: [
                    {
                        name: 'reportMonth',
                        label: 'Report Month',
                        type: 'date',
                        required: true,
                        placeholder: 'MM/DD/YYYY'
                    },
                    {
                        name: 'planType',
                        label: 'Plan Type',
                        type: 'dropdown',
                        required: false,
                        options: [
                            { label: 'All', value: 'all' },
                            { label: 'HMO', value: 'hmo' },
                            { label: 'PPO', value: 'ppo' },
                            { label: 'EPO', value: 'epo' },
                            { label: 'POS', value: 'pos' }
                        ]
                    }
                ]
            }
        ];
    }

    private loadReport(reportId: string): void {
        this.report = this.reports.find(r => r.id === reportId) || null;
        
        if (this.report) {
            this.initializeFormData();
            this.loadRunHistory();
        }
    }

    private initializeFormData(): void {
        this.formData = {};
        this.report?.parameters.forEach(param => {
            if (param.type === 'dropdown' && param.options && param.options.length > 0) {
                this.formData[param.name] = param.options[0].value;
            } else {
                this.formData[param.name] = null;
            }
        });
    }

    private loadRunHistory(): void {
        // Simulate loading run history
        const now = new Date();
        this.runHistory = [
            {
                id: '1',
                reportId: this.report!.id,
                reportName: this.report!.name,
                parameters: { ...this.formData },
                runDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
                status: 'completed',
                runBy: 'Augie Lopez'
            },
            {
                id: '2',
                reportId: this.report!.id,
                reportName: this.report!.name,
                parameters: { ...this.formData },
                runDate: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
                status: 'completed',
                runBy: 'Augie Lopez'
            }
        ];
    }

    isFormValid(): boolean {
        if (!this.report) return false;
        
        for (const param of this.report.parameters) {
            if (param.required && !this.formData[param.name]) {
                return false;
            }
        }
        return true;
    }

    clearForm(): void {
        this.initializeFormData();
        this.messageService.add({
            severity: 'info',
            summary: 'Form Cleared',
            detail: 'All parameters have been reset'
        });
    }

    runReport(): void {
        if (!this.isFormValid()) {
            this.messageService.add({
                severity: 'error',
                summary: 'Validation Error',
                detail: 'Please fill in all required fields'
            });
            return;
        }

        this.isRunning = true;

        // Simulate report generation
        setTimeout(() => {
            const newRun: ReportRun = {
                id: Date.now().toString(),
                reportId: this.report!.id,
                reportName: this.report!.name,
                parameters: { ...this.formData },
                runDate: new Date(),
                status: 'completed',
                runBy: 'Augie Lopez'
            };

            this.runHistory.unshift(newRun);
            this.isRunning = false;

            // Simulate file download
            this.downloadReport(newRun);

            this.messageService.add({
                severity: 'success',
                summary: 'Report Generated',
                detail: 'Your report has been generated and downloaded successfully'
            });
        }, 2000);
    }

    downloadReport(run: ReportRun): void {
        // Simulate file download
        const content = this.generateReportContent(run);
        const blob = new Blob([content], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${run.reportName.replace(/\s+/g, '-')}-${new Date().getTime()}.csv`;
        link.click();
        window.URL.revokeObjectURL(url);

        this.messageService.add({
            severity: 'info',
            summary: 'Download Started',
            detail: 'Your report is being downloaded'
        });
    }

    private generateReportContent(run: ReportRun): string {
        // Generate sample CSV content
        let csv = `Report: ${run.reportName}\n`;
        csv += `Generated: ${run.runDate.toLocaleString()}\n`;
        csv += `Run By: ${run.runBy}\n\n`;
        csv += `Parameters:\n`;
        
        Object.keys(run.parameters).forEach(key => {
            const value = run.parameters[key];
            if (value) {
                csv += `${key}: ${value instanceof Date ? value.toLocaleDateString() : value}\n`;
            }
        });
        
        csv += `\n\nSample Data:\n`;
        csv += `Column1,Column2,Column3,Column4\n`;
        for (let i = 0; i < 10; i++) {
            csv += `Data${i+1},Value${i+1},Item${i+1},Result${i+1}\n`;
        }
        
        return csv;
    }

    getParameterSummary(parameters: { [key: string]: any }): string[] {
        const summary: string[] = [];
        Object.keys(parameters).forEach(key => {
            const value = parameters[key];
            if (value) {
                const displayValue = value instanceof Date ? value.toLocaleDateString() : value;
                summary.push(`${key}: ${displayValue}`);
            }
        });
        return summary;
    }
}

