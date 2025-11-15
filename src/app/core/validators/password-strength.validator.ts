import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

export function passwordStrengthValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value as string | null;
    if (!value) {
      return null;
    }

    return PASSWORD_REGEX.test(value) ? null : { passwordStrength: true };
  };
}
