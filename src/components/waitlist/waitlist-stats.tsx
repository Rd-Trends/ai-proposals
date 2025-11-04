"use client";

import { Activity, CheckCircle2, Clock, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Waitlist } from "@/lib/db";

type WaitlistStatsProps = {
  entries: Waitlist[];
};

export function WaitlistStats({ entries }: WaitlistStatsProps) {
  const totalEntries = entries.length;
  const activeEntries = entries.filter((e) => e.isActive).length;
  const usedEntries = entries.filter((e) => e.usedAt !== null).length;
  const unusedEntries = entries.filter(
    (e) => e.isActive && e.usedAt === null,
  ).length;

  const stats = [
    {
      title: "Total Entries",
      value: totalEntries,
      icon: Users,
      description: "All waitlist entries",
    },
    {
      title: "Active",
      value: activeEntries,
      icon: Activity,
      description: "Active invitations",
    },
    {
      title: "Used",
      value: usedEntries,
      icon: CheckCircle2,
      description: "Signed up users",
    },
    {
      title: "Pending",
      value: unusedEntries,
      icon: Clock,
      description: "Awaiting signup",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
