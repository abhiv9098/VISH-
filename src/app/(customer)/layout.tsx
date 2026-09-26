import { CartProvider } from "@/context/CartContext";
import { OrderProvider } from "@/context/OrderContext";
import { LanguageProvider } from "@/context/LanguageContext";
import Header from "@/components/Header";
import ConditionalFooter from "@/components/ConditionalFooter";

export default function CustomerLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="bg-gray-50 flex flex-col min-h-screen">
      <LanguageProvider>
        <OrderProvider>
          <CartProvider>
            <Header />
            <main className="flex-1">{children}</main>
            <ConditionalFooter />
          </CartProvider>
        </OrderProvider>
      </LanguageProvider>
    </div>
  );
}
