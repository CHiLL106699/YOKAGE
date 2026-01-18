/**
 * LINE 整合設定 Router
 * 診所端自行設定 LINE Channel
 */

import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import {
  getLineChannelConfig,
  saveLineChannelConfig,
  verifyLineChannel,
  getLineChannelStatus,
  updateNotificationSettings,
  pushTextMessageToUser,
  pushFlexMessageToUser,
  broadcastMessageToAll,
  multicastMessageToUsers,
  getMessageQuotaForOrg,
  createAppointmentReminderFlex,
  createMarketingFlex,
} from "../services/lineIntegration";

export const lineSettingsRouter = router({
  // 取得 LINE Channel 設定狀態
  getStatus: protectedProcedure
    .input(z.object({ organizationId: z.number() }))
    .query(async ({ input }) => {
      return await getLineChannelStatus(input.organizationId);
    }),

  // 儲存 LINE Channel 設定
  saveConfig: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      channelId: z.string().optional(),
      channelSecret: z.string().optional(),
      channelAccessToken: z.string().min(1, "Channel Access Token 為必填"),
      liffId: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const { organizationId, ...config } = input;
      return await saveLineChannelConfig(organizationId, config);
    }),

  // 驗證 LINE Channel 憑證
  verifyChannel: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      accessToken: z.string().min(1),
    }))
    .mutation(async ({ input }) => {
      return await verifyLineChannel(input.organizationId, input.accessToken);
    }),

  // 更新通知設定
  updateNotificationSettings: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      notificationEnabled: z.boolean().optional(),
      appointmentReminderEnabled: z.boolean().optional(),
      marketingMessageEnabled: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const { organizationId, ...settings } = input;
      return await updateNotificationSettings(organizationId, settings);
    }),

  // 取得訊息配額
  getMessageQuota: protectedProcedure
    .input(z.object({ organizationId: z.number() }))
    .query(async ({ input }) => {
      return await getMessageQuotaForOrg(input.organizationId);
    }),

  // 發送文字訊息（多診所版本）
  sendTextMessage: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      userId: z.string(),
      message: z.string(),
    }))
    .mutation(async ({ input }) => {
      return await pushTextMessageToUser(input.organizationId, input.userId, input.message);
    }),

  // 發送 Flex Message（多診所版本）
  sendFlexMessage: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      userId: z.string(),
      altText: z.string(),
      contents: z.any(),
    }))
    .mutation(async ({ input }) => {
      return await pushFlexMessageToUser(input.organizationId, input.userId, input.altText, input.contents);
    }),

  // 廣播訊息（多診所版本）
  broadcast: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      message: z.string(),
    }))
    .mutation(async ({ input }) => {
      return await broadcastMessageToAll(input.organizationId, [{ type: 'text', text: input.message }]);
    }),

  // 多播訊息（多診所版本）
  multicast: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      userIds: z.array(z.string()),
      message: z.string(),
    }))
    .mutation(async ({ input }) => {
      return await multicastMessageToUsers(input.organizationId, input.userIds, [{ type: 'text', text: input.message }]);
    }),

  // 發送預約提醒
  sendAppointmentReminder: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      userId: z.string(),
      customerName: z.string(),
      appointmentDate: z.string(),
      appointmentTime: z.string(),
      serviceName: z.string(),
      staffName: z.string().optional(),
      clinicName: z.string(),
      clinicAddress: z.string().optional(),
      confirmUrl: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const { organizationId, userId, ...params } = input;
      const flexContent = createAppointmentReminderFlex(params);
      return await pushFlexMessageToUser(organizationId, userId, '預約提醒', flexContent);
    }),

  // 發送行銷訊息
  sendMarketingMessage: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      userId: z.string(),
      title: z.string(),
      subtitle: z.string().optional(),
      imageUrl: z.string().optional(),
      description: z.string(),
      buttonLabel: z.string(),
      buttonUrl: z.string(),
      clinicName: z.string(),
    }))
    .mutation(async ({ input }) => {
      const { organizationId, userId, ...params } = input;
      const flexContent = createMarketingFlex(params);
      return await pushFlexMessageToUser(organizationId, userId, params.title, flexContent);
    }),
});
