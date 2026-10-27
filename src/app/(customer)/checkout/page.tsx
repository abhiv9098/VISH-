'use client';

import { Suspense } from 'react';
import CheckoutFlow from '@/components/CheckoutFlow';

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-[80vh] text-xs font-bold text-slate-500">Loading checkout...</div>}>
      <CheckoutFlow title="Order Checkout" />
    </Suspense>
  );
}
