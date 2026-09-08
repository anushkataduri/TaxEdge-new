import { validatePhone, validatePan, validateAadhaar, validateEmail } from "../../../shared/validators/indianTaxValidators";
import type { RegistrationData } from "../types/auth.types";

export function validateLoginPhone(phone: string): { valid: boolean; error?: string } {
  const clean = phone.replace(/\D/g, "");
  if (!clean) return { valid: false, error: "Mobile number is required" };
  if (clean.length !== 10) return { valid: false, error: "Please enter a valid 10-digit mobile number" };
  if (!validatePhone(clean)) return { valid: false, error: "Invalid mobile number format" };
  return { valid: true };
}

export function validateOtp(otp: string): { valid: boolean; error?: string } {
  const clean = otp.replace(/\D/g, "");
  if (!clean) return { valid: false, error: "Please enter the 6-digit OTP" };
  if (clean.length !== 6) return { valid: false, error: "OTP must be exactly 6 digits" };
  return { valid: true };
}

export function validatePasscode(passcode: string): { valid: boolean; error?: string } {
  const clean = passcode.replace(/\D/g, "");
  if (!clean) return { valid: false, error: "Passcode is required" };
  if (clean.length !== 6) return { valid: false, error: "Passcode must be exactly 6 digits" };
  return { valid: true };
}

export function validatePasscodeMatch(passcode: string, confirm: string): { valid: boolean; error?: string } {
  const v = validatePasscode(passcode);
  if (!v.valid) return v;
  if (passcode !== confirm) {
    return { valid: false, error: "Passcodes do not match" };
  }
  return { valid: true };
}

export function validateRegisterForm(values: Partial<RegistrationData>): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!values.name?.trim()) {
    errors.name = "Full name is required";
  }

  if (!values.email?.trim()) {
    errors.email = "Email address is required";
  } else if (!validateEmail(values.email.trim())) {
    errors.email = "Please enter a valid email address";
  }

  if (values.pan && !validatePan(values.pan.trim())) {
    errors.pan = "Please enter a valid 10-character PAN (e.g. ABCDE1234F)";
  }

  if (values.aadhaar && !validateAadhaar(values.aadhaar.trim())) {
    errors.aadhaar = "Please enter a valid 12-digit Aadhaar number";
  }

  return errors;
}

export default {
  validateLoginPhone,
  validateOtp,
  validatePasscode,
  validatePasscodeMatch,
  validateRegisterForm,
};
