

// ReportDownloader.jsx
import React, { useState } from "react";
import { saveAs } from "file-saver";
import { Download, FileSpreadsheet, FileText, FileDown } from "lucide-react";
import styles from "./ReportDownloader.module.scss";

const getValueByPath = (obj, path) => {
  const value = path.split(".").reduce((acc, key) => {
    if (Array.isArray(acc)) {
      return acc.map(item => item?.[key]).filter(Boolean).join(", ");
    }
    return acc?.[key];
  }, obj);
  return value || "";
};

export default function ReportDownloader({ data, title = "Report", columns }) {
  const [open, setOpen] = useState(false);

  // ================= CSV DOWNLOAD =================

  const downloadCSV = () => {
  const headers = ["S.No.", ...columns.map(c => c.header.toUpperCase())];

  const rows = data.map((row, index) => {
    const rowValues = columns.map(c => {
      let value = getValueByPath(row, c.key) || "";
    // 🗓️ Format date fields (based on column type)
    // Replace your current date formatting block with this:
if (c.type === "date" && value) {
  try {
    let dateObj;

    // Try ISO first (e.g., 2025-10-24)
    if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
      dateObj = new Date(value);
    }
    // Try DD-MM-YYYY
    else if (/^\d{2}-\d{2}-\d{4}/.test(value)) {
      const [day, month, year] = value.split("-");
      dateObj = new Date(`${year}-${month}-${day}`);
    }
    // Try DD/MM/YYYY
    else if (/^\d{1,2}\/\d{1,2}\/\d{4}/.test(value)) {
      const [day, month, year] = value.split("/");
      dateObj = new Date(`${year}-${month}-${day}`);
    }

    if (dateObj && !isNaN(dateObj)) {
      const day = String(dateObj.getDate()).padStart(2, "0");
      const month = String(dateObj.getMonth() + 1).padStart(2, "0");
      const year = dateObj.getFullYear();
      value = `${day}/${month}/${year}`;
    }
  } catch (err) {
    console.error("Date format error:", err);
  }
}

      // 🧹 Clean commas
      const cleanValue =
        typeof value === "string" && value.includes(",")
          ? `"${value}"`
          : value;
      return cleanValue;
    });

    return [index + 1, ...rowValues];
  });
  const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");

  const blob = new Blob(["\uFEFF" + csv], {
    type: "text/csv;charset=utf-8;",
  });
  saveAs(blob, `${title}.csv`);
};


  return (
    <div className={styles.reportDownloader}>
      
        <button className={styles.downloadBtn} onClick={downloadCSV}> 
             <Download size={18} />
        <span>Download Report</span>
        </button>
        
      {/* <button
        className={styles.downloadBtn}
        onClick={() => setOpen(!open)}
      >
        <Download size={18} />
        <span>Download Report</span>
      </button> */}

      {/* {open && (
        <div className={styles.dropdown}>
          <button onClick={downloadCSV}>
            <FileSpreadsheet size={16} />
            CSV Format
          </button>
          <button disabled>
            <FileText size={16} />
            PDF (Coming soon)
          </button>
          <button disabled>
            <FileDown size={16} />
            Excel (Coming soon)
          </button>
        </div>
      )} */}
    </div>
  );
}

