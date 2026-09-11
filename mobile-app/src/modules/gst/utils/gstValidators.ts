/**
 * GST & Tax Validation Utilities
 * Follows standard Indian Government format rules for PAN, Aadhaar, GSTIN, IFSC, etc.
 */

export function parseDateString(dateStr: string): { day: number; month: number; year: number } | null {
  if (!dateStr || typeof dateStr !== "string") return null;
  const clean = dateStr.trim();
  // Accepts DD-MM-YYYY or DD/MM/YYYY
  const match = clean.match(/^(\d{2})[-/](\d{2})[-/](\d{4})$/);
  if (!match) return null;
  const day = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  const year = parseInt(match[3], 10);

  if (month < 1 || month > 12) return null;
  if (year < 1900 || year > 2100) return null;

  const dateObj = new Date(year, month - 1, day);
  if (
    dateObj.getFullYear() !== year ||
    dateObj.getMonth() !== month - 1 ||
    dateObj.getDate() !== day
  ) {
    return null;
  }
  return { day, month, year };
}

export const GstValidators = {
  /**
   * Validates Indian PAN Number: 5 letters, 4 digits, 1 letter (e.g. ABCDE1234F)
   */
  isValidPan: (pan: string): boolean => {
    const cleanPan = (pan || "").trim().toUpperCase();
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    return panRegex.test(cleanPan);
  },

  /**
   * Validates 12-digit Indian Aadhaar Number (allows spaces/dashes)
   */
  isValidAadhaar: (aadhaar: string): boolean => {
    const cleanAadhaar = (aadhaar || "").replace(/[\s-]/g, "");
    return /^\d{12}$/.test(cleanAadhaar);
  },

  /**
   * Validates 10-digit Indian Mobile Number starting with 6, 7, 8, or 9
   */
  isValidMobile: (mobile: string): boolean => {
    const cleanMobile = (mobile || "").replace(/^(\+91|0|\s)/g, "").replace(/[\s-]/g, "");
    return /^[6-9]\d{9}$/.test(cleanMobile);
  },

  /**
   * Validates Email Address format
   */
  isValidEmail: (email: string): boolean => {
    const cleanEmail = (email || "").trim();
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(cleanEmail);
  },

  /**
   * Validates Indian 15-character GSTIN (e.g. 29AAAAA0000A1Z5)
   */
  isValidGstin: (gstin: string): boolean => {
    const cleanGstin = (gstin || "").trim().toUpperCase();
    const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    return gstinRegex.test(cleanGstin);
  },

  /**
   * Validates 11-character Indian IFSC Code (e.g. HDFC0001234, SBIN0001234)
   */
  isValidIfsc: (ifsc: string): boolean => {
    const cleanIfsc = (ifsc || "").trim().toUpperCase();
    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    return ifscRegex.test(cleanIfsc);
  },

  /**
   * Validates Bank Account Number (digits only, between 9 and 18 digits)
   */
  isValidBankAccount: (account: string): boolean => {
    const cleanAcc = (account || "").trim().replace(/[\s-]/g, "");
    return /^\d{9,18}$/.test(cleanAcc);
  },

  /**
   * Validates UPI ID format (e.g. username@bank / pavan@ybl)
   */
  isValidUpi: (upi: string): boolean => {
    const cleanUpi = (upi || "").trim();
    const upiRegex = /^[\w.\-_]{2,}@[\w\-]{2,}$/;
    return upiRegex.test(cleanUpi);
  },

  /**
   * Validates standard string length (minimum non-empty length)
   */
  isNotEmpty: (str: string, minLength: number = 2): boolean => {
    return (str || "").trim().length >= minLength;
  },

  /**
   * Validates Debit / Credit Card number (16 digits)
   */
  isValidCardNumber: (cardNumber: string): boolean => {
    const cleanNum = (cardNumber || "").replace(/[\s-]/g, "");
    return /^\d{16}$/.test(cleanNum);
  },

  /**
   * Validates Card Expiry Date (MM/YY)
   */
  isValidExpiry: (expiry: string): boolean => {
    const cleanExp = (expiry || "").trim();
    return /^(0[1-9]|1[0-2])\/?([0-9]{2})$/.test(cleanExp);
  },

  /**
   * Validates Card CVV (3 or 4 digits)
   */
  isValidCvv: (cvv: string): boolean => {
    const cleanCvv = (cvv || "").trim();
    return /^\d{3,4}$/.test(cleanCvv);
  },

  /**
   * Validates calendar date with future and age boundaries
   */
  validateDateValue: (
    dateStr: string,
    options: {
      maxDateToday?: boolean;
      futureErrorMsg?: string;
      minAgeYears?: number;
      maxAgeYears?: number;
    } = {}
  ): string => {
    const parsed = parseDateString(dateStr);
    if (!parsed) {
      return "Enter a valid date";
    }

    const d = new Date(parsed.year, parsed.month - 1, parsed.day);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (options.maxDateToday && d.getTime() > today.getTime()) {
      return options.futureErrorMsg || "Date cannot be in the future";
    }

    if (options.minAgeYears !== undefined) {
      let age = today.getFullYear() - parsed.year;
      const mDiff = today.getMonth() - (parsed.month - 1);
      if (mDiff < 0 || (mDiff === 0 && today.getDate() < parsed.day)) {
        age--;
      }
      if (age < options.minAgeYears) {
        return `Authorized signatory must be at least ${options.minAgeYears} years old`;
      }
      if (options.maxAgeYears !== undefined && age > options.maxAgeYears) {
        return "Please enter a valid date of birth";
      }
    }

    return "";
  },

  /**
   * Validates full card form
   */
  validateCard: (data: { cardNumber: string; cardHolder: string; expiry: string; cvv: string }): Record<string, string> => {
    const errs: Record<string, string> = {};
    if (!GstValidators.isValidCardNumber(data.cardNumber)) errs.cardNumber = "Enter a valid 16-digit card number";
    if (!GstValidators.isNotEmpty(data.cardHolder, 2)) errs.cardHolder = "Cardholder name is required";
    if (!GstValidators.isValidExpiry(data.expiry)) errs.expiry = "Enter a valid expiry (MM/YY)";
    if (!GstValidators.isValidCvv(data.cvv)) errs.cvv = "Enter a valid CVV";
    return errs;
  },

  /**
   * Validates net banking form
   */
  validateNetBanking: (data: { selectedBank: string; customerId: string }): Record<string, string> => {
    const errs: Record<string, string> = {};
    if (!GstValidators.isNotEmpty(data.selectedBank, 2)) errs.selectedBank = "Please select your bank";
    if (!GstValidators.isNotEmpty(data.customerId, 4)) errs.customerId = "Customer / User ID is required";
    return errs;
  },

  /**
   * Field-level validator for GST Business Step
   */
  validateBusinessField: (field: string, value: string, allData?: Record<string, any>): string => {
    const clean = (value || "").trim();

    switch (field) {
      case "legalName":
        if (!clean || clean.length < 2) return "Enter a valid legal business name";
        if (clean.length > 150) return "Legal business name cannot exceed 150 characters";
        if (!/[a-zA-Z]/.test(clean)) return "Enter a valid legal business name";
        return "";

      case "businessName":
      case "registeredBusinessName":
        if (!clean || clean.length < 2) return "Enter a valid business name";
        if (clean.length > 150) return "Business name cannot exceed 150 characters";
        if (!/[a-zA-Z]/.test(clean)) return "Enter a valid business name";
        return "";

      case "businessType":
        if (!clean) return "Select a business type";
        return "";

      case "natureOfBusiness":
        if (!clean) return "Select the nature of business";
        return "";

      case "businessStartDate": {
        if (!clean) return "Enter a valid date";
        const dateErr = GstValidators.validateDateValue(clean, {
          maxDateToday: true,
          futureErrorMsg: "Business commencement date cannot be in the future",
        });
        return dateErr;
      }

      case "reasonForRegistration":
        if (!clean) return "Select a reason for registration";
        return "";

      case "compositionScheme":
        if (!clean) return "Select whether you want the composition scheme";
        return "";

      case "placeOfBusiness":
        if (!clean) return "Select the place of business";
        return "";

      case "businessAddress":
        if (!clean || clean.length < 5) return "Enter a valid business address";
        if (clean.length > 300) return "Business address cannot exceed 300 characters";
        if (!/[a-zA-Z0-9]/.test(clean)) return "Enter a valid business address";
        return "";

      case "city":
        if (!clean || clean.length < 2) return "Enter a valid city";
        if (clean.length > 60) return "City name cannot exceed 60 characters";
        if (!/^[a-zA-Z\s.'-]+$/.test(clean)) return "Enter a valid city";
        return "";

      case "district":
        if (!clean || clean.length < 2) return "Enter a valid district";
        if (clean.length > 60) return "District name cannot exceed 60 characters";
        if (!/^[a-zA-Z\s.'-]+$/.test(clean)) return "Enter a valid district";
        return "";

      case "state":
        if (!clean) return "Select a state";
        return "";

      case "pinCode":
        if (!/^[1-9]\d{5}$/.test(clean)) return "Enter a valid 6-digit PIN code";
        return "";

      case "hsnCode":
        if (!/^\d{4,8}$/.test(clean)) return "Enter a valid 4 to 8 digit HSN/SAC code";
        return "";

      case "accountHolderName":
        if (!clean || clean.length < 2) return "Enter a valid account holder name";
        if (clean.length > 100) return "Account holder name cannot exceed 100 characters";
        if (!/[a-zA-Z]/.test(clean)) return "Enter a valid account holder name";
        return "";

      case "bankAccountNumber":
        if (!clean) return "Bank account number is required";
        if (!/^\d{9,18}$/.test(clean)) return "Enter a valid bank account number (9 to 18 digits)";
        return "";

      case "confirmBankAccountNumber": {
        if (!clean) return "Confirm account number is required";
        if (!/^\d{9,18}$/.test(clean)) return "Enter a valid bank account number (9 to 18 digits)";
        const mainAcc = allData?.bankAccountNumber ? String(allData.bankAccountNumber).trim() : "";
        if (mainAcc && clean !== mainAcc) {
          return "Bank account numbers do not match";
        }
        return "";
      }

      case "ifscCode":
        if (!clean) return "IFSC code is required";
        if (!GstValidators.isValidIfsc(clean)) return "Enter a valid IFSC code";
        return "";

      case "bankName":
        if (!clean) return "Bank name is required (verify via IFSC)";
        return "";

      case "branchName":
        if (!clean) return "Branch name is required (verify via IFSC)";
        return "";

      case "accountType":
        if (!clean) return "Select account type";
        return "";

      case "signatoryName":
        if (!clean || clean.length < 2) return "Enter a valid signatory name";
        if (clean.length > 100) return "Signatory name cannot exceed 100 characters";
        if (!/[a-zA-Z]/.test(clean)) return "Enter a valid signatory name";
        return "";

      case "signatoryPan":
        if (!clean) return "Enter a valid PAN";
        if (!GstValidators.isValidPan(clean)) return "Enter a valid PAN";
        return "";

      case "signatoryDob": {
        if (!clean) return "Enter a valid date of birth";
        const dobErr = GstValidators.validateDateValue(clean, {
          maxDateToday: true,
          futureErrorMsg: "Date of birth cannot be in the future",
          minAgeYears: 18,
          maxAgeYears: 100,
        });
        return dobErr;
      }

      case "signatoryDesignation":
        if (!clean || clean.length < 2) return "Enter a valid designation";
        if (clean.length > 80) return "Designation cannot exceed 80 characters";
        return "";

      case "signatoryMobile":
        if (!GstValidators.isValidMobile(clean)) return "Enter a valid 10-digit mobile number";
        return "";

      case "signatoryEmail":
        if (!GstValidators.isValidEmail(clean)) return "Enter a valid email address";
        return "";

      case "aadhaarConsent":
        if (value !== "true" && value !== true as any) return "Please provide Aadhaar e-KYC consent";
        return "";

      default:
        return "";
    }
  },

  /**
   * Whole-form validator for Business Details using reduce
   */
  validateBusinessForm: (data: Record<string, any>): Record<string, string> => {
    const fields = [
      "legalName",
      "businessName",
      "businessType",
      "natureOfBusiness",
      "placeOfBusiness",
      "businessStartDate",
      "reasonForRegistration",
      "compositionScheme",
      "businessAddress",
      "city",
      "district",
      "state",
      "pinCode",
      "hsnCode",
      "accountHolderName",
      "bankAccountNumber",
      "confirmBankAccountNumber",
      "ifscCode",
      "bankName",
      "branchName",
      "accountType",
      "signatoryName",
      "signatoryPan",
      "signatoryDob",
      "signatoryDesignation",
      "signatoryMobile",
      "signatoryEmail",
      "aadhaarConsent",
    ];

    return fields.reduce<Record<string, string>>((acc, key) => {
      const rawValue = data[key] || (key === "businessName" ? data["registeredBusinessName"] : "");
      const value = typeof rawValue === "boolean" ? String(rawValue) : String(rawValue ?? "");
      const error = GstValidators.validateBusinessField(key, value, data);
      return error ? { ...acc, [key]: error } : acc;
    }, {});
  },
};

export default GstValidators;
