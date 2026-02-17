/**
 * Sprint 5: FLOS 功能整合模組匯出
 * 包含知情同意書、EMR 強化、智慧打卡三大模組
 */
import { router } from '../../_core/trpc';
import { sprint5ConsentRouter } from './consentRouter';
import { sprint5EmrRouter } from './emrRouter';
import { sprint5AttendanceRouter } from './attendanceRouter';

export const sprint5Router = router({
  consent: sprint5ConsentRouter,
  emr: sprint5EmrRouter,
  attendance: sprint5AttendanceRouter,
});

export type Sprint5Router = typeof sprint5Router;
