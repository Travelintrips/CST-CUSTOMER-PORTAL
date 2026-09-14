interface SectionTitleProps {
  title: string;
  subtitle?: string;
  align?: "left" | "center" | "right";
  className?: string;
}

export function SectionTitle({ title, subtitle, align = "left", className = "" }: SectionTitleProps) {
  const alignClass = align === "center" ? "text-center" : align === "right" ? "text-right" : "text-left";

  return (
    <div className={`${alignClass} ${className}`}>
      <h2 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-2 text-base text-muted-foreground leading-relaxed">{subtitle}</p>
      )}
    </div>
  );
}
