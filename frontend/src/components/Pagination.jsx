export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (!totalPages || totalPages <= 1) {
    return totalPages === 1 ? (
      <div className="pagination" aria-label="Pagination">
        <button className="pagination-btn active" disabled>1</button>
        <span className="pagination-label">Page 1 of 1</span>
      </div>
    ) : null;
  }

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <div className="pagination" aria-label="Pagination">
      <button
        className="pagination-btn"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        ← Prev
      </button>

      {pages.map((page) => (
        <button
          key={page}
          className={`pagination-btn${currentPage === page ? " active" : ""}`}
          aria-current={currentPage === page ? "page" : undefined}
          onClick={() => onPageChange(page)}
        >
          {page}
        </button>
      ))}

      <button
        className="pagination-btn"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        Next →
      </button>

      <span className="pagination-label">Page {currentPage} of {totalPages}</span>
    </div>
  );
}
