import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { appRouter } from './routers';

const mockContext = {
  user: {
    id: 1,
    openId: 'test-openid',
    name: 'Test User',
    role: 'super_admin' as const,
  },
  req: {} as any,
  res: {} as any,
};

describe('Attendance addStaffNote API', () => {
  const caller = appRouter.createCaller(mockContext);
  const testOrganizationId = 60001; // 伊美秘書測試診所
  const getUniqueStaffId = () => Math.floor(Math.random() * 1000) + 1000;

  it('應該成功新增員工備註', async () => {
    const staffId = getUniqueStaffId();
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // 先建立一筆補登記錄
    const correctionResult = await caller.attendance.requestCorrection({
      organizationId: testOrganizationId,
      staffId,
      recordDate: yesterday,
      clockIn: `${yesterday}T09:00:00`,
      reason: '忘記打卡',
    });

    expect(correctionResult.recordId).toBeDefined();

    // 新增員工備註
    const result = await caller.attendance.addStaffNote({
      recordId: correctionResult.recordId!,
      staffNote: '交通延誤，已提前告知主管',
    });

    expect(result).toHaveProperty('success');
    expect(result.success).toBe(true);
    expect(result.message).toBe('備註已更新');
  });

  it('應該成功編輯已存在的員工備註', async () => {
    const staffId = getUniqueStaffId();
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // 先建立一筆補登記錄
    const correctionResult = await caller.attendance.requestCorrection({
      organizationId: testOrganizationId,
      staffId,
      recordDate: yesterday,
      clockIn: `${yesterday}T09:00:00`,
      reason: '忘記打卡',
    });

    // 第一次新增備註
    await caller.attendance.addStaffNote({
      recordId: correctionResult.recordId!,
      staffNote: '第一次備註',
    });

    // 第二次編輯備註
    const result = await caller.attendance.addStaffNote({
      recordId: correctionResult.recordId!,
      staffNote: '第二次備註（已更新）',
    });

    expect(result.success).toBe(true);
  });

  it('應該拒絕空白備註', async () => {
    const staffId = getUniqueStaffId();
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // 先建立一筆補登記錄
    const correctionResult = await caller.attendance.requestCorrection({
      organizationId: testOrganizationId,
      staffId,
      recordDate: yesterday,
      clockIn: `${yesterday}T09:00:00`,
      reason: '忘記打卡',
    });

    // 嘗試新增空白備註
    await expect(
      caller.attendance.addStaffNote({
        recordId: correctionResult.recordId!,
        staffNote: '',
      })
    ).rejects.toThrow('備註不能為空');
  });

  it('應該拒絕不存在的記錄 ID', async () => {
    await expect(
      caller.attendance.addStaffNote({
        recordId: 999999,
        staffNote: '測試備註',
      })
    ).rejects.toThrow('找不到該出勤記錄');
  });
});
