import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-member-programs',
    standalone: true,
    imports: [CommonModule],
    template: `
        <div class="card">
            <h2 class="text-2xl font-bold text-surface-900 dark:text-surface-0 mb-4">Programs</h2>
            <div class="text-center py-12">
                <i class="pi pi-folder-open text-6xl text-surface-400 dark:text-surface-600 mb-4"></i>
                <p class="text-surface-600 dark:text-surface-400">No programs available</p>
                <p class="text-surface-500 dark:text-surface-500 text-sm mt-2">
                    Member programs and care management information will appear here
                </p>
            </div>
        </div>
    `
})
export class MemberPrograms {}


