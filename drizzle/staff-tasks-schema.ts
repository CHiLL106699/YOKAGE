import {
  pgTable, serial, integer, varchar, text, timestamp, boolean,
} from 'drizzle-orm/pg-core';

/**
 * 員工任務表 — 用於 LiffStaffTasksPage
 */
export const staffTasks = pgTable('staff_tasks', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id').notNull(),
  staffId: integer('staff_id').notNull(),
  type: varchar('type', { length: 50 }).notNull().default('general'), // appointment, follow_up, inventory, general
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  priority: varchar('priority', { length: 20 }).notNull().default('normal'), // high, normal, low
  status: varchar('status', { length: 20 }).notNull().default('pending'), // pending, in_progress, completed
  dueDate: timestamp('due_date'),
  dueTime: varchar('due_time', { length: 10 }), // HH:mm format
  relatedCustomerId: integer('related_customer_id'),
  relatedCustomerName: varchar('related_customer_name', { length: 255 }),
  relatedCustomerPhone: varchar('related_customer_phone', { length: 20 }),
  notes: text('notes'),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export type StaffTask = typeof staffTasks.$inferSelect;
export type InsertStaffTask = typeof staffTasks.$inferInsert;

/**
 * 購物車表 — 用於 LiffCartPage
 */
export const cartItems = pgTable('cart_items', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id').notNull(),
  customerId: integer('customer_id').notNull(),
  productId: integer('product_id').notNull(),
  productName: varchar('product_name', { length: 255 }).notNull(),
  productImage: text('product_image'),
  specs: varchar('specs', { length: 255 }),
  price: integer('price').notNull(), // 以整數存，前端除以 100 或直接用
  originalPrice: integer('original_price'),
  quantity: integer('quantity').notNull().default(1),
  selected: boolean('selected').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export type CartItem = typeof cartItems.$inferSelect;
export type InsertCartItem = typeof cartItems.$inferInsert;
