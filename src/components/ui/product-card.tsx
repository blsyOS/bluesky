import Link from "next/link";
import { Card, CardBody } from "@/components/ui/card";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { ArrowRightIcon } from "@/components/icons";
import { accentStyle } from "@/lib/accents";
import { cn } from "@/lib/cn";

/** The 2-letter accent tile used wherever a product is referenced. */
export function ProductGlyph({
  name,
  productKey,
  size = "md",
  className,
}: {
  name: string;
  productKey: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}) {
  const sizes = {
    sm: "size-8 rounded-lg text-xs",
    md: "size-9 rounded-lg text-xs",
    lg: "size-11 rounded-xl text-sm",
    xl: "size-16 rounded-2xl text-lg",
  };
  return (
    <span
      style={accentStyle(productKey)}
      className={cn(
        "inline-flex shrink-0 items-center justify-center bg-accent font-bold text-white",
        sizes[size],
        className
      )}
      aria-hidden
    >
      {name.slice(0, 2)}
    </span>
  );
}

/**
 * Product tile for the switcher and products surfaces. Launchable products
 * link to their workspace; unavailable ones render dimmed with the reason.
 */
export function ProductCard({
  productKey,
  name,
  description,
  launchable,
  availability,
  href,
}: {
  productKey: string;
  name: string;
  description: string | null;
  launchable: boolean;
  availability: { label: string; tone: BadgeTone };
  href?: string;
}) {
  const card = (
    <Card
      variant={launchable ? "interactive" : "default"}
      className={cn("h-full", !launchable && "opacity-60")}
      style={accentStyle(productKey)}
    >
      <CardBody className="flex h-full flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <ProductGlyph name={name} productKey={productKey} size="lg" />
          <Badge tone={availability.tone}>{availability.label}</Badge>
        </div>
        <h3 className="mt-4 text-title-section">{name}</h3>
        <p className="mt-1 flex-1 text-caption">{description}</p>
        {launchable ? (
          <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-accent">
            Launch <ArrowRightIcon className="size-4" />
          </span>
        ) : (
          <span className="mt-4 text-caption">Unavailable</span>
        )}
      </CardBody>
    </Card>
  );

  return launchable && href ? (
    <Link href={href}>{card}</Link>
  ) : (
    <div aria-disabled="true">{card}</div>
  );
}
