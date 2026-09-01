import { ChefHat } from 'lucide-react';

interface MaintenancePageProps {
  headline?: string;
  message?: string;
}

/**
 * Shown to non-admin visitors when hero content's isMaintenanceMode is true.
 * Admins stay logged in and see the real site — see App.tsx for the bypass logic.
 */
export function MaintenancePage({ headline, message }: MaintenancePageProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4 py-12 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #3E2723 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>

      <div className="max-w-xl w-full text-center relative z-10">
        <div className="mb-8 flex justify-center">
          <img src="/images/logo.png" alt="PinoyPantry" className="h-32 w-auto drop-shadow-lg" />
        </div>

        <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#D32F2F] text-white text-sm font-semibold rounded-full mb-6">
          <ChefHat className="w-4 h-4" />
          KITCHEN'S CLOSED FOR A BIT
        </span>

        <h1
          className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-[#3E2723]"
          style={{ fontFamily: "'Baloo 2', 'Poppins', sans-serif" }}
        >
          {headline || "We're Cooking Up Something New!"}
        </h1>

        <p className="text-lg text-[#6D4C41] leading-relaxed">
          {message || "PinoyPantry is getting a fresh batch of updates. Balik kami agad — hang tight, we'll be back before you can say 'Pasabuy!'"}
        </p>
      </div>
    </div>
  );
}
