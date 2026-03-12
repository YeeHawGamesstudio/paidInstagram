import { cn } from "@/lib/utils";

type MediaPreview = {
  imageUrl?: string;
  imageAlt?: string;
  label: string;
};

type MediaPreviewCardProps = {
  media: MediaPreview;
  className?: string;
  imageClassName?: string;
  labelClassName?: string;
  fallbackClassName?: string;
};

export function MediaPreviewCard({
  media,
  className,
  imageClassName,
  labelClassName,
  fallbackClassName,
}: MediaPreviewCardProps) {
  if (!media.imageUrl) {
    return (
      <div className={cn("rounded-[1.25rem] border border-white/10 bg-black/20 px-4 py-3 text-sm text-muted-foreground", fallbackClassName)}>
        {media.label}
      </div>
    );
  }

  return (
    <div className={cn("overflow-hidden rounded-[1.25rem] border border-white/10", className)}>
      <div
        className={cn("min-h-56 bg-cover bg-center", imageClassName)}
        style={{ backgroundImage: `url(${media.imageUrl})` }}
        aria-label={media.imageAlt}
      />
      <div className={cn("border-t border-white/10 bg-black/25 px-3 py-2 text-xs text-foreground/75", labelClassName)}>
        {media.label}
      </div>
    </div>
  );
}
