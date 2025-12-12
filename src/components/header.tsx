
"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { ChevronDown, Menu, Database } from 'lucide-react';
import { useBackup } from '@/hooks/use-backup';
import { useDataOperations } from '@/hooks/use-data-operations';

import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { ThemeToggle } from './theme-toggle';



export function Header() {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  const pathname = usePathname();
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isRestoreConfirmOpen, setRestoreConfirmOpen] = useState(false);
  const [isDeleteAllConfirmOpen, setDeleteAllConfirmOpen] = useState(false);
  const [isLoadSampleConfirmOpen, setLoadSampleConfirmOpen] = useState(false);

  const { backupData, restoreData } = useBackup();
  const { deleteAllData, loadSampleData } = useDataOperations();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const tekliflerItems = [
    { href: '/teklif-olustur', label: 'Yeni Teklif Oluştur' },
    { href: '/eski-teklifler', label: 'Verilen Teklifler' },
    { href: '/siparisler', label: 'Siparişler' },
  ];

  const urunlerItems = [
    { href: '/urunler', label: 'Ürünler' },
    { href: '/urun-yukle', label: 'AI ile Ürün Yükle' },
  ];

  const crmItems = [
    { href: '/firmalar', label: 'Firmalar (Müşteri/Tedarikçi)' },
    { href: '/gorusmeler', label: 'Görüşmeler' },
  ];

  const isTekliflerActive = isClient && tekliflerItems.some(item => pathname === item.href);
  const isUrunlerActive = isClient && urunlerItems.some(item => pathname === item.href);
  const isCrmActive = isClient && crmItems.some(item => pathname === item.href);

  const handleRestoreClick = () => {
    setRestoreConfirmOpen(true);
  };

  const handleConfirmRestore = () => {
    setRestoreConfirmOpen(false);
    fileInputRef.current?.click();
  };

  const handleDeleteAllClick = () => {
    setDeleteAllConfirmOpen(true);
  };

  const handleLoadSampleClick = () => {
    setLoadSampleConfirmOpen(true);
  };

  const handleConfirmDeleteAll = () => {
    setDeleteAllConfirmOpen(false);
    deleteAllData();
  };

  const handleConfirmLoadSample = () => {
    setLoadSampleConfirmOpen(false);
    loadSampleData();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    restoreData(event);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur-sm print:hidden">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Logo />

        {isClient && (
          <>
            <nav className="hidden items-center space-x-6 text-sm font-medium md:flex">
              <Link
                href="/"
                className={cn(
                  'transition-colors hover:text-primary',
                  pathname === '/'
                    ? 'text-primary'
                    : 'text-muted-foreground'
                )}
              >
                Ana Sayfa
              </Link>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className={cn(
                      'flex items-center gap-1 p-0 h-auto text-sm font-medium transition-colors hover:text-primary focus-visible:ring-0 focus-visible:ring-offset-0 [&[data-state=open]>svg]:rotate-180',
                      isTekliflerActive ? 'text-primary' : 'text-muted-foreground'
                    )}
                  >
                    Teklifler
                    <ChevronDown className="h-4 w-4 transition-transform duration-200" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {tekliflerItems.map((item) => (
                    <DropdownMenuItem key={item.href} asChild>
                      <Link href={item.href}>{item.label}</Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className={cn(
                      'flex items-center gap-1 p-0 h-auto text-sm font-medium transition-colors hover:text-primary focus-visible:ring-0 focus-visible:ring-offset-0 [&[data-state=open]>svg]:rotate-180',
                      isUrunlerActive ? 'text-primary' : 'text-muted-foreground'
                    )}
                  >
                    Ürünler
                    <ChevronDown className="h-4 w-4 transition-transform duration-200" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {urunlerItems.map((item) => (
                    <DropdownMenuItem key={item.href} asChild>
                      <Link href={item.href}>{item.label}</Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className={cn(
                      'flex items-center gap-1 p-0 h-auto text-sm font-medium transition-colors hover:text-primary focus-visible:ring-0 focus-visible:ring-offset-0 [&[data-state=open]>svg]:rotate-180',
                      isCrmActive ? 'text-primary' : 'text-muted-foreground'
                    )}
                  >
                    CRM
                    <ChevronDown className="h-4 w-4 transition-transform duration-200" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {crmItems.map((item) => (
                    <DropdownMenuItem key={item.href} asChild>
                      <Link href={item.href}>{item.label}</Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center gap-1 p-0 h-auto text-sm font-medium transition-colors text-muted-foreground hover:text-primary focus-visible:ring-0 focus-visible:ring-offset-0 [&[data-state=open]>svg]:rotate-180"
                  >
                    Araçlar
                    <ChevronDown className="h-4 w-4 transition-transform duration-200" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleLoadSampleClick}>
                    Örnek Veri Yükle
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={backupData}>
                    Yedek Al
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleRestoreClick}>
                    Geri Yükle
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleDeleteAllClick} className="text-destructive focus:text-destructive">
                    Tüm Verileri Sil
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

            </nav>

            <div className="flex items-center gap-2">
              <ThemeToggle />

              <div className="md:hidden">
                <Sheet open={isMobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Menu className="h-6 w-6" />
                      <span className="sr-only">Menüyü aç</span>
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right">
                    <div className="flex flex-col space-y-6 pt-6 overflow-y-auto max-h-screen pb-20">
                      <div className="px-4">
                        <Logo />
                      </div>
                      <nav className="flex flex-col space-y-1 px-2">
                        <Link href="/" onClick={() => setMobileMenuOpen(false)} className={cn('block rounded-md px-3 py-2 text-base font-medium transition-colors hover:bg-accent hover:text-accent-foreground', pathname === '/' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground')}>Ana Sayfa</Link>

                        <p className="px-3 py-2 text-sm font-semibold text-muted-foreground mt-2">Teklifler</p>
                        {tekliflerItems.map((item) => (
                          <Link key={item.href} href={item.href} onClick={() => setMobileMenuOpen(false)} className={cn('block rounded-md px-3 py-2 text-base font-medium transition-colors hover:bg-accent hover:text-accent-foreground', pathname === item.href ? 'bg-accent text-accent-foreground' : 'text-muted-foreground')}>
                            {item.label}
                          </Link>
                        ))}

                        <p className="px-3 py-2 text-sm font-semibold text-muted-foreground mt-2">Ürünler</p>
                        {urunlerItems.map((item) => (
                          <Link key={item.href} href={item.href} onClick={() => setMobileMenuOpen(false)} className={cn('block rounded-md px-3 py-2 text-base font-medium transition-colors hover:bg-accent hover:text-accent-foreground', pathname === item.href ? 'bg-accent text-accent-foreground' : 'text-muted-foreground')}>
                            {item.label}
                          </Link>
                        ))}

                        <p className="px-3 py-2 text-sm font-semibold text-muted-foreground mt-2">CRM</p>
                        {crmItems.map((item) => (
                          <Link key={item.href} href={item.href} onClick={() => setMobileMenuOpen(false)} className={cn('block rounded-md px-3 py-2 text-base font-medium transition-colors hover:bg-accent hover:text-accent-foreground', pathname === item.href ? 'bg-accent text-accent-foreground' : 'text-muted-foreground')}>
                            {item.label}
                          </Link>
                        ))}

                        <DropdownMenuSeparator className="my-2" />
                        <p className="px-3 py-2 text-sm font-semibold text-muted-foreground">Araçlar</p>
                        <Button variant="ghost" className="justify-start px-3 h-auto py-2" onClick={() => { handleLoadSampleClick(); setMobileMenuOpen(false); }}>Örnek Veri Yükle</Button>
                        <Button variant="ghost" className="justify-start px-3 h-auto py-2" onClick={() => { backupData(); setMobileMenuOpen(false); }}>Yedek Al</Button>
                        <Button variant="ghost" className="justify-start px-3 h-auto py-2" onClick={() => { handleRestoreClick(); setMobileMenuOpen(false); }}>Geri Yükle</Button>
                        <Button variant="ghost" className="justify-start px-3 h-auto py-2 text-destructive hover:text-destructive" onClick={() => { handleDeleteAllClick(); setMobileMenuOpen(false); }}>Tüm Verileri Sil</Button>
                      </nav>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>

          </>
        )}

      </div>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept=".json"
        onChange={handleFileChange}
      />

      <AlertDialog open={isRestoreConfirmOpen} onOpenChange={setRestoreConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Geri Yüklemeyi Onaylıyor musunuz?</AlertDialogTitle>
            <AlertDialogDescription>
              Bu işlem, mevcut tüm verilerinizi (teklifler, ürünler, firmalar vb.) seçilecek yedek dosyasındaki verilerle kalıcı olarak değiştirecektir. Bu işlem geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmRestore}>Evet, Devam Et</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isDeleteAllConfirmOpen} onOpenChange={setDeleteAllConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tüm Verileri Silmek İstediğinize Emin misiniz?</AlertDialogTitle>
            <AlertDialogDescription>
              Bu işlem, programdaki tüm verileri (ürünler, firmalar, teklifler) kalıcı olarak silecektir. Bu işlem geri alınamaz!
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDeleteAll} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Evet, Hepsini Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isLoadSampleConfirmOpen} onOpenChange={setLoadSampleConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Örnek Veri Yüklemek İstediğinize Emin misiniz?</AlertDialogTitle>
            <AlertDialogDescription>
              Bu işlem, veritabanına örnek ürünler, firmalar ve bir teklif ekleyecektir. Mevcut verileriniz silinmez.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmLoadSample}>Evet, Yükle</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </header>
  );
}
