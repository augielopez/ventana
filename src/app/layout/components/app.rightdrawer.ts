import { Component, ViewChild } from '@angular/core';
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
            (onHide)="onDrawerHide()"
        >
            <div app-rightmenu class="layout-sidebar"></div>
        </p-drawer>
    `
})
export class AppRightDrawer {
    @ViewChild(AppRightMenu) appRightMenu!: AppRightMenu;

    constructor(public layoutService: LayoutService) {}

    get visible(): boolean {
        return this.layoutService.layoutState().rightMenuActive;
    }

    set visible(val: boolean) {
        if (!val) {
            this.layoutService.hideRightMenu();
        }
    }

    onDrawerHide(): void {
        this.layoutService.hideRightMenu();
    }
}


