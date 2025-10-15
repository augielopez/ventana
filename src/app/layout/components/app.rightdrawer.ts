import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DrawerModule, Drawer } from 'primeng/drawer';
import { LayoutService } from '@/layout/service/layout.service';
import { AppRightMenu } from './app.rightmenu';

@Component({
    selector: 'app-rightdrawer',
    standalone: true,
    imports: [CommonModule, DrawerModule, AppRightMenu],
    template: `
        <p-drawer 
            #drawer
            header="Menu" 
            [(visible)]="visible" 
            position="right"
            [style]="{ width: '14rem' }"
            (onShow)="onDrawerShow()"
            (onHide)="onDrawerHide()"
        >
            <div app-rightmenu class="layout-sidebar" #menuContent></div>
        </p-drawer>
    `
})
export class AppRightDrawer implements AfterViewInit {
    @ViewChild('drawer') drawer!: Drawer;
    @ViewChild(AppRightMenu) appRightMenu!: AppRightMenu;
    @ViewChild('menuContent') menuContent!: ElementRef;

    constructor(public layoutService: LayoutService) {}

    ngAfterViewInit(): void {
        // Component initialized
    }

    get visible(): boolean {
        return this.layoutService.layoutState().rightMenuActive;
    }

    set visible(val: boolean) {
        if (!val) {
            this.layoutService.hideRightMenu();
        }
    }

    onDrawerShow(): void {
        // Try immediately
        this.scrollToTop();
        
        // Try after short delay
        setTimeout(() => this.scrollToTop(), 50);
        
        // Try after animation completes
        setTimeout(() => this.scrollToTop(), 300);
    }
    
    private scrollToTop(): void {
        // Try all possible scroll containers
        const selectors = [
            '.p-drawer-content',
            '.p-drawer.p-drawer-right .p-drawer-content',
            '.p-drawer .p-drawer-content',
            '.layout-sidebar',
            '.layout-menu-container',
            '.layout-menu'
        ];
        
        selectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                if (element.scrollTop !== undefined) {
                    element.scrollTop = 0;
                }
            });
        });
    }

    onDrawerHide(): void {
        this.layoutService.hideRightMenu();
    }
}


