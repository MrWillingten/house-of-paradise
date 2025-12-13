/**
 * Comprehensive Countries Data Helper
 * Contains country information for phone number country code selection
 * Organized alphabetically (A-Z)
 *
 * phoneLength: [min, max] - Acceptable phone number lengths (excluding country code)
 */

export const countries = [
  { name: "Afghanistan", code: "+93", iso: "AF", flag: "🇦🇫", phoneLength: [9, 9] },
  { name: "Albania", code: "+355", iso: "AL", flag: "🇦🇱", phoneLength: [9, 9] },
  { name: "Algeria", code: "+213", iso: "DZ", flag: "🇩🇿", phoneLength: [9, 9] },
  { name: "Argentina", code: "+54", iso: "AR", flag: "🇦🇷", phoneLength: [10, 11] },
  { name: "Australia", code: "+61", iso: "AU", flag: "🇦🇺", phoneLength: [9, 9] },
  { name: "Austria", code: "+43", iso: "AT", flag: "🇦🇹", phoneLength: [10, 13] },
  { name: "Bahrain", code: "+973", iso: "BH", flag: "🇧🇭", phoneLength: [8, 8] },
  { name: "Bangladesh", code: "+880", iso: "BD", flag: "🇧🇩", phoneLength: [10, 10] },
  { name: "Belgium", code: "+32", iso: "BE", flag: "🇧🇪", phoneLength: [9, 10] },
  { name: "Brazil", code: "+55", iso: "BR", flag: "🇧🇷", phoneLength: [10, 11] },
  { name: "Bulgaria", code: "+359", iso: "BG", flag: "🇧🇬", phoneLength: [9, 9] },
  { name: "Canada", code: "+1", iso: "CA", flag: "🇨🇦", phoneLength: [10, 10] },
  { name: "Chile", code: "+56", iso: "CL", flag: "🇨🇱", phoneLength: [9, 9] },
  { name: "China", code: "+86", iso: "CN", flag: "🇨🇳", phoneLength: [11, 11] },
  { name: "Colombia", code: "+57", iso: "CO", flag: "🇨🇴", phoneLength: [10, 10] },
  { name: "Costa Rica", code: "+506", iso: "CR", flag: "🇨🇷", phoneLength: [8, 8] },
  { name: "Croatia", code: "+385", iso: "HR", flag: "🇭🇷", phoneLength: [9, 10] },
  { name: "Cuba", code: "+53", iso: "CU", flag: "🇨🇺", phoneLength: [8, 8] },
  { name: "Cyprus", code: "+357", iso: "CY", flag: "🇨🇾", phoneLength: [8, 8] },
  { name: "Czech Republic", code: "+420", iso: "CZ", flag: "🇨🇿", phoneLength: [9, 9] },
  { name: "Denmark", code: "+45", iso: "DK", flag: "🇩🇰", phoneLength: [8, 8] },
  { name: "Dominican Republic", code: "+1-809", iso: "DO", flag: "🇩🇴", phoneLength: [10, 10] },
  { name: "Ecuador", code: "+593", iso: "EC", flag: "🇪🇨", phoneLength: [9, 9] },
  { name: "Egypt", code: "+20", iso: "EG", flag: "🇪🇬", phoneLength: [10, 10] },
  { name: "Estonia", code: "+372", iso: "EE", flag: "🇪🇪", phoneLength: [7, 8] },
  { name: "Ethiopia", code: "+251", iso: "ET", flag: "🇪🇹", phoneLength: [9, 9] },
  { name: "Finland", code: "+358", iso: "FI", flag: "🇫🇮", phoneLength: [9, 10] },
  { name: "France", code: "+33", iso: "FR", flag: "🇫🇷", phoneLength: [9, 9] },
  { name: "Germany", code: "+49", iso: "DE", flag: "🇩🇪", phoneLength: [10, 11] },
  { name: "Ghana", code: "+233", iso: "GH", flag: "🇬🇭", phoneLength: [9, 9] },
  { name: "Greece", code: "+30", iso: "GR", flag: "🇬🇷", phoneLength: [10, 10] },
  { name: "Hong Kong", code: "+852", iso: "HK", flag: "🇭🇰", phoneLength: [8, 8] },
  { name: "Hungary", code: "+36", iso: "HU", flag: "🇭🇺", phoneLength: [9, 9] },
  { name: "Iceland", code: "+354", iso: "IS", flag: "🇮🇸", phoneLength: [7, 7] },
  { name: "India", code: "+91", iso: "IN", flag: "🇮🇳", phoneLength: [10, 10] },
  { name: "Indonesia", code: "+62", iso: "ID", flag: "🇮🇩", phoneLength: [10, 12] },
  { name: "Iran", code: "+98", iso: "IR", flag: "🇮🇷", phoneLength: [10, 10] },
  { name: "Iraq", code: "+964", iso: "IQ", flag: "🇮🇶", phoneLength: [10, 10] },
  { name: "Ireland", code: "+353", iso: "IE", flag: "🇮🇪", phoneLength: [9, 9] },
  { name: "Israel", code: "+972", iso: "IL", flag: "🇮🇱", phoneLength: [9, 9] },
  { name: "Italy", code: "+39", iso: "IT", flag: "🇮🇹", phoneLength: [9, 10] },
  { name: "Jamaica", code: "+1-876", iso: "JM", flag: "🇯🇲", phoneLength: [10, 10] },
  { name: "Japan", code: "+81", iso: "JP", flag: "🇯🇵", phoneLength: [10, 10] },
  { name: "Jordan", code: "+962", iso: "JO", flag: "🇯🇴", phoneLength: [9, 9] },
  { name: "Kazakhstan", code: "+7", iso: "KZ", flag: "🇰🇿", phoneLength: [10, 10] },
  { name: "Kenya", code: "+254", iso: "KE", flag: "🇰🇪", phoneLength: [9, 9] },
  { name: "Kuwait", code: "+965", iso: "KW", flag: "🇰🇼", phoneLength: [8, 8] },
  { name: "Latvia", code: "+371", iso: "LV", flag: "🇱🇻", phoneLength: [8, 8] },
  { name: "Lebanon", code: "+961", iso: "LB", flag: "🇱🇧", phoneLength: [7, 8] },
  { name: "Libya", code: "+218", iso: "LY", flag: "🇱🇾", phoneLength: [9, 9] },
  { name: "Lithuania", code: "+370", iso: "LT", flag: "🇱🇹", phoneLength: [8, 8] },
  { name: "Luxembourg", code: "+352", iso: "LU", flag: "🇱🇺", phoneLength: [9, 9] },
  { name: "Malaysia", code: "+60", iso: "MY", flag: "🇲🇾", phoneLength: [9, 10] },
  { name: "Maldives", code: "+960", iso: "MV", flag: "🇲🇻", phoneLength: [7, 7] },
  { name: "Malta", code: "+356", iso: "MT", flag: "🇲🇹", phoneLength: [8, 8] },
  { name: "Mexico", code: "+52", iso: "MX", flag: "🇲🇽", phoneLength: [10, 10] },
  { name: "Monaco", code: "+377", iso: "MC", flag: "🇲🇨", phoneLength: [8, 9] },
  { name: "Morocco", code: "+212", iso: "MA", flag: "🇲🇦", phoneLength: [9, 9] },
  { name: "Nepal", code: "+977", iso: "NP", flag: "🇳🇵", phoneLength: [10, 10] },
  { name: "Netherlands", code: "+31", iso: "NL", flag: "🇳🇱", phoneLength: [9, 9] },
  { name: "New Zealand", code: "+64", iso: "NZ", flag: "🇳🇿", phoneLength: [9, 10] },
  { name: "Nigeria", code: "+234", iso: "NG", flag: "🇳🇬", phoneLength: [10, 10] },
  { name: "Norway", code: "+47", iso: "NO", flag: "🇳🇴", phoneLength: [8, 8] },
  { name: "Oman", code: "+968", iso: "OM", flag: "🇴🇲", phoneLength: [8, 8] },
  { name: "Pakistan", code: "+92", iso: "PK", flag: "🇵🇰", phoneLength: [10, 10] },
  { name: "Palestine", code: "+970", iso: "PS", flag: "🇵🇸", phoneLength: [9, 9] },
  { name: "Panama", code: "+507", iso: "PA", flag: "🇵🇦", phoneLength: [8, 8] },
  { name: "Peru", code: "+51", iso: "PE", flag: "🇵🇪", phoneLength: [9, 9] },
  { name: "Philippines", code: "+63", iso: "PH", flag: "🇵🇭", phoneLength: [10, 10] },
  { name: "Poland", code: "+48", iso: "PL", flag: "🇵🇱", phoneLength: [9, 9] },
  { name: "Portugal", code: "+351", iso: "PT", flag: "🇵🇹", phoneLength: [9, 9] },
  { name: "Qatar", code: "+974", iso: "QA", flag: "🇶🇦", phoneLength: [8, 8] },
  { name: "Romania", code: "+40", iso: "RO", flag: "🇷🇴", phoneLength: [9, 9] },
  { name: "Russia", code: "+7", iso: "RU", flag: "🇷🇺", phoneLength: [10, 10] },
  { name: "Saudi Arabia", code: "+966", iso: "SA", flag: "🇸🇦", phoneLength: [9, 9] },
  { name: "Serbia", code: "+381", iso: "RS", flag: "🇷🇸", phoneLength: [9, 10] },
  { name: "Singapore", code: "+65", iso: "SG", flag: "🇸🇬", phoneLength: [8, 8] },
  { name: "Slovakia", code: "+421", iso: "SK", flag: "🇸🇰", phoneLength: [9, 9] },
  { name: "Slovenia", code: "+386", iso: "SI", flag: "🇸🇮", phoneLength: [8, 8] },
  { name: "South Africa", code: "+27", iso: "ZA", flag: "🇿🇦", phoneLength: [9, 9] },
  { name: "South Korea", code: "+82", iso: "KR", flag: "🇰🇷", phoneLength: [9, 10] },
  { name: "Spain", code: "+34", iso: "ES", flag: "🇪🇸", phoneLength: [9, 9] },
  { name: "Sri Lanka", code: "+94", iso: "LK", flag: "🇱🇰", phoneLength: [9, 9] },
  { name: "Sweden", code: "+46", iso: "SE", flag: "🇸🇪", phoneLength: [9, 10] },
  { name: "Switzerland", code: "+41", iso: "CH", flag: "🇨🇭", phoneLength: [9, 9] },
  { name: "Syria", code: "+963", iso: "SY", flag: "🇸🇾", phoneLength: [9, 9] },
  { name: "Taiwan", code: "+886", iso: "TW", flag: "🇹🇼", phoneLength: [9, 9] },
  { name: "Tanzania", code: "+255", iso: "TZ", flag: "🇹🇿", phoneLength: [9, 9] },
  { name: "Thailand", code: "+66", iso: "TH", flag: "🇹🇭", phoneLength: [9, 9] },
  { name: "Tunisia", code: "+216", iso: "TN", flag: "🇹🇳", phoneLength: [8, 8] },
  { name: "Turkey", code: "+90", iso: "TR", flag: "🇹🇷", phoneLength: [10, 10] },
  { name: "Uganda", code: "+256", iso: "UG", flag: "🇺🇬", phoneLength: [9, 9] },
  { name: "Ukraine", code: "+380", iso: "UA", flag: "🇺🇦", phoneLength: [9, 9] },
  { name: "United Arab Emirates", code: "+971", iso: "AE", flag: "🇦🇪", phoneLength: [9, 9] },
  { name: "United Kingdom", code: "+44", iso: "GB", flag: "🇬🇧", phoneLength: [10, 10] },
  { name: "United States", code: "+1", iso: "US", flag: "🇺🇸", phoneLength: [10, 10] },
  { name: "Uruguay", code: "+598", iso: "UY", flag: "🇺🇾", phoneLength: [8, 9] },
  { name: "Venezuela", code: "+58", iso: "VE", flag: "🇻🇪", phoneLength: [10, 10] },
  { name: "Vietnam", code: "+84", iso: "VN", flag: "🇻🇳", phoneLength: [9, 10] },
  { name: "Yemen", code: "+967", iso: "YE", flag: "🇾🇪", phoneLength: [9, 9] },
  { name: "Zimbabwe", code: "+263", iso: "ZW", flag: "🇿🇼", phoneLength: [9, 9] }
];

/**
 * Validate a phone number for a specific country
 * @param {string} phoneNumber - The phone number (digits only, without country code)
 * @param {object} country - The country object
 * @returns {object} - { valid: boolean, error: string|null }
 */
export const validatePhoneNumber = (phoneNumber, country) => {
  if (!phoneNumber || !country) {
    return { valid: false, error: 'Phone number and country are required' };
  }

  // Remove all non-digit characters
  const digitsOnly = phoneNumber.replace(/\D/g, '');

  // Remove leading zero if present (common in local formats)
  const normalizedNumber = digitsOnly.startsWith('0') ? digitsOnly.slice(1) : digitsOnly;

  if (!normalizedNumber) {
    return { valid: false, error: 'Please enter a valid phone number' };
  }

  const [minLength, maxLength] = country.phoneLength || [7, 15];

  if (normalizedNumber.length < minLength) {
    return {
      valid: false,
      error: `Phone number is too short. ${country.name} numbers should be ${minLength === maxLength ? minLength : `${minLength}-${maxLength}`} digits.`
    };
  }

  if (normalizedNumber.length > maxLength) {
    return {
      valid: false,
      error: `Phone number is too long. ${country.name} numbers should be ${minLength === maxLength ? minLength : `${minLength}-${maxLength}`} digits.`
    };
  }

  return { valid: true, error: null, normalizedNumber };
};

/**
 * Find a country by its phone code
 * @param {string} code - The phone code to search for (e.g., "+1", "+44")
 * @returns {object|undefined} - The country object or undefined if not found
 */
export const getCountryByCode = (code) => {
  return countries.find(country => country.code === code);
};

/**
 * Find a country by its ISO code
 * @param {string} iso - The ISO code to search for (e.g., "US", "GB")
 * @returns {object|undefined} - The country object or undefined if not found
 */
export const getCountryByISO = (iso) => {
  return countries.find(country => country.iso === iso);
};

/**
 * Find a country by its name
 * @param {string} name - The country name to search for
 * @returns {object|undefined} - The country object or undefined if not found
 */
export const getCountryByName = (name) => {
  return countries.find(country => country.name.toLowerCase() === name.toLowerCase());
};

/**
 * Search countries by partial name match
 * @param {string} query - The search query
 * @returns {array} - Array of matching country objects
 */
export const searchCountries = (query) => {
  const lowerQuery = query.toLowerCase();
  return countries.filter(country =>
    country.name.toLowerCase().includes(lowerQuery) ||
    country.code.includes(query) ||
    country.iso.toLowerCase().includes(lowerQuery)
  );
};

/**
 * Get all unique phone codes
 * @returns {array} - Array of unique phone codes
 */
export const getAllPhoneCodes = () => {
  return [...new Set(countries.map(country => country.code))];
};

/**
 * Get countries grouped by continent (simplified grouping)
 * @returns {object} - Object with continent keys and country arrays
 */
export const getCountriesByContinent = () => {
  const continents = {
    Africa: ["DZ", "EG", "ET", "GH", "KE", "LY", "MA", "NG", "ZA", "TZ", "TN", "UG", "ZW"],
    Asia: ["AF", "BH", "BD", "CN", "IN", "ID", "IR", "IQ", "IL", "JP", "JO", "KZ", "KW", "LB", "MY", "MV", "NP", "OM", "PK", "PS", "PH", "QA", "SA", "SG", "KR", "LK", "SY", "TW", "TH", "TR", "AE", "VN", "YE"],
    Europe: ["AL", "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR", "HU", "IS", "IE", "IT", "LV", "LT", "LU", "MT", "MC", "NL", "NO", "PL", "PT", "RO", "RU", "RS", "SK", "SI", "ES", "SE", "CH", "UA", "GB"],
    NorthAmerica: ["CA", "CR", "CU", "DO", "JM", "MX", "PA", "US"],
    SouthAmerica: ["AR", "BR", "CL", "CO", "EC", "PE", "UY", "VE"],
    Oceania: ["AU", "NZ"]
  };

  const grouped = {};
  Object.keys(continents).forEach(continent => {
    grouped[continent] = countries.filter(country =>
      continents[continent].includes(country.iso)
    );
  });

  return grouped;
};

export default countries;
