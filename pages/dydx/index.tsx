import { Header } from "@/components/dashboard/header";

export default function DydxPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 space-y-4 p-8 pt-6">
        <h1 className="text-3xl font-bold">dYdX Dashboard</h1>
        <p className="text-muted-foreground">Coming soon...</p>
      </main>
    </div>
  );
}