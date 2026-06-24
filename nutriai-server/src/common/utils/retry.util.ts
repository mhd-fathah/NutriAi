export interface RetryOptions {
  maxAttempts: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffFactor: number;
  useJitter: boolean;
}

export function isQuotaError(status: number | null, message: string = ''): boolean {
  if (status === 429) {
    return true;
  }
  const lowerMsg = message.toLowerCase();
  if (
    lowerMsg.includes('quota exceeded') ||
    lowerMsg.includes('too many requests') ||
    lowerMsg.includes('rate limit exceeded')
  ) {
    return true;
  }
  return false;
}

export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions,
  logger?: { warn: (msg: string) => void; error: (msg: string) => void },
  contextName = 'Retry',
): Promise<T> {
  const { maxAttempts, initialDelayMs, maxDelayMs, backoffFactor, useJitter } = options;
  let delay = initialDelayMs;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      const status = getErrorStatusCode(error);
      
      if (isQuotaError(status, error.message)) {
        if (logger) {
          logger.error(`[${contextName}] Quota/Rate Limit exceeded (Status: ${status}). Failing fast without retries.`);
        }
        error.isQuotaExceeded = true;
        throw error;
      }

      const isTransient = isTransientError(status, error.message);

      if (!isTransient || attempt === maxAttempts) {
        if (logger) {
          logger.error(`[${contextName}] Permanent error or exhausted attempts (Attempt ${attempt}/${maxAttempts}): ${error.message}`);
        }
        throw error;
      }

      // Check for specific retry delay in error (e.g. from Google API 429)
      let waitTime = delay;
      const parsedDelay = extractRetryDelay(error.message);
      if (parsedDelay !== null) {
        waitTime = parsedDelay;
        if (logger) {
          logger.warn(`[${contextName}] Extracted retry delay from error: ${waitTime}ms`);
        }
      } else {
        // Calculate exponential backoff
        waitTime = delay;
        delay = Math.min(delay * backoffFactor, maxDelayMs);
        if (useJitter) {
          // Full jitter formula: random between 0 and waitTime
          waitTime = Math.random() * waitTime;
        }
      }

      if (logger) {
        logger.warn(
          `[${contextName}] Attempt ${attempt} failed with ${status || 'unknown status'} (${error.message}). Retrying in ${Math.round(waitTime)}ms...`,
        );
      }

      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
  }
  throw new Error('Retry loop exited unexpectedly');
}

export function getErrorStatusCode(error: any): number | null {
  if (error.status) return error.status;
  // Parse status code from GoogleGenerativeAI Error message string like "[503 Service Unavailable]"
  const match = error.message?.match(/\[(\d{3})\s+[^\]]+\]/);
  if (match) {
    return parseInt(match[1], 10);
  }
  return null;
}

function isTransientError(status: number | null, message: string = ''): boolean {
  if (status === 503 || status === 408) {
    return true;
  }
  const lowerMsg = message.toLowerCase();
  if (
    lowerMsg.includes('high demand') ||
    lowerMsg.includes('timeout') ||
    lowerMsg.includes('service unavailable') ||
    lowerMsg.includes('econnreset') ||
    lowerMsg.includes('etimedout')
  ) {
    return true;
  }
  return false;
}

function extractRetryDelay(message: string): number | null {
  if (!message) return null;
  // Try to parse "Please retry in 57.630927953s."
  const secondsMatch = message.match(/Please retry in (\d+(\.\d+)?)s/i);
  if (secondsMatch) {
    return Math.ceil(parseFloat(secondsMatch[1]) * 1000);
  }
  // Try to parse JSON retryDelay e.g., "retryDelay":"57s" or "57.6s"
  const jsonMatch = message.match(/"retryDelay"\s*:\s*"(\d+(\.\d+)?)s"/);
  if (jsonMatch) {
    return Math.ceil(parseFloat(jsonMatch[1]) * 1000);
  }
  return null;
}
