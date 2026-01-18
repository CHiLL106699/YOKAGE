/**
 * 資料匯入服務模組
 * 支援 CSV/Excel 匯入客戶、產品、員工資料
 */

import { getDb } from "../db";
import {
  customers,
  products,
  staff,
  importRecords,
  InsertCustomer,
  InsertProduct,
  InsertStaff,
} from "../../drizzle/schema";
import { eq } from "drizzle-orm";

// ============================================
// 類型定義
// ============================================

export interface ImportResult {
  success: boolean;
  totalRows: number;
  successRows: number;
  failedRows: number;
  errors: ImportError[];
  importRecordId?: number;
}

export interface ImportError {
  row: number;
  field?: string;
  message: string;
  data?: any;
}

export interface CustomerImportRow {
  name: string;
  phone?: string;
  email?: string;
  gender?: 'male' | 'female' | 'other';
  birthday?: string;
  address?: string;
  memberLevel?: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  notes?: string;
  source?: string;
}

export interface ProductImportRow {
  name: string;
  description?: string;
  category?: string;
  type?: 'service' | 'product' | 'package';
  price: number;
  costPrice?: number;
  duration?: number;
  stock?: number;
}

export interface StaffImportRow {
  name: string;
  phone?: string;
  email?: string;
  position?: string;
  department?: string;
  hireDate?: string;
  salary?: number;
  salaryType?: 'monthly' | 'hourly' | 'commission';
}

// ============================================
// CSV 解析工具
// ============================================

/**
 * 解析 CSV 字串
 */
export function parseCSV(csvContent: string): { headers: string[]; rows: Record<string, string>[] } {
  const lines = csvContent.split('\n').filter(line => line.trim());
  if (lines.length === 0) {
    return { headers: [], rows: [] };
  }

  // 解析標題行
  const headers = parseCSVLine(lines[0]);
  
  // 解析資料行
  const rows: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header.trim()] = values[index]?.trim() || '';
    });
    rows.push(row);
  }

  return { headers, rows };
}

/**
 * 解析單行 CSV（處理引號內的逗號）
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);

  return result;
}

// ============================================
// 欄位映射
// ============================================

const CUSTOMER_FIELD_MAP: Record<string, string> = {
  '姓名': 'name',
  '名稱': 'name',
  'name': 'name',
  '電話': 'phone',
  '手機': 'phone',
  'phone': 'phone',
  'mobile': 'phone',
  '信箱': 'email',
  'email': 'email',
  'Email': 'email',
  '性別': 'gender',
  'gender': 'gender',
  '生日': 'birthday',
  'birthday': 'birthday',
  '地址': 'address',
  'address': 'address',
  '會員等級': 'memberLevel',
  'memberLevel': 'memberLevel',
  '備註': 'notes',
  'notes': 'notes',
  '來源': 'source',
  'source': 'source',
};

const PRODUCT_FIELD_MAP: Record<string, string> = {
  '名稱': 'name',
  '產品名稱': 'name',
  '服務名稱': 'name',
  'name': 'name',
  '描述': 'description',
  'description': 'description',
  '分類': 'category',
  'category': 'category',
  '類型': 'type',
  'type': 'type',
  '價格': 'price',
  '售價': 'price',
  'price': 'price',
  '成本': 'costPrice',
  '成本價': 'costPrice',
  'costPrice': 'costPrice',
  '時長': 'duration',
  '服務時長': 'duration',
  'duration': 'duration',
  '庫存': 'stock',
  'stock': 'stock',
};

const STAFF_FIELD_MAP: Record<string, string> = {
  '姓名': 'name',
  '名稱': 'name',
  'name': 'name',
  '電話': 'phone',
  '手機': 'phone',
  'phone': 'phone',
  '信箱': 'email',
  'email': 'email',
  '職位': 'position',
  'position': 'position',
  '部門': 'department',
  'department': 'department',
  '入職日期': 'hireDate',
  'hireDate': 'hireDate',
  '薪資': 'salary',
  'salary': 'salary',
  '薪資類型': 'salaryType',
  'salaryType': 'salaryType',
};

/**
 * 映射欄位名稱
 */
function mapFields(row: Record<string, string>, fieldMap: Record<string, string>): Record<string, string> {
  const result: Record<string, string> = {};
  
  for (const [key, value] of Object.entries(row)) {
    const mappedKey = fieldMap[key] || key;
    result[mappedKey] = value;
  }
  
  return result;
}

// ============================================
// 資料驗證
// ============================================

/**
 * 驗證客戶資料
 */
function validateCustomerRow(row: Record<string, string>, rowIndex: number): { valid: boolean; data?: CustomerImportRow; error?: ImportError } {
  const mapped = mapFields(row, CUSTOMER_FIELD_MAP);
  
  if (!mapped.name || mapped.name.trim() === '') {
    return {
      valid: false,
      error: { row: rowIndex, field: 'name', message: '姓名為必填欄位' },
    };
  }

  // 驗證性別
  let gender: 'male' | 'female' | 'other' | undefined;
  if (mapped.gender) {
    const genderMap: Record<string, 'male' | 'female' | 'other'> = {
      '男': 'male',
      '女': 'female',
      '其他': 'other',
      'male': 'male',
      'female': 'female',
      'other': 'other',
      'M': 'male',
      'F': 'female',
    };
    gender = genderMap[mapped.gender];
  }

  // 驗證會員等級
  let memberLevel: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | undefined;
  if (mapped.memberLevel) {
    const levelMap: Record<string, 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond'> = {
      '銅': 'bronze',
      '銀': 'silver',
      '金': 'gold',
      '白金': 'platinum',
      '鑽石': 'diamond',
      'bronze': 'bronze',
      'silver': 'silver',
      'gold': 'gold',
      'platinum': 'platinum',
      'diamond': 'diamond',
    };
    memberLevel = levelMap[mapped.memberLevel];
  }

  return {
    valid: true,
    data: {
      name: mapped.name.trim(),
      phone: mapped.phone?.trim() || undefined,
      email: mapped.email?.trim() || undefined,
      gender,
      birthday: mapped.birthday?.trim() || undefined,
      address: mapped.address?.trim() || undefined,
      memberLevel,
      notes: mapped.notes?.trim() || undefined,
      source: mapped.source?.trim() || undefined,
    },
  };
}

/**
 * 驗證產品資料
 */
function validateProductRow(row: Record<string, string>, rowIndex: number): { valid: boolean; data?: ProductImportRow; error?: ImportError } {
  const mapped = mapFields(row, PRODUCT_FIELD_MAP);
  
  if (!mapped.name || mapped.name.trim() === '') {
    return {
      valid: false,
      error: { row: rowIndex, field: 'name', message: '名稱為必填欄位' },
    };
  }

  const price = parseFloat(mapped.price);
  if (isNaN(price) || price < 0) {
    return {
      valid: false,
      error: { row: rowIndex, field: 'price', message: '價格必須為有效數字' },
    };
  }

  // 驗證類型
  let type: 'service' | 'product' | 'package' | undefined;
  if (mapped.type) {
    const typeMap: Record<string, 'service' | 'product' | 'package'> = {
      '服務': 'service',
      '產品': 'product',
      '套餐': 'package',
      'service': 'service',
      'product': 'product',
      'package': 'package',
    };
    type = typeMap[mapped.type];
  }

  return {
    valid: true,
    data: {
      name: mapped.name.trim(),
      description: mapped.description?.trim() || undefined,
      category: mapped.category?.trim() || undefined,
      type,
      price,
      costPrice: mapped.costPrice ? parseFloat(mapped.costPrice) : undefined,
      duration: mapped.duration ? parseInt(mapped.duration) : undefined,
      stock: mapped.stock ? parseInt(mapped.stock) : undefined,
    },
  };
}

/**
 * 驗證員工資料
 */
function validateStaffRow(row: Record<string, string>, rowIndex: number): { valid: boolean; data?: StaffImportRow; error?: ImportError } {
  const mapped = mapFields(row, STAFF_FIELD_MAP);
  
  if (!mapped.name || mapped.name.trim() === '') {
    return {
      valid: false,
      error: { row: rowIndex, field: 'name', message: '姓名為必填欄位' },
    };
  }

  // 驗證薪資類型
  let salaryType: 'monthly' | 'hourly' | 'commission' | undefined;
  if (mapped.salaryType) {
    const typeMap: Record<string, 'monthly' | 'hourly' | 'commission'> = {
      '月薪': 'monthly',
      '時薪': 'hourly',
      '抽成': 'commission',
      'monthly': 'monthly',
      'hourly': 'hourly',
      'commission': 'commission',
    };
    salaryType = typeMap[mapped.salaryType];
  }

  return {
    valid: true,
    data: {
      name: mapped.name.trim(),
      phone: mapped.phone?.trim() || undefined,
      email: mapped.email?.trim() || undefined,
      position: mapped.position?.trim() || undefined,
      department: mapped.department?.trim() || undefined,
      hireDate: mapped.hireDate?.trim() || undefined,
      salary: mapped.salary ? parseFloat(mapped.salary) : undefined,
      salaryType,
    },
  };
}

// ============================================
// 匯入功能
// ============================================

/**
 * 匯入客戶資料
 */
export async function importCustomers(
  organizationId: number,
  userId: number,
  csvContent: string,
  fileName: string
): Promise<ImportResult> {
  const db = await getDb();
  if (!db) {
    return {
      success: false,
      totalRows: 0,
      successRows: 0,
      failedRows: 0,
      errors: [{ row: 0, message: '資料庫連線失敗' }],
    };
  }

  const { rows } = parseCSV(csvContent);
  const errors: ImportError[] = [];
  let successCount = 0;

  // 建立匯入記錄
  const [importRecord] = await db.insert(importRecords).values({
    organizationId,
    userId,
    importType: 'customer',
    fileName,
    totalRows: rows.length,
    status: 'processing',
    startedAt: new Date(),
  }).$returningId();

  for (let i = 0; i < rows.length; i++) {
    const validation = validateCustomerRow(rows[i], i + 2); // +2 因為跳過標題行，行號從 1 開始
    
    if (!validation.valid) {
      errors.push(validation.error!);
      continue;
    }

    try {
      await db.insert(customers).values({
        organizationId,
        name: validation.data!.name,
        phone: validation.data!.phone,
        email: validation.data!.email,
        gender: validation.data!.gender,
        birthday: validation.data!.birthday ? new Date(validation.data!.birthday) : null,
        address: validation.data!.address,
        memberLevel: validation.data!.memberLevel,
        notes: validation.data!.notes,
        source: validation.data!.source || 'import',
      });
      successCount++;
    } catch (error) {
      errors.push({
        row: i + 2,
        message: error instanceof Error ? error.message : '寫入資料庫失敗',
        data: validation.data,
      });
    }
  }

  // 更新匯入記錄
  await db.update(importRecords)
    .set({
      successRows: successCount,
      failedRows: errors.length,
      status: errors.length === rows.length ? 'failed' : 'completed',
      errorLog: errors.length > 0 ? errors : null,
      completedAt: new Date(),
    })
    .where(eq(importRecords.id, importRecord.id));

  return {
    success: errors.length < rows.length,
    totalRows: rows.length,
    successRows: successCount,
    failedRows: errors.length,
    errors,
    importRecordId: importRecord.id,
  };
}

/**
 * 匯入產品資料
 */
export async function importProducts(
  organizationId: number,
  userId: number,
  csvContent: string,
  fileName: string
): Promise<ImportResult> {
  const db = await getDb();
  if (!db) {
    return {
      success: false,
      totalRows: 0,
      successRows: 0,
      failedRows: 0,
      errors: [{ row: 0, message: '資料庫連線失敗' }],
    };
  }

  const { rows } = parseCSV(csvContent);
  const errors: ImportError[] = [];
  let successCount = 0;

  // 建立匯入記錄
  const [importRecord] = await db.insert(importRecords).values({
    organizationId,
    userId,
    importType: 'product',
    fileName,
    totalRows: rows.length,
    status: 'processing',
    startedAt: new Date(),
  }).$returningId();

  for (let i = 0; i < rows.length; i++) {
    const validation = validateProductRow(rows[i], i + 2);
    
    if (!validation.valid) {
      errors.push(validation.error!);
      continue;
    }

    try {
      await db.insert(products).values({
        organizationId,
        name: validation.data!.name,
        description: validation.data!.description,
        category: validation.data!.category,
        type: validation.data!.type,
        price: validation.data!.price.toString(),
        costPrice: validation.data!.costPrice?.toString(),
        duration: validation.data!.duration,
        stock: validation.data!.stock,
      });
      successCount++;
    } catch (error) {
      errors.push({
        row: i + 2,
        message: error instanceof Error ? error.message : '寫入資料庫失敗',
        data: validation.data,
      });
    }
  }

  // 更新匯入記錄
  await db.update(importRecords)
    .set({
      successRows: successCount,
      failedRows: errors.length,
      status: errors.length === rows.length ? 'failed' : 'completed',
      errorLog: errors.length > 0 ? errors : null,
      completedAt: new Date(),
    })
    .where(eq(importRecords.id, importRecord.id));

  return {
    success: errors.length < rows.length,
    totalRows: rows.length,
    successRows: successCount,
    failedRows: errors.length,
    errors,
    importRecordId: importRecord.id,
  };
}

/**
 * 匯入員工資料
 */
export async function importStaff(
  organizationId: number,
  userId: number,
  csvContent: string,
  fileName: string
): Promise<ImportResult> {
  const db = await getDb();
  if (!db) {
    return {
      success: false,
      totalRows: 0,
      successRows: 0,
      failedRows: 0,
      errors: [{ row: 0, message: '資料庫連線失敗' }],
    };
  }

  const { rows } = parseCSV(csvContent);
  const errors: ImportError[] = [];
  let successCount = 0;

  // 建立匯入記錄
  const [importRecord] = await db.insert(importRecords).values({
    organizationId,
    userId,
    importType: 'staff',
    fileName,
    totalRows: rows.length,
    status: 'processing',
    startedAt: new Date(),
  }).$returningId();

  for (let i = 0; i < rows.length; i++) {
    const validation = validateStaffRow(rows[i], i + 2);
    
    if (!validation.valid) {
      errors.push(validation.error!);
      continue;
    }

    try {
      await db.insert(staff).values({
        organizationId,
        name: validation.data!.name,
        phone: validation.data!.phone,
        email: validation.data!.email,
        position: validation.data!.position,
        department: validation.data!.department,
        hireDate: validation.data!.hireDate ? new Date(validation.data!.hireDate) : null,
        salary: validation.data!.salary?.toString(),
        salaryType: validation.data!.salaryType,
      });
      successCount++;
    } catch (error) {
      errors.push({
        row: i + 2,
        message: error instanceof Error ? error.message : '寫入資料庫失敗',
        data: validation.data,
      });
    }
  }

  // 更新匯入記錄
  await db.update(importRecords)
    .set({
      successRows: successCount,
      failedRows: errors.length,
      status: errors.length === rows.length ? 'failed' : 'completed',
      errorLog: errors.length > 0 ? errors : null,
      completedAt: new Date(),
    })
    .where(eq(importRecords.id, importRecord.id));

  return {
    success: errors.length < rows.length,
    totalRows: rows.length,
    successRows: successCount,
    failedRows: errors.length,
    errors,
    importRecordId: importRecord.id,
  };
}

/**
 * 取得匯入記錄列表
 */
export async function getImportRecords(
  organizationId: number,
  options?: { type?: string; limit?: number }
): Promise<any[]> {
  const db = await getDb();
  if (!db) return [];

  let query = db.select().from(importRecords)
    .where(eq(importRecords.organizationId, organizationId))
    .orderBy(importRecords.createdAt);

  // Note: Type filtering and limit would need additional query building
  const results = await query;
  return results;
}

/**
 * 產生匯入範本 CSV
 */
export function generateImportTemplate(type: 'customer' | 'product' | 'staff'): string {
  const templates: Record<string, string> = {
    customer: '姓名,電話,信箱,性別,生日,地址,會員等級,備註,來源\n張小明,0912345678,test@example.com,男,1990-01-15,台北市信義區,銅,VIP客戶,官網',
    product: '名稱,描述,分類,類型,價格,成本價,時長,庫存\n玻尿酸注射,臉部填充療程,微整形,服務,15000,8000,60,\n保濕面膜,深層保濕,保養品,產品,1200,600,,100',
    staff: '姓名,電話,信箱,職位,部門,入職日期,薪資,薪資類型\n王美麗,0923456789,wang@clinic.com,美容師,美容部,2023-06-01,45000,月薪',
  };

  return templates[type] || '';
}
