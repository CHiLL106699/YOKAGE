import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { appRouter } from './routers';
import { getDb } from './db';
import { leaveRequests } from '../drizzle/schema';
import { eq } from 'drizzle-orm';

describe('Leave Management Router', () => {
  const mockContext = {
    user: {
      id: 1,
      openId: 'test-staff-001',
      name: 'Test Staff',
      role: 'staff' as const,
    },
    req: {} as any,
    res: {} as any,
  };

  const mockAdminContext = {
    user: {
      id: 2,
      openId: 'test-admin-001',
      name: 'Test Admin',
      role: 'super_admin' as const,
    },
    req: {} as any,
    res: {} as any,
  };

  const testClinicId = 'test-clinic-001';
  let testLeaveId: string;

  beforeAll(async () => {
    // 清理測試資料
    const db = await getDb();
    if (db) {
      await db.delete(leaveRequests).where(eq(leaveRequests.clinicId, testClinicId));
    }
  });

  afterAll(async () => {
    // 清理測試資料
    const db = await getDb();
    if (db) {
      await db.delete(leaveRequests).where(eq(leaveRequests.clinicId, testClinicId));
    }
  });

  describe('submitLeaveRequest', () => {
    it('should submit a leave request successfully', async () => {
      const caller = appRouter.createCaller(mockContext);

      const result = await caller.leaveManagement.submitLeaveRequest({
        clinicId: testClinicId,
        leaveType: '病假',
        startDate: '2026-02-01T09:00:00Z',
        endDate: '2026-02-03T18:00:00Z',
        reason: '感冒需要休息',
      });

      expect(result.success).toBe(true);
      expect(result.leave).toBeDefined();
      expect(result.leave?.leaveType).toBe('病假');
      expect(result.leave?.status).toBe('pending');

      testLeaveId = result.leave!.id;
    });

    it('should submit a leave request without reason', async () => {
      const caller = appRouter.createCaller(mockContext);

      const result = await caller.leaveManagement.submitLeaveRequest({
        clinicId: testClinicId,
        leaveType: '特休',
        startDate: '2026-03-01T09:00:00Z',
        endDate: '2026-03-02T18:00:00Z',
      });

      expect(result.success).toBe(true);
      expect(result.leave?.leaveType).toBe('特休');
    });
  });

  describe('getMyLeaveRequests', () => {
    it('should get my leave requests', async () => {
      const caller = appRouter.createCaller(mockContext);

      const leaves = await caller.leaveManagement.getMyLeaveRequests({
        clinicId: testClinicId,
      });

      expect(leaves.length).toBeGreaterThan(0);
      expect(leaves[0].staffId).toBe(mockContext.user.openId);
    });

    it('should filter leave requests by status', async () => {
      const caller = appRouter.createCaller(mockContext);

      const pendingLeaves = await caller.leaveManagement.getMyLeaveRequests({
        clinicId: testClinicId,
        status: 'pending',
      });

      expect(pendingLeaves.every((leave) => leave.status === 'pending')).toBe(true);
    });
  });

  describe('getPendingLeaveRequests', () => {
    it('should get pending leave requests for admin', async () => {
      const caller = appRouter.createCaller(mockAdminContext);

      const pendingLeaves = await caller.leaveManagement.getPendingLeaveRequests({
        clinicId: testClinicId,
      });

      expect(pendingLeaves.length).toBeGreaterThan(0);
      expect(pendingLeaves.every((leave) => leave.status === 'pending')).toBe(true);
    });

    it('should throw error for non-admin users', async () => {
      const caller = appRouter.createCaller(mockContext);

      await expect(
        caller.leaveManagement.getPendingLeaveRequests({
          clinicId: testClinicId,
        })
      ).rejects.toThrow();
    });
  });

  describe('approveLeaveRequest', () => {
    it('should approve a leave request', async () => {
      const caller = appRouter.createCaller(mockAdminContext);

      const result = await caller.leaveManagement.approveLeaveRequest({
        leaveId: testLeaveId,
        reviewNote: '批准休假',
      });

      expect(result.success).toBe(true);
      expect(result.leave?.status).toBe('approved');
      expect(result.leave?.reviewerId).toBe(mockAdminContext.user.openId);
      expect(result.leave?.reviewNote).toBe('批准休假');
    });

    it('should throw error for non-admin users', async () => {
      const caller = appRouter.createCaller(mockContext);

      await expect(
        caller.leaveManagement.approveLeaveRequest({
          leaveId: testLeaveId,
        })
      ).rejects.toThrow();
    });
  });

  describe('rejectLeaveRequest', () => {
    it('should reject a leave request', async () => {
      // 先建立一個新的請假申請
      const caller = appRouter.createCaller(mockContext);
      const newLeave = await caller.leaveManagement.submitLeaveRequest({
        clinicId: testClinicId,
        leaveType: '事假',
        startDate: '2026-04-01T09:00:00Z',
        endDate: '2026-04-01T18:00:00Z',
        reason: '私人事務',
      });

      // 管理員拒絕請假
      const adminCaller = appRouter.createCaller(mockAdminContext);
      const result = await adminCaller.leaveManagement.rejectLeaveRequest({
        leaveId: newLeave.leave!.id,
        reviewNote: '人力不足，無法批准',
      });

      expect(result.success).toBe(true);
      expect(result.leave?.status).toBe('rejected');
      expect(result.leave?.reviewNote).toBe('人力不足，無法批准');
    });
  });

  describe('getLeaveStatistics', () => {
    it('should get leave statistics for current year', async () => {
      const caller = appRouter.createCaller(mockContext);

      const stats = await caller.leaveManagement.getLeaveStatistics({
        clinicId: testClinicId,
        year: 2026,
      });

      expect(stats).toBeDefined();
      expect(stats.totalLeaves).toBeGreaterThan(0);
      expect(stats.totalDays).toBeGreaterThan(0);
      expect(stats.statistics).toBeDefined();
    });

    it('should get leave statistics for specific month', async () => {
      const caller = appRouter.createCaller(mockContext);

      const stats = await caller.leaveManagement.getLeaveStatistics({
        clinicId: testClinicId,
        year: 2026,
        month: 2,
      });

      expect(stats).toBeDefined();
    });
  });

  describe('getAllLeaveRequests', () => {
    it('should get all leave requests for admin', async () => {
      const caller = appRouter.createCaller(mockAdminContext);

      const leaves = await caller.leaveManagement.getAllLeaveRequests({
        clinicId: testClinicId,
      });

      expect(leaves.length).toBeGreaterThan(0);
    });

    it('should filter all leave requests by status', async () => {
      const caller = appRouter.createCaller(mockAdminContext);

      const approvedLeaves = await caller.leaveManagement.getAllLeaveRequests({
        clinicId: testClinicId,
        status: 'approved',
      });

      expect(approvedLeaves.every((leave) => leave.status === 'approved')).toBe(true);
    });
  });
});
