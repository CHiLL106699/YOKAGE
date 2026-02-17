/**
 * Sprint 5: FLOS 功能整合 - Lazy Route Exports
 * 所有頁面使用 React.lazy + Suspense 載入
 * 
 * 使用方式：在 App.tsx 中引入此檔案的 Sprint5Routes 元件
 * 或直接引入個別的 lazy 元件
 */
import React, { Suspense } from 'react';
import { Route, Switch } from 'wouter';

// Lazy-loaded page components
export const ConsentTemplatePage = React.lazy(() => import('./dashboard/ConsentTemplatePage'));
export const ConsentSignPage = React.lazy(() => import('./dashboard/ConsentSignPage'));
export const ConsentRecordsPage = React.lazy(() => import('./dashboard/ConsentRecordsPage'));
export const EmrListPage = React.lazy(() => import('./dashboard/EmrListPage'));
export const EmrDetailPage = React.lazy(() => import('./dashboard/EmrDetailPage'));
export const EmrFormPage = React.lazy(() => import('./dashboard/EmrFormPage'));
export const StaffClockEnhanced = React.lazy(() => import('./staff/StaffClockEnhanced'));
export const AttendanceCalendarPage = React.lazy(() => import('./staff/AttendanceCalendarPage'));
export const AttendanceRequestPage = React.lazy(() => import('./staff/AttendanceRequestPage'));

/** Loading fallback */
function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-[40vh]">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">載入中...</p>
      </div>
    </div>
  );
}

/**
 * Sprint 5 Routes 元件
 * 可直接嵌入 App.tsx 的 Switch 中
 * 或作為獨立的 route group 使用
 */
export function Sprint5Routes() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Switch>
        {/* 知情同意書模組 */}
        <Route path="/dashboard/consent-templates" component={ConsentTemplatePage} />
        <Route path="/dashboard/consent-sign" component={ConsentSignPage} />
        <Route path="/dashboard/consent-records" component={ConsentRecordsPage} />

        {/* EMR 電子病歷模組 */}
        <Route path="/dashboard/emr" component={EmrListPage} />
        <Route path="/dashboard/emr/new" component={EmrFormPage} />
        <Route path="/dashboard/emr/edit/:id" component={EmrFormPage} />
        <Route path="/dashboard/emr/:id" component={EmrDetailPage} />

        {/* 智慧打卡模組 */}
        <Route path="/staff/clock" component={StaffClockEnhanced} />
        <Route path="/staff/attendance" component={AttendanceCalendarPage} />
        <Route path="/staff/attendance-request" component={AttendanceRequestPage} />
      </Switch>
    </Suspense>
  );
}

export default Sprint5Routes;
