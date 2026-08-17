import Nav from '@/components/nav';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen min-h-[100dvh] flex flex-col">
      <Nav />
      <main className="flex-1">{children}</main>
      <footer className="border-t py-6 mt-12">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row gap-2 justify-between text-sm text-muted-foreground">
          <div className="flex gap-4">
            <a href="/status" className="hover:underline">Check your listing status</a>
            <a href="/financing" className="hover:underline">Apply for financing</a>
          </div>
          <div className="flex gap-4">
            <span>+1 (832) 980-7618</span>
          </div>
        </div>
      </footer>
    </div>
  );
}