/**
 * UE5 Middleware for ProjectPhoenix-BEFE Integration
 * 
 * Provides UE5-specific middleware for CORS, authentication validation,
 * error handling, and request logging.
 */

import { UE5APIRequest, UE5APIResponse } from './ue5Routes';
import { ue5JWT } from '../utils/ue5JWT';
import { ENV_CONFIG } from '../config/environment';

// ============================================================================
// Middleware Types
// ============================================================================

export type UE5MiddlewareFunction = (
  request: UE5APIRequest,
  next: () => Promise<UE5APIResponse<any>>
) => Promise<UE5APIResponse<any>>;

export interface UE5CorsOptions {
  origins: string[];
  methods: string[];
  headers: string[];
  credentials: boolean;
}

export interface UE5AuthOptions {
  required: boolean;
  allowedRoles?: string[];
}

// ============================================================================
// CORS Middleware
// ============================================================================

/**
 * UE5 CORS middleware for cross-origin requests
 */
export const ue5CorsMiddleware = (options: Partial<UE5CorsOptions> = {}): UE5MiddlewareFunction => {
  const corsOptions: UE5CorsOptions = {
    origins: options.origins || ['*'],
    methods: options.methods || ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    headers: options.headers || ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: options.credentials ?? true
  };

  return async (request: UE5APIRequest, next: () => Promise<UE5APIResponse<any>>) => {
    // Handle preflight OPTIONS requests
    if (request.method === 'OPTIONS') {
      return {
        success: true,
        data: null,
        timestamp: Date.now(),
        headers: {
          'Access-Control-Allow-Origin': corsOptions.origins.includes('*') ? '*' : corsOptions.origins.join(','),
          'Access-Control-Allow-Methods': corsOptions.methods.join(','),
          'Access-Control-Allow-Headers': corsOptions.headers.join(','),
          'Access-Control-Allow-Credentials': corsOptions.credentials.toString()
        }
      };
    }

    // Process the request
    const response = await next();

    // Add CORS headers to response
    if (!response.headers) {
      response.headers = {};
    }

    response.headers['Access-Control-Allow-Origin'] = corsOptions.origins.includes('*') 
      ? '*' 
      : corsOptions.origins.join(',');
    response.headers['Access-Control-Allow-Credentials'] = corsOptions.credentials.toString();

    if (ENV_CONFIG.showUE5Debug) {
      console.log('🌐 UE5 CORS headers added to response');
    }

    return response;
  };
};

// ============================================================================
// Authentication Middleware
// ============================================================================

/**
 * UE5 JWT authentication middleware
 */
export const ue5AuthMiddleware = (options: UE5AuthOptions = { required: true }): UE5MiddlewareFunction => {
  return async (request: UE5APIRequest, next: () => Promise<UE5APIResponse<any>>) => {
    const token = extractBearerToken(request.headers);

    // Check if auth is required
    if (options.required && !token) {
      return {
        success: false,
        error: 'Authentication required. Please provide a valid Bearer token.',
        timestamp: Date.now()
      };
    }

    // Validate token if provided
    if (token) {
      const validation = ue5JWT.validateToken(token);
      
      if (!validation.valid) {
        return {
          success: false,
          error: `Invalid token: ${validation.error}`,
          timestamp: Date.now()
        };
      }

      // Check role-based access if specified
      if (options.allowedRoles && validation.claims) {
        const userRoles = validation.claims.gamePermissions || [];
        const hasRequiredRole = options.allowedRoles.some(role => userRoles.includes(role));
        
        if (!hasRequiredRole) {
          return {
            success: false,
            error: 'Insufficient permissions. Required roles: ' + options.allowedRoles.join(', '),
            timestamp: Date.now()
          };
        }
      }

      // Add user context to request
      (request as any).user = validation.claims;
      
      if (ENV_CONFIG.showUE5Debug) {
        console.log('✅ UE5 Authentication validated for user:', validation.claims?.id);
      }
    }

    return next();
  };
};

// ============================================================================
// Request Logging Middleware
// ============================================================================

/**
 * UE5 request logging middleware
 */
export const ue5LoggingMiddleware = (): UE5MiddlewareFunction => {
  return async (request: UE5APIRequest, next: () => Promise<UE5APIResponse<any>>) => {
    const startTime = Date.now();
    
    if (ENV_CONFIG.showUE5Debug) {
      console.log(`📥 UE5 API Request: ${request.method} ${request.path}`);
      if (request.body) {
        console.log('📦 Request Body:', JSON.stringify(request.body, null, 2));
      }
      if (request.query) {
        console.log('🔍 Query Params:', request.query);
      }
    }

    const response = await next();
    const duration = Date.now() - startTime;

    if (ENV_CONFIG.showUE5Debug) {
      console.log(`📤 UE5 API Response: ${request.method} ${request.path} - ${response.success ? 'SUCCESS' : 'ERROR'} (${duration}ms)`);
      if (!response.success && response.error) {
        console.log('❌ Error:', response.error);
      }
    }

    // Add timing information to response
    if (!response.headers) {
      response.headers = {};
    }
    response.headers['X-Response-Time'] = `${duration}ms`;

    return response;
  };
};

// ============================================================================
// Error Handling Middleware
// ============================================================================

/**
 * UE5 error handling middleware
 */
export const ue5ErrorMiddleware = (): UE5MiddlewareFunction => {
  return async (request: UE5APIRequest, next: () => Promise<UE5APIResponse<any>>) => {
    try {
      return await next();
    } catch (error: any) {
      if (ENV_CONFIG.showUE5Debug) {
        console.error('❌ UE5 API Unhandled Error:', error);
      }

      // Format error for ProjectPhoenix-BEFE compatibility
      const errorResponse: UE5APIResponse<null> = {
        success: false,
        error: error.message || 'Internal server error',
        data: null,
        timestamp: Date.now()
      };

      // Add error details in development
      if (ENV_CONFIG.showUE5Debug) {
        (errorResponse as any).debug = {
          stack: error.stack,
          name: error.name,
          request: {
            method: request.method,
            path: request.path
          }
        };
      }

      return errorResponse;
    }
  };
};

// ============================================================================
// Rate Limiting Middleware
// ============================================================================

/**
 * Simple rate limiting middleware for UE5 API
 */
export const ue5RateLimitMiddleware = (
  maxRequests: number = 100,
  windowMs: number = 60000 // 1 minute
): UE5MiddlewareFunction => {
  const requestCounts = new Map<string, { count: number; resetTime: number }>();

  return async (request: UE5APIRequest, next: () => Promise<UE5APIResponse<any>>) => {
    // Use IP or user ID as identifier (mock implementation)
    const identifier = (request as any).user?.id || 'anonymous';
    const now = Date.now();

    // Get or create request count for this identifier
    let requestData = requestCounts.get(identifier);
    
    if (!requestData || now > requestData.resetTime) {
      requestData = {
        count: 0,
        resetTime: now + windowMs
      };
    }

    // Check rate limit
    if (requestData.count >= maxRequests) {
      const resetIn = Math.ceil((requestData.resetTime - now) / 1000);
      
      return {
        success: false,
        error: `Rate limit exceeded. Try again in ${resetIn} seconds.`,
        timestamp: Date.now(),
        headers: {
          'X-RateLimit-Limit': maxRequests.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': requestData.resetTime.toString()
        }
      };
    }

    // Increment request count
    requestData.count++;
    requestCounts.set(identifier, requestData);

    const response = await next();

    // Add rate limit headers to response
    if (!response.headers) {
      response.headers = {};
    }
    
    response.headers['X-RateLimit-Limit'] = maxRequests.toString();
    response.headers['X-RateLimit-Remaining'] = (maxRequests - requestData.count).toString();
    response.headers['X-RateLimit-Reset'] = requestData.resetTime.toString();

    return response;
  };
};

// ============================================================================
// Content Type Validation Middleware
// ============================================================================

/**
 * Content type validation middleware
 */
export const ue5ContentTypeMiddleware = (): UE5MiddlewareFunction => {
  return async (request: UE5APIRequest, next: () => Promise<UE5APIResponse<any>>) => {
    // Only validate POST/PUT requests with body
    if (['POST', 'PUT'].includes(request.method) && request.body) {
      const contentType = request.headers?.['content-type'] || request.headers?.['Content-Type'];
      
      if (!contentType || !contentType.includes('application/json')) {
        return {
          success: false,
          error: 'Invalid content type. Expected application/json.',
          timestamp: Date.now()
        };
      }
    }

    return next();
  };
};

// ============================================================================
// Middleware Composition
// ============================================================================

/**
 * Compose multiple middleware functions
 */
export const composeMiddleware = (...middlewares: UE5MiddlewareFunction[]): UE5MiddlewareFunction => {
  return async (request: UE5APIRequest, next: () => Promise<UE5APIResponse<any>>) => {
    let index = 0;

    const dispatch = async (): Promise<UE5APIResponse<any>> => {
      if (index >= middlewares.length) {
        return next();
      }

      const middleware = middlewares[index++];
      return middleware(request, dispatch);
    };

    return dispatch();
  };
};

/**
 * Default UE5 middleware stack
 */
export const defaultUE5Middleware = composeMiddleware(
  ue5ErrorMiddleware(),
  ue5LoggingMiddleware(),
  ue5CorsMiddleware({
    origins: ENV_CONFIG.isCloneXDomain 
      ? ['https://*.clonex.wtf', 'http://localhost:*'] 
      : ['*'],
    credentials: true
  }),
  ue5ContentTypeMiddleware(),
  ue5RateLimitMiddleware(100, 60000) // 100 requests per minute
);

/**
 * Protected route middleware (requires authentication)
 */
export const protectedUE5Middleware = composeMiddleware(
  defaultUE5Middleware,
  ue5AuthMiddleware({ required: true })
);

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Extract Bearer token from request headers
 */
function extractBearerToken(headers?: Record<string, string>): string | null {
  if (!headers) return null;

  const authHeader = headers.authorization || headers.Authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  return authHeader.substring(7);
}

/**
 * Create middleware for specific authentication requirements
 */
export const createAuthMiddleware = (options: UE5AuthOptions) => {
  return ue5AuthMiddleware(options);
};

/**
 * Create middleware for specific CORS requirements
 */
export const createCorsMiddleware = (options: Partial<UE5CorsOptions>) => {
  return ue5CorsMiddleware(options);
};