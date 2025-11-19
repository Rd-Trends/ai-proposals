import { MessageSquareQuote } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type TestimonialStatsProps = {
  total: number;
};

export function TestimonialStats({ total }: TestimonialStatsProps) {
  return (
    <Card className="w-full md:max-w-[260px]">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="font-medium text-sm">
          Total Testimonials
        </CardTitle>
        <MessageSquareQuote className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="font-bold text-2xl">{total}</div>
        <p className="text-muted-foreground text-xs">From satisfied clients</p>
      </CardContent>
    </Card>
  );
}

export function TestimonialStatsLoader() {
  return (
    <Card className="w-full md:max-w-[260px]">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="font-medium text-sm">
          Total Testimonials
        </CardTitle>
        <MessageSquareQuote className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-16" />
        <Skeleton className="mt-1 h-4 w-32" />
      </CardContent>
    </Card>
  );
}
