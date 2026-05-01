"use client";

import { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  MessageSquare,
  UserPlus,
  UserMinus,
  Clock,
  Play,
  Pause,
  RotateCcw,
  Bell,
  Send,
} from "lucide-react";
import type { TimelineEvent, Message } from "@/lib/types";

interface TimelineProps {
  events: TimelineEvent[];
  messages: Message[];
  currentUserId: string;
  userName: string;
  onSendMessage: (text: string) => void;
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

function formatTimestamp(date: Date): string {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function getEventIcon(type: TimelineEvent["type"]) {
  switch (type) {
    case "user_joined":
      return <UserPlus className="h-4 w-4 text-success" />;
    case "user_left":
      return <UserMinus className="h-4 w-4 text-destructive" />;
    case "chat_message":
      return <MessageSquare className="h-4 w-4 text-primary" />;
    case "timer_set":
      return <Clock className="h-4 w-4 text-primary" />;
    case "timer_state":
      return <Pause className="h-4 w-4 text-warning" />;
    case "timer_done":
      return <Bell className="h-4 w-4 text-destructive" />;
    default:
      return <Play className="h-4 w-4 text-muted-foreground" />;
  }
}

function getEventBadge(type: TimelineEvent["type"]) {
  switch (type) {
    case "user_joined":
      return (
        <Badge variant="outline" className="text-success border-success/30 bg-success/10">
          Joined
        </Badge>
      );
    case "user_left":
      return (
        <Badge variant="outline" className="text-destructive border-destructive/30 bg-destructive/10">
          Left
        </Badge>
      );
    case "timer_set":
      return (
        <Badge variant="outline" className="text-primary border-primary/30 bg-primary/10">
          Timer Set
        </Badge>
      );
    case "timer_state":
      return (
        <Badge variant="outline" className="text-warning border-warning/30 bg-warning/10">
          Timer
        </Badge>
      );
    case "timer_done":
      return (
        <Badge variant="outline" className="text-destructive border-destructive/30 bg-destructive/10">
          Done
        </Badge>
      );
    default:
      return null;
  }
}

function EventItem({ event }: { event: TimelineEvent }) {
  const data = event.data as Record<string, string>;

  if (event.type === "chat_message") {
    return (
      <div className="flex gap-3 py-2">
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarFallback className={getAvatarColor(data.name || "U")}>
            {getInitials(data.name || "U")}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm">{data.name}</span>
            <span className="text-xs text-muted-foreground">
              {formatTimestamp(event.timestamp)}
            </span>
          </div>
          <p className="text-foreground text-sm break-words">{data.text}</p>
        </div>
      </div>
    );
  }

  let message = "";
  switch (event.type) {
    case "user_joined":
      message = `${data.name || "Someone"} joined the room`;
      break;
    case "user_left":
      message = "A user left the room";
      break;
    case "timer_set":
      message = `Timer set to ${Math.floor(Number(data.seconds) / 60)} minutes`;
      break;
    case "timer_state":
      message = `Timer ${data.state}`;
      break;
    case "timer_done":
      message = "Timer completed!";
      break;
    default:
      message = event.type;
  }

  return (
    <div className="flex items-center gap-3 py-2 text-sm">
      <div className="p-1.5 rounded-full bg-muted/50">{getEventIcon(event.type)}</div>
      <span className="flex-1 text-muted-foreground">{message}</span>
      {getEventBadge(event.type)}
      <span className="text-xs text-muted-foreground shrink-0">
        {formatTimestamp(event.timestamp)}
      </span>
    </div>
  );
}

export function Timeline({
  events,
  messages,
  currentUserId,
  userName,
  onSendMessage,
}: TimelineProps) {
  const [message, setMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new events arrive
  useEffect(() => {
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current.querySelector("[data-radix-scroll-area-viewport]");
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [events.length]);

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Card className="border-border/50 bg-card/50 flex flex-col h-full">
      <CardHeader className="pb-4 shrink-0">
        <CardTitle className="flex items-center gap-2 text-lg">
          <MessageSquare className="h-5 w-5 text-primary" />
          Activity
          <Badge variant="secondary" className="font-mono ml-auto">
            {events.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col min-h-0 pt-0">
        <ScrollArea className="flex-1 pr-4" ref={scrollRef}>
          <div className="space-y-1">
            {events.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No activity yet. Send a message to get started!
              </p>
            ) : (
              events.map((event) => <EventItem key={event.id} event={event} />)
            )}
          </div>
        </ScrollArea>

        {/* Message Input */}
        <div className="flex gap-2 pt-4 mt-auto border-t border-border/50">
          <Input
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            maxLength={500}
            className="flex-1 bg-input/50"
          />
          <Button onClick={handleSend} size="icon" disabled={!message.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
