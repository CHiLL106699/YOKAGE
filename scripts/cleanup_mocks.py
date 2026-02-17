#!/usr/bin/env python3
"""
Clean up remaining mock data references in all 17 pages.
Strategy: For each file, find mock data arrays/objects and replace references with tRPC data.
"""
import re
import os

BASE = "/home/ubuntu/YOKAGE"

def read_file(path):
    with open(os.path.join(BASE, path), 'r') as f:
        return f.read()

def write_file(path, content):
    full = os.path.join(BASE, path)
    with open(full, 'w') as f:
        f.write(content)

def find_mock_blocks(content):
    """Find and return positions of mock data blocks"""
    blocks = []
    lines = content.split('\n')
    i = 0
    while i < len(lines):
        line = lines[i].strip()
        # Detect mock data declarations
        if (line.startswith('const mock') or 
            line.startswith('// 模擬') or
            (line.startswith('const ') and ('Mock' in line or 'mock' in line))):
            start = i
            # Find the end of this block (matching braces/brackets)
            brace_count = 0
            bracket_count = 0
            found_start = False
            while i < len(lines):
                for ch in lines[i]:
                    if ch in '{[':
                        if ch == '{': brace_count += 1
                        else: bracket_count += 1
                        found_start = True
                    elif ch in '}]':
                        if ch == '}': brace_count -= 1
                        else: bracket_count -= 1
                if found_start and brace_count <= 0 and bracket_count <= 0:
                    # Check if line ends with ;
                    if lines[i].rstrip().endswith(';') or lines[i].rstrip().endswith(']'):
                        blocks.append((start, i))
                        break
                i += 1
        i += 1
    return blocks

def remove_mock_blocks(content, var_names_to_keep=None):
    """Remove mock data blocks but keep the variable names for replacement"""
    lines = content.split('\n')
    blocks = find_mock_blocks(content)
    
    # Remove blocks from bottom to top to preserve line numbers
    for start, end in reversed(blocks):
        # Extract variable name
        match = re.match(r'const (\w+)', lines[start].strip())
        if match:
            var_name = match.group(1)
            if var_names_to_keep and var_name in var_names_to_keep:
                continue
        
        # Check if it's a comment line
        if lines[start].strip().startswith('//'):
            # Also remove the next block if it's a mock
            pass
        
        del lines[start:end+1]
    
    return '\n'.join(lines)

def cleanup_file(filepath, replacements):
    """Clean up a file by removing mock data and replacing references"""
    content = read_file(filepath)
    original = content
    
    for old, new in replacements:
        content = content.replace(old, new)
    
    if content != original:
        write_file(filepath, content)
        mock_count = content.lower().count('mock')
        print(f"  Cleaned: {filepath} (remaining mock refs: {mock_count})")
    else:
        print(f"  No changes: {filepath}")

# ============================================================
# Per-file cleanup
# ============================================================

def cleanup_inventory():
    """InventoryPage.tsx - remove mock inventory data"""
    content = read_file("client/src/pages/InventoryPage.tsx")
    
    # Remove mock data blocks
    # Find "// 模擬庫存" or "const mockInventory" blocks
    lines = content.split('\n')
    new_lines = []
    skip_until_semicolon = False
    brace_depth = 0
    bracket_depth = 0
    in_mock_block = False
    
    for i, line in enumerate(lines):
        stripped = line.strip()
        
        # Detect start of mock block
        if not in_mock_block and (
            stripped.startswith('const mockInventory') or
            stripped.startswith('const mockTransactions') or
            stripped.startswith('const mockCategories') or
            stripped.startswith('const mockSuppliers') or
            stripped.startswith('// 模擬庫存') or
            stripped.startswith('// 模擬交易') or
            stripped.startswith('// 模擬分類') or
            (stripped.startswith('const ') and 'mock' in stripped.lower() and ('=' in stripped))
        ):
            in_mock_block = True
            brace_depth = 0
            bracket_depth = 0
            continue
        
        if in_mock_block:
            for ch in stripped:
                if ch == '{': brace_depth += 1
                elif ch == '}': brace_depth -= 1
                elif ch == '[': bracket_depth += 1
                elif ch == ']': bracket_depth -= 1
            
            if brace_depth <= 0 and bracket_depth <= 0 and (stripped.endswith(';') or stripped.endswith(']')):
                in_mock_block = False
            continue
        
        new_lines.append(line)
    
    content = '\n'.join(new_lines)
    
    # Replace references to mock variables
    content = content.replace('mockInventory', 'inventoryItems')
    content = content.replace('mockTransactions', 'transactions')
    content = content.replace('mockCategories', '[]')
    content = content.replace('mockSuppliers', '[]')
    
    # Remove useState that initializes with mock data
    content = re.sub(r'const \[items, setItems\] = useState\([^)]*\);', '// items from tRPC query', content)
    
    write_file("client/src/pages/InventoryPage.tsx", content)
    print(f"  Cleaned: InventoryPage.tsx")

def cleanup_line_integration():
    content = read_file("client/src/pages/LineIntegrationPage.tsx")
    
    lines = content.split('\n')
    new_lines = []
    in_mock = False
    depth = 0
    
    for line in lines:
        stripped = line.strip()
        if not in_mock and ('mockLineConfig' in stripped or 'mockWebhookEvents' in stripped) and 'const ' in stripped:
            in_mock = True
            depth = 0
            continue
        if in_mock:
            for ch in stripped:
                if ch in '{[': depth += 1
                elif ch in '}]': depth -= 1
            if depth <= 0 and (stripped.endswith(';') or stripped.endswith(']')):
                in_mock = False
            continue
        new_lines.append(line)
    
    content = '\n'.join(new_lines)
    content = content.replace('mockLineConfig', 'lineStatus')
    content = content.replace('mockWebhookEvents', 'webhookEvents')
    
    write_file("client/src/pages/LineIntegrationPage.tsx", content)
    print(f"  Cleaned: LineIntegrationPage.tsx")

def cleanup_notifications():
    content = read_file("client/src/pages/NotificationsPage.tsx")
    
    lines = content.split('\n')
    new_lines = []
    in_mock = False
    depth = 0
    
    for line in lines:
        stripped = line.strip()
        if not in_mock and 'const mock' in stripped.lower() and '=' in stripped:
            in_mock = True
            depth = 0
            for ch in stripped:
                if ch in '{[': depth += 1
                elif ch in '}]': depth -= 1
            if depth <= 0 and (stripped.endswith(';') or stripped == ''):
                in_mock = False
            continue
        if in_mock:
            for ch in stripped:
                if ch in '{[': depth += 1
                elif ch in '}]': depth -= 1
            if depth <= 0 and (stripped.endswith(';') or stripped.endswith(']') or stripped.endswith('}')):
                in_mock = False
            continue
        new_lines.append(line)
    
    content = '\n'.join(new_lines)
    content = content.replace('mockNotifications', 'notifications')
    content = content.replace('mockSettings', 'notifSettings')
    content = content.replace('mockTemplates', '[]')
    
    write_file("client/src/pages/NotificationsPage.tsx", content)
    print(f"  Cleaned: NotificationsPage.tsx")

def cleanup_payment():
    content = read_file("client/src/pages/PaymentPage.tsx")
    
    lines = content.split('\n')
    new_lines = []
    in_mock = False
    depth = 0
    
    for line in lines:
        stripped = line.strip()
        if not in_mock and 'const mock' in stripped.lower() and '=' in stripped:
            in_mock = True
            depth = 0
            for ch in stripped:
                if ch in '{[': depth += 1
                elif ch in '}]': depth -= 1
            if depth <= 0 and stripped.endswith(';'):
                in_mock = False
            continue
        if in_mock:
            for ch in stripped:
                if ch in '{[': depth += 1
                elif ch in '}]': depth -= 1
            if depth <= 0 and (stripped.endswith(';') or stripped.endswith(']')):
                in_mock = False
            continue
        new_lines.append(line)
    
    content = '\n'.join(new_lines)
    content = content.replace('mockTransactions', 'transactions')
    content = content.replace('mockPaymentMethods', 'providers')
    content = content.replace('mockOrders', 'orderList')
    
    write_file("client/src/pages/PaymentPage.tsx", content)
    print(f"  Cleaned: PaymentPage.tsx")

def cleanup_richmenu():
    content = read_file("client/src/pages/RichMenuPage.tsx")
    
    lines = content.split('\n')
    new_lines = []
    in_mock = False
    depth = 0
    
    for line in lines:
        stripped = line.strip()
        if not in_mock and 'const mock' in stripped.lower() and '=' in stripped:
            in_mock = True
            depth = 0
            for ch in stripped:
                if ch in '{[': depth += 1
                elif ch in '}]': depth -= 1
            if depth <= 0 and stripped.endswith(';'):
                in_mock = False
            continue
        if in_mock:
            for ch in stripped:
                if ch in '{[': depth += 1
                elif ch in '}]': depth -= 1
            if depth <= 0 and (stripped.endswith(';') or stripped.endswith(']')):
                in_mock = False
            continue
        new_lines.append(line)
    
    content = '\n'.join(new_lines)
    content = content.replace('mockRichMenus', 'richMenus')
    content = content.replace('mockMenus', 'richMenus')
    
    # Fix useState that uses mock data
    content = re.sub(r'const \[menus, setMenus\] = useState\([^)]*\);', '// menus from tRPC query', content)
    
    write_file("client/src/pages/RichMenuPage.tsx", content)
    print(f"  Cleaned: RichMenuPage.tsx")

def cleanup_webhook():
    content = read_file("client/src/pages/WebhookPage.tsx")
    
    lines = content.split('\n')
    new_lines = []
    in_mock = False
    depth = 0
    
    for line in lines:
        stripped = line.strip()
        if not in_mock and 'const mock' in stripped.lower() and '=' in stripped:
            in_mock = True
            depth = 0
            for ch in stripped:
                if ch in '{[': depth += 1
                elif ch in '}]': depth -= 1
            if depth <= 0 and stripped.endswith(';'):
                in_mock = False
            continue
        if in_mock:
            for ch in stripped:
                if ch in '{[': depth += 1
                elif ch in '}]': depth -= 1
            if depth <= 0 and (stripped.endswith(';') or stripped.endswith(']')):
                in_mock = False
            continue
        new_lines.append(line)
    
    content = '\n'.join(new_lines)
    content = content.replace('mockWebhookEvents', 'webhookEvents')
    content = content.replace('mockEvents', 'webhookEvents')
    content = content.replace('mockWebhookConfig', '{}')
    
    write_file("client/src/pages/WebhookPage.tsx", content)
    print(f"  Cleaned: WebhookPage.tsx")

def cleanup_dashboard_page(filepath, replacements):
    """Generic cleanup for dashboard pages"""
    content = read_file(filepath)
    
    lines = content.split('\n')
    new_lines = []
    in_mock = False
    depth = 0
    
    for line in lines:
        stripped = line.strip()
        if not in_mock and (
            ('const mock' in stripped.lower() and '=' in stripped) or
            stripped.startswith('// 模擬')
        ):
            if stripped.startswith('//'):
                continue  # Skip comment lines
            in_mock = True
            depth = 0
            for ch in stripped:
                if ch in '{[': depth += 1
                elif ch in '}]': depth -= 1
            if depth <= 0 and (stripped.endswith(';') or stripped == ''):
                in_mock = False
            continue
        if in_mock:
            for ch in stripped:
                if ch in '{[': depth += 1
                elif ch in '}]': depth -= 1
            if depth <= 0 and (stripped.endswith(';') or stripped.endswith(']') or stripped.endswith('}')):
                in_mock = False
            continue
        new_lines.append(line)
    
    content = '\n'.join(new_lines)
    
    for old, new in replacements:
        content = content.replace(old, new)
    
    write_file(filepath, content)
    mock_count = content.lower().count('mock')
    print(f"  Cleaned: {filepath} (remaining mock refs: {mock_count})")

# ============================================================
# Execute all cleanups
# ============================================================
if __name__ == "__main__":
    print("Starting mock data cleanup...")
    
    cleanup_inventory()
    cleanup_line_integration()
    cleanup_notifications()
    cleanup_payment()
    cleanup_richmenu()
    cleanup_webhook()
    
    # Dashboard pages
    cleanup_dashboard_page("client/src/pages/dashboard/DashboardAppointments.tsx", [
        ('mockAppointments', 'appointments'),
        ('mockStaff', 'staffData?.data ?? []'),
    ])
    
    cleanup_dashboard_page("client/src/pages/dashboard/DashboardCustomers.tsx", [
        ('mockCustomers', 'customers'),
        ('mockTags', 'tags'),
    ])
    
    cleanup_dashboard_page("client/src/pages/dashboard/DashboardMarketing.tsx", [
        ('mockCampaigns', 'campaigns'),
        ('mockBroadcasts', 'broadcasts'),
        ('mockPromotions', 'campaigns'),
    ])
    
    cleanup_dashboard_page("client/src/pages/dashboard/DashboardReports.tsx", [
        ('mockRevenueData', 'revenueData'),
        ('mockAppointmentData', 'apptStats'),
        ('mockCustomerData', 'custStats'),
        ('mockDailyRevenue', 'revenueData?.dailyRevenue ?? []'),
        ('mockMonthlyRevenue', 'revenueData?.monthlyRevenue ?? []'),
        ('mockServiceRevenue', 'revenueData?.serviceRevenue ?? []'),
        ('mockStaffPerformance', '[]'),
    ])
    
    cleanup_dashboard_page("client/src/pages/dashboard/DashboardSchedule.tsx", [
        ('mockSchedules', 'schedules'),
        ('mockStaff', 'staffList'),
        ('mockShifts', 'schedules'),
    ])
    
    cleanup_dashboard_page("client/src/pages/dashboard/DashboardSettings.tsx", [
        ('mockSettings', 'settings'),
        ('mockClinicInfo', 'orgData ?? {}'),
    ])
    
    cleanup_dashboard_page("client/src/pages/dashboard/DashboardStaff.tsx", [
        ('mockStaffData', 'staffList'),
        ('mockStaff', 'staffList'),
    ])
    
    print("\nAll cleanups complete!")
    
    # Final check
    import subprocess
    result = subprocess.run(
        ['grep', '-c', '-i', 'mock', 
         'client/src/pages/FlexMessagePage.tsx',
         'client/src/pages/InventoryPage.tsx',
         'client/src/pages/LineIntegrationPage.tsx',
         'client/src/pages/NotificationsPage.tsx',
         'client/src/pages/PaymentPage.tsx',
         'client/src/pages/RichMenuPage.tsx',
         'client/src/pages/WebhookPage.tsx',
         'client/src/pages/dashboard/DashboardHome.tsx',
         'client/src/pages/dashboard/DashboardAppointments.tsx',
         'client/src/pages/dashboard/DashboardCustomers.tsx',
         'client/src/pages/dashboard/DashboardMarketing.tsx',
         'client/src/pages/dashboard/DashboardReports.tsx',
         'client/src/pages/dashboard/DashboardSchedule.tsx',
         'client/src/pages/dashboard/DashboardSettings.tsx',
         'client/src/pages/dashboard/DashboardStaff.tsx',
         'client/src/pages/dashboard/HrDashboard.tsx',
         'client/src/pages/dashboard/MultiBranchDashboard.tsx',
        ],
        capture_output=True, text=True, cwd=BASE
    )
    print("\nFinal mock reference counts:")
    print(result.stdout)
