/**
 * Safe logging utility
 * - Development: logs detailed error information
 * - Production: logs only safe, generic messages
 */

const isDevelopment = process.env.NODE_ENV === 'development'

export const logger = {
  /**
   * Log error with sensitive details (only in development)
   * In production, logs a safe generic message
   */
  error(message: string, error?: unknown) {
    if (isDevelopment) {
      console.error(`[ERROR] ${message}`, error)
    } else {
      // Production: only log the safe message, not the error details
      console.error(`[ERROR] ${message}`)
    }
  },

  /**
   * Log warning (safe in both environments)
   */
  warn(message: string, data?: unknown) {
    if (isDevelopment) {
      console.warn(`[WARN] ${message}`, data)
    } else {
      console.warn(`[WARN] ${message}`)
    }
  },

  /**
   * Log info (only in development)
   */
  info(message: string, data?: unknown) {
    if (isDevelopment) {
      console.log(`[INFO] ${message}`, data)
    }
  }
}
