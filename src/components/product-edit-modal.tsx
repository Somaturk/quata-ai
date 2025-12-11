
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCompanies } from '@/hooks/use-companies';
import { useToast } from '@/hooks/use-toast';
import type { Product } from '@/lib/types';

interface ProductEditModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  product: Partial<Product> | null;
  onSave: (product: Omit<Product, 'id'> | Product) => void;
}

const mockCategories = [
    { name: 'Yazılım', subCategories: ['Ek Modül', 'Ana Paket', 'Yıllık Bakım'] },
    { name: 'Donanım', subCategories: ['Bilgisayar', 'Barkod Okuyucu', 'Barkod Yazıcı', 'POS Terminal'] },
    { name: 'Hizmet', subCategories: ['Danışmanlık', 'Teknik Servis', 'Eğitim'] },
    { name: 'Elektronik', subCategories: [] },
    { name: 'POS Sistemleri', subCategories: [] },
    { name: 'Genel', subCategories: [] },
    { name: 'Diğer', subCategories: [] },
];

export function ProductEditModal({ isOpen, onOpenChange, product, onSave }: ProductEditModalProps) {
  const [productInModal, setProductInModal] = useState<Partial<Product> | null>(null);
  const { companies } = useCompanies();
  const { toast } = useToast();

  const suppliers = useMemo(() => companies.filter(c => c.type === 'supplier'), [companies]);

  useEffect(() => {
    // When the modal is opened, sync the state with the passed product prop.
    // If a product is passed, use it; otherwise, create a default new product structure.
    if (isOpen) {
      setProductInModal(product || { name: '', description: '', sellingPrice: 0, vatRate: 20 });
    } else {
      // When closing, reset the state.
      setProductInModal(null);
    }
  }, [product, isOpen]);

  const handleModalFieldChange = (field: keyof Product, value: any) => {
    if (productInModal) {
      const newProductState = { ...productInModal, [field]: value };
      if (field === 'category') {
        newProductState.subCategory = '';
      }
      setProductInModal(newProductState);
    }
  };

  const handleSaveProduct = () => {
    if (!productInModal || !productInModal.name || !productInModal.sellingPrice || productInModal.sellingPrice <= 0) {
      toast({ variant: 'destructive', title: 'Eksik Bilgi', description: 'Lütfen ürün adı ve geçerli bir satış fiyatı girin.' });
      return;
    }
    onSave(productInModal as Product | Omit<Product, 'id'>);
    onOpenChange(false);
  };
  
  const selectedCategoryObject = productInModal?.category 
    ? mockCategories.find(c => c.name === productInModal.category)
    : null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{productInModal?.id ? 'Ürünü Düzenle' : 'Yeni Ürün Ekle'}</DialogTitle>
          <DialogDescription>{productInModal?.id ? 'Ürün bilgilerini güncelleyin.' : 'Yeni bir ürün veya hizmet oluşturun.'}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-6">
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">Ad</Label>
                <Input id="name" value={productInModal?.name || ''} onChange={e => handleModalFieldChange('name', e.target.value)} className="col-span-3"/>
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="description" className="text-right pt-2">Açıklama</Label>
                <Textarea id="description" value={productInModal?.description || ''} onChange={e => handleModalFieldChange('description', e.target.value)} className="col-span-3" rows={4}/>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="brand" className="text-right">Marka</Label>
                <Input id="brand" value={productInModal?.brand || ''} onChange={e => handleModalFieldChange('brand', e.target.value)} className="col-span-3"/>
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="company" className="text-right">Tedarikçi</Label>
                <Select value={productInModal?.company} onValueChange={(value) => handleModalFieldChange('company', value)}>
                    <SelectTrigger className="col-span-3"><SelectValue placeholder="Tedarikçi seçiniz" /></SelectTrigger>
                    <SelectContent>
                        {suppliers.map(company => (<SelectItem key={company.id} value={company.name}>{company.name}</SelectItem>))}
                    </SelectContent>
                </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">Kategori</Label>
                <Select value={productInModal?.category} onValueChange={(value) => handleModalFieldChange('category', value)}>
                    <SelectTrigger className="col-span-3"><SelectValue placeholder="Kategori seçiniz" /></SelectTrigger>
                    <SelectContent>
                        {mockCategories.map(category => (<SelectItem key={category.name} value={category.name}>{category.name}</SelectItem>))}
                    </SelectContent>
                </Select>
            </div>
            {selectedCategoryObject && selectedCategoryObject.subCategories.length > 0 && (
               <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="subCategory" className="text-right">Alt Kategori</Label>
                  <Select value={productInModal?.subCategory} onValueChange={(value) => handleModalFieldChange('subCategory', value)}>
                      <SelectTrigger className="col-span-3"><SelectValue placeholder="Alt Kategori seçiniz" /></SelectTrigger>
                      <SelectContent>
                          {selectedCategoryObject.subCategories.map(sub => (<SelectItem key={sub} value={sub}>{sub}</SelectItem>))}
                      </SelectContent>
                  </Select>
              </div>
            )}
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="vatRate" className="text-right">KDV (%)</Label>
                <Input id="vatRate" type="number" value={productInModal?.vatRate ?? ''} onChange={e => handleModalFieldChange('vatRate', Number(e.target.value))} className="col-span-3"/>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="purchasePrice" className="text-right">Alış Fiyatı (₺)</Label>
                <Input id="purchasePrice" type="number" value={productInModal?.purchasePrice ?? ''} onChange={e => handleModalFieldChange('purchasePrice', Number(e.target.value))} className="col-span-3"/>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="sellingPrice" className="text-right">Satış Fiyatı (₺)</Label>
                <Input id="sellingPrice" type="number" value={productInModal?.sellingPrice ?? ''} onChange={e => handleModalFieldChange('sellingPrice', Number(e.target.value))} className="col-span-3"/>
            </div>
        </div>
        <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>İptal</Button>
            <Button onClick={handleSaveProduct}>Kaydet</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
