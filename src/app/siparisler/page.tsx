
"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MoreVertical, ShoppingCart, Eye } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useOffers } from '@/hooks/use-offers';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

export default function OrdersPage() {
  const { offers, isLoaded } = useOffers();
  const router = useRouter();

  const orders = offers
    .filter(offer => offer.isOrder)
    .sort((a, b) => (new Date(b.orderDate!) > new Date(a.orderDate!) ? 1 : -1));

  const formatCurrency = (value: number) => {
    return value.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const handleViewOffer = (offerId: string) => {
    router.push(`/teklif-olustur?offerId=${offerId}`);
  };

  if (!isLoaded) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Siparişler</CardTitle>
          <CardDescription>Onaylanmış ve siparişe dönüştürülmüş teklifleriniz.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sipariş No</TableHead>
                <TableHead>Müşteri</TableHead>
                <TableHead>Sipariş Tarihi</TableHead>
                <TableHead className="text-right">Tutar</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-28" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-20 ml-auto" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-8 rounded-full" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    );
  }
  
  if (orders.length === 0) {
      return (
        <div className="flex justify-center items-start pt-20">
          <Card className="w-full max-w-md text-center shadow-lg">
            <CardHeader className="items-center">
              <div className="mx-auto bg-primary rounded-full p-4 w-fit mb-4">
                <ShoppingCart className="h-12 w-12 text-primary-foreground" />
              </div>
              <CardTitle className="text-2xl font-bold">Henüz Sipariş Yok</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Onaylanmış tekliflerinizi "Verilen Teklifler" sayfasından siparişe dönüştürebilirsiniz.
              </p>
               <Button onClick={() => router.push('/eski-teklifler')} className="mt-4">
                Tekliflere Git
              </Button>
            </CardContent>
          </Card>
        </div>
      );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Siparişler</CardTitle>
        <CardDescription>Onaylanmış ve siparişe dönüştürülmüş teklifleriniz.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Sipariş No</TableHead>
              <TableHead>Müşteri</TableHead>
              <TableHead>Sipariş Tarihi</TableHead>
              <TableHead className="text-right">Tutar</TableHead>
              <TableHead className="w-[50px]"><span className="sr-only">Eylemler</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id} className="cursor-pointer" onClick={() => handleViewOffer(order.id)}>
                <TableCell className="font-medium">{order.offerNumber}</TableCell>
                <TableCell>{order.customerName}</TableCell>
                <TableCell>
                  {order.orderDate ? format(new Date(order.orderDate), "dd.MM.yyyy - HH:mm", { locale: tr }) : '-'}
                </TableCell>
                <TableCell className="text-right font-mono">{formatCurrency(order.grandTotal)} ₺</TableCell>
                 <TableCell onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                          <span className="sr-only">{order.offerNumber} için eylemler</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewOffer(order.id)}>
                            <Eye className="mr-2 h-4 w-4" />
                            <span>Siparişi Görüntüle</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
