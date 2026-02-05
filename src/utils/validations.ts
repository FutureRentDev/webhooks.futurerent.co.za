/**
 * Validates whether a given string is a valid email address.
 * @param email - The email address to validate.
 * @returns true if valid, false otherwise.
 */
export const validateFutureRentEmail = (email: string): boolean => {
  if (!email) return false;

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  
  // Check general email format first
  if (!emailRegex.test(email)) {
    return false;
  }

  // Check if email ends with @futurerent.co.za
  return email.toLowerCase().endsWith('@futurerent.co.za');
};
export const validateEmail = (email: string): boolean => {
  if (!email) return false;

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  
  // Check general email format first
  if (!emailRegex.test(email)) {
    return false;
  }

  // Check if email ends with @futurerent.co.za
  return email.toLowerCase().endsWith('@futurerent.co.za');
};

export const validatePhoneNumber = ( input: string) => {
  // Remove all whitespace
  const cleaned = input.replace(/\s+/g, '');

  // Validate +27 format
  if (cleaned.startsWith('+27')) {
    // Should be +27 followed by 9 digits => total length = 12
    return /^\+27\d{9}$/.test(cleaned);
  }

  // Validate 0 format
  if (cleaned.startsWith('0')) {
    // Should be 0 followed by 9 digits => total length = 10
    return /^0\d{9}$/.test(cleaned);
  }

  // If it doesn't start with +27 or 0, it's invalid
  return false;
}
