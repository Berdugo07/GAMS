import {
  inject,
  input,
  OnInit,
  Directive,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';

import { AuthService } from '../../auth/presentation/services/auth.service';
import { validResource } from '../../auth/infrastructure';

interface permissionData {
  resource: validResource;
  actions: string[] | string;
}
@Directive({
  selector: '[hasPermission]',
})
export class HasPermissionDirective implements OnInit {
  private viewContainer = inject(ViewContainerRef);
  private templateRef = inject(TemplateRef);
  private authService = inject(AuthService);

  permissionData = input.required<permissionData>({ alias: 'hasPermission' });

  private hasView = false;

  ngOnInit(): void {
    this.updateView();
  }

  private updateView() {
    const hasPermission = this.authService.hasPermission(
      this.permissionData().resource,
      this.permissionData().actions
    );
    if (hasPermission && !this.hasView) {
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.hasView = true;
    } else if (!hasPermission && this.hasView) {
      this.viewContainer.clear();
      this.hasView = false;
    }
  }
}
