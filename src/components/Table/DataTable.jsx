
import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    getPaginationRowModel,
    getFilteredRowModel,
    flexRender,
} from '@tanstack/react-table';
import './DataTable.scss';
import React, { useMemo } from 'react';

function DataTable({ data, columns, globalFilter, onGlobalFilterChange, onRowClick }) {
    const table = useReactTable({
        data,
        columns,
        state: {
            globalFilter,
        },
        onGlobalFilterChange,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
    });

    return (
        <div className="data-table">
            <div className="table-wrapper overflow-x-auto">
                <table >
                    <colgroup>
                        {/* ✅ Define column widths for fixed layout */}
                        {columns.map((col, index) => (
                            <col key={index} style={{ width: col.size ? `${col.size}px` : 'auto' }} />
                        ))}
                    </colgroup>
                    <thead>
                        {table.getHeaderGroups().map(headerGroup => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map(header => (
                                    <th 
                                        key={header.id} 
                                        onClick={header.column.getToggleSortingHandler()} 
                                        className={header.column.getCanSort() ? "sortable" : ""}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span>
                                                {flexRender(header.column.columnDef.header, header.getContext())}
                                            </span>
                                            <span className="sort-arrow">
                                                {header.column.getIsSorted() === 'asc' ? '🔼' :
                                                 header.column.getIsSorted() === 'desc' ? '🔽' :
                                                 header.column.getCanSort() ? '↕️' : ''}
                                            </span>
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>

                    <tbody>
                        {table.getRowModel().rows.map(row => (
                            <tr 
                                key={row.id}  
                                onClick={onRowClick ? () => onRowClick(row.original) : undefined}
                                className={onRowClick ? "cursor-pointer hover:bg-gray-50" : ""}
                            >
                                {row.getVisibleCells().map(cell => (
                                    <td key={cell.id}>
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="pagination">
                <button 
                    onClick={() => table.previousPage()} 
                    disabled={!table.getCanPreviousPage()}
                    aria-label="Previous page"
                >
                    ← Previous
                </button>
                
                <div className="pagination-info">
                    <span>
                        Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                    </span>
                    <select
                        value={table.getState().pagination.pageIndex}
                        onChange={(e) => table.setPageIndex(Number(e.target.value))}
                        aria-label="Go to page"
                    >
                        {Array.from({ length: table.getPageCount() }, (_, i) => (
                            <option key={i} value={i}>
                                Page {i + 1}
                            </option>
                        ))}
                    </select>
                </div>
                
                <button 
                    onClick={() => table.nextPage()} 
                    disabled={!table.getCanNextPage()}
                    aria-label="Next page"
                >
                    Next →
                </button>
            </div>
        </div>
    );
}

export default DataTable;
