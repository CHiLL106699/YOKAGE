import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  notificationTemplates,
  renderTemplate,
  getTemplate,
  getAllTemplates,
  sendNotification,
  sendBulkNotifications,
  sendMultiChannelNotification,
  getNotificationHistory,
  getNotificationStats,
  type NotificationPayload,
  type NotificationRecipient,
} from "./_core/notificationService";

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("Notification Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Template Management", () => {
    describe("getTemplate", () => {
      it("should return template by id", () => {
        const template = getTemplate("appointment_confirmation");
        expect(template).toBeDefined();
        expect(template?.id).toBe("appointment_confirmation");
        expect(template?.name).toBe("預約確認");
      });

      it("should return undefined for non-existent template", () => {
        const template = getTemplate("non_existent");
        expect(template).toBeUndefined();
      });
    });

    describe("getAllTemplates", () => {
      it("should return all templates", () => {
        const templates = getAllTemplates();
        expect(templates.length).toBeGreaterThan(0);
        expect(templates.some(t => t.id === "appointment_confirmation")).toBe(true);
        expect(templates.some(t => t.id === "birthday_greeting")).toBe(true);
      });
    });

    describe("renderTemplate", () => {
      it("should render template with variables", () => {
        const template = notificationTemplates.appointment_confirmation;
        const data = {
          customerName: "王小明",
          appointmentDate: "2024-01-20",
          appointmentTime: "14:00",
          serviceName: "玻尿酸填充",
          staffName: "陳醫師",
        };

        const result = renderTemplate(template, data);

        expect(result.title).toBe("預約確認通知");
        expect(result.content).toContain("王小明");
        expect(result.content).toContain("2024-01-20");
        expect(result.content).toContain("14:00");
        expect(result.content).toContain("玻尿酸填充");
        expect(result.content).toContain("陳醫師");
        expect(result.subject).toBe("【YOChiLL】您的預約已確認");
      });

      it("should render SMS template", () => {
        const template = notificationTemplates.appointment_reminder;
        const data = {
          customerName: "李小華",
          appointmentTime: "10:30",
          serviceName: "皮秒雷射",
        };

        const result = renderTemplate(template, data);

        expect(result.content).toContain("李小華");
        expect(result.content).toContain("10:30");
        expect(result.content).toContain("皮秒雷射");
      });

      it("should handle missing variables gracefully", () => {
        const template = notificationTemplates.appointment_confirmation;
        const data = {
          customerName: "測試用戶",
        };

        const result = renderTemplate(template, data);

        expect(result.content).toContain("測試用戶");
        // Missing variables remain as placeholders
        expect(result.content).toContain("{{appointmentDate}}");
      });
    });
  });

  describe("Notification Sending", () => {
    describe("sendNotification", () => {
      it("should handle system notification", async () => {
        const payload: NotificationPayload = {
          channel: "system",
          recipient: { id: 1, name: "測試用戶" },
          title: "系統通知",
          content: "這是一則系統通知",
        };

        const result = await sendNotification(payload);

        expect(result.success).toBe(true);
        expect(result.channel).toBe("system");
        expect(result.sentAt).toBeDefined();
      });

      it("should handle push notification (not implemented)", async () => {
        const payload: NotificationPayload = {
          channel: "push",
          recipient: { id: 1, name: "測試用戶" },
          title: "推播通知",
          content: "這是一則推播通知",
        };

        const result = await sendNotification(payload);

        expect(result.success).toBe(false);
        expect(result.channel).toBe("push");
        expect(result.error).toContain("尚未實作");
      });

      it("should fail email without recipient email", async () => {
        const payload: NotificationPayload = {
          channel: "email",
          recipient: { id: 1, name: "測試用戶" },
          title: "Email 通知",
          content: "這是一則 Email 通知",
        };

        const result = await sendNotification(payload);

        expect(result.success).toBe(false);
        expect(result.error).toContain("Email 未設定");
      });

      it("should fail SMS without recipient phone", async () => {
        const payload: NotificationPayload = {
          channel: "sms",
          recipient: { id: 1, name: "測試用戶" },
          title: "SMS 通知",
          content: "這是一則 SMS 通知",
        };

        const result = await sendNotification(payload);

        expect(result.success).toBe(false);
        expect(result.error).toContain("電話未設定");
      });

      it("should use template when templateId is provided", async () => {
        const payload: NotificationPayload = {
          channel: "system",
          recipient: { id: 1, name: "測試用戶" },
          title: "",
          content: "",
          templateId: "birthday_greeting",
          templateData: {
            customerName: "王小明",
            birthdayOffer: "9折優惠",
            offerExpiry: "2024-02-01",
          },
        };

        const result = await sendNotification(payload);

        expect(result.success).toBe(true);
      });
    });

    describe("sendBulkNotifications", () => {
      it("should send multiple notifications", async () => {
        const payloads: NotificationPayload[] = [
          {
            channel: "system",
            recipient: { id: 1, name: "用戶1" },
            title: "通知1",
            content: "內容1",
          },
          {
            channel: "system",
            recipient: { id: 2, name: "用戶2" },
            title: "通知2",
            content: "內容2",
          },
        ];

        const results = await sendBulkNotifications(payloads);

        expect(results.length).toBe(2);
        expect(results[0].success).toBe(true);
        expect(results[1].success).toBe(true);
      });
    });

    describe("sendMultiChannelNotification", () => {
      it("should send to multiple channels", async () => {
        const recipient: NotificationRecipient = {
          id: 1,
          name: "測試用戶",
        };

        const results = await sendMultiChannelNotification(
          ["system"],
          recipient,
          "多渠道通知",
          "這是一則多渠道通知"
        );

        expect(results.length).toBe(1);
        expect(results[0].success).toBe(true);
      });
    });
  });

  describe("Notification History", () => {
    describe("getNotificationHistory", () => {
      it("should return notification history", () => {
        const history = getNotificationHistory({ limit: 10 });
        expect(Array.isArray(history)).toBe(true);
      });

      it("should filter by channel", () => {
        const history = getNotificationHistory({ channel: "email" });
        history.forEach(entry => {
          expect(entry.payload.channel).toBe("email");
        });
      });
    });

    describe("getNotificationStats", () => {
      it("should return notification statistics", () => {
        const stats = getNotificationStats();
        expect(stats).toHaveProperty("total");
        expect(stats).toHaveProperty("byChannel");
        expect(stats).toHaveProperty("successRate");
        expect(typeof stats.total).toBe("number");
        expect(typeof stats.successRate).toBe("number");
      });
    });
  });

  describe("Template Validation", () => {
    it("all templates should have required fields", () => {
      const templates = getAllTemplates();
      
      templates.forEach(template => {
        expect(template.id).toBeDefined();
        expect(template.name).toBeDefined();
        expect(template.channel).toBeDefined();
        expect(template.titleTemplate).toBeDefined();
        expect(template.contentTemplate).toBeDefined();
        expect(Array.isArray(template.variables)).toBe(true);
      });
    });

    it("all template variables should be present in content", () => {
      const templates = getAllTemplates();
      
      templates.forEach(template => {
        template.variables.forEach(variable => {
          const placeholder = `{{${variable}}}`;
          const inTitle = template.titleTemplate.includes(placeholder);
          const inContent = template.contentTemplate.includes(placeholder);
          const inSubject = template.subject?.includes(placeholder) ?? false;
          
          expect(inTitle || inContent || inSubject).toBe(true);
        });
      });
    });
  });
});
