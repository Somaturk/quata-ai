import { db } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { Product, Company, Offer, OfferItem } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

export function useDataOperations() {
    const { toast } = useToast();

    const deleteAllData = async () => {
        try {
            await db.transaction('rw', db.products, db.companies, db.offers, async () => {
                await db.products.clear();
                await db.companies.clear();
                await db.offers.clear();
            });
            toast({
                title: "Başarılı",
                description: "Tüm veriler başarıyla silindi.",
            });
            // Refresh page to reflect changes if necessary, or rely on live queries. 
            // A reload is often safer for a "hard reset" feel.
            window.location.reload();
        } catch (error) {
            console.error("Veri silme hatası:", error);
            toast({
                variant: "destructive",
                title: "Hata",
                description: "Veriler silinirken bir hata oluştu.",
            });
        }
    };

    const loadSampleData = async () => {
        try {
            const sampleSupplier: Company = {
                id: uuidv4(),
                name: "Teknoloji Toptan A.Ş.",
                type: "supplier",
                address: "Teknoloji Vadisi, İstanbul",
                contactPerson: "Ahmet Yılmaz",
                contactEmail: "ahmet@toptan.com"
            };

            const sampleCustomer: Company = {
                id: uuidv4(),
                name: "Örnek Müşteri Ltd. Şti.",
                type: "customer",
                address: "Örnek Mah. Ankara",
                contactPerson: "Ayşe Demir",
                contactEmail: "ayse@musteri.com"
            };

            const sampleProducts: Product[] = [
                {
                    id: uuidv4(),
                    name: "Laptop Pro X1",
                    description: "Yüksek performanslı dizüstü bilgisayar, 16GB RAM, 512GB SSD",
                    brand: "TechBrand",
                    category: "Bilgisayar",
                    company: sampleSupplier.name,
                    purchasePrice: 15000,
                    sellingPrice: 22000,
                    vatRate: 20,
                    currency: 'TRY'
                },
                {
                    id: uuidv4(),
                    name: "Kablosuz Mouse M5",
                    description: "Ergonomik sessiz mouse",
                    brand: "TechBrand",
                    category: "Aksesuar",
                    company: sampleSupplier.name,
                    purchasePrice: 200,
                    sellingPrice: 450,
                    vatRate: 20,
                    currency: 'TRY'
                },
                {
                    id: uuidv4(),
                    name: "Ofis Yazılımı Lisansı",
                    description: "Yıllık abonelik",
                    brand: "SoftCorp",
                    category: "Yazılım",
                    company: sampleSupplier.name,
                    purchasePrice: 1500,
                    sellingPrice: 2500,
                    vatRate: 20,
                    currency: 'TRY'
                }
            ];

            // Create an offer using some of the products
            const offerItems: OfferItem[] = [
                {
                    id: uuidv4(),
                    productId: sampleProducts[0].id,
                    name: sampleProducts[0].name,
                    description: sampleProducts[0].description,
                    quantity: 2,
                    unitPrice: sampleProducts[0].sellingPrice,
                    vatRate: sampleProducts[0].vatRate || 20,
                    total: 2 * sampleProducts[0].sellingPrice * 1.20 // rough calc including tax
                },
                {
                    id: uuidv4(),
                    productId: sampleProducts[1].id,
                    name: sampleProducts[1].name,
                    description: sampleProducts[1].description,
                    quantity: 5,
                    unitPrice: sampleProducts[1].sellingPrice,
                    vatRate: sampleProducts[1].vatRate || 20,
                    total: 5 * sampleProducts[1].sellingPrice * 1.20
                }
            ];

            const subTotal = offerItems.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
            const tax = offerItems.reduce((acc, item) => acc + (item.quantity * item.unitPrice * (item.vatRate / 100)), 0);

            const sampleOffer: Offer = {
                id: uuidv4(),
                offerNumber: "T-2024-001",
                offerDate: new Date().toISOString(),
                offerTitleDescription: "Örnek Donanım Teklifi",
                customerName: sampleCustomer.name,
                contactPerson: sampleCustomer.contactPerson,
                customerAddress: sampleCustomer.address,
                items: offerItems,
                documentNotes: "Bu bir numune tekliftir.",
                logoDataUrl: null,
                subTotal: subTotal,
                tax: tax,
                grandTotal: subTotal + tax,
                isOrder: false
            };

            await db.transaction('rw', db.products, db.companies, db.offers, async () => {
                await db.companies.add(sampleSupplier);
                await db.companies.add(sampleCustomer);
                await db.products.bulkAdd(sampleProducts);
                await db.offers.add(sampleOffer);
            });

            toast({
                title: "Başarılı",
                description: "Örnek veriler başarıyla yüklendi.",
            });
            window.location.reload();
        } catch (error) {
            console.error("Veri yükleme hatası:", error);
            toast({
                variant: "destructive",
                title: "Hata",
                description: "Veri yüklenirken bir hata oluştu.",
            });
        }
    };

    return { deleteAllData, loadSampleData };
}
