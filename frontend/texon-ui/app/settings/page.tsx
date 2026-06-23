"use client"

import { AppLayout } from "@/components/layout/AppLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Upload, User, Globe, Bell, ShieldCheck, Building2 } from "lucide-react"

export default function Settings() {
  return (
    <AppLayout>
      <div className="p-6 md:p-8 max-w-[1600px] mx-auto space-y-6">

        {/* Header */}
        <div>
          <h2 className="text-3xl font-bold tracking-tight">User Profile & Settings</h2>
          <p className="text-muted-foreground mt-1 text-sm">Manage your account details, preferences, and security protocols.</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Nav */}
          <div className="lg:col-span-1">
            <Card className="bg-white/80 backdrop-blur-md border-border/50 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
              <CardContent className="p-2">
                {[
                  { label: "Personal Profile",  icon: User,         active: true },
                  { label: "Language & Region", icon: Globe,        active: false },
                  { label: "Notifications",     icon: Bell,         active: false },
                  { label: "Security & Role",   icon: ShieldCheck,  active: false },
                  { label: "Organization",      icon: Building2,    active: false },
                ].map((item) => (
                  <button
                    key={item.label}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors text-left ${
                      item.active
                        ? "bg-accent text-primary border-l-[3px] border-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    }`}
                  >
                    <item.icon className={`h-4 w-4 ${item.active ? "text-primary" : "text-muted-foreground"}`} />
                    {item.label}
                  </button>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Right Content */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Personal Profile Section */}
            <Card className="bg-white/80 backdrop-blur-md border-border/50 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
              <CardHeader className="border-b border-border pb-4">
                <CardTitle className="text-lg font-bold">Personal Profile</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                
                {/* Photo Upload */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                  <div className="relative">
                    <Avatar className="h-24 w-24 border-2 border-border rounded-xl">
                      <AvatarImage src="https://i.pravatar.cc/150?u=rafiqul" alt="User" className="rounded-xl object-cover" />
                      <AvatarFallback className="text-xl font-bold rounded-xl bg-primary text-primary-foreground">RI</AvatarFallback>
                    </Avatar>
                    <button className="absolute -bottom-2 -right-2 bg-white border border-border text-primary rounded-full p-1.5 shadow-sm hover:bg-muted transition-colors">
                      <Upload className="h-3 w-3" />
                    </button>
                  </div>
                  <div>
                    <div className="flex gap-2">
                      <Button className="bg-primary hover:bg-primary/90 text-white font-semibold">Upload New Photo</Button>
                      <Button variant="ghost" className="text-muted-foreground font-semibold">Remove</Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">JPG, GIF or PNG. Max size of 2MB.</p>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">Full Name</label>
                    <Input defaultValue="Rafiqul Islam" className="bg-white" />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-foreground">Employee ID</label>
                      <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"/> Verified
                      </span>
                    </div>
                    <Input defaultValue="UNIT1-MGR-004" disabled className="bg-muted/50 text-muted-foreground font-mono" />
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">Designation</label>
                    <Input defaultValue="Floor Manager" className="bg-white" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">Email Address</label>
                    <Input defaultValue="r.islam@dhakaplant.com" className="bg-white" />
                  </div>

                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-xs font-bold text-foreground">Primary Contact Number</label>
                    <div className="flex">
                      <div className="flex items-center justify-center px-3 border border-r-0 border-border rounded-l-md bg-muted/30 text-sm font-medium text-muted-foreground">
                        +880
                      </div>
                      <Input defaultValue="171-234-5678" className="rounded-l-none font-mono bg-white" />
                    </div>
                  </div>
                </div>

                <div className="border-t border-border pt-6 flex justify-end">
                  <Button className="bg-foreground hover:bg-foreground/90 text-background font-semibold px-6">
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Language & Region Section */}
            <Card className="bg-white/80 backdrop-blur-md border-border/50 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
              <CardHeader className="border-b border-border pb-4">
                <CardTitle className="text-lg font-bold">Language & Region</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                
                <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div>
                    <div className="font-semibold text-sm text-foreground">Interface Language</div>
                    <div className="text-xs text-muted-foreground mt-0.5">Select the primary language for the ERP dashboard.</div>
                  </div>
                  <div className="flex rounded-md border border-border overflow-hidden text-xs font-bold">
                    <button className="px-4 py-2 bg-muted/50 text-foreground transition-colors hover:bg-muted">EN</button>
                    <button className="px-4 py-2 bg-white text-muted-foreground hover:bg-muted transition-colors">BN</button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Timezone</label>
                  <select className="flex h-10 w-full items-center justify-between rounded-md border border-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                    <option>(GMT+06:00) Dhaka</option>
                    <option>(GMT+05:30) India Standard Time</option>
                    <option>(GMT+08:00) China Standard Time</option>
                  </select>
                </div>

              </CardContent>
            </Card>

          </div>
        </div>

      </div>
    </AppLayout>
  )
}
