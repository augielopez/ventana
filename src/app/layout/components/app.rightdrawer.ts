import { Component, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DrawerModule } from 'primeng/drawer';
import { LayoutService } from '@/layout/service/layout.service';
import { AppRightMenu } from './app.rightmenu';

@Component({
    selector: 'app-rightdrawer',
    standalone: true,
    imports: [CommonModule, DrawerModule, AppRightMenu],
    template: `
        <p-drawer 
            header="Menu" 
            [(visible)]="visible" 
            position="right"
            [style]="{ width: '20rem' }"
            (onShow)="onDrawerShow()"
            (onHide)="onDrawerHide()"
        >
            <div app-rightmenu class="layout-sidebar" #menuContent></div>
        </p-drawer>
    `
})
export class AppRightDrawer {
    @ViewChild(AppRightMenu) appRightMenu!: AppRightMenu;
    @ViewChild('menuContent') menuContent!: ElementRef;

    constructor(public layoutService: LayoutService) {}

    get visible(): boolean {
        return this.layoutService.layoutState().rightMenuActive;
    }

    set visible(val: boolean) {
        if (!val) {
            this.layoutService.hideRightMenu();
        }
    }

    onDrawerShow(): void {
        // Scroll to top when drawer opens
        setTimeout(() => {
            const drawerContent = document.querySelector('.p-drawer-content');
            if (drawerContent) {
                drawerContent.scrollTop = 0;
            }
        }, 0);
    }

    onDrawerHide(): void {
        this.layoutService.hideRightMenu();
    }
}


