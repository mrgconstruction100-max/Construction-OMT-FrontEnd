import React from 'react';
import styles from './FilterStatus.module.scss';

const FilterStatus = ({ 
  activeFilters, 
  onClearFilter, 
  onClearAll,
  filterConfig = {} // Optional configuration for custom labels and formatting
}) => {
  if (!activeFilters || Object.keys(activeFilters).length === 0) {
    return null;
  }

  // Default filter label mappings
  const defaultLabels = {
    status: 'Status',
    startDate: 'From',
    endDate: 'To',
    task: 'Task',
    project: 'Project',
    place: 'Place',
    phase: 'Phase',
    member: 'Member',
    location: 'Location',
    projectManager:"Project Manager",
    client:"Client"
    // Add more default mappings as needed
  };

  // Default value formatters
  const defaultFormatters = {
    date: (value) => new Date(value).toLocaleDateString(),
    array: (value) => Array.isArray(value) ? value.join(', ') : value,
    // Add more default formatters as needed
  };

  // Merge with custom config
  const labels = { ...defaultLabels, ...filterConfig.labels };
  const formatters = { ...defaultFormatters, ...filterConfig.formatters };

  const formatFilterValue = (key, value) => {
    // Use custom formatter if specified in config
    if (filterConfig.fieldTypes && filterConfig.fieldTypes[key]) {
      const fieldType = filterConfig.fieldTypes[key];
      if (formatters[fieldType]) {
        return formatters[fieldType](value);
      }
    }
    
    // Default formatting logic
    if (Array.isArray(value)) {
      return value.join(', ');
    }
    if (key === 'startDate' || key === 'endDate') {
      return new Date(value).toLocaleDateString();
    }
    return value;
  };

  const getFilterLabel = (key) => {
    return labels[key] || key;
  };

  return (
    <div className={styles.filterStatus} >
      <div className={styles.filterStatusHeader}>
        <span>Active Filters:</span>
        <button onClick={onClearAll} className={styles.clearAllButton}>
          Clear All
        </button>
      </div>
      <div className={styles.filterTags}>
        {Object.entries(activeFilters).map(([key, value]) => (
          <span key={key} className={styles.filterTag}>
            <span className={styles.filterLabel}>{getFilterLabel(key)}: </span>
            <span className={styles.filterValue}>{formatFilterValue(key, value)}</span>
            <button 
              onClick={() => onClearFilter(key)} 
              className={styles.clearFilterButton}
              aria-label={`Clear ${getFilterLabel(key)} filter`}
            >
              ×
            </button>
          </span>
        ))}
      </div>
    </div>
  );
};

export default FilterStatus;