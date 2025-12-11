
export type Product = {
  id: string;
  name: string;
  description: string;
  photoUrl?: string;
  brand?: string;
  company?: string;
  category?: string;
  subCategory?: string;
  purchasePrice?: number; // Always in TRY
  sellingPrice: number; // Always in TRY
  vatRate?: number;
  originalPurchasePrice?: number;
  originalSellingPrice?: number;
  currency?: 'TRY' | 'USD';
  exchangeRate?: number;
};

export type Company = {
  id: string;
  name: string;
  type: 'customer' | 'supplier';
  address: string;
  contactPerson: string;
  contactEmail: string;
};

export type OfferItem = {
  id: string; 
  productId: string;
  name: string;
  description: string;
  photoUrl?: string;
  quantity: number;
  unitPrice: number;
  vatRate: number;
  discount?: number; // Discount percentage
  total: number;
};

export type OfferDetailItem = {
  id: string; // Corresponds to OfferItem id
  description: string;
  photoUrl?: string;
  detailHeight?: number;
};

export type AlternativeOffer = {
  id: string;
  title: string;
  introText: string;
  items: OfferItem[];
  documentNotes: string;
};

export type Offer = {
  id:string;
  offerNumber: string;
  offerDate?: string;
  validityDate?: string;
  offerTitleDescription: string;
  customerName: string;
  contactPerson: string;
  customerAddress: string;
  items: OfferItem[];
  alternatives?: AlternativeOffer[];
  alternativeTotal?: number;
  detailedItems?: OfferDetailItem[];
  documentNotes: string;
  logoDataUrl: string | null;
  subTotal: number;
  tax: number;
  grandTotal: number;
  isOrder?: boolean;
  orderDate?: string;
}

export type AnalyzedProduct = {
  name: string;
  description: string;
  brand?: string;
  purchasePrice?: number;
  sellingPrice: number;
  vatRate?: number;
  currency?: 'TRY' | 'USD';
};

export type AnalyzeProductImageOutput = AnalyzedProduct[];

export type AnalyzeProductImageInput = {
    photoDataUri: string;
}
