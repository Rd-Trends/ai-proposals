"use client";

import { formatDate } from "date-fns";
import {
  Calendar,
  Clock,
  Eye,
  FileText,
  Star,
  Tag,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { Template } from "@/lib/db/schema/templates";

type ViewTemplateSheetProps = {
  template: Template;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "active":
      return "default";
    case "draft":
      return "secondary";
    case "archived":
      return "outline";
    default:
      return "secondary";
  }
};

const getToneColor = (tone: string) => {
  switch (tone) {
    case "professional":
      return "default";
    case "friendly":
      return "secondary";
    case "confident":
      return "destructive";
    case "enthusiastic":
      return "default";
    case "formal":
      return "outline";
    case "casual":
      return "secondary";
    default:
      return "secondary";
  }
};

export function ViewTemplateSheet({
  template,
  open,
  onOpenChange,
}: ViewTemplateSheetProps) {
  const [isOpen, setIsOpen] = useState(open);

  const handleOpenChange = (newOpen: boolean) => {
    setIsOpen(newOpen);
    onOpenChange?.(newOpen);
  };

  return (
    <Sheet
      onOpenChange={handleOpenChange}
      open={open !== undefined ? open : isOpen}
    >
      <SheetContent className="w-full sm:max-w-2xl">
        <ScrollArea className="h-full pr-4">
          <SheetHeader className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <SheetTitle className="text-xl">{template.title}</SheetTitle>
                <SheetDescription className="text-base">
                  {template.description || "No description provided"}
                </SheetDescription>
              </div>
              {template.isFavorite && (
                <Star className="h-5 w-5 fill-current text-yellow-500" />
              )}
            </div>

            {/* Status and Meta Info */}
            <div className="flex flex-wrap gap-2">
              <Badge
                className="capitalize"
                variant={getStatusColor(template.status)}
              >
                {template.status}
              </Badge>
              <Badge
                className="capitalize"
                variant={getToneColor(template.tone)}
              >
                {template.tone}
              </Badge>
              {template.category && (
                <Badge variant="outline">
                  <Tag className="mr-1 h-3 w-3" />
                  {template.category}
                </Badge>
              )}
              {template.isPublic && (
                <Badge variant="outline">
                  <Eye className="mr-1 h-3 w-3" />
                  Public
                </Badge>
              )}
            </div>
          </SheetHeader>

          <Separator className="my-6" />

          {/* Statistics Cards */}
          <div className="mb-6 grid grid-cols-2 gap-4 px-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-sm">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Usage Count
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="font-bold text-2xl">{template.usageCount}</div>
              </CardContent>
            </Card>

            {/* <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center">
                  <Hash className="mr-2 h-4 w-4" />
                  Success Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {template.successRate !== null
                    ? `${template.successRate}%`
                    : "N/A"}
                </div>
              </CardContent>
            </Card> */}
          </div>

          {/* Tags */}
          {template.tags && template.tags.length > 0 && (
            <div className="mb-6">
              <h3 className="mb-2 font-medium text-sm">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {template.tags.map((tag) => (
                  <Badge className="text-xs" key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Template Content */}
          <div className="mb-6 px-4">
            <h3 className="mb-3 flex items-center font-medium text-sm">
              <FileText className="mr-2 h-4 w-4" />
              Template Content
            </h3>
            <Card>
              <CardContent className="p-4">
                <pre className="overflow-x-auto whitespace-pre-wrap rounded border bg-muted p-3 font-mono text-sm">
                  {template.content}
                </pre>
              </CardContent>
            </Card>
          </div>

          {/* Examples */}
          {template.examples && (
            <div className="mb-6">
              <h3 className="mb-3 font-medium text-sm">Examples & Tips</h3>
              <Card>
                <CardContent className="space-y-4 p-4">
                  {template.examples.jobDescription && (
                    <div>
                      <h4 className="mb-2 font-medium text-sm">
                        Sample Job Description
                      </h4>
                      <p className="rounded bg-muted p-3 text-muted-foreground text-sm">
                        {template.examples.jobDescription}
                      </p>
                    </div>
                  )}
                  {template.examples.sampleProposal && (
                    <div>
                      <h4 className="mb-2 font-medium text-sm">
                        Sample Proposal
                      </h4>
                      <p className="rounded bg-muted p-3 text-muted-foreground text-sm">
                        {template.examples.sampleProposal}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Timestamps */}
          <div className="px-4 py-6">
            <h3 className="mb-3 font-medium text-sm">Timeline</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center text-muted-foreground">
                <Calendar className="mr-2 h-4 w-4" />
                Created: {formatDate(template.createdAt, "PPP")}
              </div>
              <div className="flex items-center text-muted-foreground">
                <Clock className="mr-2 h-4 w-4" />
                Last Updated: {formatDate(template.updatedAt, "PPP")}
              </div>
              {template.lastUsedAt && (
                <div className="flex items-center text-muted-foreground">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Last Used: {formatDate(template.lastUsedAt, "PPP")}
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
