import React, { useState, useEffect } from 'react';
import { formatRupiah, parseNumber } from '../utils/format';

const CurrencyInput = ({ value, onChange, className, placeholder, ...props }) => {
  const [displayValue, setDisplayValue] = useState('');

  // Sync external value to display value when it changes from outside
  useEffect(() => {
    if (value === undefined || value === null || value === '') {
      setDisplayValue('');
    } else {
      setDisplayValue(formatRupiah(value));
    }
  }, [value]);

  const handleChange = (e) => {
    // If the user clears the input completely, we handle it as empty
    if (e.target.value === '' || e.target.value === 'Rp ' || e.target.value === 'Rp') {
      setDisplayValue('');
      if (onChange) {
        onChange({ target: { value: '' } });
      }
      return;
    }

    const numVal = parseNumber(e.target.value);
    const formatted = formatRupiah(numVal);
    
    setDisplayValue(formatted);
    
    if (onChange) {
      // Create a synthetic event object to match expected signatures in forms
      onChange({ 
        target: { 
          name: props.name,
          value: numVal 
        } 
      });
    }
  };

  return (
    <input
      type="text"
      className={className}
      value={displayValue}
      onChange={handleChange}
      placeholder={placeholder || 'Rp 0'}
      {...props}
    />
  );
};

export default CurrencyInput;
