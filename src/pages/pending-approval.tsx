import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import {
  fetchPortalAuthBootstrap,
  getCachedPortalAuthBootstrap,
  isAuthenticated,
  removeAuthToken,
  type PortalAuthBootstrap,
} from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Clock, CheckCircle2, XCircle, LogOut, RefreshCw } from "lucide-react";

interface OnboardingStatus {
  status: string;
  accountType: string;
  customerType?: "individual" | "company" | null;
  rejectionReason?: string;
  customerContext?: {
    status?: string;
    pendingRequest?: {
      requestedCompanyName: string;
      requestedRegistrationNumber: string | null;
    } | null;
  };
}

const ACCOUNT_TYPE_LABEL: Record<string, string> = {
  customer: "Customer",
  vendor: "Vendor",
  driver: "Driver",
  employee: "Karyawan",
};

export default function PendingApprovalPage() {
  const [, setLocation] = useLocation();
  const [status, setStatus] = useState<OnboardingStatus | null>(null);
  const [checking, setChecking] = useState(false);

  const authed = isAuthenticated();

  useEffect(() => {
    if (!authed) { setLocation("/login"); return; }
    const cached = getCachedPortalAuthBootstrap();
    if (cached) {
      applyBootstrap(cached);
    } else {
      void fetchPortalAuthBootstrap().then(applyBootstrap);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authed]);

  // Auto-poll every 30s while still pending (stops when approved/rejected)
  useEffect(() => {
    if (!status || (status.status !== "pending" && status.status !== "company_pending")) return;
    const id = setInterval(loadStatus, 30_000);
    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status?.status]);

  function applyBootstrap(bootstrap: PortalAuthBootstrap | null) {
    if (!bootstrap) {
      setLocation("/login");
      return;
    }
    const data: OnboardingStatus = {
      status: bootstrap.customerContext.status === "company_pending"
        ? "company_pending"
        : bootstrap.onboardingStatus,
      accountType: bootstrap.role,
      customerType: bootstrap.customerType as OnboardingStatus["customerType"],
      customerContext: {
        status: bootstrap.customerContext.status,
        pendingRequest: bootstrap.customerContext.pendingRequest as {
          requestedCompanyName: string;
          requestedRegistrationNumber: string | null;
        } | null,
      },
    };
    setStatus(data);
    if (bootstrap.allowedDestination !== "/pending-approval") {
      setLocation(bootstrap.allowedDestination);
    }
  }

  async function loadStatus() {
    setChecking(true);
    try {
      const res = await fetch("/api/portal/onboarding/status", {
        credentials: "include",
      });
      if (!res.ok) { removeAuthToken(); setLocation("/login"); return; }
      const data = await res.json() as OnboardingStatus;
      setStatus(data);
      if (data.status === "active") {
        if (
          data.customerContext?.status === "legacy_unresolved"
          || data.customerContext?.status === "company_unresolved"
        ) {
          setLocation("/onboarding");
          return;
        }
        const role = data.accountType;
        if (role === "vendor") setLocation("/vendor-dashboard");
        else setLocation("/dashboard");
      } else if (data.status === "incomplete") {
        setLocation("/onboarding");
      }
    } catch {
      /* ignore */
    } finally {
      setChecking(false);
    }
  }

  function handleLogout() {
    removeAuthToken();
    setLocation("/login");
  }

  if (!authed || !status) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const isRejected = status.status === "rejected";
  const isCompanyPending = status.status === "company_pending";

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className={`px-8 py-10 text-center ${isRejected ? "bg-red-50" : "bg-amber-50"}`}>
          <div className="flex justify-center mb-4">
             {isRejected
              ? <XCircle className="h-16 w-16 text-red-500" />
              : <Clock className="h-16 w-16 text-amber-500 animate-pulse" />
            }
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
             {isRejected
               ? "Akun Ditolak"
               : isCompanyPending
                 ? "Menunggu Verifikasi Perusahaan"
                 : "Menunggu Persetujuan"}
          </h1>
          <p className="text-gray-600 text-sm">
             {isRejected
              ? "Pendaftaran akun Anda tidak dapat disetujui"
               : isCompanyPending
                 ? "Akun Anda sudah aktif, tetapi perusahaan harus dipetakan oleh admin sebelum fitur perusahaan dapat digunakan"
              : `Pendaftaran akun ${ACCOUNT_TYPE_LABEL[status.accountType] ?? status.accountType} Anda sedang ditinjau oleh admin`
            }
          </p>
        </div>

        <div className="px-8 py-6 space-y-4">
          <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tipe Akun</span>
               <span className="font-medium">
                 {isCompanyPending ? "Perusahaan" : ACCOUNT_TYPE_LABEL[status.accountType] ?? status.accountType}
               </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Status</span>
              <span className={`font-semibold ${isRejected ? "text-red-600" : "text-amber-600"}`}>
                 {isRejected ? "Ditolak" : isCompanyPending ? "Menunggu verifikasi perusahaan" : "Pending Review"}
              </span>
            </div>
             {isCompanyPending && status.customerContext?.pendingRequest && (
               <div className="pt-2 border-t border-gray-200">
                 <p className="text-sm text-muted-foreground mb-1">Perusahaan yang diajukan:</p>
                 <p className="text-sm text-amber-800 font-medium">{status.customerContext.pendingRequest.requestedCompanyName}</p>
                 {status.customerContext.pendingRequest.requestedRegistrationNumber && (
                   <p className="text-xs text-muted-foreground mt-1">
                     Nomor registrasi: {status.customerContext.pendingRequest.requestedRegistrationNumber}
                   </p>
                 )}
               </div>
             )}
            {isRejected && status.rejectionReason && (
              <div className="pt-2 border-t border-gray-200">
                <p className="text-sm text-muted-foreground mb-1">Alasan:</p>
                <p className="text-sm text-red-700 font-medium">{status.rejectionReason}</p>
              </div>
            )}
          </div>

           {!isRejected && (
            <div className="rounded-xl bg-blue-50 border border-blue-100 p-4">
              <div className="flex gap-3">
                <CheckCircle2 className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Apa yang terjadi selanjutnya?</p>
                   <ul className="space-y-1 text-blue-700 list-disc list-inside">
                     {isCompanyPending ? (
                       <>
                         <li>Admin akan memetakan perusahaan ke data canonical</li>
                         <li>Membership perusahaan dibuat otomatis setelah disetujui</li>
                         <li>Setelah itu Anda dapat melanjutkan RFQ perusahaan</li>
                       </>
                     ) : (
                       <>
                         <li>Admin akan meninjau data profil Anda</li>
                         <li>Proses persetujuan biasanya 1–2 hari kerja</li>
                         <li>Anda akan mendapat notifikasi setelah disetujui</li>
                       </>
                     )}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {isRejected && (
            <Button
              className="w-full"
              onClick={() => setLocation("/onboarding")}
            >
              Lengkapi Ulang Profil
            </Button>
          )}

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1 gap-2"
              onClick={loadStatus}
              disabled={checking}
            >
              <RefreshCw className={`h-4 w-4 ${checking ? "animate-spin" : ""}`} />
              Cek Status
            </Button>
            <Button
              variant="ghost"
              className="flex-1 gap-2 text-muted-foreground"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              Keluar
            </Button>
          </div>

          <p className="text-center text-xs text-muted-foreground">
            Butuh bantuan? Hubungi kami via WhatsApp
          </p>
        </div>
      </div>
    </div>
  );
}
