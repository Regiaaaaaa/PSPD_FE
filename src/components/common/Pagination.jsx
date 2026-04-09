const Pagination = ({ 
  currentPage, 
  totalPages, 
  itemsPerPage, 
  totalItems, 
  onPageChange, 
  onItemsPerPageChange,
  searchTerm,
  onSearchChange
}) => {
  const startIndex = (currentPage - 1) * itemsPerPage;

  return {
    TopControls: () => (
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <select 
            className="select select-bordered select-sm bg-white"
            value={itemsPerPage}
            onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
          >
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
          <span className="text-sm text-gray-600 whitespace-nowrap">Entries per page</span>
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-sm text-gray-600">Search:</span>
          <input
            type="text"
            placeholder="Cari disini..."
            className="input input-bordered input-sm bg-white flex-1 sm:w-64"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>
    ),
    BottomControls: () => (
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 bg-gray-50 border-t border-gray-200">
        <div className="text-sm text-gray-600">
          Showing <span className="font-semibold">{totalItems === 0 ? 0 : startIndex + 1}</span> to <span className="font-semibold">{startIndex + itemsPerPage}</span> of <span className="font-semibold">{totalItems}</span> entries
        </div>
        {totalPages > 1 && (
          <div className="flex gap-2">
            <button 
              className="btn btn-sm" 
              onClick={() => onPageChange(currentPage - 1)} 
              disabled={currentPage === 1}
            >
              Previous
            </button>
            {[...Array(Math.min(5, totalPages))].map((_, i) => {
              let page;
              if (totalPages <= 5) {
                page = i + 1;
              } else if (currentPage <= 3) {
                page = i + 1;
              } else if (currentPage >= totalPages - 2) {
                page = totalPages - 4 + i;
              } else {
                page = currentPage - 2 + i;
              }
              return (
                <button 
                  key={page} 
                  className={`btn btn-sm ${currentPage === page ? 'bg-blue-600 text-white hover:bg-blue-700 border-none' : ''}`} 
                  onClick={() => onPageChange(page)}
                >
                  {page}
                </button>
              );
            })}
            <button 
              className="btn btn-sm" 
              onClick={() => onPageChange(currentPage + 1)} 
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        )}
      </div>
    )
  };
};

export default Pagination;