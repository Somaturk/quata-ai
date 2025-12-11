
"use client";

import { useState, useEffect, useCallback } from 'react';
import type { Company } from '@/lib/types';
import { useToast } from './use-toast';

const mockCompanies: Company[] = [
    { id: '1', name: 'ÖZFİLİZ', type: 'customer', address: 'Adres bilgisi girilmemiş', contactPerson: 'Yetkili kişi girilmemiş', contactEmail: 'email@ornek.com' },
    { id: '2', name: 'VEGA', type: 'customer', address: 'Adres bilgisi girilmemiş', contactPerson: 'Yetkili kişi girilmemiş', contactEmail: 'email@ornek.com' },
    { id: '3', name: 'AGT', type: 'supplier', address: 'Adres bilgisi girilmemiş', contactPerson: 'Yetkili kişi girilmemiş', contactEmail: 'email@ornek.com' },
    { id: '4', name: 'HB', type: 'supplier', address: 'Adres bilgisi girilmemiş', contactPerson: 'Yetkili kişi girilmemiş', contactEmail: 'email@ornek.com' },
];

const STORAGE_KEY = 'onequata-companies';

export function useCompanies() {
    const { toast } = useToast();
    const [companies, setCompanies] = useState<Company[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        try {
            const storedItems = window.localStorage.getItem(STORAGE_KEY);
            if (storedItems) {
                setCompanies(JSON.parse(storedItems));
            } else {
                setCompanies(mockCompanies);
                window.localStorage.setItem(STORAGE_KEY, JSON.stringify(mockCompanies));
            }
        } catch (error) {
            console.error("Failed to load companies from localStorage", error);
            setCompanies(mockCompanies);
        }
        setIsLoaded(true);
    }, []);

    const updateLocalStorage = (updatedCompanies: Company[]) => {
        try {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedCompanies));
        } catch (error) {
            console.error("Failed to save companies to localStorage", error);
        }
    };
    
    const addCompany = useCallback((newCompanyData: Omit<Company, 'id'>, callback?: (newCompany: Company) => void) => {
        const companyWithId = { ...newCompanyData, id: `c_${Date.now()}` };
        
        setCompanies(prevCompanies => {
            const updatedCompanies = [...prevCompanies, companyWithId];
            updateLocalStorage(updatedCompanies);
            return updatedCompanies;
        });

        toast({ title: "Firma Eklendi", description: `${companyWithId.name} firması başarıyla eklendi.` });
        
        if (callback) {
            callback(companyWithId);
        }
    }, [toast]);
    
    const updateCompany = useCallback((updatedCompanyData: Company) => {
        setCompanies(prevCompanies => {
            const updatedCompanies = prevCompanies.map(c => c.id === updatedCompanyData.id ? updatedCompanyData : c);
            updateLocalStorage(updatedCompanies);
            return updatedCompanies;
        });
        toast({ title: "Firma Güncellendi", description: `${updatedCompanyData.name} firması başarıyla güncellendi.` });
    }, [toast]);

    const deleteCompany = useCallback((companyId: string) => {
        let companyToDelete: Company | undefined;
        setCompanies(prevCompanies => {
            companyToDelete = prevCompanies.find(c => c.id === companyId);
            const updatedCompanies = prevCompanies.filter(c => c.id !== companyId);
            updateLocalStorage(updatedCompanies);
            return updatedCompanies;
        });
        if (companyToDelete) {
             toast({ title: "Firma Silindi", description: `${companyToDelete.name} firması silindi.`, variant: 'destructive' });
        }
    }, [toast]);

    return { companies, isLoaded, addCompany, updateCompany, deleteCompany };
}
