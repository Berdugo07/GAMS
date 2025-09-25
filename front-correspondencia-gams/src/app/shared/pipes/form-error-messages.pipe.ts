import { Pipe, type PipeTransform } from '@angular/core';
import { ValidationErrors } from '@angular/forms';
export type FieldValidationErrorMessages =
  | {
      [field: string]: ValidationErrorMessages;
    }
  | undefined;

export type ValidationErrorMessages = {
  [error: string]: string;
};
@Pipe({
  name: 'formErrorMessages',
})
export class FormErrorMessagesPipe implements PipeTransform {
  transform(
    errors: ValidationErrors | null | undefined,
    customMessages?: ValidationErrorMessages
  ): string {
    if (!errors) return '';
    if (!customMessages) return this.handleGenericErrorMessages(errors);
    const firstErrorKey = Object.keys(errors)[0];

    return (
      customMessages?.[firstErrorKey] ||
      this.handleGenericErrorMessages({
        [firstErrorKey]: errors[firstErrorKey],
      })
    );
  }

  private handleGenericErrorMessages(errors: ValidationErrors) {
    if (errors['required']) return 'Este campo es requerido';
    if (errors['minlength']) {
      return `Ingrese al menos ${errors['minlength'].requiredLength} caracteres`;
    }
    if (errors['maxlength']) {
      return `Maximo ${errors['maxlength'].requiredLength} caracteres`;
    }
    return 'Este campo no es valido';
  }
}
