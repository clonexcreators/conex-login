/**
 * Comprehensive WalletConnect Logger Shim
 * 
 * This shim provides all required exports for @walletconnect/logger
 * to prevent ESM import errors in the WebContainer environment.
 */

class Logger {
  constructor(name = 'unknown') {
    this.name = name;
    this.level = 'info';
    this.context = {};
  }

  setLevel(level) {
    this.level = level;
  }

  getLevel() {
    return this.level;
  }

  info(...args) {
    if (['debug', 'info', 'warn', 'error'].includes(this.level)) {
      console.info(`[${this.name}]`, ...args);
    }
  }

  warn(...args) {
    if (['warn', 'error'].includes(this.level)) {
      console.warn(`[${this.name}]`, ...args);
    }
  }

  error(...args) {
    if (['error'].includes(this.level)) {
      console.error(`[${this.name}]`, ...args);
    }
  }

  debug(...args) {
    if (['debug'].includes(this.level)) {
      console.debug(`[${this.name}]`, ...args);
    }
  }

  setContext(ctx) {
    this.context = { ...this.context, ...ctx };
  }

  getContext() {
    return this.context;
  }

  // Child logger methods (for compatibility)
  child(childName) {
    return generateChildLogger(this, childName);
  }
}

// Primary exports needed by WalletConnect
export const getDefaultLoggerOptions = () => {
  return {
    level: 'info',
    enabled: true
  };
};

export const createLogger = (name) => {
  return new Logger(name);
};

// Pino-like logger factory function
export const pino = (opts = {}) => {
  const logger = new Logger(opts.name || 'walletconnect');
  logger.setLevel(opts.level || 'info');
  return logger;
};

// Generate a child logger with parent context
export const generateChildLogger = (logger, childName) => {
  const child = new Logger(`${logger.name}:${childName}`);
  child.setLevel(logger.getLevel());
  child.setContext(logger.getContext());
  return child;
};

// Get the logger context object
export const getLoggerContext = (logger) => {
  return logger.getContext ? logger.getContext() : {};
};

// Generate a platform-specific logger
export const generatePlatformLogger = (name) => {
  return new Logger(name);
};

// Default export to support both named and default imports
export default {
  getDefaultLoggerOptions,
  createLogger,
  pino,
  generateChildLogger,
  getLoggerContext,
  generatePlatformLogger
};