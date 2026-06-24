export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50/50 p-0 overflow-x-hidden">
      <div className="relative w-full min-h-screen flex flex-col lg:flex-row">
        {children}
      </div>
    </div>
  );
}
