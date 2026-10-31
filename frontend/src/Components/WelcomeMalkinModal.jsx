import React, { useEffect } from "react";
import { Modal } from "./UI/Modal";
import { playCuteMalkinChime } from "../Utils/cuteMalkinTheme";
import { Sparkles, Heart } from "lucide-react";

export function WelcomeMalkinModal({ open, onClose }) {
  useEffect(() => {
    if (open) {
      playCuteMalkinChime();
    }
  }, [open]);

  return (
    <Modal
      open={open}
      onCancel={onClose}
      width={460}
      centered
      footer={null}
      destroyOnClose
    >
      <div className="relative text-center py-4 px-2 overflow-hidden">
        {/* Soft decorative background glow */}
        <div className="absolute -top-12 -left-12 w-32 h-32 rounded-full bg-pink-200/50 filter blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -right-10 w-32 h-32 rounded-full bg-rose-200/50 filter blur-2xl pointer-events-none" />

        {/* Crown & Avatar Emblem */}
        <div className="relative inline-flex items-center justify-center mb-3">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-pink-400 via-rose-300 to-pink-200 p-1 shadow-lg shadow-pink-300/50 animate-pulse">
            <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
              <span className="text-3xl select-none">👑</span>
            </div>
          </div>
          <span className="absolute -top-1 -right-1 text-lg animate-bounce">💖</span>
          <span className="absolute -bottom-1 -left-1 text-sm animate-ping">✨</span>
        </div>

        {/* Greeting Banner */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-100/90 text-pink-700 text-xs font-semibold tracking-wide uppercase mb-2 shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-pink-500" />
          <span>Grace • Strength • Dedication</span>
          <Heart className="w-3.5 h-3.5 fill-pink-500 text-pink-500" />
        </div>

        <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight mb-2">
          Welcome, Malkin 👑💖
        </h2>

        <p className="text-sm text-gray-700 leading-relaxed mb-6 max-w-sm mx-auto">
          You manage and lead so much with effortless grace, patience, and dedication every single day. Take a gentle breath and remember: your quiet strength, hard work, and warmth make a real difference to everyone around you. Keep shining—you are doing truly wonderful work! 🌸✨
        </p>

        {/* Action Button */}
        <button
          type="button"
          onClick={onClose}
          className="w-full py-3 px-6 rounded-2xl font-bold text-white text-sm shadow-md transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
          style={{
            background: "linear-gradient(135deg, #f472b6 0%, #ec4899 50%, #db2777 100%)",
            boxShadow: "0 6px 20px -2px rgba(236, 72, 153, 0.45)",
          }}
        >
          <span>Aww, Thank you! 💕</span>
        </button>
      </div>
    </Modal>
  );
}

export default WelcomeMalkinModal;

