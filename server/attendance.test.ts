import { describe, it, expect, beforeEach } from 'vitest';
import { appRouter } from './routers';
import type { TrpcContext } from './_core/context';

/**
 * 智慧打卡系統單元測試
 */

// Mock context
const mockContext: TrpcContext = {
  user: {
    id: 1,
    openId: 'test-open-id',
    name: '測試管理員',
    email: 'admin@test.com',
    role: 'super_admin',
    avatarUrl: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  req: {} as any,
  res: {} as any,
};

describe('Attendance Router', () => {
  const caller = appRouter.createCaller(mockContext);
  const testOrganizationId = 60001; // 伊美秘書測試診所
  
  // 使用不同的員工 ID 避免資料衝突
  const getUniqueStaffId = () => Math.floor(Math.random() * 1000) + 1000;

  describe('getTodayStatus', () => {
    it('應該回傳今日打卡狀態', async () => {
      const staffId = getUniqueStaffId();
      const result = await caller.attendance.getTodayStatus({
        organizationId: testOrganizationId,
        staffId,
      });

      expect(result).toHaveProperty('hasClockedIn');
      expect(result).toHaveProperty('hasClockedOut');
      expect(typeof result.hasClockedIn).toBe('boolean');
      expect(typeof result.hasClockedOut).toBe('boolean');
    });
  });

  describe('clockIn', () => {
    it('應該成功上班打卡', async () => {
      const staffId = getUniqueStaffId();
      const result = await caller.attendance.clockIn({
        organizationId: testOrganizationId,
        staffId,
        latitude: 25.0330,
        longitude: 121.5654,
        accuracy: 10,
        address: '台北市信義區',
      });

      expect(result).toHaveProperty('success');
      expect(result.success).toBe(true);
      expect(result).toHaveProperty('record');
    });

    it('應該拒絕重複上班打卡', async () => {
      const staffId = getUniqueStaffId();
      // 第一次打卡
      await caller.attendance.clockIn({
        organizationId: testOrganizationId,
        staffId,
        latitude: 25.0330,
        longitude: 121.5654,
      });

      // 第二次打卡應該失敗
      await expect(
        caller.attendance.clockIn({
          organizationId: testOrganizationId,
          staffId,
          latitude: 25.0330,
          longitude: 121.5654,
        })
      ).rejects.toThrow('今日已打上班卡');
    });
  });

  describe('clockOut', () => {
    it('應該成功下班打卡', async () => {
      const staffId = getUniqueStaffId();
      // 先上班打卡
      await caller.attendance.clockIn({
        organizationId: testOrganizationId,
        staffId,
        latitude: 25.0330,
        longitude: 121.5654,
      });

      // 下班打卡
      const result = await caller.attendance.clockOut({
        organizationId: testOrganizationId,
        staffId,
        latitude: 25.0330,
        longitude: 121.5654,
        accuracy: 10,
        address: '台北市信義區',
      });

      expect(result).toHaveProperty('success');
      expect(result.success).toBe(true);
      expect(result).toHaveProperty('record');
    });

    it('應該拒絕未上班打卡就下班打卡', async () => {
      await expect(
        caller.attendance.clockOut({
          organizationId: testOrganizationId,
          staffId: 999, // 不存在的員工
          latitude: 25.0330,
          longitude: 121.5654,
        })
      ).rejects.toThrow('今日尚未打上班卡');
    });
  });

  describe('requestCorrection', () => {
    it('應該成功提交補登申請', async () => {
      const staffId = getUniqueStaffId();
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const result = await caller.attendance.requestCorrection({
        organizationId: testOrganizationId,
        staffId,
        recordDate: yesterday,
        clockIn: `${yesterday}T09:00:00`,
        clockOut: `${yesterday}T18:00:00`,
        reason: '忘記打卡',
      });

      expect(result).toHaveProperty('success');
      expect(result.success).toBe(true);
      expect(result).toHaveProperty('recordId');
    });

    it('應該拒絕重複補登同一天', async () => {
      const staffId = getUniqueStaffId();
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      // 第一次補登
      await caller.attendance.requestCorrection({
        organizationId: testOrganizationId,
        staffId,
        recordDate: yesterday,
        clockIn: `${yesterday}T09:00:00`,
        reason: '忘記打卡',
      });

      // 第二次補登應該失敗
      await expect(
        caller.attendance.requestCorrection({
          organizationId: testOrganizationId,
          staffId,
          recordDate: yesterday,
          clockIn: `${yesterday}T09:00:00`,
          reason: '忘記打卡',
        })
      ).rejects.toThrow('該日期已有打卡記錄');
    });
  });

  describe('approveCorrection', () => {
    it('應該成功核准補登申請', async () => {
      const staffId = getUniqueStaffId();
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      // 提交補登申請
      const correctionResult = await caller.attendance.requestCorrection({
        organizationId: testOrganizationId,
        staffId,
        recordDate: yesterday,
        clockIn: `${yesterday}T09:00:00`,
        reason: '忘記打卡',
      });

      // 核准補登申請
      const result = await caller.attendance.approveCorrection({
        recordId: correctionResult.recordId,
        approved: true,
        approverId: 1,
      });

      expect(result).toHaveProperty('success');
      expect(result.success).toBe(true);
    });

    it('應該成功拒絕補登申請', async () => {
      const staffId = getUniqueStaffId();
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      // 提交補登申請
      const correctionResult = await caller.attendance.requestCorrection({
        organizationId: testOrganizationId,
        staffId,
        recordDate: yesterday,
        clockIn: `${yesterday}T09:00:00`,
        reason: '忘記打卡',
      });

      // 拒絕補登申請
      const result = await caller.attendance.approveCorrection({
        recordId: correctionResult.recordId,
        approved: false,
        approverId: 1,
      });

      expect(result).toHaveProperty('success');
      expect(result.success).toBe(true);
    });
  });

  describe('listRecords', () => {
    it('應該回傳出勤記錄列表', async () => {
      const today = new Date().toISOString().split('T')[0];
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const result = await caller.attendance.listRecords({
        organizationId: testOrganizationId,
        startDate: sevenDaysAgo,
        endDate: today,
      });

      expect(Array.isArray(result)).toBe(true);
    });

    it('應該支援員工篩選', async () => {
      const staffId = getUniqueStaffId();
      const today = new Date().toISOString().split('T')[0];

      const result = await caller.attendance.listRecords({
        organizationId: testOrganizationId,
        staffId,
        startDate: today,
        endDate: today,
      });

      expect(Array.isArray(result)).toBe(true);
      result.forEach((record) => {
        expect(record.staffId).toBe(testStaffId);
      });
    });

    it('應該支援審核狀態篩選', async () => {
      const result = await caller.attendance.listRecords({
        organizationId: testOrganizationId,
        approvalStatus: 'pending',
      });

      expect(Array.isArray(result)).toBe(true);
      result.forEach((record) => {
        expect(record.approvalStatus).toBe('pending');
      });
    });
  });
});
