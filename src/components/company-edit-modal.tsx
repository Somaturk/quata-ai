
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import type { Company } from '@/lib/types';

interface CompanyEditModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  company: Partial<Company> | null;
  onSave: (company: Omit<Company, 'id'> | Company) => void;
}

export function CompanyEditModal({ isOpen, onOpenChange, company, onSave }: CompanyEditModalProps) {
  const [companyInModal, setCompanyInModal] = useState<Partial<Company> | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      setCompanyInModal(company || { name: '', address: '', contactPerson: '', contactEmail: '', type: 'customer' });
    } else {
      setCompanyInModal(null);
    }
  }, [company, isOpen]);

  const handleModalFieldChange = (field: keyof Company, value: any) => {
    if (companyInModal) {
      setCompanyInModal({ ...companyInModal, [field]: value });
    }
  };

  const handleSaveCompany = () => {
    if (!companyInModal || !companyInModal.name) {
      toast({ variant: 'destructive', title: 'Eksik Bilgi', description: 'Lütfen bir firma adı girin.' });
      return;
    }
    if (!companyInModal.type) {
        toast({ variant: 'destructive', title: 'Eksik Bilgi', description: 'Lütfen bir firma tipi seçin.' });
        return;
    }
    onSave(companyInModal as Company | Omit<Company, 'id'>);
    onOpenChange(false);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{companyInModal?.id ? 'Firmayı Düzenle' : 'Yeni Firma Ekle'}</DialogTitle>
          <DialogDescription>{companyInModal?.id ? 'Firma bilgilerini güncelleyin.' : 'Yeni bir firma oluşturun.'}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="type" className="text-right">Tip</Label>
                <Select 
                  value={companyInModal?.type || ''} 
                  onValueChange={(value) => handleModalFieldChange('type', value)}
                >
                    <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Firma tipi seçin" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="customer">Müşteri</SelectItem>
                        <SelectItem value="supplier">Tedarikçi</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">Ad</Label>
                <Input id="name" value={companyInModal?.name || ''} onChange={e => handleModalFieldChange('name', e.target.value)} className="col-span-3"/>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="address" className="text-right">Adres</Label>
                <Input id="address" value={companyInModal?.address || ''} onChange={e => handleModalFieldChange('address', e.target.value)} className="col-span-3"/>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="contactPerson" className="text-right">Yetkili</Label>
                <Input id="contactPerson" value={companyInModal?.contactPerson || ''} onChange={e => handleModalFieldChange('contactPerson', e.target.value)} className="col-span-3"/>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="contactEmail" className="text-right">E-posta</Label>
                <Input id="contactEmail" type="email" value={companyInModal?.contactEmail || ''} onChange={e => handleModalFieldChange('contactEmail', e.target.value)} className="col-span-3"/>
            </div>
        </div>
        <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>İptal</Button>
            <Button onClick={handleSaveCompany}>Kaydet</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
