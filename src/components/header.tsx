
"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { ChevronDown, Menu, Database } from 'lucide-react';
import { useBackup } from '@/hooks/use-backup';

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

const recordsNavItems = [
  { href: '/firmalar', label: 'Firmalar' },
  { href: '/siparisler', label: 'Siparişler' },
  { href: '/gorusmeler', label: 'Görüşmeler' },
];

export function Header() {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  const pathname = usePathname();
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isRestoreConfirmOpen, setRestoreConfirmOpen] = useState(false);

  const { backupData, restoreData } = useBackup();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const isRecordsActive = isClient && recordsNavItems.some((item) => pathname === item.href);
  
  const handleRestoreClick = () => {
    setRestoreConfirmOpen(true);
  };

  const handleConfirmRestore = () => {
    setRestoreConfirmOpen(false);
    fileInputRef.current?.click();
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
               <Link
                href="/teklif-olustur"
                className={cn(
                  'transition-colors hover:text-primary',
                  pathname === '/teklif-olustur'
                    ? 'text-primary'
                    : 'text-muted-foreground'
                )}
              >
                Yeni Teklif Oluştur
              </Link>
              <Link
                href="/urun-yukle"
                className={cn(
                  'transition-colors hover:text-primary',
                  pathname === '/urun-yukle'
                    ? 'text-primary'
                    : 'text-muted-foreground'
                )}
              >
                AI ile Ürün Yükle
              </Link>
              <Link
                href="/urunler"
                className={cn(
                  'transition-colors hover:text-primary',
                  pathname === '/urunler'
                    ? 'text-primary'
                    : 'text-muted-foreground'
                )}
              >
                Ürünler
              </Link>
              <Link
                href="/eski-teklifler"
                className={cn(
                  'transition-colors hover:text-primary',
                  pathname === '/eski-teklifler'
                    ? 'text-primary'
                    : 'text-muted-foreground'
                )}
              >
                Verilen Teklifler
              </Link>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className={cn(
                      'flex items-center gap-1 p-0 h-auto text-sm font-medium transition-colors hover:text-primary focus-visible:ring-0 focus-visible:ring-offset-0 [&[data-state=open]>svg]:rotate-180',
                      isRecordsActive ? 'text-primary' : 'text-muted-foreground'
                    )}
                  >
                    Kayıtlar
                    <ChevronDown className="h-4 w-4 transition-transform duration-200" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {recordsNavItems.map((item) => (
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
                    İşlemler
                    <ChevronDown className="h-4 w-4 transition-transform duration-200" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={backupData}>
                    Yedek Al
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleRestoreClick}>
                    Geri Yükle
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
                      <div className="flex flex-col space-y-6 pt-6">
                        <div className="px-4">
                          <Logo />
                        </div>
                        <nav className="flex flex-col space-y-1 px-2">
                           <Link href="/" onClick={() => setMobileMenuOpen(false)} className={cn('block rounded-md px-3 py-2 text-base font-medium transition-colors hover:bg-accent hover:text-accent-foreground', pathname === '/' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground')}>Ana Sayfa</Link>
                          <Link href="/teklif-olustur" onClick={() => setMobileMenuOpen(false)} className={cn('block rounded-md px-3 py-2 text-base font-medium transition-colors hover:bg-accent hover:text-accent-foreground', pathname === '/teklif-olustur' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground')}>Yeni Teklif Oluştur</Link>
                          <Link href="/urun-yukle" onClick={() => setMobileMenuOpen(false)} className={cn('block rounded-md px-3 py-2 text-base font-medium transition-colors hover:bg-accent hover:text-accent-foreground', pathname === '/urun-yukle' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground')}>AI ile Ürün Yükle</Link>
                          <Link href="/urunler" onClick={() => setMobileMenuOpen(false)} className={cn('block rounded-md px-3 py-2 text-base font-medium transition-colors hover:bg-accent hover:text-accent-foreground', pathname === '/urunler' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground')}>Ürünler</Link>
                          <Link href="/eski-teklifler" onClick={() => setMobileMenuOpen(false)} className={cn('block rounded-md px-3 py-2 text-base font-medium transition-colors hover:bg-accent hover:text-accent-foreground', pathname === '/eski-teklifler' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground')}>Verilen Teklifler</Link>
                          
                           <p className="px-3 py-2 text-sm font-semibold text-muted-foreground">Kayıtlar</p>
                          {recordsNavItems.map((item) => (
                            <Link
                              key={item.href}
                              href={item.href}
                              onClick={() => setMobileMenuOpen(false)}
                              className={cn(
                                'block rounded-md px-3 py-2 text-base font-medium transition-colors hover:bg-accent hover:text-accent-foreground',
                                pathname === item.href
                                  ? 'bg-accent text-accent-foreground'
                                  : 'text-muted-foreground'
                              )}
                            >
                              {item.label}
                            </Link>
                          ))}
                          <DropdownMenuSeparator className="my-2" />
                          <p className="px-3 py-2 text-sm font-semibold text-muted-foreground">İşlemler</p>
                          <Button variant="ghost" className="justify-start px-3" onClick={() => {backupData(); setMobileMenuOpen(false);}}>Yedek Al</Button>
                          <Button variant="ghost" className="justify-start px-3" onClick={() => {handleRestoreClick(); setMobileMenuOpen(false);}}>Geri Yükle</Button>
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

    </header>
  );
}
