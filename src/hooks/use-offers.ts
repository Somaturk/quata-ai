
"use client";

import { useState, useEffect, useCallback } from 'react';
import type { Offer } from '@/lib/types';
import { useToast } from './use-toast';
import { addDays } from 'date-fns';


const STORAGE_KEY = 'onequata-offers';

export function useOffers() {
    const { toast } = useToast();
    const [offers, setOffers] = useState<Offer[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        let storedItems: string | null = null;
        try {
            storedItems = window.localStorage.getItem(STORAGE_KEY);
        } catch (error) {
            console.error("Failed to access localStorage", error);
        }
        
        if (storedItems) {
            setOffers(JSON.parse(storedItems));
        } else {
            setOffers([]);
        }
        setIsLoaded(true);
    }, []);

    const updateLocalStorage = (updatedOffers: Offer[]) => {
        try {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedOffers));
        } catch (error) {
            toast({ variant: "destructive", title: "Hata", description: "Teklifler kaydedilirken bir hata oluştu." });
            console.error("Failed to save offers to localStorage", error);
        }
    };
    
    const incrementOfferCounter = useCallback(async () => {
        const currentYear = new Date().getFullYear();
        const counterKey = `onequata_offer_counter_${currentYear}`;
        
        try {
            const currentCounter = parseInt(window.localStorage.getItem(counterKey) || '0', 10);
            const newCounter = currentCounter + 1;
            window.localStorage.setItem(counterKey, newCounter.toString());
        } catch (error) {
            console.error("Could not increment offer counter in localStorage", error);
        }
    }, []);

    const addOffer = useCallback((newOfferData: Omit<Offer, 'id'>) => {
        const offerWithId = { ...newOfferData, id: `offer_${Date.now()}` };
        
        setOffers(prevOffers => {
            const updatedOffers = [...prevOffers, offerWithId];
            updateLocalStorage(updatedOffers);
            return updatedOffers;
        });

        // Increment the counter only after successfully adding the offer
        incrementOfferCounter();

        toast({ title: "Teklif Kaydedildi", description: `${offerWithId.offerNumber} numaralı teklif başarıyla kaydedildi.` });
        return offerWithId;
    }, [toast, incrementOfferCounter]);
    
    const updateOffer = useCallback((updatedOfferData: Offer) => {
        setOffers(prevOffers => {
            const updatedOffers = prevOffers.map(o => o.id === updatedOfferData.id ? updatedOfferData : o);
            updateLocalStorage(updatedOffers);
            return updatedOffers;
        });
        toast({ title: "Teklif Güncellendi", description: `${updatedOfferData.offerNumber} numaralı teklif başarıyla güncellendi.` });
    }, [toast]);

    const deleteOffer = useCallback((offerId: string) => {
        let offerToDelete: Offer | undefined;
        setOffers(prevOffers => {
            offerToDelete = prevOffers.find(o => o.id === offerId);
            const updatedOffers = prevOffers.filter(o => o.id !== offerId);
            updateLocalStorage(updatedOffers);
            return updatedOffers;
        });
        if (offerToDelete) {
             toast({ title: "Teklif Silindi", description: `${offerToDelete.offerNumber} numaralı teklif silindi.`, variant: 'destructive' });
        }
    }, [toast]);

    const getOfferById = useCallback((offerId: string): Offer | undefined => {
        return offers.find(o => o.id === offerId);
    }, [offers]);

    const getNewOfferNumber = useCallback(async () => {
        const currentYear = new Date().getFullYear();
        const counterKey = `onequata_offer_counter_${currentYear}`;
        let nextCounter = 1;
        try {
           const storedCounter = window.localStorage.getItem(counterKey);
           if (storedCounter) {
             nextCounter = parseInt(storedCounter, 10) + 1;
           } else {
             // If no counter for the year, check existing offers for that year to start from the correct number.
             const offersForYear = offers.filter(o => o.offerNumber.startsWith(`${currentYear}-`));
             if (offersForYear.length > 0) {
                 const maxOfferNum = Math.max(...offersForYear.map(o => parseInt(o.offerNumber.split('-')[1], 10)));
                 nextCounter = maxOfferNum + 1;
             }
           }
        } catch (error) {
            console.error("Could not read offer counter from localStorage", error);
        }
        
        const formattedCounter = String(nextCounter).padStart(4, '0');
        return `${currentYear}-${formattedCounter}`;
    }, [offers]);

    const copyOffer = useCallback((offerId: string): string | undefined => {
        const offerToCopy = offers.find(o => o.id === offerId);
        if (!offerToCopy) {
            toast({ variant: "destructive", title: "Hata", description: "Kopyalanacak teklif bulunamadı." });
            return undefined;
        }

        const newId = `offer_${Date.now()}`;
        getNewOfferNumber().then(newOfferNumber => {
             const newOfferData = {
                ...offerToCopy,
                id: newId,
                offerNumber: newOfferNumber,
                offerDate: new Date().toISOString(),
                validityDate: addDays(new Date(), 7).toISOString(),
                isOrder: false, // A copied offer is not an order yet.
                orderDate: undefined,
             };
             const newOffer = addOffer(newOfferData);
             // Since we can't return the ID synchronously from the promise, 
             // we rely on the user navigating or we could pass a callback.
             // For now, this is how it's structured.
        });
        return newId; // This is a temporary solution for redirection.
        

    }, [offers, getNewOfferNumber, toast, addOffer]);

    const convertToOrder = useCallback((offerId: string) => {
        let offerToConvert: Offer | undefined;
        setOffers(prevOffers => {
            const updatedOffers = prevOffers.map(o => {
                if (o.id === offerId) {
                    offerToConvert = {
                        ...o,
                        isOrder: true,
                        orderDate: new Date().toISOString()
                    };
                    return offerToConvert;
                }
                return o;
            });
            updateLocalStorage(updatedOffers);
            return updatedOffers;
        });

        if (offerToConvert) {
            toast({
                title: "Siparişe Dönüştürüldü",
                description: `"${offerToConvert.offerNumber}" numaralı teklif başarıyla siparişe dönüştürüldü.`
            });
        }
    }, [toast]);


    return { offers, isLoaded, addOffer, updateOffer, deleteOffer, getOfferById, getNewOfferNumber, copyOffer, convertToOrder };
}
