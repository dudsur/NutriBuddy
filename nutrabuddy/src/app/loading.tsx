export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F4F7F5]">
      <div className="text-center">
        <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-[#4F7C6D] border-t-transparent" />
        <p className="mt-4 text-gray-600 font-medium">Loading NutraBuddy...</p>
      </div>
    </div>
  );
}
