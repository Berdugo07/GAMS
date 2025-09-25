import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  input,
  OnInit,
  output,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'search-input',
  imports: [CommonModule, ReactiveFormsModule, MatInputModule, MatIconModule],
  template: `
    <mat-form-field appearance="outline">
      <mat-icon matPrefix>search</mat-icon>
      <mat-label>Buscar</mat-label>
      <input
        matInput
        placeholder="Buscar"
        [formControl]="control"
        [placeholder]="placeholder()"
      />
    </mat-form-field>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchInputComponent implements OnInit {
  placeholder = input<string>('');
  initValue = input<string>('');
  onSearch = output<string>();
  control = new FormControl('', { nonNullable: true });

  constructor() {}

  ngOnInit(): void {
    if (this.initValue()) this.control.setValue(this.initValue());
    this.control.valueChanges
      .pipe(debounceTime(400), distinctUntilChanged())
      .subscribe((term) => this.onSearch.emit(term));
  }
}
