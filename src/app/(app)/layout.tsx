import Sidebar from '@/components/Sidebar';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="ml-64 flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
