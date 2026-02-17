#!/usr/bin/env python3
"""
Aggressive cleanup of remaining mock data in all files.
This script removes mock data blocks and replaces all remaining references.
"""
import re
import os

BASE = "/home/ubuntu/YOKAGE"

def read_file(path):
    with open(os.path.join(BASE, path), 'r') as f:
        return f.read()

def write_file(path, content):
    with open(os.path.join(BASE, path), 'w') as f:
        f.write(content)

def remove_block_between(content, start_pattern, end_patterns):
    """Remove a block of code starting from a pattern to matching end"""
    lines = content.split('\n')
    result = []
    skip = False
    depth = 0
    
    for line in lines:
        stripped = line.strip()
        
        if not skip and re.search(start_pattern, stripped):
            skip = True
            depth = 0
            # Count braces on this line
            for ch in stripped:
                if ch in '{[': depth += 1
                elif ch in '}]': depth -= 1
            if depth <= 0 and any(stripped.endswith(ep) for ep in end_patterns):
                skip = False
            continue
        
        if skip:
            for ch in stripped:
                if ch in '{[': depth += 1
                elif ch in '}]': depth -= 1
            if depth <= 0 and any(stripped.endswith(ep) for ep in end_patterns):
                skip = False
            continue
        
        result.append(line)
    
    return '\n'.join(result)

def process_file(filepath, block_patterns, replacements):
    """Process a single file: remove mock blocks and replace references"""
    content = read_file(filepath)
    
    for pattern in block_patterns:
        content = remove_block_between(content, pattern, [';', '];', '};', '}'])
    
    for old, new in replacements:
        content = content.replace(old, new)
    
    # Remove orphaned comment lines about mock data
    lines = content.split('\n')
    result = []
    for line in lines:
        stripped = line.strip()
        if stripped.startswith('//') and ('mock' in stripped.lower() or '模擬' in stripped):
            continue
        result.append(line)
    content = '\n'.join(result)
    
    write_file(filepath, content)
    mock_count = sum(1 for line in content.split('\n') if 'mock' in line.lower())
    print(f"  {filepath}: {mock_count} mock lines remaining")

# ============================================================
# Process each file
# ============================================================

print("=== Aggressive Mock Cleanup v2 ===\n")

# InventoryPage
process_file("client/src/pages/InventoryPage.tsx",
    [r'^const mockAlerts', r'^const mockMovements', r'^const mockCategories', r'^const mockSuppliers'],
    [
        ('mockAlerts', '([] as any[])'),
        ('mockMovements', '([] as any[])'),
        ('mockCategories', '([] as any[])'),
        ('mockSuppliers', '([] as any[])'),
    ])

# NotificationsPage
process_file("client/src/pages/NotificationsPage.tsx",
    [r'^const mockTemplates', r'^const mockLogs', r'^const mockScheduledTasks', r'^const mockNotificationSettings'],
    [
        ('mockLogs', 'notifications'),
        ('mockScheduledTasks', '([] as any[])'),
        ('mockTemplates', '([] as any[])'),
        ('mockNotificationSettings', 'notifSettings'),
    ])

# PaymentPage
process_file("client/src/pages/PaymentPage.tsx",
    [r'^const mockPendingOrders', r'^const mockPaymentRecords', r'^const mockPaymentMethods'],
    [
        ('mockPendingOrders', 'orderList'),
        ('mockPaymentRecords', 'transactions'),
        ('mockPaymentMethods', 'providers'),
        ('typeof mockPendingOrders[0]', 'any'),
        ('typeof mockPaymentRecords[0]', 'any'),
    ])

# WebhookPage
process_file("client/src/pages/WebhookPage.tsx",
    [r'^const mockWebhookRules', r'^const mockEventLogs', r'^const mockWebhookConfig'],
    [
        ('mockWebhookRules', 'webhookEvents'),
        ('mockEventLogs', 'webhookEvents'),
        ('mockWebhookConfig', '{}'),
        ('typeof mockWebhookRules[0]', 'any'),
    ])

# LineIntegrationPage
process_file("client/src/pages/LineIntegrationPage.tsx",
    [r'^const mockRichMenus', r'^const mockMessageTemplates'],
    [
        ('mockRichMenus', 'richMenus'),
        ('mockMessageTemplates', '([] as any[])'),
    ])

# DashboardReports
process_file("client/src/pages/dashboard/DashboardReports.tsx",
    [r'^const mockEmployeeData', r'^const mockRevenueData', r'^const mockAppointmentData', 
     r'^const mockCustomerData', r'^const mockDailyRevenue', r'^const mockMonthlyRevenue',
     r'^const mockServiceRevenue', r'^const mockStaffPerformance'],
    [
        ('mockEmployeeData.kpis.totalAppointments', 'String(apptStats?.totalAppointments ?? 0)'),
        ('mockEmployeeData.kpis.avgRating', 'String(apptStats?.avgRating ?? "-")'),
        ('mockEmployeeData.kpis.topPerformer', 'String(apptStats?.topPerformer ?? "-")'),
        ('mockEmployeeData.ranking', '(apptStats?.ranking ?? [])'),
        ('mockEmployeeData.appointments', '(apptStats?.appointments ?? [])'),
        ('mockEmployeeData.ratings', '(apptStats?.ratings ?? [])'),
        ('mockEmployeeData', '(apptStats ?? {} as any)'),
        ('mockRevenueData', 'revenueData'),
        ('mockAppointmentData', 'apptStats'),
        ('mockCustomerData', 'custStats'),
    ])

# DashboardSettings
process_file("client/src/pages/dashboard/DashboardSettings.tsx",
    [r'^const mockBusinessHours', r'^const mockServices', r'^const mockClinicInfo'],
    [
        ('typeof mockBusinessHours[0]', 'any'),
        ('typeof mockServices[0]', 'any'),
        ('mockBusinessHours', '([] as any[])'),
        ('mockServices', '([] as any[])'),
        ('mockClinicInfo', '(orgData ?? {} as any)'),
    ])

# DashboardCustomers
process_file("client/src/pages/dashboard/DashboardCustomers.tsx",
    [r'^const generateMockCustomers'],
    [
        ('generateMockCustomers()', 'customers'),
        ('generateMockCustomers', '(() => customers)'),
    ])

# DashboardMarketing
process_file("client/src/pages/dashboard/DashboardMarketing.tsx",
    [r'^const mockSegments', r'^const mockCampaignData'],
    [
        ('mockSegments', '(campaigns as any[])'),
        ('mockCampaignData', '(campaigns as any[])'),
    ])

# DashboardAppointments
process_file("client/src/pages/dashboard/DashboardAppointments.tsx",
    [r'^const mockAppointments', r'^const mockStaffList'],
    [
        ('mockAppointments', 'appointments'),
        ('mockStaffList', '(staffData?.data ?? [])'),
    ])

# DashboardSchedule
process_file("client/src/pages/dashboard/DashboardSchedule.tsx",
    [r'^const generateMockShifts', r'^const mockStaffList'],
    [
        ('generateMockShifts()', 'schedules'),
        ('generateMockShifts', '(() => schedules)'),
        ('mockStaffList', 'staffList'),
    ])

# DashboardStaff
process_file("client/src/pages/dashboard/DashboardStaff.tsx",
    [r'^const mockStaffData', r'^const mockDepartments'],
    [
        ('mockStaffData', 'staffList'),
        ('mockDepartments', '([] as any[])'),
    ])

print("\n=== Cleanup Complete ===")
