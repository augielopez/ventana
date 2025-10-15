import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-member-contact',
    standalone: true,
    imports: [CommonModule],
    template: `
        <div class="card">
            <h2 class="text-2xl font-bold text-surface-900 dark:text-surface-0 mb-4">Contact Info</h2>
            <div class="text-center py-12">
                <i class="pi pi-phone text-6xl text-surface-400 dark:text-surface-600 mb-4"></i>
                <p class="text-surface-600 dark:text-surface-400">No contact information available</p>
                <p class="text-surface-500 dark:text-surface-500 text-sm mt-2">
                    Member contact details will appear here
                </p>
            </div>
        </div>
    `
})
export class MemberContact implements OnInit {
    memberId: string = '';

    constructor(private route: ActivatedRoute) {}

    ngOnInit(): void {
        this.route.params.subscribe(params => {
            this.memberId = params['id'];
        });
    }
}


