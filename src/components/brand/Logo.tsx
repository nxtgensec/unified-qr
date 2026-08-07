import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
};

export function Logo({ className }: LogoProps) {
  return (
    <img
      src="/logo.png"
      alt="Unified QR"
      width={1024}
      height={1024}
      className={cn("size-6 rounded-[0.3em] object-cover ring-1 ring-brand/50", className)}
    />
  );
}
