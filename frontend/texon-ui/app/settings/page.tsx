"use client"

import { useRef, useState } from "react"
import { AppLayout } from "@/components/layout/AppLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LogoutButton } from "@/components/logout-button"
import { Upload, User, Globe, Bell, ShieldCheck, Building2, ImageOff, LogOut } from "lucide-react"
import { toast } from "sonner"
import { updateUserProfile } from "@/lib/django-auth"
import { useCurrentUser, userInitials } from "@/hooks/use-current-user"

const MAX_AVATAR_BYTES = 2 * 1024 * 1024

export default function Settings() {
  const { user, loading, setUser } = useCurrentUser()
  const [fullName, setFullName] = useState("")
  const [phone, setPhone] = useState("")
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const hydrated = !!user
  const profile = user
    ? {
        fullName: `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim(),
        designation: user.is_superuser ? "System Administrator" : user.is_staff ? "Staff" : "User",
        employeeId: user.is_superuser ? "ADMIN" : `USER-${user.id}`,
        email: user.email,
        phone: user.phone,
      }
    : { fullName: "", designation: "", employeeId: "", email: "", phone: "" }

  const activeForm = {
    fullName: fullName === "" && hydrated ? profile.fullName : fullName,
    phone: phone === "" && hydrated ? profile.phone : phone,
  }

  const initials = userInitials(user)

  const handleFile = async (file: File | undefined) => {
    if (!file || !user) return
    if (!/^image\/(png|jpe?g|gif|webp)$/.test(file.type)) {
      toast.error("Only JPG, GIF or PNG images are allowed")
      return
    }
    if (file.size > MAX_AVATAR_BYTES) {
      toast.error("Max file size is 2MB")
      return
    }
    setUploading(true)
    try {
      const reader = new FileReader()
      const dataUrl: string = await new Promise((resolve, reject) => {
        reader.onload = () => resolve(String(reader.result))
        reader.onerror = () => reject(new Error("Failed to read file"))
        reader.readAsDataURL(file)
      })
      const updated = await updateUserProfile({ avatar: dataUrl })
      setUser(updated)
      toast.success("Profile picture updated")
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed")
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const handleRemovePhoto = async () => {
    if (!user) return
    setUploading(true)
    try {
      const updated = await updateUserProfile({ avatar: "" })
      setUser(updated)
      toast.success("Profile picture removed")
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Remove failed")
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async () => {
    if (!user) return
    setSaving(true)
    try {
      const [first, last = ""] = activeForm.fullName.trim().split(/\s+/)
      const updated = await updateUserProfile({
        first_name: first ?? "",
        last_name: last,
        phone: activeForm.phone.trim(),
      })
      setUser(updated)
      setFullName("")
      setPhone("")
      toast.success("Profile saved")
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed")
    } finally {
      setSaving(false)
    }
  }

  return (
    <AppLayout>
      <div className="p-6 md:p-8 max-w-[1600px] mx-auto space-y-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">User Profile & Settings</h2>
            <p className="text-muted-foreground mt-1 text-sm">Manage your account details, preferences, and security protocols.</p>
          </div>
          <LogoutButton className="bg-destructive hover:bg-destructive/90 text-white font-semibold">
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </LogoutButton>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Nav */}
          <div className="lg:col-span-1">
            <Card className="bg-white border-border/50 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
              <CardContent>
                {[
                  { label: "Personal Profile",  icon: User,         active: true },
                  { label: "Language & Region", icon: Globe,        active: false },
                  { label: "Notifications",     icon: Bell,         active: false },
                  { label: "Security & Role",   icon: ShieldCheck,  active: false },
                  { label: "Organization",      icon: Building2,    active: false },
                ].map((item) => (
                  <button
                    key={item.label}
                    onClick={() => toast.info(`Switched to ${item.label}`)}
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
            <Card className="bg-white border-border/50 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
              <CardHeader className="border-b border-border">
                <CardTitle className="text-lg font-bold">Personal Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">

                {/* Photo Upload */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                  <div className="relative">
                    <Avatar className="h-24 w-24 border-2 border-border rounded-xl">
                      {user?.avatar ? (
                        <AvatarImage src={user.avatar} alt={profile.fullName || user.email} className="rounded-xl" />
                      ) : (
                        <AvatarFallback className="text-xl font-bold rounded-xl bg-primary text-primary-foreground">{loading ? "…" : initials}</AvatarFallback>
                      )}
                    </Avatar>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="absolute -bottom-2 -right-2 bg-white border border-border text-primary rounded-full p-1.5 shadow-sm hover:bg-muted transition-colors disabled:opacity-50"
                    >
                      <Upload className="h-3 w-3" />
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/gif,image/webp"
                      className="hidden"
                      onChange={(e) => handleFile(e.target.files?.[0])}
                    />
                  </div>
                  <div>
                    <div className="flex gap-2">
                      <Button onClick={() => fileInputRef.current?.click()} disabled={uploading} className="bg-primary hover:bg-primary/90 text-white font-semibold">
                        {uploading ? "Uploading…" : "Upload New Photo"}
                      </Button>
                      <Button onClick={handleRemovePhoto} disabled={uploading || !user?.avatar} variant="ghost" className="text-muted-foreground font-semibold">
                        <ImageOff className="h-4 w-4 mr-2" />
                        Remove
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">JPG, GIF or PNG. Max size of 2MB.</p>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">Full Name</label>
                    <Input value={activeForm.fullName} onChange={(e) => setFullName(e.target.value)} className="bg-white" />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-foreground">User ID</label>
                      <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"/> Verified
                      </span>
                    </div>
                    <Input value={profile.employeeId} disabled className="bg-muted/50 text-muted-foreground font-mono" />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">Designation</label>
                    <Input value={profile.designation} disabled className="bg-muted/50 text-muted-foreground" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">Email Address</label>
                    <Input value={profile.email} disabled className="bg-muted/50 text-muted-foreground" />
                  </div>

                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-xs font-bold text-foreground">Primary Contact Number</label>
                    <Input value={activeForm.phone} onChange={(e) => setPhone(e.target.value)} className="font-mono bg-white" />
                  </div>
                </div>

                <div className="border-t border-border pt-6 flex justify-end">
                  <Button onClick={handleSave} disabled={saving || !user} className="bg-foreground hover:bg-foreground/90 text-background font-semibold px-6">
                    {saving ? "Saving…" : "Save Changes"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Security Section */}
            <Card className="bg-white border-border/50 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
              <CardHeader className="border-b border-border">
                <CardTitle className="text-lg font-bold">Security</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="font-semibold text-sm text-foreground">Sign out of your account</div>
                  <div className="text-xs text-muted-foreground mt-0.5">End your current session and return to the login page.</div>
                </div>
                <LogoutButton className="bg-destructive hover:bg-destructive/90 text-white font-semibold">
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </LogoutButton>
              </CardContent>
            </Card>

            {/* Language & Region Section */}
            <Card className="bg-white border-border/50 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
              <CardHeader className="border-b border-border">
                <CardTitle className="text-lg font-bold">Language & Region</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">

                <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div>
                    <div className="font-semibold text-sm text-foreground">Interface Language</div>
                    <div className="text-xs text-muted-foreground mt-0.5">Select the primary language for the ERP dashboard.</div>
                  </div>
                  <div className="flex rounded-md border border-border overflow-hidden text-xs font-bold">
                    <button onClick={() => toast.info("English selected")} className="px-4 py-2 bg-muted/50 text-foreground transition-colors hover:bg-muted">EN</button>
                    <button onClick={() => toast.info("Bangla selected")} className="px-4 py-2 bg-white text-muted-foreground hover:bg-muted transition-colors">BN</button>
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