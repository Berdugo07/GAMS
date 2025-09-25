import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { MatStepperModule } from '@angular/material/stepper';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { toSignal } from '@angular/core/rxjs-interop';

import { selectOption, SelectSearchComponent } from '../../../../shared';
import { ExternalService } from '../../services';
import { ExternalProcedure } from '../../../domain';
import { typeProcedure } from '../../../../administration/infrastructure';
import { CustomFormValidators } from '../../../../helpers';

interface requirementOption {
  name: string;
  isSelected: boolean;
}

@Component({
  selector: 'app-external-dialog',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatStepperModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatCheckboxModule,
    SelectSearchComponent,
  ],
  templateUrl: './external-dialog.component.html',
  providers: [
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: { appearance: 'outline' },
    },
    {
      provide: STEPPER_GLOBAL_OPTIONS,
      useValue: { showError: true },
    },
  ],
})
export class ExternalDialogComponent {
  private formBuilder = inject(FormBuilder);
  private externalService = inject(ExternalService);
  private dialogRef = inject(MatDialogRef<ExternalDialogComponent>);

  data = inject<ExternalProcedure | undefined>(MAT_DIALOG_DATA);
  applicantType = signal<'NATURAL' | 'JURIDICO'>('NATURAL');
  hasRepresentative = signal<boolean>(false);

  segments = toSignal(this.externalService.getSegments(), { initialValue: [] });
  typesProcedures = signal<selectOption<typeProcedure>[]>([]);
  requirements = signal<requirementOption[]>([]);

  formProcedure: FormGroup = this.formBuilder.group({
    segment: ['', Validators.required],
    numberOfDocuments: ['', Validators.required],
    reference: ['', Validators.required],
    type: ['', Validators.required],
    cite: [''],
  });

  formApplicant = computed<FormGroup>(() =>
    this.applicantType() === 'NATURAL'
      ? this._createFormApplicantNatural()
      : this._createFormApplicantJuridico()
  );

  formRepresentative = computed<FormGroup>(() =>
    this.hasRepresentative()
      ? this._createFormRepresentative()
      : this.formBuilder.group({})
  );

  ngOnInit(): void {
    this.loadForm();
  }

  selectSegment(segment: string) {
    this.formProcedure.patchValue({ segment, type: '' });
    this.requirements.set([]);
    this.externalService
      .getTypesProceduresBySegment(segment)
      .subscribe((types) => {
        this.typesProcedures.set(
          types.map((type) => ({ value: type, label: type.nombre }))
        );
      });
  }

  selectTypeProcedure(type: typeProcedure) {
    this.formProcedure.patchValue({ type: type._id, reference: type.nombre });
    this.requirements.set(
      type.requerimientos
        .filter((requirement) => requirement.activo)
        .map((type) => ({ name: type.nombre, isSelected: true }))
    );
  }

  save(): void {
    const form = {
      formProcedure: this.formProcedure.value,
      formApplicant: this.formApplicant().value,
      formRepresentative: this.formRepresentative().value,
      requirements: this.requirements()
        .filter(({ isSelected }) => isSelected)
        .map(({ name }) => name),
    };
    const subscriptipn = this.data
      ? this.externalService.update(this.data.id, form)
      : this.externalService.create(form);

    subscriptipn.subscribe((procedure) => {
      this.dialogRef.close(procedure);
    });
  }

  get isFormValid(): boolean {
    return (
      this.formProcedure.valid &&
      this.formApplicant().valid &&
      this.formRepresentative().valid
    );
  }

  private _createFormRepresentative(): FormGroup {
    return this.formBuilder.group({
      firstname: ['', [Validators.required, CustomFormValidators.onlyLetters]],
      middlename: ['', [Validators.required, CustomFormValidators.onlyLetters]],
      lastname: ['', CustomFormValidators.onlyLetters],
      dni: [
        '',
        [
          Validators.required,
          Validators.minLength(7),
          Validators.pattern('^[a-zA-Z0-9-]*$'),
        ],
      ],
      phone: [
        '',
        [
          Validators.required,
          Validators.minLength(7),
          Validators.pattern(/^[0-9-]*$/),
        ],
      ],
    });
  }

  private _createFormApplicantNatural(): FormGroup {
    return this.formBuilder.group({
      firstname: ['', [Validators.required, CustomFormValidators.onlyLetters]],
      middlename: ['', [Validators.required, CustomFormValidators.onlyLetters]],
      lastname: ['', CustomFormValidators.onlyLetters],
      dni: [
        '',
        [
          Validators.required,
          Validators.minLength(6),
          Validators.pattern('^[a-zA-Z0-9-]*$'),
        ],
      ],
      phone: [
        '',
        [
          Validators.required,
          Validators.minLength(7),
          Validators.pattern('^[0-9-]*$'),
        ],
      ],
      type: ['NATURAL'],
    });
  }

  private _createFormApplicantJuridico(): FormGroup {
    return this.formBuilder.group({
      firstname: ['', Validators.required],
      phone: [
        '',
        [
          Validators.required,
          Validators.minLength(7),
          Validators.pattern('^[0-9-]*$'),
        ],
      ],
      type: ['JURIDICO'],
    });
  }

  private loadForm(): void {
    if (!this.data) return;
    const { applicant, representative, ...props } = this.data;
    this.formProcedure.removeControl('type');
    this.formProcedure.removeControl('segment');
    this.formProcedure.patchValue(props);

    this.applicantType.set(applicant.type);
    this.formApplicant().patchValue(applicant);

    this.hasRepresentative.set(representative ? true : false);
    this.formRepresentative().patchValue(representative ?? {});
  }
}
