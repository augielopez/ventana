import { Component, ElementRef, inject, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AppMenuitem } from './app.menuitem';
import { LayoutService } from '@/layout/service/layout.service';
import { Subscription } from 'rxjs';

@Component({
    selector: '[app-menu]',
    standalone: true,
    imports: [CommonModule, AppMenuitem, RouterModule],
    template: `<div class="layout-menu-container" #menuContainer>
        <ul class="layout-menu">
            <ng-container *ngFor="let item of model; let i = index">
                <li app-menuitem *ngIf="!item.separator" [item]="item" [index]="i" [root]="true"></li>
                <li *ngIf="item.separator" class="menu-separator"></li>
            </ng-container>
        </ul>
    </div>`
})
export class AppMenu implements OnInit, OnDestroy {
    el: ElementRef = inject(ElementRef);
    layoutService: LayoutService = inject(LayoutService);

    @ViewChild('menuContainer') menuContainer!: ElementRef;

    private memberMenuSubscription?: Subscription;

    model: MenuItem[] = [];

    private baseMenu: MenuItem[] = [
        {
            label: 'Links',
            icon: 'pi pi-link',
            items: [
                {
                    label: 'Search',
                    icon: 'pi pi-search',
                    routerLink: ['/pages/search']
                },
                {
                    label: 'Reports',
                    icon: 'pi pi-file-export',
                    routerLink: ['/pages/reports']
                }
            ]
        }
    ];

    ngOnInit(): void {
        this.updateMenu();
        
        // Subscribe to member menu changes
        this.memberMenuSubscription = this.layoutService.memberMenuChange$.subscribe(() => {
            this.updateMenu();
        });
    }

    ngOnDestroy(): void {
        if (this.memberMenuSubscription) {
            this.memberMenuSubscription.unsubscribe();
        }
    }

    private updateMenu(): void {
        const activeMemberMenuItem = this.layoutService.getActiveMemberMenuItem();
        
        if (activeMemberMenuItem) {
            // Show Links menu + active member menu
            this.model = [this.baseMenu[0], activeMemberMenuItem];
        } else {
            // Show only Links menu
            this.model = [this.baseMenu[0]];
        }
    }
}
