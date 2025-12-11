
"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { MoreVertical, Copy, Trash2, PlusCircle, Edit, ShoppingCart, CheckCircle } from 'lucide-react';
import { useOffers } from '@/hooks/use-offers';
import type { Offer } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';


export default function OldOffersPage() {
  const { offers, isLoaded, deleteOffer, copyOffer, convertToOrder } = useOffers();
  const router = useRouter();
  const [isConfirmOpen, setConfirmOpen] = useState(false);
  const [offerToDelete, setOfferToDelete] = useState<Offer | null>(null);

  const handleDeleteClick = (e: React.MouseEvent, offer: Offer) => {
    e.stopPropagation();
    setOfferToDelete(offer);
    setConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (offerToDelete) {
      deleteOffer(offerToDelete.id);
    }
    setConfirmOpen(false);
    setOfferToDelete(null);
  };

  const handleCopyClick = (e: React.MouseEvent, offer: Offer) => {
    e.stopPropagation();
    const newOfferId = copyOffer(offer.id);
    if (newOfferId) {
      router.push(`/teklif-olustur?offerId=${newOfferId}`);
    }
  };

  const handleEditClick = (e: React.MouseEvent, offerId: string) => {
    e.stopPropagation();
    router.push(`/teklif-olustur?offerId=${offerId}`);
  };
  
  const handleRowClick = (offerId: string) => {
    router.push(`/teklif-olustur?offerId=${offerId}`);
  };

  const handleConvertToOrderClick = (e: React.MouseEvent, offerId: string) => {
    e.stopPropagation();
    convertToOrder(offerId);
  }

  const formatCurrency = (value: number) => {
    return value.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  const sortedOffers = [...offers].sort((a, b) => (new Date(b.offerDate!) > new Date(a.offerDate!) ? 1 : -1));

  return (
    <>
      <Card>
        <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <CardTitle>Verilen Teklifler</CardTitle>
            <CardDescription>Daha önce oluşturduğunuz ve müşterilerinize sunduğunuz tüm teklifler.</CardDescription>
          </div>
          <Link href="/teklif-olustur" passHref>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Yeni Teklif Oluştur
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="text-xs">
                <TableHead>Teklif No</TableHead>
                <TableHead className="hidden sm:table-cell">Müşteri</TableHead>
                <TableHead className="hidden md:table-cell">Teklif Tarihi</TableHead>
                <TableHead className="text-right">Tutar</TableHead>
                <TableHead className="w-[50px]"><span className="sr-only">Eylemler</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!isLoaded && Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell className="hidden sm:table-cell"><Skeleton className="h-5 w-32" /></TableCell>
                  <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-20" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-5 w-24 ml-auto" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-8 rounded-full" /></TableCell>
                </TableRow>
              ))}
              {isLoaded && sortedOffers.map((offer) => (
                <TableRow key={offer.id} className={cn("text-xs cursor-pointer", offer.isOrder && "bg-green-50 hover:bg-green-100/60")} onClick={() => handleRowClick(offer.id)}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                       <span>{offer.offerNumber}</span>
                       {offer.isOrder && <Badge variant="secondary" className="bg-green-100 text-green-800">SİPARİŞ</Badge>}
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">{offer.customerName}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    {offer.offerDate ? format(new Date(offer.offerDate), "dd.MM.yyyy", { locale: tr }) : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="font-mono text-sm">{formatCurrency(offer.grandTotal)} ₺</div>
                    {offer.alternativeTotal && offer.alternativeTotal > 0 && (
                      <div className="text-xs text-muted-foreground font-mono mt-1">
                        (Alt: {formatCurrency(offer.alternativeTotal)} ₺)
                      </div>
                    )}
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                          <span className="sr-only">{offer.offerNumber} için eylemler</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => handleEditClick(e, offer.id)}>
                            <Edit className="mr-2 h-4 w-4" />
                            <span>Düzenle</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => handleCopyClick(e, offer)}>
                            <Copy className="mr-2 h-4 w-4" />
                            <span>Kopyala</span>
                        </DropdownMenuItem>
                         <DropdownMenuItem 
                            onClick={(e) => handleConvertToOrderClick(e, offer.id)}
                            disabled={offer.isOrder}
                         >
                            {offer.isOrder ? <CheckCircle className="mr-2 h-4 w-4 text-green-600" /> : <ShoppingCart className="mr-2 h-4 w-4" />}
                            <span>{offer.isOrder ? 'Siparişe Dönüştürüldü' : 'Siparişe Dönüştür'}</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={(e) => handleDeleteClick(e, offer)} className="text-destructive focus:text-destructive-foreground focus:bg-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span>Sil</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {isLoaded && offers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center text-muted-foreground text-xs">
                    Henüz hiç teklif kaydedilmemiş.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <AlertDialog open={isConfirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Teklifi Silmeyi Onaylıyor musunuz?</AlertDialogTitle>
            <AlertDialogDescription>
              Bu işlem, "{offerToDelete?.offerNumber}" numaralı teklifi kalıcı olarak silecektir. Bu işlem geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">Evet, Sil</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
