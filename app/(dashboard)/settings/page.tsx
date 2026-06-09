"use client";

import React, { useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  User,
  Settings,
  Shield,
  Bell,
  Palette,
  Check,
  Building,
  KeyRound,
  Eye,
  Lock,
  Globe
} from "lucide-react";

import { useHealthcare } from "@/store/healthcare-context";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function SettingsPage() {
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get("tab") || "profile";

  const {
    currentUser,
    loginUser,
    theme,
    toggleTheme,
    addAuditLog
  } = useHealthcare();

  const [activeTab, setActiveTab] = useState(defaultTab);
  
  // Profile inputs
  const [profileName, setProfileName] = useState(currentUser?.name || "");
  const [profileEmail, setProfileEmail] = useState(currentUser?.email || "");
  const [profileRole, setProfileRole] = useState(currentUser?.role || "");
  const [clinicName, setClinicName] = useState(currentUser?.clinicName || "");

  // Password inputs
  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  
  // Save indicators
  const [profileSaved, setProfileSaved] = useState(false);
  const [securitySaved, setSecuritySaved] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaved(false);
    if (!profileEmail || !profileName) return;

    loginUser(profileEmail, profileName);
    addAuditLog("Update Settings Profile", "Settings", `Updated admin account profile details to ${profileName}.`);
    
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2000);
  };

  const handleSaveSecurity = (e: React.FormEvent) => {
    e.preventDefault();
    setSecuritySaved(false);
    if (!oldPass || !newPass || newPass !== confirmPass) return;
    
    addAuditLog("Update Password Credentials", "Settings", "Updated admin account credentials key.");
    
    setOldPass("");
    setNewPass("");
    setConfirmPass("");
    setSecuritySaved(true);
    setTimeout(() => setSecuritySaved(false), 2000);
  };

  return (
    <div className="flex flex-col gap-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">System Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">Configure profile details, notification templates, security credentials, and preferences.</p>
        </div>
      </div>

      {/* Settings Tabs */}
      <Tabs defaultValue="profile" value={activeTab} onValueChange={setActiveTab}>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Left: Tab selectors sidebar */}
          <div className="lg:col-span-1 flex flex-col gap-2">
            <TabsList className="flex flex-col h-auto bg-card border border-border p-1.5 rounded-2xl items-stretch justify-start gap-1">
              <TabsTrigger value="profile" className="justify-start gap-2.5 px-3 py-2.5 rounded-xl text-left cursor-pointer data-[state=selected]:bg-primary data-[state=selected]:text-white">
                <User className="h-4.5 w-4.5" />
                <span>Admin Profile</span>
              </TabsTrigger>
              <TabsTrigger value="clinic" className="justify-start gap-2.5 px-3 py-2.5 rounded-xl text-left cursor-pointer data-[state=selected]:bg-primary data-[state=selected]:text-white">
                <Building className="h-4.5 w-4.5" />
                <span>Clinic Workspace</span>
              </TabsTrigger>
              <TabsTrigger value="security" className="justify-start gap-2.5 px-3 py-2.5 rounded-xl text-left cursor-pointer data-[state=selected]:bg-primary data-[state=selected]:text-white">
                <Shield className="h-4.5 w-4.5" />
                <span>Security & Keys</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="justify-start gap-2.5 px-3 py-2.5 rounded-xl text-left cursor-pointer data-[state=selected]:bg-primary data-[state=selected]:text-white">
                <Bell className="h-4.5 w-4.5" />
                <span>Alert Rules</span>
              </TabsTrigger>
              <TabsTrigger value="preferences" className="justify-start gap-2.5 px-3 py-2.5 rounded-xl text-left cursor-pointer data-[state=selected]:bg-primary data-[state=selected]:text-white">
                <Palette className="h-4.5 w-4.5" />
                <span>Theme & Styling</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Right: Tab content sheets */}
          <div className="lg:col-span-3">
            
            {/* Admin Profile */}
            <TabsContent value="profile" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Admin Profile Settings</CardTitle>
                  <CardDescription>Update name, email contacts, and roles registered in the clinic roster.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSaveProfile} className="flex flex-col gap-4 max-w-lg">
                    {profileSaved && (
                      <div className="bg-secondary/15 text-secondary border border-secondary/20 p-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5">
                        <Check className="h-4 w-4" />
                        <span>Profile details saved successfully.</span>
                      </div>
                    )}
                    
                    <Input
                      type="text"
                      label="Full Name"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                    />
                    <Input
                      type="email"
                      label="Email Address"
                      value={profileEmail}
                      onChange={(e) => setProfileEmail(e.target.value)}
                    />
                    <Input
                      type="text"
                      label="Administrative Role"
                      value={profileRole}
                      disabled
                      helperText="Contact system developers to request access role updates."
                    />
                    
                    <Button type="submit" className="rounded-xl w-fit mt-2">
                      Save Profile Changes
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Clinic Workspace Settings */}
            <TabsContent value="clinic" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Clinic Workspace Identity</CardTitle>
                  <CardDescription>Setup name descriptors and geographic localization fields.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={(e) => { e.preventDefault(); alert("Clinic details saved."); }} className="flex flex-col gap-4 max-w-lg">
                    <Input
                      type="text"
                      label="Facility Name"
                      value={clinicName}
                      onChange={(e) => setClinicName(e.target.value)}
                    />
                    <Select
                      label="Roster Location / Timezone"
                      options={[
                        { value: "EST", label: "US/Eastern (EST)" },
                        { value: "GMT", label: "Europe/London (GMT)" },
                        { value: "IST", label: "Colombo/Sri Lanka (IST)" }
                      ]}
                      defaultValue="IST"
                    />
                    <Input
                      type="text"
                      label="Clinical Registration Key"
                      placeholder="MC-2026-REG-98"
                      disabled
                      helperText="HIPAA authentication license."
                    />
                    
                    <Button type="submit" className="rounded-xl w-fit mt-2">
                      Save Workspace Identity
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Security Passwords */}
            <TabsContent value="security" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Security Credentials</CardTitle>
                  <CardDescription>Change admin password and download security keys.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSaveSecurity} className="flex flex-col gap-4 max-w-lg">
                    {securitySaved && (
                      <div className="bg-secondary/15 text-secondary border border-secondary/20 p-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5">
                        <Check className="h-4 w-4" />
                        <span>Credentials updated successfully.</span>
                      </div>
                    )}
                    
                    <Input
                      type="password"
                      label="Current Password"
                      placeholder="••••••••"
                      value={oldPass}
                      onChange={(e) => setOldPass(e.target.value)}
                    />
                    <Input
                      type="password"
                      label="New Password"
                      placeholder="••••••••"
                      value={newPass}
                      onChange={(e) => setNewPass(e.target.value)}
                    />
                    <Input
                      type="password"
                      label="Confirm New Password"
                      placeholder="••••••••"
                      value={confirmPass}
                      onChange={(e) => setConfirmPass(e.target.value)}
                    />
                    
                    <Button type="submit" className="rounded-xl w-fit mt-2">
                      Update Password
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Alert Rules Toggles */}
            <TabsContent value="notifications" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Alert Rules & Preferences</CardTitle>
                  <CardDescription>Setup notification triggers for warehouse limits and upcoming appointments.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <div className="flex flex-col gap-4 max-w-md text-xs">
                    <label className="flex items-center justify-between p-3 bg-muted/20 border border-border/30 rounded-xl cursor-pointer hover:bg-muted/40 transition-colors">
                      <div className="flex flex-col text-left gap-0.5">
                        <span className="font-bold">Low Stock Warning SMS</span>
                        <span className="text-muted-foreground text-[10px]">Dispatch SMS alert when drug counts drop below 50.</span>
                      </div>
                      <input type="checkbox" className="rounded-sm border-border text-primary focus:ring-primary h-4.5 w-4.5 cursor-pointer" defaultChecked />
                    </label>
                    <label className="flex items-center justify-between p-3 bg-muted/20 border border-border/30 rounded-xl cursor-pointer hover:bg-muted/40 transition-colors">
                      <div className="flex flex-col text-left gap-0.5">
                        <span className="font-bold">Daily Revenue E-Mail Summaries</span>
                        <span className="text-muted-foreground text-[10px]">Send invoice summary sheets to admin email.</span>
                      </div>
                      <input type="checkbox" className="rounded-sm border-border text-primary focus:ring-primary h-4.5 w-4.5 cursor-pointer" />
                    </label>
                    <label className="flex items-center justify-between p-3 bg-muted/20 border border-border/30 rounded-xl cursor-pointer hover:bg-muted/40 transition-colors">
                      <div className="flex flex-col text-left gap-0.5">
                        <span className="font-bold">Expiry Warning Dashboard Popups</span>
                        <span className="text-muted-foreground text-[10px]">Popup warnings 30 days before items reach expiry.</span>
                      </div>
                      <input type="checkbox" className="rounded-sm border-border text-primary focus:ring-primary h-4.5 w-4.5 cursor-pointer" defaultChecked />
                    </label>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Theme Preferences */}
            <TabsContent value="preferences" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Styling & Preferences</CardTitle>
                  <CardDescription>Configure application light/dark views and color themes.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4 text-xs">
                  <div className="flex flex-col gap-2">
                    <span className="font-bold text-muted-foreground uppercase text-[10px] tracking-wider pl-0.5">Active Mode</span>
                    <div className="flex gap-3">
                      <Button
                        variant={theme === "light" ? "primary" : "outline"}
                        className="rounded-xl flex-1 max-w-[120px] font-bold"
                        onClick={() => theme !== "light" && toggleTheme()}
                      >
                        Light Mode
                      </Button>
                      <Button
                        variant={theme === "dark" ? "primary" : "outline"}
                        className="rounded-xl flex-1 max-w-[120px] font-bold"
                        onClick={() => theme !== "dark" && toggleTheme()}
                      >
                        Dark Mode
                      </Button>
                    </div>
                  </div>

                  <div className="border-t border-border/40 mt-4 pt-4 flex flex-col gap-2">
                    <span className="font-bold text-muted-foreground uppercase text-[10px] tracking-wider pl-0.5">Clinic Color Accents</span>
                    <div className="flex items-center gap-2">
                      <div className="h-5 w-5 bg-blue-600 rounded-full border border-white shadow-xs" title="Ocean Blue (Primary)" />
                      <div className="h-5 w-5 bg-emerald-500 rounded-full opacity-60 cursor-not-allowed" title="Forest Green" />
                      <div className="h-5 w-5 bg-purple-600 rounded-full opacity-60 cursor-not-allowed" title="Orchid Purple" />
                      <span className="text-[10px] text-muted-foreground pl-2 italic">Color override locked to default Ocean Blue.</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

          </div>
        </div>
      </Tabs>

    </div>
  );
}
