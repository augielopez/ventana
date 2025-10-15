import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { Select } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

interface QueueItem {
    id: string;
    memberId: string;
    memberName: string;
    taskType: string;
    priority: string;
    dueDate: Date;
    state: string;
    bookOfBusiness: string;
    language: string;
}

@Component({
    selector: 'app-my-queue',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ButtonModule,
        Select,
        ToastModule
    ],
    providers: [MessageService],
    template: `
        <p-toast position="top-right" />
        
        <div class="card">
            <!-- Header -->
            <div class="flex justify-between items-center mb-6">
                <div>
                    <h1 class="text-3xl font-bold text-surface-900 dark:text-surface-0 mb-2">My Queue</h1>
                    <p class="text-surface-600 dark:text-surface-400">
                        Manage your work queue and scheduled tasks
                    </p>
                </div>
                
                <!-- View Toggle -->
                <div class="flex gap-2 bg-surface-100 dark:bg-surface-800 p-1 rounded-lg">
                    <button 
                        pButton 
                        label="Month" 
                        [text]="currentView !== 'month'"
                        [raised]="currentView === 'month'"
                        size="small"
                        (click)="setView('month')"
                    ></button>
                    <button 
                        pButton 
                        label="Week" 
                        [text]="currentView !== 'week'"
                        [raised]="currentView === 'week'"
                        size="small"
                        (click)="setView('week')"
                    ></button>
                    <button 
                        pButton 
                        label="Day" 
                        [text]="currentView !== 'day'"
                        [raised]="currentView === 'day'"
                        size="small"
                        (click)="setView('day')"
                    ></button>
                    <button 
                        pButton 
                        label="List" 
                        [text]="currentView !== 'list'"
                        [raised]="currentView === 'list'"
                        size="small"
                        (click)="setView('list')"
                    ></button>
                </div>
            </div>

            <!-- Filters and Actions -->
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-6">
                <!-- Filters -->
                <div class="lg:col-span-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <!-- State Filter -->
                    <div class="flex flex-col gap-2">
                        <label for="state" class="font-semibold text-sm">State</label>
                        <p-select 
                            [(ngModel)]="filters.state"
                            [options]="stateOptions"
                            optionLabel="label"
                            optionValue="value"
                            placeholder="All States"
                            inputId="state"
                            styleClass="w-full"
                            (onChange)="applyFilters()"
                        />
                    </div>

                    <!-- Book of Business Filter -->
                    <div class="flex flex-col gap-2">
                        <label for="bookOfBusiness" class="font-semibold text-sm">Book Of Business</label>
                        <p-select 
                            [(ngModel)]="filters.bookOfBusiness"
                            [options]="bookOfBusinessOptions"
                            optionLabel="label"
                            optionValue="value"
                            placeholder="All Books of Business"
                            inputId="bookOfBusiness"
                            styleClass="w-full"
                            (onChange)="applyFilters()"
                        />
                    </div>

                    <!-- Language Filter -->
                    <div class="flex flex-col gap-2">
                        <label for="language" class="font-semibold text-sm">Language</label>
                        <p-select 
                            [(ngModel)]="filters.language"
                            [options]="languageOptions"
                            optionLabel="label"
                            optionValue="value"
                            placeholder="All Languages"
                            inputId="language"
                            styleClass="w-full"
                            (onChange)="applyFilters()"
                        />
                    </div>
                </div>

                <!-- Action Buttons -->
                <div class="lg:col-span-6 flex items-end justify-end gap-2">
                    <button 
                        pButton 
                        label="Get Next" 
                        icon="pi pi-arrow-right"
                        (click)="getNext()"
                    ></button>
                    <button 
                        pButton 
                        label="Fill Schedule" 
                        icon="pi pi-calendar-plus"
                        severity="secondary"
                        (click)="fillSchedule()"
                    ></button>
                    <button 
                        pButton 
                        label="Clear Schedule" 
                        icon="pi pi-trash"
                        severity="secondary"
                        [outlined]="true"
                        (click)="clearSchedule()"
                    ></button>
                </div>
            </div>

            <!-- Calendar View (Month View Only for Now) -->
            <div *ngIf="currentView === 'month'" class="card bg-surface-50 dark:bg-surface-800">
                <!-- Calendar Header -->
                <div class="flex justify-between items-center mb-6">
                    <div class="flex items-center gap-4">
                        <button 
                            pButton 
                            icon="pi pi-chevron-left" 
                            [rounded]="true"
                            [text]="true"
                            (click)="previousMonth()"
                        ></button>
                        <h2 class="text-2xl font-semibold text-surface-900 dark:text-surface-0">
                            {{ currentMonthName }} {{ currentYear }}
                        </h2>
                        <button 
                            pButton 
                            icon="pi pi-chevron-right" 
                            [rounded]="true"
                            [text]="true"
                            (click)="nextMonth()"
                        ></button>
                    </div>
                    <button 
                        pButton 
                        label="Today" 
                        (click)="goToToday()"
                    ></button>
                </div>

                <!-- Calendar Grid -->
                <div class="overflow-x-auto">
                    <div class="min-w-[800px]">
                        <!-- Day Headers -->
                        <div class="grid grid-cols-7 gap-1 mb-2">
                            <div *ngFor="let day of weekDays" 
                                 class="text-center font-semibold py-3 text-surface-700 dark:text-surface-300 bg-surface-100 dark:bg-surface-700 rounded">
                                {{ day }}
                            </div>
                        </div>

                        <!-- Calendar Days -->
                        <div class="grid grid-cols-7 gap-1">
                            <div *ngFor="let day of calendarDays" 
                                 class="min-h-[120px] p-3 rounded border transition-colors"
                                 [ngClass]="{
                                     'bg-surface-0 dark:bg-surface-900 border-surface-200 dark:border-surface-700': day.isCurrentMonth,
                                     'bg-surface-100 dark:bg-surface-800 border-surface-100 dark:border-surface-800 opacity-50': !day.isCurrentMonth,
                                     'ring-2 ring-primary': day.isToday
                                 }">
                                <div class="text-right mb-2">
                                    <span class="text-sm font-semibold"
                                          [ngClass]="{
                                              'text-surface-900 dark:text-surface-0': day.isCurrentMonth,
                                              'text-surface-400 dark:text-surface-600': !day.isCurrentMonth,
                                              'text-primary font-bold': day.isToday
                                          }">
                                        {{ day.date.getDate() }}
                                    </span>
                                </div>
                                
                                <!-- Queue Items for this day -->
                                <div class="space-y-1">
                                    <div *ngFor="let item of getItemsForDate(day.date)"
                                         class="text-xs p-2 rounded cursor-pointer hover:shadow-md transition-shadow"
                                         [ngClass]="{
                                             'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200': item.priority === 'High',
                                             'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200': item.priority === 'Medium',
                                             'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200': item.priority === 'Low'
                                         }"
                                         (click)="viewQueueItem(item)">
                                        <div class="font-semibold truncate">{{ item.memberName }}</div>
                                        <div class="truncate opacity-80">{{ item.taskType }}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Week View Placeholder -->
            <div *ngIf="currentView === 'week'" class="card bg-surface-50 dark:bg-surface-800 text-center py-20">
                <i class="pi pi-calendar text-6xl text-surface-400 dark:text-surface-600 mb-4"></i>
                <div class="text-2xl font-semibold mb-2">Week View</div>
                <p class="text-surface-600 dark:text-surface-400">Coming Soon</p>
            </div>

            <!-- Day View Placeholder -->
            <div *ngIf="currentView === 'day'" class="card bg-surface-50 dark:bg-surface-800 text-center py-20">
                <i class="pi pi-calendar text-6xl text-surface-400 dark:text-surface-600 mb-4"></i>
                <div class="text-2xl font-semibold mb-2">Day View</div>
                <p class="text-surface-600 dark:text-surface-400">Coming Soon</p>
            </div>

            <!-- List View -->
            <div *ngIf="currentView === 'list'" class="card bg-surface-50 dark:bg-surface-800">
                <h3 class="text-xl font-semibold mb-4 text-surface-900 dark:text-surface-0">Queue Items</h3>
                <div class="space-y-2">
                    <div *ngFor="let item of filteredQueueItems"
                         class="p-4 rounded border border-surface-200 dark:border-surface-700 bg-surface-0 dark:bg-surface-900 hover:shadow-md transition-shadow cursor-pointer"
                         (click)="viewQueueItem(item)">
                        <div class="flex justify-between items-start">
                            <div class="flex-1">
                                <div class="flex items-center gap-3 mb-2">
                                    <span class="font-semibold text-lg text-surface-900 dark:text-surface-0">
                                        {{ item.memberName }}
                                    </span>
                                    <span class="px-2 py-1 rounded text-xs font-semibold"
                                          [ngClass]="{
                                              'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200': item.priority === 'High',
                                              'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200': item.priority === 'Medium',
                                              'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200': item.priority === 'Low'
                                          }">
                                        {{ item.priority }} Priority
                                    </span>
                                </div>
                                <div class="text-sm text-surface-600 dark:text-surface-400">
                                    <span class="font-semibold">Task:</span> {{ item.taskType }}
                                </div>
                                <div class="text-sm text-surface-600 dark:text-surface-400 mt-1">
                                    <span class="font-semibold">Member ID:</span> {{ item.memberId }} | 
                                    <span class="font-semibold">State:</span> {{ item.state }} | 
                                    <span class="font-semibold">Language:</span> {{ item.language }}
                                </div>
                            </div>
                            <div class="text-right">
                                <div class="text-sm font-semibold text-surface-900 dark:text-surface-0">
                                    {{ item.dueDate | date:'MMM d, y' }}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div *ngIf="filteredQueueItems.length === 0" class="text-center py-12">
                    <i class="pi pi-inbox text-6xl text-surface-400 dark:text-surface-600 mb-4"></i>
                    <p class="text-surface-600 dark:text-surface-400">No items in queue</p>
                </div>
            </div>
        </div>
    `
})
export class MyQueue implements OnInit {
    currentView: 'month' | 'week' | 'day' | 'list' = 'month';
    currentDate: Date = new Date();
    currentYear: number = new Date().getFullYear();
    currentMonth: number = new Date().getMonth();
    currentMonthName: string = '';
    
    weekDays: string[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    calendarDays: { date: Date; isCurrentMonth: boolean; isToday: boolean }[] = [];
    
    queueItems: QueueItem[] = [];
    filteredQueueItems: QueueItem[] = [];
    
    filters = {
        state: 'all',
        bookOfBusiness: 'all',
        language: 'all'
    };
    
    stateOptions = [
        { label: 'All States', value: 'all' },
        { label: 'California', value: 'CA' },
        { label: 'Texas', value: 'TX' },
        { label: 'Florida', value: 'FL' },
        { label: 'New York', value: 'NY' },
        { label: 'Illinois', value: 'IL' }
    ];
    
    bookOfBusinessOptions = [
        { label: 'All Books of Business', value: 'all' },
        { label: 'Medicare', value: 'medicare' },
        { label: 'Medicaid', value: 'medicaid' },
        { label: 'Marketplace', value: 'marketplace' },
        { label: 'Commercial', value: 'commercial' }
    ];
    
    languageOptions = [
        { label: 'All Languages', value: 'all' },
        { label: 'English', value: 'english' },
        { label: 'Spanish', value: 'spanish' },
        { label: 'Chinese', value: 'chinese' },
        { label: 'Vietnamese', value: 'vietnamese' },
        { label: 'Arabic', value: 'arabic' }
    ];

    constructor(private messageService: MessageService) {}

    ngOnInit(): void {
        this.updateCalendar();
        this.initializeDummyData();
    }

    setView(view: 'month' | 'week' | 'day' | 'list'): void {
        this.currentView = view;
    }

    updateCalendar(): void {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        
        this.currentYear = year;
        this.currentMonth = month;
        this.currentMonthName = new Date(year, month).toLocaleString('default', { month: 'long' });
        
        // Get first day of month
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        
        // Get starting date (may be from previous month)
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - startDate.getDay());
        
        // Get ending date (may be from next month)
        const endDate = new Date(lastDay);
        endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));
        
        // Generate calendar days
        this.calendarDays = [];
        const currentDate = new Date(startDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        while (currentDate <= endDate) {
            const date = new Date(currentDate);
            this.calendarDays.push({
                date: date,
                isCurrentMonth: date.getMonth() === month,
                isToday: date.getTime() === today.getTime()
            });
            currentDate.setDate(currentDate.getDate() + 1);
        }
    }

    previousMonth(): void {
        this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1, 1);
        this.updateCalendar();
    }

    nextMonth(): void {
        this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 1);
        this.updateCalendar();
    }

    goToToday(): void {
        this.currentDate = new Date();
        this.updateCalendar();
    }

    initializeDummyData(): void {
        const today = new Date();
        this.queueItems = [
            {
                id: 'Q-001',
                memberId: 'MEM-001234',
                memberName: 'John Smith',
                taskType: 'Care Management Call',
                priority: 'High',
                dueDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2),
                state: 'CA',
                bookOfBusiness: 'medicare',
                language: 'english'
            },
            {
                id: 'Q-002',
                memberId: 'MEM-002345',
                memberName: 'Maria Garcia',
                taskType: 'Enrollment Follow-up',
                priority: 'Medium',
                dueDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5),
                state: 'TX',
                bookOfBusiness: 'medicaid',
                language: 'spanish'
            },
            {
                id: 'Q-003',
                memberId: 'MEM-003456',
                memberName: 'Wei Chen',
                taskType: 'Benefits Explanation',
                priority: 'Low',
                dueDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7),
                state: 'CA',
                bookOfBusiness: 'marketplace',
                language: 'chinese'
            },
            {
                id: 'Q-004',
                memberId: 'MEM-004567',
                memberName: 'Sarah Johnson',
                taskType: 'Medication Review',
                priority: 'High',
                dueDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1),
                state: 'NY',
                bookOfBusiness: 'medicare',
                language: 'english'
            },
            {
                id: 'Q-005',
                memberId: 'MEM-005678',
                memberName: 'Nguyen Tran',
                taskType: 'Claims Assistance',
                priority: 'Medium',
                dueDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 10),
                state: 'FL',
                bookOfBusiness: 'medicaid',
                language: 'vietnamese'
            },
            {
                id: 'Q-006',
                memberId: 'MEM-006789',
                memberName: 'Robert Williams',
                taskType: 'Wellness Check',
                priority: 'Low',
                dueDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 14),
                state: 'IL',
                bookOfBusiness: 'medicare',
                language: 'english'
            }
        ];
        
        this.applyFilters();
    }

    applyFilters(): void {
        this.filteredQueueItems = this.queueItems.filter(item => {
            if (this.filters.state !== 'all' && item.state !== this.filters.state) {
                return false;
            }
            if (this.filters.bookOfBusiness !== 'all' && item.bookOfBusiness !== this.filters.bookOfBusiness) {
                return false;
            }
            if (this.filters.language !== 'all' && item.language !== this.filters.language) {
                return false;
            }
            return true;
        });
    }

    getItemsForDate(date: Date): QueueItem[] {
        const dateStr = date.toDateString();
        return this.filteredQueueItems.filter(item => {
            return item.dueDate.toDateString() === dateStr;
        });
    }

    getNext(): void {
        if (this.filteredQueueItems.length === 0) {
            this.messageService.add({
                severity: 'info',
                summary: 'No Items',
                detail: 'No items available in the queue'
            });
            return;
        }
        
        const nextItem = this.filteredQueueItems[0];
        this.messageService.add({
            severity: 'success',
            summary: 'Next Item Retrieved',
            detail: `Loading: ${nextItem.memberName} - ${nextItem.taskType}`
        });
    }

    fillSchedule(): void {
        this.messageService.add({
            severity: 'success',
            summary: 'Schedule Filled',
            detail: 'Your schedule has been filled with available queue items'
        });
    }

    clearSchedule(): void {
        this.messageService.add({
            severity: 'info',
            summary: 'Schedule Cleared',
            detail: 'All scheduled items have been returned to the queue'
        });
    }

    viewQueueItem(item: QueueItem): void {
        this.messageService.add({
            severity: 'info',
            summary: 'Queue Item Selected',
            detail: `${item.memberName} - ${item.taskType}`
        });
    }
}

