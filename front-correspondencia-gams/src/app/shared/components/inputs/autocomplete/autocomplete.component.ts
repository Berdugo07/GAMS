import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  inject,
  input,
  OnInit,
  output,
} from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatInputModule } from '@angular/material/input';

import { BehaviorSubject, debounceTime, Subject } from 'rxjs';

export type AutocompleteOption<T> = {
  text: string;
  value: T;
};

@Component({
  selector: 'autocomplete',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatAutocompleteModule,
  ],
  template: `
    <form>
      <mat-form-field>
        <mat-label>{{ title() }}</mat-label>
        <input
          #input
          type="text"
          matInput
          [placeholder]="placeholder()"
          [matAutocomplete]="auto"
          (input)="onInputChange(input.value)"
          [formControl]="control"
        />
        <mat-autocomplete
          [requireSelection]="requireSelection()"
          #auto="matAutocomplete"
          [displayWith]="displayFn"
          (optionSelected)="select($event.option.value)"
        >
          @for (option of filteredOptions|async; track $index) {
          <mat-option [value]="option">{{ option.text }}</mat-option>
          }
        </mat-autocomplete>
      </mat-form-field>
    </form>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AutocompleteComponent<T> implements OnInit {
  private destroyRef = inject(DestroyRef);

  private searchSubject$ = new Subject<string>();
  control = new FormControl('');
  filteredOptions = new BehaviorSubject<AutocompleteOption<T>[]>([]);

  placeholder = input('');
  title = input<string>();
  value = input<string>();
  autoFilter = input<boolean>(false);
  requireSelection = input<boolean>(false);
  isRequired = input<boolean>();
  items = input.required<AutocompleteOption<T>[]>();

  onTyped = output<string>();
  onSelect = output<T>();

  constructor() {
    effect(() => {
      // Local filter: Set initial values
      // Server filter: Update values after options change
      this.filteredOptions.next(this.items());

      // on input signal change set control value
      this.control.setValue(this.value() ?? '');
    });
  }

  ngOnInit(): void {
    this._setInitialValues();

    // Listen event (input) from input, valueChanges with requireSelection block values
    this.searchSubject$
      .pipe(
        debounceTime(this.autoFilter() ? 0 : 350),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((value) => {
        this.onTyped.emit(value);
        if (this.autoFilter()) {
          this.filter(value);
        }
      });
  }

  filter(term: string | undefined): void {
    const elements = term
      ? this.items().filter(({ text }) =>
          text.toLowerCase().includes(term.toLowerCase())
        )
      : this.items().slice();
    this.filteredOptions.next(elements);
  }

  onInputChange(value: string): void {
    // Emit values for searchSubject$ activated
    this.searchSubject$.next(value);
  }

  displayFn(option: AutocompleteOption<T> | string): string {
    // if init value is stablish, values is a text, but value of mat-option is AutocompleteOption<T>
    if (typeof option === 'string') {
      return option;
    }
    return option && option.text ? option.text : '';
  }

  select(option: AutocompleteOption<T>): void {
    this.onSelect.emit(option.value);
  }

  private _setInitialValues() {
    this.filter(this.value());
    if (this.isRequired()) {
      this.control.setValidators([Validators.required]);
    }
  }
}
