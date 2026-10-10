import STATE_PROFILES from './stateProfiles.json' with { type: 'json' };
import STATE_AUTO_CALC from './stateAutoCalcProfiles.json' with { type: 'json' };

// AAMVA DL/ID Card Design Standard 2025 — Jurisdiction Profiles
// All 50 US states + DC with IIN codes and jurisdiction versions

export const EYE_COLORS = [
  { value: 'BLK', label: 'Black' },
  { value: 'BRO', label: 'Brown' },
  { value: 'BLU', label: 'Blue' },
  { value: 'GRN', label: 'Green' },
  { value: 'GRY', label: 'Gray' },
  { value: 'HAZ', label: 'Hazel' },
  { value: 'MAR', label: 'Maroon' },
  { value: 'PNK', label: 'Pink' },
  { value: 'DIC', label: 'Dichromatic' },
  { value: 'UNK', label: 'Unknown' },
];

export const HAIR_COLORS = [
  { value: 'BLK', label: 'Black' },
  { value: 'BRO', label: 'Brown' },
  { value: 'BLN', label: 'Blonde' },
  { value: 'RED', label: 'Red/Auburn' },
  { value: 'GRY', label: 'Gray' },
  { value: 'WHI', label: 'White' },
  { value: 'SDY', label: 'Sandy' },
  { value: 'BAL', label: 'Bald' },
  { value: 'UNK', label: 'Unknown' },
];

export const SEX_OPTIONS = [
  { value: '1', label: 'Male' },
  { value: '2', label: 'Female' },
  { value: '9', label: 'Not Specified' },
  { value: 'X', label: 'Non-Binary' },
];

export const SUFFIX_OPTIONS = [
  { value: 'JR', label: 'Jr.' },
  { value: 'SR', label: 'Sr.' },
  { value: '1ST', label: 'I' },
  { value: '2ND', label: 'II' },
  { value: '3RD', label: 'III' },
  { value: '4TH', label: 'IV' },
];

// Standard AAMVA field definitions (field ID -> config)
export const STANDARD_FIELDS = {
  DAQ: { fieldId: 'DAQ', label: 'DL Number', name: 'dlNumber', type: 'text', required: true, maxLength: 25, helpText: 'Customer Number / Driver License Number', calculator: true, row: 1 },
  DCS: { fieldId: 'DCS', label: 'Last Name', name: 'lastName', type: 'text', required: true, maxLength: 40, helpText: 'Family Name / Surname', row: 1 },
  DAC: { fieldId: 'DAC', label: 'First Name', name: 'firstName', type: 'text', required: true, maxLength: 40, helpText: 'Given Name(s)', row: 1 },
  DAD: { fieldId: 'DAD', label: 'Middle Name', name: 'middleName', type: 'text', required: false, maxLength: 40, helpText: 'Middle Name(s)', row: 1 },
  DCU: { fieldId: 'DCU', label: 'Name Suffix', name: 'suffix', type: 'select', required: false, options: SUFFIX_OPTIONS, helpText: 'Name suffix', row: 1 },

  DAG: { fieldId: 'DAG', label: 'Address', name: 'address', type: 'text', required: true, maxLength: 40, helpText: 'Street Address', row: 2 },
  DAH: { fieldId: 'DAH', label: 'Address Line 2', name: 'address2', type: 'text', required: false, maxLength: 40, helpText: 'Street Address Line 2', row: 2 },
  DAI: { fieldId: 'DAI', label: 'City', name: 'city', type: 'text', required: true, maxLength: 20, helpText: 'City', row: 2 },
  DAJ: { fieldId: 'DAJ', label: 'State', name: 'state', type: 'text', required: true, maxLength: 2, helpText: 'Jurisdiction (2-letter code)', row: 2, autoFill: 'jurisdiction' },
  DAK: { fieldId: 'DAK', label: 'ZIP Code', name: 'zipCode', type: 'text', required: true, maxLength: 11, helpText: 'Postal Code', validator: 'zipCode', row: 2 },
  DCG: { fieldId: 'DCG', label: 'Country', name: 'country', type: 'text', required: true, maxLength: 3, helpText: 'Country (ISO 3-letter)', row: 2, autoFill: 'country' },

  DCA: { fieldId: 'DCA', label: 'DL Class', name: 'dlClass', type: 'text', required: false, maxLength: 5, helpText: 'Jurisdiction-specific vehicle class', row: 2, jurisdictionSpecific: true },

  DBC: { fieldId: 'DBC', label: 'Sex', name: 'sex', type: 'select', required: true, options: SEX_OPTIONS, helpText: 'Sex code', row: 2 },

  DDK: { fieldId: 'DDK', label: 'Organ Donor', name: 'organDonor', type: 'select', required: false, options: [{ value: '1', label: 'Yes' }, { value: '0', label: 'No' }, { value: 'U', label: 'Unknown' }], helpText: 'Organ donor indicator', row: 2 },

  DBB: { fieldId: 'DBB', label: 'Birth Date', name: 'birthDate', type: 'date', required: true, displayFormat: 'MMDDYYYY', outputFormat: 'MMDDCCYY', validator: 'date', helpText: 'Date of Birth (MMDDYYYY)', calculator: false, row: 3 },
  DBD: { fieldId: 'DBD', label: 'Issue Date', name: 'issueDate', type: 'date', required: true, displayFormat: 'MMDDYYYY', outputFormat: 'MMDDCCYY', validator: 'date', helpText: 'Date of Issue (MMDDYYYY)', row: 3 },
  DBA: { fieldId: 'DBA', label: 'Expiry Date', name: 'expiryDate', type: 'date', required: true, displayFormat: 'MMDDYYYY', outputFormat: 'MMDDCCYY', validator: 'date', helpText: 'Date of Expiration (MMDDYYYY)', row: 3 },

  DDJ: { fieldId: 'DDJ', label: 'Under 21 Until', name: 'under21Until', type: 'date', required: false, displayFormat: 'MMDDYYYY', outputFormat: 'MMDDCCYY', validator: 'date', helpText: 'Date the cardholder turns 21 (MMDDYYYY)', row: 3 },

  DDB: { fieldId: 'DDB', label: 'Card Revision Date', name: 'cardRevisionDate', type: 'date', required: false, displayFormat: 'MMDDYYYY', outputFormat: 'MMDDCCYY', validator: 'date', helpText: 'Card revision date for the selected state profile.', row: 3, autoFill: 'stateRevision' },

  DCK: { fieldId: 'DCK', label: 'ICN', name: 'icn', type: 'text', required: false, maxLength: 25, helpText: 'Inventory Control Number', calculator: true, row: 3, jurisdictionSpecific: true },
  DCF: { fieldId: 'DCF', label: 'DD / Document Discriminator', name: 'dd', type: 'text', required: false, maxLength: 25, helpText: 'Document Discriminator', calculator: true, row: 3, jurisdictionSpecific: true },

  DCB: { fieldId: 'DCB', label: 'Restrictions', name: 'restrictions', type: 'text', required: false, maxLength: 12, helpText: 'Jurisdiction-specific restriction codes', row: 4, jurisdictionSpecific: true },

  DCD: { fieldId: 'DCD', label: 'Endorsement', name: 'endorsement', type: 'text', required: false, maxLength: 5, helpText: 'Jurisdiction-specific endorsement codes', row: 4, jurisdictionSpecific: true },

  DCE: { fieldId: 'DCE', label: 'Weight Range', name: 'weightRange', type: 'select', required: false, options: Array.from({ length: 10 }, (_, value) => ({ value: String(value), label: `${value} (${['up to 70 lb', '71-100 lb', '101-130 lb', '131-160 lb', '161-190 lb', '191-220 lb', '221-250 lb', '251-280 lb', '281-320 lb', '321+ lb'][value]})` })), helpText: 'ANSI D-20 weight range code based on the cardholder weight.', row: 4 },

  DAU: { fieldId: 'DAU', label: 'Height', name: 'height', type: 'number', required: false, unit: 'in', min: 36, max: 96, helpText: 'Height in inches (encoded with unit, e.g. 069 IN)', validator: 'height', row: 4 },

  DAW: { fieldId: 'DAW', label: 'Weight', name: 'weight', type: 'number', required: false, unit: 'lb', min: 50, max: 500, helpText: 'Weight in pounds (e.g. 169)', validator: 'weight', row: 4 },

  DAY: { fieldId: 'DAY', label: 'Eye Color', name: 'eyeColor', type: 'select', required: false, options: EYE_COLORS, helpText: 'Eye Color (ANSI D-20)', row: 4 },
  DAZ: { fieldId: 'DAZ', label: 'Hair Color', name: 'hairColor', type: 'select', required: false, options: HAIR_COLORS, helpText: 'Hair Color (ANSI D-20)', row: 4 },
  DCL: { fieldId: 'DCL', label: 'Race / Ethnicity', name: 'raceEthnicity', type: 'select', required: false, options: [{ value: 'AI', label: 'Alaskan or American Indian' }, { value: 'AP', label: 'Asian or Pacific Islander' }, { value: 'BK', label: 'Black' }, { value: 'H', label: 'Hispanic Origin' }, { value: 'O', label: 'Non-Hispanic' }, { value: 'U', label: 'Unknown' }, { value: 'W', label: 'White' }], helpText: 'Race/ethnicity code set defined by ANSI D-20.', row: 4 },
  DDE: { fieldId: 'DDE', label: 'Last Name Truncated', name: 'lastNameTruncated', type: 'select', required: false, options: [{ value: 'T', label: 'Truncated' }, { value: 'N', label: 'Not Truncated' }, { value: 'U', label: 'Unknown' }], helpText: 'Last name truncation indicator', row: 4 },
  DDF: { fieldId: 'DDF', label: 'First Name Truncated', name: 'firstNameTruncated', type: 'select', required: false, options: [{ value: 'T', label: 'Truncated' }, { value: 'N', label: 'Not Truncated' }, { value: 'U', label: 'Unknown' }], helpText: 'First name truncation indicator', row: 4 },
  DDG: { fieldId: 'DDG', label: 'Middle Name Truncated', name: 'middleNameTruncated', type: 'select', required: false, options: [{ value: 'T', label: 'Truncated' }, { value: 'N', label: 'Not Truncated' }, { value: 'U', label: 'Unknown' }], helpText: 'Middle name truncation indicator', row: 4 },

  // ✦ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ✦
  // FIELD DDA: KUNCI UTAMA UNTUK STATUS "REAL ID"
  // ✦ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ✦
  DCJ: { fieldId: 'DCJ', label: 'Audit Information', name: 'auditInfo', type: 'text', required: false, maxLength: 25, helpText: 'Jurisdiction-specific audit information.', row: 3 },
  DDA: { fieldId: 'DDA', label: 'Real ID Compliance', name: 'complianceType', type: 'select', required: false, options: [{ value: 'F', label: 'Fully Compliant (Real ID)' }, { value: 'N', label: 'Non-Compliant' }], helpText: 'F = Real ID, N = Standard', row: 4, alwaysInclude: true },
  DCI: { fieldId: 'DCI', label: 'Place of Birth', name: 'placeOfBirth', type: 'text', required: false, maxLength: 40, helpText: 'Place of birth, when encoded by the jurisdiction.', row: 3 },
  DDD: { fieldId: 'DDD', label: 'Limited Term', name: 'limitedTerm', type: 'select', required: false, options: [{ value: 'NO', label: 'No' }, { value: 'YES', label: 'Yes' }], helpText: 'Indicates whether the document has a limited duration.', row: 4 },
  DDM: { fieldId: 'DDM', label: 'Veteran Indicator', name: 'veteranIndicator', type: 'select', required: false, options: [{ value: 'NO', label: 'No' }, { value: 'YES', label: 'Yes' }], helpText: 'Veteran status when encoded by the jurisdiction.', row: 4 },
};

// Default field order for DL subfile (AAMVA standard ordering)
export const DEFAULT_FIELD_ORDER = [
  'DAQ', // Pindahkan DL Number ke URUTAN PERTAMA
  'DCS', 'DDE', 'DAC', 'DDF', 'DAD', 'DDG', 'DCU',
  'DAG', 'DAH', 'DAI', 'DAJ', 'DAK', 'DCG',
  'DBB', 'DBD', 'DBA', 'DDB', 'DDJ',
  'DBC', 'DAU', 'DAW', 'DAY', 'DAZ',
  'DCE', 'DCL', 'DCA', 'DCB', 'DCD',
  'DCF', 'DCK', 'DCI', 'DCJ', 'DDD', 'DDK', 'DDM', 'DDA',
];

// Profile presets — configurable scanner/decoder profiles
export const STATE_PAYLOAD_RULES = {
  defaultValues: { DCB: 'NONE' },
  HI: { defaultValues: { DDE: 'U', DDF: 'U', DDG: 'U' } },
  MN: { forceInclude: { DAH: '' } },
};

export const PROFILES = {
  scandit: {
    key: 'scandit',
    name: 'Scandit',
    eclevel: 5,
    description: 'Scandit-compatible profile with standard AAMVA fields and high error tolerance',
    requiredFields: ['DAQ', 'DCS', 'DAC', 'DAG', 'DAI', 'DAJ', 'DAK', 'DBB', 'DBA', 'DBC'],
  },
  'showme-id': {
    key: 'showme-id',
    name: 'Show-Me ID',
    eclevel: 6,
    description: 'Show-Me ID compatible profile (Missouri mobile ID standard)',
    // Wajib sertakan DDA untuk Show-Me ID agar lolos Real ID
    requiredFields: ['DAQ', 'DCS', 'DAC', 'DAG', 'DAI', 'DAJ', 'DAK', 'DBB', 'DBA', 'DBC', 'DAU', 'DAY', 'DAZ', 'DDA'], 
  },
  fidscan: {
    key: 'fidscan',
    name: 'FIDScan',
    eclevel: 5,
    description: 'FIDScan compatible profile with document discriminator and ICN validation',
    requiredFields: ['DAQ', 'DCS', 'DAC', 'DAG', 'DAI', 'DAJ', 'DAK', 'DBB', 'DBD', 'DBA', 'DBC', 'DCF', 'DCK', 'DDA'],
  },
};

export const PROFILE_LIST = Object.values(PROFILES);

// All 50 US states + DC with IIN and jurisdiction version data
export const JURISDICTIONS = [
  { name: 'Alabama', code: 'AL', iin: '636033', aamvaVersion: '10', jurisdictionVersion: '04', revision: 'Rev. 01/01/2022 (0403)', includeZk: false },
  { name: 'Alaska', code: 'AK', iin: '636059', aamvaVersion: '10', jurisdictionVersion: '09', revision: 'Rev. 01/01/2021 (0901)', includeZk: false },
  { name: 'Arizona', code: 'AZ', iin: '636026', aamvaVersion: '10', jurisdictionVersion: '10', revision: 'Rev. 01/01/2023 (1001)', includeZk: false },
  { name: 'Arkansas', code: 'AR', iin: '636021', aamvaVersion: '10', jurisdictionVersion: '09', revision: 'Rev. 01/01/2020 (0900)', includeZk: false },
  { name: 'California', code: 'CA', iin: '636014', aamvaVersion: '10', jurisdictionVersion: '10', revision: 'Rev. 01/01/2024 (1001)', includeZk: false },
  { name: 'Colorado', code: 'CO', iin: '636020', aamvaVersion: '10', jurisdictionVersion: '10', revision: 'Rev. 01/01/2022 (1001)', includeZk: false },
  { name: 'Connecticut', code: 'CT', iin: '636006', aamvaVersion: '10', jurisdictionVersion: '09', revision: 'Rev. 01/01/2020 (0900)', includeZk: false },
  { name: 'Delaware', code: 'DE', iin: '636011', aamvaVersion: '10', jurisdictionVersion: '09', revision: 'Rev. 01/01/2020 (0900)', includeZk: false },
  { name: 'District of Columbia', code: 'DC', iin: '636043', aamvaVersion: '10', jurisdictionVersion: '09', revision: 'Rev. 01/01/2020 (0900)', includeZk: false },
  { name: 'Florida', code: 'FL', iin: '636010', aamvaVersion: '10', jurisdictionVersion: '09', revision: 'Rev. 01/01/2020 (0900)', includeZk: false },
  { name: 'Georgia', code: 'GA', iin: '636055', aamvaVersion: '10', jurisdictionVersion: '09', revision: 'Rev. 01/01/2020 (0900)', includeZk: false },
  { name: 'Hawaii', code: 'HI', iin: '636047', aamvaVersion: '04', jurisdictionVersion: '00', revision: 'Rev. 01/01/2020 (0400)', includeZk: false },
  { name: 'Idaho', code: 'ID', iin: '636050', aamvaVersion: '10', jurisdictionVersion: '10', revision: 'Rev. 01/01/2023 (1009)', includeZk: false },
  { name: 'Illinois', code: 'IL', iin: '636035', aamvaVersion: '10', jurisdictionVersion: '08', revision: 'Rev. 01/01/2016 (0800)', includeZk: false },
  { name: 'Indiana', code: 'IN', iin: '636037', aamvaVersion: '10', jurisdictionVersion: '09', revision: 'Rev. 01/01/2020 (0900)', includeZk: false },
  { name: 'Iowa', code: 'IA', iin: '636018', aamvaVersion: '10', jurisdictionVersion: '09', revision: 'Rev. 01/01/2017 (0900)', includeZk: false },
  { name: 'Kansas', code: 'KS', iin: '636022', aamvaVersion: '10', jurisdictionVersion: '09', revision: 'Rev. 01/01/2020 (0900)', includeZk: false },
  { name: 'Kentucky', code: 'KY', iin: '636046', aamvaVersion: '10', jurisdictionVersion: '09', revision: 'Rev. 01/01/2018 (0900)', includeZk: false },
  { name: 'Louisiana', code: 'LA', iin: '636007', aamvaVersion: '10', jurisdictionVersion: '09', revision: 'Rev. 01/01/2020 (0900)', includeZk: false },
  { name: 'Maine', code: 'ME', iin: '636041', aamvaVersion: '10', jurisdictionVersion: '09', revision: 'Rev. 01/01/2020 (0900)', includeZk: false },
  { name: 'Maryland', code: 'MD', iin: '636003', aamvaVersion: '10', jurisdictionVersion: '09', revision: 'Rev. 01/01/2021 (0900)', includeZk: false },
  { name: 'Massachusetts', code: 'MA', iin: '636002', aamvaVersion: '10', jurisdictionVersion: '08', revision: 'Rev. 01/01/2016 (0800)', includeZk: false },
  { name: 'Michigan', code: 'MI', iin: '636032', aamvaVersion: '10', jurisdictionVersion: '08', revision: 'Rev. 01/01/2020 (0800)', includeZk: false },
  { name: 'Minnesota', code: 'MN', iin: '636038', aamvaVersion: '09', jurisdictionVersion: '00', revision: 'Rev. 10/23/2017 (0900)', includeZk: false, extraSubfiles: [{ type: 'ZM', rawFormat: 'mn-verified' }] },
  { name: 'Mississippi', code: 'MS', iin: '636051', aamvaVersion: '10', jurisdictionVersion: '10', revision: 'Rev. 01/01/2023 (1000)', includeZk: false },
  { name: 'Missouri', code: 'MO', iin: '636030', aamvaVersion: '10', jurisdictionVersion: '09', revision: 'Rev. 01/01/2020 (0900)', includeZk: false },
  { name: 'Montana', code: 'MT', iin: '636008', aamvaVersion: '10', jurisdictionVersion: '08', revision: 'Rev. 01/01/2016 (0800)', includeZk: false },
  { name: 'Nebraska', code: 'NE', iin: '636054', aamvaVersion: '10', jurisdictionVersion: '10', revision: 'Rev. 01/01/2021 (1000)', includeZk: false },
  { name: 'Nevada', code: 'NV', iin: '636049', aamvaVersion: '10', jurisdictionVersion: '10', revision: 'Rev. 05/24/2021 (1000)', includeZk: false },
  { name: 'New Hampshire', code: 'NH', iin: '636039', aamvaVersion: '10', jurisdictionVersion: '10', revision: 'Rev. 01/01/2024 (1000)', includeZk: false },
  { name: 'New Jersey', code: 'NJ', iin: '636036', aamvaVersion: '10', jurisdictionVersion: '04', revision: 'Rev. 01/01/2020 (0402)', includeZk: false },
  { name: 'New Mexico', code: 'NM', iin: '636009', aamvaVersion: '10', jurisdictionVersion: '08', revision: 'Rev. 01/01/2016 (0800)', includeZk: false },
  { name: 'New York', code: 'NY', iin: '636001', aamvaVersion: '10', jurisdictionVersion: '10', revision: 'Rev. 01/01/2022 (1004)', includeZk: false },
  { name: 'North Carolina', code: 'NC', iin: '636004', aamvaVersion: '10', jurisdictionVersion: '08', revision: 'Rev. 01/01/2016 (0800)', includeZk: false },
  { name: 'North Dakota', code: 'ND', iin: '636034', aamvaVersion: '10', jurisdictionVersion: '10', revision: 'Rev. 01/01/2023 (1000)', includeZk: false },
  { name: 'Ohio', code: 'OH', iin: '636023', aamvaVersion: '10', jurisdictionVersion: '09', revision: 'Rev. 01/01/2020 (0901)', includeZk: false },
  { name: 'Oklahoma', code: 'OK', iin: '636058', aamvaVersion: '10', jurisdictionVersion: '09', revision: 'Rev. 01/01/2020 (0900)', includeZk: false },
  { name: 'Oregon', code: 'OR', iin: '636029', aamvaVersion: '10', jurisdictionVersion: '09', revision: 'Rev. 01/01/2020 (0900)', includeZk: false },
  { name: 'Pennsylvania', code: 'PA', iin: '636025', aamvaVersion: '10', jurisdictionVersion: '10', revision: 'Rev. 01/01/2022 (1000)', includeZk: false },
  { name: 'Rhode Island', code: 'RI', iin: '636052', aamvaVersion: '10', jurisdictionVersion: '08', revision: 'Rev. 01/01/2022 (0801)', includeZk: false },
  { name: 'South Carolina', code: 'SC', iin: '636005', aamvaVersion: '10', jurisdictionVersion: '09', revision: 'Rev. 01/01/2020 (0900)', includeZk: false },
  { name: 'South Dakota', code: 'SD', iin: '636042', aamvaVersion: '10', jurisdictionVersion: '09', revision: 'Rev. 01/01/2020 (0900)', includeZk: false },
  { name: 'Tennessee', code: 'TN', iin: '636053', aamvaVersion: '10', jurisdictionVersion: '06', revision: 'Rev. 01/01/2017 (0600)', includeZk: false },
  { name: 'Texas', code: 'TX', iin: '636015', aamvaVersion: '10', jurisdictionVersion: '09', revision: 'Rev. 01/01/2022 (0900)', includeZk: false },
  { name: 'Utah', code: 'UT', iin: '636040', aamvaVersion: '10', jurisdictionVersion: '10', revision: 'Rev. 01/01/2021 (1000)', includeZk: false },
  { name: 'Vermont', code: 'VT', iin: '636024', aamvaVersion: '10', jurisdictionVersion: '09', revision: 'Rev. 01/01/2020 (0902)', includeZk: false },
  { name: 'Virginia', code: 'VA', iin: '636000', aamvaVersion: '10', jurisdictionVersion: '03', revision: 'Rev. 01/01/2018 (0300)', includeZk: false },
  { name: 'Washington', code: 'WA', iin: '636045', aamvaVersion: '10', jurisdictionVersion: '09', revision: 'Rev. 01/01/2025 (0901)', includeZk: false },
  { name: 'West Virginia', code: 'WV', iin: '636061', aamvaVersion: '10', jurisdictionVersion: '09', revision: 'Rev. 01/01/2020 (0900)', includeZk: false },
  { name: 'Wisconsin', code: 'WI', iin: '636031', aamvaVersion: '10', jurisdictionVersion: '10', revision: 'Rev. 01/01/2023 (1002)', includeZk: false },
  { name: 'Wyoming', code: 'WY', iin: '636060', aamvaVersion: '10', jurisdictionVersion: '09', revision: 'Rev. 01/01/2020 (0900)', includeZk: false },
];

export function getJurisdiction(code) {
  return JURISDICTIONS.find(j => j.code === code) || JURISDICTIONS.find(j => j.code === 'NV');
}

export function getStateProfile(code) {
  return STATE_PROFILES[code] || null;
}

export function getStateAutoCalcRules(code) {
  return STATE_AUTO_CALC[code]?.fields || {};
}

export function getFieldDef(fieldId) {
  return STANDARD_FIELDS[fieldId];
}

// Get fields for a jurisdiction + profile, ordered correctly
// STATE_FIELDS — which AAMVA fields each US state uses (from pdf417.pro data)
export const STATE_FIELDS = {
  AK: {
    DAC: { required: true, tooltip: '' },
    DAD: { required: false, tooltip: 'This field is optional. You can click on the calculator icon to generate random name. Select gender in the field below t' },
    DAG: { required: true, tooltip: '' },
    DAI: { required: true, tooltip: '' },
    DAK: { required: true, tooltip: '' },
    DAQ: { required: true, tooltip: 'You can click on the calculator icon to calculate number automatically!' },
    DAU: { required: true, tooltip: '' },
    DAW: { required: true, tooltip: '' },
    DAY: { required: true, tooltip: '' },
    DAZ: { required: true, tooltip: '' },
    DBA: { required: true, tooltip: 'As of Tanuary 2019, 8 years, expires on birthday in 7th or 8th year; previously issued cards, 5 years.' },
    DBB: { required: true, tooltip: 'You need input the date in MMDDYYYY format' },
    DBC: { required: false, tooltip: '' },
    DBD: { required: true, tooltip: 'You need input the date in MMDDYYYY format' },
    DCA: { required: true, tooltip: '' },
    DCB: { required: true, tooltip: '' },
    DCD: { required: true, tooltip: '' },
    DCF: { required: true, tooltip: '7 digits + whitespace + 3 ditis + issue date (YYMMDD) + 3 letters + -1 or -0. You can click on the calculator icon to ca' },
    DCK: { required: true, tooltip: '10 digits. You can click on the calculator icon to calculate ICN automatically!' },
    DCS: { required: true, tooltip: '' },
    DDA: { required: false, tooltip: 'Alaska started issuing REAL ID compliant cards on 06/04/2013. If the card issue date is before this date, do not select ' },
    DDK: { required: false, tooltip: '' },
  },
  AL: {
    DAC: { required: true, tooltip: '' },
    DAD: { required: false, tooltip: 'This field is optional. You can click on the calculator icon to generate random name. Select gender in the field below t' },
    DAG: { required: true, tooltip: '' },
    DAI: { required: true, tooltip: '' },
    DAK: { required: true, tooltip: '' },
    DAQ: { required: true, tooltip: '7 random digits. You can click on the calculator icon to calculate number automatically!' },
    DAU: { required: true, tooltip: '' },
    DAY: { required: true, tooltip: '' },
    DAZ: { required: true, tooltip: '' },
    DBA: { required: true, tooltip: 'Same month and day as in birth date. 5 years after the year of issue' },
    DBB: { required: true, tooltip: 'You need input the date in MMDDYYYY format' },
    DBC: { required: false, tooltip: '' },
    DBD: { required: true, tooltip: 'You need input the date in MMDDYYYY format' },
    DCA: { required: true, tooltip: '' },
    DCB: { required: true, tooltip: '' },
    DCD: { required: true, tooltip: '' },
    DCF: { required: true, tooltip: '' },
    DCK: { required: true, tooltip: '' },
    DCS: { required: true, tooltip: '' },
    DDA: { required: false, tooltip: 'Alaska started issuing REAL ID compliant cards on 06/04/2013. If the card issue date is before this date, do not select ' },
    DDK: { required: false, tooltip: '' },
  },
  AR: {
    DAC: { required: true, tooltip: '' },
    DAD: { required: false, tooltip: 'This field is optional. You can click on the calculator icon to generate random name. Select gender in the field below t' },
    DAG: { required: true, tooltip: '' },
    DAI: { required: true, tooltip: '' },
    DAK: { required: true, tooltip: '' },
    DAQ: { required: true, tooltip: '\'9\' + 8 digits. You can click on the calculator icon to calculate number automatically!' },
    DAU: { required: true, tooltip: '' },
    DAY: { required: true, tooltip: '' },
    DBA: { required: true, tooltip: 'Same month and day as in birth date. 8 years after the year of issue' },
    DBB: { required: true, tooltip: 'You need input the date in MMDDYYYY format' },
    DBC: { required: false, tooltip: '' },
    DBD: { required: true, tooltip: 'You need input the date in MMDDYYYY format' },
    DCA: { required: true, tooltip: '' },
    DCB: { required: true, tooltip: '' },
    DCD: { required: true, tooltip: '' },
    DCF: { required: true, tooltip: '9 or 10 digtis + \' \' + 4 digits. You can click on the calculator icon to calculate DD automatically!' },
    DCK: { required: true, tooltip: '02101 + 11 digtis. You can click on the calculator icon to calculate ICN automatically!' },
    DCS: { required: true, tooltip: '' },
    DDK: { required: false, tooltip: '' },
  },
  AZ: {
    DAC: { required: true, tooltip: '' },
    DAD: { required: false, tooltip: 'This field is optional. You can click on the calculator icon to generate random name. Select gender in the field below t' },
    DAG: { required: true, tooltip: '' },
    DAI: { required: true, tooltip: '' },
    DAK: { required: true, tooltip: '' },
    DAQ: { required: true, tooltip: 'Letter + 8 random digits. You can click on the calculator icon to calculate number automatically!' },
    DAU: { required: true, tooltip: '' },
    DAW: { required: true, tooltip: '' },
    DAY: { required: true, tooltip: '' },
    DAZ: { required: true, tooltip: '' },
    DBA: { required: true, tooltip: 'Same month and day as in birth date. 6 years after the year of issue' },
    DBB: { required: true, tooltip: 'You need input the date in MMDDYYYY format' },
    DBC: { required: false, tooltip: '' },
    DBD: { required: true, tooltip: 'You need input the date in MMDDYYYY format' },
    DCA: { required: true, tooltip: '' },
    DCB: { required: true, tooltip: '' },
    DCD: { required: true, tooltip: '' },
    DCF: { required: true, tooltip: 'You can click on the calculator icon to calculate DD automatically!' },
    DCK: { required: true, tooltip: 'You can click on the calculator icon to calculate ICN automatically!' },
    DCS: { required: true, tooltip: '' },
    DDK: { required: false, tooltip: '' },
  },
  CA: {
    DAC: { required: true, tooltip: '' },
    DAD: { required: false, tooltip: 'This field is optional. You can click on the calculator icon to generate random name. Select gender in the field below t' },
    DAG: { required: true, tooltip: '' },
    DAI: { required: true, tooltip: '' },
    DAK: { required: true, tooltip: '' },
    DAQ: { required: true, tooltip: 'Random letter + 7 random digits. You can click on the calculator icon to calculate number automatically!' },
    DAU: { required: true, tooltip: '' },
    DAW: { required: true, tooltip: '' },
    DAY: { required: true, tooltip: '' },
    DAZ: { required: true, tooltip: '' },
    DBA: { required: true, tooltip: 'Same month and day as in birth date. 5 years after the year of issue' },
    DBB: { required: true, tooltip: 'You need input the date in MMDDYYYY format' },
    DBC: { required: false, tooltip: '' },
    DBD: { required: true, tooltip: 'Valid issue period is 12/28/2020 - till now' },
    DCA: { required: true, tooltip: '' },
    DCB: { required: true, tooltip: '' },
    DCD: { required: true, tooltip: '' },
    DCF: { required: true, tooltip: 'First 8 digits is issue date in DD/MM/YYYY format. The last 2 digits is expiry year. You can click on the calculator ico' },
    DCK: { required: true, tooltip: 'First 2 digits is issue year. Next 3 digits is number of days from the beginning of the year to document. Next numbers i' },
    DCS: { required: true, tooltip: '' },
    DDK: { required: false, tooltip: '' },
  },
  CO: {
    DAC: { required: true, tooltip: '' },
    DAD: { required: false, tooltip: 'This field is optional. You can click on the calculator icon to generate random name. Select gender in the field below t' },
    DAG: { required: true, tooltip: '' },
    DAI: { required: true, tooltip: '' },
    DAK: { required: true, tooltip: '' },
    DAQ: { required: true, tooltip: '9 random digits. You can click on the calculator icon to calculate number automatically!' },
    DAU: { required: true, tooltip: '' },
    DAW: { required: true, tooltip: '' },
    DAY: { required: true, tooltip: '' },
    DAZ: { required: true, tooltip: '' },
    DBA: { required: true, tooltip: 'Same month and day as in birth date. 6 years after the year of issue' },
    DBB: { required: true, tooltip: 'You need input the date in MMDDYYYY format' },
    DBC: { required: false, tooltip: '' },
    DBD: { required: true, tooltip: 'You need input the date in MMDDYYYY format' },
    DCA: { required: true, tooltip: '' },
    DCB: { required: true, tooltip: '' },
    DCD: { required: true, tooltip: '' },
    DCF: { required: true, tooltip: '7 random digits You can click on the calculator icon to calculate DD automatically!' },
    DCS: { required: true, tooltip: '' },
    DDK: { required: false, tooltip: '' },
  },
  CT: {
    DAC: { required: true, tooltip: '' },
    DAD: { required: false, tooltip: 'This field is optional. You can click on the calculator icon to generate random name. Select gender in the field below t' },
    DAG: { required: true, tooltip: '' },
    DAI: { required: true, tooltip: '' },
    DAK: { required: true, tooltip: '' },
    DAQ: { required: true, tooltip: 'Month of birth: 01-12 (odd birth year) or 13-24 (even birth year) + 7 random digits. You can click on the calculator ico' },
    DAU: { required: true, tooltip: '' },
    DAY: { required: true, tooltip: '' },
    DBA: { required: true, tooltip: 'Same month and day as in birth date. 6 years after the year of issue' },
    DBB: { required: true, tooltip: 'You need input the date in MMDDYYYY format' },
    DBC: { required: false, tooltip: '' },
    DBD: { required: true, tooltip: 'You need input the date in MMDDYYYY format' },
    DCA: { required: true, tooltip: '' },
    DCB: { required: true, tooltip: '' },
    DCD: { required: true, tooltip: '' },
    DCF: { required: true, tooltip: 'YYMMDD (Issue date) + 6 digits + 01MV + 2 character. You can click on the calculator icon to calculate DD automatically!' },
    DCK: { required: true, tooltip: 'DL Number + \'CT\' + special code. You can click on the calculator icon to calculate ICN automatically!' },
    DCS: { required: true, tooltip: '' },
    DDK: { required: false, tooltip: '' },
  },
  DC: {
    DAC: { required: true, tooltip: '' },
    DAD: { required: false, tooltip: 'This field is optional. You can click on the calculator icon to generate random name. Select gender in the field below t' },
    DAG: { required: true, tooltip: '' },
    DAI: { required: true, tooltip: '' },
    DAK: { required: true, tooltip: '' },
    DAQ: { required: true, tooltip: '7 digits. You can click on the calculator icon to calculate number automatically!' },
    DAU: { required: true, tooltip: '' },
    DAY: { required: true, tooltip: '' },
    DBA: { required: true, tooltip: 'Same month and day as in birth date. 8 years after the year of issue' },
    DBB: { required: true, tooltip: 'You need input the date in MMDDYYYY format' },
    DBC: { required: false, tooltip: '' },
    DBD: { required: true, tooltip: 'You need input the date in MMDDYYYY format' },
    DCA: { required: true, tooltip: '' },
    DCB: { required: true, tooltip: '0 - None' },
    DCD: { required: true, tooltip: 'O - None' },
    DCF: { required: true, tooltip: 'You can click on the calculator icon to calculate DD automatically!' },
    DCS: { required: true, tooltip: '' },
    DDK: { required: false, tooltip: '' },
  },
  DE: {
    DAC: { required: true, tooltip: '' },
    DAD: { required: false, tooltip: 'This field is optional. You can click on the calculator icon to generate random name. Select gender in the field below t' },
    DAG: { required: true, tooltip: '' },
    DAI: { required: true, tooltip: '' },
    DAK: { required: true, tooltip: '' },
    DAQ: { required: true, tooltip: '7 digits. You can click on the calculator icon to calculate number automatically!' },
    DAU: { required: true, tooltip: '' },
    DAW: { required: true, tooltip: '' },
    DAY: { required: true, tooltip: '' },
    DBA: { required: true, tooltip: 'Same month and day as in birth date. 8 years after the year of issue' },
    DBB: { required: true, tooltip: 'You need input the date in MMDDYYYY format' },
    DBC: { required: false, tooltip: '' },
    DBD: { required: true, tooltip: 'You need input the date in MMDDYYYY format' },
    DCA: { required: true, tooltip: '' },
    DCB: { required: true, tooltip: '' },
    DCD: { required: true, tooltip: '' },
    DCF: { required: true, tooltip: 'L + issue datae (YYYYMMDD) + 6 digits + letter. You can click on the calculator icon to calculate DD automatically!' },
    DCK: { required: true, tooltip: '0110 + 12 digits. You can click on the calculator icon to calculate ICN automatically!' },
    DCS: { required: true, tooltip: '' },
    DDA: { required: false, tooltip: 'Delaware started issuing REAL ID compliant cards on 07/01/2010. If the card issue date is before this date, do not selec' },
    DDK: { required: false, tooltip: '' },
  },
  FL: {
    DAC: { required: true, tooltip: '' },
    DAD: { required: false, tooltip: 'This field is optional. You can click on the calculator icon to generate random name. Select gender in the field below t' },
    DAG: { required: true, tooltip: '' },
    DAI: { required: true, tooltip: '' },
    DAK: { required: true, tooltip: '' },
    DAQ: { required: true, tooltip: 'Random letter + 12 random digits. You can click on the calculator icon to calculate number automatically!' },
    DAU: { required: true, tooltip: '' },
    DAW: { required: true, tooltip: '' },
    DBA: { required: true, tooltip: 'Same month and day as in birth date. 5 years after the year of issue' },
    DBB: { required: true, tooltip: 'You need input the date in MMDDYYYY format' },
    DBC: { required: false, tooltip: '' },
    DBD: { required: true, tooltip: 'You need input the date in MMDDYYYY formatw' },
    DCA: { required: true, tooltip: '' },
    DCB: { required: true, tooltip: '' },
    DCD: { required: true, tooltip: '' },
    DCF: { required: true, tooltip: 'You can click on the calculator icon to calculate DD automatically!' },
    DCK: { required: true, tooltip: '0100 + 12 random digits. You can click on the calculator icon to calculate ICN automatically!' },
    DCS: { required: true, tooltip: '' },
    DDK: { required: false, tooltip: '' },
  },
  GA: {
    DAC: { required: true, tooltip: '' },
    DAD: { required: false, tooltip: 'This field is optional. You can click on the calculator icon to generate random name. Select gender in the field below t' },
    DAG: { required: true, tooltip: '' },
    DAI: { required: true, tooltip: '' },
    DAK: { required: true, tooltip: '' },
    DAQ: { required: true, tooltip: '9 random digits. You can click on the calculator icon to calculate number automatically!' },
    DAU: { required: true, tooltip: '' },
    DAW: { required: true, tooltip: '' },
    DAY: { required: true, tooltip: '' },
    DBA: { required: true, tooltip: 'Same month and day as in birth date. 6 years after the year of issue' },
    DBB: { required: true, tooltip: 'You need input the date in MMDDYYYY format' },
    DBC: { required: false, tooltip: '' },
    DBD: { required: true, tooltip: 'You need input the date in MMDDYYYY format (07/01/2015 till 01/02/2019)' },
    DCA: { required: true, tooltip: '' },
    DCB: { required: true, tooltip: '' },
    DCD: { required: true, tooltip: '' },
    DCF: { required: true, tooltip: 'first 14 digits of ICN + 4 random digits. You can click on the calculator icon to calculate DD automatically!' },
    DCK: { required: true, tooltip: '10 random digits + \'100401\'. You can click on the calculator icon to calculate ICN automatically!' },
    DCS: { required: true, tooltip: '' },
    DDK: { required: false, tooltip: '' },
  },
  HI: {
    DAC: { required: true, tooltip: '' },
    DAD: { required: false, tooltip: 'This field is optional. You can click on the calculator icon to generate random name. Select gender in the field below t' },
    DAG: { required: true, tooltip: '' },
    DAH: { required: false, tooltip: 'Address line 2' },
    DAI: { required: true, tooltip: '' },
    DAJ: { required: true, tooltip: 'State' },
    DAK: { required: true, tooltip: '' },
    DAQ: { required: true, tooltip: 'H + 8 digts. You can click on the calculator icon to calculate number automatically!' },
    DAU: { required: true, tooltip: '' },
    DAY: { required: true, tooltip: '' },
    DAZ: { required: true, tooltip: '' },
    DBA: { required: true, tooltip: 'Same month and day as in birth date. 8 years after the year of issue' },
    DBB: { required: true, tooltip: 'You need input the date in MMDDYYYY format' },
    DBC: { required: false, tooltip: '' },
    DBD: { required: true, tooltip: 'You need input the date in MMDDYYYY format' },
    DCA: { required: true, tooltip: '' },
    DCB: { required: true, tooltip: '' },
    DCD: { required: true, tooltip: '' },
    DCF: { required: true, tooltip: 'Issue date (YYYYMMDD) + digts and letters. You can click on the calculator icon to calculate DD automatically!' },
    DCG: { required: true, tooltip: 'Country' },
    DCJ: { required: false, tooltip: 'ICN-style field' },
    DCS: { required: true, tooltip: '' },
    DDE: { required: false, tooltip: 'Last name truncation (U/N/T)' },
    DDF: { required: false, tooltip: 'First name truncation' },
    DDG: { required: false, tooltip: 'Middle name truncation' },
  },
  IA: {
    DAC: { required: true, tooltip: '' },
    DAD: { required: false, tooltip: 'This field is optional. You can click on the calculator icon to generate random name. Select gender in the field below t' },
    DAG: { required: true, tooltip: '' },
    DAI: { required: true, tooltip: '' },
    DAK: { required: true, tooltip: '' },
    DAQ: { required: true, tooltip: '3 digits + 2 letters + 4 digits. You can click on the calculator icon to calculate number automatically!' },
    DAU: { required: true, tooltip: '' },
    DAY: { required: true, tooltip: '' },
    DBA: { required: true, tooltip: 'Same month and day as in birth date. 8 years after the year of issue' },
    DBB: { required: true, tooltip: 'You need input the date in MMDDYYYY format' },
    DBC: { required: false, tooltip: '' },
    DBD: { required: true, tooltip: 'You need input the date in MMDDYYYY format' },
    DCA: { required: true, tooltip: '' },
    DCB: { required: true, tooltip: '' },
    DCD: { required: true, tooltip: '' },
    DCF: { required: true, tooltip: '9 digits + first letter of last name + first letter of first name + 4 digits + sex + expiry date (MMDDYY) + R. You can c' },
    DCK: { required: true, tooltip: 'Document number + issue year + number of days from the beginning of year (+1 day) + 0101. You can click on the calculato' },
    DCS: { required: true, tooltip: '' },
    DDA: { required: false, tooltip: 'Iowa started issuing REAL ID compliant cards on 01/15/2013. If the card issue date is before this date, do not select RE' },
    DDK: { required: false, tooltip: '' },
  },
  ID: {
    DAC: { required: true, tooltip: '' },
    DAD: { required: false, tooltip: 'This field is optional. You can click on the calculator icon to generate random name. Select gender in the field below t' },
    DAG: { required: true, tooltip: '' },
    DAI: { required: true, tooltip: '' },
    DAK: { required: true, tooltip: '' },
    DAQ: { required: true, tooltip: '2 letters + six digits + letter. You can click on the calculator icon to calculate number automatically!' },
    DAU: { required: true, tooltip: '' },
    DAW: { required: true, tooltip: '' },
    DAY: { required: true, tooltip: '' },
    DAZ: { required: true, tooltip: '' },
    DBA: { required: true, tooltip: 'Same month and day as in birth date. 6 years after the year of issue' },
    DBB: { required: true, tooltip: 'You need input the date in MMDDYYYY format' },
    DBC: { required: false, tooltip: '' },
    DBD: { required: true, tooltip: 'You need input the date in MMDDYYYY format' },
    DCA: { required: true, tooltip: '' },
    DCB: { required: true, tooltip: '' },
    DCD: { required: true, tooltip: '' },
    DCF: { required: true, tooltip: 'You can click on the calculator icon to calculate DD automatically!' },
    DCK: { required: true, tooltip: '\'000\' + 7 digits. You can click on the calculator icon to calculate ICN automatically!' },
    DCS: { required: true, tooltip: '' },
    DDA: { required: false, tooltip: 'Idaho started issuing REAL ID compliant cards on 01/01/2018. If the card issue date is before this date, do not select R' },
    DDK: { required: false, tooltip: '' },
  },
  IL: {
    DAC: { required: true, tooltip: '' },
    DAD: { required: false, tooltip: 'This field is optional. You can click on the calculator icon to generate random name. Select gender in the field below t' },
    DAG: { required: true, tooltip: '' },
    DAI: { required: true, tooltip: '' },
    DAK: { required: true, tooltip: '' },
    DAQ: { required: true, tooltip: 'First digit of the Last Name + 11 random digits. You can click on the calculator icon to calculate number automatically!' },
    DAU: { required: true, tooltip: '' },
    DAW: { required: true, tooltip: '' },
    DAY: { required: true, tooltip: '' },
    DAZ: { required: true, tooltip: '' },
    DBA: { required: true, tooltip: 'Same month and day as in birth date. 5 years after the year of issue' },
    DBB: { required: true, tooltip: 'You need input the date in MMDDYYYY format' },
    DBC: { required: false, tooltip: '' },
    DBD: { required: true, tooltip: 'Valid issue period is 09/17/2015 - till now' },
    DCA: { required: true, tooltip: '' },
    DCB: { required: true, tooltip: '' },
    DCD: { required: true, tooltip: '' },
    DCF: { required: true, tooltip: 'First 8 digits is issue date in YYYYMMDD format. The last 3 random digits + 2 random letters + 4 random digits. You can ' },
    DCK: { required: true, tooltip: 'First 12 characters is Document Number. Random characters + 01. You can click on the calculator icon to calculate ICN au' },
    DCS: { required: true, tooltip: '' },
    DDA: { required: false, tooltip: 'Illinois started issuing REAL ID compliant cards on 01/07/2019. If the card issue date is before this date, do not selec' },
    DDK: { required: false, tooltip: '' },
  },
  IN: {
    DAC: { required: true, tooltip: '' },
    DAD: { required: false, tooltip: 'This field is optional. You can click on the calculator icon to generate random name. Select gender in the field below t' },
    DAG: { required: true, tooltip: '' },
    DAI: { required: true, tooltip: '' },
    DAK: { required: true, tooltip: '' },
    DAQ: { required: true, tooltip: '4 digits - 2 digits - 4 digits. You can click on the calculator icon to calculate number automatically!' },
    DAU: { required: true, tooltip: '' },
    DAW: { required: true, tooltip: '' },
    DAY: { required: true, tooltip: '' },
    DAZ: { required: true, tooltip: '' },
    DBA: { required: true, tooltip: 'Same month and day as in birth date. 6 years after the year of issue' },
    DBB: { required: true, tooltip: 'You need input the date in MMDDYYYY format' },
    DBC: { required: false, tooltip: '' },
    DBD: { required: true, tooltip: 'You need input the date in MMDDYYYY format' },
    DCA: { required: true, tooltip: '' },
    DCB: { required: true, tooltip: '' },
    DCD: { required: true, tooltip: '' },
    DCF: { required: true, tooltip: 'Issue date in MMDDYY format + DL issuing office code (Located under the photo) + 00 + 3 digits. You can click on the cal' },
    DCK: { required: true, tooltip: '03701 + 11 digits. You can click on the calculator icon to calculate ICN automatically!' },
    DCS: { required: true, tooltip: '' },
    DDK: { required: false, tooltip: '' },
  },
  KS: {
    DAC: { required: true, tooltip: '' },
    DAD: { required: false, tooltip: 'This field is optional. You can click on the calculator icon to generate random name. Select gender in the field below t' },
    DAG: { required: true, tooltip: '' },
    DAI: { required: true, tooltip: '' },
    DAK: { required: true, tooltip: '' },
    DAQ: { required: true, tooltip: 'You can click on the calculator icon to calculate number automatically!' },
    DAU: { required: true, tooltip: '' },
    DAW: { required: true, tooltip: '' },
    DAY: { required: true, tooltip: '' },
    DBA: { required: true, tooltip: 'Same month and day as in birth date. Validity 6 years for 21-64 years old. If age is more than 64 years or less than 21 ' },
    DBB: { required: true, tooltip: 'You need input the date in MMDDYYYY format' },
    DBC: { required: false, tooltip: '' },
    DBD: { required: true, tooltip: 'You need input the date in MMDDYYYY format' },
    DCA: { required: true, tooltip: '' },
    DCB: { required: true, tooltip: '' },
    DCD: { required: true, tooltip: '' },
    DCF: { required: true, tooltip: 'You can click on the calculator icon to calculate DD automatically!' },
    DCK: { required: true, tooltip: 'You can click on the calculator icon to calculate ICN automatically!' },
    DCS: { required: true, tooltip: '' },
    DDK: { required: false, tooltip: '' },
  },
  KY: {
    DAC: { required: true, tooltip: '' },
    DAD: { required: false, tooltip: 'This field is optional. You can click on the calculator icon to generate random name. Select gender in the field below t' },
    DAG: { required: true, tooltip: '' },
    DAI: { required: true, tooltip: '' },
    DAK: { required: true, tooltip: '' },
    DAQ: { required: true, tooltip: 'First letter of the Laste name + 8 digits. You can click on the calculator icon to calculate number automatically!' },
    DAU: { required: true, tooltip: '' },
    DAY: { required: true, tooltip: '' },
    DBA: { required: true, tooltip: 'Same month and day as in birth date. 6 years after the year of issue' },
    DBB: { required: true, tooltip: 'You need input the date in MMDDYYYY format' },
    DBC: { required: false, tooltip: '' },
    DBD: { required: true, tooltip: 'You need input the date in MMDDYYYY format' },
    DCA: { required: true, tooltip: '' },
    DCB: { required: true, tooltip: '' },
    DCD: { required: true, tooltip: '' },
    DCF: { required: true, tooltip: '16 digits. You can click on the calculator icon to calculate DD automatically!' },
    DCK: { required: true, tooltip: '04600 + year of issue + 9 digits. You can click on the calculator icon to calculate ICN automatically!' },
    DCS: { required: true, tooltip: '' },
    DDA: { required: false, tooltip: 'Kentucky started issuing REAL ID compliant cards on 06/28/2019. If the card issue date is before this date, do not selec' },
    DDK: { required: false, tooltip: '' },
  },
  LA: {
    DAC: { required: true, tooltip: '' },
    DAD: { required: false, tooltip: 'This field is optional. You can click on the calculator icon to generate random name. Select gender in the field below t' },
    DAG: { required: true, tooltip: '' },
    DAI: { required: true, tooltip: '' },
    DAK: { required: true, tooltip: '' },
    DAQ: { required: true, tooltip: '00 or 01 + 7 digits. You can click on the calculator icon to calculate number automatically!' },
    DAU: { required: true, tooltip: '' },
    DAW: { required: true, tooltip: '' },
    DAY: { required: true, tooltip: '' },
    DBA: { required: true, tooltip: 'Same month and day as in birth date. 6 years after the year of issue' },
    DBB: { required: true, tooltip: 'You need input the date in MMDDYYYY format' },
    DBC: { required: false, tooltip: '' },
    DBD: { required: true, tooltip: 'You need input the date in MMDDYYYY format' },
    DCA: { required: true, tooltip: '' },
    DCB: { required: true, tooltip: '' },
    DCD: { required: true, tooltip: '' },
    DCK: { required: true, tooltip: '00700 + 11 random digits. You can click on the calculator icon to calculate ICN automatically!' },
    DCS: { required: true, tooltip: '' },
    DDK: { required: false, tooltip: '' },
  },
  MA: {
    DAC: { required: true, tooltip: '' },
    DAD: { required: false, tooltip: 'This field is optional. You can click on the calculator icon to generate random name. Select gender in the field below t' },
    DAG: { required: true, tooltip: '' },
    DAH: { required: true, tooltip: '' },
    DAI: { required: true, tooltip: '' },
    DAK: { required: true, tooltip: '' },
    DAQ: { required: true, tooltip: 'S + 8 random digits. You can click on the calculator icon to calculate number automatically!' },
    DAU: { required: true, tooltip: '' },
    DAY: { required: true, tooltip: '' },
    DBA: { required: true, tooltip: 'Same month and day as in birth date. 5 years after the year of issue' },
    DBB: { required: true, tooltip: 'You need input the date in MMDDYYYY format' },
    DBC: { required: false, tooltip: '' },
    DBD: { required: true, tooltip: 'You need input the date in MMDDYYYY format' },
    DCA: { required: true, tooltip: '' },
    DCB: { required: true, tooltip: '' },
    DCD: { required: true, tooltip: '' },
    DCF: { required: true, tooltip: 'Issue date + revision date You can click on the calculator icon to calculate DD automatically!' },
    DCK: { required: true, tooltip: 'You can click on the calculator icon to calculate ICN automatically!' },
    DCS: { required: true, tooltip: '' },
    DDA: { required: false, tooltip: 'Massachusetts started issuing REAL ID compliant cards on 03/26/2018. If the card issue date is before this date, do not ' },
    DDK: { required: false, tooltip: '' },
  },
  MD: {
    DAC: { required: true, tooltip: '' },
    DAD: { required: false, tooltip: 'This field is optional. You can click on the calculator icon to generate random name. Select gender in the field below t' },
    DAG: { required: true, tooltip: '' },
    DAI: { required: true, tooltip: '' },
    DAK: { required: true, tooltip: '' },
    DAQ: { required: true, tooltip: 'First letter of Last name + 12 digits You can click on the calculator icon to calculate number automatically!' },
    DAU: { required: true, tooltip: '' },
    DAW: { required: true, tooltip: '' },
    DAY: { required: true, tooltip: '' },
    DBA: { required: true, tooltip: 'Same month and day as in birth date. 8 years after the year of issue' },
    DBB: { required: true, tooltip: 'You need input the date in MMDDYYYY format' },
    DBC: { required: false, tooltip: '' },
    DBD: { required: true, tooltip: 'You need input the date in MMDDYYYY format' },
    DCA: { required: true, tooltip: '' },
    DCB: { required: true, tooltip: '' },
    DCD: { required: true, tooltip: '' },
    DCF: { required: true, tooltip: '9 digits and letters. You can click on the calculator icon to calculate DD automatically!' },
    DCK: { required: true, tooltip: '\'100\' + 7 digits. You can click on the calculator icon to calculate ICN automatically!' },
    DCS: { required: true, tooltip: '' },
    DDK: { required: false, tooltip: '' },
  },
  ME: {
    DAC: { required: true, tooltip: '' },
    DAD: { required: false, tooltip: 'This field is optional. You can click on the calculator icon to generate random name. Select gender in the field below t' },
    DAG: { required: true, tooltip: '' },
    DAI: { required: true, tooltip: '' },
    DAK: { required: true, tooltip: '' },
    DAQ: { required: true, tooltip: '7 random digits. You can click on the calculator icon to calculate number automatically!' },
    DAU: { required: true, tooltip: '' },
    DAW: { required: true, tooltip: '' },
    DAY: { required: true, tooltip: '' },
    DAZ: { required: true, tooltip: '' },
    DBA: { required: true, tooltip: 'Same month and day as in birth date. 6 years after the year of issue' },
    DBB: { required: true, tooltip: 'You need input the date in MMDDYYYY format' },
    DBC: { required: false, tooltip: '' },
    DBD: { required: true, tooltip: 'You need input the date in MMDDYYYY format' },
    DCA: { required: true, tooltip: '' },
    DCB: { required: true, tooltip: '' },
    DCD: { required: true, tooltip: '' },
    DCF: { required: true, tooltip: '17 zeros + 8 digits. You can click on the calculator icon to calculate DD automatically!' },
    DCK: { required: true, tooltip: 'You can click on the calculator icon to calculate ICN automatically!' },
    DCS: { required: true, tooltip: '' },
    DDK: { required: false, tooltip: '' },
  },
  MI: {
    DAC: { required: true, tooltip: '' },
    DAD: { required: false, tooltip: 'This field is optional. You can click on the calculator icon to generate random name. Select gender in the field below t' },
    DAG: { required: true, tooltip: '' },
    DAI: { required: true, tooltip: '' },
    DAK: { required: true, tooltip: '' },
    DAQ: { required: true, tooltip: 'You can click on the calculator icon to calculate number automatically!' },
    DBA: { required: true, tooltip: 'Same month and day as in birth date. 4 years after the year of issue' },
    DBB: { required: true, tooltip: 'You need input the date in MMDDYYYY format' },
    DBC: { required: false, tooltip: '' },
    DBD: { required: true, tooltip: 'You need input the date in MMDDYYYY format' },
    DCA: { required: true, tooltip: '' },
    DCK: { required: true, tooltip: 'Document number + birth date (YYYYMMDD) + issue year (YYYY). You can click on the calculator icon to calculate ICN autom' },
    DCS: { required: true, tooltip: '' },
    DDA: { required: false, tooltip: 'REAL ID is a federal law that affects how states issue driver\'s licenses and ID cards if they are going to be acceptable' },
    DDK: { required: false, tooltip: '' },
  },
  MN: {
    DAC: { required: true, tooltip: '' },
    DAD: { required: false, tooltip: 'This field is optional. You can click on the calculator icon to generate random name. Select gender in the field below t' },
    DAG: { required: true, tooltip: '' },
    DAH: { required: false, tooltip: '' },
    DAI: { required: true, tooltip: '' },
    DAK: { required: true, tooltip: '' },
    DAQ: { required: true, tooltip: 'One letter and 12 numbers. You can click on the calculator icon to calculate number automatically!' },
    DAU: { required: true, tooltip: '' },
    DAW: { required: true, tooltip: '' },
    DAY: { required: true, tooltip: '' },
    DBA: { required: true, tooltip: 'Same month and day as in birth date. 4 years after the year of issue' },
    DBB: { required: true, tooltip: 'You need input the date in MMDDYYYY format' },
    DBC: { required: false, tooltip: '' },
    DBD: { required: true, tooltip: 'You need input the date in MMDDYYYY format' },
    DCA: { required: true, tooltip: '' },
    DCB: { required: true, tooltip: '' },
    DCD: { required: true, tooltip: '' },
    DCF: { required: true, tooltip: '7 zeros + 7 random digits. You can click on the calculator icon to calculate DD automatically!' },
    DCK: { required: true, tooltip: 'Document number + \'01\' + number of days from the beginning of year to issue date + \'01\'. You can click on the calculator' },
    DCS: { required: true, tooltip: '' },
    DDK: { required: false, tooltip: '' },
  },
  MO: {
    DAC: { required: true, tooltip: '' },
    DAD: { required: false, tooltip: 'This field is optional. You can click on the calculator icon to generate random name. Select gender in the field below t' },
    DAG: { required: true, tooltip: '' },
    DAI: { required: true, tooltip: '' },
    DAK: { required: true, tooltip: '' },
    DAQ: { required: true, tooltip: 'letter + 9 digits. You can click on the calculator icon to calculate number automatically!' },
    DAU: { required: true, tooltip: '' },
    DAW: { required: true, tooltip: '' },
    DAY: { required: true, tooltip: '' },
    DBA: { required: true, tooltip: 'Same month and day as in birth date. 6 years after the year of issue' },
    DBB: { required: true, tooltip: 'You need input the date in MMDDYYYY format' },
    DBC: { required: false, tooltip: '' },
    DBD: { required: true, tooltip: 'You need input the date in MMDDYYYY format' },
    DCA: { required: true, tooltip: '' },
    DCB: { required: true, tooltip: '' },
    DCD: { required: true, tooltip: '' },
    DCF: { required: true, tooltip: 'First 2 digits is issue year (YY), next 3 digits is first digits of document number, next 3 digits is number of days fro' },
    DCK: { required: true, tooltip: 'First 2 digtis is issue year (YY), next 3 digits is number of days from issue date + 1. Then document number and \'0101. ' },
    DCS: { required: true, tooltip: '' },
    DDK: { required: false, tooltip: '' },
  },
  MS: {
    DAC: { required: true, tooltip: '' },
    DAD: { required: false, tooltip: 'This field is optional. You can click on the calculator icon to generate random name. Select gender in the field below t' },
    DAG: { required: true, tooltip: '' },
    DAI: { required: true, tooltip: '' },
    DAK: { required: true, tooltip: '' },
    DAQ: { required: true, tooltip: '\'80\' + 7 random digits. You can click on the calculator icon to calculate number automatically!' },
    DAU: { required: true, tooltip: '' },
    DAY: { required: true, tooltip: '' },
    DBA: { required: true, tooltip: 'Same month and day as in birth date. 4 years after the year of issue' },
    DBB: { required: true, tooltip: 'You need input the date in MMDDYYYY format' },
    DBC: { required: false, tooltip: '' },
    DBD: { required: true, tooltip: 'You need input the date in MMDDYYYY format' },
    DCA: { required: true, tooltip: '' },
    DCB: { required: true, tooltip: '' },
    DCD: { required: true, tooltip: '' },
    DCF: { required: true, tooltip: 'You can click on the calculator icon to calculate DD automatically!' },
    DCK: { required: true, tooltip: '\'05100\' + 11 random digits. You can click on the calculator icon to calculate ICN automatically!' },
    DCS: { required: true, tooltip: '' },
    DDA: { required: false, tooltip: 'REAL ID is a federal law that affects how states issue driver\'s licenses and ID cards if they are going to be acceptable' },
    DDK: { required: false, tooltip: '' },
  },
  MT: {
    DAC: { required: true, tooltip: '' },
    DAD: { required: false, tooltip: 'This field is optional. You can click on the calculator icon to generate random name. Select gender in the field below t' },
    DAG: { required: true, tooltip: '' },
    DAI: { required: true, tooltip: '' },
    DAK: { required: true, tooltip: '' },
    DAQ: { required: true, tooltip: 'birth month + 3 digits + birth year + \'41\' + birth day. You can click on the calculator icon to calculate number automat' },
    DAU: { required: true, tooltip: '' },
    DAW: { required: true, tooltip: '' },
    DAY: { required: true, tooltip: '' },
    DBA: { required: true, tooltip: 'Same month and day as in birth date. 8 years after the year of issue' },
    DBB: { required: true, tooltip: 'You need input the date in MMDDYYYY format' },
    DBC: { required: false, tooltip: '' },
    DBD: { required: true, tooltip: 'You need input the date in MMDDYYYY format' },
    DCA: { required: true, tooltip: '' },
    DCB: { required: true, tooltip: '' },
    DCD: { required: true, tooltip: '' },
    DCF: { required: true, tooltip: 'Issue data in YYYYMMDD format + 12 digits. You can click on the calculator icon to calculate DD automatically!' },
    DCK: { required: true, tooltip: '110 + 9 digits and letters + MT + 3 letters + 001. You can click on the calculator icon to calculate ICN automatically!' },
    DCS: { required: true, tooltip: '' },
    DDA: { required: false, tooltip: 'Montana started issuing REAL ID compliant cards on 01/01/2019. If the card issue date is before this date, do not select' },
    DDK: { required: false, tooltip: '' },
  },
  NC: {
    DAC: { required: true, tooltip: '' },
    DAD: { required: false, tooltip: 'This field is optional. You can click on the calculator icon to generate random name. Select gender in the field below t' },
    DAG: { required: true, tooltip: '' },
    DAI: { required: true, tooltip: '' },
    DAK: { required: true, tooltip: '' },
    DAQ: { required: true, tooltip: '5 zeros + 7 random digits. You can click on the calculator icon to calculate number automatically!' },
    DAU: { required: true, tooltip: '' },
    DAY: { required: true, tooltip: '' },
    DBA: { required: true, tooltip: 'Same month and day as in birth date. 8 years after the year of issue' },
    DBB: { required: true, tooltip: 'You need input the date in MMDDYYYY format' },
    DBC: { required: false, tooltip: '' },
    DBD: { required: true, tooltip: 'You need input the date in MMDDYYYY format' },
    DCA: { required: true, tooltip: '' },
    DCB: { required: true, tooltip: '' },
    DCD: { required: true, tooltip: '' },
    DCF: { required: true, tooltip: 'Document number + audit information You can click on the calculator icon to calculate DD automatically!' },
    DCK: { required: true, tooltip: 'You can click on the calculator icon to calculate ICN automatically!' },
    DCS: { required: true, tooltip: '' },
    DDK: { required: false, tooltip: '' },
  },
  ND: {
    DAC: { required: true, tooltip: '' },
    DAD: { required: false, tooltip: 'This field is optional. You can click on the calculator icon to generate random name. Select gender in the field below t' },
    DAG: { required: true, tooltip: '' },
    DAI: { required: true, tooltip: '' },
    DAK: { required: true, tooltip: '' },
    DAQ: { required: true, tooltip: '. You can click on the calculator icon to calculate number automatically!' },
    DAU: { required: true, tooltip: '' },
    DAY: { required: true, tooltip: '' },
    DBA: { required: true, tooltip: 'Same month and day as in birth date. 6 years after the year of issue' },
    DBB: { required: true, tooltip: 'You need input the date in MMDDYYYY format' },
    DBC: { required: false, tooltip: '' },
    DBD: { required: true, tooltip: 'You need input the date in MMDDYYYY format' },
    DCA: { required: true, tooltip: '' },
    DCB: { required: true, tooltip: '' },
    DCD: { required: true, tooltip: '' },
    DCF: { required: true, tooltip: 'Decade of birth year + DL Number + Last and First name initials + 4 digits + lowecase and uppercase letter + 2 digits + ' },
    DCK: { required: true, tooltip: '\'03400\' + 11 random digits. You can click on the calculator icon to calculate ICN automatically!' },
    DCS: { required: true, tooltip: '' },
    DDA: { required: false, tooltip: 'North Dakota started issuing REAL ID compliant cards on 05/01/2018. If the card issue date is before this date, do not s' },
    DDK: { required: false, tooltip: '' },
  },
  NE: {
    DAC: { required: true, tooltip: '' },
    DAD: { required: false, tooltip: 'This field is optional. You can click on the calculator icon to generate random name. Select gender in the field below t' },
    DAG: { required: true, tooltip: '' },
    DAI: { required: true, tooltip: '' },
    DAK: { required: true, tooltip: '' },
    DAQ: { required: true, tooltip: 'Letter (A, B, C, E, G, H or V) and 8 numbers. You can click on the calculator icon to calculate number automatically!' },
    DAU: { required: true, tooltip: '' },
    DAW: { required: true, tooltip: '' },
    DAY: { required: true, tooltip: '' },
    DAZ: { required: true, tooltip: '' },
    DBA: { required: true, tooltip: 'Same month and day as in birth date. 5 years after the year of issue' },
    DBB: { required: true, tooltip: 'You need input the date in MMDDYYYY format' },
    DBC: { required: false, tooltip: '' },
    DBD: { required: true, tooltip: 'You need input the date in MMDDYYYY format' },
    DCA: { required: true, tooltip: '' },
    DCB: { required: true, tooltip: '' },
    DCD: { required: true, tooltip: '' },
    DCF: { required: true, tooltip: 'Same as Document Discriminator (DD). You can click on the calculator icon to calculate DD automatically!' },
    DCK: { required: true, tooltip: 'You can click on the calculator icon to calculate ICN automatically!' },
    DCS: { required: true, tooltip: '' },
    DDK: { required: false, tooltip: '' },
  },
  NH: {
    DAC: { required: true, tooltip: '' },
    DAD: { required: false, tooltip: 'This field is optional. You can click on the calculator icon to generate random name. Select gender in the field below t' },
    DAG: { required: true, tooltip: '' },
    DAH: { required: true, tooltip: '' },
    DAI: { required: true, tooltip: '' },
    DAK: { required: true, tooltip: '' },
    DAQ: { required: true, tooltip: '\'NHL\' + 8 random digits. You can click on the calculator icon to calculate number automatically!' },
    DAU: { required: true, tooltip: '' },
    DAY: { required: true, tooltip: '' },
    DBA: { required: true, tooltip: 'Same month and day as in birth date. 5 years after the year of issue' },
    DBB: { required: true, tooltip: 'You need input the date in MMDDYYYY format' },
    DBC: { required: false, tooltip: '' },
    DBD: { required: true, tooltip: 'You need input the date in MMDDYYYY format' },
    DCA: { required: true, tooltip: '' },
    DCB: { required: true, tooltip: '' },
    DCD: { required: true, tooltip: '' },
    DCF: { required: true, tooltip: 'You can click on the calculator icon to calculate DD automatically!' },
    DCK: { required: true, tooltip: 'You can click on the calculator icon to calculate ICN automatically!' },
    DCS: { required: true, tooltip: '' },
    DDA: { required: false, tooltip: 'New Hampshire started issuing REAL ID compliant cards on 01/03/2017. If the card issue date is before this date, do not ' },
    DDK: { required: false, tooltip: '' },
  },
  NJ: {
    DAC: { required: true, tooltip: '' },
    DAD: { required: false, tooltip: 'This field is optional. You can click on the calculator icon to generate random name. Select gender in the field below t' },
    DAG: { required: true, tooltip: '' },
    DAI: { required: true, tooltip: '' },
    DAK: { required: true, tooltip: '' },
    DAQ: { required: true, tooltip: 'First letter of Last name + 14 digits. You can click on the calculator icon to calculate number automatically!' },
    DAU: { required: true, tooltip: '' },
    DAY: { required: true, tooltip: '' },
    DBA: { required: true, tooltip: 'Same month and day as in birth date. 6 years after the year of issue' },
    DBB: { required: true, tooltip: 'You need input the date in MMDDYYYY format' },
    DBC: { required: false, tooltip: '' },
    DBD: { required: true, tooltip: 'You need input the date in MMDDYYYY format' },
    DCA: { required: true, tooltip: '' },
    DCB: { required: true, tooltip: '' },
    DCD: { required: true, tooltip: '' },
    DCF: { required: true, tooltip: 'Option 1 + issue year (YYYY) + number of days from the beginnig of year to issue date + \'0000\' + 4 digits. You can click' },
    DCK: { required: true, tooltip: 'First letter of Last name + 13 digits and letters + \'8M01\'. You can click on the calculator icon to calculate ICN automa' },
    DCS: { required: true, tooltip: '' },
    DDK: { required: false, tooltip: '' },
  },
  NM: {
    DAC: { required: true, tooltip: '' },
    DAD: { required: false, tooltip: 'This field is optional. You can click on the calculator icon to generate random name. Select gender in the field below t' },
    DAG: { required: true, tooltip: '' },
    DAI: { required: true, tooltip: '' },
    DAK: { required: true, tooltip: '' },
    DAQ: { required: true, tooltip: '9 digits. You can click on the calculator icon to calculate number automatically!' },
    DAU: { required: true, tooltip: '' },
    DAW: { required: true, tooltip: '' },
    DAY: { required: true, tooltip: '' },
    DBA: { required: true, tooltip: '' },
    DBB: { required: true, tooltip: 'You need input the date in MMDDYYYY format' },
    DBC: { required: false, tooltip: '' },
    DBD: { required: true, tooltip: 'You need input the date in MMDDYYYY format' },
    DCA: { required: true, tooltip: '' },
    DCB: { required: true, tooltip: '' },
    DCD: { required: true, tooltip: '' },
    DCK: { required: true, tooltip: 'Document number + 01. You can click on the calculator icon to calculate ICN automatically!' },
    DCS: { required: true, tooltip: '' },
    DDK: { required: false, tooltip: '' },
  },
  NV: {
    DAC: { required: true, tooltip: '' },
    DAD: { required: false, tooltip: 'This field is optional. You can click on the calculator icon to generate random name. Select gender in the field below t' },
    DAG: { required: true, tooltip: '' },
    DAH: { required: false, tooltip: '' },
    DAI: { required: true, tooltip: '' },
    DAK: { required: true, tooltip: '' },
    DAQ: { required: true, tooltip: '10 random digits and letter. You can click on the calculator icon to calculate number automatically!' },
    DAU: { required: true, tooltip: '' },
    DAW: { required: true, tooltip: '' },
    DAY: { required: true, tooltip: '' },
    DAZ: { required: true, tooltip: '' },
    DBA: { required: true, tooltip: 'Same month and day as in birth date. 6 years after the year of issue' },
    DBB: { required: true, tooltip: 'You need input the date in MMDDYYYY format' },
    DBC: { required: false, tooltip: '' },
    DBD: { required: true, tooltip: 'You need input the date in MMDDYYYY format' },
    DCA: { required: true, tooltip: '' },
    DCB: { required: true, tooltip: '' },
    DCD: { required: true, tooltip: '' },
    DCF: { required: true, tooltip: '\'0001\' + 17 random digits. You can click on the calculator icon to calculate DD automatically!' },
    DCK: { required: true, tooltip: '\'001\' + 8 random digits + \'01\'.You can click on the calculator icon to calculate ICN automatically!' },
    DCS: { required: true, tooltip: '' },
    DDK: { required: false, tooltip: '' },
  },
  NY: {
    DAC: { required: true, tooltip: 'Enter First name or First + Middle separated by commas.' },
    DAD: { required: false, tooltip: 'This field is optional. You can click on the calculator icon to generate random name. Select gender in the field below t' },
    DAG: { required: true, tooltip: '' },
    DAI: { required: true, tooltip: '' },
    DAK: { required: true, tooltip: '' },
    DAQ: { required: true, tooltip: 'You can click on the calculator icon to calculate number automatically!' },
    DAU: { required: true, tooltip: '' },
    DAY: { required: true, tooltip: '' },
    DBA: { required: true, tooltip: 'Same month and day as in birth date. 8 years after the year of issue' },
    DBB: { required: true, tooltip: 'You need input the date in MMDDYYYY format' },
    DBC: { required: false, tooltip: '' },
    DBD: { required: true, tooltip: 'You need input the date in MMDDYYYY format' },
    DCA: { required: true, tooltip: '' },
    DCB: { required: true, tooltip: '' },
    DCD: { required: true, tooltip: '' },
    DCF: { required: true, tooltip: '10 random characters. You can click on the calculator icon to calculate DD automatically!' },
    DCS: { required: true, tooltip: '' },
    DDK: { required: false, tooltip: '' },
  },
  OH: {
    DAC: { required: true, tooltip: '' },
    DAD: { required: false, tooltip: 'This field is optional. You can click on the calculator icon to generate random name. Select gender in the field below t' },
    DAG: { required: true, tooltip: '' },
    DAI: { required: true, tooltip: '' },
    DAK: { required: true, tooltip: '' },
    DAQ: { required: true, tooltip: 'Two letters and six numbers. You can click on the calculator icon to calculate number automatically!' },
    DAU: { required: true, tooltip: '' },
    DAW: { required: true, tooltip: '' },
    DAY: { required: true, tooltip: '' },
    DAZ: { required: true, tooltip: '' },
    DBA: { required: true, tooltip: 'Same month and day as in birth date. 6 years after the year of issue' },
    DBB: { required: true, tooltip: 'You need input the date in MMDDYYYY format' },
    DBC: { required: false, tooltip: '' },
    DBD: { required: true, tooltip: 'You need input the date in MMDDYYYY format' },
    DCA: { required: true, tooltip: '' },
    DCB: { required: true, tooltip: '' },
    DCD: { required: true, tooltip: '' },
    DCF: { required: true, tooltip: '9 random digits. You can click on the calculator icon to calculate DD automatically!' },
    DCK: { required: true, tooltip: 'random letter + 8 random digits. You can click on the calculator icon to calculate ICN automatically!' },
    DCS: { required: true, tooltip: '' },
    DDK: { required: false, tooltip: '' },
  },
  OK: {
    DAC: { required: true, tooltip: '' },
    DAD: { required: false, tooltip: 'This field is optional. You can click on the calculator icon to generate random name. Select gender in the field below t' },
    DAG: { required: true, tooltip: '' },
    DAI: { required: true, tooltip: '' },
    DAK: { required: true, tooltip: '' },
    DAQ: { required: true, tooltip: 'Letter + 08 + 7 digits. You can click on the calculator icon to calculate number automatically!' },
    DAU: { required: true, tooltip: '' },
    DAW: { required: true, tooltip: '' },
    DAY: { required: true, tooltip: '' },
    DBA: { required: true, tooltip: 'Last day of month. 4 years after the year of issue' },
    DBB: { required: true, tooltip: 'You need input the date in MMDDYYYY format' },
    DBC: { required: false, tooltip: '' },
    DBD: { required: true, tooltip: 'You need input the date in MMDDYYYY format' },
    DCA: { required: true, tooltip: '' },
    DCB: { required: true, tooltip: '' },
    DCD: { required: true, tooltip: '' },
    DCF: { required: true, tooltip: 'Documunet number + Date of birth (MMDDYY) + issue date (MMDDYY) + letter. You can click on the calculator icon to calcul' },
    DCK: { required: true, tooltip: 'Document number + OK + 4 letters + 01. You can click on the calculator icon to calculate ICN automatically!' },
    DCS: { required: true, tooltip: '' },
    DDA: { required: false, tooltip: 'Oklahoma started issuing REAL ID compliant cards on 04/30/2020. If the card issue date is before this date, do not selec' },
    DDK: { required: false, tooltip: '' },
  },
  OR: {
    DAC: { required: true, tooltip: '' },
    DAD: { required: false, tooltip: 'This field is optional. You can click on the calculator icon to generate random name. Select gender in the field below t' },
    DAG: { required: true, tooltip: '' },
    DAH: { required: false, tooltip: '' },
    DAI: { required: true, tooltip: '' },
    DAK: { required: true, tooltip: '' },
    DAQ: { required: true, tooltip: '7 random digits. You can click on the calculator icon to calculate number automatically!' },
    DAU: { required: true, tooltip: '' },
    DAW: { required: true, tooltip: '' },
    DAY: { required: true, tooltip: '' },
    DBA: { required: true, tooltip: 'Same month and day as in birth date. 6 years after the year of issue' },
    DBB: { required: true, tooltip: 'You need input the date in MMDDYYYY format' },
    DBC: { required: false, tooltip: '' },
    DBD: { required: true, tooltip: 'You need input the date in MMDDYYYY format' },
    DCA: { required: true, tooltip: '' },
    DCB: { required: true, tooltip: '' },
    DCD: { required: true, tooltip: '' },
    DCF: { required: true, tooltip: '\'200\' + 6 random digits. You can click on the calculator icon to calculate DD automatically!' },
    DCK: { required: true, tooltip: '\'AA\' + 7 random digits. You can click on the calculator icon to calculate ICN automatically!' },
    DCS: { required: true, tooltip: '' },
    DDK: { required: false, tooltip: '' },
  },
  PA: {
    DAC: { required: true, tooltip: '' },
    DAD: { required: false, tooltip: 'This field is optional. You can click on the calculator icon to generate random name. Select gender in the field below t' },
    DAG: { required: true, tooltip: '' },
    DAI: { required: true, tooltip: '' },
    DAK: { required: true, tooltip: '' },
    DAQ: { required: true, tooltip: '8 random digits. You can click on the calculator icon to calculate number automatically!' },
    DAU: { required: true, tooltip: '' },
    DAW: { required: true, tooltip: '' },
    DAY: { required: true, tooltip: '' },
    DBA: { required: true, tooltip: 'Same month and day as in birth date. 6 years after the year of issue' },
    DBB: { required: true, tooltip: 'You need input the date in MMDDYYYY format' },
    DBC: { required: false, tooltip: '' },
    DBD: { required: true, tooltip: 'You need input the date in MMDDYYYY format' },
    DCA: { required: true, tooltip: '' },
    DCB: { required: true, tooltip: '' },
    DCD: { required: true, tooltip: '' },
    DCF: { required: true, tooltip: 'You can click on the calculator icon to calculate DD automatically!' },
    DCK: { required: true, tooltip: 'You can click on the calculator icon to calculate ICN automatically!' },
    DCS: { required: true, tooltip: '' },
    DDA: { required: false, tooltip: 'Pennsylvania started issuing REAL ID compliant cards on 03/01/2019. If the card issue date is before this date, do not s' },
    DDK: { required: false, tooltip: '' },
  },
  RI: {
    DAC: { required: true, tooltip: '' },
    DAD: { required: false, tooltip: 'This field is optional. You can click on the calculator icon to generate random name. Select gender in the field below t' },
    DAG: { required: true, tooltip: '' },
    DAI: { required: true, tooltip: '' },
    DAK: { required: true, tooltip: '' },
    DAQ: { required: true, tooltip: 'You can click on the calculator icon to calculate number automatically!' },
    DAU: { required: true, tooltip: '' },
    DAW: { required: true, tooltip: '' },
    DAY: { required: true, tooltip: '' },
    DAZ: { required: true, tooltip: '' },
    DBA: { required: true, tooltip: 'Same month and day as in birth date. 5 years after the year of issue' },
    DBB: { required: true, tooltip: 'You need input the date in MMDDYYYY format' },
    DBC: { required: false, tooltip: '' },
    DBD: { required: true, tooltip: 'You need input the date in MMDDYYYY format' },
    DCA: { required: true, tooltip: '' },
    DCB: { required: true, tooltip: '' },
    DCD: { required: true, tooltip: '' },
    DCF: { required: true, tooltip: 'There are two different versions of the document discriminator. After 2017 discriminator: 7 random digits Until 2017, th' },
    DCK: { required: true, tooltip: 'O + Document Number + RI + 2 letters + TL01. You can click on the calculator icon to calculate ICN automatically!' },
    DCS: { required: true, tooltip: '' },
    DDK: { required: false, tooltip: '' },
  },
  SC: {
    DAC: { required: true, tooltip: '' },
    DAD: { required: false, tooltip: 'This field is optional. You can click on the calculator icon to generate random name. Select gender in the field below t' },
    DAG: { required: true, tooltip: '' },
    DAI: { required: true, tooltip: '' },
    DAK: { required: true, tooltip: '' },
    DAQ: { required: true, tooltip: '9 random digits. You can click on the calculator icon to calculate number automatically!' },
    DAU: { required: true, tooltip: '' },
    DAW: { required: true, tooltip: '' },
    DAY: { required: true, tooltip: '' },
    DBA: { required: true, tooltip: 'Same month and day as in birth date. 8 years after the year of issue' },
    DBB: { required: true, tooltip: 'You need input the date in MMDDYYYY format' },
    DBC: { required: false, tooltip: '' },
    DBD: { required: true, tooltip: 'You need input the date in MMDDYYYY format' },
    DCA: { required: true, tooltip: '' },
    DCB: { required: true, tooltip: '' },
    DCD: { required: true, tooltip: '' },
    DCF: { required: true, tooltip: 'You can click on the calculator icon to calculate DD automatically!' },
    DCS: { required: true, tooltip: '' },
    DDK: { required: false, tooltip: '' },
  },
  SD: {
    DAC: { required: true, tooltip: '' },
    DAD: { required: false, tooltip: 'This field is optional. You can click on the calculator icon to generate random name. Select gender in the field below t' },
    DAG: { required: true, tooltip: '' },
    DAI: { required: true, tooltip: '' },
    DAK: { required: true, tooltip: '' },
    DAQ: { required: true, tooltip: '8 digits. You can click on the calculator icon to calculate number automatically!' },
    DAU: { required: true, tooltip: '' },
    DAW: { required: true, tooltip: '' },
    DAY: { required: true, tooltip: '' },
    DBA: { required: true, tooltip: 'Same month and day as in birth date. 5 years after the year of issue' },
    DBB: { required: true, tooltip: 'You need input the date in MMDDYYYY format' },
    DBC: { required: false, tooltip: '' },
    DBD: { required: true, tooltip: 'You need input the date in MMDDYYYY format' },
    DCA: { required: true, tooltip: '' },
    DCB: { required: true, tooltip: '' },
    DCD: { required: true, tooltip: '' },
    DCF: { required: true, tooltip: 'You can click on the calculator icon to calculate DD automatically!' },
    DCK: { required: true, tooltip: '042000 + 10 digits. You can click on the calculator icon to calculate ICN automatically!' },
    DCS: { required: true, tooltip: '' },
    DDK: { required: false, tooltip: '' },
  },
  TN: {
    DAC: { required: true, tooltip: '' },
    DAD: { required: false, tooltip: 'This field is optional. You can click on the calculator icon to generate random name. Select gender in the field below t' },
    DAG: { required: true, tooltip: '' },
    DAH: { required: false, tooltip: '' },
    DAI: { required: true, tooltip: '' },
    DAK: { required: true, tooltip: '' },
    DAQ: { required: true, tooltip: 'You can click on the calculator icon to calculate number automatically!' },
    DAU: { required: true, tooltip: '' },
    DAY: { required: true, tooltip: '' },
    DBA: { required: true, tooltip: 'After 2016 - 8 years after issue. Expires on the day of issue. Until 2016, 3-7 years after issue. Expires on birthday.' },
    DBB: { required: true, tooltip: 'You need input the date in MMDDYYYY format' },
    DBC: { required: false, tooltip: '' },
    DBD: { required: true, tooltip: 'You need input the date in MMDDYYYY format' },
    DCA: { required: true, tooltip: '' },
    DCB: { required: true, tooltip: '' },
    DCD: { required: true, tooltip: '' },
    DCF: { required: true, tooltip: '2 digits + \'0\' + issue date (YYMMDD) + 7 random digits. You can click on the calculator icon to calculate DD automatical' },
    DCK: { required: true, tooltip: 'YY issue year + number of days from beginnig of the year to issue date + \'0101\'. You can click on the calculator icon to' },
    DCS: { required: true, tooltip: '' },
    DDA: { required: false, tooltip: 'Tennessee started issuing REAL ID compliant cards on 07/01/2019. If the card issue date is before this date, do not sele' },
    DDK: { required: false, tooltip: '' },
  },
  TX: {
    DAC: { required: true, tooltip: '' },
    DAD: { required: false, tooltip: 'You can click on the calculator icon to generate random name. Select gender in the field below to specify name gender.' },
    DAG: { required: true, tooltip: '' },
    DAI: { required: true, tooltip: '' },
    DAK: { required: true, tooltip: 'ZIP code (5 digits)' },
    DAQ: { required: true, tooltip: '8 random digits. You can click on the calculator icon to calculate number automatically!' },
    DAU: { required: true, tooltip: '' },
    DAW: { required: true, tooltip: '' },
    DAY: { required: true, tooltip: '' },
    DAZ: { required: true, tooltip: '' },
    DBA: { required: true, tooltip: 'Same month and day as in birth date. 5 years after the year of issue' },
    DBB: { required: true, tooltip: 'You need input the date in MMDDYYYY format' },
    DBC: { required: false, tooltip: '' },
    DBD: { required: true, tooltip: 'Valid issue period is 10/10/2016 - till 02/23/2020' },
    DCA: { required: true, tooltip: '' },
    DCB: { required: true, tooltip: '' },
    DCD: { required: true, tooltip: '' },
    DCF: { required: true, tooltip: '20 digits with custom algorithm. Please click on the calculator icon to calculate DD automatically!' },
    DCK: { required: true, tooltip: 'Document number + 2 spaces. Then date of issue + 1 day in YYYYMMDD format. You can click on the calculator icon to calcu' },
    DCS: { required: true, tooltip: '' },
    DDK: { required: false, tooltip: '' },
  },
  UT: {
    DAC: { required: true, tooltip: '' },
    DAD: { required: false, tooltip: 'This field is optional. You can click on the calculator icon to generate random name. Select gender in the field below t' },
    DAG: { required: true, tooltip: '' },
    DAI: { required: true, tooltip: '' },
    DAK: { required: true, tooltip: '' },
    DAQ: { required: true, tooltip: '9 random digits. You can click on the calculator icon to calculate number automatically!' },
    DAU: { required: true, tooltip: '' },
    DAW: { required: true, tooltip: '' },
    DAY: { required: true, tooltip: '' },
    DAZ: { required: true, tooltip: '' },
    DBA: { required: true, tooltip: 'Same month and day as in birth date. After January 2020 - 8 years after the year of issue. Before January 2020 - 5 years' },
    DBB: { required: true, tooltip: 'You need input the date in MMDDYYYY format' },
    DBC: { required: false, tooltip: '' },
    DBD: { required: true, tooltip: 'You need input the date in MMDDYYYY format' },
    DCA: { required: true, tooltip: '' },
    DCB: { required: true, tooltip: '' },
    DCD: { required: true, tooltip: '' },
    DCF: { required: true, tooltip: '8 random digits. You can click on the calculator icon to calculate DD automatically!' },
    DCK: { required: true, tooltip: 'Document number + \'UT\' + 4 digits and letters + \'01\'. You can click on the calculator icon to calculate ICN automaticall' },
    DCS: { required: true, tooltip: '' },
    DDA: { required: false, tooltip: 'Utah started issuing REAL ID compliant cards on 01/01/2019. If the card issue date is before this date, do not select RE' },
    DDK: { required: false, tooltip: '' },
  },
  VA: {
    DAC: { required: true, tooltip: 'Enter First name or First + Middle separated by commas.' },
    DAG: { required: true, tooltip: '' },
    DAI: { required: true, tooltip: '' },
    DAK: { required: true, tooltip: '' },
    DAQ: { required: true, tooltip: 'Letter + 8 digits. You can click on the calculator icon to calculate number automatically!' },
    DAU: { required: true, tooltip: '' },
    DAW: { required: true, tooltip: '' },
    DAY: { required: true, tooltip: '' },
    DAZ: { required: true, tooltip: '' },
    DBA: { required: true, tooltip: 'Same month and day as in birth date. 8 years after the year of issue' },
    DBB: { required: true, tooltip: 'You need input the date in MMDDYYYY format' },
    DBC: { required: false, tooltip: '' },
    DBD: { required: true, tooltip: 'You need input the date in MMDDYYYY format' },
    DCA: { required: true, tooltip: '' },
    DCB: { required: true, tooltip: '' },
    DCD: { required: true, tooltip: '' },
    DCF: { required: true, tooltip: '\'0\' + 8 digits. You can click on the calculator icon to calculate DD automatically!' },
    DCK: { required: true, tooltip: '\'00601\' + 11 digits. You can click on the calculator icon to calculate ICN automatically!' },
    DCS: { required: true, tooltip: '' },
    DDK: { required: false, tooltip: '' },
  },
  VT: {
    DAC: { required: true, tooltip: '' },
    DAD: { required: false, tooltip: 'This field is optional. You can click on the calculator icon to generate random name. Select gender in the field below t' },
    DAG: { required: true, tooltip: '' },
    DAI: { required: true, tooltip: '' },
    DAK: { required: true, tooltip: '' },
    DAQ: { required: true, tooltip: 'You can click on the calculator icon to calculate number automatically!' },
    DAU: { required: true, tooltip: '' },
    DAW: { required: true, tooltip: '' },
    DAY: { required: true, tooltip: '' },
    DBA: { required: true, tooltip: 'Same month and day as in birth date. 4 years after the year of issue' },
    DBB: { required: true, tooltip: 'You need input the date in MMDDYYYY format' },
    DBC: { required: false, tooltip: '' },
    DBD: { required: true, tooltip: 'You need input the date in MMDDYYYY format' },
    DCA: { required: true, tooltip: '' },
    DCB: { required: true, tooltip: '' },
    DCD: { required: true, tooltip: '' },
    DCF: { required: true, tooltip: 'Issue date (MMDDYY) + 4 digits + DL number. You can click on the calculator icon to calculate DD automatically!' },
    DCS: { required: true, tooltip: '' },
    DDK: { required: false, tooltip: '' },
  },
  WA: {
    DAC: { required: true, tooltip: '' },
    DAD: { required: false, tooltip: 'This field is optional. You can click on the calculator icon to generate random name. Select gender in the field below t' },
    DAG: { required: true, tooltip: '' },
    DAI: { required: true, tooltip: '' },
    DAK: { required: true, tooltip: '' },
    DAQ: { required: true, tooltip: 'WDL + 8 random digits and letters + B. You can click on the calculator icon to calculate number automatically!' },
    DAU: { required: true, tooltip: '' },
    DAW: { required: true, tooltip: '' },
    DAY: { required: true, tooltip: '' },
    DBA: { required: true, tooltip: 'Same month and day as in birth date. 6 years after the year of issue' },
    DBB: { required: true, tooltip: 'You need input the date in MMDDYYYY format' },
    DBC: { required: false, tooltip: '' },
    DBD: { required: true, tooltip: 'You need input the date in MMDDYYYY format' },
    DCA: { required: true, tooltip: '' },
    DCB: { required: true, tooltip: '' },
    DCD: { required: true, tooltip: '' },
    DCF: { required: true, tooltip: 'Document number + audit information You can click on the calculator icon to calculate DD automatically!' },
    DCS: { required: true, tooltip: '' },
    DDK: { required: false, tooltip: '' },
  },
  WI: {
    DAC: { required: true, tooltip: '' },
    DAD: { required: false, tooltip: 'This field is optional. You can click on the calculator icon to generate random name. Select gender in the field below t' },
    DAG: { required: true, tooltip: '' },
    DAI: { required: true, tooltip: '' },
    DAK: { required: true, tooltip: '' },
    DAQ: { required: true, tooltip: 'You can click on the calculator icon to calculate number automatically!' },
    DAU: { required: true, tooltip: '' },
    DAY: { required: true, tooltip: '' },
    DBA: { required: true, tooltip: 'Same month and day as in birth date. 8 years after the year of issue' },
    DBB: { required: true, tooltip: 'You need input the date in MMDDYYYY format' },
    DBC: { required: false, tooltip: '' },
    DBD: { required: true, tooltip: 'You need input the date in MMDDYYYY format' },
    DCA: { required: true, tooltip: '' },
    DCB: { required: true, tooltip: '' },
    DCD: { required: true, tooltip: '' },
    DCF: { required: true, tooltip: '\'OT\' + first letter of Last name + issue date (YYYYMMDD) + 8 digits. You can click on the calculator icon to calculate D' },
    DCK: { required: true, tooltip: '\'0130100\' + 9 digits. You can click on the calculator icon to calculate ICN automatically!' },
    DCS: { required: true, tooltip: '' },
    DDK: { required: false, tooltip: '' },
  },
  WV: {
    DAC: { required: true, tooltip: '' },
    DAD: { required: true, tooltip: 'This field is optional. You can click on the calculator icon to generate random name. Select gender in the field below t' },
    DAG: { required: true, tooltip: '' },
    DAI: { required: true, tooltip: '' },
    DAK: { required: true, tooltip: '' },
    DAQ: { required: true, tooltip: 'You can click on the calculator icon to calculate number automatically!' },
    DAU: { required: true, tooltip: '' },
    DAW: { required: true, tooltip: '' },
    DAY: { required: true, tooltip: '' },
    DBA: { required: true, tooltip: 'Same month and day as in birth date. 8 years after the year of issue' },
    DBB: { required: true, tooltip: 'You need input the date in MMDDYYYY format' },
    DBC: { required: false, tooltip: '' },
    DBD: { required: true, tooltip: 'You need input the date in MMDDYYYY format' },
    DCA: { required: true, tooltip: '' },
    DCB: { required: true, tooltip: '' },
    DCD: { required: true, tooltip: '' },
    DCF: { required: true, tooltip: 'Date of birth (MMDDYY) + First letter of last name + first letter of first name + expiry data (YYDD). You can click on t' },
    DCK: { required: true, tooltip: 'Document number + \'WV\' + 4 letters + \'01\' You can click on the calculator icon to calculate ICN automatically!' },
    DCS: { required: true, tooltip: '' },
    DDK: { required: false, tooltip: '' },
  },
  WY: {
    DAC: { required: true, tooltip: '' },
    DAD: { required: false, tooltip: 'This field is optional. You can click on the calculator icon to generate random name. Select gender in the field below t' },
    DAG: { required: true, tooltip: '' },
    DAI: { required: true, tooltip: '' },
    DAK: { required: true, tooltip: '' },
    DAQ: { required: true, tooltip: 'You can click on the calculator icon to calculate number automatically!' },
    DAU: { required: true, tooltip: '' },
    DAW: { required: true, tooltip: '' },
    DAY: { required: true, tooltip: '' },
    DAZ: { required: true, tooltip: '' },
    DBA: { required: true, tooltip: 'Same month and day as in birth date. After July 2019 5 years, before that 4 years after the year of issue' },
    DBB: { required: true, tooltip: 'You need input the date in MMDDYYYY format' },
    DBC: { required: false, tooltip: '' },
    DBD: { required: true, tooltip: 'You need input the date in MMDDYYYY format' },
    DCA: { required: true, tooltip: '' },
    DCB: { required: true, tooltip: '' },
    DCD: { required: true, tooltip: '' },
    DCF: { required: true, tooltip: '10000 + 5 digits. Same as ICN. You can click on the calculator icon to calculate DD automatically!' },
    DCK: { required: true, tooltip: '10000 + 5 digits. You can click on the calculator icon to calculate ICN automatically!' },
    DCS: { required: true, tooltip: '' },
    DDK: { required: false, tooltip: '' },
  },
};

export function getFields(jurisdictionCode, profileKey) {
  const jur = getJurisdiction(jurisdictionCode);
  const profile = PROFILES[profileKey] || PROFILES.scandit;
  const stateCfg = STATE_FIELDS[jur.code] || null;
  const stateProfile = getStateProfile(jur.code);
  const autoCalcRules = getStateAutoCalcRules(jur.code);
  if (stateProfile?.fields?.length) {
    const sourceFields = stateProfile.fields.map((sourceField) => {
      const definition = sourceField.fieldId ? STANDARD_FIELDS[sourceField.fieldId] : null;
      const fieldId = definition?.fieldId || sourceField.sourceName;
      const stateInfo = definition && stateCfg ? stateCfg[definition.fieldId] : null;
      const autoCalcRule = definition ? autoCalcRules[definition.fieldId] : null;
      const sourceOptions = sourceField.options.map((option) => {
        let value = option.value;
        if (definition?.fieldId === 'DBC') {
          if (/^(m|male)$/i.test(value)) value = '1';
          if (/^(f|female)$/i.test(value)) value = '2';
        } else if (definition?.fieldId === 'DDK') {
          if (/^yes$/i.test(value)) value = '1';
          if (/^no$/i.test(value)) value = '0';
        } else if (definition?.fieldId === 'DDA') {
          if (/^(yes|true|y)$/i.test(value)) value = 'F';
          if (/^(no|false|n)$/i.test(value)) value = 'N';
        }
        return { ...option, value };
      });
      const options = sourceOptions.length ? sourceOptions : (definition?.options || []);
      const revisionOptions = options.filter((option) => option.value !== '');
      const autoFillValue = definition?.fieldId === 'DDB'
        ? options.find((option) => option.value.replace(/[^0-9]/g, '') === stateProfile.cardRevisionDate)?.value
          || stateProfile.cardRevisionDate
          || revisionOptions[revisionOptions.length - 1]?.value
        : undefined;
      const helpText = [
        sourceField.tooltip,
        stateInfo?.tooltip,
        autoCalcRule?.tooltip,
        definition?.helpText,
      ].filter((text, index, texts) => text && texts.indexOf(text) === index).join(' ')
        || `Enter ${sourceField.label} as shown on the card.`;
      const calculator = definition
        ? Boolean(autoCalcRule?.calcOnclick || definition.autoFill || sourceOptions.length || definition.calculator || ['DCS', 'DAC', 'DAD', 'DAG', 'DAI', 'DAK', 'DBB', 'DBD', 'DBA', 'DCE', 'DCL', 'DAU', 'DAW', 'DDE', 'DDF', 'DDG', 'DDD', 'DDK', 'DDM'].includes(definition.fieldId))
        : Boolean(sourceOptions.length || sourceField.placeholder || sourceField.pattern);

      return {
        ...definition,
        fieldId,
        aamvaFieldId: definition?.fieldId || null,
        sourceName: sourceField.sourceName,
        name: definition?.name || `source_${jur.code}_${sourceField.sourceName}`,
        label: sourceField.label || definition?.label || sourceField.sourceName,
        type: definition?.type === 'select' ? 'select' : sourceField.type,
        required: definition ? sourceField.required : false,
        maxLength: sourceField.maxLength || Number(autoCalcRule?.maxLength) || definition?.maxLength,
        placeholder: autoCalcRule?.placeholder || sourceField.placeholder,
        pattern: autoCalcRule?.pattern || sourceField.pattern,
        options,
        calculator,
        autoFillValue,
        autoCalcRule,
        onKeyup: autoCalcRule?.onKeyup || '',
        helpText,
        autoFill: definition?.fieldId === 'DDB' ? 'stateRevision' : definition?.autoFill,
        notEncoded: !definition,
      };
    });
    for (const [fieldId, stateInfo] of Object.entries(stateCfg || {})) {
      if (sourceFields.some((field) => field.aamvaFieldId === fieldId)) continue;
      const definition = STANDARD_FIELDS[fieldId];
      if (!definition) continue;
      const autoCalcRule = autoCalcRules[fieldId];
      sourceFields.push({
        ...definition,
        fieldId,
        aamvaFieldId: fieldId,
        sourceName: fieldId,
        required: stateInfo.required,
        options: definition.options || [],
        calculator: Boolean(autoCalcRule?.calcOnclick || definition.calculator || definition.options?.length),
        placeholder: autoCalcRule?.placeholder || definition.placeholder,
        pattern: autoCalcRule?.pattern || definition.pattern,
        autoCalcRule,
        onKeyup: autoCalcRule?.onKeyup || '',
        helpText: [stateInfo.tooltip, autoCalcRule?.tooltip, definition.helpText]
          .filter((text, index, texts) => text && texts.indexOf(text) === index)
          .join(' ') || `Enter ${definition.label} as shown on the card.`,
      });
    }
    for (const [fieldId, autoCalcRule] of Object.entries(autoCalcRules)) {
      if (sourceFields.some((field) => field.aamvaFieldId === fieldId)) continue;
      const definition = STANDARD_FIELDS[fieldId];
      if (!definition) continue;
      sourceFields.push({
        ...definition,
        aamvaFieldId: fieldId,
        sourceName: fieldId,
        pattern: autoCalcRule.pattern || '',
        placeholder: autoCalcRule.placeholder || '',
        maxLength: Number(autoCalcRule.maxLength) || definition.maxLength,
        calculator: Boolean(autoCalcRule.calcOnclick || definition.calculator || definition.options?.length),
        autoCalcRule,
        onKeyup: autoCalcRule.onKeyup || '',
        helpText: [autoCalcRule.tooltip, definition.helpText]
          .filter((text, index, texts) => text && texts.indexOf(text) === index)
          .join(' '),
      });
    }
    const sourceByFieldId = new Map(
      sourceFields.filter((field) => field.aamvaFieldId).map((field) => [field.aamvaFieldId, field])
    );
    const fields = DEFAULT_FIELD_ORDER
      .filter((fieldId) => sourceByFieldId.has(fieldId))
      .map((fieldId) => sourceByFieldId.get(fieldId));
    fields.push(...sourceFields.filter(
      (field) => field.aamvaFieldId && !DEFAULT_FIELD_ORDER.includes(field.aamvaFieldId)
    ));
    fields.push(...sourceFields.filter((field) => !field.aamvaFieldId));

    for (const fieldId of ['DAJ', 'DCG', 'DDB', 'DDA', 'DCE']) {
      if (sourceByFieldId.has(fieldId)) continue;
      const definition = STANDARD_FIELDS[fieldId];
      fields.push({
        ...definition,
        aamvaFieldId: fieldId,
        required: false,
        helpText: fieldId === 'DDA'
          ? stateProfile.realIdTooltip || definition.helpText
          : fieldId === 'DDB' && !stateProfile.cardRevisionDate
            ? 'This state profile does not provide a card revision date; enter one only if it appears on the card.'
            : definition.helpText,
        calculator: true,
        autoFillValue: fieldId === 'DDB' ? stateProfile.cardRevisionDate || '' : undefined,
      });
    }
    return { fields, jurisdiction: jur, profile };
  }

  const fields = [];
  for (const fieldId of DEFAULT_FIELD_ORDER) {
    const def = STANDARD_FIELDS[fieldId];
    if (!def) continue;
    // If we have state-specific config, only include fields that state uses
    if (stateCfg && !stateCfg[fieldId] && !def.autoFill && !def.alwaysInclude) continue;
    const stateInfo = stateCfg ? stateCfg[fieldId] : null;
    const isRequired = stateInfo ? stateInfo.required : profile.requiredFields.includes(fieldId);
    const tooltip = stateInfo && stateInfo.tooltip ? stateInfo.tooltip : def.helpText;
    fields.push({ ...def, required: isRequired, helpText: tooltip });
  }
  return { fields, jurisdiction: jur, profile };
}

const FIRST_NAMES = ['JAMES','JOHN','ROBERT','MICHAEL','WILLIAM','DAVID','RICHARD','JOSEPH','THOMAS','CHARLES','MARY','PATRICIA','JENNIFER','LINDA','BARBARA','ELIZABETH','SUSAN','JESSICA','SARAH','KAREN'];
const LAST_NAMES = ['SMITH','JOHNSON','WILLIAMS','BROWN','JONES','GARCIA','MILLER','DAVIS','RODRIGUEZ','MARTINEZ','HERNANDEZ','LOPEZ','GONZALEZ','WILSON','ANDERSON','THOMAS','TAYLOR','MOORE','JACKSON','MARTIN'];
const SEMANTIC_TEST_VALUE_FIELDS = new Set([
  'DAD', 'DAG', 'DAI', 'DBB', 'DBC', 'DCA', 'DCB', 'DCD', 'DCS', 'DAC', 'DAU', 'DAW',
]);
const STREET_NAMES = ['MAIN','OAK','MAPLE','ELM','CEDAR','PINE','LAKE','HILL','PARK','RIVER','SUNSET','HIGHLAND','VALLEY','SPRING','FOREST'];
const STREET_TYPES = ['ST','AVE','BLVD','DR','RD','LN','CT','WAY','PL','CIR'];
const CITIES_BY_STATE = {
  NV:['LAS VEGAS','RENO','HENDERSON','SPARKS','NORTH LAS VEGAS'],CA:['LOS ANGELES','SAN DIEGO','SAN JOSE','FRESNO','SACRAMENTO'],TX:['HOUSTON','SAN ANTONIO','DALLAS','AUSTIN','FORT WORTH'],FL:['JACKSONVILLE','MIAMI','TAMPA','ORLANDO','ST PETERSBURG'],NY:['NEW YORK CITY','BUFFALO','ROCHESTER','YONKERS','SYRACUSE'],IL:['CHICAGO','AURORA','JOLIET','NAPERVILLE','ROCKFORD'],PA:['PHILADELPHIA','PITTSBURGH','ALLENTOWN','ERIE','READING'],OH:['COLUMBUS','CLEVELAND','CINCINNATI','TOLEDO','AKRON'],GA:['ATLANTA','COLUMBUS','MACON','SAVANNAH','ATHENS'],NC:['CHARLOTTE','RALEIGH','GREENSBORO','WINSTON-SALEM','DURHAM'],
};
const DEFAULT_CITIES = ['SPRINGFIELD','GREENVILLE','MADISON','RIVERSIDE','FAIRVIEW','NEWPORT','FRANKLIN','CHESTER','CLINTON','DENTON'];

function rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

// Generate a synthetic test value for a field (for the calculator/helper and auto-fill)

// STATE_PATTERNS — generated from state_fields.csv (USA only)
// Field mapping: NUMBER→DAQ, ICN→DCK, DD→DCF, ZIP→DAK
export const STATE_PATTERNS = {
  AK: {
    DAQ: { pattern: '[0-9]{7}', placeholder: '7476172' },
    DCK: { pattern: '[0-9]{10}', placeholder: '1000728920' },
    DCF: { pattern: '[0-9]{7}\\s[0-9]{9}[a-zA-Z]{3}-[01]', placeholder: '8475992 460200826PNV-1' },
    DAK: { pattern: '[0-9]{9}', placeholder: '995162765' },
  },
  AL: {
    DAQ: { pattern: '[0-9]{8}', placeholder: '50764683' },
    DCK: { pattern: '[0-9]+', placeholder: '50764683783372324201' },
    DAK: { pattern: '[0-9]+', placeholder: '330325131' },
  },
  AR: {
    DAQ: { pattern: '9[0-9]{8}', placeholder: '926203938' },
    DCK: { pattern: '02101[0-9]{11}', placeholder: '0210119836604160' },
    DCF: { pattern: '[0-9]{9,10} [0-9]{4}', placeholder: '212232102 2160' },
    DAK: { pattern: '[0-9]{9}', placeholder: '727641027' },
  },
  AZ: {
    DAQ: { pattern: '[a-zA-Z][0-9]{8}', placeholder: 'D28375514' },
    DCK: { pattern: '[a-zA-Z0-9]{11}', placeholder: '48908420864' },
    DCF: { pattern: '[0-9]{4}[a-zA-Z0-9]{2}[0-9]{3}[a-zA-Z][0-9]{4}[a-zA-Z][0-9]', placeholder: '5641GS561D7977J0' },
    DAK: { pattern: '[0-9]{9}', placeholder: '852974501' },
  },
  CA: {
    DAQ: { pattern: '[a-zA-Z][0-9]{7}', placeholder: 'D1234567' },
    DAK: { pattern: '[0-9]+', placeholder: '875420000' },
  },
  CO: {
    DAQ: { pattern: '[0-9]{9}', placeholder: '316168738' },
    DCF: { pattern: '[0-9]{7}', placeholder: '5211068' },
    DAK: { pattern: '[0-9]{9}', placeholder: '806346807' },
  },
  CT: {
    DAQ: { pattern: '[0-2][0-9]{8}', placeholder: '137010702' },
    DCK: { pattern: '[0-9]{9}CT[0-9a-zA-Z]{4}01', placeholder: '137010702CT3ENV01' },
    DCF: { pattern: '[0-9]{12}01[a-zA-Z0-9]{4}', placeholder: '20082614021501MVS1' },
    DAK: { pattern: '[0-9]{9}', placeholder: '060021949' },
  },
  DC: {
    DAQ: { pattern: '[0-9]{7}', placeholder: '' },
    DCF: { pattern: '[0-9]{8}', placeholder: '99423549' },
    DAK: { pattern: '[0-9]{5}-[0-9]{4}', placeholder: '20024-4102' },
  },
  DE: {
    DAQ: { pattern: '[0-9]{7}', placeholder: '1653296' },
    DCK: { pattern: '[0-9]{16}', placeholder: '0110157073938301' },
    DCF: { pattern: 'L[0-9]{8}[0-9]{6}[a-zA-Z]', placeholder: 'L20200826649034C' },
    DAK: { pattern: '[0-9]{9}', placeholder: '199332421' },
  },
  FL: {
    DAQ: { pattern: '[a-zA-Z][0-9]{12}', placeholder: 'H655435851100' },
    DCK: { pattern: '[0-9]{16}', placeholder: '0100385619573853' },
    DCF: { pattern: '[a-zA-Z][0-9]{12}', placeholder: 'N322108265187' },
    DAK: { pattern: '[0-9]+', placeholder: '330325131' },
  },
  GA: {
    DAQ: { pattern: '[0-9]{9}', placeholder: '089007583' },
    DCK: { pattern: '[0-9]{11}', placeholder: '10001308391' },
    DCF: { pattern: '[0-9]{18}', placeholder: '026568004260034885' },
    DAK: { pattern: '[0-9]{5}\\-[0-9]{4}', placeholder: '30047-5809' },
  },
  HI: {
    DAQ: { pattern: 'H[0-9]{8}', placeholder: 'H00716258' },
    DAK: { pattern: '[0-9]{5}', placeholder: '96782' },
  },
  IA: {
    DAQ: { pattern: '[0-9]{3}[a-zA-Z]{2}[0-9]{4}', placeholder: '176ZB6504' },
    DCK: { pattern: '[0-9]{3}[a-zA-Z]{2}[0-9]{4}[0-9]{9}', placeholder: '176ZB6504162400101' },
    DCF: { pattern: '[0-9]{9}[a-zA-Z]{2}[0-9]{4}[MF][0-9]{6}[a-zA-Z]', placeholder: '173604035DJ6050M150124D' },
    DAK: { pattern: '[0-9]{5}', placeholder: '50010' },
  },
  ID: {
    DAQ: { pattern: '[a-zA-Z]{2}[0-9]{6}[a-zA-Z]', placeholder: 'DX121380D' },
    DCK: { pattern: '[a-zA-Z0-9]{18}', placeholder: 'MT942941H147175001' },
    DCF: { pattern: '[0-9]{15}', placeholder: '748649745263992' },
    DAK: { pattern: '[0-9]{9}', placeholder: '836464074' },
  },
  IL: {
    DAQ: { pattern: '[a-zA-Z][0-9]{11}', placeholder: 'D83877907578' },
    DCK: { pattern: '[a-zA-Z0-9]{20}', placeholder: 'D83877907578ILO9TL01' },
    DCF: { pattern: '[a-zA-Z0-9]{17}', placeholder: '20210826494MG4931' },
    DAK: { pattern: '[0-9]{5}', placeholder: '330325131' },
  },
  IN: {
    DAQ: { pattern: '[0-9]{4}-[0-9]{2}-[0-9]{4}', placeholder: '2739-94-6144' },
    DCK: { pattern: '[0-9]{16}', placeholder: '0370101906831627' },
    DCF: { pattern: '[0-9]{14}', placeholder: '08262081000337' },
    DAK: { pattern: '[0-9]{5}', placeholder: '46032' },
  },
  KS: {
    DAQ: { pattern: 'K[0-9]{2}-[0-9]{2}-[0-9]{4}', placeholder: 'K00-45-2697' },
    DCK: { pattern: '[0-9]{5}[a-zA-Z][0-9]{12}', placeholder: '20242K004526970101' },
    DCF: { pattern: '[0-9]{11}[a-zA-Z]{2}[0-9]{5}[mMfF][0-9]{4}[a-zA-Z]{2}', placeholder: '72405466640DJ20240M2615AB' },
    DAK: { pattern: '[0-9]{5}', placeholder: '66215' },
  },
  KY: {
    DAQ: { pattern: '[a-zA-Z][0-9]{8}', placeholder: 'D63091036' },
    DCK: { pattern: '[0-9]{16}', placeholder: '0460107954698883' },
    DCF: { pattern: '[0-9]{16}\\s[0-9]{5}', placeholder: '2022012288217092 01111' },
    DAK: { pattern: '[0-9]{5}', placeholder: '40516' },
  },
  LA: {
    DAQ: { pattern: '[0-9]{9}', placeholder: '007343439' },
    DCK: { pattern: '00700[0-9]{11}', placeholder: '0070031972215065' },
    DAK: { pattern: '[0-9]{5}', placeholder: '70461' },
  },
  MA: {
    DAQ: { pattern: 'S[a-zA-Z0-9]{8}', placeholder: 'S94506149' },
    DCK: { pattern: '[0-9]{5}[a-zA-Z0-9]{9}0601', placeholder: '20239S945061490601' },
    DCF: { pattern: '[0-9]{8}\\sREV\\s02222016', placeholder: '08262020 REV 02222016' },
    DAK: { pattern: '[0-9]{9}', placeholder: '014601131' },
  },
  MD: {
    DAQ: { pattern: 'MD-[0-9]{11}', placeholder: 'MD-10276307832' },
    DCK: { pattern: '10[0-9]{8}', placeholder: '1010273942' },
    DCF: { pattern: '[a-zA-Z0-9]{9}', placeholder: '329878356' },
    DAK: { pattern: '[0-9]{9}', placeholder: '211444416' },
  },
  ME: {
    DAQ: { pattern: '[0-9]{7}', placeholder: '9278451' },
    DCK: { pattern: 'F[0-9]{12}0101', placeholder: 'F2024392784510101' },
    DCF: { pattern: '0{17}[0-9]{8}', placeholder: '0000000000000000035222862' },
    DAK: { pattern: '[0-9]{5}', placeholder: '04765' },
  },
  MI: {
    DAQ: { pattern: '[a-zA-Z]\\s[0-9]{3}\\s[0-9]{3}\\s[0-9]{3}\\s[0-9]{3}', placeholder: 'D 000 429 497 042' },
    DCK: { pattern: '[a-zA-Z][0-9]{24}', placeholder: 'D000429497042197001152024' },
    DAK: { pattern: '[0-9]{9}', placeholder: '488233041' },
  },
  MN: {
    DAQ: { pattern: '[a-zA-Z][0-9]{12}', placeholder: 'T403223261033' },
    DCK: { pattern: '[a-zA-Z][0-9]{12}01[0-9]{3}01', placeholder: 'T4032232610330124301' },
    DCF: { pattern: '0{7}[0-9]{7}', placeholder: '00000006518117' },
    DAK: { pattern: '[0-9]{9}', placeholder: '551222123' },
  },
  MO: {
    DAQ: { pattern: '[a-zA-Z][0-9]{9}', placeholder: 'M096115590' },
    DCK: { pattern: '[0-9]{5}[a-zA-Z]{1}[0-9]{13}', placeholder: '18239S1603164420101' },
    DCF: { pattern: '[0-9]{8}00[0-9]{2}', placeholder: '201447280083' },
    DAK: { pattern: '[0-9]{5}', placeholder: '65610' },
  },
  MS: {
    DAQ: { pattern: '80[0-9]{7}', placeholder: '809430018' },
    DCK: { pattern: '05100[0-9]{11}', placeholder: '0510035326620190' },
    DCF: { pattern: '[0-9][a-zA-Z][a-zA-Z0-9]{7}[0-9][a-zA-Z]{2}[0-9]{5}[MF][0-9]{4}[a-zA-Z]', placeholder: '7TMLJG3R10DJ20240M2415A' },
    DAK: { pattern: '[0-9]{9}', placeholder: '395648019' },
  },
  MT: {
    DAQ: { pattern: '[0-9]{9}41[0-9]{2}', placeholder: '0173719704151' },
    DCK: { pattern: '110[a-zA-Z0-9]{9}MT[a-zA-Z0-9]{3}001', placeholder: '110046MJU9PFMTLLC001' },
    DCF: { pattern: '[0-9]{8}[a-zA-Z0-9]{12}', placeholder: '20200826869633619021' },
    DAK: { pattern: '[0-9]{5}', placeholder: '59901' },
  },
  NC: {
    DAQ: { pattern: '0000[0-9]{8}', placeholder: '000007886015' },
    DCK: { pattern: '0000[0-9]{8}NC[a-zA-Z0-9]{4}01', placeholder: '000007886015NCXR9S01' },
    DCF: { pattern: '00[0-9]{8}', placeholder: '0015245648' },
    DAK: { pattern: '[0-9]{5}[0-9]{4}', placeholder: '270488702' },
  },
  ND: {
    DAQ: { pattern: '[a-zA-Z]{3}[0-9]{6}', placeholder: 'DOE707980' },
    DCK: { pattern: '[0-9]{16}', placeholder: '0340018171565059' },
    DCF: { pattern: '[0-9][a-zA-Z]{3}[0-9]{6}[a-zA-Z]{2}[0-9]{5}[a-z][A-Z][0-9]{2}[a-zA-Z]DZ', placeholder: '7DOE707980DJ78517vP48NDZ' },
    DAK: { pattern: '[0-9]{9}', placeholder: '588014618' },
  },
  NE: {
    DAQ: { pattern: '[a-zA-Z][0-9]{8}', placeholder: 'B94907169' },
    DCK: { pattern: '[a-zA-Z][0-9]{8}[a-zA-Z0-9]{8}', placeholder: 'B94907169NETYCO01' },
    DCF: { pattern: '[0-9]{3}[a-zA-Z][0-9]{8}[a-zA-Z0-9]{13}', placeholder: '054B94907169NETYCO0165097' },
    DAK: { pattern: '[0-9]{9}', placeholder: '685031514' },
  },
  NH: {
    DAQ: { pattern: 'NH[LN][0-9]{8}', placeholder: 'NHL10501102' },
    DCK: { pattern: '0[0-9]{7}', placeholder: '08494818' },
    DCF: { pattern: '0[0-9]{7}', placeholder: '08494818' },
    DAK: { pattern: '[0-9]{9}', placeholder: '032814605' },
  },
  NJ: {
    DAQ: { pattern: '[a-zA-Z][0-9]{14}', placeholder: 'D26229134787273' },
    DCK: { pattern: '[a-zA-Z][a-zA-Z0-9]{17}', placeholder: 'DWCDQP3F98YNLD8M01' },
    DCF: { pattern: '[a-zA-Z0-9]{17}', placeholder: 'WV202023900007318' },
    DAK: { pattern: '[0-9]{9}', placeholder: '079602832' },
  },
  NM: {
    DAQ: { pattern: '[0-9]{9}', placeholder: '036408091' },
    DCK: { pattern: '[0-9]{11}', placeholder: '03640809101' },
    DAK: { pattern: '[0-9]{5}', placeholder: '87111' },
  },
  NV: {
    DAQ: { pattern: '[0-9]{10}', placeholder: '1314295172' },
    DCK: { pattern: '001[0-9]{8}01', placeholder: '0015969352901' },
    DCF: { pattern: '0001[0-9]{17}', placeholder: '000144360705221148270' },
    DAK: { pattern: '[0-9]{9}', placeholder: '891837132' },
  },
  NY: {
    DAQ: { pattern: '[0-9]{9}', placeholder: '759547815' },
    DCF: { pattern: '[a-zA-Z0-9]{10}', placeholder: 'C6JEH2RP06' },
    DAK: { pattern: '[0-9]{9}', placeholder: '144289335' },
  },
  OH: {
    DAQ: { pattern: '[a-zA-Z]{2}[0-9]{6}', placeholder: 'KD298593' },
    DCK: { pattern: '[a-zA-Z][0-9]{8}', placeholder: 'L93259228' },
    DCF: { pattern: '[0-9]{9}', placeholder: '889287786' },
    DAK: { pattern: '[0-9]{9}', placeholder: '441071040' },
  },
  OK: {
    DAQ: { pattern: '[a-zA-Z][0-9]{9}', placeholder: 'S576189157' },
    DCK: { pattern: '[a-zA-Z][0-9]{9}OK[a-zA-Z0-9]{6}', placeholder: 'S576189157OKYRSL01' },
    DCF: { pattern: '[a-zA-Z][0-9]{9}[0-9]{12}[a-zA-Z]', placeholder: 'S576189157011570082620R' },
    DAK: { pattern: '[0-9]{9}', placeholder: '748043721' },
  },
  OR: {
    DAQ: { pattern: '[0-9]{7}', placeholder: '8456732' },
    DCK: { pattern: '[a-zA-Z0-9]{9}', placeholder: 'AA7088159' },
    DCF: { pattern: '200[0-9]{6}', placeholder: '200117013' },
    DAK: { pattern: '[0-9]{5}', placeholder: '97759' },
  },
  PA: {
    DAQ: { pattern: '[0-9]{8}', placeholder: '95744057' },
    DCK: { pattern: '02500[0-9]{11}', placeholder: '0250018505120106' },
    DCF: { pattern: '[0-9]{25}', placeholder: '2023967803632140000058560' },
    DAK: { pattern: '[0-9]{5}', placeholder: '19382' },
  },
  RI: {
    DAQ: { pattern: '[0-9]{7}|[0-9]{8}', placeholder: '3755008' },
    DCK: { pattern: 'O[0-9]{7}RI[a-zA-Z0-9]{3}L01', placeholder: 'O3755008RIJTTL01' },
    DCF: { pattern: '[0-9]+', placeholder: '4052356' },
    DAK: { pattern: '[0-9]{5}', placeholder: '02917' },
  },
  SC: {
    DAQ: { pattern: '[0-9]{9}', placeholder: '107844741' },
    DCF: { pattern: '[0-9]{19}', placeholder: '8513940203280844439' },
    DAK: { pattern: '[0-9]{9}', placeholder: '295688906' },
  },
  SD: {
    DAQ: { pattern: '[0-9]{8}', placeholder: '01384574' },
    DCK: { pattern: '042000[0-9]{10}', placeholder: '' },
    DCF: { pattern: '[0-9]{23}', placeholder: '' },
    DAK: { pattern: '[0-9]{9}', placeholder: '570052115' },
  },
  TN: {
    DAQ: { pattern: '[0-9]{9}', placeholder: '145065024' },
    DCK: { pattern: '[0-9]{14}0101', placeholder: '182381070085030101' },
    DCF: { pattern: '[0-9]{16}', placeholder: '4601808269812264' },
    DAK: { pattern: '[0-9]{9}', placeholder: '371294127' },
  },
  TX: {
    DAQ: { pattern: '[0-9]{8}', placeholder: '24253231' },
    DCK: { pattern: '[0-9\\s]+', placeholder: '10001846127' },
    DCF: { pattern: '[0-9]+', placeholder: '92334268049701405070' },
    DAK: { pattern: '[0-9]+', placeholder: '781024321' },
  },
  UT: {
    DAQ: { pattern: '[0-9]{9}', placeholder: '182162827' },
    DCK: { pattern: '[0-9]{9}UT[a-zA-Z0-9]{4}01', placeholder: '182162827UTQ8CW01' },
    DCF: { pattern: '[0-9]{8}', placeholder: '32656373' },
    DAK: { pattern: '[0-9]{9}', placeholder: '840414307' },
  },
  VA: {
    DAQ: { pattern: '[a-zA-Z][0-9]{8}', placeholder: 'A37262186' },
    DCK: { pattern: '00601[0-9]{11}', placeholder: '0060101096491223' },
    DCF: { pattern: '0[0-9]{8}', placeholder: '099750996' },
    DAK: { pattern: '[0-9]{9}', placeholder: '231143171' },
  },
  VT: {
    DAQ: { pattern: '[0-9]{7}[a-zA-Z0-9]{1}', placeholder: '12345678' },
    DCF: { pattern: '[0-9]{17}[0-9a-zA-Z]{1}', placeholder: '072022123412345678' },
    DAK: { pattern: '[0-9]{5}', placeholder: '05461' },
  },
  WA: {
    DAQ: { pattern: 'WDL[a-zA-Z0-9]{8}B', placeholder: 'WDL5NHA2R3KB' },
    DCF: { pattern: 'WDL[a-zA-Z0-9]{8}B[a-zA-Z][0-9]{12}', placeholder: 'WDL5NHA2R3KBP082625148509' },
    DAK: { pattern: '[0-9]+', placeholder: '980106509' },
  },
  WI: {
    DAQ: { pattern: '[a-zA-Z][0-9]{3}-[0-9]{4}-[0-9]{4}-[0-9]{2}', placeholder: 'D000-4607-0015-00' },
    DCK: { pattern: '0130[0-9]{12}', placeholder: '0130100816849209' },
    DCF: { pattern: 'OT[a-zA-Z]{3}[0-9]{16}', placeholder: 'OTDKF2020082610924996' },
    DAK: { pattern: '[0-9]{9}', placeholder: '530223971' },
  },
  WV: {
    DAQ: { pattern: '[a-zA-Z0-9]{1}[0-9]{6}', placeholder: 'F123785' },
    DCK: { pattern: '[a-zA-Z0-9]{7}WV[a-zA-Z0-9]{6}', placeholder: 'F123785WVFLOY01' },
    DCF: { pattern: '[0-9]{6}[a-zA-Z]{2}[0-9]{4}', placeholder: '011570DJ2601' },
    DAK: { pattern: '[0-9]{5}', placeholder: '25703' },
  },
  WY: {
    DAQ: { pattern: '[0-9]{9}', placeholder: '115919618' },
    DCK: { pattern: '10000[0-9]{5}', placeholder: '1000038857' },
    DCF: { pattern: '10000[0-9]{5}', placeholder: '1000038857' },
    DAK: { pattern: '[0-9]{5}', placeholder: '82001' },
  },
};

function randomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function generateRegexSample(pattern, minimumLength = 0) {
  let position = 0;

  const parseAlternation = () => {
    const branches = [];
    let current = [];
    const sequence = (terms) => () => terms.map((term) => term()).join('');

    while (position < pattern.length) {
      const character = pattern[position];
      if (character === ')') break;
      if (character === '|') {
        branches.push(sequence(current));
        current = [];
        position += 1;
        continue;
      }
      current.push(parseTerm());
    }

    branches.push(sequence(current));
    return () => randomItem(branches)();
  };

  const parseCharacterClass = () => {
    position += 1;
    const negated = pattern[position] === '^';
    if (negated) position += 1;
    const tokens = [];

    while (position < pattern.length && pattern[position] !== ']') {
      let token = pattern[position++];
      if (token === '\\' && position < pattern.length) {
        const escaped = pattern[position++];
        token = escaped === 'd' ? '0123456789'
          : escaped === 'w' ? 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_'
            : escaped === 's' ? ' \t\r\n'
              : escaped;
      }
      tokens.push(token);
    }
    if (pattern[position] === ']') position += 1;

    const allowed = [];
    for (let index = 0; index < tokens.length; index += 1) {
      const start = tokens[index];
      if (
        start.length === 1
        && tokens[index + 1] === '-'
        && tokens[index + 2]?.length === 1
      ) {
        const end = tokens[index + 2].charCodeAt(0);
        for (let code = start.charCodeAt(0); code <= end; code += 1) {
          allowed.push(String.fromCharCode(code));
        }
        index += 2;
      } else {
        allowed.push(...start);
      }
    }

    if (!negated) return () => randomItem(allowed.length ? allowed : ['A']);
    const candidates = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const excluded = new Set(allowed);
    const available = [...candidates].filter((character) => !excluded.has(character));
    return () => randomItem(available);
  };

  const parseAtom = () => {
    const character = pattern[position++];
    if (character === '(') {
      if (pattern.slice(position, position + 2) === '?:') position += 2;
      const group = parseAlternation();
      if (pattern[position] === ')') position += 1;
      return group;
    }
    if (character === '[') {
      position -= 1;
      return parseCharacterClass();
    }
    if (character === '\\' && position < pattern.length) {
      const escaped = pattern[position++];
      if (escaped === 'd') return () => randomItem('0123456789');
      if (escaped === 'D') return () => randomItem('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz');
      if (escaped === 'w') return () => randomItem('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_');
      if (escaped === 'W') return () => randomItem('- _.');
      if (escaped === 's') return () => ' ';
      if (escaped === 'S') return () => randomItem('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789');
      return () => escaped;
    }
    if (character === '^' || character === '$') return () => '';
    if (character === '.') return () => randomItem('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789');
    return () => character;
  };

  const parseTerm = () => {
    const sample = parseAtom();
    if (position >= pattern.length) return sample;

    let minimum = 1;
    let maximum = 1;
    const quantifier = pattern[position];
    if (quantifier === '*') {
      minimum = 0;
      maximum = Math.max(3, minimumLength);
      position += 1;
    } else if (quantifier === '+') {
      maximum = Math.max(3, minimumLength);
      position += 1;
    } else if (quantifier === '?') {
      minimum = 0;
      position += 1;
    } else if (quantifier === '{') {
      const bounds = pattern.slice(position).match(/^\{(\d+)(?:,(\d*))?\}/);
      if (bounds) {
        minimum = Number(bounds[1]);
        maximum = bounds[2] === undefined
          ? minimum
          : bounds[2] === ''
            ? Math.max(minimum + 2, minimumLength)
            : Number(bounds[2]);
        maximum = Math.max(minimum, Math.min(maximum, minimum + 4, 40));
        position += bounds[0].length;
      }
    }
    if (pattern[position] === '?') position += 1;

    const count = minimum + Math.floor(Math.random() * (maximum - minimum + 1));
    return () => Array.from({ length: count }, () => sample()).join('');
  };

  try {
    const sample = parseAlternation()();
    const matcher = new RegExp(`^(?:${pattern})$`);
    return matcher.test(sample) ? sample : '';
  } catch {
    return '';
  }
}

function patternMatches(value, rule) {
  if (!rule?.pattern) return true;
  try {
    return new RegExp(`^(?:${rule.pattern})$`).test(value);
  } catch {
    return false;
  }
}

function randomizePlaceholder(placeholder) {
  return [...placeholder].map((character) => {
    if (/[0-9]/.test(character)) return randomItem('0123456789');
    if (/[A-Z]/.test(character)) return randomItem('ABCDEFGHIJKLMNOPQRSTUVWXYZ');
    if (/[a-z]/.test(character)) return randomItem('abcdefghijklmnopqrstuvwxyz');
    return character;
  }).join('');
}

function generateRuleValue(rule) {
  if (!rule) return '';
  const declaredMinimum = Number(rule.minLength) || 0;
  const placeholderMatches = rule.placeholder && patternMatches(rule.placeholder, rule);
  const minimumLength = placeholderMatches && rule.placeholder.length < declaredMinimum
    ? rule.placeholder.length
    : declaredMinimum;
  const maximumLength = Number(rule.maxLength) || 40;
  const meetsLength = (value) =>
    value.length >= minimumLength && value.length <= maximumLength;
  if (!rule.pattern) {
    const value = rule.placeholder ? randomizePlaceholder(rule.placeholder) : '';
    return meetsLength(value) ? value : '';
  }
  if (placeholderMatches && meetsLength(rule.placeholder)) {
    const sample = randomizePlaceholder(rule.placeholder);
    if (meetsLength(sample) && patternMatches(sample, rule)) return sample;
  }
  for (let attempt = 0; attempt < 40; attempt += 1) {
    const sample = generateRegexSample(rule.pattern, minimumLength);
    if (sample && meetsLength(sample) && patternMatches(sample, rule)) return sample;
  }
  if (rule.placeholder && meetsLength(rule.placeholder) && patternMatches(rule.placeholder, rule)) {
    const sample = randomizePlaceholder(rule.placeholder);
    if (meetsLength(sample) && patternMatches(sample, rule)) return sample;
  }
  return '';
}

function formatDateParts(year, month, day) {
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return `${String(month).padStart(2, '0')}${String(Math.min(day, lastDay)).padStart(2, '0')}${year}`;
}

function randomIssueDate(rule) {
  const currentYear = new Date().getFullYear();
  const range = rule?.calcOnclick?.match(/makeRandomDOI\(\s*(\d{4})(?:\s*,\s*(\d{4}))?/i);
  let start = range ? new Date(Date.UTC(Number(range[1]), 0, 1)) : new Date(Date.UTC(currentYear - 2, 0, 1));
  let end = range?.[2] ? new Date(Date.UTC(Number(range[2]), 11, 31)) : new Date();
  const tooltipStart = rule?.tooltip?.match(/valid issue period is\s+(\d{1,2})\/(\d{1,2})\/(\d{4})/i);
  if (tooltipStart) {
    const fromTooltip = new Date(Date.UTC(Number(tooltipStart[3]), Number(tooltipStart[1]) - 1, Number(tooltipStart[2])));
    if (fromTooltip > start) start = fromTooltip;
  }
  if (end > new Date()) end = new Date();
  if (start > end) start = new Date(Date.UTC(currentYear, 0, 1));

  for (let attempt = 0; attempt < 60; attempt += 1) {
    const date = new Date(start.getTime() + Math.random() * Math.max(1, end.getTime() - start.getTime()));
    const value = formatDateParts(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate());
    if (patternMatches(value, rule)) return value;
  }
  return generateRuleValue(rule);
}

function expiryYears(rule, issueRule) {
  const source = issueRule?.onKeyup?.match(/(?:makeDOEfromDOI(?:_full)?|makeRandomDOE(?:_AL)?|calculate_DOE)\(\s*(\d+)/i)
    || rule?.calcOnclick?.match(/(?:makeDOEfromDOI(?:_full)?|makeRandomDOE(?:_AL)?|calculate_DOE)\(\s*(\d+)/i)
    || rule?.tooltip?.match(/(\d+)\s+years? after/i);
  return source ? Number(source[1]) : 4;
}

function calculateExpiryDate(rule, issueRule, data) {
  const years = expiryYears(rule, issueRule);
  const issue = String(data.issueDate || '').replace(/\D/g, '');
  const birth = String(data.birthDate || '').replace(/\D/g, '');
  const now = new Date();
  const issueYear = issue.length === 8 ? Number(issue.slice(4)) : now.getFullYear();
  const sameAsBirth = /month and day.{0,20}birth date/i.test(rule?.tooltip || '');
  const month = sameAsBirth && birth.length === 8
    ? Number(birth.slice(0, 2))
    : issue.length === 8
      ? Number(issue.slice(0, 2))
      : now.getMonth() + 1;
  let day = sameAsBirth && birth.length === 8
    ? Number(birth.slice(2, 4))
    : issue.length === 8
      ? Number(issue.slice(2, 4))
      : now.getDate();
  if (/month and day\s*\+\s*1/i.test(rule?.tooltip || '')) day += 1;
  const candidate = formatDateParts(issueYear + years, month, day);
  return patternMatches(candidate, rule) ? candidate : generateRuleValue(rule);
}

function generateFromStatePattern(fieldId, jurisdictionCode) {
  const pat = STATE_PATTERNS[jurisdictionCode]?.[fieldId];
  if (pat?.placeholder) return pat.placeholder;
  return null;
}

export function generateTestValue(fieldId, jurisdictionCode, data = {}) {
  const jur = getJurisdiction(jurisdictionCode);
  const stateProfile = getStateProfile(jur?.code);
  const stateRules = getStateAutoCalcRules(jur?.code);
  const stateField = stateProfile?.fields?.find((field) => field.fieldId === fieldId);
  const autoCalcRule = stateRules[fieldId] || stateField;
  const useSemanticValue = SEMANTIC_TEST_VALUE_FIELDS.has(fieldId);

  if (fieldId === 'DBD' && stateRules.DBD) {
    return randomIssueDate(stateRules.DBD);
  }
  if (fieldId === 'DBA' && stateRules.DBA) {
    return calculateExpiryDate(stateRules.DBA, stateRules.DBD, data);
  }
  if (!useSemanticValue && (autoCalcRule?.pattern || autoCalcRule?.placeholder)) {
    const generated = generateRuleValue(autoCalcRule);
    if (generated) return generated;
  }

  // Use source-profile patterns before older hardcoded examples.
  if (!useSemanticValue && (stateField?.pattern || stateField?.placeholder)) {
    const generated = generateRuleValue(stateField);
    if (generated) return generated;
  }

  const fromPattern = generateFromStatePattern(fieldId, jur?.code);
  if (fromPattern) return fromPattern;

  // Hawaii safer defaults (based on verified raw payloads)
  if (jur && jur.code === 'HI') {
    if (fieldId === 'DDE' || fieldId === 'DDF' || fieldId === 'DDG') return 'U';
    if (fieldId === 'DCB') return 'NONE';
    if (fieldId === 'DCD') return 'NONE';
    if (fieldId === 'DAH') return 'H';
    if (fieldId === 'DAD') return 'NONE';
    if (fieldId === 'DCF') {
      // Format: YYYYMMDD + digits/letters + -ICWH
      const issue = (data.issueDate || '').replace(/[^0-9]/g, '');
      const ymd = issue.length === 8 ? issue.slice(4) + issue.slice(0, 4) : '20240130';
      const rand = Math.floor(100000000000 + Math.random() * 900000000000).toString().slice(0, 12);
      return ymd + rand + '-ICWH';
    }
    if (fieldId === 'DCJ') {
      const issue = (data.issueDate || '').replace(/[^0-9]/g, '');
      const ymd = issue.length === 8 ? issue.slice(4) + issue.slice(0, 4) : '20240130';
      return ymd + '_106336_2_' + Math.floor(100 + Math.random() * 900);
    }
  }

  switch (fieldId) {
    case 'DAQ': {
      if (jur && jur.code === 'MO') {
        const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const randomLetter = letters[Math.floor(Math.random() * letters.length)];
        const randomNumbers = Math.floor(Math.random() * 90000000 + 10000000).toString();
        return randomLetter + "0" + randomNumbers;
      }
      const num = Math.floor(Math.random() * 9000000 + 1000000).toString();
      return jur.code + num;
    }
    case 'DCS': return rand(LAST_NAMES);
    case 'DAC': return rand(FIRST_NAMES);
    case 'DAD': {
      if (Math.random() > 0.5) return rand(FIRST_NAMES).substring(0, 1) + rand('AEIOULMNRST');
      return '';
    }
    case 'DAG': {
      const num = Math.floor(Math.random() * 9900 + 100);
      return `${num} ${rand(STREET_NAMES)} ${rand(STREET_TYPES)}`;
    }
    case 'DAI': {
      const cities = CITIES_BY_STATE[jur.code] || DEFAULT_CITIES;
      return rand(cities);
    }
    case 'DAJ': return jur.code;
    case 'DAK': {
      const zip = Math.floor(Math.random() * 90000 + 10000).toString();
      return zip;
    }
    case 'DCG': return 'USA';
    case 'DBB': {
      const year = Math.floor(Math.random() * 55 + 1945);
      const month = String(Math.floor(Math.random() * 12 + 1)).padStart(2, '0');
      const day = String(Math.floor(Math.random() * 28 + 1)).padStart(2, '0');
      return month + day + year;
    }
    case 'DBD': {
      const now = new Date();
      const past = new Date(now.getFullYear() - Math.floor(Math.random() * 3), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28 + 1));
      return String(past.getMonth() + 1).padStart(2, '0') + String(past.getDate()).padStart(2, '0') + past.getFullYear();
    }
    case 'DBA': {
      const now = new Date();
      const future = new Date(now.getFullYear() + 4 + Math.floor(Math.random() * 4), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28 + 1));
      return String(future.getMonth() + 1).padStart(2, '0') + String(future.getDate()).padStart(2, '0') + future.getFullYear();
    }
    case 'DBC': return rand(['1', '2']);
    case 'DAU': {
      const randomHeight = Math.floor(Math.random() * 20 + 60).toString();
      if (jur && jur.aamvaVersion === '04') {
        return randomHeight + ' in ';
      }
      return randomHeight.padStart(3, '0') + ' in';
    }
    case 'DAW': return String(Math.floor(Math.random() * 150 + 100)); // 100-250 lbs
    case 'DDB': {
      if (!stateProfile) return '';
      const revisionOptions = (stateProfile.fields.find((field) => field.fieldId === 'DDB')?.options || [])
        .filter((option) => option.value !== '');
      return revisionOptions.find(
        (option) => option.value.replace(/[^0-9]/g, '') === stateProfile.cardRevisionDate
      )?.value || stateProfile.cardRevisionDate || revisionOptions[revisionOptions.length - 1]?.value || '';
    }
    case 'DCE': {
      const weight = Number(String(data.weight || '').replace(/[^0-9]/g, ''));
      if (!Number.isFinite(weight) || weight <= 0) return String(Math.floor(Math.random() * 10));
      if (weight <= 70) return '0';
      return String(Math.min(9, Math.ceil((weight - 70) / 30)));
    }
    case 'DDJ': {
      const birthDate = String(data.birthDate || '').replace(/[^0-9]/g, '');
      if (birthDate.length !== 8) return '';
      const month = Number(birthDate.slice(0, 2));
      const day = Number(birthDate.slice(2, 4));
      const year = Number(birthDate.slice(4));
      const turns21 = new Date(Date.UTC(year + 21, month - 1, day));
      return `${String(turns21.getUTCMonth() + 1).padStart(2, '0')}${String(turns21.getUTCDate()).padStart(2, '0')}${turns21.getUTCFullYear()}`;
    }
    case 'DAY': return rand(['BLK','BRO','BLU','GRN','GRY','HAZ']);
    case 'DAZ': return rand(['BLK','BRO','BLN','RED','GRY']);
    case 'DCA': return rand(['A','B','C','D']);
    case 'DCB': return 'NONE';
    case 'DCD': return rand(['H','M','N','']);
    case 'DDK': return '0';
    case 'DDE': return 'N';
    case 'DDF': return 'N';
    case 'DDG': return 'N';
    case 'DCF': {
      if (jur && jur.code === 'MO') {
        const currentYear = String(new Date().getFullYear()).slice(-2);
        const rand4 = Math.floor(1000 + Math.random() * 9000).toString();
        const rand2 = Math.floor(10 + Math.random() * 90).toString();
        return currentYear + "14" + rand4 + "00" + rand2;
      }
      let val = '';
      for (let i = 0; i < 16; i++) val += Math.floor(Math.random() * 16).toString(16).toUpperCase();
      return val;
    }
    case 'DCK': {
      if (jur && jur.code === 'MO') {
        const now = new Date();
        const start = new Date(now.getFullYear(), 0, 0);
        const diff = (now - start) + ((start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000);
        const oneDay = 1000 * 60 * 60 * 24;
        const dayOfYear = Math.floor(diff / oneDay);
        
        const daysPadded = String(dayOfYear + 2).padStart(3, '0');
        const currentYear = String(now.getFullYear()).slice(-2);
        
        const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const randomLetter = letters[Math.floor(Math.random() * letters.length)];
        const randomNumbers = Math.floor(Math.random() * 90000000 + 10000000).toString();
        const mockDocNum = randomLetter + "0" + randomNumbers;
        
        return currentYear + daysPadded + mockDocNum + "0101";
      }
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let val = '';
      for (let i = 0; i < 12; i++) val += chars[Math.floor(Math.random() * chars.length)];
      return val;
    }
    case 'DDA': return 'F'; // INJEKSI STATUS REAL ID (F = Fully Compliant)
    default: return '';
  }
}