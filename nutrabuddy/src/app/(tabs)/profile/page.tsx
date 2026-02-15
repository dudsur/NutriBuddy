export default function ProfilePage() {
  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#F4F7F5]">
      <div className="mx-auto w-full max-w-[420px] px-5 pb-24 pt-6 space-y-5">
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-black/5">
          <h2 className="text-2xl font-extrabold text-black">Profile & Settings</h2>
          <p className="text-sm text-gray-500 mt-1">
            Customize your avatar, goals, and accessibility options.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-5 shadow-sm border border-black/5 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-black">Dark Mode</p>
            <span className="text-xs text-gray-500">Later</span>
          </div>
          <div className="h-px bg-black/10" />
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-black">Text Size</p>
            <span className="text-xs text-gray-500">Medium</span>
          </div>
          <div className="h-px bg-black/10" />
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-black">Units</p>
            <span className="text-xs text-gray-500">Metric</span>
          </div>
        </div>
      </div>
    </div>
  );
}