#!/usr/bin/env python3
"""
Transform all 15 remaining pages to use tRPC API calls.
Strategy: For each page, surgically replace mock data sections with tRPC hooks
while preserving all UI/JSX structure.
"""
import re
import os

BASE = "/home/ubuntu/YOKAGE"

def read_file(path):
    with open(os.path.join(BASE, path), 'r') as f:
        return f.read()

def write_file(path, content):
    full = os.path.join(BASE, path)
    os.makedirs(os.path.dirname(full), exist_ok=True)
    with open(full, 'w') as f:
        f.write(content)
    print(f"  Written: {path} ({content.count(chr(10))+1} lines)")

def add_imports(content, extra_imports=None):
    """Add tRPC and QueryState imports after existing imports"""
    lines = content.split('\n')
    last_import_idx = 0
    for i, line in enumerate(lines):
        stripped = line.strip()
        if stripped.startswith('import ') or stripped.startswith('} from') or stripped.startswith('  ') and 'from' in stripped:
            last_import_idx = i
    
    new_imports = ['import { trpc } from "@/lib/trpc";', 'import { QueryLoading, QueryError } from "@/components/ui/query-state";']
    if extra_imports:
        new_imports.extend(extra_imports)
    
    for imp in new_imports:
        if imp not in content:
            last_import_idx += 1
            lines.insert(last_import_idx, imp)
    
    return '\n'.join(lines)

# ============================================================
# Page-specific transformations
# ============================================================

def transform_inventory():
    """InventoryPage.tsx - Replace mock inventory data with product.list + inventory.listTransactions"""
    content = read_file("client/src/pages/InventoryPage.tsx")
    
    # Find and remove mock data block (from "// 模擬" or mock data arrays to component start)
    # Strategy: Find the mock data constants and replace them
    
    # Add imports
    if 'from "@/lib/trpc"' not in content:
        content = add_imports(content)
    
    # Find mock data section - typically starts with "const mock" or "// 模擬"
    mock_start = content.find('// 模擬庫存')
    if mock_start == -1:
        mock_start = content.find('const mockInventory')
    if mock_start == -1:
        mock_start = content.find('const inventoryItems')
    
    # Find component function
    comp_match = re.search(r'export default function (\w+)', content)
    if not comp_match:
        comp_match = re.search(r'const (\w+)\s*=\s*\(\)', content)
    
    if mock_start > 0 and comp_match:
        # Remove mock data between mock_start and component
        comp_start = comp_match.start()
        mock_section = content[mock_start:comp_start]
        
        # Replace mock section with empty (data will come from hooks)
        content = content[:mock_start] + '\n' + content[comp_start:]
    
    # Add tRPC hooks after component function opening brace
    hook_code = """
  const organizationId = 1; // TODO: from context
  
  const { data: productsData, isLoading: productsLoading, error: productsError, refetch: refetchProducts } = trpc.product.list.useQuery(
    { organizationId },
    { enabled: !!organizationId }
  );
  
  const { data: transactionsData, isLoading: txLoading, refetch: refetchTx } = trpc.inventory.listTransactions.useQuery(
    { organizationId },
    { enabled: !!organizationId }
  );
  
  const createTxMutation = trpc.inventory.createTransaction.useMutation({
    onSuccess: () => { toast.success("庫存交易已建立"); refetchProducts(); refetchTx(); },
    onError: (err: any) => toast.error(err.message),
  });
  
  const isLoading = productsLoading || txLoading;
  const inventoryItems = (productsData?.data ?? []).map((p: any) => ({
    id: p.id, name: p.name, sku: p.sku || `SKU-${p.id}`, category: p.category || "一般",
    currentStock: p.stock ?? 0, minStock: p.minStock ?? 10, maxStock: p.maxStock ?? 100,
    unit: p.unit || "個", costPrice: Number(p.costPrice || 0), sellingPrice: Number(p.price || 0),
    supplier: p.supplier || "-", lastRestocked: p.updatedAt || "-", status: p.isActive ? "正常" : "停用",
    expiryDate: p.expiryDate || null,
  }));
  const transactions = (transactionsData ?? []).map((t: any) => ({
    id: t.id, productName: t.productName || `產品 #${t.productId}`, type: t.transactionType,
    quantity: t.quantity, date: t.transactionDate, notes: t.notes || "",
    staffName: t.staffName || "-",
  }));
"""
    
    # Insert hooks
    if comp_match:
        func_body_start = content.find('{', content.find('export default function'))
        if func_body_start == -1:
            func_body_start = content.find('{', content.find('const InventoryPage'))
        if func_body_start > 0:
            content = content[:func_body_start+1] + hook_code + content[func_body_start+1:]
    
    # Replace useState initializations that use mock data
    content = re.sub(r'const \[items, setItems\] = useState\([^)]+\);', 
                     '// items from tRPC query above', content)
    content = re.sub(r'const \[inventoryData, setInventoryData\] = useState\([^)]+\);',
                     '// inventoryData from tRPC query above', content)
    
    # Add loading/error guard before return
    return_match = re.search(r'(\s+)return \(', content)
    if return_match:
        indent = return_match.group(1)
        guard = f'{indent}if (isLoading) return <QueryLoading variant="skeleton-table" />;{indent}if (productsError) return <QueryError message={{productsError.message}} onRetry={{refetchProducts}} />;'
        content = content[:return_match.start()] + guard + '\n' + content[return_match.start():]
    
    # Ensure toast import
    if 'from "sonner"' not in content:
        content = add_imports(content, ['import { toast } from "sonner";'])
    
    write_file("client/src/pages/InventoryPage.tsx", content)

def transform_line_integration():
    """LineIntegrationPage.tsx"""
    content = read_file("client/src/pages/LineIntegrationPage.tsx")
    
    if 'from "@/lib/trpc"' not in content:
        content = add_imports(content)
    
    # Add tRPC hooks after component opening
    hook_code = """
  const organizationId = 1; // TODO: from context
  
  const { data: lineStatus, isLoading: statusLoading, error: statusError, refetch: refetchStatus } = trpc.lineSettings.getStatus.useQuery(
    { organizationId },
    { enabled: !!organizationId }
  );
  
  const { data: richMenus, isLoading: menuLoading } = trpc.richMenu.list.useQuery(
    { organizationId },
    { enabled: !!organizationId }
  );
  
  const saveConfigMutation = trpc.lineSettings.saveConfig.useMutation({
    onSuccess: () => { toast.success("LINE 設定已儲存"); refetchStatus(); },
    onError: (err: any) => toast.error(err.message),
  });
  
  const verifyMutation = trpc.lineSettings.verifyChannel.useMutation({
    onSuccess: () => toast.success("Channel 驗證成功"),
    onError: (err: any) => toast.error(err.message),
  });
"""
    
    comp_match = re.search(r'export default function \w+\(\)\s*\{', content)
    if comp_match:
        pos = content.find('{', comp_match.start()) + 1
        content = content[:pos] + hook_code + content[pos:]
    
    # Replace simulated loading
    content = content.replace('setTimeout(() => {', '// Loading handled by tRPC\n    // setTimeout(() => {')
    content = re.sub(r'setLoading\(false\);\s*\}, \d+\);', '// setLoading(false); // handled by tRPC', content)
    
    # Add loading guard
    return_match = re.search(r'(\s+)return \(', content)
    if return_match:
        indent = return_match.group(1)
        guard = f'{indent}if (statusLoading) return <QueryLoading variant="skeleton-cards" />;{indent}if (statusError) return <QueryError message={{statusError.message}} onRetry={{refetchStatus}} />;'
        content = content[:return_match.start()] + guard + '\n' + content[return_match.start():]
    
    write_file("client/src/pages/LineIntegrationPage.tsx", content)

def transform_notifications():
    """NotificationsPage.tsx"""
    content = read_file("client/src/pages/NotificationsPage.tsx")
    
    if 'from "@/lib/trpc"' not in content:
        content = add_imports(content)
    
    hook_code = """
  const organizationId = 1; // TODO: from context
  
  const { data: notifSettings, isLoading: settingsLoading, refetch: refetchSettings } = trpc.notification.getNotificationSettings.useQuery();
  
  const { data: notifLog, isLoading: logLoading, error: logError, refetch: refetchLog } = trpc.notification.getNotificationLog.useQuery(
    { page: 1, limit: 50 }
  );
  
  const updateSettingsMutation = trpc.notification.updateNotificationSettings.useMutation({
    onSuccess: () => { toast.success("通知設定已更新"); refetchSettings(); },
    onError: (err: any) => toast.error(err.message),
  });
  
  const sendNotifMutation = trpc.notification.sendNotification.useMutation({
    onSuccess: () => { toast.success("通知已發送"); refetchLog(); },
    onError: (err: any) => toast.error(err.message),
  });
  
  const isLoading = settingsLoading || logLoading;
  const notifications = notifLog?.logs ?? [];
"""
    
    comp_match = re.search(r'export default function \w+\(\)\s*\{', content)
    if comp_match:
        pos = content.find('{', comp_match.start()) + 1
        content = content[:pos] + hook_code + content[pos:]
    
    return_match = re.search(r'(\s+)return \(', content)
    if return_match:
        indent = return_match.group(1)
        guard = f'{indent}if (isLoading) return <QueryLoading variant="skeleton-table" />;{indent}if (logError) return <QueryError message={{logError.message}} onRetry={{refetchLog}} />;'
        content = content[:return_match.start()] + guard + '\n' + content[return_match.start():]
    
    write_file("client/src/pages/NotificationsPage.tsx", content)

def transform_payment():
    """PaymentPage.tsx"""
    content = read_file("client/src/pages/PaymentPage.tsx")
    
    if 'from "@/lib/trpc"' not in content:
        content = add_imports(content)
    
    hook_code = """
  const organizationId = 1; // TODO: from context
  
  const { data: txData, isLoading: txLoading, error: txError, refetch: refetchTx } = trpc.payment.getTransactions.useQuery(
    { organizationId, page: 1, limit: 50 },
    { enabled: !!organizationId }
  );
  
  const { data: providers, isLoading: provLoading } = trpc.payment.listProviders.useQuery(
    { organizationId },
    { enabled: !!organizationId }
  );
  
  const { data: orders, isLoading: ordersLoading } = trpc.order.list.useQuery(
    { organizationId, limit: 20 },
    { enabled: !!organizationId }
  );
  
  const createPaymentMutation = trpc.payment.createPayment.useMutation({
    onSuccess: () => { toast.success("付款已建立"); refetchTx(); },
    onError: (err: any) => toast.error(err.message),
  });
  
  const isLoading = txLoading || provLoading;
  const transactions = (txData as any)?.data ?? (txData as any)?.transactions ?? [];
  const orderList = orders?.data ?? [];
"""
    
    comp_match = re.search(r'export default function \w+\(\)\s*\{', content)
    if comp_match:
        pos = content.find('{', comp_match.start()) + 1
        content = content[:pos] + hook_code + content[pos:]
    
    return_match = re.search(r'(\s+)return \(', content)
    if return_match:
        indent = return_match.group(1)
        guard = f'{indent}if (isLoading) return <QueryLoading variant="skeleton-table" />;{indent}if (txError) return <QueryError message={{txError.message}} onRetry={{refetchTx}} />;'
        content = content[:return_match.start()] + guard + '\n' + content[return_match.start():]
    
    write_file("client/src/pages/PaymentPage.tsx", content)

def transform_richmenu():
    """RichMenuPage.tsx"""
    content = read_file("client/src/pages/RichMenuPage.tsx")
    
    if 'from "@/lib/trpc"' not in content:
        content = add_imports(content)
    
    hook_code = """
  const organizationId = 1; // TODO: from context
  
  const { data: richMenusData, isLoading, error, refetch } = trpc.richMenu.list.useQuery(
    { organizationId },
    { enabled: !!organizationId }
  );
  
  const createMutation = trpc.richMenu.create.useMutation({
    onSuccess: () => { toast.success("Rich Menu 已建立"); refetch(); },
    onError: (err: any) => toast.error(err.message),
  });
  
  const updateMutation = trpc.richMenu.update.useMutation({
    onSuccess: () => { toast.success("Rich Menu 已更新"); refetch(); },
    onError: (err: any) => toast.error(err.message),
  });
  
  const deleteMutation = trpc.richMenu.delete.useMutation({
    onSuccess: () => { toast.success("Rich Menu 已刪除"); refetch(); },
    onError: (err: any) => toast.error(err.message),
  });
  
  const richMenus = (richMenusData as any)?.data ?? richMenusData ?? [];
"""
    
    comp_match = re.search(r'export default function \w+\(\)\s*\{', content)
    if comp_match:
        pos = content.find('{', comp_match.start()) + 1
        content = content[:pos] + hook_code + content[pos:]
    
    return_match = re.search(r'(\s+)return \(', content)
    if return_match:
        indent = return_match.group(1)
        guard = f'{indent}if (isLoading) return <QueryLoading variant="skeleton-cards" />;{indent}if (error) return <QueryError message={{error.message}} onRetry={{refetch}} />;'
        content = content[:return_match.start()] + guard + '\n' + content[return_match.start():]
    
    write_file("client/src/pages/RichMenuPage.tsx", content)

def transform_webhook():
    """WebhookPage.tsx"""
    content = read_file("client/src/pages/WebhookPage.tsx")
    
    if 'from "@/lib/trpc"' not in content:
        content = add_imports(content)
    
    hook_code = """
  const organizationId = 1; // TODO: from context
  
  const { data: eventsData, isLoading, error, refetch } = trpc.lineWebhook.listEvents.useQuery(
    { organizationId, page: 1, limit: 50 },
    { enabled: !!organizationId }
  );
  
  const webhookEvents = (eventsData as any)?.data ?? eventsData ?? [];
"""
    
    comp_match = re.search(r'export default function \w+\(\)\s*\{', content)
    if comp_match:
        pos = content.find('{', comp_match.start()) + 1
        content = content[:pos] + hook_code + content[pos:]
    
    return_match = re.search(r'(\s+)return \(', content)
    if return_match:
        indent = return_match.group(1)
        guard = f'{indent}if (isLoading) return <QueryLoading variant="skeleton-table" />;{indent}if (error) return <QueryError message={{error.message}} onRetry={{refetch}} />;'
        content = content[:return_match.start()] + guard + '\n' + content[return_match.start():]
    
    write_file("client/src/pages/WebhookPage.tsx", content)

def transform_appointments():
    """DashboardAppointments.tsx"""
    content = read_file("client/src/pages/dashboard/DashboardAppointments.tsx")
    
    if 'from "@/lib/trpc"' not in content:
        content = add_imports(content)
    
    hook_code = """
  const organizationId = 1; // TODO: from context
  
  const { data: appointmentsData, isLoading, error, refetch } = trpc.appointment.list.useQuery(
    { organizationId, limit: 50 },
    { enabled: !!organizationId }
  );
  
  const createMutation = trpc.appointment.create.useMutation({
    onSuccess: () => { toast.success("預約已建立"); refetch(); },
    onError: (err: any) => toast.error(err.message),
  });
  
  const updateMutation = trpc.appointment.update.useMutation({
    onSuccess: () => { toast.success("預約已更新"); refetch(); },
    onError: (err: any) => toast.error(err.message),
  });
  
  const { data: staffData } = trpc.staff.list.useQuery(
    { organizationId },
    { enabled: !!organizationId }
  );
  
  const appointments = (appointmentsData?.data ?? []).map((a: any) => ({
    id: a.id, customerName: a.customerName || `客戶 #${a.customerId}`,
    service: a.productName || "一般診療", staff: a.staffName || `醫師 #${a.staffId || ""}`,
    date: a.appointmentDate, startTime: a.startTime || "09:00", endTime: a.endTime || "10:00",
    status: a.status || "pending", notes: a.notes || "", source: a.source || "walk_in",
  }));
"""
    
    comp_match = re.search(r'export default function \w+\(\)\s*\{', content)
    if not comp_match:
        comp_match = re.search(r'const \w+ = \(\) => \{', content)
    if comp_match:
        pos = content.find('{', comp_match.start()) + 1
        content = content[:pos] + hook_code + content[pos:]
    
    return_match = re.search(r'(\s+)return \(', content)
    if return_match:
        indent = return_match.group(1)
        guard = f'{indent}if (isLoading) return <QueryLoading variant="skeleton-table" />;{indent}if (error) return <QueryError message={{error.message}} onRetry={{refetch}} />;'
        content = content[:return_match.start()] + guard + '\n' + content[return_match.start():]
    
    if 'from "sonner"' not in content:
        content = add_imports(content, ['import { toast } from "sonner";'])
    
    write_file("client/src/pages/dashboard/DashboardAppointments.tsx", content)

def transform_customers():
    """DashboardCustomers.tsx"""
    content = read_file("client/src/pages/dashboard/DashboardCustomers.tsx")
    
    if 'from "@/lib/trpc"' not in content:
        content = add_imports(content)
    
    hook_code = """
  const organizationId = 1; // TODO: from context
  
  const { data: customersData, isLoading, error, refetch } = trpc.customer.list.useQuery(
    { organizationId, limit: 50 },
    { enabled: !!organizationId }
  );
  
  const createMutation = trpc.customer.create.useMutation({
    onSuccess: () => { toast.success("客戶已建立"); refetch(); },
    onError: (err: any) => toast.error(err.message),
  });
  
  const updateMutation = trpc.customer.update.useMutation({
    onSuccess: () => { toast.success("客戶已更新"); refetch(); },
    onError: (err: any) => toast.error(err.message),
  });
  
  const deleteMutation = trpc.customer.delete.useMutation({
    onSuccess: () => { toast.success("客戶已刪除"); refetch(); },
    onError: (err: any) => toast.error(err.message),
  });
  
  const { data: tagsData } = trpc.customer.tags.list.useQuery(
    { organizationId },
    { enabled: !!organizationId }
  );
  
  const customers = (customersData?.data ?? []).map((c: any) => ({
    id: c.id, name: c.name, phone: c.phone || "-", email: c.email || "-",
    gender: c.gender || "other", birthday: c.birthday || "-",
    memberLevel: c.memberLevel || "bronze", totalVisits: c.totalVisits ?? 0,
    totalSpent: Number(c.totalSpent || 0), lastVisit: c.lastVisitDate || c.createdAt || "-",
    tags: c.tags || [], notes: c.notes || "", source: c.source || "-",
  }));
  const tags = tagsData ?? [];
"""
    
    comp_match = re.search(r'export default function \w+\(\)\s*\{', content)
    if not comp_match:
        comp_match = re.search(r'const \w+ = \(\) => \{', content)
    if comp_match:
        pos = content.find('{', comp_match.start()) + 1
        content = content[:pos] + hook_code + content[pos:]
    
    return_match = re.search(r'(\s+)return \(', content)
    if return_match:
        indent = return_match.group(1)
        guard = f'{indent}if (isLoading) return <QueryLoading variant="skeleton-table" />;{indent}if (error) return <QueryError message={{error.message}} onRetry={{refetch}} />;'
        content = content[:return_match.start()] + guard + '\n' + content[return_match.start():]
    
    if 'from "sonner"' not in content:
        content = add_imports(content, ['import { toast } from "sonner";'])
    
    write_file("client/src/pages/dashboard/DashboardCustomers.tsx", content)

def transform_marketing():
    """DashboardMarketing.tsx"""
    content = read_file("client/src/pages/dashboard/DashboardMarketing.tsx")
    
    if 'from "@/lib/trpc"' not in content:
        content = add_imports(content)
    
    hook_code = """
  const organizationId = 1; // TODO: from context
  
  const { data: campaignsData, isLoading: campLoading, error: campError, refetch: refetchCampaigns } = trpc.marketing.listCampaigns.useQuery(
    { organizationId },
    { enabled: !!organizationId }
  );
  
  const { data: broadcastData, isLoading: bcLoading } = trpc.broadcast.list.useQuery(
    { organizationId, limit: 20 },
    { enabled: !!organizationId }
  );
  
  const createCampaignMutation = trpc.marketing.createCampaign.useMutation({
    onSuccess: () => { toast.success("行銷活動已建立"); refetchCampaigns(); },
    onError: (err: any) => toast.error(err.message),
  });
  
  const isLoading = campLoading || bcLoading;
  const campaigns = (campaignsData as any)?.data ?? campaignsData ?? [];
  const broadcasts = (broadcastData as any)?.data ?? broadcastData ?? [];
"""
    
    comp_match = re.search(r'export default function \w+\(\)\s*\{', content)
    if not comp_match:
        comp_match = re.search(r'const \w+ = \(\) => \{', content)
    if comp_match:
        pos = content.find('{', comp_match.start()) + 1
        content = content[:pos] + hook_code + content[pos:]
    
    return_match = re.search(r'(\s+)return \(', content)
    if return_match:
        indent = return_match.group(1)
        guard = f'{indent}if (isLoading) return <QueryLoading variant="skeleton-cards" />;{indent}if (campError) return <QueryError message={{campError.message}} onRetry={{refetchCampaigns}} />;'
        content = content[:return_match.start()] + guard + '\n' + content[return_match.start():]
    
    if 'from "sonner"' not in content:
        content = add_imports(content, ['import { toast } from "sonner";'])
    
    write_file("client/src/pages/dashboard/DashboardMarketing.tsx", content)

def transform_reports():
    """DashboardReports.tsx"""
    content = read_file("client/src/pages/dashboard/DashboardReports.tsx")
    
    if 'from "@/lib/trpc"' not in content:
        content = add_imports(content)
    
    hook_code = """
  const organizationId = 1; // TODO: from context
  const today = new Date().toISOString().split('T')[0];
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
  
  const { data: revenueData, isLoading: revLoading, error: revError, refetch: refetchRevenue } = trpc.report.revenue.useQuery(
    { organizationId, startDate: monthStart, endDate: today },
    { enabled: !!organizationId }
  );
  
  const { data: apptStats, isLoading: apptLoading } = trpc.report.appointmentStats.useQuery(
    { organizationId, startDate: monthStart, endDate: today },
    { enabled: !!organizationId }
  );
  
  const { data: custStats, isLoading: custLoading } = trpc.report.customerStats.useQuery(
    { organizationId, startDate: monthStart, endDate: today },
    { enabled: !!organizationId }
  );
  
  const isLoading = revLoading || apptLoading || custLoading;
"""
    
    comp_match = re.search(r'export default function \w+\(\)\s*\{', content)
    if not comp_match:
        comp_match = re.search(r'const \w+ = \(\) => \{', content)
    if comp_match:
        pos = content.find('{', comp_match.start()) + 1
        content = content[:pos] + hook_code + content[pos:]
    
    return_match = re.search(r'(\s+)return \(', content)
    if return_match:
        indent = return_match.group(1)
        guard = f'{indent}if (isLoading) return <QueryLoading variant="skeleton-cards" />;{indent}if (revError) return <QueryError message={{revError.message}} onRetry={{refetchRevenue}} />;'
        content = content[:return_match.start()] + guard + '\n' + content[return_match.start():]
    
    write_file("client/src/pages/dashboard/DashboardReports.tsx", content)

def transform_schedule():
    """DashboardSchedule.tsx"""
    content = read_file("client/src/pages/dashboard/DashboardSchedule.tsx")
    
    if 'from "@/lib/trpc"' not in content:
        content = add_imports(content)
    
    hook_code = """
  const organizationId = 1; // TODO: from context
  
  const { data: schedulesData, isLoading: schedLoading, error: schedError, refetch: refetchSchedules } = trpc.schedule.list.useQuery(
    { organizationId },
    { enabled: !!organizationId }
  );
  
  const { data: staffData, isLoading: staffLoading } = trpc.staff.list.useQuery(
    { organizationId },
    { enabled: !!organizationId }
  );
  
  const createScheduleMutation = trpc.schedule.create.useMutation({
    onSuccess: () => { toast.success("排班已建立"); refetchSchedules(); },
    onError: (err: any) => toast.error(err.message),
  });
  
  const isLoading = schedLoading || staffLoading;
  const schedules = (schedulesData as any)?.data ?? schedulesData ?? [];
  const staffList = staffData?.data ?? [];
"""
    
    comp_match = re.search(r'export default function \w+\(\)\s*\{', content)
    if not comp_match:
        comp_match = re.search(r'const \w+ = \(\) => \{', content)
    if comp_match:
        pos = content.find('{', comp_match.start()) + 1
        content = content[:pos] + hook_code + content[pos:]
    
    return_match = re.search(r'(\s+)return \(', content)
    if return_match:
        indent = return_match.group(1)
        guard = f'{indent}if (isLoading) return <QueryLoading variant="skeleton-table" />;{indent}if (schedError) return <QueryError message={{schedError.message}} onRetry={{refetchSchedules}} />;'
        content = content[:return_match.start()] + guard + '\n' + content[return_match.start():]
    
    if 'from "sonner"' not in content:
        content = add_imports(content, ['import { toast } from "sonner";'])
    
    write_file("client/src/pages/dashboard/DashboardSchedule.tsx", content)

def transform_settings():
    """DashboardSettings.tsx"""
    content = read_file("client/src/pages/dashboard/DashboardSettings.tsx")
    
    if 'from "@/lib/trpc"' not in content:
        content = add_imports(content)
    
    hook_code = """
  const organizationId = 1; // TODO: from context
  
  const { data: settingsData, isLoading: settingsLoading, error: settingsError, refetch: refetchSettings } = trpc.settings.list.useQuery(
    { is_global: false },
  );
  
  const { data: orgData } = trpc.organization.current.useQuery();
  
  const updateSettingMutation = trpc.settings.update.useMutation({
    onSuccess: () => { toast.success("設定已儲存"); refetchSettings(); },
    onError: (err: any) => toast.error(err.message),
  });
  
  const isLoading = settingsLoading;
  const settings = settingsData ?? [];
"""
    
    comp_match = re.search(r'export default function \w+\(\)\s*\{', content)
    if not comp_match:
        comp_match = re.search(r'const \w+ = \(\) => \{', content)
    if comp_match:
        pos = content.find('{', comp_match.start()) + 1
        content = content[:pos] + hook_code + content[pos:]
    
    return_match = re.search(r'(\s+)return \(', content)
    if return_match:
        indent = return_match.group(1)
        guard = f'{indent}if (isLoading) return <QueryLoading variant="skeleton-cards" />;{indent}if (settingsError) return <QueryError message={{settingsError.message}} onRetry={{refetchSettings}} />;'
        content = content[:return_match.start()] + guard + '\n' + content[return_match.start():]
    
    if 'from "sonner"' not in content:
        content = add_imports(content, ['import { toast } from "sonner";'])
    
    write_file("client/src/pages/dashboard/DashboardSettings.tsx", content)

def transform_staff():
    """DashboardStaff.tsx"""
    content = read_file("client/src/pages/dashboard/DashboardStaff.tsx")
    
    if 'from "@/lib/trpc"' not in content:
        content = add_imports(content)
    
    hook_code = """
  const organizationId = 1; // TODO: from context
  
  const { data: staffData, isLoading, error, refetch } = trpc.staff.list.useQuery(
    { organizationId },
    { enabled: !!organizationId }
  );
  
  const createMutation = trpc.staff.create.useMutation({
    onSuccess: () => { toast.success("員工已建立"); refetch(); },
    onError: (err: any) => toast.error(err.message),
  });
  
  const updateMutation = trpc.staff.update.useMutation({
    onSuccess: () => { toast.success("員工已更新"); refetch(); },
    onError: (err: any) => toast.error(err.message),
  });
  
  const staffList = (staffData?.data ?? []).map((s: any) => ({
    id: s.id, name: s.name, employeeId: s.employeeId || "-",
    phone: s.phone || "-", email: s.email || "-",
    position: s.position || "-", department: s.department || "-",
    hireDate: s.hireDate || "-", salary: s.salary || "0",
    salaryType: s.salaryType || "monthly", isActive: s.isActive !== false,
  }));
"""
    
    comp_match = re.search(r'export default function \w+\(\)\s*\{', content)
    if not comp_match:
        comp_match = re.search(r'const \w+ = \(\) => \{', content)
    if comp_match:
        pos = content.find('{', comp_match.start()) + 1
        content = content[:pos] + hook_code + content[pos:]
    
    return_match = re.search(r'(\s+)return \(', content)
    if return_match:
        indent = return_match.group(1)
        guard = f'{indent}if (isLoading) return <QueryLoading variant="skeleton-table" />;{indent}if (error) return <QueryError message={{error.message}} onRetry={{refetch}} />;'
        content = content[:return_match.start()] + guard + '\n' + content[return_match.start():]
    
    if 'from "sonner"' not in content:
        content = add_imports(content, ['import { toast } from "sonner";'])
    
    write_file("client/src/pages/dashboard/DashboardStaff.tsx", content)

def transform_hr():
    """HrDashboard.tsx"""
    content = read_file("client/src/pages/dashboard/HrDashboard.tsx")
    
    if 'from "@/lib/trpc"' not in content:
        content = add_imports(content)
    
    hook_code = """
  const organizationId = 1; // TODO: from context
  
  const { data: staffData, isLoading: staffLoading, error: staffError, refetch: refetchStaff } = trpc.staff.list.useQuery(
    { organizationId },
    { enabled: !!organizationId }
  );
  
  const { data: attendanceData, isLoading: attLoading } = trpc.attendance.list.useQuery(
    { organizationId },
    { enabled: !!organizationId }
  );
  
  const isLoading = staffLoading || attLoading;
  const staffList = staffData?.data ?? [];
  const attendanceRecords = (attendanceData as any)?.data ?? attendanceData ?? [];
"""
    
    comp_match = re.search(r'export default function \w+\(\)\s*\{', content)
    if not comp_match:
        comp_match = re.search(r'const \w+ = \(\) => \{', content)
    if comp_match:
        pos = content.find('{', comp_match.start()) + 1
        content = content[:pos] + hook_code + content[pos:]
    
    return_match = re.search(r'(\s+)return \(', content)
    if return_match:
        indent = return_match.group(1)
        guard = f'{indent}if (isLoading) return <QueryLoading variant="skeleton-table" />;{indent}if (staffError) return <QueryError message={{staffError.message}} onRetry={{refetchStaff}} />;'
        content = content[:return_match.start()] + guard + '\n' + content[return_match.start():]
    
    write_file("client/src/pages/dashboard/HrDashboard.tsx", content)

def transform_multibranch():
    """MultiBranchDashboard.tsx"""
    content = read_file("client/src/pages/dashboard/MultiBranchDashboard.tsx")
    
    if 'from "@/lib/trpc"' not in content:
        content = add_imports(content)
    
    hook_code = """
  const { data: orgList, isLoading, error, refetch } = trpc.organization.list.useQuery();
  
  const branches = (orgList ?? []).map((org: any) => ({
    id: org.id, name: org.name, address: org.address || "-",
    phone: org.phone || "-", status: org.isActive !== false ? "active" : "inactive",
  }));
"""
    
    comp_match = re.search(r'export default function \w+\(\)\s*\{', content)
    if not comp_match:
        comp_match = re.search(r'const \w+ = \(\) => \{', content)
    if comp_match:
        pos = content.find('{', comp_match.start()) + 1
        content = content[:pos] + hook_code + content[pos:]
    
    return_match = re.search(r'(\s+)return \(', content)
    if return_match:
        indent = return_match.group(1)
        guard = f'{indent}if (isLoading) return <QueryLoading variant="skeleton-cards" />;{indent}if (error) return <QueryError message={{error.message}} onRetry={{refetch}} />;'
        content = content[:return_match.start()] + guard + '\n' + content[return_match.start():]
    
    write_file("client/src/pages/dashboard/MultiBranchDashboard.tsx", content)

# ============================================================
# Execute all transformations
# ============================================================
if __name__ == "__main__":
    print("Starting page transformations...")
    
    transforms = [
        ("InventoryPage", transform_inventory),
        ("LineIntegrationPage", transform_line_integration),
        ("NotificationsPage", transform_notifications),
        ("PaymentPage", transform_payment),
        ("RichMenuPage", transform_richmenu),
        ("WebhookPage", transform_webhook),
        ("DashboardAppointments", transform_appointments),
        ("DashboardCustomers", transform_customers),
        ("DashboardMarketing", transform_marketing),
        ("DashboardReports", transform_reports),
        ("DashboardSchedule", transform_schedule),
        ("DashboardSettings", transform_settings),
        ("DashboardStaff", transform_staff),
        ("HrDashboard", transform_hr),
        ("MultiBranchDashboard", transform_multibranch),
    ]
    
    for name, func in transforms:
        try:
            print(f"\nTransforming {name}...")
            func()
            print(f"  OK: {name}")
        except Exception as e:
            print(f"  ERROR: {name}: {e}")
    
    print("\nAll transformations complete!")
