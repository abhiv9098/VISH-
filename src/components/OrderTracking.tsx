import React from "react";
import { Check, Truck, Package, Clock } from "lucide-react";

type TrackingStage = "Order Placed" | "Confirmed" | "Dispatched" | "Out for Delivery" | "Delivered";

const STAGES: TrackingStage[] = [
  "Order Placed",
  "Confirmed",
  "Dispatched",
  "Out for Delivery",
  "Delivered"
];

export default function OrderTracking({ currentStatus, city = "Mumbai" }: { currentStatus: string, city?: string }) {
  let currentStageIndex = STAGES.indexOf(currentStatus as TrackingStage);
  if (currentStageIndex === -1) {
    currentStageIndex = 0; 
  }

  return (
    <div className="bg-gray-50 p-4 sm:p-6 rounded-xl border border-gray-200 mt-4 transition-all duration-300">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
          <Truck className="text-green-600" /> Track Order
        </h3>
        {currentStageIndex < 4 && (
          <div className="text-sm font-medium text-blue-700 bg-blue-50 px-3 py-1.5 rounded-full flex items-center gap-2">
            <Clock size={16} /> Estimated Delivery: Tomorrow, 2 PM
          </div>
        )}
      </div>

      <div className="relative mb-6">
        <div className="absolute left-5 sm:left-1/2 top-0 bottom-0 w-1 bg-gray-200 sm:-translate-x-1/2 sm:w-full sm:h-1 sm:top-5 sm:bottom-auto"></div>
        
        <div className="flex flex-col sm:flex-row justify-between gap-6 sm:gap-0 relative z-10">
          {STAGES.map((stage, index) => {
            const isCompleted = index <= currentStageIndex;
            const isActive = index === currentStageIndex;
            return (
              <div key={stage} className={`flex sm:flex-col items-center gap-4 sm:gap-2 sm:w-1/5 ${isCompleted ? "text-green-700" : "text-gray-400"}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-4 sm:border-2 ${isCompleted ? "bg-green-600 border-green-200 text-white" : "bg-white border-gray-200"}`}>
                  {isCompleted ? <Check size={18} /> : <div className="w-2 h-2 rounded-full bg-gray-300"></div>}
                </div>
                <div className="text-left sm:text-center w-full">
                  <p className={`text-sm sm:text-xs font-bold ${isActive ? "text-green-800" : ""}`}>{stage}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {currentStageIndex >= 2 && currentStageIndex < 4 && (
        <div className="mt-8 bg-blue-50 p-4 rounded-lg border border-blue-100 flex items-start gap-3">
          <Truck className="text-blue-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-blue-900">Your order has left our store and is on the way.</p>
            <p className="text-sm text-blue-700 mt-1">Our delivery executive is heading to your location in {city}.</p>
          </div>
        </div>
      )}
    </div>
  );
}
