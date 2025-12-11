

"use client"

import React, { useState, useRef, type ChangeEvent, useEffect } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle, Trash2, UploadCloud, XCircle, Pencil, MoreVertical, FilePenLine, GalleryVerticalEnd, EyeOff, ChevronDown, Printer, Monitor, FileText, Percent, ArrowUpDown, ChevronUp, ShoppingCart, CheckCircle } from "lucide-react";
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { format, addDays } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useProducts } from '@/hooks/use-products';
import { useOffers } from '@/hooks/use-offers';
import { useCompanies } from '@/hooks/use-companies';
import { useToast } from '@/hooks/use-toast';
import { useLogo } from '@/hooks/use-logo';
import { Textarea } from '@/components/ui/textarea';
import type { Product, OfferItem, OfferDetailItem, AlternativeOffer, Company } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import defaultLogo from '@/logo.png';
import { ProductEditModal } from '@/components/product-edit-modal';
import { CompanyEditModal } from '@/components/company-edit-modal';
import { Badge } from '@/components/ui/badge';


// --- Standalone Autocomplete Components ---

const ProductAutocomplete = ({ listType, products, handleSelectProduct, handleOpenProductModal }: { listType: 'main' | string; products: Product[]; handleSelectProduct: (product: Product, listType: 'main' | string) => void; handleOpenProductModal: (listType: 'main' | string, initialName?: string) => void; }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const onProductSelect = (product: Product) => {
      handleSelectProduct(product, listType);
      setSearchQuery("");
      setActiveIndex(-1);
      setIsFocused(false);
      if (inputRef.current) {
        setTimeout(() => {
            inputRef.current?.focus();
        }, 0);
      }
  };

  const filteredProducts = searchQuery.length < 2 ? [] : products.filter(p =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
        setIsFocused(false);
        return;
    }
    
    if (filteredProducts.length === 0 && searchQuery.length < 2) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(prev => (prev + 1) % filteredProducts.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(prev => (prev - 1 + filteredProducts.length) % filteredProducts.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0) {
        onProductSelect(filteredProducts[activeIndex]);
      }
    }
  };
  
  useEffect(() => {
    const resultItems = searchRef.current?.querySelectorAll('button');
    if (resultItems && activeIndex >= 0 && resultItems[activeIndex]) {
        (resultItems[activeIndex] as HTMLElement).scrollIntoView({
            block: 'nearest',
        });
    }
  }, [activeIndex]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={searchRef}>
      <div className="flex items-center border-t border-dashed print:hidden">
        <Input
          ref={inputRef}
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setActiveIndex(-1);
            if (!isFocused) setIsFocused(true);
          }}
          onFocus={() => setIsFocused(true)}
          onKeyDown={handleKeyDown}
          placeholder="Ürün veya hizmet eklemek için yazmaya başlayın..."
          className="flex-1 min-w-0 bg-transparent border-0 shadow-none focus-visible:ring-0 h-11 text-xs text-muted-foreground placeholder:text-muted-foreground"
        />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 mr-2"
            onClick={() => handleOpenProductModal(listType)}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            <span className="sr-only">Yeni ürün ekle</span>
          </Button>
      </div>

      {isFocused && filteredProducts.length > 0 && (
        <div className="absolute z-10 w-full bg-card border rounded-md shadow-lg max-h-60 overflow-y-auto mt-1">
          <div className="p-1">
            {filteredProducts.map((product, index) => (
              <button
                key={product.id}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  onProductSelect(product);
                }}
                className={cn(
                  "w-full text-left p-2 text-sm rounded-sm hover:bg-accent",
                  index === activeIndex && "bg-accent"
                )}
              >
                {product.name}
              </button>
            ))}
          </div>
        </div>
      )}
      {isFocused && searchQuery.length >= 2 && filteredProducts.length === 0 && (
        <div
          role="button"
          onClick={() => {
            handleOpenProductModal(listType, searchQuery);
            setSearchQuery('');
            setIsFocused(false);
          }}
          className="absolute z-10 w-full bg-card border rounded-md shadow-lg p-4 text-center text-sm text-muted-foreground mt-1 cursor-pointer hover:bg-accent"
        >
          <span className="font-semibold text-foreground">"{searchQuery}"</span> bulunamadı.{" "}
          <span className="font-semibold text-primary underline">Eklemek için tıklayın.</span>
        </div>
      )}
    </div>
  );
};

const CustomerAutocomplete = ({ customerName, setCustomerName, setContactPerson, setCustomerAddress, companies, handleOpenCompanyModal }: {
    customerName: string;
    setCustomerName: (name: string) => void;
    setContactPerson: (person: string) => void;
    setCustomerAddress: (address: string) => void;
    companies: Company[];
    handleOpenCompanyModal: (name?: string) => void;
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);

  const onCustomerSelect = (customer: Company) => {
      setCustomerName(customer.name);
      setContactPerson(customer.contactPerson || '');
      setCustomerAddress(customer.address || '');
      setIsFocused(false);
      setActiveIndex(-1);
  };

  const customerList = companies.filter(c => c.type === 'customer');

  const filteredCustomers = customerName.length < 2 ? [] : customerList.filter(c =>
      c.name.toLowerCase().includes(customerName.toLowerCase())
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
        setIsFocused(false);
        return;
    }
    
    if (filteredCustomers.length === 0 && customerName.length < 2) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(prev => (prev + 1) % filteredCustomers.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(prev => (prev - 1 + filteredCustomers.length) % filteredCustomers.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0) {
        onCustomerSelect(filteredCustomers[activeIndex]);
      } else {
        setIsFocused(false);
      }
    }
  };

  useEffect(() => {
    const resultItems = searchRef.current?.querySelectorAll('button');
    if (resultItems && activeIndex >= 0 && resultItems[activeIndex]) {
        (resultItems[activeIndex] as HTMLElement).scrollIntoView({ block: 'nearest' });
    }
  }, [activeIndex]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
      <div className="relative" ref={searchRef}>
          <div className="grid grid-cols-[80px_1fr] items-center gap-2">
              <Label htmlFor="customer-name" className="text-xs">Firma Adı</Label>
              <Input
                  id="customer-name"
                  placeholder="Firma/Müşteri Adı"
                  value={customerName}
                  onChange={(e) => {
                      setCustomerName(e.target.value);
                      setActiveIndex(-1);
                      if (!isFocused) setIsFocused(true);
                  }}
                  onFocus={() => setIsFocused(true)}
                  onKeyDown={handleKeyDown}
                  className="h-7"
                  autoComplete="off"
              />
          </div>

          {isFocused && filteredCustomers.length > 0 && (
              <div className="absolute z-20 w-full bg-card border rounded-md shadow-lg max-h-60 overflow-y-auto mt-1 left-0 right-0">
                  <div className="p-1">
                      {filteredCustomers.map((customer, index) => (
                          <button
                              key={customer.id}
                              type="button"
                              onMouseDown={(e) => {
                                  e.preventDefault();
                                  onCustomerSelect(customer);
                              }}
                              className={cn("w-full text-left p-2 text-sm rounded-sm hover:bg-accent", index === activeIndex && "bg-accent")}
                          >
                              {customer.name}
                          </button>
                      ))}
                  </div>
              </div>
          )}
          
          {isFocused && customerName.length >= 2 && filteredCustomers.length === 0 && (
              <div
                  role="button"
                  onClick={() => {
                      handleOpenCompanyModal(customerName);
                      setIsFocused(false);
                  }}
                  className="absolute z-20 w-full bg-card border rounded-md shadow-lg p-4 text-center text-sm text-muted-foreground mt-1 cursor-pointer hover:bg-accent left-0 right-0"
              >
                  <span className="font-semibold text-foreground">"{customerName}"</span> bulunamadı.{" "}
                  <span className="font-semibold text-primary underline">Eklemek için tıklayın.</span>
              </div>
          )}
      </div>
  );
};


export default function OfferPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { products, addProducts: addNewProductsToList } = useProducts();
  const { addOffer, updateOffer, getOfferById, isLoaded: isOffersLoaded, getNewOfferNumber, convertToOrder } = useOffers();
  const { companies, addCompany } = useCompanies();
  const { toast } = useToast();
  const { logoDataUrl: savedLogo, isLogoLoaded, saveLogo: saveGlobalLogo } = useLogo();


  const [isClient, setIsClient] = useState(false);
  const [offerNumber, setOfferNumber] = useState('');
  const [offerDate, setOfferDate] = useState<Date | undefined>(new Date());
  const [validityDate, setValidityDate] = useState<Date | undefined>();
  const [isValidityDateManuallySet, setIsValidityDateManuallySet] = useState(false);
  const [offerTitleDescription, setOfferTitleDescription] = useState('');
  
  const [offerItems, setOfferItems] = useState<OfferItem[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRefs = useRef<Map<string, HTMLInputElement | null>>(new Map());

  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  
  const [isDescriptionModalOpen, setDescriptionModalOpen] = useState(false);
  const [editingDescription, setEditingDescription] = useState<{ index: number; text: string; list: 'main' | string } | null>(null);
  const [isPriceModalOpen, setPriceModalOpen] = useState(false);
  const [editingPrice, setEditingPrice] = useState<{ index: number; field: 'unitPrice' | 'total'; value: number; list: 'main' | string } | null>(null);
  const [isVatModalOpen, setVatModalOpen] = useState(false);
  const [editingVat, setEditingVat] = useState<{ index: number; vatRate: number; list: 'main' | string } | null>(null);
  const [showDiscountColumn, setShowDiscountColumn] = useState(false);
  
  const [isNumericModalOpen, setNumericModalOpen] = useState(false);
  const [editingNumeric, setEditingNumeric] = useState<{ index: number; field: 'quantity' | 'discount'; value: number; list: 'main' | string } | null>(null);


  const [documentNotes, setDocumentNotes] = useState('Teklifimiz, tebliğ tarihinden itibaren 7 (yedi) gün süreyle geçerlidir.\nFiyatlarımıza %20 KDV dahil değildir.\nÖdeme Şekli: İş başlangıcı %50, iş teslimi %50.');
  
  const [isOfferNoModalOpen, setOfferNoModalOpen] = useState(false);
  const [tempOfferNumber, setTempOfferNumber] = useState('');
  
  const [isTitleModalOpen, setTitleModalOpen] = useState(false);
  const [tempOfferTitle, setTempOfferTitle] = useState('');
  
  const [isNotesModalOpen, setNotesModalOpen] = useState(false);
  const [tempDocumentNotes, setTempDocumentNotes] = useState('');

  const [isVatIncluded, setIsVatIncluded] = useState(false);
  const [showVat, setShowVat] = useState(true);

  const [editingOfferId, setEditingOfferId] = useState<string | null>(null);
  const [isOrder, setIsOrder] = useState(false);
  const [orderDate, setOrderDate] = useState<string | undefined>();
  
  const [isDetailsModalOpen, setDetailsModalOpen] = useState(false);

  type DetailOfferItem = OfferItem & { detailHeight?: number };
  const [itemsForDetails, setItemsForDetails] = useState<DetailOfferItem[]>([]);
  const [detailedItems, setDetailedItems] = useState<OfferDetailItem[]>([]);

  const [resizingItem, setResizingItem] = useState<{ id: string; initialY: number; initialHeight: number } | null>(null);


  // --- Alternative Offer State ---
  const [alternatives, setAlternatives] = useState<AlternativeOffer[]>([]);
  const [isAlternativeNotesModalOpen, setAlternativeNotesModalOpen] = useState(false);
  const [editingAlternativeNotes, setEditingAlternativeNotes] = useState<{ id: string; notes: string } | null>(null);
  const [isAlternativeHeaderModalOpen, setAlternativeHeaderModalOpen] = useState(false);
  const [editingAlternativeHeader, setEditingAlternativeHeader] = useState<{ id: string; title: string; introText: string } | null>(null);
  // ---------------------------------
  const [isProductModalOpen, setProductModalOpen] = useState(false);
  const [listTypeForNewProduct, setListTypeForNewProduct] = useState<'main' | string>('main');
  const [initialProductName, setInitialProductName] = useState<string | undefined>(undefined);

  const [isCompanyModalOpen, setCompanyModalOpen] = useState(false);
  const [initialCompanyName, setInitialCompanyName] = useState<string | undefined>(undefined);
  

  useEffect(() => {
    setIsClient(true);
  }, []);
  

  useEffect(() => {
    if(!isClient) return;

    const offerId = searchParams.get('offerId');
    if (offerId && isOffersLoaded) {
      const offerToEdit = getOfferById(offerId);
      if (offerToEdit) {
        setEditingOfferId(offerToEdit.id);
        setOfferNumber(offerToEdit.offerNumber);
        setOfferDate(offerToEdit.offerDate ? new Date(offerToEdit.offerDate) : new Date());
        setValidityDate(offerToEdit.validityDate ? new Date(offerToEdit.validityDate) : undefined);
        setIsValidityDateManuallySet(!!offerToEdit.validityDate);
        setOfferTitleDescription(offerToEdit.offerTitleDescription);
        setCustomerName(offerToEdit.customerName);
        setContactPerson(offerToEdit.contactPerson);
        setCustomerAddress(offerToEdit.customerAddress);
        setOfferItems(offerToEdit.items);
        setDetailedItems(offerToEdit.detailedItems || []);
        setDocumentNotes(offerToEdit.documentNotes);
        const initialLogo = offerToEdit.logoDataUrl || defaultLogo.src;
        setLogoDataUrl(initialLogo);
        setLogoPreview(initialLogo);
        setAlternatives(offerToEdit.alternatives || []);
        setShowDiscountColumn(offerToEdit.items.some(item => item.discount && item.discount > 0));
        setIsOrder(offerToEdit.isOrder || false);
        setOrderDate(offerToEdit.orderDate);

      } else {
        router.replace('/eski-teklifler');
        toast({ variant: 'destructive', title: 'Hata', description: 'Düzenlenecek teklif bulunamadı.' });
      }
    } else if (!offerId && isOffersLoaded) {
      // Set initial state for a new offer
      setEditingOfferId(null);
      (async () => {
          const newNumber = await getNewOfferNumber();
          setOfferNumber(newNumber);
      })();
      const initialDate = new Date();
      setOfferDate(initialDate);
      setValidityDate(addDays(initialDate, 7));
      setIsValidityDateManuallySet(false);
      setDetailedItems([]);
      setAlternatives([]);
      if (isLogoLoaded) {
          const initialLogo = savedLogo || defaultLogo.src;
          setLogoDataUrl(initialLogo);
          setLogoPreview(initialLogo);
      }
    }
  }, [searchParams, isOffersLoaded, getOfferById, router, toast, getNewOfferNumber, isClient, savedLogo, isLogoLoaded]);

  useEffect(() => {
    if (offerDate && !isValidityDateManuallySet) {
      setValidityDate(addDays(offerDate, 7));
    }
  }, [offerDate, isValidityDateManuallySet]);
  
  useEffect(() => {
    if (isDetailsModalOpen) {
      document.body.classList.add('details-modal-is-open');
    } else {
      document.body.classList.remove('details-modal-is-open');
    }
    return () => {
      document.body.classList.remove('details-modal-is-open');
    }
  }, [isDetailsModalOpen]);


  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
        if (!resizingItem) return;

        const deltaY = e.clientY - resizingItem.initialY;
        const newHeight = resizingItem.initialHeight + deltaY;

        setItemsForDetails(prevItems =>
            prevItems.map(item =>
                item.id === resizingItem.id ? { ...item, detailHeight: Math.max(150, newHeight) } : item
            )
        );
    };

    const handleMouseUp = () => {
        setResizingItem(null);
    };

    if (resizingItem) {
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizingItem]);

  const handleSaveOfferNumber = () => {
    setOfferNumber(tempOfferNumber);
    setOfferNoModalOpen(false);
  };

  const handleResizeStart = (e: React.MouseEvent, item: DetailOfferItem) => {
    e.preventDefault();
    const cardElement = (e.currentTarget as HTMLElement).closest('.product-card-interactive');
    if (cardElement) {
        setResizingItem({
            id: item.id,
            initialY: e.clientY,
            initialHeight: item.detailHeight || cardElement.clientHeight,
        });
    }
  };


  const handleLogoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (logoPreview && logoPreview.startsWith('blob:')) {
        URL.revokeObjectURL(logoPreview);
      }
      setLogoPreview(URL.createObjectURL(file));

      const reader = new FileReader();
      reader.onloadend = () => {
          const dataUrl = reader.result as string;
          setLogoDataUrl(dataUrl);
          saveGlobalLogo(dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearLogo = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (logoPreview && logoPreview.startsWith('blob:')) {
        URL.revokeObjectURL(logoPreview);
    }
    setLogoPreview(defaultLogo.src);
    setLogoDataUrl(defaultLogo.src);
    saveGlobalLogo(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const updateAlternative = (altId: string, newProps: Partial<Omit<AlternativeOffer, 'id'>>) => {
    setAlternatives(prevAlts => prevAlts.map(alt => 
        alt.id === altId ? { ...alt, ...newProps } : alt
    ));
  };
  
  const updateOfferItems = (
    listType: 'main' | string,
    updateFn: (items: OfferItem[]) => OfferItem[]
  ) => {
      if (listType === 'main') {
          setOfferItems(updateFn);
      } else {
          const altId = listType;
          const targetAlt = alternatives.find(a => a.id === altId);
          if (targetAlt) {
              const updatedItems = updateFn(targetAlt.items);
              updateAlternative(altId, { items: updatedItems });
          }
      }
  };
  
  const handleSelectProduct = (product: Product, listType: 'main' | string) => {
      const newItem: OfferItem = {
          id: `item_${Date.now()}_${Math.random()}`,
          productId: product.id,
          name: product.name,
          description: product.description,
          photoUrl: product.photoUrl,
          quantity: 1,
          unitPrice: product.sellingPrice,
          vatRate: product.vatRate ?? 20,
          discount: 0,
          total: 0,
      };
      newItem.total = calculateItemTotal(newItem);

      updateOfferItems(listType, items => [...items, newItem]);
  };
  

  // --- Generic Item Handlers ---
  
  const removeItem = (index: number, listType: 'main' | string) => {
    updateOfferItems(listType, items => items.filter((_, i) => i !== index));
  };

  const removeDescription = (index: number, listType: 'main' | string) => {
    updateOfferItems(listType, items => {
        const newItems = [...items];
        newItems[index].description = '';
        return newItems;
    });
  };
  
  const getItemsForListType = (listType: 'main' | string): OfferItem[] => {
      if (listType === 'main') {
          return offerItems;
      }
      return alternatives.find(alt => alt.id === listType)?.items || [];
  };

  const openDescriptionModal = (index: number, listType: 'main' | string) => {
    const items = getItemsForListType(listType);
    setEditingDescription({ index, text: items[index].description, list: listType });
    setDescriptionModalOpen(true);
  };

  const handleSaveDescription = () => {
    if (editingDescription) {
        updateOfferItems(editingDescription.list, items => {
            const newItems = [...items];
            newItems[editingDescription.index].description = editingDescription.text;
            return newItems;
        });
        setDescriptionModalOpen(false);
        setEditingDescription(null);
    }
  };

  const openPriceModal = (index: number, field: 'unitPrice' | 'total', listType: 'main' | string) => {
    const items = getItemsForListType(listType);
    const item = items[index];
    const currentValue = item[field];
    const displayedValue = isVatIncluded ? currentValue * (1 + item.vatRate / 100) : currentValue;
    setEditingPrice({ index, field, value: displayedValue, list: listType });
    setPriceModalOpen(true);
  };
  
  const openNumericModal = (index: number, field: 'quantity' | 'discount', listType: 'main' | string) => {
      const items = getItemsForListType(listType);
      const item = items[index];
      setEditingNumeric({ index, field, value: item[field] || 0, list: listType });
      setNumericModalOpen(true);
  };
  
  const handleSaveNumeric = () => {
      if (editingNumeric && !isNaN(editingNumeric.value)) {
          updateOfferItems(editingNumeric.list, items => {
              const newItems = [...items];
              const item = { ...newItems[editingNumeric.index] };

              if (editingNumeric.field === 'quantity') {
                  item.quantity = editingNumeric.value > 0 ? editingNumeric.value : 1;
              } else if (editingNumeric.field === 'discount') {
                  item.discount = editingNumeric.value >= 0 ? editingNumeric.value : 0;
              }
              item.total = calculateItemTotal(item);
              newItems[editingNumeric.index] = item;
              return newItems;
          });
      }
      setNumericModalOpen(false);
      setEditingNumeric(null);
  };


  const handleSavePrice = () => {
    if (editingPrice && !isNaN(editingPrice.value)) {
        updateOfferItems(editingPrice.list, items => {
            const newItems = [...items];
            const item = newItems[editingPrice.index];

            let valueWithoutVat = editingPrice.value;
            if (isVatIncluded) {
                valueWithoutVat = editingPrice.value / (1 + item.vatRate / 100);
            }
            
            if (editingPrice.field === 'unitPrice') {
                item.unitPrice = valueWithoutVat;
            } else if (editingPrice.field === 'total') {
                const totalAfterDiscount = valueWithoutVat;
                const discountFactor = 1 - (item.discount || 0) / 100;
                if (discountFactor > 0 && item.quantity > 0) {
                    const baseTotal = totalAfterDiscount / discountFactor;
                    item.unitPrice = baseTotal / item.quantity;
                } else if (item.quantity > 0) { // Handle case with 100% discount
                    item.unitPrice = totalAfterDiscount / item.quantity;
                }
            }
            item.total = calculateItemTotal(item);

            newItems[editingPrice.index] = item;
            return newItems;
        });
        setPriceModalOpen(false);
        setEditingPrice(null);
    }
  };


  const openVatModal = (index: number, listType: 'main' | string) => {
    const items = getItemsForListType(listType);
    setEditingVat({ index, vatRate: items[index].vatRate, list: listType });
    setVatModalOpen(true);
  };

  const handleSaveVat = () => {
    if (editingVat && !isNaN(editingVat.vatRate)) {
      updateOfferItems(editingVat.list, items => {
        const newItems = [...items];
        const item = newItems[editingVat.index];
        item.vatRate = editingVat.vatRate >= 0 ? editingVat.vatRate : 0;
        newItems[editingVat.index] = item;
        return newItems;
      });
      setVatModalOpen(false);
      setEditingVat(null);
    }
  };

  // --- Alternative Offer Specific Handlers ---
  const addAlternativeOffer = () => {
    setAlternatives(prev => [...prev, {
        id: `alt_${Date.now()}`,
        title: `Alternatif Teklif ${prev.length + 1}`,
        introText: 'Ana teklifimize ek olarak değerlendirebileceğiniz alternatif ürün/hizmet seçeneklerimiz aşağıda sunulmuştur.',
        items: [],
        documentNotes: 'Alternatif teklif için geçerli notlar.'
    }]);
  };
  
  const removeAlternativeOffer = (altId: string) => {
    setAlternatives(prev => prev.filter(alt => alt.id !== altId));
  };
  
  const openAlternativeNotesModal = (alt: AlternativeOffer) => {
    setEditingAlternativeNotes({ id: alt.id, notes: alt.documentNotes });
    setAlternativeNotesModalOpen(true);
  };

  const handleSaveAlternativeNotes = () => {
    if (editingAlternativeNotes) {
        updateAlternative(editingAlternativeNotes.id, { documentNotes: editingAlternativeNotes.notes });
        setAlternativeNotesModalOpen(false);
        setEditingAlternativeNotes(null);
    }
  };

  const openAlternativeHeaderModal = (alt: AlternativeOffer) => {
    setEditingAlternativeHeader({
      id: alt.id,
      title: alt.title,
      introText: alt.introText || 'Ana teklifimize ek olarak değerlendirebileceğiniz alternatif ürün/hizmet seçeneklerimiz aşağıda sunulmuştur.'
    });
    setAlternativeHeaderModalOpen(true);
  };

  const handleSaveAlternativeHeader = () => {
    if (editingAlternativeHeader) {
      updateAlternative(editingAlternativeHeader.id, { 
        title: editingAlternativeHeader.title,
        introText: editingAlternativeHeader.introText
      });
      setAlternativeHeaderModalOpen(false);
      setEditingAlternativeHeader(null);
    }
  };

  // --- Detail Page Handlers ---
  const handleItemDetailChange = (itemId: string, field: 'description' | 'photoUrl', value: string) => {
    setItemsForDetails(prevItems =>
        prevItems.map(item =>
            item.id === itemId ? { ...item, [field]: value } : item
        )
    );
  };

  const handleItemImageChange = (e: ChangeEvent<HTMLInputElement>, itemId: string) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              if (reader.result) {
                  handleItemDetailChange(itemId, 'photoUrl', reader.result as string);
              }
          };
          reader.readAsDataURL(file);
      }
  };
  
  const handleRemoveFromDetails = (itemId: string) => {
      setItemsForDetails(prev => prev.filter(item => item.id !== itemId));
  };

  // --- Calculation Functions ---
  const calculateItemTotal = (item: OfferItem) => {
    const baseTotal = item.quantity * item.unitPrice;
    const discountAmount = baseTotal * ((item.discount || 0) / 100);
    return baseTotal - discountAmount;
  }

  const calculateTotals = (items: OfferItem[]) => {
    const subTotalBeforeDiscount = items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
    const discountTotal = items.reduce((acc, item) => {
        const baseTotal = item.quantity * item.unitPrice;
        const discountAmount = baseTotal * ((item.discount || 0) / 100);
        return acc + discountAmount;
    }, 0);
    
    const subTotalAfterDiscount = subTotalBeforeDiscount - discountTotal;
    
    if (!showVat) {
        return {
            subTotalBeforeDiscount,
            discountTotal,
            subTotalAfterDiscount,
            tax: 0,
            grandTotal: subTotalAfterDiscount,
            vatBreakdown: null,
        };
    }
    
    let tax: number;
    let grandTotal: number;
    
    if (isVatIncluded) {
        grandTotal = items.reduce((acc, item) => {
            const itemTotalWithVat = item.total * (1 + item.vatRate / 100);
            return acc + itemTotalWithVat;
        }, 0);
        tax = grandTotal - subTotalAfterDiscount;
    } else {
        tax = items.reduce((acc, item) => acc + (item.total * (item.vatRate / 100)), 0);
        grandTotal = subTotalAfterDiscount + tax;
    }

    const uniqueVatRates = new Set(items.map(item => item.vatRate));
    const vatBreakdown = uniqueVatRates.size > 1
      ? Object.entries(
          items.reduce((acc, item) => {
            const rate = item.vatRate;
            let taxForThisItem;
            if (isVatIncluded) {
                const itemTotalWithVat = item.total * (1 + rate / 100);
                taxForThisItem = itemTotalWithVat - item.total;
            } else {
                taxForThisItem = item.total * (rate / 100);
            }
            if (!acc[rate]) {
              acc[rate] = 0;
            }
            acc[rate] += taxForThisItem;
            return acc;
          }, {} as Record<number, number>)
        )
      : null;
      
    return { subTotalBeforeDiscount, discountTotal, subTotalAfterDiscount, tax, grandTotal, vatBreakdown };
  };

  const mainTotals = calculateTotals(offerItems);

  const formatCurrency = (value: number) => {
    return value.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  const prepareOfferData = () => {
    if (!customerName) {
        toast({ variant: "destructive", title: "Eksik Bilgi", description: "Lütfen bir firma/müşteri adı girin." });
        return null;
    }
    if (offerItems.length === 0) {
        toast({ variant: "destructive", title: "Eksik Bilgi", description: "Lütfen ana teklife en az bir ürün ekleyin." });
        return null;
    }
    
    const alternativeTotal = alternatives.reduce((total, alt) => {
        const altTotals = calculateTotals(alt.items);
        return total + altTotals.grandTotal;
    }, 0);

    return {
        offerNumber,
        offerDate: offerDate?.toISOString(),
        validityDate: validityDate?.toISOString(),
        offerTitleDescription,
        customerName,
        contactPerson,
        customerAddress,
        items: offerItems,
        alternatives: alternatives,
        detailedItems: detailedItems,
        documentNotes,
        logoDataUrl,
        subTotal: mainTotals.subTotalAfterDiscount,
        tax: mainTotals.tax,
        grandTotal: mainTotals.grandTotal,
        alternativeTotal,
        isOrder,
        orderDate,
    };
  }

  const handleSaveOrUpdateOffer = () => {
    const offerData = prepareOfferData();
    if (!offerData) return;

    if (editingOfferId) {
        updateOffer({ ...offerData, id: editingOfferId });
    } else {
        addOffer(offerData);
    }
    router.push('/eski-teklifler');
  };

  const handleConvertToOrder = () => {
    const offerData = prepareOfferData();
    if (!offerData) return;

    const finalOfferData = {
        ...offerData,
        isOrder: true,
        orderDate: new Date().toISOString()
    };

    if (editingOfferId) {
        updateOffer({ ...finalOfferData, id: editingOfferId });
    } else {
        const newOffer = addOffer(finalOfferData);
        if (newOffer) {
            convertToOrder(newOffer.id);
        }
    }
    router.push('/siparisler');
  }

  const handleSaveDetails = () => {
    const newDetailedItems: OfferDetailItem[] = itemsForDetails.map(item => ({
        id: item.id,
        description: item.description,
        photoUrl: item.photoUrl,
        detailHeight: item.detailHeight,
    }));
    setDetailedItems(newDetailedItems);
    setDetailsModalOpen(false);
    toast({ title: "Detaylar Kaydedildi", description: "Yaptığınız özel detaylar bu teklife kaydedildi." });
  };
  
  const handlePrint = (section: 'main' | string) => {
      document.querySelectorAll('.printable-area, .printable-area-alternative').forEach(el => el.classList.add('print-hide-this'));

      if (section === 'main') {
          document.querySelector('.printable-area')?.classList.remove('print-hide-this');
      } else {
          document.querySelector(`.printable-area-alternative[data-alt-id="${section}"]`)?.classList.remove('print-hide-this');
      }
      
      document.body.classList.remove('details-modal-is-open');

      window.print();
  };

  const handleOpenProductModal = (listType: 'main' | string, initialName?: string) => {
    setListTypeForNewProduct(listType);
    setInitialProductName(initialName);
    setProductModalOpen(true);
  };

  const handleSaveNewProduct = (newProduct: Omit<Product, 'id'>) => {
    const productWithId = addNewProductsToList([newProduct])[0];
    if (productWithId) {
      handleSelectProduct(productWithId, listTypeForNewProduct);
    }
    setProductModalOpen(false);
    setInitialProductName(undefined);
  };
  
  const handleOpenCompanyModal = (initialName?: string) => {
    setInitialCompanyName(initialName);
    setCompanyModalOpen(true);
  };

  const handleSaveNewCompany = (newCompany: Omit<Company, 'id'>) => {
    addCompany(newCompany, (companyWithId) => {
        setCustomerName(companyWithId.name);
        setContactPerson(companyWithId.contactPerson || '');
        setCustomerAddress(companyWithId.address || '');
    });
    setCompanyModalOpen(false);
    setInitialCompanyName(undefined);
  };

  const handleOpenDetailsModal = () => {
    let initialModalItems: DetailOfferItem[];
    const hasCustomDetails = detailedItems && detailedItems.length > 0;
    
    if (hasCustomDetails) {
        const itemMap = new Map(offerItems.map(item => [item.id, item]));
        initialModalItems = detailedItems
            .map(detail => {
                const originalItem = itemMap.get(detail.id);
                return originalItem ? { ...originalItem, ...detail } : null;
            })
            .filter((item): item is DetailOfferItem => item !== null);
    } else {
        initialModalItems = offerItems.map(item => ({ ...item }));
    }

    setItemsForDetails(initialModalItems);
    setDetailsModalOpen(true);
  }

  
  const OfferHeader = () => (
    <div className="grid grid-cols-[2fr_1fr] gap-x-12 items-start offer-header-print">
      <div className="flex items-start -gap-1">
        
        {/* Interactive Logo for Screen */}
        <div className="w-48 h-20 flex-shrink-0 print:hidden">
            {logoPreview ? (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <div className="relative flex h-full w-full items-center justify-center cursor-pointer rounded-lg transition-colors hover:bg-muted">
                        <Image
                            src={logoPreview}
                            alt="Yüklenen logo önizlemesi"
                            layout="fill"
                            objectFit="contain"
                            className="rounded-lg p-1"
                            data-ai-hint="company logo"
                            unoptimized
                        />
                        </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                        <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
                        <Pencil className="mr-2 h-4 w-4" />
                        <span>Düzenle</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                        onClick={clearLogo}
                        className="text-destructive focus:text-destructive-foreground focus:bg-destructive"
                        >
                        <Trash2 className="mr-2 h-4 w-4" />
                        <span>Sil</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ) : (
                <div
                className="relative flex h-full w-full flex-col items-center justify-center cursor-pointer rounded-lg transition-colors hover:bg-muted"
                onClick={() => fileInputRef.current?.click()}
                >
                <div className="text-center p-1">
                    <UploadCloud className="mx-auto h-5 w-5 text-muted-foreground" />
                    <p className="mt-1 text-xs text-muted-foreground">Logo Yükle</p>
                </div>
                </div>
            )}
            <Input
                ref={fileInputRef}
                id="logo-upload"
                type="file"
                className="hidden"
                accept="image/png, image/jpeg, image/webp"
                onChange={handleLogoChange}
            />
        </div>

        {/* Static Logo for Print */}
        <div className="w-48 h-20 flex-shrink-0 hidden print:block relative">
            {logoPreview && (
                <Image
                    src={logoPreview}
                    alt="Firma Logosu"
                    layout="fill"
                    objectFit="contain"
                    className="rounded-lg p-1"
                    unoptimized
                />
            )}
        </div>

        <div className="text-foreground space-y-px pt-0.5">
            <p className="font-semibold text-xs text-foreground">ONE YAZILIM - TURGAY IŞIK</p>
            <p className="text-[11px] text-muted-foreground">Kurtuluş mah. Sanayi Sok. No:22/A</p>
            <p className="text-[11px] text-muted-foreground">Soma / MANİSA</p>
            <p className="text-[11px] text-muted-foreground">www.oneyazilim.com</p>
            <p className="text-[11px] text-muted-foreground">0 532 588 17 82 | 0 236 606 08 81</p>
        </div>
      </div>
       <div className="text-right space-y-2">
            <div className="flex justify-end items-center gap-2">
                {isOrder && <Badge className="bg-green-100 text-green-800 border-green-200">SİPARİŞ</Badge>}
                <h1 className="text-lg font-bold text-foreground whitespace-nowrap">{isOrder ? "SİPARİŞ FORMU" : "FİYAT TEKLİFİ"}</h1>
            </div>
            <div
                className="group relative cursor-pointer rounded-md p-2 text-xs text-right text-muted-foreground whitespace-pre-wrap min-h-[40px] bg-muted hover:bg-muted/80"
                onClick={() => {
                    setTempOfferTitle(offerTitleDescription);
                    setTitleModalOpen(true);
                }}
            >
                <Pencil className="absolute top-1 right-1 h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                {offerTitleDescription || 'Teklif konusu...'}
            </div>
        </div>
    </div>
  );

  if (!isClient) {
    return null;
  }

  return (
    <>
      {/* Main Offer */}
      <div className="printable-area max-w-3xl mx-auto my-8 p-8 space-y-6 bg-card shadow-lg print:shadow-none print:border-none print:my-0 print:p-6">
        <OfferHeader />

        {/* Customer and Offer Details Section */}
        <div className="grid grid-cols-3 gap-x-12 gap-y-4 pt-4 offer-details-print">
          <div className="col-span-2 space-y-2">
            <CustomerAutocomplete 
              customerName={customerName}
              setCustomerName={setCustomerName}
              setContactPerson={setContactPerson}
              setCustomerAddress={setCustomerAddress}
              companies={companies}
              handleOpenCompanyModal={handleOpenCompanyModal}
            />
            <div className="grid grid-cols-[80px_1fr] items-center gap-2">
                <Label htmlFor="contact-person" className="text-xs">Yetkili Kişi</Label>
                <Input id="contact-person" placeholder="Yetkili Kişi" value={contactPerson} onChange={(e) => setContactPerson(e.target.value)} className="h-7"/>
            </div>
            <div className="grid grid-cols-[80px_1fr] items-start gap-2">
                <Label htmlFor="customer-address" className="text-xs pt-1">Adres</Label>
                <Textarea id="customer-address" placeholder="Müşteri adresi" rows={2} value={customerAddress} onChange={(e) => setCustomerAddress(e.target.value)} className="min-h-[44px]" />
            </div>
          </div>
          <div className="col-span-1">
            <div className="grid grid-cols-[auto_1fr] items-center gap-x-2 gap-y-2">
                <Label
                  className="text-right text-xs cursor-pointer hover:text-primary transition-colors whitespace-nowrap"
                  onClick={() => {
                      setTempOfferNumber(offerNumber || '');
                      setOfferNoModalOpen(true);
                  }}
                >
                    Teklif No
                </Label>
                <Input
                    value={offerNumber}
                    readOnly
                    onClick={() => {
                      setTempOfferNumber(offerNumber || '');
                      setOfferNoModalOpen(true);
                    }}
                    className="h-7 w-28 font-normal text-right pr-2 cursor-pointer focus-visible:ring-0 focus-visible:ring-offset-0 border-transparent text-[12px] bg-muted"
                />

                <Label className="text-right text-xs whitespace-nowrap">Tarih</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant={"ghost"} className={cn("w-28 justify-end text-right font-normal h-7 pr-2 text-[12px] hover:bg-muted/80 bg-muted", !offerDate && "text-muted-foreground")}>
                      {offerDate ? format(offerDate, "dd.MM.yyyy", { locale: tr }) : <span>Tarih seçin</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={offerDate} onSelect={(date) => {setOfferDate(date); if (date) { setIsValidityDateManuallySet(false) };}} initialFocus locale={tr} />
                  </PopoverContent>
                </Popover>

                <Label className="text-right text-xs whitespace-nowrap">Geçerlilik</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant={"ghost"} className={cn("w-28 justify-end text-right font-normal h-7 pr-2 text-[12px] hover:bg-muted/80 bg-muted", !validityDate && "text-muted-foreground")}>
                      {validityDate ? format(validityDate, "dd.MM.yyyy", { locale: tr }) : <span>Tarih seçin</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={validityDate}
                      onSelect={(date) => {
                        setValidityDate(date);
                        if (date) {
                          setIsValidityDateManuallySet(true);
                        }
                      }}
                      initialFocus
                      locale={tr}
                    />
                  </PopoverContent>
                </Popover>
            </div>
          </div>
        </div>
        
        {/* Intro Text */}
        <div className="text-xs text-foreground space-y-1">
          <p>Sayın Yetkili,</p>
          <p>Firmanızın talebi üzerine hazırlanan fiyat teklifimiz bilgilerinize sunulmuştur. Göstermiş olduğunuz ilgiye teşekkür eder, çalışmalarınızda başarılar dileriz.</p>
        </div>

        {/* Products Section */}
        <div className="!mt-4">
          <div className="table-container-print">
            <div className="border rounded-lg overflow-hidden">
              {/* Header */}
              <div className="flex h-9 bg-muted/50 text-muted-foreground font-medium text-xs border-b">
                <div className="p-2 flex-1 min-w-0">Ürün/Hizmet</div>
                <div className="p-2 w-[60px] shrink-0 text-center">Miktar</div>
                 {showDiscountColumn && (
                    <div className="p-2 w-[60px] shrink-0 text-center">İsk. (%)</div>
                 )}
                 {showVat && (
                    <div className={cn("p-2 shrink-0 text-center", showDiscountColumn ? 'w-[60px]' : 'w-[80px]')}>Kdv %</div>
                 )}
                <div className={cn("p-2 shrink-0 text-right", showDiscountColumn ? 'w-[100px]' : 'w-[110px]')}>Birim Fiyat</div>
                <div className={cn("p-2 shrink-0 text-right", showDiscountColumn ? 'w-[110px]' : 'w-[120px]')}>Toplam</div>
                <div className="p-2 w-[50px] shrink-0"><span className="sr-only">Eylemler</span></div>
              </div>
              {/* Body */}
              <div className="text-sm">
                {offerItems.length > 0 && offerItems.map((item, index) => (
                  <div key={item.id} className="border-b last:border-b-0">
                    <div className="flex items-start">
                      <div className="p-2 flex-1 min-w-0">
                         <div className="flex flex-col gap-1">
                            <div className="h-7 w-full flex items-center text-xs text-left cursor-pointer group" onClick={() => openDescriptionModal(index, 'main')}>
                                <span className="truncate">{item.name || "Ürün adı..."}</span>
                                <Pencil className="ml-2 h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                         </div>
                      </div>
                      <div 
                        className="group p-2 w-[60px] shrink-0 flex items-center justify-center text-[12px] pt-[10px] cursor-pointer"
                        onClick={() => openNumericModal(index, 'quantity', 'main')}
                      >
                         <div className="flex items-center justify-center gap-1">
                            <span>{item.quantity}</span>
                            <Pencil className="hidden group-hover:inline-block h-3 w-3" />
                         </div>
                      </div>
                      {showDiscountColumn && (
                        <div 
                          className="group p-2 w-[60px] shrink-0 flex items-center justify-center text-[12px] pt-[10px] cursor-pointer"
                          onClick={() => openNumericModal(index, 'discount', 'main')}
                        >
                            <div className="flex items-center justify-center gap-1">
                                <span>{item.discount || 0}</span>
                                <Pencil className="hidden group-hover:inline-block h-3 w-3" />
                            </div>
                        </div>
                      )}
                      {showVat && (
                        <div 
                            className={cn("group p-2 shrink-0 flex items-center justify-center text-[12px] pt-[10px] cursor-pointer", showDiscountColumn ? 'w-[60px]' : 'w-[80px]')}>
                            <div className="flex items-center justify-center gap-1" onClick={() => openVatModal(index, 'main')}>
                            <span>{item.vatRate}</span>
                            <Pencil className="hidden group-hover:inline-block h-3 w-3" />
                            </div>
                        </div>
                      )}
                      <div 
                        className={cn("group p-2 shrink-0 text-right cursor-pointer", showDiscountColumn ? 'w-[100px]' : 'w-[110px]')}>
                         <div className="flex items-center justify-end gap-1 text-[12px] pt-[2px]" onClick={() => openPriceModal(index, 'unitPrice', 'main')}>
                            <span>{formatCurrency(isVatIncluded ? item.unitPrice * (1 + item.vatRate / 100) : item.unitPrice)} ₺</span>
                            <Pencil className="hidden group-hover:inline-block h-3 w-3" />
                         </div>
                      </div>
                      <div 
                        className={cn("group p-2 shrink-0 text-right cursor-pointer", showDiscountColumn ? 'w-[110px]' : 'w-[120px]')}>
                          <div className="flex items-center justify-end gap-1 text-[12px] pt-[2px]" onClick={() => openPriceModal(index, 'total', 'main')}>
                            <span>{formatCurrency(isVatIncluded ? item.total * (1 + item.vatRate / 100) : item.total)} ₺</span>
                            <Pencil className="hidden group-hover:inline-block h-3 w-3" />
                         </div>
                      </div>
                      <div className="p-2 w-[50px] shrink-0 flex items-center justify-center print:hidden">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openDescriptionModal(index, 'main')}>Açıklamayı Düzenle</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => removeDescription(index, 'main')}>Açıklamayı Sil</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => removeItem(index, 'main')} className="text-destructive focus:text-destructive-foreground focus:bg-destructive">Satırı Sil</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    {item.description && (
                      <div className="px-2 pb-2">
                        <p className="text-xs text-muted-foreground whitespace-pre-wrap">
                          {item.description}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
                
                <div className="print:hidden">
                    <ProductAutocomplete listType="main" products={products} handleSelectProduct={handleSelectProduct} handleOpenProductModal={handleOpenProductModal} />
                </div>

              </div>

              {/* Footer */}
              <div className="bg-muted/50 border-t">
                  {offerItems.length > 0 && (
                      <div className="flex items-start">
                          <div className="w-1/2 p-2 self-end">
                              <div className="flex flex-col items-start">
                                  {showVat && mainTotals.vatBreakdown && (
                                      <div className="text-[10px] font-normal text-muted-foreground">
                                          {mainTotals.vatBreakdown.map(([rate, amount]) => (
                                              <div key={rate}>
                                                  (%{rate} Dahil: {formatCurrency(Number(amount))} ₺)
                                              </div>
                                          ))}
                                      </div>
                                  )}
                              </div>
                          </div>
                          <div className="w-1/2 p-2">
                              <div className="w-[240px] ml-auto space-y-0">
                                  <div className="flex justify-between items-center py-0">
                                      <span className="text-muted-foreground text-[12px]">Ara Toplam</span>
                                      <span className="text-[12px] font-medium">{formatCurrency(mainTotals.subTotalBeforeDiscount)} ₺</span>
                                  </div>
                                  {mainTotals.discountTotal > 0 && (
                                      <>
                                          <div className="flex justify-between items-center py-0">
                                              <span className="text-muted-foreground text-[12px]">İskonto</span>
                                              <span className="text-[12px] font-medium text-red-600">-{formatCurrency(mainTotals.discountTotal)} ₺</span>
                                          </div>
                                          <div className="flex justify-between items-center py-0 border-t border-dashed">
                                              <span className="text-muted-foreground text-[12px] font-medium">İndirimli Tutar</span>
                                              <span className="text-[12px] font-medium">{formatCurrency(mainTotals.subTotalAfterDiscount)} ₺</span>
                                          </div>
                                      </>
                                  )}
                                  {showVat && (
                                      <div className="flex justify-between items-center py-0">
                                          <span className="text-muted-foreground text-[12px]">{isVatIncluded ? 'Dahil Olan KDV' : 'KDV Toplamı'}</span>
                                          <span className="text-[12px] font-medium">{formatCurrency(mainTotals.tax)} ₺</span>
                                      </div>
                                  )}
                                  <div className="flex justify-between items-center border-t mt-1 pt-1">
                                      <span className="font-bold text-foreground text-[14px]">Genel Toplam</span>
                                      <span className="font-bold text-foreground text-[14px]">{formatCurrency(mainTotals.grandTotal)} ₺</span>
                                  </div>
                              </div>
                          </div>
                      </div>
                  )}
                  {!isOrder && (
                    <div className="p-2 border-t">
                        <div className="group relative cursor-pointer">
                            <Label htmlFor="document-notes" className="text-xs font-semibold text-foreground" onClick={() => { setTempDocumentNotes(documentNotes); setNotesModalOpen(true); }}>BELGE NOTLARI</Label>
                            <Pencil className="absolute top-0 right-0 h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                            <p className="mt-1 p-2 text-[12px] whitespace-pre-wrap text-muted-foreground min-h-[80px] rounded-md bg-transparent hover:bg-muted/50" onClick={() => { setTempDocumentNotes(documentNotes); setNotesModalOpen(true); }}>
                                {documentNotes}
                            </p>
                        </div>
                    </div>
                  )}
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between mt-4 gap-2 print:hidden">
             <div className="flex items-center gap-2">
              <Button onClick={() => setShowDiscountColumn(prev => !prev)} variant="outline" size="sm" className="h-7 px-2 text-xs">
                  <Percent className="mr-1.5 h-3.5 w-3.5" />
                  İsk. {showDiscountColumn ? 'Gizle' : 'Göster'}
              </Button>
               <Button onClick={() => setIsVatIncluded(prev => !prev)} variant="outline" size="sm" className="h-7 px-2 text-xs">
                  <Percent className="mr-1.5 h-3.5 w-3.5" />
                  {isVatIncluded ? 'KDV Hariç Göster' : 'KDV Dahil Göster'}
              </Button>
              <Button onClick={() => setShowVat(prev => !prev)} variant="outline" size="sm" className="h-7 px-2 text-xs">
                  <Percent className="mr-1.5 h-3.5 w-3.5" />
                  KDV {showVat ? 'Gizle' : 'Göster'}
              </Button>
            </div>
             {isOrder && orderDate && (
                <div className="text-sm text-green-700 font-medium bg-green-100 px-3 py-1.5 rounded-md flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    <span>Sipariş Güncellendi: {format(new Date(orderDate), 'dd.MM.yyyy HH:mm', { locale: tr })}</span>
                </div>
            )}
          </div>
          
          <div className="pt-4 flex flex-col sm:flex-row justify-end gap-2 print:hidden">
              <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="w-full sm:w-auto h-8 text-xs">
                          <FilePenLine className="mr-2 h-4 w-4" />
                          <span>Seçenekler</span>
                          <ChevronDown className="h-4 w-4 opacity-50 ml-2" />
                      </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={handleOpenDetailsModal}>
                          <GalleryVerticalEnd className="mr-2 h-4 w-4" />
                          <span>Detayları Düzenle</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={addAlternativeOffer}>
                          <PlusCircle className="mr-2 h-4 w-4" />
                          <span>Alternatif Teklif Ekle</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                       <DropdownMenuItem onClick={() => handlePrint('main')}>
                        <Monitor className="mr-2 h-4 w-4" />
                        <span>HTML Önizleme</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handlePrint('main')}>
                        <FileText className="mr-2 h-4 w-4" />
                        <span>PDF Yazdır</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
              </DropdownMenu>

              {!isOrder && (
                  <Button variant="secondary" className="w-full sm:w-auto h-8 text-xs bg-green-600 text-white hover:bg-green-700" onClick={handleConvertToOrder}>
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Siparişe Dönüştür ve Kaydet
                  </Button>
              )}

              <Button className="w-full sm:w-auto h-8 text-xs" onClick={handleSaveOrUpdateOffer}>
                {isOrder ? 'Siparişi Güncelle' : 'Teklifi Kaydet'}
              </Button>
          </div>
        </div>
      </div>

      {/* Alternative Offer Sections */}
      {alternatives.map((alt) => {
        const alternativeTotals = calculateTotals(alt.items);
        return (
          <div key={alt.id} data-alt-id={alt.id} className="relative printable-area-alternative max-w-3xl mx-auto my-12 p-8 space-y-6 bg-card shadow-lg print:shadow-none print:border-none print:my-0 print:p-6 border-t-4 border-dashed border-primary/20">
              <div className="absolute top-2 right-2 print:hidden">
                <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => removeAlternativeOffer(alt.id)}
                >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Alternatif teklifi sil</span>
                </Button>
              </div>

              <div className="grid grid-cols-[2fr_1fr] gap-x-12 items-start offer-header-print">
                  <div className="flex items-start -gap-1">
                    {/* Screen-only wrapper for alternative logos */}
                    <div className="w-48 h-20 flex-shrink-0 flex items-center justify-center print:hidden">
                        {logoPreview && (
                            <div className="relative h-full w-full">
                            <Image
                                src={logoPreview}
                                alt="Firma Logosu"
                                layout="fill"
                                objectFit="contain"
                                className="rounded-lg p-1"
                                unoptimized
                            />
                            </div>
                        )}
                    </div>
                     {/* Static Logo for Print */}
                    <div className="w-48 h-20 flex-shrink-0 hidden print:block relative">
                        {logoPreview && (
                            <Image
                                src={logoPreview}
                                alt="Firma Logosu"
                                layout="fill"
                                objectFit="contain"
                                className="rounded-lg p-1"
                                unoptimized
                            />
                        )}
                    </div>
                    <div className="text-foreground space-y-px pt-0.5">
                        <p className="font-semibold text-xs text-foreground">ONE YAZILIM - TURGAY IŞIK</p>
                        <p className="text-[11px] text-muted-foreground">Kurtuluş mah. Sanayi Sok. No:22/A</p>
                        <p className="text-[11px] text-muted-foreground">Soma / MANİSA</p>
                        <p className="text-[11px] text-muted-foreground">www.oneyazilim.com</p>
                        <p className="text-[11px] text-muted-foreground">0 532 588 17 82 | 0 236 606 08 81</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <h1 className="text-lg font-bold text-foreground whitespace-nowrap">{alt.title.toUpperCase()}</h1>
                  </div>
              </div>
              
              <div className="text-xs text-foreground space-y-1 !mt-8">
                <p>{alt.introText || 'Ana teklifimize ek olarak değerlendirebileceğiniz alternatif ürün/hizmet seçeneklerimiz aşağıda sunulmuştur.'}</p>
              </div>

              <div className="!mt-4">
                <div className="border rounded-lg overflow-hidden">
                  <div className="flex h-9 bg-muted/50 text-muted-foreground font-medium text-xs border-b">
                    <div className="p-2 flex-1 min-w-0">Ürün/Hizmet</div>
                    <div className="p-2 w-[60px] shrink-0 text-center">Miktar</div>
                    {showDiscountColumn && (
                        <div className="p-2 w-[60px] shrink-0 text-center">İsk. (%)</div>
                    )}
                    {showVat && (
                        <div className={cn("p-2 shrink-0 text-center", showDiscountColumn ? 'w-[60px]' : 'w-[80px]')}>Kdv %</div>
                    )}
                    <div className={cn("p-2 shrink-0 text-right", showDiscountColumn ? 'w-[100px]' : 'w-[110px]')}>Birim Fiyat</div>
                    <div className={cn("p-2 shrink-0 text-right", showDiscountColumn ? 'w-[110px]' : 'w-[120px]')}>Toplam</div>
                    <div className="p-2 w-[50px] shrink-0"><span className="sr-only">Eylemler</span></div>
                  </div>
                  <div className="text-sm">
                    {alt.items.map((item, index) => (
                      <div key={item.id} className="border-b last:border-b-0">
                        <div className="flex items-start">
                          <div className="p-2 flex-1 min-w-0">
                             <div className="flex flex-col gap-1">
                                <div className="h-7 w-full flex items-center text-xs text-left">
                                    <span className="truncate">{item.name}</span>
                                </div>
                             </div>
                          </div>
                          <div 
                              className="group p-2 w-[60px] shrink-0 flex items-center justify-center text-[12px] pt-[10px] cursor-pointer"
                              onClick={() => openNumericModal(index, 'quantity', alt.id)}>
                             <div className="flex items-center justify-center gap-1">
                                <span>{item.quantity}</span>
                                <Pencil className="hidden group-hover:inline-block h-3 w-3" />
                             </div>
                          </div>
                          {showDiscountColumn && (
                            <div 
                              className="group p-2 w-[60px] shrink-0 flex items-center justify-center text-[12px] pt-[10px] cursor-pointer"
                              onClick={() => openNumericModal(index, 'discount', alt.id)}>
                                <div className="flex items-center justify-center gap-1">
                                    <span>{item.discount || 0}</span>
                                    <Pencil className="hidden group-hover:inline-block h-3 w-3" />
                                </div>
                            </div>
                           )}
                           {showVat && (
                               <div 
                                  className={cn("group p-2 shrink-0 flex items-center justify-center text-[12px] pt-[10px] cursor-pointer", showDiscountColumn ? 'w-[60px]' : 'w-[80px]')}>
                                  <div className="flex items-center justify-center gap-1" onClick={() => openVatModal(index, alt.id)}>
                                    <span>{item.vatRate}</span>
                                    <Pencil className="hidden group-hover:inline-block h-3 w-3" />
                                  </div>
                               </div>
                           )}
                          <div 
                              className={cn("group p-2 shrink-0 text-right cursor-pointer", showDiscountColumn ? 'w-[100px]' : 'w-[110px]')}>
                              <div className="flex items-center justify-end gap-1 text-[12px] pt-[2px]" onClick={() => openPriceModal(index, 'unitPrice', alt.id)}>
                                <span>{formatCurrency(isVatIncluded ? item.unitPrice * (1 + item.vatRate / 100) : item.unitPrice)} ₺</span>
                                <Pencil className="hidden group-hover:inline-block h-3 w-3" />
                             </div>
                          </div>
                          <div 
                              className={cn("group p-2 shrink-0 text-right cursor-pointer", showDiscountColumn ? 'w-[110px]' : 'w-[120px]')}>
                              <div className="flex items-center justify-end gap-1 text-[12px] pt-[2px]" onClick={() => openPriceModal(index, 'total', alt.id)}>
                                <span>{formatCurrency(isVatIncluded ? item.total * (1 + item.vatRate / 100) : item.total)} ₺</span>
                                <Pencil className="hidden group-hover:inline-block h-3 w-3" />
                             </div>
                          </div>
                          <div className="p-2 w-[50px] shrink-0 flex items-center justify-center print:hidden">
                             <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => openDescriptionModal(index, alt.id)}>Açıklamayı Düzenle</DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => removeItem(index, alt.id)} className="text-destructive focus:text-destructive-foreground focus:bg-destructive">Satırı Sil</DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                          </div>
                        </div>
                        {item.description && (
                          <div className="px-2 pb-2"><p className="text-xs text-muted-foreground whitespace-pre-wrap">{item.description}</p></div>
                        )}
                      </div>
                    ))}
                    
                    <div className="print:hidden">
                        <ProductAutocomplete listType={alt.id} products={products} handleSelectProduct={handleSelectProduct} handleOpenProductModal={handleOpenProductModal} />
                    </div>

                  </div>

                   {alt.items.length > 0 && (
                      <div className="bg-muted/50 border-t">
                        <div className="flex items-start">
                           <div className="w-1/2 p-2 self-end">
                              {showVat && alternativeTotals.vatBreakdown && (
                                <div className="text-[10px] font-normal text-muted-foreground">
                                  {alternativeTotals.vatBreakdown.map(([rate, amount]) => (<div key={rate}>(%{rate} Dahil: {formatCurrency(Number(amount))} ₺)</div>))}
                                </div>
                              )}
                          </div>
                          <div className="w-1/2 p-2">
                             <div className="w-[240px] ml-auto space-y-0">
                                <div className="flex justify-between items-center py-0"><span className="text-muted-foreground text-[12px]">Ara Toplam</span><span className="text-[12px] font-medium">{formatCurrency(alternativeTotals.subTotalBeforeDiscount)} ₺</span></div>
                                 {alternativeTotals.discountTotal > 0 && (
                                   <>
                                   <div className="flex justify-between items-center py-0">
                                      <span className="text-muted-foreground text-[12px]">İskonto</span>
                                      <span className="text-[12px] font-medium text-red-600">-{formatCurrency(alternativeTotals.discountTotal)} ₺</span>
                                   </div>
                                    <div className="flex justify-between items-center py-0 border-t border-dashed">
                                        <span className="text-muted-foreground text-[12px] font-medium">İndirimli Tutar</span>
                                        <span className="text-[12px] font-medium">{formatCurrency(alternativeTotals.subTotalAfterDiscount)} ₺</span>
                                    </div>
                                   </>
                                )}
                                {showVat && (
                                    <div className="flex justify-between items-center py-0"><span className="text-muted-foreground text-[12px]">{isVatIncluded ? 'Dahil Olan KDV' : 'KDV Toplamı'}</span><span className="text-[12px] font-medium">{formatCurrency(alternativeTotals.tax)} ₺</span></div>
                                )}
                                <div className="flex justify-between items-center border-t mt-1 pt-1"><span className="font-bold text-foreground text-[14px]">Genel Toplam</span><span className="font-bold text-foreground text-[14px]">{formatCurrency(alternativeTotals.grandTotal)} ₺</span></div>
                            </div>
                          </div>
                        </div>
                         <div className="p-2 border-t">
                          <div className="w-full space-y-2">
                              <Label className="text-xs font-semibold text-foreground">ALTERNATİF TEKLİF NOTLARI</Label>
                              <p className="mt-1 text-[12px] whitespace-pre-wrap text-muted-foreground">{alt.documentNotes}</p>
                          </div>
                         </div>
                      </div>
                   )}
                </div>
                 <div className="pt-4 flex flex-col sm:flex-row justify-end gap-2 print:hidden">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="w-full sm:w-auto h-8 text-xs justify-between">
                              <span className="flex items-center gap-2">
                                <FilePenLine />
                                <span>Düzenle</span>
                              </span>
                              <ChevronDown className="h-4 w-4 opacity-50" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openAlternativeHeaderModal(alt)}>
                                <FilePenLine className="mr-2 h-4 w-4" />
                                <span>Başlığı/Açıklamayı Düzenle</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openAlternativeNotesModal(alt)}>
                              <FilePenLine className="mr-2 h-4 w-4" />
                              <span>Notları Yönet</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                          <Button variant="outline" className="w-full sm:w-auto h-8 text-xs justify-between">
                              <span className="flex items-center gap-2">
                                  <Printer />
                                  <span>Yazdır / Önizle</span>
                              </span>
                              <ChevronDown className="h-4 w-4 opacity-50" />
                          </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handlePrint(alt.id)}>
                              <Monitor className="mr-2 h-4 w-4" />
                              <span>HTML Önizleme</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handlePrint(alt.id)}>
                              <FileText className="mr-2 h-4 w-4" />
                              <span>PDF Yazdır</span>
                          </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    <Button className="w-full sm:w-auto h-8 text-xs" onClick={handleSaveOrUpdateOffer}>Teklifi Kaydet</Button>
                </div>
              </div>
          </div>
        )
      })}
      
      <CompanyEditModal
        isOpen={isCompanyModalOpen}
        onOpenChange={setCompanyModalOpen}
        company={initialCompanyName ? { name: initialCompanyName, type: 'customer' } : {type: 'customer'}}
        onSave={(newCompanyData) => {
          if (!('id' in newCompanyData)) {
            handleSaveNewCompany(newCompanyData);
          }
        }}
      />

      <ProductEditModal
        isOpen={isProductModalOpen}
        onOpenChange={setProductModalOpen}
        product={initialProductName ? { name: initialProductName } : null}
        onSave={(newProductData) => {
          if (!('id' in newProductData)) {
            handleSaveNewProduct(newProductData);
          }
        }}
      />


       <Dialog open={isDescriptionModalOpen} onOpenChange={setDescriptionModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ürün Açıklamasını Düzenle</DialogTitle>
            </DialogHeader>
            <Textarea
              value={editingDescription?.text || ''}
              onChange={(e) => setEditingDescription(prev => prev ? { ...prev, text: e.target.value } : null)}
              rows={8}
            />
            <DialogFooter>
                <Button variant="outline" onClick={() => setDescriptionModalOpen(false)}>İptal</Button>
                <Button onClick={handleSaveDescription}>Kaydet</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        <Dialog open={isPriceModalOpen} onOpenChange={setPriceModalOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{editingPrice?.field === 'unitPrice' ? 'Birim Fiyatı Düzenle' : 'Toplam Fiyatı Düzenle'}</DialogTitle>
                </DialogHeader>
                <div className="relative">
                    <Input
                        type="number"
                        value={editingPrice?.value ?? ''}
                        onChange={(e) => setEditingPrice(prev => prev ? { ...prev, value: Number(e.target.value) } : null)}
                        className="pr-6"
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSavePrice(); } }}
                        placeholder="0"
                        autoFocus
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground">₺</span>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setPriceModalOpen(false)}>İptal</Button>
                    <Button onClick={handleSavePrice}>Kaydet</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
        
        <Dialog open={isVatModalOpen} onOpenChange={setVatModalOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>KDV Oranını Düzenle</DialogTitle>
                </DialogHeader>
                <div className="relative">
                    <Input
                        type="number"
                        value={editingVat?.vatRate ?? ''}
                        onChange={(e) => setEditingVat(prev => prev ? { ...prev, vatRate: Number(e.target.value) } : null)}
                        className="pr-6"
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSaveVat(); } }}
                        placeholder="0"
                        autoFocus
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setVatModalOpen(false)}>İptal</Button>
                    <Button onClick={handleSaveVat}>Kaydet</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
        
        <Dialog open={isNumericModalOpen} onOpenChange={setNumericModalOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {editingNumeric?.field === 'quantity' ? 'Miktarı Düzenle' : 'İskonto Oranını Düzenle'}
                    </DialogTitle>
                </DialogHeader>
                <div className="relative">
                    <Input
                        type="number"
                        value={editingNumeric?.value ?? ''}
                        onChange={(e) => setEditingNumeric(prev => prev ? { ...prev, value: Number(e.target.value) } : null)}
                        className="pr-6"
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSaveNumeric(); } }}
                        placeholder="0"
                        autoFocus
                    />
                     {editingNumeric?.field === 'discount' && (
                        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
                     )}
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setNumericModalOpen(false)}>İptal</Button>
                    <Button onClick={handleSaveNumeric}>Kaydet</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>


        <Dialog open={isTitleModalOpen} onOpenChange={setTitleModalOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Teklif Konusunu Düzenle</DialogTitle>
                </DialogHeader>
                <Textarea
                    value={tempOfferTitle}
                    onChange={(e) => setTempOfferTitle(e.target.value)}
                    rows={4}
                    autoFocus
                />
                <DialogFooter>
                    <Button variant="outline" onClick={() => setTitleModalOpen(false)}>İptal</Button>
                    <Button onClick={() => { setOfferTitleDescription(tempOfferTitle); setTitleModalOpen(false); }}>Kaydet</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

        <Dialog open={isNotesModalOpen} onOpenChange={setNotesModalOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Belge Notlarını Düzenle</DialogTitle>
                </DialogHeader>
                <Textarea
                    value={tempDocumentNotes}
                    onChange={(e) => setTempDocumentNotes(e.target.value)}
                    rows={8}
                    autoFocus
                />
                <DialogFooter>
                    <Button variant="outline" onClick={() => setNotesModalOpen(false)}>İptal</Button>
                    <Button onClick={() => { setDocumentNotes(tempDocumentNotes); setNotesModalOpen(false); }}>Kaydet</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>


        <Dialog open={isAlternativeNotesModalOpen} onOpenChange={setAlternativeNotesModalOpen}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Alternatif Teklif Notlarını Düzenle</DialogTitle>
                    <DialogDescription>
                        Bu alternatif teklif bölümü için özel notlarınızı buraya ekleyin.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-6 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="modal-alt-doc-notes">Alternatif Belge Notları</Label>
                        <Textarea
                            id="modal-alt-doc-notes"
                            placeholder="Alternatif teklif için geçerli koşulları, notları buraya yazın."
                            value={editingAlternativeNotes?.notes || ''}
                            onChange={(e) => setEditingAlternativeNotes(prev => prev ? { ...prev, notes: e.target.value } : null)}
                            rows={8}
                            autoFocus
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setAlternativeNotesModalOpen(false)}>İptal</Button>
                    <Button onClick={handleSaveAlternativeNotes}>Kaydet</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

        <Dialog open={isAlternativeHeaderModalOpen} onOpenChange={setAlternativeHeaderModalOpen}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Alternatif Teklif Başlığını Düzenle</DialogTitle>
                    <DialogDescription>
                        Bu alternatif teklif bölümünün başlığını ve giriş metnini düzenleyin.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-6 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="modal-alt-title">Başlık</Label>
                        <Input
                            id="modal-alt-title"
                            placeholder="Alternatif Teklif Başlığı"
                            value={editingAlternativeHeader?.title || ''}
                            onChange={(e) => setEditingAlternativeHeader(prev => prev ? { ...prev, title: e.target.value } : null)}
                            autoFocus
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="modal-alt-intro">Giriş Metni</Label>
                        <Textarea
                            id="modal-alt-intro"
                            placeholder="Alternatif teklif için giriş metni."
                            value={editingAlternativeHeader?.introText || ''}
                            onChange={(e) => setEditingAlternativeHeader(prev => prev ? { ...prev, introText: e.target.value } : null)}
                            rows={4}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setAlternativeHeaderModalOpen(false)}>İptal</Button>
                    <Button onClick={handleSaveAlternativeHeader}>Kaydet</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>


        <Dialog open={isOfferNoModalOpen} onOpenChange={(isOpen) => { setOfferNoModalOpen(isOpen); if(isOpen) setTempOfferNumber(offerNumber || ''); }}>
            <DialogContent className="sm:max-w-xs">
                <DialogHeader>
                    <DialogTitle>Teklif Numarasını Düzenle</DialogTitle>
                </DialogHeader>
                <div className="relative">
                    
                    <Input
                        value={tempOfferNumber}
                        onChange={(e) => setTempOfferNumber(e.target.value)}
                        className="pl-2 text-right"
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSaveOfferNumber(); } }}
                        autoFocus
                    />
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOfferNoModalOpen(false)}>İptal</Button>
                    <Button onClick={handleSaveOfferNumber}>Kaydet</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

        <Dialog open={isDetailsModalOpen} onOpenChange={setDetailsModalOpen}>
            <DialogContent className="sm:max-w-4xl h-[90vh]">
                <DialogHeader className="print-hide">
                    <DialogTitle>Teklif Detaylarını Düzenle</DialogTitle>
                    <DialogDescription>
                        Bu bölümdeki resim ve açıklamaları düzenleyebilirsiniz. Değişiklikleriniz teklife yansıyacaktır.
                    </DialogDescription>
                </DialogHeader>
                <ScrollArea className="flex-grow pr-6">
                    <div className="space-y-6 print-area">
                        {itemsForDetails.length > 0 ? (
                            itemsForDetails.map((item) => (
                            <Card 
                                key={item.id} 
                                className="product-card-interactive relative product-card-print"
                                style={item.detailHeight ? { height: `${item.detailHeight}px` } : { minHeight: '180px' }}
                            >
                                <Button
                                    variant="destructive"
                                    size="icon"
                                    className="absolute top-2 right-2 z-10 h-7 w-7 print-hide"
                                    onClick={() => handleRemoveFromDetails(item.id)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                    <span className="sr-only">Bu ürünü sil</span>
                                </Button>
                                <div className="relative h-full bg-muted rounded-md overflow-hidden group">
                                    <label htmlFor={`detail-image-upload-${item.id}`} className="cursor-pointer h-full block">
                                        <Image 
                                            src={item.photoUrl || 'https://placehold.co/400x300.png'} 
                                            alt={item.name} 
                                            layout="fill" 
                                            objectFit="contain"
                                            data-ai-hint="product photo"
                                            unoptimized
                                        />
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity print-hide">
                                            <Pencil className="h-8 w-8 text-white" />
                                        </div>
                                    </label>
                                    <input 
                                        id={`detail-image-upload-${item.id}`}
                                        type="file" 
                                        className="hidden" 
                                        accept="image/png, image/jpeg, image/webp" 
                                        onChange={(e) => handleItemImageChange(e, item.id)}
                                    />
                                    <div 
                                        className="absolute bottom-0 left-0 right-0 h-4 cursor-ns-resize z-10 flex items-center justify-center group-hover:opacity-100 opacity-0 transition-opacity print-hide"
                                        onMouseDown={(e) => handleResizeStart(e, item)}
                                    >
                                        <div className="w-10 h-1.5 bg-white/70 rounded-full backdrop-blur-sm"></div>
                                    </div>
                                </div>
                                <div className="flex flex-col h-full">
                                    <h3 className="text-xl font-semibold mb-2">{item.name}</h3>
                                    <Textarea
                                        value={item.description}
                                        onChange={(e) => handleItemDetailChange(item.id, 'description', e.target.value)}
                                        placeholder="Ürün açıklaması..."
                                        className="text-muted-foreground flex-grow mb-4 whitespace-pre-wrap min-h-[60px] resize-y"
                                    />
                                    <div className="text-right mt-auto">
                                        <p className="text-lg font-bold">{formatCurrency(item.unitPrice)} ₺</p>
                                        <p className="text-xs text-muted-foreground">(Birim Fiyat)</p>
                                    </div>
                                </div>
                            </Card>
                            ))
                        ) : (
                            <div className="text-center text-muted-foreground py-10 print-hide">
                                Detayları düzenlemek için teklife ürün eklemelisiniz.
                            </div>
                        )}
                    </div>
                </ScrollArea>
                <DialogFooter className="print-hide">
                    <Button onClick={handleSaveDetails}>Kaydet</Button>
                    <Button variant="outline" onClick={() => window.print()}>Yazdır</Button>
                    <Button variant="destructive" onClick={() => setItemsForDetails([])}>Tümünü Sil</Button>
                    <Button variant="outline" onClick={() => setDetailsModalOpen(false)}>Kapat</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
        
    </>
  )
}
