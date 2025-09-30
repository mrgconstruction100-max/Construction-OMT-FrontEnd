
import { Plus, User, Phone, Mail, Calendar, Building, Edit, Trash2,ListFilter,X, Filter } from 'lucide-react';

import React, { useState, useEffect } from "react";
import styles from "./Filter.module.scss";
import DateSelect from '../ui/DateSelect';
import Select from "react-select";
import { Button } from '../ui/button';


function FilterComp({ fields = [], onApplyFilters, initialValues = {} }) {
  const [showFilter, setShowFilter] = useState(false);
  const [filterValues, setFilterValues] = useState(initialValues);

  // Update internal state when initialValues change (e.g., when filters are cleared)
  useEffect(() => {
    
    setFilterValues(initialValues);
  }, [initialValues]);

  const handleChange = (name, value) => {
    setFilterValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleApply = () => {
    onApplyFilters(filterValues);
    setShowFilter(false);
  };

  const handleReset = () => {
    const resetValues = {};
    fields.forEach((f) => {
      resetValues[f.name] =(f.type === "startDate" || f.type === "endDate") ? null : "";
    });
    setFilterValues(resetValues);
    onApplyFilters(resetValues);
  };

  const handleClose = () => {
    // Reset to initial values when closing without applying
    setFilterValues(initialValues);
    setShowFilter(false);
  };

  return (
    <div className={styles.filterWrapper}>
      <Button  variant="outline" className="flex items-center gap-2 flex-1" onClick={() => setShowFilter(!showFilter)}>
        <Filter className="w-4 h-4" />Filter</Button>

      {showFilter && (
        <div className={styles.filterBox}>
            <div className={styles.header}>
               <h3>Filters</h3>
               <button className={styles.closeButton} onClick={handleClose}><X size={20} /></button>
                </div>
          
        <div className={styles.form}>
          {fields.map((field) => (
            <div className={styles.field} key={field.name}>
              <label>{field.label}</label>

              {field.type === "startDate" && (
            
                <DateSelect
                    label=""
                    value={filterValues[field.name]}
                    onChange={(value) => handleChange(field.name, value)}
                    
                    
                    />
              )}
              {field.type === "endDate" && (
                <DateSelect
                    label=""
                    value={filterValues[field.name]}
                    onChange={(value) => handleChange(field.name, value)}
                    min={filterValues.startDate}
                    
                    />
              )}

              <div className={styles.number}>
  {field.type === "initialNumber" && (
    <span>
      <input
        type="number"
        value={filterValues[field.name] ?? ""} // Use nullish coalescing to ensure never undefined
        placeholder="Min Age"
        onChange={(e) => {
          const value = e.target.value ? Number(e.target.value) : "";
          handleChange(field.name, value);
        }}
        min={0} // age can't be negative
      />
    </span>
  )}

  {field.type === "finalNumber" && (
    <span>
      <input
        type="number"
        placeholder="Max Age"
        value={filterValues[field.name] ?? ""} // Use nullish coalescing to ensure never undefined
        onChange={(e) => {
          let value = e.target.value ? Number(e.target.value) : "";

          // 🚫 Prevent negative values
          if (value < 0) value = 0;

          // 🚫 Prevent less than initialNumber
          if (
            filterValues.initialNumber !== "" &&
            value !== "" &&
            value < filterValues.initialNumber
          ) {
            value = filterValues.initialNumber;
          }

          handleChange(field.name, value);
        }}
        min={filterValues.initialNumber !== "" ? filterValues.initialNumber : 0}
      />
    </span>
  )}
</div>
              {field.type === "select" && (
                    <Select
                      isClearable
                      options={field.options.map((opt) => ({ value: opt, label: opt }))}
                      value={
                        filterValues[field.name]
                          ? { value: filterValues[field.name], label: filterValues[field.name] }
                          : null
                      }
                      onChange={(selected) =>
                        handleChange(field.name, selected ? selected.value : "")
                      }
                      placeholder={`Select ${field.label}`}
                      className={styles.singleSelectDropdown}
                    />
                  )}

              {field.type === "text" && (
                <input
                  type="text"
                  value={filterValues[field.name]}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                />
              )}

              {field.type === "multiselect" && (
              <Select
                    isMulti
                    options={field.options.map((opt) => ({ value: opt, label: opt }))}
                    value={(filterValues[field.name] || []).map((v) => ({
                      value: v,
                      label: v,
                    }))}
                    onChange={(selected) =>
                      handleChange(
                        field.name,
                        selected ? selected.map((s) => s.value) : []
                      )
                    }
                    placeholder="Select members..."
                    className={styles.multiSelectDropdown}
                  />
              )}
            </div>
            
          ))}
        </div>
          <div className={styles.actions}>
            <button className={styles.resetBtn} onClick={handleReset}>Reset</button>
            <button className={styles.applyBtn} onClick={handleApply}>Apply</button>
          </div>
        </div>
        
      )}
    </div>
  );
}
export default FilterComp