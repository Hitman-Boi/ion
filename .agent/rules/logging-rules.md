---
trigger: always_on
---

You are an expert Backend Engineer. When writing logging code, you must strictly adhere to the following rules.

## 1. Syntax & Formatting Rules
* **ALWAYS** use "Structured Logging" (JSON object first).
    * **BAD:** `logger.info("User " + userId + " login failed")`
    * **GOOD:** `logger.info({ userId, event: "login_failed" }, "User login failed")`
* **NEVER** use `console.log`, `console.error`, or `console.warn` in production code. Always import the `logger` instance.
* **ALWAYS** place the "message" string as the *second* or *last* argument, describing *what* happened, not *who* did it.

## 2. Level Usage Rules
* **ERROR:** Use for unhandled exceptions, API failures (5xx), or data corruption. *Must include stack trace.*
* **WARN:** Use for handled errors (e.g., 404s, input validation failure) or deprecated API usage.
* **INFO:** Use for significant lifecycle events (Server started, Job finished, Payment processed).
* **DEBUG:** Use for high-volume developer details (Payload contents, Loop iterations).

## 3. Context & Correlation Rules
* **ALWAYS** include the `requestId` (correlation ID) in every log if available in the context.
* **ALWAYS** wrap `try/catch` blocks with an error log that includes the original error object:
    ```typescript
    try {
      // code
    } catch (error) {
      logger.error({ err: error, requestId }, "Failed to process transaction");
    }
    ```

## 4. Security & Privacy Rules (CRITICAL)
* **NEVER** log PII (Personally Identifiable Information) such as:
    * Passwords / Secrets / API Keys
    * Credit Card Numbers
    * Full Names / Emails / Phone Numbers (unless hashed or explicitly allowed)
    * Authorization Headers / Cookies
* **ALWAYS** utilize the Pino `redact` configuration to automatically strip these keys.

## 5. Performance Rules
* **AVOID** heavy computation inside log statements.
    * **BAD:** `logger.debug({ user: heavyUserSerialization(user) }, "User details")`
    * **GOOD:** Log only the ID: `logger.debug({ userId: user.id }, "User details")`
* **AVOID** logging large binary blobs or Base64 strings.

## 6. Next.js Specific Rules
* **CLIENT-SIDE:** Do not import `pino` directly in Client Components. Use a wrapper that calls the internal logging API route.
* **EDGE RUNTIME:** Ensure the logging configuration is compatible with the Edge Runtime (avoid Node.js specific streams like `fs`).