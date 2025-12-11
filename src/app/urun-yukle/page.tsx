"use client";

import { useState, useRef, ChangeEvent, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from "@/hooks/use-toast";
import { useProducts } from '@/hooks/use-products';
import { useCompanies } from '@/hooks/use-companies';
import { analyzeProductImage } from '@/ai/flows/analyze-product-image';
import { getUsdToTryRate } from '@/lib/actions';
import type { AnalyzedProduct, Product } from '@/lib/types';
import { UploadCloud, Bot, Loader2, Trash2, XCircle, RefreshCw } from 'lucide-react';

type EditableProduct = {
    tempId: number;
    isSelected: boolean;
    company?: string;
    category?: string;
    photoUrl?: string | null;
} & Partial<Product>;

const mockCategories = [
    { name: 'Yazılım', subCategories: ['Ek Modül', 'Ana Paket', 'Yıllık Bakım'] },
    { name: 'Donanım', subCategories: ['Bilgisayar', 'Barkod Okuyucu', 'Barkod Yazıcı', 'POS Terminal'] },
    { name: 'Hizmet', subCategories: ['Danışmanlık', 'Teknik Servis', 'Eğitim'] },
    { name: 'Elektronik', subCategories: [] },
    { name: 'POS Sistemleri', subCategories: [] },
    { name: 'Genel', subCategories: [] },
    { name: 'Diğer', subCategories: [] },
];


export default function ProductUploadPage() {
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [imageDataUri, setImageDataUri] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [analyzedProducts, setAnalyzedProducts] = useState<EditableProduct[]>([]);

    const [isCurrencyDialogOpen, setCurrencyDialogOpen] = useState(false);
    const [tempAnalyzedProducts, setTempAnalyzedProducts] = useState<AnalyzedProduct[]>([]);
    const [selectedCurrency, setSelectedCurrency] = useState<'TRY' | 'USD'>('TRY');
    const [exchangeRate, setExchangeRate] = useState<string>('');
    const [isRateLoading, setIsRateLoading] = useState(false);
    const [selectedCompany, setSelectedCompany] = useState<string | undefined>();
    const [selectedCategory, setSelectedCategory] = useState<string | undefined>();


    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();
    const { addProducts } = useProducts();
    const { companies } = useCompanies();
    const router = useRouter();

    const suppliers = useMemo(() => companies.filter(c => c.type === 'supplier'), [companies]);

    const fetchRate = async () => {
        setIsRateLoading(true);
        try {
            const rate = await getUsdToTryRate();
            setExchangeRate(rate.toString());
        } catch (error) {
            toast({ variant: "destructive", title: "Kur Alınamadı", description: "Döviz kuru alınırken hata oluştu." });
        } finally {
            setIsRateLoading(false);
        }
    };

    useEffect(() => {
        if (selectedCurrency === 'USD' && isCurrencyDialogOpen) {
            fetchRate();
        }
    }, [selectedCurrency, isCurrencyDialogOpen]);


    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (file.size > 4 * 1024 * 1024) {
                toast({
                    variant: "destructive",
                    title: "Dosya Boyutu Çok Büyük",
                    description: "Lütfen 4MB'den küçük bir resim dosyası seçin.",
                });
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                const dataUri = reader.result as string;
                setImagePreview(URL.createObjectURL(file));
                setImageDataUri(dataUri);
                setAnalyzedProducts([]);
                setTempAnalyzedProducts([]);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAnalyzeClick = async () => {
        if (!imageDataUri) {
            toast({ variant: "destructive", title: "Resim Seçilmedi", description: "Lütfen önce analiz edilecek bir resim seçin." });
            return;
        }

        setIsLoading(true);
        setAnalyzedProducts([]);
        try {
            // AI Akışı
            const result = await analyzeProductImage({ photoDataUri: imageDataUri });

            if (result.length === 0) {
                toast({ variant: "destructive", title: "Ürün Bulunamadı", description: "Yapay zeka resimde bir ürün tespit edemedi." });
            } else {
                const firstCurrency = result[0]?.currency;
                const allSameCurrency = result.every(p => p.currency === firstCurrency);
                setSelectedCurrency(allSameCurrency && firstCurrency ? firstCurrency : 'TRY');

                setTempAnalyzedProducts(result);
                setCurrencyDialogOpen(true);
            }
        } catch (error) {
            console.error("AI Error:", error);
            let errorMessage = "Resim analiz edilirken bir hata oluştu.";
            if (error instanceof Error && error.message.includes('403')) {
                errorMessage = "API Anahtarı hatası (403). Lütfen yetkilendirmeyi kontrol edin.";
            }
            toast({ variant: "destructive", title: "Analiz Başarısız", description: errorMessage });
        } finally {
            setIsLoading(false);
        }
    };

    const handleConfirmCurrency = () => {
        const rate = parseFloat(exchangeRate);
        if (selectedCurrency === 'USD' && (isNaN(rate) || rate <= 0)) {
            toast({ variant: 'destructive', title: 'Geçersiz Döviz Kuru', description: 'Lütfen geçerli bir döviz kuru girin.' });
            return;
        }

        const convertedProducts: EditableProduct[] = tempAnalyzedProducts.map((p, i) => {
            const productBase = {
                tempId: Date.now() + i,
                isSelected: true,
                name: p.name,
                description: p.description,
                brand: p.brand,
                company: selectedCompany,
                category: selectedCategory,
                subCategory: '',
                vatRate: p.vatRate ?? 20,
                photoUrl: imageDataUri || undefined,
            };

            if (selectedCurrency === 'USD') {
                return {
                    ...productBase,
                    sellingPrice: parseFloat(((p.sellingPrice || 0) * rate).toFixed(2)),
                    purchasePrice: p.purchasePrice ? parseFloat(((p.purchasePrice || 0) * rate).toFixed(2)) : undefined,
                    originalSellingPrice: p.sellingPrice,
                    originalPurchasePrice: p.purchasePrice,
                    currency: 'USD',
                    exchangeRate: rate
                };
            }
            return {
                ...productBase,
                sellingPrice: parseFloat((p.sellingPrice || 0).toFixed(2)),
                purchasePrice: p.purchasePrice ? parseFloat(p.purchasePrice.toFixed(2)) : undefined,
                currency: 'TRY',
            };
        });

        setAnalyzedProducts(convertedProducts);
        setCurrencyDialogOpen(false);
        setSelectedCompany(undefined);
        setSelectedCategory(undefined);
        toast({
            title: "Analiz Tamamlandı",
            description: `${convertedProducts.length} ürün bulundu ve düzenlemeye hazır.`,
        });
    }

    const handleProductChange = (index: number, field: keyof EditableProduct, value: string | number) => {
        const updatedProducts = [...analyzedProducts];
        const product = updatedProducts[index];
        (product as any)[field] = value;

        if (field === 'category') {
            (product as any)['subCategory'] = '';
        }

        setAnalyzedProducts(updatedProducts);
    };

    const removeProduct = (index: number) => {
        setAnalyzedProducts(analyzedProducts.filter((_, i) => i !== index));
    };

    const handleSaveProducts = () => {
        const productsToSave: Omit<Product, 'id'>[] = analyzedProducts
            .filter(p => p.isSelected)
            .map(({ tempId, isSelected, ...p }) => ({
                name: p.name || '',
                description: p.description || '',
                brand: p.brand || '',
                company: p.company || '',
                category: p.category || '',
                subCategory: p.subCategory || '',
                sellingPrice: Number(p.sellingPrice) || 0,
                purchasePrice: Number(p.purchasePrice) || 0,
                vatRate: Number(p.vatRate) || 20,
                originalSellingPrice: p.originalSellingPrice,
                originalPurchasePrice: p.originalPurchasePrice,
                currency: p.currency,
                exchangeRate: p.exchangeRate,
                photoUrl: p.photoUrl,
            }));

        if (productsToSave.length === 0) {
            toast({ variant: "destructive", title: "Ürün Seçilmedi", description: "Kaydetmek için en az bir ürün seçmelisiniz." });
            return;
        }

        if (productsToSave.some(p => !p.name || p.sellingPrice <= 0)) {
            toast({ variant: "destructive", title: "Eksik Bilgi", description: "Lütfen tüm ürünlerin adını ve geçerli bir satış fiyatını girdiğinizden emin olun." });
            return;
        }

        addProducts(productsToSave);
        router.push('/urunler');
    };

    const clearImage = () => {
        setImagePreview(null);
        setImageDataUri(null);
        setAnalyzedProducts([]);
        if (fileInputRef.current) fileInputRef.current.value = "";
    }

    const handleProductSelectionChange = (index: number, isSelected: boolean) => {
        const updatedProducts = [...analyzedProducts];
        updatedProducts[index].isSelected = isSelected;
        setAnalyzedProducts(updatedProducts);
    };

    const handleSelectAll = (checked: boolean) => {
        const updatedProducts = analyzedProducts.map(p => ({ ...p, isSelected: checked }));
        setAnalyzedProducts(updatedProducts);
    };

    const areAllSelected = analyzedProducts.length > 0 && analyzedProducts.every(p => p.isSelected);
    const selectedCount = analyzedProducts.filter(p => p.isSelected).length;

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Yapay Zeka ile Ürün Yükle</CardTitle>
                    <CardDescription>Bir ürün resmi yükleyin, yapay zeka (Gemini 1.5) sizin için ürün bilgilerini otomatik tespit etsin.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="product-image">Ürün Resmi</Label>
                        <div
                            className="relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted transition-colors"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            {imagePreview ? (
                                <>
                                    <Image src={imagePreview} alt="Yüklenen ürün önizlemesi" layout="fill" objectFit="contain" className="rounded-lg p-2" data-ai-hint="product image" />
                                    <Button variant="destructive" size="icon" className="absolute top-2 right-2 z-10" onClick={(e) => { e.stopPropagation(); clearImage(); }}>
                                        <XCircle className="h-5 w-5" />
                                        <span className="sr-only">Resmi Kaldır</span>
                                    </Button>
                                </>
                            ) : (
                                <div className="text-center p-4">
                                    <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
                                    <p className="mt-2 text-sm text-muted-foreground">Resim seçmek için tıklayın veya sürükleyip bırakın</p>
                                    <p className="text-xs text-muted-foreground">PNG, JPG, WEBP (Maks. 4MB)</p>
                                </div>
                            )}
                            <Input ref={fileInputRef} id="product-image" type="file" className="hidden" accept="image/png, image/jpeg, image/webp" onChange={handleFileChange} />
                        </div>
                    </div>
                    <Button onClick={handleAnalyzeClick} disabled={!imagePreview || isLoading} className="w-full">
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Bot className="mr-2 h-4 w-4" />}
                        {isLoading ? "Yapay Zeka ile Analiz Et" : "Resmi Analiz Et"}
                    </Button>
                </CardContent>
            </Card>

            {analyzedProducts.length > 0 && (
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Eklenecek Ürünler</CardTitle>
                                <CardDescription>Bilgileri düzenleyip, ürünleri listeye kaydedebilirsiniz.</CardDescription>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="select-all"
                                    checked={areAllSelected}
                                    onCheckedChange={(checked) => handleSelectAll(Boolean(checked))}
                                />
                                <Label htmlFor="select-all" className="cursor-pointer">Tümünü Seç</Label>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {analyzedProducts.map((product, index) => {
                            const selectedCategoryObject = mockCategories.find(c => c.name === product.category);
                            return (
                                <Card key={product.tempId} className="p-4 relative hover:shadow-md transition-shadow">
                                    <div className="absolute top-4 right-4 flex items-center gap-2">
                                        <Button variant="ghost" size="icon" onClick={() => removeProduct(index)} className="h-8 w-8">
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                            <span className="sr-only">Ürünü kaldır</span>
                                        </Button>
                                        <Checkbox
                                            checked={product.isSelected}
                                            onCheckedChange={(checked) => handleProductSelectionChange(index, Boolean(checked))}
                                            aria-label="Ürünü seç"
                                        />
                                    </div>

                                    <div className="space-y-4 pr-24">
                                        <div className="space-y-2">
                                            <Input
                                                value={product.name || ''}
                                                onChange={e => handleProductChange(index, 'name', e.target.value)}
                                                placeholder="Ürün Adı"
                                                className="font-bold text-lg border-0 shadow-none -ml-3 focus-visible:ring-1"
                                            />
                                            <Textarea
                                                value={product.description || ''}
                                                onChange={e => handleProductChange(index, 'description', e.target.value)}
                                                placeholder="Açıklama"
                                                className="border-0 shadow-none -ml-3 focus-visible:ring-1 resize-y min-h-[40px]"
                                                rows={2}
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                                            <div className="space-y-1">
                                                <Label>Marka</Label>
                                                <Input value={product.brand || ''} onChange={e => handleProductChange(index, 'brand', e.target.value)} placeholder="Marka" />
                                            </div>
                                            <div className="space-y-1">
                                                <Label>Tedarikçi</Label>
                                                <Select value={product.company} onValueChange={(value) => handleProductChange(index, 'company', value)}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Tedarikçi seçiniz" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {suppliers.map(company => (
                                                            <SelectItem key={company.id} value={company.name}>{company.name}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-1">
                                                <Label>Kategori</Label>
                                                <Select value={product.category} onValueChange={(value) => handleProductChange(index, 'category', value)}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Kategori seçiniz" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {mockCategories.map(category => (
                                                            <SelectItem key={category.name} value={category.name}>{category.name}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            {selectedCategoryObject && selectedCategoryObject.subCategories.length > 0 && (
                                                <div className="space-y-1">
                                                    <Label>Alt Kategori</Label>
                                                    <Select value={product.subCategory} onValueChange={(value) => handleProductChange(index, 'subCategory', value)}>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Alt kategori seçiniz" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {selectedCategoryObject.subCategories.map(sub => (
                                                                <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            )}
                                            <div className="space-y-1">
                                                <Label>KDV Oranı</Label>
                                                <div className="flex items-center gap-2">
                                                    <Input type="number" value={product.vatRate ?? ''} onChange={e => handleProductChange(index, 'vatRate', Number(e.target.value))} placeholder="20" className="flex-grow" />
                                                    <span className="text-muted-foreground font-semibold">%</span>
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <Label>Alış Fiyatı</Label>
                                                <div className="flex items-center gap-2">
                                                    <Input type="number" value={product.purchasePrice ?? ''} onChange={e => handleProductChange(index, 'purchasePrice', Number(e.target.value))} placeholder="0" className="flex-grow" />
                                                    <span className="text-muted-foreground font-semibold">₺</span>
                                                    {product.currency === 'USD' && product.originalPurchasePrice != null && (
                                                        <span className="text-xs text-muted-foreground whitespace-nowrap">(<span className="font-semibold">${product.originalPurchasePrice.toFixed(2)}</span>)</span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <Label>Satış Fiyatı</Label>
                                                <div className="flex items-center gap-2">
                                                    <Input type="number" value={product.sellingPrice ?? ''} onChange={e => handleProductChange(index, 'sellingPrice', Number(e.target.value))} placeholder="0" className="flex-grow" />
                                                    <span className="text-muted-foreground font-semibold">₺</span>
                                                    {product.currency === 'USD' && product.originalSellingPrice != null && (
                                                        <span className="text-xs text-muted-foreground whitespace-nowrap">(<span className="font-semibold">${product.originalSellingPrice.toFixed(2)}</span>)</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            )
                        })}
                    </CardContent>
                    <CardFooter className="flex justify-end pt-4 border-t">
                        <Button onClick={handleSaveProducts}>
                            Seçili Ürünleri Listeye Kaydet ({selectedCount})
                        </Button>
                    </CardFooter>
                </Card>
            )}

            <Dialog open={isCurrencyDialogOpen} onOpenChange={setCurrencyDialogOpen}>
                <DialogContent className="sm:max-w-[480px]">
                    <DialogHeader>
                        <DialogTitle>Analiz Ayarları</DialogTitle>
                        <DialogDescription>
                            Eklenecek ürün için varsayılan değerleri ve para birimini seçin.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Para Birimi</Label>
                            <RadioGroup
                                value={selectedCurrency}
                                onValueChange={(value: 'TRY' | 'USD') => setSelectedCurrency(value)}
                                className="col-span-3 flex gap-4"
                            >
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="TRY" id="r-try" />
                                    <Label htmlFor="r-try">Türk Lirası (₺)</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="USD" id="r-usd" />
                                    <Label htmlFor="r-usd">ABD Doları ($)</Label>
                                </div>
                            </RadioGroup>
                        </div>
                        {selectedCurrency === 'USD' && (
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="exchange-rate" className="text-right">Dolar Kuru (₺)</Label>
                                <div className="col-span-3 flex items-center gap-2">
                                    <Input
                                        id="exchange-rate"
                                        value={exchangeRate}
                                        onChange={(e) => setExchangeRate(e.target.value)}
                                        className="flex-grow"
                                        disabled={isRateLoading}
                                        placeholder={isRateLoading ? "Yükleniyor..." : "Örn: 32.50"}
                                    />
                                    <Button size="icon" variant="outline" onClick={fetchRate} disabled={isRateLoading}>
                                        {isRateLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                                    </Button>
                                </div>
                            </div>
                        )}
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="default-company" className="text-right">Tedarikçi</Label>
                            <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                                <SelectTrigger id="default-company" className="col-span-3">
                                    <SelectValue placeholder="Varsayılan tedarikçi seçin" />
                                </SelectTrigger>
                                <SelectContent>
                                    {suppliers.map(company => (
                                        <SelectItem key={company.id} value={company.name}>{company.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="default-category" className="text-right">Kategori</Label>
                            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                <SelectTrigger id="default-category" className="col-span-3">
                                    <SelectValue placeholder="Varsayılan kategori seçin" />
                                </SelectTrigger>
                                <SelectContent>
                                    {mockCategories.map(category => (
                                        <SelectItem key={category.name} value={category.name}>{category.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleConfirmCurrency}>Uygula ve Devam Et</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
