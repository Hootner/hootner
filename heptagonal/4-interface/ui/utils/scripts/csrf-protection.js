/**
 * CSRF Token Validation
 */

const CSRF = {
  token: null,

  init() {
    this.token =
      document.querySelector('meta[name="csrf-token"]')?.content ||
      this.generate();
    this.injectToken();
  },

  generate() {
    return Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  },

  injectToken() {
    document.querySelectorAll("form").forEach((form) => {
      if (!form.querySelector('input[name="csrf_token"]')) {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = "csrf_token";
        input.value = this.sanitizeToken(this.token);
        form.appendChild(input);
      }
    });
  },

  sanitizeToken(token) {
    if (!token || typeof token !== "string") return "";
    return token.replace(/[^a-zA-Z0-9]/g, "").substring(0, 64);
  },

  /**
   * Constant-time string comparison to prevent timing attacks (CWE-208 fix)
   */
  timingSafeEqual(a, b) {
    if (a.length !== b.length) {
      return false;
    }
    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    return result === 0;
  },

  validate(token) {
    const sanitizedToken = this.sanitizeToken(token);
    const sanitizedCurrentToken = this.sanitizeToken(this.token);

    if (sanitizedToken.length === 0 || sanitizedCurrentToken.length === 0) {
      return false;
    }

    // Use constant-time comparison to prevent timing attacks
    return this.timingSafeEqual(sanitizedToken, sanitizedCurrentToken);
  },

  getHeaders() {
    return { "X-CSRF-Token": this.sanitizeToken(this.token) };
  },
};

CSRF.init();
