import React, { useRef } from 'react';

const OtpInput = ({ length = 6, value = '', onChange }) => {
    const inputRefs = useRef([]);

    const handleChange = (index, e) => {
        const val = e.target.value;
        if (!/^\d*$/.test(val)) return;

        const newOtp = value.split('');
        newOtp[index] = val.slice(-1);
        const otpString = newOtp.join('');
        onChange(otpString);

        if (val && index < length - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !value[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
        onChange(pasted.padEnd(length, ''));
        const focusIndex = Math.min(pasted.length, length - 1);
        inputRefs.current[focusIndex]?.focus();
    };

    const boxStyle = {
        width: '48px',
        height: '56px',
        textAlign: 'center',
        fontSize: '1.5rem',
        fontWeight: 700,
        borderRadius: '10px',
        border: '1px solid var(--border-color)',
        background: 'var(--bg-tertiary)',
        color: 'var(--text-primary)',
        outline: 'none',
        transition: 'border-color 0.3s, box-shadow 0.3s',
        fontFamily: 'inherit',
        caretColor: 'var(--accent-primary)',
    };

    return (
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
            {Array.from({ length }, (_, i) => (
                <input
                    key={i}
                    ref={(el) => (inputRefs.current[i] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={value[i] || ''}
                    onChange={(e) => handleChange(i, e)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    onPaste={i === 0 ? handlePaste : undefined}
                    style={boxStyle}
                    onFocus={(e) => {
                        e.target.style.borderColor = 'var(--accent-primary)';
                        e.target.style.boxShadow = '0 0 0 3px rgba(197, 160, 40, 0.15)';
                    }}
                    onBlur={(e) => {
                        e.target.style.borderColor = 'var(--border-color)';
                        e.target.style.boxShadow = 'none';
                    }}
                />
            ))}
        </div>
    );
};

export default OtpInput;
