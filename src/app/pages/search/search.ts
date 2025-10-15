import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LayoutService } from '@/layout/service/layout.service';
import { MenuItem } from 'primeng/api';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { Tabs, TabList, Tab, TabPanels, TabPanel } from 'primeng/tabs';
import { DatePicker } from 'primeng/datepicker';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';

interface MemberSearchResult {
    memberId: string;
    mtmxId: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    phoneNumber: string;
    lineOfBusiness: string;
    planStatus: string;
    language: string;
    careMgmtId: string;
}

interface MemberSearchForm {
    memberId: string;
    firstName: string;
    lastName: string;
    dateOfBirth: Date | null;
    phoneNumber: string;
}

@Component({
    selector: 'app-search',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        InputTextModule,
        ButtonModule,
        TableModule,
        Tabs,
        TabList,
        Tab,
        TabPanels,
        TabPanel,
        DatePicker,
        ToastModule,
        IconFieldModule,
        InputIconModule
    ],
    providers: [MessageService],
    template: `
        <p-toast position="top-right" />
        
        <div class="card">
            <div class="font-semibold text-3xl mb-4">Search</div>
            <p class="text-surface-500 dark:text-surface-400 mb-6">
                Search for members or providers
            </p>

            <p-tabs value="0">
                <p-tablist>
                    <p-tab value="0">Member Search</p-tab>
                    <p-tab value="1">Provider Search</p-tab>
                </p-tablist>
                <p-tabpanels>
                    <!-- Member Search Tab -->
                    <p-tabpanel value="0">
                    <div class="mt-4">
                        <!-- Search Form -->
                        <div class="card bg-surface-50 dark:bg-surface-800 mb-6">
                            <div class="font-semibold text-xl mb-4">Search Criteria</div>
                            
                            <div class="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-4">
                                <!-- Member ID -->
                                <div class="flex flex-col gap-2">
                                    <label for="memberId" class="font-semibold">Member ID</label>
                                    <input 
                                        pInputText 
                                        id="memberId" 
                                        [(ngModel)]="searchForm.memberId"
                                        placeholder="Enter Member ID"
                                        class="w-full"
                                    />
                                </div>

                                <!-- First Name -->
                                <div class="flex flex-col gap-2">
                                    <label for="firstName" class="font-semibold">First Name</label>
                                    <input 
                                        pInputText 
                                        id="firstName" 
                                        [(ngModel)]="searchForm.firstName"
                                        placeholder="Enter First Name"
                                        class="w-full"
                                    />
                                </div>

                                <!-- Last Name -->
                                <div class="flex flex-col gap-2">
                                    <label for="lastName" class="font-semibold">Last Name</label>
                                    <input 
                                        pInputText 
                                        id="lastName" 
                                        [(ngModel)]="searchForm.lastName"
                                        placeholder="Enter Last Name"
                                        class="w-full"
                                    />
                                </div>

                                <!-- Date of Birth -->
                                <div class="flex flex-col gap-2">
                                    <label for="dob" class="font-semibold">Date of Birth</label>
                                    <p-datepicker 
                                        [(ngModel)]="searchForm.dateOfBirth"
                                        [showIcon]="true"
                                        dateFormat="mm/dd/yy"
                                        placeholder="MM/DD/YYYY"
                                        [maxDate]="maxDate"
                                        inputId="dob"
                                        styleClass="w-full"
                                    />
                                </div>

                                <!-- Phone Number -->
                                <div class="flex flex-col gap-2">
                                    <label for="phoneNumber" class="font-semibold">Phone Number</label>
                                    <input 
                                        pInputText 
                                        id="phoneNumber" 
                                        [(ngModel)]="searchForm.phoneNumber"
                                        placeholder="(XXX) XXX-XXXX"
                                        class="w-full"
                                    />
                                </div>
                            </div>

                            <!-- Buttons -->
                            <div class="flex justify-end gap-2">
                                <button 
                                    pButton 
                                    label="Clear" 
                                    icon="pi pi-times" 
                                    severity="secondary"
                                    (click)="onClear()"
                                ></button>
                                <button 
                                    pButton 
                                    label="Submit" 
                                    icon="pi pi-search" 
                                    (click)="onSubmit()"
                                ></button>
                            </div>
                        </div>

                        <!-- Results Table -->
                        <div class="card" *ngIf="showResults">
                            <div class="font-semibold text-xl mb-4">Search Results</div>
                            
                            <!-- Global Filter -->
                            <div class="mb-4">
                                <p-icon-field class="w-full md:w-80">
                                    <p-inputicon class="pi pi-search" />
                                    <input 
                                        pInputText 
                                        type="text" 
                                        (input)="applyGlobalFilter($event)" 
                                        placeholder="Filter results..."
                                        class="w-full"
                                    />
                                </p-icon-field>
                            </div>

                            <p-table 
                                #dt
                                [value]="searchResults"
                                [paginator]="true"
                                [rows]="10"
                                [rowsPerPageOptions]="[10, 25, 50]"
                                [globalFilterFields]="['memberId', 'mtmxId', 'firstName', 'lastName', 'dateOfBirth', 'phoneNumber', 'lineOfBusiness', 'planStatus', 'language', 'careMgmtId']"
                                [tableStyle]="{ 'min-width': '80rem' }"
                                styleClass="p-datatable-sm"
                                [rowHover]="true"
                                currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
                                [showCurrentPageReport]="true"
                            >
                                <ng-template pTemplate="header">
                                    <tr>
                                        <th pSortableColumn="memberId">
                                            Member ID <p-sortIcon field="memberId" />
                                        </th>
                                        <th pSortableColumn="mtmxId">
                                            MTMx ID <p-sortIcon field="mtmxId" />
                                        </th>
                                        <th pSortableColumn="firstName">
                                            First Name <p-sortIcon field="firstName" />
                                        </th>
                                        <th pSortableColumn="lastName">
                                            Last Name <p-sortIcon field="lastName" />
                                        </th>
                                        <th pSortableColumn="dateOfBirth">
                                            Date of Birth <p-sortIcon field="dateOfBirth" />
                                        </th>
                                        <th pSortableColumn="phoneNumber">
                                            Phone Number <p-sortIcon field="phoneNumber" />
                                        </th>
                                        <th pSortableColumn="lineOfBusiness">
                                            Line of Business <p-sortIcon field="lineOfBusiness" />
                                        </th>
                                        <th pSortableColumn="planStatus">
                                            Plan Status <p-sortIcon field="planStatus" />
                                        </th>
                                        <th pSortableColumn="language">
                                            Language <p-sortIcon field="language" />
                                        </th>
                                        <th pSortableColumn="careMgmtId">
                                            Care Mgmt ID <p-sortIcon field="careMgmtId" />
                                        </th>
                                    </tr>
                                </ng-template>
                                <ng-template pTemplate="body" let-member>
                                    <tr class="cursor-pointer" (click)="onRowClick($event, member)">
                                        <td>{{ member.memberId }}</td>
                                        <td>{{ member.mtmxId }}</td>
                                        <td>{{ member.firstName }}</td>
                                        <td>{{ member.lastName }}</td>
                                        <td>{{ member.dateOfBirth }}</td>
                                        <td>{{ member.phoneNumber }}</td>
                                        <td>{{ member.lineOfBusiness }}</td>
                                        <td>
                                            <span 
                                                class="px-2 py-1 rounded text-xs font-semibold"
                                                [ngClass]="{
                                                    'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200': member.planStatus === 'Active',
                                                    'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200': member.planStatus === 'Inactive',
                                                    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200': member.planStatus === 'Pending',
                                                    'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200': member.planStatus === 'Suspended'
                                                }"
                                            >
                                                {{ member.planStatus }}
                                            </span>
                                        </td>
                                        <td>{{ member.language }}</td>
                                        <td>{{ member.careMgmtId }}</td>
                                    </tr>
                                </ng-template>
                                <ng-template pTemplate="emptymessage">
                                    <tr>
                                        <td colspan="10" class="text-center py-8">
                                            <i class="pi pi-info-circle text-4xl text-surface-400 dark:text-surface-600 mb-4"></i>
                                            <div class="text-surface-600 dark:text-surface-400">No members found matching your criteria</div>
                                        </td>
                                    </tr>
                                </ng-template>
                            </p-table>
                        </div>
                    </div>
                    </p-tabpanel>

                    <!-- Provider Search Tab -->
                    <p-tabpanel value="1">
                    <div class="mt-4">
                        <div class="card bg-surface-50 dark:bg-surface-800 text-center py-20">
                            <i class="pi pi-user-plus text-6xl text-surface-400 dark:text-surface-600 mb-4"></i>
                            <div class="text-2xl font-semibold mb-2">Provider Search</div>
                            <p class="text-surface-600 dark:text-surface-400">Coming Soon</p>
                            <p class="text-surface-500 dark:text-surface-400 text-sm mt-2">
                                This feature will allow you to search for healthcare providers by name, specialty, location, and more.
                            </p>
                        </div>
                    </div>
                    </p-tabpanel>
                </p-tabpanels>
            </p-tabs>
        </div>
    `
})
export class Search {
    searchForm: MemberSearchForm = {
        memberId: '',
        firstName: '',
        lastName: '',
        dateOfBirth: null,
        phoneNumber: ''
    };

    searchResults: MemberSearchResult[] = [];
    allMembers: MemberSearchResult[] = [];
    showResults: boolean = false;
    maxDate: Date = new Date();

    constructor(
        private messageService: MessageService,
        private router: Router,
        private layoutService: LayoutService
    ) {
        this.initializeDummyData();
    }

    initializeDummyData(): void {
        this.allMembers = [
            {
                memberId: 'MEM-001234',
                mtmxId: 'MTM-789012',
                firstName: 'John',
                lastName: 'Smith',
                dateOfBirth: '01/15/1965',
                phoneNumber: '(555) 123-4567',
                lineOfBusiness: 'Medicare',
                planStatus: 'Active',
                language: 'English',
                careMgmtId: 'CM-1001'
            },
            {
                memberId: 'MEM-002345',
                mtmxId: 'MTM-890123',
                firstName: 'Maria',
                lastName: 'Garcia',
                dateOfBirth: '03/22/1978',
                phoneNumber: '(555) 234-5678',
                lineOfBusiness: 'Medicaid',
                planStatus: 'Active',
                language: 'Spanish',
                careMgmtId: 'CM-1002'
            },
            {
                memberId: 'MEM-003456',
                mtmxId: 'MTM-901234',
                firstName: 'Wei',
                lastName: 'Chen',
                dateOfBirth: '07/08/1982',
                phoneNumber: '(555) 345-6789',
                lineOfBusiness: 'Marketplace',
                planStatus: 'Active',
                language: 'Chinese',
                careMgmtId: 'CM-1003'
            },
            {
                memberId: 'MEM-004567',
                mtmxId: 'MTM-012345',
                firstName: 'Sarah',
                lastName: 'Johnson',
                dateOfBirth: '11/30/1990',
                phoneNumber: '(555) 456-7890',
                lineOfBusiness: 'Medicare',
                planStatus: 'Pending',
                language: 'English',
                careMgmtId: 'CM-1004'
            },
            {
                memberId: 'MEM-005678',
                mtmxId: 'MTM-123456',
                firstName: 'Nguyen',
                lastName: 'Tran',
                dateOfBirth: '05/14/1975',
                phoneNumber: '(555) 567-8901',
                lineOfBusiness: 'Medicaid',
                planStatus: 'Active',
                language: 'Vietnamese',
                careMgmtId: 'CM-1005'
            },
            {
                memberId: 'MEM-006789',
                mtmxId: 'MTM-234567',
                firstName: 'Robert',
                lastName: 'Williams',
                dateOfBirth: '09/25/1958',
                phoneNumber: '(555) 678-9012',
                lineOfBusiness: 'Medicare',
                planStatus: 'Inactive',
                language: 'English',
                careMgmtId: 'CM-1006'
            },
            {
                memberId: 'MEM-007890',
                mtmxId: 'MTM-345678',
                firstName: 'Jennifer',
                lastName: 'Davis',
                dateOfBirth: '12/03/1988',
                phoneNumber: '(555) 789-0123',
                lineOfBusiness: 'Marketplace',
                planStatus: 'Active',
                language: 'English',
                careMgmtId: 'CM-1007'
            },
            {
                memberId: 'MEM-008901',
                mtmxId: 'MTM-456789',
                firstName: 'Carlos',
                lastName: 'Rodriguez',
                dateOfBirth: '04/18/1970',
                phoneNumber: '(555) 890-1234',
                lineOfBusiness: 'Medicaid',
                planStatus: 'Active',
                language: 'Spanish',
                careMgmtId: 'CM-1008'
            },
            {
                memberId: 'MEM-009012',
                mtmxId: 'MTM-567890',
                firstName: 'Patricia',
                lastName: 'Martinez',
                dateOfBirth: '06/07/1963',
                phoneNumber: '(555) 901-2345',
                lineOfBusiness: 'Medicare',
                planStatus: 'Suspended',
                language: 'Spanish',
                careMgmtId: 'CM-1009'
            },
            {
                memberId: 'MEM-010123',
                mtmxId: 'MTM-678901',
                firstName: 'Michael',
                lastName: 'Brown',
                dateOfBirth: '08/20/1955',
                phoneNumber: '(555) 012-3456',
                lineOfBusiness: 'Medicare',
                planStatus: 'Active',
                language: 'English',
                careMgmtId: 'CM-1010'
            },
            {
                memberId: 'MEM-011234',
                mtmxId: 'MTM-789012',
                firstName: 'Lisa',
                lastName: 'Anderson',
                dateOfBirth: '02/12/1992',
                phoneNumber: '(555) 123-4568',
                lineOfBusiness: 'Marketplace',
                planStatus: 'Active',
                language: 'English',
                careMgmtId: 'CM-1011'
            },
            {
                memberId: 'MEM-012345',
                mtmxId: 'MTM-890124',
                firstName: 'James',
                lastName: 'Taylor',
                dateOfBirth: '10/05/1968',
                phoneNumber: '(555) 234-5679',
                lineOfBusiness: 'Medicare',
                planStatus: 'Active',
                language: 'English',
                careMgmtId: 'CM-1012'
            },
            {
                memberId: 'MEM-013456',
                mtmxId: 'MTM-901235',
                firstName: 'Yuki',
                lastName: 'Tanaka',
                dateOfBirth: '01/28/1980',
                phoneNumber: '(555) 345-6790',
                lineOfBusiness: 'Medicaid',
                planStatus: 'Active',
                language: 'Japanese',
                careMgmtId: 'CM-1013'
            },
            {
                memberId: 'MEM-014567',
                mtmxId: 'MTM-012346',
                firstName: 'David',
                lastName: 'Wilson',
                dateOfBirth: '07/16/1973',
                phoneNumber: '(555) 456-7891',
                lineOfBusiness: 'Medicare',
                planStatus: 'Active',
                language: 'English',
                careMgmtId: 'CM-1014'
            },
            {
                memberId: 'MEM-015678',
                mtmxId: 'MTM-123457',
                firstName: 'Anna',
                lastName: 'Kowalski',
                dateOfBirth: '03/09/1985',
                phoneNumber: '(555) 567-8902',
                lineOfBusiness: 'Marketplace',
                planStatus: 'Pending',
                language: 'Polish',
                careMgmtId: 'CM-1015'
            },
            {
                memberId: 'MEM-016789',
                mtmxId: 'MTM-234568',
                firstName: 'Mohammed',
                lastName: 'Ahmed',
                dateOfBirth: '09/23/1977',
                phoneNumber: '(555) 678-9013',
                lineOfBusiness: 'Medicaid',
                planStatus: 'Active',
                language: 'Arabic',
                careMgmtId: 'CM-1016'
            },
            {
                memberId: 'MEM-017890',
                mtmxId: 'MTM-345679',
                firstName: 'Emily',
                lastName: 'Thompson',
                dateOfBirth: '11/11/1995',
                phoneNumber: '(555) 789-0124',
                lineOfBusiness: 'Marketplace',
                planStatus: 'Active',
                language: 'English',
                careMgmtId: 'CM-1017'
            },
            {
                memberId: 'MEM-018901',
                mtmxId: 'MTM-456780',
                firstName: 'Jose',
                lastName: 'Hernandez',
                dateOfBirth: '05/30/1960',
                phoneNumber: '(555) 890-1235',
                lineOfBusiness: 'Medicare',
                planStatus: 'Active',
                language: 'Spanish',
                careMgmtId: 'CM-1018'
            },
            {
                memberId: 'MEM-019012',
                mtmxId: 'MTM-567891',
                firstName: 'Karen',
                lastName: 'Lee',
                dateOfBirth: '04/25/1987',
                phoneNumber: '(555) 901-2346',
                lineOfBusiness: 'Medicaid',
                planStatus: 'Active',
                language: 'Korean',
                careMgmtId: 'CM-1019'
            },
            {
                memberId: 'MEM-020123',
                mtmxId: 'MTM-678902',
                firstName: 'Thomas',
                lastName: 'Moore',
                dateOfBirth: '12/19/1952',
                phoneNumber: '(555) 012-3457',
                lineOfBusiness: 'Medicare',
                planStatus: 'Inactive',
                language: 'English',
                careMgmtId: 'CM-1020'
            },
            {
                memberId: 'MEM-021234',
                mtmxId: 'MTM-789013',
                firstName: 'Priya',
                lastName: 'Patel',
                dateOfBirth: '08/08/1991',
                phoneNumber: '(555) 123-4569',
                lineOfBusiness: 'Marketplace',
                planStatus: 'Active',
                language: 'Hindi',
                careMgmtId: 'CM-1021'
            },
            {
                memberId: 'MEM-022345',
                mtmxId: 'MTM-890125',
                firstName: 'Daniel',
                lastName: 'Jackson',
                dateOfBirth: '06/14/1966',
                phoneNumber: '(555) 234-5680',
                lineOfBusiness: 'Medicare',
                planStatus: 'Active',
                language: 'English',
                careMgmtId: 'CM-1022'
            },
            {
                memberId: 'MEM-023456',
                mtmxId: 'MTM-901236',
                firstName: 'Sofia',
                lastName: 'Rossi',
                dateOfBirth: '02/28/1984',
                phoneNumber: '(555) 345-6791',
                lineOfBusiness: 'Medicaid',
                planStatus: 'Pending',
                language: 'Italian',
                careMgmtId: 'CM-1023'
            },
            {
                memberId: 'MEM-024567',
                mtmxId: 'MTM-012347',
                firstName: 'William',
                lastName: 'Harris',
                dateOfBirth: '10/10/1971',
                phoneNumber: '(555) 456-7892',
                lineOfBusiness: 'Medicare',
                planStatus: 'Active',
                language: 'English',
                careMgmtId: 'CM-1024'
            },
            {
                memberId: 'MEM-025678',
                mtmxId: 'MTM-123458',
                firstName: 'Fatima',
                lastName: 'Ali',
                dateOfBirth: '01/05/1989',
                phoneNumber: '(555) 567-8903',
                lineOfBusiness: 'Marketplace',
                planStatus: 'Active',
                language: 'Arabic',
                careMgmtId: 'CM-1025'
            }
        ];
    }

    onSubmit(): void {
        // Validate at least one field is filled
        if (!this.searchForm.memberId && 
            !this.searchForm.firstName && 
            !this.searchForm.lastName && 
            !this.searchForm.dateOfBirth && 
            !this.searchForm.phoneNumber) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Validation Error',
                detail: 'Please enter at least one search criterion'
            });
            return;
        }

        // Filter members based on search criteria
        this.searchResults = this.allMembers.filter(member => {
            let matches = true;

            if (this.searchForm.memberId) {
                matches = matches && member.memberId.toLowerCase().includes(this.searchForm.memberId.toLowerCase());
            }

            if (this.searchForm.firstName) {
                matches = matches && member.firstName.toLowerCase().includes(this.searchForm.firstName.toLowerCase());
            }

            if (this.searchForm.lastName) {
                matches = matches && member.lastName.toLowerCase().includes(this.searchForm.lastName.toLowerCase());
            }

            if (this.searchForm.dateOfBirth) {
                const searchDate = this.formatDate(this.searchForm.dateOfBirth);
                matches = matches && member.dateOfBirth === searchDate;
            }

            if (this.searchForm.phoneNumber) {
                const cleanPhone = this.searchForm.phoneNumber.replace(/\D/g, '');
                const memberPhone = member.phoneNumber.replace(/\D/g, '');
                matches = matches && memberPhone.includes(cleanPhone);
            }

            return matches;
        });

        this.showResults = true;

        this.messageService.add({
            severity: 'success',
            summary: 'Search Complete',
            detail: `Found ${this.searchResults.length} member(s)`
        });
    }

    onClear(): void {
        this.searchForm = {
            memberId: '',
            firstName: '',
            lastName: '',
            dateOfBirth: null,
            phoneNumber: ''
        };
        this.searchResults = [];
        this.showResults = false;

        this.messageService.add({
            severity: 'info',
            summary: 'Form Cleared',
            detail: 'Search criteria has been reset'
        });
    }

    onRowClick(event: any, member: MemberSearchResult): void {
        // Open in new tab using the layout service tab system
        const memberTab: MenuItem = {
            label: `${member.firstName} ${member.lastName}`,
            icon: 'pi pi-user',
            routerLink: ['/pages/member', member.memberId],
            data: { fullPage: false },
            routerLinkActiveOptions: { paths: 'subset', queryParams: 'ignored', fragment: 'ignored', matrixParams: 'ignored' }
        };
        this.layoutService.onTabOpen(memberTab);
        
        // Create member menu in left sidebar
        this.layoutService.addMemberMenu(
            member.memberId,
            `${member.firstName} ${member.lastName}`
        );
        
        event.preventDefault();
    }

    applyGlobalFilter(event: Event): void {
        const input = event.target as HTMLInputElement;
        const table = document.querySelector('p-table') as any;
        if (table && table.filterGlobal) {
            table.filterGlobal(input.value, 'contains');
        }
    }

    formatDate(date: Date): string {
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const year = String(date.getFullYear()).slice(-2);
        return `${month}/${day}/${year}`;
    }
}
