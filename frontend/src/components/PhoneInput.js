import React, { useState, useEffect, useRef } from 'react';
import { Phone, Check, Search, ChevronDown, X, AlertCircle } from 'lucide-react';
import { countries } from '../utils/countries';

/**
 * Professional Phone Number Input Component with Country Code Selection
 *
 * Features:
 * - Searchable country code dropdown with flags
 * - Real-time phone number validation
 * - Auto-formatting as user types
 * - Dark mode support
 * - Accessibility compliant
 * - Discord/HoP inspired design
 *
 * @param {Object} props
 * @param {Object} props.value - { countryCode: "+1", phone: "5551234567" }
 * @param {Function} props.onChange - (value) => {}
 * @param {boolean} props.darkMode - Dark mode toggle
 * @param {string} props.error - Error message to display
 * @param {boolean} props.disabled - Disable input
 */
function PhoneInput({ value = { countryCode: '+1', phone: '' }, onChange, darkMode = false, error = '', disabled = false }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isValid, setIsValid] = useState(null);
  const [isFocused, setIsFocused] = useState(false);

  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  // Initialize selected country and phone from value prop
  useEffect(() => {
    if (value.countryCode) {
      const country = countries.find(c => c.code === value.countryCode);
      setSelectedCountry(country || countries.find(c => c.code === '+1')); // Default to US
    } else {
      setSelectedCountry(countries.find(c => c.code === '+1')); // Default to US
    }

    if (value.phone) {
      setPhoneNumber(value.phone);
    }
  }, [value.countryCode, value.phone]);

  // Filter countries based on search query
  const filteredCountries = countries.filter(country => {
    const query = searchQuery.toLowerCase();
    return (
      country.name.toLowerCase().includes(query) ||
      country.code.includes(query) ||
      country.iso.toLowerCase().includes(query)
    );
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
        setSearchQuery('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isDropdownOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isDropdownOpen]);

  // Validate phone number (6-15 digits)
  useEffect(() => {
    if (phoneNumber === '') {
      setIsValid(null);
      return;
    }

    // Remove all non-digit characters for validation
    const digitsOnly = phoneNumber.replace(/\D/g, '');
    const isValidLength = digitsOnly.length >= 6 && digitsOnly.length <= 15;
    setIsValid(isValidLength);
  }, [phoneNumber]);

  // Format phone number as user types
  const formatPhoneNumber = (input) => {
    // Remove all non-digit characters
    const digitsOnly = input.replace(/\D/g, '');

    // Limit to 15 digits
    const limited = digitsOnly.slice(0, 15);

    // Format based on length (simple formatting with spaces)
    if (limited.length <= 3) {
      return limited;
    } else if (limited.length <= 6) {
      return `${limited.slice(0, 3)} ${limited.slice(3)}`;
    } else if (limited.length <= 10) {
      return `${limited.slice(0, 3)} ${limited.slice(3, 6)} ${limited.slice(6)}`;
    } else {
      return `${limited.slice(0, 3)} ${limited.slice(3, 6)} ${limited.slice(6, 10)} ${limited.slice(10)}`;
    }
  };

  const handleCountrySelect = (country) => {
    setSelectedCountry(country);
    setIsDropdownOpen(false);
    setSearchQuery('');

    // Notify parent component
    if (onChange) {
      onChange({
        countryCode: country.code,
        phone: phoneNumber.replace(/\D/g, '') // Send digits only
      });
    }
  };

  const handlePhoneChange = (e) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhoneNumber(formatted);

    // Notify parent component
    if (onChange && selectedCountry) {
      onChange({
        countryCode: selectedCountry.code,
        phone: formatted.replace(/\D/g, '') // Send digits only
      });
    }
  };

  const handleDropdownToggle = () => {
    if (!disabled) {
      setIsDropdownOpen(!isDropdownOpen);
      setSearchQuery('');
    }
  };

  const getInputBorderColor = () => {
    if (error) return '#ef4444';
    if (phoneNumber === '' || !isFocused) {
      return darkMode ? '#2a2a3e' : '#e5e7eb';
    }
    return isValid ? '#10b981' : '#ef4444';
  };

  const getValidationIcon = () => {
    if (phoneNumber === '' || isValid === null) return null;
    if (isValid) {
      return <Check size={20} color="#10b981" />;
    }
    return <X size={20} color="#ef4444" />;
  };

  return (
    <>
      <style>{phoneInputAnimations}</style>

      <div style={styles.container}>
        {/* Label */}
        <label
          style={{
            ...styles.label,
            color: darkMode ? '#9ca3af' : '#6b7280',
          }}
          htmlFor="phone-input"
        >
          <Phone size={18} color="#10b981" />
          <span>Phone Number</span>
        </label>

        {/* Input Wrapper */}
        <div style={{
          ...styles.inputWrapper,
          border: `2px solid ${getInputBorderColor()}`,
          background: darkMode ? '#0f0f1a' : '#ffffff',
        }}>
          {/* Country Code Dropdown */}
          <div ref={dropdownRef} style={styles.dropdownContainer}>
            <button
              type="button"
              onClick={handleDropdownToggle}
              disabled={disabled}
              style={{
                ...styles.dropdownButton,
                background: darkMode ? '#1a1a2e' : '#f9fafb',
                color: darkMode ? '#e5e7eb' : '#1f2937',
                cursor: disabled ? 'not-allowed' : 'pointer',
                opacity: disabled ? 0.5 : 1,
              }}
              className={!disabled ? 'clickable' : ''}
              aria-haspopup="listbox"
              aria-expanded={isDropdownOpen}
              aria-label="Select country code"
            >
              {selectedCountry && (
                <>
                  <span style={styles.flag}>{selectedCountry.flag}</span>
                  <span style={styles.countryCode}>{selectedCountry.code}</span>
                </>
              )}
              <ChevronDown
                size={16}
                style={{
                  transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0)',
                  transition: 'transform 0.3s ease',
                }}
              />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div
                style={{
                  ...styles.dropdownMenu,
                  background: darkMode ? '#1a1a2e' : '#ffffff',
                  border: darkMode ? '2px solid #2a2a3e' : '2px solid #e5e7eb',
                }}
                className="slide-in-dropdown"
                role="listbox"
              >
                {/* Search Input */}
                <div style={styles.searchContainer}>
                  <Search size={18} color="#6b7280" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search country..."
                    style={{
                      ...styles.searchInput,
                      background: darkMode ? '#0f0f1a' : '#f9fafb',
                      color: darkMode ? '#e5e7eb' : '#1f2937',
                    }}
                    aria-label="Search countries"
                  />
                </div>

                {/* Country List */}
                <div style={styles.countryList}>
                  {filteredCountries.length > 0 ? (
                    filteredCountries.map((country) => (
                      <button
                        key={country.iso}
                        type="button"
                        onClick={() => handleCountrySelect(country)}
                        style={{
                          ...styles.countryItem,
                          background: selectedCountry?.iso === country.iso
                            ? darkMode ? '#10b98120' : '#10b98110'
                            : 'transparent',
                          color: darkMode ? '#e5e7eb' : '#1f2937',
                        }}
                        className="country-item-hover"
                        role="option"
                        aria-selected={selectedCountry?.iso === country.iso}
                      >
                        <span style={styles.flag}>{country.flag}</span>
                        <span style={styles.countryName}>{country.name}</span>
                        <span style={{
                          ...styles.countryCodeSmall,
                          color: darkMode ? '#9ca3af' : '#6b7280',
                        }}>
                          {country.code}
                        </span>
                        {selectedCountry?.iso === country.iso && (
                          <Check size={18} color="#10b981" />
                        )}
                      </button>
                    ))
                  ) : (
                    <div style={{
                      ...styles.noResults,
                      color: darkMode ? '#9ca3af' : '#6b7280',
                    }}>
                      <AlertCircle size={20} />
                      <span>No countries found</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Phone Number Input */}
          <input
            id="phone-input"
            type="tel"
            value={phoneNumber}
            onChange={handlePhoneChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="555 123 4567"
            disabled={disabled}
            style={{
              ...styles.phoneInput,
              color: darkMode ? '#e5e7eb' : '#1f2937',
              cursor: disabled ? 'not-allowed' : 'text',
              opacity: disabled ? 0.5 : 1,
            }}
            aria-label="Phone number"
            aria-invalid={!!error || (isValid === false)}
            aria-describedby={error ? 'phone-error' : undefined}
          />

          {/* Validation Icon */}
          <div style={styles.validationIcon}>
            {getValidationIcon()}
          </div>
        </div>

        {/* Validation Message */}
        {!error && phoneNumber !== '' && isValid === false && (
          <div style={styles.validationMessage} className="error-shake">
            <X size={16} color="#ef4444" />
            <span style={{ color: '#ef4444' }}>
              Phone number must be between 6-15 digits
            </span>
          </div>
        )}

        {/* Success Message */}
        {!error && isValid && phoneNumber !== '' && (
          <div style={styles.validationMessage}>
            <Check size={16} color="#10b981" />
            <span style={{ color: '#10b981' }}>
              Valid phone number
            </span>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div
            id="phone-error"
            style={styles.validationMessage}
            className="error-shake"
            role="alert"
          >
            <AlertCircle size={16} color="#ef4444" />
            <span style={{ color: '#ef4444' }}>{error}</span>
          </div>
        )}

        {/* Helper Text */}
        {!error && phoneNumber === '' && (
          <div style={{
            ...styles.helperText,
            color: darkMode ? '#6b7280' : '#9ca3af',
          }}>
            Enter your phone number with country code
          </div>
        )}
      </div>
    </>
  );
}

const phoneInputAnimations = `
  .clickable {
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .clickable:hover {
    opacity: 0.9;
    transform: scale(1.02);
  }

  .slide-in-dropdown {
    animation: slideInDropdown 0.3s ease forwards;
  }

  @keyframes slideInDropdown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .country-item-hover {
    transition: all 0.2s ease;
  }

  .country-item-hover:hover {
    background: rgba(16, 185, 129, 0.15) !important;
    transform: translateX(4px);
  }

  .error-shake {
    animation: shake 0.5s ease;
  }

  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-8px); }
    75% { transform: translateX(8px); }
  }
`;

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    width: '100%',
  },
  label: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.9rem',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  inputWrapper: {
    display: 'flex',
    alignItems: 'center',
    borderRadius: '12px',
    overflow: 'hidden',
    transition: 'all 0.3s ease',
    position: 'relative',
  },
  dropdownContainer: {
    position: 'relative',
    flexShrink: 0,
  },
  dropdownButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.875rem 1rem',
    border: 'none',
    borderRight: '2px solid rgba(107, 114, 128, 0.2)',
    fontSize: '1rem',
    fontWeight: '600',
    transition: 'all 0.3s ease',
    minWidth: '120px',
    justifyContent: 'space-between',
  },
  flag: {
    fontSize: '1.5rem',
    lineHeight: 1,
  },
  countryCode: {
    fontSize: '1rem',
    fontWeight: '700',
  },
  dropdownMenu: {
    position: 'absolute',
    top: 'calc(100% + 8px)',
    left: 0,
    width: '320px',
    maxHeight: '400px',
    borderRadius: '12px',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.2)',
    zIndex: 1000,
    display: 'flex',
    flexDirection: 'column',
  },
  searchContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '1rem',
    borderBottom: '1px solid rgba(107, 114, 128, 0.2)',
  },
  searchInput: {
    flex: 1,
    padding: '0.5rem 0.75rem',
    border: 'none',
    borderRadius: '8px',
    fontSize: '0.95rem',
    outline: 'none',
    transition: 'all 0.3s ease',
  },
  countryList: {
    overflowY: 'auto',
    maxHeight: '320px',
    padding: '0.5rem',
  },
  countryItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    width: '100%',
    padding: '0.875rem 1rem',
    border: 'none',
    borderRadius: '8px',
    fontSize: '0.95rem',
    fontWeight: '500',
    textAlign: 'left',
    cursor: 'pointer',
  },
  countryName: {
    flex: 1,
    fontSize: '0.95rem',
  },
  countryCodeSmall: {
    fontSize: '0.85rem',
    fontWeight: '600',
  },
  noResults: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    padding: '2rem 1rem',
    fontSize: '0.95rem',
    fontWeight: '500',
  },
  phoneInput: {
    flex: 1,
    padding: '0.875rem 3rem 0.875rem 1rem',
    border: 'none',
    background: 'transparent',
    fontSize: '1rem',
    fontWeight: '500',
    outline: 'none',
    fontFamily: 'inherit',
  },
  validationIcon: {
    position: 'absolute',
    right: '1rem',
    top: '50%',
    transform: 'translateY(-50%)',
    display: 'flex',
    alignItems: 'center',
    pointerEvents: 'none',
  },
  validationMessage: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.875rem',
    fontWeight: '500',
    marginTop: '-0.25rem',
  },
  helperText: {
    fontSize: '0.85rem',
    marginTop: '-0.25rem',
  },
};

export default PhoneInput;
