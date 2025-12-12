"use client";

import { useState, useEffect, useCallback } from 'react';
import type { Product } from '@/lib/types';
import { useToast } from './use-toast';
import { db } from '@/lib/db';

// Mock data used only if DB is empty on first load
const mockProducts: Product[] = [
    {
        id: 'p3',
        name: 'Danışmanlık Hizmeti (Saatlik)',
        description: 'Uzman danışmanlarımızdan saatlik destek.',
        sellingPrice: 350,
        brand: 'ConsultCo',
        category: 'Hizmet',
        subCategory: 'Danışmanlık',
        company: 'ConsultCo',
        vatRate: 20,
        photoUrl: 'https://placehold.co/400x300.png',
    },
];

export function useProducts() {
    const { toast } = useToast();
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    const refresh = async () => {
        const all = await db.products.toArray();
        setProducts(all);
    };

    // One‑time migration from localStorage to IndexedDB, then load data
    useEffect(() => {
        const migrate = async () => {
            try {
                const stored = window.localStorage.getItem('onequata-products');
                if (stored) {
                    const oldProducts: Product[] = JSON.parse(stored);
                    await db.products.bulkPut(
                        oldProducts.map(p => ({ ...p, id: p.id || `p_${crypto.randomUUID()}` }))
                    );
                    window.localStorage.removeItem('onequata-products');
                }
            } catch (e) {
                console.error('Product migration error', e);
            }
        };
        const load = async () => {
            try {
                const all = await db.products.toArray();
                if (all.length === 0) {
                    await db.products.bulkPut(mockProducts);
                    setProducts(mockProducts);
                } else {
                    setProducts(all);
                }
            } catch (error) {
                console.error('Failed to load products from IndexedDB', error);
                setProducts(mockProducts);
            }
            setIsLoaded(true);
        };
        migrate().then(load);
    }, []);

    const addProducts = useCallback(async (newProducts: Omit<Product, 'id'>[]) => {
        const productsWithIds = newProducts.map(p => ({
            ...p,
            id: `p_${crypto.randomUUID()}`,
            vatRate: p.vatRate ?? 20,
        }));
        try {
            await db.products.bulkPut(productsWithIds);
            await refresh();
            if (productsWithIds.length === 1) {
                toast({ title: 'Ürün Eklendi', description: `${productsWithIds[0].name} başarıyla listeye eklendi.` });
            } else {
                toast({ title: 'Ürünler Eklendi', description: `${productsWithIds.length} ürün başarıyla listeye eklendi.` });
            }
            return productsWithIds;
        } catch (error) {
            console.error('Failed to add products to Dexie', error);
            toast({ title: 'Hata', description: 'Ürün eklenirken bir sorun oluştu.', variant: 'destructive' });
            return [];
        }
    }, [toast]);

    const updateProduct = useCallback(async (updatedProduct: Product) => {
        try {
            await db.products.update(updatedProduct.id, updatedProduct);
            await refresh();
            toast({ title: 'Ürün Güncellendi', description: `${updatedProduct.name} başarıyla güncellendi.` });
        } catch (error) {
            console.error('Failed to update product in Dexie', error);
            toast({ title: 'Hata', description: 'Ürün güncellenirken bir sorun oluştu.', variant: 'destructive' });
        }
    }, [toast]);

    const deleteProduct = useCallback(async (productId: string) => {
        try {
            await db.products.delete(productId);
            await refresh();
            toast({ title: 'Ürün Silindi', description: 'Ürün silindi.', variant: 'destructive' });
        } catch (error) {
            console.error('Failed to delete product from Dexie', error);
            toast({ title: 'Hata', description: 'Ürün silinirken bir sorun oluştu.', variant: 'destructive' });
        }
    }, [toast]);

    const deleteProducts = useCallback(async (productIds: string[]) => {
        if (productIds.length === 0) return;
        try {
            await db.products.bulkDelete(productIds);
            await refresh();
            toast({ title: 'Ürünler Silindi', description: `${productIds.length} adet ürün listeden kaldırıldı.`, variant: 'destructive' });
        } catch (error) {
            console.error('Failed to delete products from Dexie', error);
            toast({ title: 'Hata', description: 'Ürünler silinirken bir sorun oluştu.', variant: 'destructive' });
        }
    }, [toast]);

    const updateUsdPrices = useCallback(async (newRate: number) => {
        let updatedCount = 0;
        const productsToUpdate: Product[] = [];
        try {
            const currentProducts = await db.products.toArray();
            const updatedProducts = currentProducts.map(p => {
                if (p.currency === 'USD' && p.originalSellingPrice) {
                    updatedCount++;
                    const updated = {
                        ...p,
                        sellingPrice: parseFloat((p.originalSellingPrice * newRate).toFixed(2)),
                        purchasePrice: p.originalPurchasePrice ? parseFloat((p.originalPurchasePrice * newRate).toFixed(2)) : undefined,
                        exchangeRate: newRate,
                    };
                    productsToUpdate.push(updated);
                    return updated;
                }
                return p;
            });
            if (updatedCount > 0) {
                await db.products.bulkPut(productsToUpdate);
                setProducts(updatedProducts);
                toast({ title: 'Fiyatlar Güncellendi', description: `${updatedCount} adet USD fiyatlı ürünün ₺ karşılığı yeni kur (${newRate}) ile güncellendi.` });
            } else {
                toast({ title: 'Güncelleme Yapılmadı', description: 'Listede USD fiyatlı güncellenecek ürün bulunamadı.' });
            }
        } catch (error) {
            console.error('Failed to update USD prices in Dexie', error);
            toast({ title: 'Hata', description: 'USD fiyatları güncellenirken bir sorun oluştu.', variant: 'destructive' });
        }
    }, [toast]);

    return { products, isLoaded, addProducts, updateProduct, deleteProduct, deleteProducts, updateUsdPrices };
}
