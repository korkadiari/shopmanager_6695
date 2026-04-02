/**
 * Security utilities for input sanitization and validation
 */

// ─── Input Sanitization ───────────────────────────────────────────────────────

/**
 * Strip HTML tags and dangerous characters from user input
 */
export function sanitizeText(input: string): string {
  if (typeof input !== 'string') return '';
  return input
    .replace(/<[^>]*>/g, '')           // Remove HTML tags
    .replace(/javascript:/gi, '')       // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '')         // Remove event handlers
    .replace(/[<>"'`]/g, (char) => {    // Encode special chars
      const map: Record<string, string> = {
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '`': '&#x60;',
      };
      return map[char] || char;
    })
    .trim();
}

/**
 * Sanitize email input
 */
export function sanitizeEmail(email: string): string {
  if (typeof email !== 'string') return '';
  return email.toLowerCase().trim().replace(/[^a-z0-9@._+-]/g, '');
}

/**
 * Sanitize numeric input
 */
export function sanitizeNumber(value: unknown, fallback = 0): number {
  const num = Number(value);
  return isNaN(num) || !isFinite(num) ? fallback : num;
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number (Guinea format)
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^(\+224|00224)?[0-9]{8,9}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

/**
 * Truncate string to max length to prevent overflow attacks
 */
export function truncateInput(input: string, maxLength = 500): string {
  if (typeof input !== 'string') return '';
  return input.slice(0, maxLength);
}

/**
 * Sanitize search query (prevent SQL injection patterns in client-side filtering)
 */
export function sanitizeSearchQuery(query: string): string {
  if (typeof query !== 'string') return '';
  return query
    .replace(/[;'"\\]/g, '')
    .replace(/--/g, '')
    .replace(/\/\*/g, '')
    .trim()
    .slice(0, 200);
}

// ─── CSRF Token (client-side) ─────────────────────────────────────────────────

/**
 * Generate a simple CSRF token for forms
 */
export function generateCSRFToken(): string {
  const array = new Uint8Array(32);
  if (typeof window !== 'undefined' && window.crypto) {
    window.crypto.getRandomValues(array);
  }
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

// ─── Password Strength ────────────────────────────────────────────────────────

export interface PasswordStrength {
  score: number; // 0-4
  label: string;
  color: string;
}

export function checkPasswordStrength(password: string): PasswordStrength {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const levels: PasswordStrength[] = [
    { score: 0, label: 'Très faible', color: 'text-red-600' },
    { score: 1, label: 'Faible', color: 'text-red-500' },
    { score: 2, label: 'Moyen', color: 'text-amber-500' },
    { score: 3, label: 'Fort', color: 'text-green-500' },
    { score: 4, label: 'Très fort', color: 'text-green-600' },
  ];

  return levels[Math.min(score, 4)];
}
