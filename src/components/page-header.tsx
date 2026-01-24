interface PageHeaderProps {
  children: React.ReactNode;
}

export function PageHeader({ children }: PageHeaderProps) {
  return (
    <div className="-mx-4 -mt-4 mb-4 flex flex-col gap-4 bg-muted/50 px-4 py-4 md:-mx-8 md:-mt-8 md:mb-8 md:flex-row md:items-center md:justify-between md:px-8 md:py-6 screen-only">
      {children}
    </div>
  );
}
