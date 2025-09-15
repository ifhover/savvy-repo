export default function PageContainer({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`p-4 h-full ${className}`}>{children}</div>;
}
