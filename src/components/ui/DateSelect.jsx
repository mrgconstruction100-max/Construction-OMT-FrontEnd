
import styles from './Date.module.scss'
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { enGB } from "date-fns/locale";
export default function DateSelect({
  label,
  value,
  onChange,
  min,
  max,
  required,
  error,
}) {
  const dateValue = value === undefined ? null : value;

  const handleDateChange = (date) => {
    if (!date) {
      onChange(null);
      return;
    }
    const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    onChange(localDate);
  };

  return (
    <div className={styles.datePicker}>
      
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={enGB}>
        <DatePicker
          label={required ? (
              <>
                {label || "Select Date"} <span style={{ color: "red" }}>*</span>
              </>
            ) : (
              label || "Select Date"
            )}
          value={dateValue}
          onChange={handleDateChange}
          minDate={min}
          maxDate={max}
          required={required}
          slotProps={{
            textField: {
              error:Boolean(error),
              InputProps: {
                classes: {
                  root: styles.inputRoot,
                  notchedOutline: styles.notchedOutline,
                },
              },
            },
          }}
        />
      </LocalizationProvider>
      {error && <p className={styles.errorText}>{error}</p>}
    </div>
  );
}
