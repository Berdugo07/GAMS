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
export class NotifyDialogComponent
  implements OnInit, OnDestroy, AfterViewInit
{
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

  // 🔹 Control para saber si ya se cargó el historial inicial
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

    // 🔹 Cargar todos los mensajes
    procedureCodes.forEach((code) => this.loadAllHistory(code));

    // 🔹 Escucha en tiempo real
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
        this.scrollToBottom(); // Scroll para nuevos mensajes en tiempo real
      });

    // 🔹 Suscribirse a cambios en el textarea para auto-ajustar altura
    this.notifyForm.get('observation')?.valueChanges.subscribe(() => {
      this.adjustTextareaHeight();
    });
  }

  ngAfterViewInit(): void {
    // 🔹 Scroll inicial después de un pequeño delay para asegurar que el DOM esté listo
    this.scheduleInitialScroll();
  }

  ngOnDestroy(): void {
    this.socketSub?.unsubscribe();
    if (this.scrollTimeout) {
      clearTimeout(this.scrollTimeout);
    }
  }

  get observation() {
    return this.notifyForm.get('observation');
  }

  send(): void {
    if (this.notifyForm.invalid) return;

    const observation = this.notifyForm.value.observation;
    const ids = this.data.map((item) => item.procedure.code);

    // Mostrar mensaje temporal de envío
    this.messages.push({
      text: `Enviando observación: "${observation}"...`,
      success: true,
      timestamp: new Date().toLocaleString(),
    });

    this.cdr.detectChanges();
    this.scrollToBottom(); // Scroll para el mensaje que el usuario envía

    this.notificationService.sendObservation(ids, observation).subscribe({
      next: (results: any) => {
        const arrayResults = Array.isArray(results)
          ? results
          : results.items ?? [];

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

            this.cdr.detectChanges();
            this.scrollToBottom(); // Scroll para las respuestas
          });
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
    this.resetTextareaHeight(); // 🔹 Resetear altura después de enviar
  }

  close(): void {
    this.dialogRef.close();
  }

  /** 🔹 Carga completa del historial */
  private loadAllHistory(code: string) {
    this.notificationService.getHistory(code).subscribe({
      next: (res) => {
        const items = Array.isArray(res.items)
          ? res.items
          : res.items ?? [];

        if (!items.length) {
          this.initialDataLoaded = true;
          return;
        }

        const newMessages = items
          .map((item: any) => ({
            text: item.observation ?? item.message ?? '(sin texto)',
            success: true,
            timestamp: new Date(item.createdAt).toLocaleString(),
            applicantName: item.applicantName ?? '',
          }))
          .sort(
            (a, b) =>
              new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          );

        this.messages = [...this.messages, ...newMessages];
        this.initialDataLoaded = true;
        this.cdr.detectChanges();
        
        // 🔹 Scroll después de cargar el historial
        this.scheduleInitialScroll();
      },
      error: (err) => {
        console.error('❌ Error cargando historial:', err);
        this.initialDataLoaded = true;
      },
    });
  }

  /** 🔹 Scroll inicial SIN animación (instantáneo) */
  private scheduleInitialScroll() {
    if (this.scrollTimeout) {
      clearTimeout(this.scrollTimeout);
    }

    this.scrollTimeout = setTimeout(() => {
      this.scrollToBottomInstant();
    }, 100); // Pequeño delay para asegurar que el DOM esté renderizado
  }

  /** 🔹 Scroll instantáneo al final (sin animación) */
  private scrollToBottomInstant() {
    try {
      if (this.chatContainer?.nativeElement) {
        const container = this.chatContainer.nativeElement;
        // 🔹 IMPORTANTE: Usar scrollTop directamente para que sea instantáneo
        container.scrollTop = container.scrollHeight;
      }
    } catch (err) {
      console.warn('Error en scroll automático:', err);
    }
  }

  /** 🔹 Scroll con animación suave (para mensajes nuevos) */
  private scrollToBottom() {
    try {
      if (this.chatContainer?.nativeElement) {
        const container = this.chatContainer.nativeElement;
        container.scrollTo({
          top: container.scrollHeight,
          behavior: 'smooth'
        });
      }
    } catch (err) {
      console.warn('Error en scroll automático:', err);
    }
  }

  /** 🔹 Ajustar altura automáticamente del textarea */
  private adjustTextareaHeight() {
    setTimeout(() => {
      if (this.chatInput?.nativeElement) {
        const textarea = this.chatInput.nativeElement;
        
        // Reset height to auto para calcular correctamente
        textarea.style.height = 'auto';
        
        // Calcular nueva altura (mínimo 1 línea, máximo 4 líneas)
        const lineHeight = 20; // Aproximadamente 20px por línea
        const minHeight = 44; // Altura mínima para una línea
        const maxHeight = 4 * lineHeight + 24; // 4 líneas + padding
        
        const newHeight = Math.min(Math.max(textarea.scrollHeight, minHeight), maxHeight);
        
        // Aplicar nueva altura
        textarea.style.height = newHeight + 'px';
      }
    });
  }

  /** 🔹 Resetear altura del textarea */
  private resetTextareaHeight() {
    setTimeout(() => {
      if (this.chatInput?.nativeElement) {
        this.chatInput.nativeElement.style.height = 'auto';
      }
    });
  }
}