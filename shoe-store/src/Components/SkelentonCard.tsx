// A grey "loading placeholder" shaped like a real ProductCard, shown while
// products are still being fetched (see the `loading` state in Home.tsx /
// CategoryPage.tsx). The pulsing animation comes from Tailwind's
// `animate-pulse` class alone — there's no JS animation here.
const SkelentonCard = () => {
  return (
    <div className="animate-pulse space-y-4">
      <div className="bg-gray-200 rounded-2xl h-48 w-full" />
      <div className="flex items-center justify-between">
        <div className="space-y-2 w-3/4">
          <div className="h-4 bg-gray-200 rounded w-5/6" />
          <div className="h-3 bg-gray-200 rounded w-1/2" />
        </div>
        <div className="h-8 w-8 bg-gray-200 rounded" />
      </div>
    </div>
  );
};

export default SkelentonCard;
