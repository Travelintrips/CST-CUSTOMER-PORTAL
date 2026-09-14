/**
 * Shared logistic-order status maps — used by dashboard, orders, and any page
 * that displays logistic order statuses. Single source of truth.
 */

export const LOGISTIC_STATUS_COLOR: Record<string, string> = {
  "Order Received":    "bg-yellow-100 text-yellow-800",
  "Admin Review":      "bg-orange-100 text-orange-800",
  "RFQ Sent":          "bg-amber-100 text-amber-800",
  "Quote Received":    "bg-cyan-100 text-cyan-800",
  "Customer Approval": "bg-blue-100 text-blue-800",
  "Vendor Confirmed":  "bg-indigo-100 text-indigo-800",
  "In Progress":       "bg-sky-100 text-sky-800",
  "Pickup":            "bg-violet-100 text-violet-800",
  "In Transit":        "bg-purple-100 text-purple-800",
  "Arrived":           "bg-teal-100 text-teal-800",
  "Delivered":         "bg-green-100 text-green-800",
  "POD Uploaded":      "bg-emerald-100 text-emerald-800",
  "Invoice Issued":    "bg-indigo-100 text-indigo-800",
  "Payment Received":  "bg-teal-100 text-teal-800",
  "Completed":         "bg-emerald-100 text-emerald-800",
  "Cancelled":         "bg-red-100 text-red-800",
};

export const LOGISTIC_STATUS_ID: Record<string, string> = {
  "Order Received":    "Order Diterima",
  "Admin Review":      "Ditinjau Admin",
  "RFQ Sent":          "RFQ Terkirim",
  "Quote Received":    "Penawaran Masuk",
  "Customer Approval": "Menunggu Persetujuan",
  "Vendor Confirmed":  "Vendor Dikonfirmasi",
  "In Progress":       "Sedang Diproses",
  "Pickup":            "Penjemputan",
  "In Transit":        "Dalam Perjalanan",
  "Arrived":           "Tiba di Tujuan",
  "Delivered":         "Terkirim",
  "POD Uploaded":      "Bukti Terkirim",
  "Invoice Issued":    "Invoice Diterbitkan",
  "Payment Received":  "Pembayaran Diterima",
  "Completed":         "Selesai",
  "Cancelled":         "Dibatalkan",
};

export const PENDING_QUOTE_STATUSES   = new Set(["Order Received", "Admin Review", "RFQ Sent", "Quote Received"]);
export const PENDING_APPROVAL_STATUSES = new Set(["Customer Approval"]);
export const ACTIVE_STATUSES           = new Set(["Vendor Confirmed", "In Progress", "Pickup", "In Transit", "Arrived"]);
