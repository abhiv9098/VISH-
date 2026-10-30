'use client';

import React from "react";
import { Check, Truck, Clock, XCircle, PackageCheck, AlertCircle } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useOrderCountdown } from "@/lib/useOrderCountdown";

export type TrackingStage = "Order Placed" | "Confirmed" | "Out for Delivery" | "Delivered";

const STAGES: { key: string; en: string; hi: string }[] = [
  { key: "orderPlaced", en: "Order Placed", hi: "ऑर्डर दिया गया" },
  { key: "confirmed", en: "Confirmed", hi: "कन्फ़र्म हुआ" },
  { key: "outForDelivery", en: "Out for Delivery", hi: "डिलीवरी के लिए निकला" },
  { key: "delivered", en: "Delivered", hi: "डिलीवर हो गया" }
];

export default function OrderTracking({ 
  currentStatus, 
  city = "Gurugram",
  estimatedDelivery,
  deliveryType,
  order
}: { 
  currentStatus: string; 
  city?: string;
  estimatedDelivery?: string;
  deliveryType?: 'express' | 'standard';
  order?: any;
}) {
  const { language } = useLanguage();
  const countdown = useOrderCountdown(
    order || { status: currentStatus, estimatedDelivery, deliveryType }, 
    language
  );

  if (currentStatus === 'Cancelled') {
    return (
      <div className="bg-red-50 p-2.5 sm:p-3 rounded-xl border border-red-200 text-xs flex items-center gap-2 text-red-700">
        <XCircle size={16} className="text-red-600 shrink-0" />
        <div className="flex-1">
          <span className="font-bold">{language === 'hi' ? 'ऑर्डर रद्द कर दिया गया है' : 'Order Cancelled'}</span>
          <span className="text-slate-500 ml-1.5 text-[11px]">
            {language === 'hi' ? 'यदि कोई राशि कटी है तो वह वापस कर दी जाएगी' : 'Any refund will be processed to the original payment source'}
          </span>
        </div>
      </div>
    );
  }

  // Map database status strings cleanly to the 4 timeline stages:
  // 0 = Order Placed
  // 1 = Confirmed
  // 2 = Out for Delivery
  // 3 = Delivered
  const getStageIndex = (status: string): number => {
    const s = (status || '').toLowerCase().trim();
    if (s === 'delivered' || s === 'completed' || s === 'complete delivery') {
      return 3;
    }
    if (s === 'out for delivery' || s === 'dispatched' || s === 'on the way') {
      return 2;
    }
    if (
      s === 'order confirmed' ||
      s === 'confirmed' ||
      s === 'accepted' ||
      s === 'preparing your order' ||
      s === 'preparing' ||
      s === 'processing' ||
      s === 'pending' ||
      s === 'ready'
    ) {
      return 1;
    }
    return 0; // 'order placed', 'new', 'new order'
  };

  const currentIndex = getStageIndex(currentStatus);
  const currentStage = STAGES[currentIndex];
  const stageDisplayLabel = language === 'hi' ? currentStage.hi : currentStage.en;

  // Percentage for progress line: 0%, 33.3%, 66.6%, 100%
  const progressPercent = (currentIndex / (STAGES.length - 1)) * 100;

  return (
    <div className="bg-white rounded-xl p-3 sm:p-3.5 border border-slate-200/90 shadow-2xs">
      
      {/* Top Status & Delivery Countdown */}
      <div className="flex flex-wrap items-center justify-between gap-1.5 pb-2.5 mb-2.5 border-b border-slate-100 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            {currentIndex < 3 ? (
              <>
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
              </>
            ) : (
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
            )}
          </span>
          <span className="text-[11px] font-medium text-slate-500">
            {language === 'hi' ? 'स्थिति:' : 'Status:'}
          </span>
          <span className="text-xs font-black text-emerald-800">
            {stageDisplayLabel}
          </span>
        </div>

        {countdown.isDelivered ? (
          <div className="flex items-center gap-1.5 text-[11px] font-black text-emerald-950 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-300 shadow-2xs">
            <Check size={11} className="text-emerald-700 stroke-[3] shrink-0" />
            <span className="font-extrabold text-emerald-900">
              {countdown.displayText}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-[11px] font-black text-amber-950 bg-amber-50/90 px-2.5 py-0.5 rounded-md border border-amber-300 shadow-2xs">
            <Clock size={11} className="text-amber-700 shrink-0" />
            <span className="text-[10px] font-bold text-amber-800 uppercase">
              {language === 'hi' ? 'डिलीवरी:' : 'Delivery:'}
            </span>
            <span className="font-extrabold text-amber-950 font-mono">
              {countdown.displayText}
            </span>
          </div>
        )}
      </div>

      {/* Flipkart-Style 4-Stage Horizontal Timeline */}
      <div className="relative px-2 sm:px-4 py-2">
        
        {/* Background Track Bar */}
        <div className="absolute top-5 left-6 right-6 sm:left-8 sm:right-8 h-1 bg-slate-200 rounded-full -translate-y-1/2">
          {/* Animated Green Fill Bar */}
          <div 
            className="h-full bg-emerald-600 rounded-full transition-all duration-700 ease-in-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* 4 Steps */}
        <div className="relative flex justify-between items-start">
          {STAGES.map((stage, idx) => {
            const isCompleted = idx < currentIndex;
            const isCurrent = idx === currentIndex;
            const isFuture = idx > currentIndex;
            const label = language === 'hi' ? stage.hi : stage.en;

            return (
              <div 
                key={stage.key} 
                className="flex flex-col items-center text-center flex-1 min-w-0"
              >
                {/* Node Circle */}
                <div 
                  className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500 z-10 ${
                    isCompleted
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : isCurrent
                      ? 'bg-emerald-600 text-white ring-4 ring-emerald-100 scale-105 shadow-xs'
                      : 'bg-white border-2 border-slate-300 text-slate-400'
                  }`}
                >
                  {isCompleted ? (
                    <Check size={13} className="stroke-[3]" />
                  ) : isCurrent ? (
                    <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  ) : (
                    <span className="text-[10px] font-bold text-slate-400">{idx + 1}</span>
                  )}
                </div>

                {/* Step Label */}
                <span 
                  className={`mt-1.5 text-[10px] sm:text-[11.5px] leading-tight px-0.5 max-w-[72px] sm:max-w-[90px] transition-colors ${
                    isCurrent
                      ? 'font-black text-emerald-900'
                      : isCompleted
                      ? 'font-bold text-slate-800'
                      : 'font-medium text-slate-400'
                  }`}
                >
                  {label}
                </span>

                {/* Sub-label for current stage */}
                {isCurrent && (
                  <span className="text-[8.5px] font-bold text-emerald-700 uppercase tracking-wider mt-0.5 bg-emerald-50 px-1 py-0.2 rounded">
                    {language === 'hi' ? 'सक्रिय' : 'Active'}
                  </span>
                )}
              </div>
            );
          })}
        </div>

      </div>

    </div>
  );
}
