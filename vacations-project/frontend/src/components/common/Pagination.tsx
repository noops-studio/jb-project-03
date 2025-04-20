

import { PaginationInfo } from '../../types';

interface PaginationProps {
  pagination: PaginationInfo;
  onPageChange: (page: number) => void;
}

const Pagination = ({ pagination, onPageChange }: PaginationProps) => {
  const { page, totalPages } = pagination;
  
  // Generate page numbers to display
  const pageNumbers = [];
  const maxPagesToShow = 5;
  
  let startPage = Math.max(1, page - Math.floor(maxPagesToShow / 2));
  const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
  
  if (endPage - startPage + 1 < maxPagesToShow) {
    startPage = Math.max(1, endPage - maxPagesToShow + 1);
  }
  
  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }
  
  return (
    <div className="flex justify-center mt-6">
      <nav>
        <ul className="flex space-x-1">
          {/* Previous button */}
          <li>
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page === 1}
              className={`px-3 py-1 rounded ${
                page === 1
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-primary-600 text-white hover:bg-primary-700'
              }`}
            >
              &laquo;
            </button>
          </li>
          
          {/* Page numbers */}
          {pageNumbers.map(pageNum => (
            <li key={pageNum}>
              <button
                onClick={() => onPageChange(pageNum)}
                className={`px-3 py-1 rounded ${
                  pageNum === page
                    ? 'bg-primary-700 text-white'
                    : 'bg-primary-600 text-white hover:bg-primary-700'
                }`}
              >
                {pageNum}
              </button>
            </li>
          ))}
          
          {/* Next button */}
          <li>
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page === totalPages}
              className={`px-3 py-1 rounded ${
                page === totalPages
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-primary-600 text-white hover:bg-primary-700'
              }`}
            >
              &raquo;
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Pagination;
