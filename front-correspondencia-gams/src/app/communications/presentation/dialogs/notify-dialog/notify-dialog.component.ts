import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  OnDestroy,
  AfterViewInit,
  ViewChild,
  ElementRef,
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
  applicantName?: string;
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

  data: Communication[] = inject(MAT_DIALOG_DATA);
  notifyForm: FormGroup;
  messages: ChatMessage[] = [];
  socketSub?: Subscription;

  loadingHistory = false;
  oldestTimestamp: string | undefined;

  @ViewChild('chatContainer') chatContainer!: ElementRef<HTMLDivElement>;

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

    // Cargar mensajes más recientes primero
    procedureCodes.forEach((code) => this.loadHistory(code, false));

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
        setTimeout(() => this.scrollToBottom(), 50);
      });
  }

  ngAfterViewInit(): void {
    const container = this.chatContainer.nativeElement;
    container.addEventListener('scroll', () => {
      if (container.scrollTop === 0 && !this.loadingHistory) {
        const procedureCodes = this.data
          .map((item) => item.procedure?.code)
          .filter(Boolean);
        procedureCodes.forEach((code) => this.loadHistory(code, true));
      }
    });

    setTimeout(() => this.scrollToBottom(), 100);
  }

  ngOnDestroy(): void {
    this.socketSub?.unsubscribe();
  }

  get observation() {
    return this.notifyForm.get('observation');
  }

  send(): void {
    if (this.notifyForm.invalid) return;

    const observation = this.notifyForm.value.observation;
    const ids = this.data.map((item) => item.procedure.code);

    this.messages.push({
      text: `Enviando observación: "${observation}"...`,
      success: true,
      timestamp: new Date().toLocaleString(),
    });
    this.scrollToBottom();

    this.notificationService.sendObservation(ids, observation).subscribe({
      next: (results: any) => {
        const arrayResults = Array.isArray(results) ? results : results.items ?? [];
        arrayResults
          .filter((res: any) => res.success)
          .forEach((res: any) => {
            this.toastService.showToast({
              title: '✅ Enviado',
              description: `Trámite ${res.id}: ${res.message}`,
              severity: 'success',
            });

            this.messages.push({
              text: `Trámite ${res.id}: ${res.message}`,
              success: true,
              timestamp: new Date().toLocaleString(),
            });
          });
        this.scrollToBottom();
      },
      error: () => {
        this.toastService.showToast({
          title: 'Error interno',
          description: 'No se pudo enviar la observación',
          severity: 'error',
        });
      },
    });

    this.notifyForm.reset();
  }

  close(): void {
    this.dialogRef.close();
  }

  /**
   * Cargar historial de mensajes
   * @param code código del procedimiento
   * @param prepend true si se cargan mensajes antiguos al subir scroll
   */
  private loadHistory(code: string, prepend = false) {
    this.loadingHistory = true;

    const date = prepend && this.oldestTimestamp ? this.oldestTimestamp : undefined;

    this.notificationService.getHistory(code, date).subscribe({
      next: (res) => {
        const items = Array.isArray(res.items) ? res.items : res.items ?? [];
        if (!items.length) {
          this.loadingHistory = false;
          return;
        }

        const historyMessages = items.map((item: any) => ({
          text: item.observation ?? item.message ?? '(sin texto)',
          success: true,
          timestamp: new Date(item.createdAt).toLocaleString(),
          applicantName: item.applicantName ?? '',
        }));

        if (prepend) {
          const container = this.chatContainer.nativeElement;
          const scrollHeightBefore = container.scrollHeight;

          this.messages = [...historyMessages, ...this.messages];
          this.oldestTimestamp = new Date(items[0].createdAt).toISOString();

          setTimeout(() => {
            const scrollHeightAfter = container.scrollHeight;
            container.scrollTop = scrollHeightAfter - scrollHeightBefore;
          }, 50);
        } else {
          // Mensajes más recientes primero
          this.messages = [...historyMessages, ...this.messages].sort(
            (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          );
          this.oldestTimestamp = new Date(items[0].createdAt).toISOString();
          setTimeout(() => this.scrollToBottom(), 50);
        }

        this.loadingHistory = false;
      },
      error: () => (this.loadingHistory = false),
    });
  }

  private scrollToBottom() {
    const container = this.chatContainer.nativeElement;
    container.scrollTop = container.scrollHeight;
  }
}
