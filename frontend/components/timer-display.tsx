"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Play, Pause, RotateCcw, Clock, Settings } from "lucide-react";
import type { TimerState } from "@/lib/types";

interface TimerDisplayProps {
  timer: TimerState;
  isOwner: boolean;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onSet: (seconds: number) => void;
}

function formatTime(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hrs > 0) {
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

function getStateColor(state: TimerState["state"]): string {
  switch (state) {
    case "running":
      return "bg-success text-success-foreground";
    case "paused":
      return "bg-warning text-warning-foreground";
    case "done":
      return "bg-destructive text-destructive-foreground";
    default:
      return "bg-muted text-muted-foreground";
  }
}

function getTimerStyles(state: TimerState["state"]): string {
  switch (state) {
    case "running":
      return "text-success";
    case "paused":
      return "text-warning";
    case "done":
      return "text-destructive animate-pulse";
    default:
      return "text-foreground";
  }
}

export function TimerDisplay({
  timer,
  isOwner,
  onStart,
  onPause,
  onReset,
  onSet,
}: TimerDisplayProps) {
  const [isSetDialogOpen, setIsSetDialogOpen] = useState(false);
  const [minutes, setMinutes] = useState("25");
  const [seconds, setSeconds] = useState("0");

  const handleSetTimer = () => {
    const totalSeconds = parseInt(minutes || "0") * 60 + parseInt(seconds || "0");
    if (totalSeconds > 0) {
      onSet(totalSeconds);
      setIsSetDialogOpen(false);
    }
  };

  const presetTimes = [
    { label: "5 min", seconds: 300 },
    { label: "15 min", seconds: 900 },
    { label: "25 min", seconds: 1500 },
    { label: "45 min", seconds: 2700 },
    { label: "1 hr", seconds: 3600 },
  ];

  return (
    <Card className="border-border/50 bg-card/50">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="h-5 w-5 text-primary" />
            Timer
          </CardTitle>
          <Badge className={getStateColor(timer.state)} variant="secondary">
            {timer.state.charAt(0).toUpperCase() + timer.state.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Timer Display */}
        <div className="flex items-center justify-center py-8">
          <span
            className={`text-6xl md:text-7xl font-mono font-bold tracking-tight ${getTimerStyles(timer.state)}`}
          >
            {formatTime(timer.remaining)}
          </span>
        </div>

        {/* Controls */}
        {isOwner ? (
          <div className="flex flex-wrap items-center justify-center gap-3">
            {timer.state === "running" ? (
              <Button onClick={onPause} variant="secondary" size="lg">
                <Pause className="h-5 w-5 mr-2" />
                Pause
              </Button>
            ) : (
              <Button
                onClick={onStart}
                size="lg"
                disabled={timer.remaining === 0 && timer.state !== "done"}
              >
                <Play className="h-5 w-5 mr-2" />
                {timer.state === "paused" ? "Resume" : "Start"}
              </Button>
            )}

            <Button
              onClick={onReset}
              variant="outline"
              size="lg"
              disabled={timer.state === "idle"}
            >
              <RotateCcw className="h-5 w-5 mr-2" />
              Reset
            </Button>

            <Dialog open={isSetDialogOpen} onOpenChange={setIsSetDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="lg">
                  <Settings className="h-5 w-5 mr-2" />
                  Set
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Set Timer</DialogTitle>
                  <DialogDescription>
                    Choose a preset or enter a custom duration
                  </DialogDescription>
                </DialogHeader>

                {/* Presets */}
                <div className="flex flex-wrap gap-2 py-4">
                  {presetTimes.map((preset) => (
                    <Button
                      key={preset.seconds}
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        onSet(preset.seconds);
                        setIsSetDialogOpen(false);
                      }}
                    >
                      {preset.label}
                    </Button>
                  ))}
                </div>

                {/* Custom Time */}
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <Input
                      type="number"
                      min="0"
                      max="999"
                      placeholder="Minutes"
                      value={minutes}
                      onChange={(e) => setMinutes(e.target.value)}
                      className="text-center"
                    />
                  </div>
                  <span className="text-muted-foreground">:</span>
                  <div className="flex-1">
                    <Input
                      type="number"
                      min="0"
                      max="59"
                      placeholder="Seconds"
                      value={seconds}
                      onChange={(e) => setSeconds(e.target.value)}
                      className="text-center"
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button onClick={handleSetTimer} className="w-full">
                    Set Timer
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        ) : (
          <p className="text-center text-sm text-muted-foreground">
            Only the room owner can control the timer
          </p>
        )}
      </CardContent>
    </Card>
  );
}
