import { useCallback, useEffect, useState } from "react";
import { Bot, RefreshCw, Save, Loader2 } from "lucide-react";
import { getAuthHeaders } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

export function ChatbotAdminTab() {
  const [prompt, setPrompt] = useState("");
  const [stats, setStats] = useState({ sessions: 0, messages: 0, knowledge: 0, providerConfigured: false, model: "" });
  const [loading, setLoading] = useState(true); const [saving, setSaving] = useState(false); const [error, setError] = useState("");
  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const r = await fetch("/api/portal/admin/chatbot", { headers: getAuthHeaders(), credentials: "include", cache: "no-store" });
      const b = await r.json(); if (!r.ok) throw new Error(b.message || "Gagal memuat konfigurasi chatbot.");
      setPrompt(b.systemPrompt || ""); setStats(b.stats);
    } catch(e) { setError(e instanceof Error ? e.message : "Gagal memuat chatbot."); } finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);
  async function save() {
    setSaving(true); setError("");
    try {
      const r = await fetch("/api/portal/admin/chatbot", { method:"PATCH", headers:{...getAuthHeaders(),"Content-Type":"application/json"}, credentials:"include", body:JSON.stringify({systemPrompt:prompt}) });
      const b=await r.json(); if(!r.ok) throw new Error(b.message || "Gagal menyimpan."); await load();
    } catch(e){setError(e instanceof Error ? e.message : "Gagal menyimpan.");} finally{setSaving(false);}
  }
  return <Card><CardHeader><CardTitle className="flex items-center gap-2"><Bot className="h-5 w-5 text-sky-600"/>Kelola Chatbot</CardTitle><CardDescription>Konfigurasi chatbot Customer Portal dan pantau penggunaan. API key tetap dikelola melalui Secret Manager.</CardDescription></CardHeader><CardContent className="space-y-5">
    {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
    {loading ? <div className="flex gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin"/>Memuat…</div> : <>
      <div className="grid gap-3 sm:grid-cols-4">{[["Provider",stats.providerConfigured?"Aktif":"Belum aktif"],["Model",stats.model||"—"],["Sesi",stats.sessions],["Pesan",stats.messages],["Knowledge",stats.knowledge]].map(([l,v])=><div key={String(l)} className="rounded-lg border p-3"><p className="text-xs text-muted-foreground">{l}</p><p className="font-semibold">{String(v)}</p></div>)}</div>
      <div><p className="mb-2 text-sm font-medium">System Prompt</p><Textarea value={prompt} onChange={e=>setPrompt(e.target.value)} rows={10} maxLength={12000}/><p className="mt-1 text-xs text-muted-foreground">Basis pengetahuan aktif tetap dibaca dari chatbot_knowledge_base.</p></div>
      <div className="flex gap-2"><Button onClick={()=>void save()} disabled={saving}>{saving?<Loader2 className="mr-2 h-4 w-4 animate-spin"/>:<Save className="mr-2 h-4 w-4"/>}Simpan</Button><Button variant="outline" onClick={()=>void load()}><RefreshCw className="mr-2 h-4 w-4"/>Refresh</Button></div>
    </>}
  </CardContent></Card>;
}
