/**
 * @walletconnect/logger shim (ESM)
 * Provides all expected exports for use in Vite/ESBuild-based environments.
 * Supports both named and default imports to fully mock the real logger module.
 */

class Logger {
  constructor(name = 'unknown') {
    this.name = name;
    this.level = 'info';
    this.context = {};
  }

  /** Set the logging level */
  setLevel(level) {
    this.level = level;
  }

  /** Get the current logging level */
  getLevel() {
    return this.level;
  }

  /** Log info messages */
  info(...args) {
    if (['debug', 'info', 'warn', 'error'].includes(this.level)) {
      console.info(`[${this.name}]`, ...args);
    }
  }

  /** Log warnings */
  warn(...args) {
    if (['warn', 'error'].includes(this.level)) {
      console.warn(`[${this.name}]`, ...args);
    }
  }

  /** Log errors */
  error(...args) {
    if (['error'].includes(this.level)) {
      console.error(`[${this.name}]`, ...args);
    }
  }

  /** Log debug messages */
  debug(...args) {
    if (['debug'].includes(this.level)) {
      console.debug(`[${this.name}]`, ...args);
    }
  }

  /** Merge new context into logger */
  setContext(ctx) {
    this.context = { ...this.context, ...ctx };
  }

  /** Retrieve current logger context */
  getContext() {
    return this.context;
  }

  /** Create a child logger inheriting context and level */
  child(childName) {
    return generateChildLogger(this, childName);
  }
}

/**
 * Return default logger options
 * @returns {{ level: string, enabled: boolean }}
 */
export const getDefaultLoggerOptions = () => ({
  level: 'info',
  enabled: true
});

/**
 * Create a logger instance with a given name
 * @param {string} name
 * @returns {Logger}
 */
export const createLogger = (name) => new Logger(name);

/**
 * Simulated `pino` logger interface
 * @param {object} [opts]
 * @returns {Logger}
 */
export const pino = (opts = {}) => {
  const logger = new Logger(opts.name || 'walletconnect');
  logger.setLevel(opts.level || 'info');
  return logger;
};

/**
 * Generate a child logger from a parent
 * @param {Logger} logger
 * @param {string} childName
 * @returns {Logger}
 */
export const generateChildLogger = (logger, childName) => {
  const child = new Logger(`${logger.name}:${childName}`);
  child.setLevel(logger.getLevel());
  child.setContext(logger.getContext());
  return child;
};

/**
 * Return the context of a logger
 * @param {Logger} logger
 * @returns {object}
 */
export const getLoggerContext = (logger) => {
  return logger.getContext ? logger.getContext() : {};
};

/**
 * Generate a platform-named logger (used in WalletConnect UI tools)
 * @param {string} name
 * @returns {Logger}
 */
export const generatePlatformLogger = (name) => new Logger(name);

/**
 * Default export for compatibility with both CJS and ESM imports
 */
export default {
  getDefaultLoggerOptions,
  createLogger,
  pino,
  generateChildLogger,
  getLoggerContext,
  generatePlatformLogger
};