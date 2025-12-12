"use client";

import { useState, useEffect, useCallback } from 'react';
import type { Company } from '@/lib/types';
import { useToast } from './use-toast';
import { db } from '@/lib/db';

// Mock data used if DB is empty on first load
const mockCompanies: Company[] = [
    { id: 'c1', name: 'ÖZFİLİZ', type: 'customer', address: 'Adres bilgisi girilmemiş', contactPerson: 'Yetkili kişi girilmemiş', contactEmail: 'email@ornek.com' },
    { id: 'c2', name: 'VEGA', type: 'customer', address: 'Adres bilgisi girilmemiş', contactPerson: 'Yetkili kişi girilmemiş', contactEmail: 'email@ornek.com' },
    { id: 'c3', name: 'AGT', type: 'supplier', address: 'Adres bilgisi girilmemiş', contactPerson: 'Yetkili kişi girilmemiş', contactEmail: 'email@ornek.com' },
    { id: 'c4', name: 'HB', type: 'supplier', address: 'Adres bilgisi girilmemiş', contactPerson: 'Yetkili kişi girilmemiş', contactEmail: 'email@ornek.com' },
];

export function useCompanies() {
    const { toast } = useToast();
    const [companies, setCompanies] = useState<Company[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    const refresh = async () => {
        const all = await db.companies.toArray();
        setCompanies(all);
    };

    // One‑time migration from localStorage, then load data
    useEffect(() => {
        const migrate = async () => {
            try {
                const stored = window.localStorage.getItem('onequata-companies');
                if (stored) {
                    const oldCompanies: Company[] = JSON.parse(stored);
                    await db.companies.bulkPut(
                        oldCompanies.map(c => ({ ...c, id: c.id || `c_${crypto.randomUUID()}` }))
                    );
                    window.localStorage.removeItem('onequata-companies');
                }
            } catch (e) {
                console.error('Company migration error', e);
            }
        };
        const load = async () => {
            try {
                const all = await db.companies.toArray();
                if (all.length === 0) {
                    await db.companies.bulkPut(mockCompanies);
                    setCompanies(mockCompanies);
                } else {
                    setCompanies(all);
                }
            } catch (error) {
                console.error('Failed to load companies from IndexedDB', error);
                setCompanies(mockCompanies);
            }
            setIsLoaded(true);
        };
        migrate().then(load);
    }, []);

    const addCompany = useCallback(async (newCompanyData: Omit<Company, 'id'>) => {
        const companyWithId = { ...newCompanyData, id: `c_${crypto.randomUUID()}` };
        try {
            await db.companies.add(companyWithId);
            await refresh();
            toast({ title: 'Firma Eklendi', description: `${companyWithId.name} firması başarıyla eklendi.` });
            return companyWithId;
        } catch (error) {
            console.error('Failed to add company to Dexie', error);
            toast({ title: 'Hata', description: 'Firma eklenirken bir sorun oluştu.', variant: 'destructive' });
            return undefined;
        }
    }, [toast]);

    const updateCompany = useCallback(async (updatedCompanyData: Company) => {
        try {
            await db.companies.update(updatedCompanyData.id, updatedCompanyData);
            await refresh();
            toast({ title: 'Firma Güncellendi', description: `${updatedCompanyData.name} firması başarıyla güncellendi.` });
        } catch (error) {
            console.error('Failed to update company in Dexie', error);
            toast({ title: 'Hata', description: 'Firma güncellenirken bir sorun oluştu.', variant: 'destructive' });
        }
    }, [toast]);

    const deleteCompany = useCallback(async (companyId: string) => {
        try {
            await db.companies.delete(companyId);
            await refresh();
            toast({ title: 'Firma Silindi', description: 'Firma silindi.', variant: 'destructive' });
        } catch (error) {
            console.error('Failed to delete company from Dexie', error);
            toast({ title: 'Hata', description: 'Firma silinirken bir sorun oluştu.', variant: 'destructive' });
        }
    }, [toast]);

    return { companies, isLoaded, addCompany, updateCompany, deleteCompany };
}
