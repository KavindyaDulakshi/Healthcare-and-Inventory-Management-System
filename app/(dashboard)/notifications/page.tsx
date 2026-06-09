"use client";

import React, { useState } from "react";
import {
  Bell,
  CheckCircle,
  AlertTriangle,
  Search,
  Eye,
  Trash2,
  Check
} from "lucide-react";

import { useHealthcare } from "@/store/healthcare-context";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function NotificationsPage() {
  const {
    notifications,
    markNotificationRead,
    markAllNotificationsRead
  } = useHealthcare();

  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Filter list
  const filteredNotifications = notifications.filter((n) => {
    const matchesSearch =
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.message.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTab =
      activeTab === "all" ||
      (activeTab === "unread" && !n.read) ||
      (activeTab === "read" && n.read);

    return matchesSearch && matchesTab;
  });

  return (
    <div className="flex flex-col gap-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Notifications Center</h1>
          <p className="text-sm text-muted-foreground mt-1">Audit security alerts, expiry notices, and warehouse thresholds.</p>
        </div>
        {notifications.some((n) => !n.read) && (
          <Button
            variant="outline"
            className="rounded-xl gap-2 text-xs self-start"
            onClick={markAllNotificationsRead}
          >
            <Check className="h-4.5 w-4.5" />
            <span>Mark all read</span>
          </Button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <Card className="rounded-2xl border-border bg-card p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-muted/40">
              <TabsTrigger value="all">All Alerts</TabsTrigger>
              <TabsTrigger value="unread">Unread</TabsTrigger>
              <TabsTrigger value="read">Archived</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search alert description..."
              className="w-full bg-muted/40 rounded-lg pl-10 pr-4 py-1.5 text-xs border border-transparent focus:border-primary focus:bg-card focus:outline-hidden"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </Card>

      {/* Roster of Notification Cards */}
      <div className="flex flex-col gap-4">
        {filteredNotifications.length === 0 ? (
          <Card className="py-12 text-center text-xs text-muted-foreground">
            <Bell className="h-10 w-10 text-muted-foreground mx-auto mb-2 animate-pulse" />
            <span>No notifications match active filters.</span>
          </Card>
        ) : (
          filteredNotifications.map((n) => (
            <Card
              key={n.id}
              className={`p-5 transition-all flex items-start justify-between gap-4 ${
                n.read ? "opacity-75" : "border-primary bg-primary/5 shadow-xs"
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`p-2.5 rounded-xl shrink-0 ${
                  n.priority === "high"
                    ? "bg-danger/10 text-danger"
                    : n.priority === "medium"
                    ? "bg-warning/10 text-warning"
                    : "bg-primary/10 text-primary"
                }`}>
                  {n.priority === "high" ? <AlertTriangle className="h-5.5 w-5.5" /> : <Bell className="h-5.5 w-5.5" />}
                </div>
                
                <div className="flex flex-col text-left gap-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-sm text-foreground">{n.title}</h3>
                    <Badge variant={n.priority === "high" ? "danger" : n.priority === "medium" ? "warning" : "primary"}>
                      {n.priority}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-normal max-w-2xl">{n.message}</p>
                  <span className="text-[10px] text-muted-foreground mt-1.5 font-semibold">
                    Received on: {new Date(n.date).toLocaleString()}
                  </span>
                </div>
              </div>

              {!n.read && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-lg text-[10px] h-8 px-2.5 gap-1 shrink-0 hover:bg-primary/10 cursor-pointer text-primary font-bold"
                  onClick={() => markNotificationRead(n.id)}
                >
                  <Eye className="h-4 w-4" />
                  <span>Mark Read</span>
                </Button>
              )}
            </Card>
          ))
        )}
      </div>

    </div>
  );
}
