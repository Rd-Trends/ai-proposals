"use client";

import { MessageSquareQuote, Star, TrendingUp, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Testimonial } from "@/db";

interface TestimonialStatsProps {
  testimonials: Testimonial[];
}

export function TestimonialStats({ testimonials }: TestimonialStatsProps) {
  const totalTestimonials = testimonials.length;
  const withProjectTitle = testimonials.filter((t) => t.projectTitle).length;
  const withClientTitle = testimonials.filter((t) => t.clientTitle).length;
  const averageLength =
    totalTestimonials > 0
      ? Math.round(
          testimonials.reduce((sum, t) => sum + t.content.length, 0) /
            totalTestimonials,
        )
      : 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Testimonials
          </CardTitle>
          <MessageSquareQuote className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalTestimonials}</div>
          <p className="text-xs text-muted-foreground">
            From satisfied clients
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Linked to Projects
          </CardTitle>
          <Star className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{withProjectTitle}</div>
          <p className="text-xs text-muted-foreground">
            {totalTestimonials > 0
              ? `${Math.round((withProjectTitle / totalTestimonials) * 100)}%`
              : "0%"}{" "}
            of total
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">With Details</CardTitle>
          <User className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{withClientTitle}</div>
          <p className="text-xs text-muted-foreground">Include client titles</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg. Length</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{averageLength}</div>
          <p className="text-xs text-muted-foreground">
            Characters per testimonial
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
