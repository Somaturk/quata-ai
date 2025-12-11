
"use client";

import { useState, useEffect, useCallback } from 'react';
import type { Product } from '@/lib/types';
import { useToast } from './use-toast';

const mockProducts: Product[] = [
    { id: 'p3', name: 'Danışmanlık Hizmeti (Saatlik)', description: 'Uzman danışmanlarımızdan saatlik destek.', sellingPrice: 350, brand: 'ConsultCo', category: 'Hizmet', subCategory: 'Danışmanlık', company: 'ConsultCo', vatRate: 20, photoUrl: 'https://placehold.co/400x300.png' },
];

const STORAGE_KEY = 'onequata-products';

export function useProducts() {
    const { toast } = useToast();
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        try {
            const storedItems = window.localStorage.getItem(STORAGE_KEY);
            if (storedItems) {
                setProducts(JSON.parse(storedItems));
            } else {
                setProducts(mockProducts);
                window.localStorage.setItem(STORAGE_KEY, JSON.stringify(mockProducts));
            }
        } catch (error) {
            console.error("Failed to load products from localStorage", error);
            setProducts(mockProducts);
        }
        setIsLoaded(true);
    }, []);

    const updateLocalStorage = (updatedProducts: Product[]) => {
        try {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedProducts));
        } catch (error) {
            console.error("Failed to save products to localStorage", error);
        }
    };

    const addProducts = useCallback((newProducts: Omit<Product, 'id'>[]): Product[] => {
        const productsWithIds = newProducts.map(p => ({ ...p, id: `p${Date.now()}${Math.random().toString(36).substring(2, 9)}`, vatRate: p.vatRate ?? 20 }));
        setProducts(prevProducts => {
            const updatedProducts = [...prevProducts, ...productsWithIds];
            updateLocalStorage(updatedProducts);
            return updatedProducts;
        });

        if (productsWithIds.length === 1) {
            toast({ title: "Ürün Eklendi", description: `${productsWithIds[0].name} başarıyla listeye eklendi.` });
        } else {
             toast({ title: "Ürünler Eklendi", description: `${productsWithIds.length} ürün başarıyla listeye eklendi.` });
        }
        return productsWithIds;
    }, [toast]);
    
    const updateProduct = useCallback((updatedProductData: Product) => {
        setProducts(prevProducts => {
            const updatedProducts = prevProducts.map(p => p.id === updatedProductData.id ? updatedProductData : p);
            updateLocalStorage(updatedProducts);
            return updatedProducts;
        });
        toast({ title: "Ürün Güncellendi", description: `${updatedProductData.name} başarıyla güncellendi.` });
    }, [toast]);

    const deleteProduct = useCallback((productId: string) => {
        let productToDelete: Product | undefined;
        setProducts(prevProducts => {
            productToDelete = prevProducts.find(p => p.id === productId);
            const updatedProducts = prevProducts.filter(p => p.id !== productId);
            updateLocalStorage(updatedProducts);
            return updatedProducts;
        });

        if (productToDelete) {
            toast({ title: "Ürün Silindi", description: `${productToDelete.name} listeden kaldırıldı.`, variant: 'destructive' });
        }
    }, [toast]);

    const deleteProducts = useCallback((productIds: string[]) => {
        if (productIds.length === 0) return;
        setProducts(prevProducts => {
            const updatedProducts = prevProducts.filter(p => !productIds.includes(p.id));
            updateLocalStorage(updatedProducts);
            return updatedProducts;
        });
        toast({
            title: "Ürünler Silindi",
            description: `${productIds.length} adet ürün listeden kaldırıldı.`,
            variant: 'destructive'
        });
    }, [toast]);

    const updateUsdPrices = useCallback((newRate: number) => {
        let updatedCount = 0;
        setProducts(prevProducts => {
            const updatedProducts = prevProducts.map(p => {
                if (p.currency === 'USD' && p.originalSellingPrice) {
                    updatedCount++;
                    return {
                        ...p,
                        sellingPrice: parseFloat((p.originalSellingPrice * newRate).toFixed(2)),
                        purchasePrice: p.originalPurchasePrice ? parseFloat((p.originalPurchasePrice * newRate).toFixed(2)) : undefined,
                        exchangeRate: newRate,
                    };
                }
                return p;
            });

            if (updatedCount > 0) {
                updateLocalStorage(updatedProducts);
            }
            return updatedProducts;
        });

        if (updatedCount > 0) {
            toast({
                title: "Fiyatlar Güncellendi",
                description: `${updatedCount} adet USD fiyatlı ürünün ₺ karşılığı yeni kur (${newRate}) ile güncellendi.`
            });
        } else {
            toast({
                title: "Güncelleme Yapılmadı",
                description: "Listede USD fiyatlı güncellenecek ürün bulunamadı."
            });
        }

    }, [toast]);

    return { products, isLoaded, addProducts, updateProduct, deleteProduct, deleteProducts, updateUsdPrices };
}
