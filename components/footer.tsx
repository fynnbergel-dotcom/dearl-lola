import { Logo } from "./logo";

export function Footer() {
  return (
    <footer className="border-border/70 border-t">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-[1fr_1.4fr] md:items-start">
        <div className="space-y-3">
          <Logo />
          <p className="text-fg-muted max-w-xs text-sm">
            Made with care for every Lola, and every honorary one.
          </p>
        </div>
        <div className="text-fg-muted space-y-2 text-sm md:justify-self-end md:text-right">
          <p className="text-fg font-medium">A short, honest privacy note</p>
          <p className="max-w-md md:ml-auto">
            Your name, saved compliments and streak live only in this browser. To write a compliment we send
            your first name, mood, style and anything you type to our AI provider; we don&apos;t store it, log
            it, or use analytics that identify you.
          </p>
          <p className="text-fg-subtle pt-2">© {new Date().getFullYear()} Dear Lola</p>
        </div>
      </div>
    </footer>
  );
}
