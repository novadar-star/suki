import clsx from "clsx";
import { LoaderCircle } from "lucide-react";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "quiet" | "danger";
  busy?: boolean;
};

export function Button({ variant = "secondary", busy, className, children, disabled, ...rest }: Props) {
  return (
    <button
      {...rest}
      disabled={disabled || busy}
      aria-busy={busy || undefined}
      className={clsx(
        "press inline-flex min-h-9 items-center justify-center gap-2 rounded-md px-3.5 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50",
        variant === "primary" && "bg-ink text-inv hover:bg-ink/85",
        variant === "secondary" && "border border-line bg-panel hover:border-ink/30",
        variant === "quiet" && "text-muted hover:bg-paper hover:text-ink",
        variant === "danger" && "text-bad hover:bg-bad-soft",
        className,
      )}
    >
      {busy && <LoaderCircle aria-hidden className="size-4 animate-spin motion-reduce:animate-none" />}
      {children}
    </button>
  );
}

export function ErrorNote({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p role="alert" className="rounded-md bg-bad-soft px-3 py-2 text-sm text-bad">
      {message}
    </p>
  );
}

export const inputClass =
  "w-full rounded-md border border-line bg-panel px-3 py-2 text-[15px] placeholder:text-muted/70 focus:border-accent focus:outline-none";
