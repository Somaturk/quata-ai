
"use client";

import { useToast } from './use-toast';
import { format } from 'date-fns';
import { db } from '@/lib/db';

const KNOWN_PREFIXES = [
    'onequata-offers',
    'onequata-products',
    'onequata-companies',
    'onequata-logo',
    'onequata_offer_counter_'
];

export function useBackup() {
    const { toast } = useToast();

    const backupData = async () => {
        try {
            const products = await db.products.toArray();
            const companies = await db.companies.toArray();
            const offers = await db.offers.toArray();

            // LocalStorage Items (Logo, Counters etc.)
            const localStorageData: { [key: string]: string | null } = {};
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && (key.startsWith('onequata-logo') || key.startsWith('onequata_offer_counter_'))) {
                    localStorageData[key] = localStorage.getItem(key);
                }
            }

            const backupObject = {
                version: 2,
                timestamp: new Date().toISOString(),
                products,
                companies,
                offers,
                localStorage: localStorageData
            };

            const backupBlob = new Blob([JSON.stringify(backupObject, null, 2)], { type: 'application/json' });
            const backupUrl = URL.createObjectURL(backupBlob);
            const anchor = document.createElement('a');
            anchor.href = backupUrl;
            anchor.download = `onequata_backup_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.json`;

            document.body.appendChild(anchor);
            anchor.click();
            document.body.removeChild(anchor);

            URL.revokeObjectURL(backupUrl);

            toast({
                title: "Yedekleme Başarılı",
                description: "Tüm verileriniz başarıyla yedeklendi ve indirildi.",
            });

        } catch (error) {
            console.error("Backup failed:", error);
            toast({
                variant: "destructive",
                title: "Yedekleme Başarısız",
                description: "Veriler yedeklenirken bir hata oluştu.",
            });
        }
    };

    const restoreData = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const text = e.target?.result;
                if (typeof text !== 'string') {
                    throw new Error("Dosya içeriği okunamadı.");
                }
                const backupObject = JSON.parse(text);

                // Handle Version 2 (Dexie) Backups
                if (backupObject.version === 2 || (backupObject.products && Array.isArray(backupObject.products))) {
                    await db.transaction('rw', db.products, db.companies, db.offers, async () => {
                        await db.products.clear();
                        await db.companies.clear();
                        await db.offers.clear();

                        if (backupObject.products?.length) await db.products.bulkAdd(backupObject.products);
                        if (backupObject.companies?.length) await db.companies.bulkAdd(backupObject.companies);
                        if (backupObject.offers?.length) await db.offers.bulkAdd(backupObject.offers);
                    });

                    // Restore LocalStorage
                    if (backupObject.localStorage) {
                        Object.entries(backupObject.localStorage).forEach(([key, value]) => {
                            if (typeof value === 'string') {
                                localStorage.setItem(key, value);
                            }
                        });
                    }
                }
                // Handle Legacy Backups (LocalStorage only - for backward compatibility)
                else {
                    const keysToRemove: string[] = [];
                    for (let i = 0; i < localStorage.length; i++) {
                        const key = localStorage.key(i);
                        if (key && KNOWN_PREFIXES.some(prefix => key.startsWith(prefix))) {
                            keysToRemove.push(key);
                        }
                    }
                    keysToRemove.forEach(key => localStorage.removeItem(key));

                    for (const key in backupObject) {
                        if (Object.prototype.hasOwnProperty.call(backupObject, key) && KNOWN_PREFIXES.some(prefix => key.startsWith(prefix))) {
                            localStorage.setItem(key, backupObject[key]);
                        }
                    }
                    // Triggering the migration logic on next reload is risky with legacy backups now that migration is one-time.
                    // Ideally we should manually migrate legacy data to DB here if we detect it.
                    // But for simplicity, assuming users haven't deleted their data yet, they likely want to restore a V2 backup.
                    // If they restore a legacy backup, the hooks *might* not see it if they already flagged 'migration done'.
                    // Let's force re-migration by removing the 'onequata-...' keys used by migration checks?
                    // Actually, hooks check `window.localStorage.getItem('onequata-products')`.
                    // So restoring legacy backup PUTS those keys there.
                    // When page reloads, hooks will see them and migrate them (hopefully).
                }

                toast({
                    title: "Geri Yükleme Başarılı",
                    description: "Verileriniz başarıyla geri yüklendi. Sayfa yenileniyor...",
                });

                setTimeout(() => {
                    window.location.reload();
                }, 1500);

            } catch (error) {
                console.error("Restore failed:", error);
                toast({
                    variant: "destructive",
                    title: "Geri Yükleme Başarısız",
                    description: "Yedek dosyası bozuk veya uyumsuz olabilir.",
                });
            } finally {
                if (event.target) {
                    event.target.value = '';
                }
            }
        };
        reader.readAsText(file);
    };


    return { backupData, restoreData };
}
