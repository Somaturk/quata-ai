
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, ListOrdered, Package, ShoppingCart, Building2 } from 'lucide-react';

export default function HomePage() {
  const features = [
    {
      title: 'Yeni Teklif Oluştur',
      description: 'Müşterileriniz için hızlı ve kolay bir şekilde yeni fiyat teklifleri hazırlayın.',
      href: '/teklif-olustur',
      icon: <FileText className="h-8 w-8 text-primary" />,
    },
    {
      title: 'Verilen Teklifler',
      description: 'Daha önce oluşturduğunuz tüm teklifleri görüntüleyin, düzenleyin ve yönetin.',
      href: '/eski-teklifler',
      icon: <ListOrdered className="h-8 w-8 text-primary" />,
    },
    {
      title: 'Ürünler ve Hizmetler',
      description: 'Tekliflerinize eklemek için ürün ve hizmetlerinizi kaydedin ve düzenleyin.',
      href: '/urunler',
      icon: <Package className="h-8 w-8 text-primary" />,
    },
     {
      title: 'Firmalar',
      description: 'Müşteri ve tedarikçi firmalarınızı görüntüleyin ve yönetin.',
      href: '/firmalar',
      icon: <Building2 className="h-8 w-8 text-primary" />,
    },
    {
      title: 'Sipariş Yönetimi',
      description: 'Onaylanan teklifleri siparişe dönüştürün ve sipariş süreçlerinizi takip edin.',
      href: '/siparisler',
      icon: <ShoppingCart className="h-8 w-8 text-primary" />,
    },
  ];

  return (
    <div className="flex flex-col items-center justify-center pt-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          OneQuata Kontrol Paneli
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Teklif ve sipariş yönetiminizi tek bir yerden kolayca yapın.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 w-full max-w-7xl">
        {features.map((feature) => (
          <Link key={feature.href} href={feature.href} passHref>
            <Card className="flex flex-col h-full hover:shadow-lg hover:border-primary/50 transition-all duration-300 cursor-pointer">
              <CardHeader className="flex flex-row items-center gap-4 pb-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  {feature.icon}
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
