/**
 * Input validation and sanitization utilities
 */

/**
 * Sanitize string input
 */
export function sanitizeString(input: string, maxLength: number = 500): string {
  if (typeof input !== 'string') {
    return '';
  }
  
  return input
    .trim()
    .slice(0, maxLength)
    .replace(/[<>]/g, ''); // Remove potential HTML tags
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false;
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim()) && email.length <= 254;
}

/**
 * Validate username
 */
export function isValidUsername(username: string): boolean {
  if (!username || typeof username !== 'string') {
    return false;
  }
  
  const trimmed = username.trim();
  
  // Username rules:
  // - 3-30 characters
  // - Only alphanumeric, underscore, and hyphen
  // - Cannot start or end with underscore or hyphen
  const usernameRegex = /^[a-zA-Z0-9]([a-zA-Z0-9_-]{1,28}[a-zA-Z0-9])?$/;
  
  return trimmed.length >= 3 && trimmed.length <= 30 && usernameRegex.test(trimmed);
}

/**
 * Validate password strength
 */
export function isValidPassword(password: string): { valid: boolean; message?: string } {
  if (!password || typeof password !== 'string') {
    return { valid: false, message: 'La contraseña es requerida' };
  }
  
  if (password.length < 6) {
    return { valid: false, message: 'La contraseña debe tener al menos 6 caracteres' };
  }
  
  if (password.length > 128) {
    return { valid: false, message: 'La contraseña es demasiado larga' };
  }
  
  return { valid: true };
}

/**
 * Validate search query
 */
export function isValidSearchQuery(query: string): { valid: boolean; message?: string; sanitized?: string } {
  if (!query || typeof query !== 'string') {
    return { valid: false, message: 'La búsqueda es requerida' };
  }
  
  const sanitized = sanitizeString(query, 100);
  
  if (sanitized.length < 1) {
    return { valid: false, message: 'La búsqueda debe tener al menos 1 carácter' };
  }
  
  if (sanitized.length > 100) {
    return { valid: false, message: 'La búsqueda es demasiado larga' };
  }
  
  return { valid: true, sanitized };
}

/**
 * Validate rating (0-5)
 */
export function isValidRating(rating: number | null | undefined): boolean {
  if (rating === null || rating === undefined) {
    return true; // Rating is optional
  }
  
  if (typeof rating !== 'number') {
    return false;
  }
  
  return rating >= 0 && rating <= 5 && !isNaN(rating);
}

/**
 * Validate review text
 */
export function isValidReview(review: string | undefined): { valid: boolean; message?: string; sanitized?: string } {
  if (!review) {
    return { valid: true }; // Review is optional
  }
  
  if (typeof review !== 'string') {
    return { valid: false, message: 'La reseña debe ser texto' };
  }
  
  const sanitized = sanitizeString(review, 500);
  
  if (sanitized.length > 500) {
    return { valid: false, message: 'La reseña no puede exceder 500 caracteres' };
  }
  
  return { valid: true, sanitized };
}

/**
 * Validate title
 */
export function isValidTitle(title: string): { valid: boolean; message?: string; sanitized?: string } {
  if (!title || typeof title !== 'string') {
    return { valid: false, message: 'El título es requerido' };
  }
  
  const sanitized = sanitizeString(title, 200);
  
  if (sanitized.length < 1) {
    return { valid: false, message: 'El título debe tener al menos 1 carácter' };
  }
  
  if (sanitized.length > 200) {
    return { valid: false, message: 'El título es demasiado largo' };
  }
  
  return { valid: true, sanitized };
}
