import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";

export default function CustomerLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="bg-[#FFF8ED] flex flex-col min-h-screen text-[#174D38] font-sans pb-24 md:pb-0">
      <Header />
      <main className="flex-1">{children}</main>
      <BottomNav />
    </div>
  );
}
