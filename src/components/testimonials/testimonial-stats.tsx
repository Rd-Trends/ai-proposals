import { MessageSquareQuote } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface TestimonialStatsProps {
  total: number;
}

export function TestimonialStats({ total }: TestimonialStatsProps) {
  return (
    <Card className="w-full md:max-w-[260px]">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          Total Testimonials
        </CardTitle>
        <MessageSquareQuote className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{total}</div>
        <p className="text-xs text-muted-foreground">From satisfied clients</p>
      </CardContent>
    </Card>
  );
}

export function TestimonialStatsLoader() {
  return (
    <Card className="w-full md:max-w-[260px]">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          Total Testimonials
        </CardTitle>
        <MessageSquareQuote className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-4 w-32 mt-1" />
      </CardContent>
    </Card>
  );
}
