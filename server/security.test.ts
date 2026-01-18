import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  sanitizeHtml,
  sanitizeSql,
  sanitizeFilename,
  sanitizePath,
  sanitizeInput,
  isValidEmail,
  isValidTaiwanPhone,
  isValidUrl,
  isValidDate,
  isValidUuid,
  isPositiveInteger,
  maskEmail,
  maskPhone,
  maskIdNumber,
  maskCreditCard,
  maskName,
  maskAddress,
  detectSqlInjection,
  detectXss,
  detectPathTraversal,
  performSecurityCheck,
  checkPasswordStrength,
  generateSecureToken,
  generateVerificationCode,
} from "./_core/security";

describe("Security Module", () => {
  describe("Input Sanitization", () => {
    describe("sanitizeHtml", () => {
      it("should escape HTML special characters", () => {
        expect(sanitizeHtml("<script>alert('xss')</script>")).toBe(
          "&lt;script&gt;alert(&#x27;xss&#x27;)&lt;&#x2F;script&gt;"
        );
      });

      it("should escape quotes", () => {
        expect(sanitizeHtml('test "quoted" text')).toBe(
          "test &quot;quoted&quot; text"
        );
      });

      it("should handle empty string", () => {
        expect(sanitizeHtml("")).toBe("");
      });
    });

    describe("sanitizeSql", () => {
      it("should escape single quotes", () => {
        expect(sanitizeSql("O'Brien")).toBe("O''Brien");
      });

      it("should remove SQL comments", () => {
        expect(sanitizeSql("test -- comment")).toBe("test  comment");
      });

      it("should remove semicolons", () => {
        expect(sanitizeSql("test; DROP TABLE users")).toBe(
          "test DROP TABLE users"
        );
      });
    });

    describe("sanitizeFilename", () => {
      it("should remove special characters", () => {
        expect(sanitizeFilename("test<>file.txt")).toBe("test__file.txt");
      });

      it("should prevent directory traversal", () => {
        expect(sanitizeFilename("../../../etc/passwd")).toBe(
          "._._._etc_passwd"
        );
      });

      it("should limit filename length", () => {
        const longName = "a".repeat(300) + ".txt";
        expect(sanitizeFilename(longName).length).toBeLessThanOrEqual(255);
      });
    });

    describe("sanitizePath", () => {
      it("should remove directory traversal patterns", () => {
        expect(sanitizePath("../../../etc/passwd")).toBe("/etc/passwd");
      });

      it("should normalize double slashes", () => {
        expect(sanitizePath("path//to//file")).toBe("path/to/file");
      });
    });

    describe("sanitizeInput", () => {
      it("should trim whitespace by default", () => {
        expect(sanitizeInput("  test  ")).toBe("test");
      });

      it("should respect maxLength option", () => {
        expect(sanitizeInput("long text", { maxLength: 4 })).toBe("long");
      });

      it("should escape HTML by default", () => {
        expect(sanitizeInput("<script>")).toBe("&lt;script&gt;");
      });

      it("should allow HTML when specified", () => {
        expect(sanitizeInput("<b>bold</b>", { allowHtml: true })).toBe(
          "<b>bold</b>"
        );
      });
    });
  });

  describe("Validation", () => {
    describe("isValidEmail", () => {
      it("should accept valid emails", () => {
        expect(isValidEmail("test@example.com")).toBe(true);
        expect(isValidEmail("user.name@domain.co.jp")).toBe(true);
      });

      it("should reject invalid emails", () => {
        expect(isValidEmail("invalid")).toBe(false);
        expect(isValidEmail("@domain.com")).toBe(false);
        expect(isValidEmail("test@")).toBe(false);
      });
    });

    describe("isValidTaiwanPhone", () => {
      it("should accept valid Taiwan mobile numbers", () => {
        expect(isValidTaiwanPhone("0912345678")).toBe(true);
        expect(isValidTaiwanPhone("09-1234-5678")).toBe(true);
      });

      it("should reject invalid numbers", () => {
        expect(isValidTaiwanPhone("0812345678")).toBe(false);
        expect(isValidTaiwanPhone("091234567")).toBe(false);
      });
    });

    describe("isValidUrl", () => {
      it("should accept valid URLs", () => {
        expect(isValidUrl("https://example.com")).toBe(true);
        expect(isValidUrl("http://localhost:3000")).toBe(true);
      });

      it("should reject invalid URLs", () => {
        expect(isValidUrl("not-a-url")).toBe(false);
        expect(isValidUrl("")).toBe(false);
      });
    });

    describe("isValidDate", () => {
      it("should accept valid dates", () => {
        expect(isValidDate("2024-01-15")).toBe(true);
        expect(isValidDate("2023-12-31")).toBe(true);
      });

      it("should reject invalid dates", () => {
        expect(isValidDate("2024-13-01")).toBe(false);
        expect(isValidDate("01-15-2024")).toBe(false);
      });
    });

    describe("isValidUuid", () => {
      it("should accept valid UUIDs", () => {
        expect(isValidUuid("550e8400-e29b-41d4-a716-446655440000")).toBe(true);
      });

      it("should reject invalid UUIDs", () => {
        expect(isValidUuid("not-a-uuid")).toBe(false);
        expect(isValidUuid("550e8400-e29b-41d4-a716")).toBe(false);
      });
    });

    describe("isPositiveInteger", () => {
      it("should accept positive integers", () => {
        expect(isPositiveInteger(1)).toBe(true);
        expect(isPositiveInteger(100)).toBe(true);
      });

      it("should reject non-positive integers", () => {
        expect(isPositiveInteger(0)).toBe(false);
        expect(isPositiveInteger(-1)).toBe(false);
        expect(isPositiveInteger(1.5)).toBe(false);
        expect(isPositiveInteger("1")).toBe(false);
      });
    });
  });

  describe("Data Masking", () => {
    describe("maskEmail", () => {
      it("should mask email addresses", () => {
        expect(maskEmail("example@domain.com")).toBe("e***e@d***n.com");
        expect(maskEmail("ab@cd.com")).toBe("***@***.com");
      });
    });

    describe("maskPhone", () => {
      it("should mask phone numbers", () => {
        expect(maskPhone("0912345678")).toBe("0912***678");
        expect(maskPhone("09-1234-5678")).toBe("0912***678");
      });
    });

    describe("maskIdNumber", () => {
      it("should mask ID numbers", () => {
        expect(maskIdNumber("A123456789")).toBe("A12***789");
      });
    });

    describe("maskCreditCard", () => {
      it("should mask credit card numbers", () => {
        expect(maskCreditCard("4111111111111111")).toBe("****-****-****-1111");
        expect(maskCreditCard("4111-1111-1111-1111")).toBe(
          "****-****-****-1111"
        );
      });
    });

    describe("maskName", () => {
      it("should mask names", () => {
        expect(maskName("王小明")).toBe("王**");
        expect(maskName("張")).toBe("*");
      });
    });

    describe("maskAddress", () => {
      it("should mask addresses", () => {
        expect(maskAddress("台北市信義區信義路五段7號")).toBe("台北市信義區***");
      });
    });
  });

  describe("Security Detection", () => {
    describe("detectSqlInjection", () => {
      it("should detect SQL injection patterns", () => {
        expect(detectSqlInjection("' OR '1'='1")).toBe(true);
        expect(detectSqlInjection("SELECT * FROM users")).toBe(true);
        expect(detectSqlInjection("; DROP TABLE users")).toBe(true);
        expect(detectSqlInjection("test--")).toBe(true);
      });

      it("should not flag normal input", () => {
        expect(detectSqlInjection("normal text")).toBe(false);
        expect(detectSqlInjection("John's Bakery")).toBe(false);
      });
    });

    describe("detectXss", () => {
      it("should detect XSS patterns", () => {
        expect(detectXss("<script>alert('xss')</script>")).toBe(true);
        expect(detectXss("javascript:alert('xss')")).toBe(true);
        expect(detectXss('<img onerror="alert(1)">')).toBe(true);
      });

      it("should not flag normal input", () => {
        expect(detectXss("normal text")).toBe(false);
        expect(detectXss("1 < 2 and 3 > 2")).toBe(false);
      });
    });

    describe("detectPathTraversal", () => {
      it("should detect path traversal patterns", () => {
        expect(detectPathTraversal("../../../etc/passwd")).toBe(true);
        expect(detectPathTraversal("..\\..\\windows\\system32")).toBe(true);
        expect(detectPathTraversal("%2e%2e%2f")).toBe(true);
      });

      it("should not flag normal paths", () => {
        expect(detectPathTraversal("path/to/file")).toBe(false);
        expect(detectPathTraversal("file.txt")).toBe(false);
      });
    });

    describe("performSecurityCheck", () => {
      it("should detect multiple threats", () => {
        const result = performSecurityCheck(
          "<script>SELECT * FROM users</script>"
        );
        expect(result.safe).toBe(false);
        expect(result.threats).toContain("SQL Injection");
        expect(result.threats).toContain("XSS");
      });

      it("should pass safe input", () => {
        const result = performSecurityCheck("Hello, World!");
        expect(result.safe).toBe(true);
        expect(result.threats).toHaveLength(0);
      });
    });
  });

  describe("Password Security", () => {
    describe("checkPasswordStrength", () => {
      it("should give low score to weak passwords", () => {
        const result = checkPasswordStrength("123456");
        expect(result.score).toBeLessThan(3);
        expect(result.feedback.length).toBeGreaterThan(0);
      });

      it("should give high score to strong passwords", () => {
        const result = checkPasswordStrength("MyStr0ng!P@ssw0rd");
        expect(result.score).toBeGreaterThanOrEqual(5);
      });

      it("should reject common passwords", () => {
        const result = checkPasswordStrength("password");
        expect(result.score).toBe(0);
        expect(result.feedback).toContain(
          "密碼過於常見，請選擇更安全的密碼"
        );
      });
    });
  });

  describe("Token Generation", () => {
    describe("generateSecureToken", () => {
      it("should generate token of specified length", () => {
        const token = generateSecureToken(32);
        expect(token.length).toBe(32);
      });

      it("should generate unique tokens", () => {
        const tokens = new Set(
          Array.from({ length: 100 }, () => generateSecureToken())
        );
        expect(tokens.size).toBe(100);
      });
    });

    describe("generateVerificationCode", () => {
      it("should generate numeric code of specified length", () => {
        const code = generateVerificationCode(6);
        expect(code.length).toBe(6);
        expect(/^\d+$/.test(code)).toBe(true);
      });

      it("should generate unique codes", () => {
        const codes = new Set(
          Array.from({ length: 100 }, () => generateVerificationCode())
        );
        expect(codes.size).toBeGreaterThan(90); // Allow some collisions
      });
    });
  });
});
