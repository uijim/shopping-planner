interface PageHeaderProps {
  children: React.ReactNode;
}

export function PageHeader({ children }: PageHeaderProps) {
  return (
    <div className="-mx-8 -mt-8 mb-8 flex items-center justify-between gap-4 bg-muted/50 px-8 py-6">
      {children}
    </div>
  );
}
