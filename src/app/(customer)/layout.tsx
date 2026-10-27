import Header from "@/components/Header";

import BottomNav from "@/components/BottomNav";

export default function CustomerLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="bg-[#fcfaf5] flex flex-col min-h-screen text-slate-900 font-sans pb-20 md:pb-0">
      <Header />
      <main className="flex-1">{children}</main>

      <BottomNav />
    </div>
  );
}
