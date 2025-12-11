
"use client";

import { useToast } from './use-toast';
import { format } from 'date-fns';

const KNOWN_PREFIXES = [
    'onequata-offers',
    'onequata-products',
    'onequata-companies',
    'onequata-logo',
    'onequata_offer_counter_'
];

export function useBackup() {
    const { toast } = useToast();

    const backupData = () => {
        try {
            const backupObject: { [key: string]: any } = {};

            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && KNOWN_PREFIXES.some(prefix => key.startsWith(prefix))) {
                    backupObject[key] = localStorage.getItem(key);
                }
            }

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
        reader.onload = (e) => {
            try {
                const text = e.target?.result;
                if (typeof text !== 'string') {
                    throw new Error("Dosya içeriği okunamadı.");
                }
                const backupObject = JSON.parse(text);

                // Clear existing data before restoring
                const keysToRemove: string[] = [];
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key && KNOWN_PREFIXES.some(prefix => key.startsWith(prefix))) {
                        keysToRemove.push(key);
                    }
                }
                keysToRemove.forEach(key => localStorage.removeItem(key));
                
                // Restore new data
                for (const key in backupObject) {
                    if (Object.prototype.hasOwnProperty.call(backupObject, key)) {
                        localStorage.setItem(key, backupObject[key]);
                    }
                }
                
                toast({
                    title: "Geri Yükleme Başarılı",
                    description: "Verileriniz başarıyla geri yüklendi. Değişiklikleri görmek için sayfayı yenileyin.",
                });

                // Force a reload to reflect changes everywhere
                setTimeout(() => {
                    window.location.reload();
                }, 1500);


            } catch (error) {
                console.error("Restore failed:", error);
                toast({
                    variant: "destructive",
                    title: "Geri Yükleme Başarısız",
                    description: "Yedek dosyası okunurken veya veriler geri yüklenirken bir hata oluştu. Lütfen geçerli bir yedek dosyası seçin.",
                });
            } finally {
                // Reset file input
                if(event.target) {
                    event.target.value = '';
                }
            }
        };
        reader.readAsText(file);
    };


    return { backupData, restoreData };
}
