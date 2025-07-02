/**
 * Production Error Handling for CloneX Universal Login
 */

import { ENV_CONFIG } from '../config/environment';

export interface APIError {
  message: string;
  type: 'rate_limit' | 'access_denied' | 'server_error' | 'network_error' | 'validation_error' | 'auth_error' | 'unknown';
  status?: number;
  upgrade?: boolean;
  retryable?: boolean;
  details?: any;
}

/**
 * Handle API errors with user-friendly messages
 */
export const handleAPIError = (error: any): APIError => {
  // Rate limiting
  if (error.status === 429) {
    return {
      message: "Too many requests. Please wait a moment and try again.",
      type: "rate_limit",
      retryable: true
    };
  }
  
  // Access denied
  if (error.status === 403) {
    return {
      message: "Insufficient access level for this feature.",
      type: "access_denied",
      upgrade: true
    };
  }
  
  // Authentication errors
  if (error.status === 401) {
    return {
      message: "Authentication required. Please connect your wallet.",
      type: "auth_error",
      retryable: true
    };
  }
  
  // Validation errors
  if (error.status === 400) {
    return {
      message: error.data?.message || "Invalid request. Please check your input.",
      type: "validation_error",
      details: error.data?.details
    };
  }
  
  // Server errors
  if (error.status >= 500) {
    return {
      message: "Server error. Please try again later.",
      type: "server_error",
      retryable: true
    };
  }
  
  // Network errors
  if (error.name === 'AbortError' || error.message?.includes('fetch') || error.message?.includes('timeout')) {
    return {
      message: "Network error. Please check your connection and try again.",
      type: "network_error",
      retryable: true
    };
  }
  
  // Wallet connection errors
  if (error.message?.includes('rejected') || error.message?.includes('denied')) {
    return {
      message: "Transaction rejected by user.",
      type: "auth_error"
    };
  }
  
  // Unknown errors
  return {
    message: error.message || "An unexpected error occurred.",
    type: "unknown",
    retryable: false,
    details: error
  };
};

/**
 * Log errors to external service in production
 */
export const logError = (error: APIError, context?: string): void => {
  // Console logging for development
  if (ENV_CONFIG.isDevelopment) {
    console.error('🚨 API Error:', error, context ? `Context: ${context}` : '');
  }
  
  // External error reporting in production
  if (ENV_CONFIG.enableErrorReporting && ENV_CONFIG.isProduction) {
    // Example: Sentry, LogRocket, or custom error service
    try {
      // window.gtag?.('event', 'exception', {
      //   description: error.message,
      //   fatal: false,
      //   error_type: error.type,
      //   context: context
      // });
    } catch (reportingError) {
      console.warn('Failed to report error:', reportingError);
    }
  }
};

/**
 * Error boundary component helper
 */
export const createErrorMessage = (error: APIError): {
  title: string;
  message: string;
  action?: string;
  actionType?: 'retry' | 'upgrade' | 'refresh' | 'contact';
} => {
  switch (error.type) {
    case 'rate_limit':
      return {
        title: 'Rate Limited',
        message: error.message,
        action: 'Try Again Later',
        actionType: 'retry'
      };
      
    case 'access_denied':
      return {
        title: 'Access Denied',
        message: error.message,
        action: error.upgrade ? 'Upgrade Access' : 'Check Requirements',
        actionType: error.upgrade ? 'upgrade' : 'refresh'
      };
      
    case 'server_error':
      return {
        title: 'Server Error',
        message: error.message,
        action: 'Retry',
        actionType: 'retry'
      };
      
    case 'network_error':
      return {
        title: 'Connection Error',
        message: error.message,
        action: 'Check Connection',
        actionType: 'retry'
      };
      
    case 'auth_error':
      return {
        title: 'Authentication Error',
        message: error.message,
        action: 'Reconnect Wallet',
        actionType: 'refresh'
      };
      
    case 'validation_error':
      return {
        title: 'Invalid Input',
        message: error.message,
        action: 'Check Input',
        actionType: 'refresh'
      };
      
    default:
      return {
        title: 'Error',
        message: error.message,
        action: 'Contact Support',
        actionType: 'contact'
      };
  }
};

/**
 * Retry wrapper for API calls
 */
export const withRetry = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = ENV_CONFIG.maxRetries,
  delay: number = ENV_CONFIG.retryDelay
): Promise<T> => {
  let lastError: any;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      const apiError = handleAPIError(error);
      
      // Don't retry non-retryable errors
      if (!apiError.retryable || attempt === maxRetries) {
        throw apiError;
      }
      
      // Exponential backoff
      const retryDelay = delay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }
  
  throw handleAPIError(lastError);
};