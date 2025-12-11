import { FileText } from 'lucide-react';
import Link from 'next/link';

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2" aria-label="One Quata anasayfa">
      <FileText className="h-6 w-6 text-primary" />
      <span className="text-xl font-bold tracking-tighter">
        <span className="text-foreground">One</span>
        <span className="text-destructive">Quata</span>
      </span>
    </Link>
  );
}
