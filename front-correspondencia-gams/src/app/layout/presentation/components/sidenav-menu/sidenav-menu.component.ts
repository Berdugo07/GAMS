import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { RouterModule } from '@angular/router';

interface menu {
  resource: string;
  text: string;
  icon: string;
  routerLink: string;
  children?: menu[];
}
@Component({
  selector: 'sidenav-menu',
  imports: [
    CommonModule,
    MatIconModule,
    MatListModule,
    RouterModule,
    MatExpansionModule,
  ],
  template: `
    <mat-nav-list>
      @for (item of menu; track $index) { @if(item.children){
      <mat-expansion-panel class="mat-elevation-z0 examp" [expanded]="true">
        <mat-expansion-panel-header>
          <mat-panel-description>
            {{ item.text }}
          </mat-panel-description>
        </mat-expansion-panel-header>
        <mat-nav-list>
          @for (subitem of item.children; track $index) {
          <mat-list-item
            routerLinkActive
            #link="routerLinkActive"
            [activated]="link.isActive"
            [routerLink]="subitem.routerLink"
            class="mt-2"
          >
            <mat-icon matListItemIcon>{{ subitem.icon }}</mat-icon>
            <div class="text" matListItemTitle>{{ subitem.text }}</div>
          </mat-list-item>
          }
        </mat-nav-list>
      </mat-expansion-panel>
      } @else {
      <mat-list-item
        routerLinkActive
        #link="routerLinkActive"
        [activated]="link.isActive"
        [routerLink]="item.routerLink"
        class="mt-2"
      >
        <mat-icon matListItemIcon>{{ item.icon }}</mat-icon>
        <a matListItemTitle>{{ item.text }}</a>
      </mat-list-item>
      } }
    </mat-nav-list>
  `,
  styleUrl: './sidenav-menu.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidenavMenuComponent {
  @Input({ required: true }) menu!: menu[];
}
