"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Copy, Check, Crown, Users, LogOut } from "lucide-react";
import type { User } from "@/lib/types";

interface RoomInfoProps {
  code: string;
  users: User[];
  ownerName: string;
  ownerId: string;
  currentUserId: string;
  onLeave: () => void;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getAvatarColor(name: string): string {
  const colors = [
    "bg-primary/20 text-primary",
    "bg-chart-2/20 text-chart-2",
    "bg-chart-3/20 text-chart-3",
    "bg-chart-4/20 text-chart-4",
    "bg-chart-5/20 text-chart-5",
  ];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
}

export function RoomInfo({
  code,
  users,
  ownerName,
  ownerId,
  currentUserId,
  onLeave,
}: RoomInfoProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyCode = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="border-border/50 bg-card/50">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Users className="h-5 w-5 text-primary" />
          Room Info
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Room Code */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              Room Code
            </p>
            <p className="font-mono text-xl font-bold tracking-widest">{code}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCopyCode}
            className="shrink-0"
          >
            {copied ? (
              <Check className="h-4 w-4 text-success" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>

        <Separator />

        {/* Owner */}
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
            Room Owner
          </p>
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className={getAvatarColor(ownerName)}>
                {getInitials(ownerName)}
              </AvatarFallback>
            </Avatar>
            <span className="font-medium">{ownerName}</span>
            <Crown className="h-4 w-4 text-warning" />
          </div>
        </div>

        <Separator />

        {/* Users */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              Participants
            </p>
            <Badge variant="secondary" className="font-mono">
              {users.length}
            </Badge>
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {users.map((user) => (
              <div
                key={user.user_id}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors"
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback className={getAvatarColor(user.name)}>
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <span className="flex-1 truncate">
                  {user.name}
                  {user.user_id === currentUserId && (
                    <span className="text-muted-foreground text-sm ml-1">(you)</span>
                  )}
                </span>
                {user.user_id === ownerId && (
                  <Crown className="h-4 w-4 text-warning shrink-0" />
                )}
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Leave Room */}
        <Button
          variant="outline"
          className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={onLeave}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Leave Room
        </Button>
      </CardContent>
    </Card>
  );
}
