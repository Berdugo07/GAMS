import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  OnDestroy,
  AfterViewInit,
  ViewChild,
  ElementRef,
  ChangeDetectorRef,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
} from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { Communication } from '../../../domain';
import {
  NotificationService,
  ObservationResult,
} from '../../../presentation/services/notification.service';
import { SocketService } from '../../../../layout/presentation/services/socket.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { MatIconModule } from '@angular/material/icon';
import { Subscription } from 'rxjs';

interface ChatMessage {
  text: string;
  success: boolean;
  timestamp: string;
  senderName?: string;
  senderRole?: string;
}

@Component({
  selector: 'app-notify-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatIconModule],
  templateUrl: './notify-dialog.component.html',
  styleUrls: ['./notify-dialog.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotifyDialogComponent implements OnInit, OnDestroy, AfterViewInit {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<NotifyDialogComponent>);
  private readonly notificationService = inject(NotificationService);
  private readonly toastService = inject(ToastService);
  private readonly socketService = inject(SocketService);
  private readonly cdr = inject(ChangeDetectorRef);

  data: Communication[] = inject(MAT_DIALOG_DATA);
  notifyForm: FormGroup;
  messages: ChatMessage[] = [];
  socketSub?: Subscription;

  @ViewChild('chatContainer') chatContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('chatInput') chatInput!: ElementRef<HTMLTextAreaElement>;

  private initialDataLoaded = false;
  private scrollTimeout: any;

  constructor() {
    this.notifyForm = this.fb.group({
      observation: ['', [Validators.required, Validators.minLength(4)]],
    });
  }

  ngOnInit(): void {
    const procedureCodes = this.data
      .map((item) => item.procedure?.code)
      .filter(Boolean);

    if (!procedureCodes.length) return;

    procedureCodes.forEach((code) => this.loadAllHistory(code));

    this.socketSub = this.socketService
      .listen('whatsappNotification')
      .subscribe((data: any) => {
        if (!data?.success) return;
        const msg: ChatMessage = {
          text: data.message,
          success: true,
          timestamp: new Date().toLocaleString(),
        };
        this.messages.push(msg);

        this.cdr.detectChanges();
        this.scrollToBottom();
      });

    this.notifyForm.get('observation')?.valueChanges.subscribe(() => {
      this.adjustTextareaHeight();
    });
  }

  ngAfterViewInit(): void {
    this.scheduleInitialScroll();
  }

  ngOnDestroy(): void {
    this.socketSub?.unsubscribe();
    if (this.scrollTimeout) clearTimeout(this.scrollTimeout);
  }

  get observation() {
    return this.notifyForm.get('observation');
  }

  send(): void {
    if (this.notifyForm.invalid) return;

    const observation = this.notifyForm.value.observation;
    const ids = this.data.map((item) => item.procedure.code);

   
    const tempMessage: ChatMessage = {
      text: '',
      success: true,
      timestamp: new Date().toLocaleString(),
    };
    this.messages.push(tempMessage);
    this.cdr.detectChanges();
    this.scrollToBottom();

    this.notificationService.sendObservation(ids, observation).subscribe({
      next: (results: ObservationResult[]) => {
       
        const index = this.messages.indexOf(tempMessage);
        if (index > -1) this.messages.splice(index, 1);

        results.forEach((res) => {
          this.toastService.showToast({
            title: res.success ? '✅ WhatsApp enviado' : '❌ Error',
            description: `Trámite ${res.id}: ${res.message}`,
            severity: res.success ? 'success' : 'error',
          });

          this.messages.push({
            text: `Trámite ${res.id}: ${res.message}`,
            success: res.success,
            timestamp: new Date().toLocaleString(),
          });
        });

        this.cdr.detectChanges();
        this.scrollToBottom();

        this.dialogRef.close({ ids, observation, results });
      },
      error: () => {
        const index = this.messages.indexOf(tempMessage);
        if (index > -1) this.messages.splice(index, 1);

        this.toastService.showToast({
          title: 'Error interno',
          description: 'No se pudo enviar la observación',
          severity: 'error',
        });

        this.cdr.detectChanges();

        // También cerrar con error
        this.dialogRef.close({ ids, observation, results: ids.map((id) => ({ id, success: false, message: 'Error interno' })) });
      },
    });

    this.notifyForm.reset();
    this.resetTextareaHeight();
  }

  close(): void {
    this.dialogRef.close();
  }

  private loadAllHistory(code: string) {
    this.notificationService.getHistory(code).subscribe({
      next: (res) => {
        const items = Array.isArray(res.items) ? res.items : res.items ?? [];
        if (!items.length) {
          this.initialDataLoaded = true;
          return;
        }

        const newMessages = items
          .map((item: any) => ({
            text: item.observation ?? item.message ?? '(sin texto)',
            success: true,
            timestamp: new Date(item.createdAt).toLocaleString(),
            senderName: item.senderName ?? 'Desconocido',
            senderRole: item.senderRole ?? '',
          }))
          .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

        this.messages = [...this.messages, ...newMessages];
        this.initialDataLoaded = true;
        this.cdr.detectChanges();
        this.scheduleInitialScroll();
      },
      error: (err) => {
        console.error('❌ Error cargando historial:', err);
        this.initialDataLoaded = true;
      },
    });
  }

  private scheduleInitialScroll() {
    if (this.scrollTimeout) clearTimeout(this.scrollTimeout);
    this.scrollTimeout = setTimeout(() => this.scrollToBottomInstant(), 100);
  }

  private scrollToBottomInstant() {
    try {
      if (this.chatContainer?.nativeElement) {
        const container = this.chatContainer.nativeElement;
        container.scrollTop = container.scrollHeight;
      }
    } catch (err) {
      console.warn('Error en scroll automático:', err);
    }
  }

  private scrollToBottom() {
    try {
      if (this.chatContainer?.nativeElement) {
        const container = this.chatContainer.nativeElement;
        container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
      }
    } catch (err) {
      console.warn('Error en scroll automático:', err);
    }
  }

  private adjustTextareaHeight() {
    setTimeout(() => {
      if (this.chatInput?.nativeElement) {
        const textarea = this.chatInput.nativeElement;
        textarea.style.height = 'auto';
        const lineHeight = 20;
        const minHeight = 44;
        const maxHeight = 4 * lineHeight + 24;
        textarea.style.height = Math.min(Math.max(textarea.scrollHeight, minHeight), maxHeight) + 'px';
      }
    });
  }

  private resetTextareaHeight() {
    setTimeout(() => {
      if (this.chatInput?.nativeElement) {
        this.chatInput.nativeElement.style.height = 'auto';
      }
    });
  }
}
