"use client";

import React, { useState } from "react";
import {
  History,
  Search,
  Filter,
  ArrowUpDown,
  Calendar,
  Terminal
} from "lucide-react";

import { useHealthcare } from "@/store/healthcare-context";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function AuditLogsPage() {
  const { auditLogs } = useHealthcare();
  const [searchQuery, setSearchQuery] = useState("");
  const [moduleFilter, setModuleFilter] = useState("all");

  const modules = ["all", ...Array.from(new Set(auditLogs.map((log) => log.module)))];

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesModule = moduleFilter === "all" || log.module === moduleFilter;

    return matchesSearch && matchesModule;
  });

  return (
    <div className="flex flex-col gap-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Audit Logs</h1>
          <p className="text-sm text-muted-foreground mt-1">Central log tracking changes, staff check-ins, and inventory dispensations.</p>
        </div>
      </div>

      {/* Toolbar Filter */}
      <Card className="rounded-2xl border-border bg-card p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-xs font-semibold text-muted-foreground">
            <Filter className="h-4.5 w-4.5" />
            <span>Module Filter:</span>
            <div className="flex gap-1.5 flex-wrap">
              {modules.map((m) => (
                <button
                  key={m}
                  onClick={() => setModuleFilter(m)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all capitalize cursor-pointer ${
                    moduleFilter === m
                      ? "bg-primary border-primary text-white"
                      : "bg-card border-border hover:bg-muted text-foreground"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search user, action, detail..."
              className="w-full bg-muted/40 rounded-xl pl-10 pr-4 py-2 text-sm border border-transparent focus:border-primary focus:bg-card focus:outline-hidden"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </Card>

      {/* Logs Table */}
      <Card className="rounded-2xl border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User / Admin</TableHead>
                <TableHead>Action Category</TableHead>
                <TableHead>Module</TableHead>
                <TableHead>Timestamp</TableHead>
                <TableHead>Details Summary</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-sm text-muted-foreground">
                    <div className="flex flex-col items-center gap-2">
                      <Terminal className="h-10 w-10 text-muted-foreground/45 animate-pulse" />
                      <span>No activity records matched active criteria.</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-bold text-xs">{log.user}</TableCell>
                    <TableCell className="font-semibold text-xs text-foreground/95">{log.action}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize text-[10px] rounded-lg">
                        {log.module}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground font-mono">
                      {new Date(log.date).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-sm truncate" title={log.details}>
                      {log.details}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

    </div>
  );
}
