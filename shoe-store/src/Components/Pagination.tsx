// This component holds no state of its own — it's told the current page and
// reports page changes back up via `onPageChange`. The parent page (e.g.
// Home.tsx) is the one that actually owns `currentPage` in a useState call.
interface PaginationProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

const Pagination = ({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
}: PaginationProps) => {
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const pages: number[] = [];

  for (let i = 1; i <= totalPages; i++) pages.push(i);

  // Nothing to paginate — don't render any controls at all.
  if (totalPages === 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 mt-6 pb-6 font-semibold">
      <button onClick={() => onPageChange(Math.max(1, currentPage -1))}
        className="px-3 py-1 rounded-md cursor-pointer shadow-lg"
        disabled={currentPage === 1}
        >Prev</button>


      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className={`px-3 py-1 rounded-md cursor-pointer shadow-lg ${p === currentPage ? "bg-red-500 text-white" : ""}`}
        >
          {p}
        </button>
      ))}
      <button
      onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
      className="px-3 py-1 rounded-md cursor-pointer shadow-lg"
      disabled={currentPage === totalPages}
      >Next</button>
    </div>
  );
};

export default Pagination;
