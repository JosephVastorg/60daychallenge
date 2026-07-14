import { initials } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function Avatar({
  name,
  url,
  size = 36,
  className,
}: {
  name: string;
  url?: string | null;
  size?: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "cut shrink-0 grid place-items-center overflow-hidden surface-2 font-mono font-bold text-text",
        className,
      )}
      style={{ width: size, height: size, fontSize: size * 0.36 }}
      aria-hidden
    >
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="" className="h-full w-full object-cover" />
      ) : (
        <span>{initials(name)}</span>
      )}
    </div>
  );
}
