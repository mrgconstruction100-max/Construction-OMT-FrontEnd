
import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    getPaginationRowModel,
    getFilteredRowModel,
    flexRender,
} from '@tanstack/react-table';
import './DataTable.scss';
import React, { useState } from 'react';
import { Button } from '../ui/button';
import { X } from 'lucide-react';

function DataTable({ data, columns, globalFilter, onGlobalFilterChange, onRowClick }) {
    const [columnVisibility, setColumnVisibility] = useState({});
    const [columnOrder, setColumnOrder] = useState(columns.map(col => col.accessorKey || col.id));
    const [dragOverIndex, setDragOverIndex] = useState(null);
    const [showColumnPanel, setShowColumnPanel] = useState(false); // 🔹 Toggle state
    const [pageSize, setPageSize] = useState('');
    
    const table = useReactTable({
        data,
        columns,
        // columnResizeMode: 'onChange',
        state: {
            globalFilter, columnVisibility, columnOrder
        },
        onGlobalFilterChange,
        onColumnVisibilityChange: setColumnVisibility,
        onColumnOrderChange: setColumnOrder,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        initialState: {
            pagination: { pageSize: 50 },
        },
    });
    const handleDragStart = (e, index) => {
    e.dataTransfer.setData('colIndex', index);
    e.currentTarget.classList.add('dragging');
  };

  const handleDragEnd = (e) => {
    e.currentTarget.classList.remove('dragging');
    setDragOverIndex(null);
  };

  const handleDrop = (e, index) => {
    const draggedFrom = e.dataTransfer.getData('colIndex');
    if (draggedFrom === '') return;
    const newOrder = [...columnOrder];
    const [moved] = newOrder.splice(draggedFrom, 1);
    newOrder.splice(index, 0, moved);
    setColumnOrder(newOrder);
    setDragOverIndex(null);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };
  // --- Reset columns to default order and visibility ---
    const handleResetColumns = () => {
        setColumnVisibility({});
        setColumnOrder(columns.map(col => col.accessorKey || col.id));
    };
    
    return (
        <div className="data-table">
        {/* Toggle Button */}
                <div className='flex gap-4'>
                <Button onClick={() => setShowColumnPanel(prev => !prev)} >
                     {showColumnPanel ? 'Hide Columns' : 'Manage Columns'}
                </Button>
                <Button variant="secondary" onClick={handleResetColumns} >
                      Reset Columns
                </Button>
                </div>
                <div className={`column-toggle-panel ${showColumnPanel ? 'active' : ''}`}>
                    <div className="panel-header">
                            <h4>Manage Columns</h4>
                            <button
                        className="close-btn"
                        onClick={() => setShowColumnPanel(false)}
                        aria-label="Close column manager"
                    >
                        <X size={18} />
                    </button>
                    </div>
                
                <ul className="column-list">
                    {columnOrder.map((colId, index) => {
                    const column = table.getAllLeafColumns().find(c => c.id === colId);
                    if (!column) return null;
                    const isDragOver = dragOverIndex === index;

                    return (
                        <li
                        key={colId}
                        draggable
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragEnd={handleDragEnd}
                        onDrop={(e) => handleDrop(e, index)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDragLeave={handleDragLeave}
                        className={`draggable-column ${isDragOver ? 'drag-over' : ''}`}
                        >
                        <input
                            type="checkbox"
                            checked={column.getIsVisible()}
                            onChange={column.getToggleVisibilityHandler()}
                        />
                        <span className="column-name">{column.columnDef.header}</span>
                        <span className="drag-icon">☰</span>
                        </li>
                    );
                    })}
                </ul>
                  {/* --- Reset Button --- */}
                <div className="reset-section">
                    <Button variant="secondary" onClick={handleResetColumns}>
                        Reset Columns
                    </Button>
                </div>
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
                     <select
                            value={table.getState().pagination.pageSize}
                            onChange={(e) => {table.setPageSize(Number(e.target.value));setPageSize(e.target.value)}}
                        >
                            {[10, 25, 50, 100].map(size => (
                            <option key={size} value={size}>
                                Show {size}
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
 

            <div className="table-wrapper " >
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
                                        // style={{ width: header.getSize(), position: 'relative' }}
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
                                        {/* {header.column.getCanResize() && (
                                        <div
                                            onMouseDown={(e) => {
                                            e.stopPropagation();
                                            e.preventDefault();
                                            header.getResizeHandler()(e);
                                            }}
                                            onClick={(e) => e.stopPropagation()}
                                            onTouchStart={(e) => {
                                            e.stopPropagation();
                                            header.getResizeHandler()(e);
                                            }}
                                            className="resizer"
                                            style={{
                                            right: 0,
                                            top: 0,
                                            bottom: 0,
                                            width: '15px',
                                            position: 'absolute',
                                            cursor: 'col-resize',
                                            userSelect: 'none',
                                            touchAction: 'none',
                                            zIndex: 10,
                                            }}
                                            />)} */}
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
                                    // <td key={cell.id}  style={{ width: cell.column.getSize() }}>
                                    <td key={cell.id}>
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
             {
             pageSize>10&&
                        
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
                     <select
                            value={table.getState().pagination.pageSize}
                            onChange={(e) => table.setPageSize(Number(e.target.value))}
                        >
                            {[10, 25, 50, 100].map(size => (
                            <option key={size} value={size}>
                                Show {size}
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
            }
            

        </div>
    );
}

export default DataTable;

