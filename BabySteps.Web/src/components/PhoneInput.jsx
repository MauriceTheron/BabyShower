const COUNTRIES = [
  { code: '+27', label: 'ZA', name: 'South Africa' },
  { code: '+1', label: 'US', name: 'United States' },
  { code: '+44', label: 'GB', name: 'United Kingdom' },
  { code: '+61', label: 'AU', name: 'Australia' },
  { code: '+64', label: 'NZ', name: 'New Zealand' },
  { code: '+49', label: 'DE', name: 'Germany' },
  { code: '+33', label: 'FR', name: 'France' },
  { code: '+31', label: 'NL', name: 'Netherlands' },
  { code: '+34', label: 'ES', name: 'Spain' },
  { code: '+39', label: 'IT', name: 'Italy' },
  { code: '+55', label: 'BR', name: 'Brazil' },
  { code: '+91', label: 'IN', name: 'India' },
  { code: '+86', label: 'CN', name: 'China' },
  { code: '+81', label: 'JP', name: 'Japan' },
  { code: '+82', label: 'KR', name: 'South Korea' },
  { code: '+971', label: 'AE', name: 'UAE' },
  { code: '+966', label: 'SA', name: 'Saudi Arabia' },
  { code: '+254', label: 'KE', name: 'Kenya' },
  { code: '+234', label: 'NG', name: 'Nigeria' },
  { code: '+20', label: 'EG', name: 'Egypt' },
  { code: '+263', label: 'ZW', name: 'Zimbabwe' },
  { code: '+260', label: 'ZM', name: 'Zambia' },
  { code: '+267', label: 'BW', name: 'Botswana' },
  { code: '+264', label: 'NA', name: 'Namibia' },
  { code: '+258', label: 'MZ', name: 'Mozambique' },
];

export default function PhoneInput({ value, countryCode, onValueChange, onCountryChange }) {
  return (
    <div className="flex gap-2">
      <select
        value={countryCode}
        onChange={e => onCountryChange(e.target.value)}
        className="border border-gray-200 rounded-2xl px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-header/30 bg-white w-28 flex-shrink-0"
      >
        {COUNTRIES.map(c => (
          <option key={c.code} value={c.code}>
            {c.label} {c.code}
          </option>
        ))}
      </select>
      <input
        type="tel"
        value={value}
        onChange={e => onValueChange(e.target.value)}
        placeholder="Phone number"
        required
        className="flex-1 border border-gray-200 rounded-2xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-header/30 bg-white"
      />
    </div>
  );
}
