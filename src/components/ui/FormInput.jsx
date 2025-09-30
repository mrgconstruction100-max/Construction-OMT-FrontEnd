

import React from 'react';
import styles from './FormInput.module.scss';



const FormInput= ({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  error,
  icon,
  multiline = false
}) => {
  return (
    <div className={styles.formInput}>
      <label className={styles.label}>
        {label}
        {required && <span className={styles.required}>*</span>}
      </label>
      <div className={styles.inputWrapper}>
        {icon && <div className={styles.icon}>{icon}</div>}
        {multiline ? (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={`${styles.input} ${styles.textarea} ${icon ? styles.withIcon : ''} ${error ? styles.error : ''}`}
            rows={4}
          />
        ) : (
          <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={`${styles.input} ${icon ? styles.withIcon : ''} ${error ? styles.error : ''}`}
          />
        )}
      </div>
      {error && <span className={styles.errorText}>{error}</span>}
    </div>
  );
};

export default FormInput;
