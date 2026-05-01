"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, Users, Zap } from "lucide-react";
import { createSession, joinSession } from "@/lib/api";

interface LandingPageProps {
  onRoomJoined: (code: string, userId: string, userName: string, isOwner: boolean) => void;
}

export function LandingPage({ onRoomJoined }: LandingPageProps) {
  const [name, setName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCreateRoom = async () => {
    if (!name.trim()) {
      setError("Please enter your name");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const { code, user_id } = await createSession(name.trim());
      onRoomJoined(code, user_id, name.trim(), true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create room");
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!name.trim()) {
      setError("Please enter your name");
      return;
    }
    if (!roomCode.trim()) {
      setError("Please enter a room code");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const { code, user_id } = await joinSession(roomCode.trim().toUpperCase(), name.trim());
      onRoomJoined(code, user_id, name.trim(), false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to join room");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            Okudera
          </h1>
          <p className="text-muted-foreground text-lg text-balance">
            Collaborative timer rooms for focused work sessions
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-3 gap-4 py-6">
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="p-3 rounded-lg bg-primary/10">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <span className="text-sm text-muted-foreground">Shared Timer</span>
          </div>
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="p-3 rounded-lg bg-primary/10">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <span className="text-sm text-muted-foreground">Real-time Sync</span>
          </div>
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="p-3 rounded-lg bg-primary/10">
              <Zap className="h-5 w-5 text-primary" />
            </div>
            <span className="text-sm text-muted-foreground">Live Chat</span>
          </div>
        </div>

        {/* Form Card */}
        <Card className="border-border/50 bg-card/50 backdrop-blur">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl">Get Started</CardTitle>
            <CardDescription>
              Create a new room or join an existing one
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Name Input */}
            <div className="space-y-2">
              <Label htmlFor="name">Your Name</Label>
              <Input
                id="name"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-input/50"
              />
            </div>

            {/* Tabs for Create/Join */}
            <Tabs defaultValue="create" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="create">Create Room</TabsTrigger>
                <TabsTrigger value="join">Join Room</TabsTrigger>
              </TabsList>
              
              <TabsContent value="create" className="mt-4 space-y-4">
                <p className="text-sm text-muted-foreground text-center">
                  Create a new room and share the code with others
                </p>
                <Button
                  onClick={handleCreateRoom}
                  disabled={isLoading}
                  className="w-full"
                  size="lg"
                >
                  {isLoading ? "Creating..." : "Create Room"}
                </Button>
              </TabsContent>
              
              <TabsContent value="join" className="mt-4 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Room Code</Label>
                  <Input
                    id="code"
                    placeholder="Enter 6-character code"
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                    maxLength={6}
                    className="bg-input/50 font-mono text-center text-lg tracking-widest"
                  />
                </div>
                <Button
                  onClick={handleJoinRoom}
                  disabled={isLoading}
                  className="w-full"
                  size="lg"
                >
                  {isLoading ? "Joining..." : "Join Room"}
                </Button>
              </TabsContent>
            </Tabs>

            {/* Error Message */}
            {error && (
              <p className="text-sm text-destructive text-center">{error}</p>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
