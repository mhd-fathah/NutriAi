export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-4">
      {/* Decorative blobs */}
      <div className="fixed top-0 left-0 w-96 h-96 bg-emerald-200 opacity-20 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-96 h-96 bg-teal-200 opacity-20 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl pointer-events-none" />
      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-lg">🥗</span>
            </div>
            <span className="text-xl font-bold text-gray-900">NutriAI</span>
          </div>
          <p className="text-xs text-gray-400">AI-Powered Nutrition Tracker</p>
        </div>
        {children}
      </div>
    </div>
  );
}
