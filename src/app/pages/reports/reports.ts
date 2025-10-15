import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { Report } from '@/types/report';
import { LayoutService } from '@/layout/service/layout.service';
import { MenuItem } from 'primeng/api';

@Component({
    selector: 'app-reports',
    standalone: true,
    imports: [CommonModule, CardModule, ButtonModule],
    template: `
        <div class="card">
            <h1 class="text-3xl font-bold text-surface-900 dark:text-surface-0 mb-2">Reports</h1>
            <p class="text-surface-600 dark:text-surface-400 mb-6">
                Select a report to view details and run with custom parameters
            </p>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <p-card *ngFor="let report of reports" class="report-card">
                    <ng-template pTemplate="header">
                        <div class="p-4 border-b border-surface-200 dark:border-surface-700">
                            <h3 class="text-xl font-semibold text-surface-900 dark:text-surface-0">
                                {{ report.name }}
                            </h3>
                        </div>
                    </ng-template>
                    
                    <div class="min-h-[100px]">
                        <p class="text-surface-600 dark:text-surface-400 mb-4">
                            {{ report.description }}
                        </p>
                        <div class="text-sm text-surface-500 dark:text-surface-500">
                            <i class="pi pi-file-edit mr-2"></i>
                            {{ report.parameters.length }} parameter(s)
                        </div>
                    </div>

                    <ng-template pTemplate="footer">
                        <div class="flex justify-end">
                            <button 
                                pButton 
                                label="Open" 
                                icon="pi pi-external-link"
                                (click)="openReport(report)"
                                class="w-full"
                            ></button>
                        </div>
                    </ng-template>
                </p-card>
            </div>
        </div>
    `,
    styles: [`
        :host ::ng-deep .report-card {
            transition: transform 0.2s, box-shadow 0.2s;
        }
        
        :host ::ng-deep .report-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
    `]
})
export class Reports implements OnInit {
    reports: Report[] = [];

    constructor(
        private router: Router,
        private layoutService: LayoutService
    ) {}

    ngOnInit(): void {
        this.initializeReports();
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

    openReport(report: Report): void {
        const reportTab: MenuItem = {
            label: report.name,
            icon: 'pi pi-file-export',
            routerLink: ['/pages/reports', report.id],
            data: { fullPage: false }
        };
        this.layoutService.onTabOpen(reportTab);
    }
}


