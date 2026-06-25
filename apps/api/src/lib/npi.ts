// NPI check-digit validation per the CMS spec: prepend the constant "80840"
// prefix to the first 9 digits and run the standard Luhn algorithm against
// the 10th digit. This lets us reject malformed NPIs before calling NPPES,
// so "invalid NPI" and "valid NPI, no match" aren't both reported as
// "no results" - NPPES itself only checks the digit count, not the checksum.
export function isValidNpi(npi: string): boolean {
  if (!/^\d{10}$/.test(npi)) return false;

  const digits = `80840${npi.slice(0, 9)}`;
  let sum = 0;

  for (let i = 0; i < digits.length; i++) {
    let digit = Number(digits[digits.length - 1 - i]);
    if (i % 2 === 0) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
  }

  const checkDigit = (10 - (sum % 10)) % 10;
  return checkDigit === Number(npi[9]);
}

export type ParsedQuery =
  | { type: "NPI"; npi: string }
  | { type: "NAME"; firstName?: string; lastName: string }
  | { type: "INVALID"; reason: string };

// A single free-text field has to become either an NPI lookup or a
// first/last name lookup for NPPES. Heuristic: all-digit input must be a
// valid 10-digit NPI; otherwise treat it as a name, taking the last
// whitespace-separated token as the surname (the common case for "First
// Last" search input).
export function parseQuery(rawInput: string): ParsedQuery {
  const input = rawInput.trim();

  if (!input) {
    return { type: "INVALID", reason: "Enter an NPI number or a provider name." };
  }

  if (/^\d+$/.test(input)) {
    if (input.length !== 10) {
      return { type: "INVALID", reason: "An NPI number must be exactly 10 digits." };
    }
    if (!isValidNpi(input)) {
      return { type: "INVALID", reason: "That doesn't look like a valid NPI (failed checksum)." };
    }
    return { type: "NPI", npi: input };
  }

  const parts = input.split(/\s+/);
  if (parts.length === 1) {
    return { type: "NAME", lastName: parts[0] };
  }

  return {
    type: "NAME",
    firstName: parts.slice(0, -1).join(" "),
    lastName: parts[parts.length - 1],
  };
}
