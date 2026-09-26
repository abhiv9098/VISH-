import Header from "@/components/Header";
import ConditionalFooter from "@/components/ConditionalFooter";

export default function CustomerLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="bg-gray-50 flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">{children}</main>
      <ConditionalFooter />
    </div>
  );
}
