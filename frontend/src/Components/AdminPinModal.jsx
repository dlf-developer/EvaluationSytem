import React, { useState } from "react";
import { Lock, ShieldAlert, KeyRound, X, CheckCircle2 } from "lucide-react";
import { setAdminFeaturesUnlocked, verifyPinMatch } from "../Utils/adminUnlock";
import { verifyAdminPinApi } from "../redux/permissionsApi";

export default function AdminPinModal({ isOpen, onClose, onSuccess, title = "Admin Verification Required" }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!pin.trim()) {
      setError("Please enter the 4-digit admin PIN.");
      return;
    }

    setIsVerifying(true);
    setError("");

    try {
      // 1. Fast local verification
      if (verifyPinMatch(pin)) {
        setAdminFeaturesUnlocked(true);
        setIsVerifying(false);
        onSuccess?.();
        onClose();
        return;
      }

      // 2. Server-side verification fallback
      const res = await verifyAdminPinApi(pin);
      if (res?.verified || res?.success) {
        setAdminFeaturesUnlocked(true);
        setIsVerifying(false);
        onSuccess?.();
        onClose();
      } else {
        setError("Invalid PIN. Access restricted.");
        setIsVerifying(false);
      }
    } catch {
      // Fallback check against default PIN
      if (verifyPinMatch(pin)) {
        setAdminFeaturesUnlocked(true);
        setIsVerifying(false);
        onSuccess?.();
        onClose();
      } else {
        setError("Invalid PIN. Please try again.");
        setIsVerifying(false);
      }
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[1500] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 bg-[#F5F0E8]/70 border-b border-stone-200/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#4A6741]/15 text-[#4A6741] flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#2D2A26] leading-tight">
                {title}
              </h3>
              <p className="text-[11px] text-[#5C5852] mt-0.5">
                Protected administrative settings
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-200/60 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <p className="text-xs text-stone-600 leading-relaxed">
            Please enter your administrative PIN to access and manage system roles, tab availability, and document editing/deletion permissions.
          </p>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              Admin PIN
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="password"
                maxLength={8}
                autoFocus
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value);
                  setError("");
                }}
                placeholder="Enter 4-digit PIN (e.g. 1111)"
                className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm tracking-widest text-[#2D2A26] focus:outline-none focus:ring-2 focus:ring-[#4A6741]/30 focus:border-[#4A6741] transition"
              />
            </div>
            {error && (
              <p className="mt-1.5 text-xs font-medium text-rose-600 flex items-center gap-1">
                <span>{error}</span>
              </p>
            )}
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isVerifying}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-[#4A6741] text-white hover:bg-[#2D3E27] transition shadow-xs flex items-center gap-1.5 disabled:opacity-60"
            >
              {isVerifying ? (
                <span>Verifying...</span>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  <span>Unlock Settings</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
