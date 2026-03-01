import React, { useState, useEffect } from 'react';
import { trpc } from '@/lib/trpc';
import { QueryLoading, QueryError } from '@/components/ui/query-state';
import { toast } from 'sonner';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle, Pencil } from 'lucide-react';

// As per instructions, using inventory data to represent suppliers.
interface Supplier {
  id: string;
  name: string; // Supplier name
  productName: string;
  category: string | null;
  stock: number;
  price: number;
}

interface ProductFormData {
  id?: string;
  name: string;
  supplier: string;
  stock_quantity: number;
  price: number;
}

const SupplierProductModal: React.FC<{ 
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    product: ProductFormData | null;
}> = ({ isOpen, onClose, onSuccess, product }) => {
    const organizationId = 1; // TODO: from context
    const [formData, setFormData] = useState<ProductFormData>({ name: '', supplier: '', stock_quantity: 0, price: 0 });

    useEffect(() => {
        if (product) {
            setFormData(product);
        } else {
            setFormData({ name: '', supplier: '', stock_quantity: 0, price: 0 });
        }
    }, [product, isOpen]);

    const createMutation = (trpc as any).inventory.create.useMutation({
        onSuccess: () => {
            toast.success('品項已成功新增');
            onSuccess();
            onClose();
        },
        onError: (error: any) => {
            toast.error(`新增失敗: ${error.message}`);
        },
    });

    const updateMutation = (trpc as any).inventory.update.useMutation({
        onSuccess: () => {
            toast.success('品項已成功更新');
            onSuccess();
            onClose();
        },
        onError: (error: any) => {
            toast.error(`更新失敗: ${error.message}`);
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.id) {
            updateMutation.mutate({ id: formData.id, organizationId, ...formData });
        } else {
            createMutation.mutate({ organizationId, ...formData });
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'number' ? Number(value) : value }));
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{product ? '編輯供應商/品項' : '新增供應商/品項'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="supplier" className="text-right">供應商名稱</Label>
                            <Input id="supplier" name="supplier" value={formData.supplier} onChange={handleChange} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">產品名稱</Label>
                            <Input id="name" name="name" value={formData.name} onChange={handleChange} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="price" className="text-right">單價</Label>
                            <Input id="price" name="price" type="number" value={formData.price} onChange={handleChange} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="stock_quantity" className="text-right">庫存數量</Label>
                            <Input id="stock_quantity" name="stock_quantity" type="number" value={formData.stock_quantity} onChange={handleChange} className="col-span-3" />
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="secondary">取消</Button>
                        </DialogClose>
                        <Button type="submit" disabled={createMutation.isLoading || updateMutation.isLoading}>
                            {createMutation.isLoading || updateMutation.isLoading ? '儲存中...' : '儲存'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

const SupplierManagementPage: React.FC = () => {
  const organizationId = 1; // TODO: from context
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductFormData | null>(null);

  const utils = trpc.useContext();
  const { data: inventoryData, isLoading, error } = (trpc as any).inventory.list.useQuery({ organizationId });

  const suppliers: Supplier[] = React.useMemo(() => {
    if (!inventoryData) return [];
    return inventoryData.map((item: any) => ({
      id: item.id,
      name: item.supplier || `供應商 #${item.id.slice(0, 4)}`,
      productName: item.name,
      category: item.category?.name || '未分類',
      stock: item.stock_quantity || 0,
      price: item.price || 0,
    }));
  }, [inventoryData]);

  const handleSuccess = () => {
    utils.inventory.list.invalidate();
  };

  const handleAddNew = () => {
    setSelectedProduct(null);
    setIsModalOpen(true);
  };

  const handleEdit = (product: Supplier) => {
    setSelectedProduct({
        id: product.id,
        name: product.productName,
        supplier: product.name,
        stock_quantity: product.stock,
        price: product.price,
    });
    setIsModalOpen(true);
  };

  if (isLoading) {
    return <DashboardLayout><QueryLoading /></DashboardLayout>;
  }

  if (error) {
    return <DashboardLayout><QueryError message={error.message} /></DashboardLayout>;
  }

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">供應商與庫存管理</h1>
        <Button onClick={handleAddNew}>
          <PlusCircle className="mr-2 h-4 w-4" />
          新增供應商/品項
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>供應產品列表</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>供應商名稱</TableHead>
                <TableHead>產品名稱</TableHead>
                <TableHead>分類</TableHead>
                <TableHead>庫存數量</TableHead>
                <TableHead>單價</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {suppliers.length > 0 ? (
                suppliers.map((supplier) => (
                  <TableRow key={supplier.id}>
                    <TableCell>{supplier.name}</TableCell>
                    <TableCell>{supplier.productName}</TableCell>
                    <TableCell>{supplier.category}</TableCell>
                    <TableCell>{supplier.stock}</TableCell>
                    <TableCell>{`$${Number(supplier.price).toFixed(2)}`}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(supplier)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        編輯
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">沒有找到任何供應商或產品資料。</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <SupplierProductModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={handleSuccess}
        product={selectedProduct}
      />
    </DashboardLayout>
  );
};

export default SupplierManagementPage;
