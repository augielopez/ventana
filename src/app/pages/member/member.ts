import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

interface MemberDetails {
    memberId: string;
    name: string;
    gender: string;
    eligibilitySystem: string;
    plan: string;
    language: string;
    dateOfBirth: string;
    age: number;
    planStatus: string;
    mtmxId: string;
}

@Component({
    selector: 'app-member',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        ButtonModule,
        CardModule,
        TagModule,
        ToastModule
    ],
    providers: [MessageService],
    template: `
        <p-toast position="top-right" />
        
        <div class="grid grid-cols-12 gap-4">
            <div [ngClass]="drugsDrawerVisible ? 'col-span-12 lg:col-span-9' : 'col-span-12'">
                <!-- Header -->
                <div class="flex justify-between items-start mb-6">
                    <div>
                        <h1 class="text-2xl font-bold text-surface-900 dark:text-surface-0 mb-2">Member Details</h1>
                    </div>
                    <div class="flex gap-3">
                        <button 
                            pButton 
                            label="Evaluate" 
                            class="px-6 py-2"
                            (click)="onEvaluate()"
                        ></button>
                        <button 
                            pButton 
                            [icon]="drugsDrawerVisible ? 'pi pi-times' : 'pi pi-arrow-left'" 
                            class="p-button-rounded p-button-outlined"
                            (click)="toggleDrugsDrawer()"
                        ></button>
                    </div>
                </div>

                <!-- Member Details Card -->
                <div class="card mb-6">
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <!-- Column 1 -->
                        <div class="space-y-4">
                            <div>
                                <label class="block text-sm font-semibold text-surface-600 dark:text-surface-400 mb-1">Member ID</label>
                                <span class="text-base text-surface-900 dark:text-surface-0">{{ member.memberId }}</span>
                            </div>
                            <div>
                                <label class="block text-sm font-semibold text-surface-600 dark:text-surface-400 mb-1">Gender</label>
                                <span class="text-base text-surface-900 dark:text-surface-0">{{ member.gender }}</span>
                            </div>
                            <div>
                                <label class="block text-sm font-semibold text-surface-600 dark:text-surface-400 mb-1">Eligibility System</label>
                                <span class="text-base text-surface-900 dark:text-surface-0">{{ member.eligibilitySystem }}</span>
                            </div>
                        </div>

                        <!-- Column 2 -->
                        <div class="space-y-4">
                            <div>
                                <label class="block text-sm font-semibold text-surface-600 dark:text-surface-400 mb-1">Name</label>
                                <span class="text-base text-surface-900 dark:text-surface-0">{{ member.name }}</span>
                            </div>
                            <div>
                                <label class="block text-sm font-semibold text-surface-600 dark:text-surface-400 mb-1">Plan</label>
                                <span class="text-base text-surface-900 dark:text-surface-0">{{ member.plan }}</span>
                            </div>
                            <div>
                                <label class="block text-sm font-semibold text-surface-600 dark:text-surface-400 mb-1">Language</label>
                                <span class="text-base text-surface-900 dark:text-surface-0">{{ member.language }}</span>
                            </div>
                        </div>

                        <!-- Column 3 -->
                        <div class="space-y-4">
                            <div>
                                <label class="block text-sm font-semibold text-surface-600 dark:text-surface-400 mb-1">DOB</label>
                                <span class="text-base text-surface-900 dark:text-surface-0">{{ member.dateOfBirth }} ({{ member.age }})</span>
                            </div>
                            <div>
                                <label class="block text-sm font-semibold text-surface-600 dark:text-surface-400 mb-1">Plan Status</label>
                                <p-tag 
                                    [value]="member.planStatus" 
                                    [severity]="getPlanStatusSeverity(member.planStatus)"
                                ></p-tag>
                            </div>
                            <div>
                                <label class="block text-sm font-semibold text-surface-600 dark:text-surface-400 mb-1">MTMx ID</label>
                                <span class="text-base text-surface-900 dark:text-surface-0">{{ member.mtmxId || 'N/A' }}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Primary Color Separator Line -->
                <div class="border-t-4 border-primary mb-6"></div>

                <!-- Child Route Content (Claims, Contact Info, etc.) OR Programs -->
                <router-outlet></router-outlet>
            </div>

            <!-- Drugs Side Panel -->
            <div *ngIf="drugsDrawerVisible" class="col-span-12 lg:col-span-3">
                <div class="card h-full">
                    <div class="flex justify-between items-center mb-4">
                        <h2 class="text-xl font-bold text-surface-900 dark:text-surface-0">Drugs (past six months only)</h2>
                        <button 
                            pButton 
                            icon="pi pi-times" 
                            class="p-button-rounded p-button-text"
                            (click)="closeDrugsDrawer()"
                        ></button>
                    </div>
                    <div class="space-y-4">
                        <div class="text-center py-12">
                            <i class="pi pi-shopping-bag text-6xl text-surface-400 dark:text-surface-600 mb-4"></i>
                            <p class="text-surface-600 dark:text-surface-400">No drug records found</p>
                            <p class="text-surface-500 dark:text-surface-500 text-sm mt-2">
                                Drug history for the past six months will appear here
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
})
export class Member implements OnInit {
    drugsDrawerVisible: boolean = false;
    member: MemberDetails = {
        memberId: 'U9678925401',
        name: 'YAUMARA LOPEZ ESPINOZA',
        gender: 'Female',
        eligibilitySystem: 'Edw',
        plan: 'Market Place - Florida',
        language: 'English',
        dateOfBirth: '10/27/1980',
        age: 44,
        planStatus: 'Inactive',
        mtmxId: ''
    };

    constructor(
        private route: ActivatedRoute,
        private messageService: MessageService
    ) {}

    ngOnInit(): void {
        this.route.params.subscribe(params => {
            const memberId = params['id'];
            if (memberId) {
                // In a real app, you would fetch member data based on the ID
                // For now, we'll just update the memberId in the display
                this.member.memberId = memberId;
            }
        });
    }

    onEvaluate(): void {
        this.messageService.add({
            severity: 'info',
            summary: 'Evaluate Clicked',
            detail: `You clicked Evaluate for member ${this.member.name} (${this.member.memberId})`,
            life: 5000
        });
    }

    toggleDrugsDrawer(): void {
        this.drugsDrawerVisible = !this.drugsDrawerVisible;
    }

    closeDrugsDrawer(): void {
        this.drugsDrawerVisible = false;
    }

    getPlanStatusSeverity(status: string): string {
        switch (status.toLowerCase()) {
            case 'active':
                return 'success';
            case 'inactive':
                return 'danger';
            case 'pending':
                return 'warning';
            case 'suspended':
                return 'secondary';
            default:
                return 'secondary';
        }
    }
}

