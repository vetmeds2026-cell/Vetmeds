export default function Loading() {
  return (
    <div className="flex h-[80vh] w-full items-center justify-center bg-gray-50/50">
      <div className="flex flex-col items-center space-y-4">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-gray-200 border-t-[#1b3a34]" />
        <p className="animate-pulse text-lg font-medium text-gray-500">Loading Dashboard...</p>
      </div>
    </div>
  );
}
