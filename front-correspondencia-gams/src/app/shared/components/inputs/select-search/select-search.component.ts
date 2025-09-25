import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  DestroyRef,
  Component,
  effect,
  inject,
  input,
  OnInit,
  output,
} from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatSelectModule } from '@angular/material/select';
import { BehaviorSubject, debounceTime, distinctUntilChanged } from 'rxjs';

export type selectOption<T> = {
  label: string;
  value: T;
};

@Component({
  selector: 'select-search',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgxMatSelectSearchModule,
    MatFormFieldModule,
    MatSelectModule,
  ],
  template: `
    <mat-form-field [appearance]="appearance()">
      <mat-label>{{ title() }}</mat-label>
      <mat-select
        [formControl]="optionCtrl"
        [placeholder]="placeholder()"
        (selectionChange)="select($event.value)"
        [compareWith]="compareWith"
      >
        <mat-option>
          <ngx-mat-select-search
            [formControl]="optionFilterCtrl"
            [placeholderLabel]="placeholderLabel()"
            noEntriesFoundLabel="Sin resultados"
          ></ngx-mat-select-search>
        </mat-option>
        @if(nullable() && items().length > 0) {
        <mat-option [value]="null">Ninguno</mat-option>
        }

        <mat-option
          *ngFor="let option of filteredOptions | async"
          [value]="option.value"
        >
          {{ option.label }}
        </mat-option>
      </mat-select>
      @if (optionCtrl.invalid) {
      <mat-error>El campo es requerido</mat-error>
      }
    </mat-form-field>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectSearchComponent<T> implements OnInit {
  private destroyRef = inject(DestroyRef);

  appearance = input<'fill' | 'outline'>('outline');
  placeholder = input<string>('Buscar elemento');
  placeholderLabel = input<string>('Ingrese el termino a buscar');
  title = input<string>('');
  items = input<selectOption<T>[]>([]);
  autoFilter = input<boolean>(true);
  required = input<boolean>(false);
  onTyped = output<string>();
  onSelect = output<T>();
  nullable = input<boolean>(false);
  value = input<T | null>();
  optionCtrl: FormControl<T | null> = new FormControl(null);

  optionFilterCtrl: FormControl<string> = new FormControl();

  filteredOptions = new BehaviorSubject<selectOption<T>[]>([]);

  compareKey = input<keyof T>();

  constructor() {
    effect(() => {
      this.filteredOptions.next(this.items());
    });

    effect(() => {
      this.optionCtrl.setValue(this.value() ?? null);
    });
  }

  ngOnInit(): void {
    // if (this.value()) {
    //   this.optionCtrl.setValue(this.value() ?? null);
    // }
    this.optionFilterCtrl.valueChanges
      .pipe(
        distinctUntilChanged(),
        debounceTime(this.autoFilter() ? 0 : 350),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((value) => {
        const trimmed = value.trim();
        if (this.autoFilter()) {
          this.filter(trimmed);
        }
        if (!this.autoFilter() && trimmed !== '') {
          this.onTyped.emit(trimmed);
        }
      });

    if (this.required()) {
      this.optionCtrl.setValidators([Validators.required]);
      this.optionCtrl.updateValueAndValidity();
    }
  }

  filter(term: string): void {
    const elements = term
      ? this.items().filter(({ label }) =>
          label.toLowerCase().includes(term.toLowerCase())
        )
      : this.items().slice();
    this.filteredOptions.next(elements);
  }

  select(value: T) {
    this.onSelect.emit(value);
  }

  compareWith = (a: T, b: T): boolean => {
    if (!this.compareKey()) return a === b;
    return a?.[this.compareKey()!] === b?.[this.compareKey()!];
  };
}
