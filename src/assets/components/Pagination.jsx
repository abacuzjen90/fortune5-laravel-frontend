import React from 'react';
import { Link } from 'react-router-dom';

export default function Pagination({ dataSize, dataPPage, nPages, currentPage, setCurrentPage }) {
    //const pageNumbers = [...Array(nPages + 1).keys()].slice(1);
    const indexOfLastItem = currentPage * dataPPage;
    const indexOfFirstItem = indexOfLastItem - dataPPage;
    const rangeStart = indexOfFirstItem + 1;
    const rangeEnd = Math.min(indexOfLastItem, dataSize);

    const maxPage = 5;
    const pageNumbers = Array.from(
        { length: nPages },
        (_, index) => index + 1
      );
    
    const renderPageNumbers = () => {
      if (nPages <= maxPage) {
        return pageNumbers;
      }

      const middleIndex = Math.floor(maxPage / 2);
      if (currentPage <= middleIndex) {
        return [
          ...pageNumbers.slice(0, maxPage - 1),
          <label className='cursor-default'>...</label>,
          nPages,
        ];
      } else if (currentPage >= nPages - middleIndex) {
        return [1, <label className='cursor-default'>...</label>, ...pageNumbers.slice(-maxPage + 1)];
      } else {
        const startPage = currentPage - middleIndex + 1;
        const endPage = currentPage + middleIndex - 1;
        return [
          1,
          <label className='cursor-default'>...</label>,
          ...pageNumbers.slice(startPage, endPage),
          <label className='cursor-default'>...</label>,
          nPages,
        ];
      }
    }

    const goToNextPage = () => {
        if(currentPage !== nPages) setCurrentPage(currentPage + 1)}
    const goToPrevPage = () => {
        if(currentPage !== 1) setCurrentPage(currentPage - 1)}
    const goToFirstPage = () => {
      setCurrentPage(1)}
    const goToLastPage = () => {
      setCurrentPage(nPages)}

    return (
      <div className='flex row justify-content-between bg-gray-50 border-b'>
        <div className='p-3 text-sm text-slate-800 w-full'>
        Showing {rangeStart} - {rangeEnd} of {dataSize} items
        </div>  
        <div className='p-3 text-sm text-slate-800'>
            <Link preservescroll='true' className="inline" onClick={goToFirstPage}>
                First
            </Link>
            <Link preservescroll='true' className="inline p-2 px-3" onClick={goToPrevPage}>
                {'<'}
            </Link>
            {renderPageNumbers().map((pageNumber, index) => (
              typeof pageNumber === "number" ? (
                <Link
                  preservescroll="true"
                  key={pageNumber}
                  className={`inline p-2 ${currentPage === pageNumber ? 'active' : ''}`}
                  onClick={() => setCurrentPage(pageNumber)}
                >
                  {pageNumber}
                </Link>
              ) : (
                <span key={`dots-${index}`} className="inline p-2 text-slate-400">...</span>
              )
            ))}
            <Link preservescroll='true' className="inline p-2 px-3" onClick={goToNextPage}>
                {'>'}
            </Link>
            <Link preservescroll='true' className="inline" onClick={goToLastPage}>
                Last
            </Link>
        </div>
      </div>
    )
}