"use client";

import { useState, useEffect, useCallback } from 'react';
import type { Offer } from '@/lib/types';
import { useToast } from './use-toast';
import { addDays } from 'date-fns';
import { db } from '@/lib/db';

// Mock data can be empty; offers are loaded from IndexedDB.
const mockOffers: Offer[] = [];

export function useOffers() {
    const { toast } = useToast();
    const [offers, setOffers] = useState<Offer[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    const refresh = async () => {
        const all = await db.offers.toArray();
        setOffers(all);
    };

    // One‑time migration from localStorage, then load data
    useEffect(() => {
        const migrate = async () => {
            try {
                const stored = window.localStorage.getItem('onequata-offers');
                if (stored) {
                    const oldOffers: Offer[] = JSON.parse(stored);
                    await db.offers.bulkPut(
                        oldOffers.map(o => ({ ...o, id: o.id || `o_${crypto.randomUUID()}` }))
                    );
                    window.localStorage.removeItem('onequata-offers');
                }
            } catch (e) {
                console.error('Offer migration error', e);
            }
        };
        const load = async () => {
            try {
                const all = await db.offers.toArray();
                if (all.length === 0) {
                    await db.offers.bulkPut(mockOffers);
                    setOffers(mockOffers);
                } else {
                    setOffers(all);
                }
            } catch (error) {
                console.error('Failed to load offers from IndexedDB', error);
                setOffers(mockOffers);
            }
            setIsLoaded(true);
        };
        migrate().then(load);
    }, []);

    const addOffer = useCallback(async (newOfferData: Omit<Offer, 'id'>) => {
        const offerWithId = { ...newOfferData, id: `o_${crypto.randomUUID()}` };
        try {
            await db.offers.add(offerWithId);
            await refresh();
            toast({ title: 'Teklif Kaydedildi', description: `${offerWithId.offerNumber} numaralı teklif başarıyla kaydedildi.` });
            return offerWithId;
        } catch (error) {
            console.error('Failed to add offer to Dexie', error);
            toast({ title: 'Hata', description: 'Teklif eklenirken bir sorun oluştu.', variant: 'destructive' });
            return undefined;
        }
    }, [toast]);

    const updateOffer = useCallback(async (updatedOfferData: Offer) => {
        try {
            await db.offers.update(updatedOfferData.id, updatedOfferData);
            await refresh();
            toast({ title: 'Teklif Güncellendi', description: `${updatedOfferData.offerNumber} numaralı teklif başarıyla güncellendi.` });
        } catch (error) {
            console.error('Failed to update offer in Dexie', error);
            toast({ title: 'Hata', description: 'Teklif güncellenirken bir sorun oluştu.', variant: 'destructive' });
        }
    }, [toast]);

    const deleteOffer = useCallback(async (offerId: string) => {
        try {
            const offer = await db.offers.get(offerId);
            await db.offers.delete(offerId);
            await refresh();
            if (offer) {
                toast({ title: 'Teklif Silindi', description: `${offer.offerNumber} numaralı teklif silindi.`, variant: 'destructive' });
            }
        } catch (error) {
            console.error('Failed to delete offer from Dexie', error);
            toast({ title: 'Hata', description: 'Teklif silinirken bir sorun oluştu.', variant: 'destructive' });
        }
    }, [toast]);

    const getOfferById = useCallback(async (offerId: string): Promise<Offer | undefined> => {
        return await db.offers.get(offerId);
    }, []);

    // Yearly offer number counter stored in localStorage for compatibility
    const getNewOfferNumber = useCallback(async () => {
        const currentYear = new Date().getFullYear();
        const counterKey = `onequata_offer_counter_${currentYear}`;
        let nextCounter = 1;
        try {
            const stored = window.localStorage.getItem(counterKey);
            if (stored) {
                nextCounter = parseInt(stored, 10) + 1;
            } else {
                const offersForYear = offers.filter(o => o.offerNumber?.startsWith(`${currentYear}-`));
                if (offersForYear.length > 0) {
                    const max = Math.max(...offersForYear.map(o => parseInt(o.offerNumber.split('-')[1], 10)));
                    nextCounter = max + 1;
                }
            }
            window.localStorage.setItem(counterKey, nextCounter.toString());
        } catch (e) {
            console.error('Error generating new offer number', e);
        }
        return `${currentYear}-${String(nextCounter).padStart(4, '0')}`;
    }, [offers]);

    const copyOffer = useCallback(async (offerId: string): Promise<string | undefined> => {
        const original = await db.offers.get(offerId);
        if (!original) {
            toast({ title: 'Hata', description: 'Kopyalanacak teklif bulunamadı.', variant: 'destructive' });
            return undefined;
        }
        const newId = `o_${crypto.randomUUID()}`;
        const newOfferNumber = await getNewOfferNumber();
        const newOffer: Offer = {
            ...original,
            id: newId,
            offerNumber: newOfferNumber,
            offerDate: new Date().toISOString(),
            validityDate: addDays(new Date(), 7).toISOString(),
            isOrder: false,
            orderDate: undefined,
        };
        const added = await addOffer(newOffer);
        return added?.id;
    }, [getNewOfferNumber, addOffer, toast]);

    const convertToOrder = useCallback(async (offerId: string) => {
        const offer = await db.offers.get(offerId);
        if (!offer) return;
        const updated = { ...offer, isOrder: true, orderDate: new Date().toISOString() };
        try {
            await db.offers.update(offerId, updated);
            await refresh();
            toast({ title: 'Siparişe Dönüştürüldü', description: `"${updated.offerNumber}" numaralı teklif başarıyla siparişe dönüştürüldü.` });
        } catch (error) {
            console.error('Failed to convert offer to order', error);
            toast({ title: 'Hata', description: 'Teklif siparişe dönüştürülürken bir sorun oluştu.', variant: 'destructive' });
        }
    }, [toast]);

    return {
        offers,
        isLoaded,
        addOffer,
        updateOffer,
        deleteOffer,
        getOfferById,
        getNewOfferNumber,
        copyOffer,
        convertToOrder,
    };
}
