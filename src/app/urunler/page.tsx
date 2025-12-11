
"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreVertical, PlusCircle, RefreshCw, ChevronDown, ChevronUp, Trash2, Edit } from 'lucide-react';
import { useProducts } from '@/hooks/use-products';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import type { Product } from '@/lib/types';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ProductEditModal } from '@/components/product-edit-modal';

export default function ProductsPage() {
  const { products, isLoaded, deleteProduct, deleteProducts, addProducts, updateProduct, updateUsdPrices } = useProducts();
  const { toast } = useToast();
  const [newRate, setNewRate] = useState('');
  const [isRateUpdateModalOpen, setIsRateUpdateModalOpen] = useState(false);
  const [expandedProductId, setExpandedProductId] = useState<string | null>(null);

  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [isBulkDeleteConfirmOpen, setBulkDeleteConfirmOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productInModal, setProductInModal] = useState<Partial<Product> | null>(null);
  
  const handleConfirmRateUpdate = () => {
    const rate = parseFloat(newRate);
    if (!rate || rate <= 0) {
        toast({
            variant: "destructive",
            title: "Geçersiz Kur",
            description: "Lütfen geçerli bir döviz kuru girin.",
        });
        return;
    }
    updateUsdPrices(rate);
    setNewRate('');
    setIsRateUpdateModalOpen(false);
  };
  
  const toggleDescription = (productId: string) => {
    setExpandedProductId(prevId => prevId === productId ? null : productId);
  }

  const formatCurrency = (value: number) => {
    return value.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  const handleSelectAll = (checked: boolean) => {
      setSelectedProductIds(checked ? products.map(p => p.id) : []);
  }

  const handleSelectOne = (productId: string, checked: boolean) => {
      setSelectedProductIds(prev =>
          checked ? [...prev, productId] : prev.filter(id => id !== productId)
      );
  }
  
  const isAllSelected = products.length > 0 && selectedProductIds.length === products.length;

  const handleBulkDelete = () => {
      deleteProducts(selectedProductIds);
      setSelectedProductIds([]);
      setBulkDeleteConfirmOpen(false);
  }

  const handleDeleteOne = (product: Product) => {
      setProductToDelete(product);
  }

  const confirmDeleteOne = () => {
    if (productToDelete) {
        deleteProduct(productToDelete.id);
        setProductToDelete(null);
    }
  }

  const handleOpenModal = (product?: Product) => {
      setProductInModal(product ? { ...product } : { name: '', description: '', sellingPrice: 0, vatRate: 20 });
      setIsModalOpen(true);
  }

  const handleSaveProduct = (productData: Omit<Product, 'id'> | Product) => {
      if ('id' in productData) {
          updateProduct(productData);
      } else {
          addProducts([productData]);
      }
      setIsModalOpen(false);
      setProductInModal(null);
  }
  
  return (
    <>
      <Card>
        <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-xl">Ürünler ve Hizmetler</CardTitle>
            <CardDescription className="text-xs">Kayıtlı tüm ürün ve hizmetlerin listesi.</CardDescription>
          </div>
           <div className="flex flex-wrap items-center justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => { setNewRate(''); setIsRateUpdateModalOpen(true); }}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Kur Güncelle
                </Button>
                <Button variant="outline" onClick={() => handleOpenModal()}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Yeni Ürün Ekle
                </Button>
                <Link href="/urun-yukle" passHref>
                  <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Yapay Zeka ile Ekle
                  </Button>
                </Link>
          </div>
        </CardHeader>
        <CardContent>
          {selectedProductIds.length > 0 && (
            <div className="flex items-center gap-4 p-2 mb-4 rounded-md border bg-muted/50">
              <p className="text-sm text-muted-foreground">{selectedProductIds.length} ürün seçildi.</p>
              <Button variant="destructive" size="sm" onClick={() => setBulkDeleteConfirmOpen(true)}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Seçilenleri Sil
              </Button>
            </div>
          )}
          <Table>
            <TableHeader>
              <TableRow className="text-xs">
                <TableHead className="w-[50px]">
                  <Checkbox 
                    checked={isAllSelected}
                    onCheckedChange={(checked) => handleSelectAll(!!checked)}
                    aria-label="Tümünü seç"
                  />
                </TableHead>
                <TableHead>Ürün Adı</TableHead>
                <TableHead className="hidden sm:table-cell">Marka</TableHead>
                <TableHead className="hidden md:table-cell">Tedarikçi</TableHead>
                <TableHead className="hidden md:table-cell">Kategori</TableHead>
                <TableHead className="text-center">Kdv %</TableHead>
                <TableHead className="text-right hidden lg:table-cell">Alış Fiyatı</TableHead>
                <TableHead className="text-right">Satış Fiyatı</TableHead>
                <TableHead className="w-[50px]"><span className="sr-only">Eylemler</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!isLoaded && Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                      <TableCell><Skeleton className="h-5 w-5" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                      <TableCell className="hidden sm:table-cell"><Skeleton className="h-5 w-24" /></TableCell>
                      <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-24" /></TableCell>
                      <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-24" /></TableCell>
                      <TableCell className="text-center"><Skeleton className="h-5 w-10 mx-auto" /></TableCell>
                      <TableCell className="text-right hidden lg:table-cell"><Skeleton className="h-5 w-20 ml-auto" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-5 w-20 ml-auto" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-8 rounded-full" /></TableCell>
                  </TableRow>
              ))}
              {isLoaded && products.map((product) => (
                <React.Fragment key={product.id}>
                  <TableRow 
                    data-state={selectedProductIds.includes(product.id) ? "selected" : ""}
                    className="text-xs"
                  >
                    <TableCell>
                      <Checkbox 
                        checked={selectedProductIds.includes(product.id)}
                        onCheckedChange={(checked) => handleSelectOne(product.id, !!checked)}
                        aria-label={`${product.name} seç`}
                      />
                    </TableCell>
                    <TableCell 
                        className={cn("font-medium", product.description && "cursor-pointer")}
                        onClick={() => product.description && toggleDescription(product.id)}
                    >
                       <div className="flex items-center gap-2">
                        <span>{product.name}</span>
                        {product.description && (
                          expandedProductId === product.id 
                            ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> 
                            : <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">{product.brand || '-'}</TableCell>
                    <TableCell className="hidden md:table-cell">{product.company || '-'}</TableCell>
                    <TableCell className="hidden md:table-cell">
                        {product.category}
                        {product.subCategory && <span className="text-muted-foreground"> / {product.subCategory}</span>}
                    </TableCell>
                    <TableCell className="text-center">{product.vatRate ?? 20}%</TableCell>
                    <TableCell className="text-right hidden lg:table-cell">
                      {product.purchasePrice != null ? (
                          <div>
                              <div>{formatCurrency(product.purchasePrice)} ₺</div>
                              {product.currency === 'USD' && product.originalPurchasePrice != null && (
                                  <div className="text-[11px] text-muted-foreground font-mono">
                                  (${product.originalPurchasePrice.toFixed(2)} @ {product.exchangeRate})
                                  </div>
                              )}
                          </div>
                      ) : (
                          '-'
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div>{formatCurrency(product.sellingPrice)} ₺</div>
                      {product.currency === 'USD' && product.originalSellingPrice != null && (
                        <div className="text-[11px] text-muted-foreground font-mono">
                          (${product.originalSellingPrice.toFixed(2)} @ {product.exchangeRate})
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()}>
                            <MoreVertical className="h-4 w-4" />
                            <span className="sr-only">{product.name} için eylemler</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleOpenModal(product)}>
                              <Edit className="mr-2 h-4 w-4" />
                              <span>Düzenle</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteOne(product)} className="text-destructive focus:text-destructive-foreground focus:bg-destructive">
                             <Trash2 className="mr-2 h-4 w-4" />
                             <span>Sil</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                  {expandedProductId === product.id && product.description && (
                    <TableRow className="bg-muted/20 hover:bg-muted/20">
                      <TableCell colSpan={9} className="py-2 px-6 text-xs text-muted-foreground whitespace-pre-wrap">
                        {product.description}
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))}
              {isLoaded && products.length === 0 && (
                  <TableRow>
                      <TableCell colSpan={9} className="py-10 text-center text-muted-foreground text-xs">
                          Henüz hiç ürün eklenmemiş.
                      </TableCell>
                  </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <Dialog open={isRateUpdateModalOpen} onOpenChange={setIsRateUpdateModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Dolar Kurunu Güncelle</DialogTitle>
            <DialogDescription>
              USD para birimine sahip ürünlerin ₺ fiyatlarını yeni kur üzerinden yeniden hesaplayın. Bu işlem geri alınamaz.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="rate-input" className="text-right">
                Yeni Kur (₺)
              </Label>
              <Input
                id="rate-input"
                type="number"
                placeholder="Örn: 32.50"
                className="col-span-3"
                value={newRate}
                onChange={(e) => setNewRate(e.target.value)}
                min="0"
                step="0.01"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRateUpdateModalOpen(false)}>İptal</Button>
            <Button onClick={handleConfirmRateUpdate}>Evet, Güncelle</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isBulkDeleteConfirmOpen} onOpenChange={setBulkDeleteConfirmOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>{selectedProductIds.length} Ürünü Silmeyi Onaylıyor musunuz?</AlertDialogTitle>
                <AlertDialogDescription>
                    Bu işlem seçili ürünleri kalıcı olarak silecektir. Bu işlem geri alınamaz.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>İptal</AlertDialogCancel>
                <AlertDialogAction onClick={handleBulkDelete} className="bg-destructive hover:bg-destructive/90">Evet, Sil</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!productToDelete} onOpenChange={(open) => !open && setProductToDelete(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>"{productToDelete?.name}" ürününü silmeyi onaylıyor musunuz?</AlertDialogTitle>
                <AlertDialogDescription>
                    Bu işlem ürünü kalıcı olarak silecektir. Bu işlem geri alınamaz.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setProductToDelete(null)}>İptal</AlertDialogCancel>
                <AlertDialogAction onClick={confirmDeleteOne} className="bg-destructive hover:bg-destructive/90">Evet, Sil</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ProductEditModal
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        product={productInModal}
        onSave={handleSaveProduct}
      />
    </>
  );
}
