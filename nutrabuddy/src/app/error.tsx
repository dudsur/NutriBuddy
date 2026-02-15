"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F4F7F5] p-6">
      <div className="max-w-md w-full bg-white rounded-2xl p-6 shadow-sm border border-black/5 text-center">
        <h1 className="text-xl font-bold text-black">Something went wrong</h1>
        <p className="mt-2 text-sm text-gray-600">{error.message}</p>
        <button
          onClick={reset}
          className="mt-4 px-4 py-2 rounded-xl bg-[#4F7C6D] text-white text-sm font-semibold hover:opacity-90"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
