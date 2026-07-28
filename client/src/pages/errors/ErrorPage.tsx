import { Button } from "@/components/ui/Button";

export default function ErrorPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 text-center">
      <h1 className="text-2xl font-semibold">Something went wrong</h1>
      <p className="text-text-muted">We&rsquo;ve logged the issue. Try reloading the page.</p>
      <Button onClick={() => window.location.reload()}>Reload</Button>
    </div>
  );
}
