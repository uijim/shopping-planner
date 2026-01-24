interface PageWrapperProps {
  children: React.ReactNode;
  centered?: boolean;
}

export function PageWrapper({ children, centered }: PageWrapperProps) {
  return (
    <main
      className={`flex min-h-screen flex-col p-4 md:p-8 ${centered ? "items-center" : ""}`}
    >
      {children}
    </main>
  );
}
