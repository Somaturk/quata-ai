import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';

export default function MeetingsPage() {
  return (
    <div className="flex justify-center items-start pt-20">
      <Card className="w-full max-w-md text-center shadow-lg">
        <CardHeader className="items-center">
          <div className="mx-auto bg-destructive rounded-full p-4 w-fit mb-4">
            <Users className="h-12 w-12 text-destructive-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold">Görüşmeler</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Müşteri görüşmelerinizi ve notlarınızı yakında buradan yönetebileceksiniz.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
