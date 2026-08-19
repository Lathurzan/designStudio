// components/ui/Spinner.tsx
interface SpinnerProps {
  className?: string;
}

export default function Spinner({ className = "" }: SpinnerProps) {
  return (
    <div className={`flex items-center justify-center py-10 ${className}`}>
      <span className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-indigo-600" />
    </div>
  );
}
