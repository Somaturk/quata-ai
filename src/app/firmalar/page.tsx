
"use client";

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { MoreVertical, PlusCircle, Edit, Trash2, ArrowUpDown } from 'lucide-react';
import { useCompanies } from '@/hooks/use-companies';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Company } from '@/lib/types';
import { cn } from '@/lib/utils';
import { CompanyEditModal } from '@/components/company-edit-modal';


type SortKey = keyof Company;

export default function CompaniesPage() {
  const { companies, isLoaded, addCompany, updateCompany, deleteCompany } = useCompanies();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [companyInModal, setCompanyInModal] = useState<Partial<Company> | null>(null);
  const [companyToDelete, setCompanyToDelete] = useState<Company | null>(null);

  // States for filtering and sorting
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'customer' | 'supplier'>('all');
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'ascending' | 'descending' } | null>({ key: 'name', direction: 'ascending' });

  const handleOpenModal = (type: 'customer' | 'supplier', company?: Company) => {
      setCompanyInModal(company ? { ...company } : { name: '', address: '', contactPerson: '', contactEmail: '', type: type });
      setIsModalOpen(true);
  }
  
  const handleSaveCompany = (companyData: Omit<Company, 'id'> | Company) => {
      if ('id' in companyData) {
          updateCompany(companyData);
      } else {
          addCompany(companyData);
      }
      setIsModalOpen(false);
      setCompanyInModal(null);
  }
  
  const handleDeleteClick = (company: Company) => {
      setCompanyToDelete(company);
  }

  const confirmDelete = () => {
    if (companyToDelete) {
        deleteCompany(companyToDelete.id);
        setCompanyToDelete(null);
    }
  }

  const getCompanyTypeLabel = (type: 'customer' | 'supplier') => {
      return type === 'customer' ? 'Müşteri' : 'Tedarikçi';
  }
  
  const requestSort = (key: SortKey) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const filteredAndSortedCompanies = useMemo(() => {
    let sortableItems = [...companies];

    // Filtering
    sortableItems = sortableItems.filter(company => {
        const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'all' || company.type === filterType;
        return matchesSearch && matchesType;
    });

    // Sorting
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        const aValue = a[sortConfig.key] ?? '';
        const bValue = b[sortConfig.key] ?? '';

        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }

    return sortableItems;
  }, [companies, searchTerm, filterType, sortConfig]);

  const SortableHeader = ({ sortKey, children }: { sortKey: SortKey, children: React.ReactNode }) => (
    <TableHead
      className="cursor-pointer hover:bg-muted/50"
      onClick={() => requestSort(sortKey)}
    >
      <div className="flex items-center gap-2">
        {children}
        {sortConfig?.key === sortKey && (
            <ArrowUpDown className={cn("h-4 w-4", sortConfig.direction === 'descending' && 'rotate-180')} />
        )}
      </div>
    </TableHead>
  );

  return (
    <>
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <CardTitle>Firmalar</CardTitle>
              <CardDescription>Sistemde kayıtlı olan müşteri ve tedarikçi firmalar.</CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                <Button onClick={() => handleOpenModal('customer')} className="w-full sm:w-auto">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Yeni Müşteri Ekle
                </Button>
                <Button onClick={() => handleOpenModal('supplier')} variant="outline" className="w-full sm:w-auto">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Yeni Tedarikçi Ekle
                </Button>
            </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 mt-4 p-6 pt-0">
          <Input 
            placeholder="Firma adında ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-auto flex-grow"
          />
          <Select value={filterType} onValueChange={(value) => setFilterType(value as any)}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Firma tipi" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Firmalar</SelectItem>
              <SelectItem value="customer">Müşteriler</SelectItem>
              <SelectItem value="supplier">Tedarikçiler</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <SortableHeader sortKey="name">Firma Adı</SortableHeader>
              <SortableHeader sortKey="type">Tip</SortableHeader>
              <SortableHeader sortKey="address">Adres</SortableHeader>
              <TableHead>Yetkili Kişi</TableHead>
              <TableHead>E-posta</TableHead>
              <TableHead className="w-[50px]"><span className="sr-only">Eylemler</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!isLoaded && Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8 rounded-full" /></TableCell>
                </TableRow>
            ))}
            {isLoaded && filteredAndSortedCompanies.map((company) => (
              <TableRow key={company.id}>
                <TableCell className="font-medium">{company.name}</TableCell>
                <TableCell>{getCompanyTypeLabel(company.type)}</TableCell>
                <TableCell className="text-muted-foreground">{company.address || '-'}</TableCell>
                <TableCell>{company.contactPerson || '-'}</TableCell>
                <TableCell>{company.contactEmail || '-'}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                         <span className="sr-only">{company.name} için eylemler</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleOpenModal(company.type, company)}>
                        <Edit className="mr-2 h-4 w-4" />
                        <span>Düzenle</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDeleteClick(company)} className="text-destructive focus:text-destructive-foreground focus:bg-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        <span>Sil</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
             {isLoaded && filteredAndSortedCompanies.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-muted-foreground text-sm">
                    Arama kriterlerinize uygun firma bulunamadı.
                  </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>

    <CompanyEditModal
      isOpen={isModalOpen}
      onOpenChange={setIsModalOpen}
      company={companyInModal}
      onSave={handleSaveCompany}
    />
    
      <AlertDialog open={!!companyToDelete} onOpenChange={(open) => !open && setCompanyToDelete(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>"{companyToDelete?.name}" firmasını silmeyi onaylıyor musunuz?</AlertDialogTitle>
                <AlertDialogDescription>
                    Bu işlem firmayı kalıcı olarak silecektir. Bu işlem geri alınamaz.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setCompanyToDelete(null)}>İptal</AlertDialogCancel>
                <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">Evet, Sil</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
