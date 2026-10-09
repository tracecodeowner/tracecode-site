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
  { value: 'BLD', label: 'Blonde' },
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
  DAI: { fieldId: 'DAI', label: 'City', name: 'city', type: 'text', required: true, maxLength: 20, helpText: 'City', row: 2 },
  DAJ: { fieldId: 'DAJ', label: 'State', name: 'state', type: 'text', required: true, maxLength: 2, helpText: 'Jurisdiction (2-letter code)', row: 2, autoFill: 'jurisdiction' },
  DAK: { fieldId: 'DAK', label: 'ZIP Code', name: 'zipCode', type: 'text', required: true, maxLength: 11, helpText: 'Postal Code', validator: 'zipCode', row: 2 },
  DCG: { fieldId: 'DCG', label: 'Country', name: 'country', type: 'text', required: true, maxLength: 3, helpText: 'Country (ISO 3-letter)', row: 2, autoFill: 'country' },
  DCE: { fieldId: 'DCE', label: 'DL Class', name: 'dlClass', type: 'text', required: false, maxLength: 5, helpText: 'Driver License Class (jurisdiction-specific)', row: 2, jurisdictionSpecific: true },
  DBC: { fieldId: 'DBC', label: 'Sex', name: 'sex', type: 'select', required: true, options: SEX_OPTIONS, helpText: 'Sex code', row: 2 },
  DDJ: { fieldId: 'DDJ', label: 'Organ Donor', name: 'organDonor', type: 'select', required: false, options: [{ value: '0', label: 'No' }, { value: '1', label: 'Yes' }, { value: 'U', label: 'Unknown' }], helpText: 'Organ donor indicator', row: 2, jurisdictionSpecific: true },
  DBB: { fieldId: 'DBB', label: 'Birth Date', name: 'birthDate', type: 'date', required: true, displayFormat: 'MMDDYYYY', outputFormat: 'MMDDCCYY', validator: 'date', helpText: 'Date of Birth (MMDDYYYY)', calculator: false, row: 3 },
  DBD: { fieldId: 'DBD', label: 'Issue Date', name: 'issueDate', type: 'date', required: true, displayFormat: 'MMDDYYYY', outputFormat: 'MMDDCCYY', validator: 'date', helpText: 'Date of Issue (MMDDYYYY)', row: 3 },
  DBA: { fieldId: 'DBA', label: 'Expiry Date', name: 'expiryDate', type: 'date', required: true, displayFormat: 'MMDDYYYY', outputFormat: 'MMDDCCYY', validator: 'date', helpText: 'Date of Expiration (MMDDYYYY)', row: 3 },
  DCK: { fieldId: 'DCK', label: 'ICN', name: 'icn', type: 'text', required: false, maxLength: 25, helpText: 'Inventory Control Number', calculator: true, row: 3, jurisdictionSpecific: true },
  DCF: { fieldId: 'DCF', label: 'DD / Document Discriminator', name: 'dd', type: 'text', required: false, maxLength: 25, helpText: 'Document Discriminator', calculator: true, row: 3, jurisdictionSpecific: true },
  DAR: { fieldId: 'DAR', label: 'Restrictions', name: 'restrictions', type: 'text', required: false, maxLength: 12, helpText: 'Driving Restrictions (jurisdiction-specific codes)', row: 4, jurisdictionSpecific: true },
  DAS: { fieldId: 'DAS', label: 'Endorsement', name: 'endorsement', type: 'text', required: false, maxLength: 5, helpText: 'Driving Endorsements (jurisdiction-specific codes)', row: 4, jurisdictionSpecific: true },
  DAU: { fieldId: 'DAU', label: 'Height', name: 'height', type: 'number', required: false, unit: 'in', min: 36, max: 96, helpText: 'Height in inches (e.g. 69)', validator: 'height', row: 4 },
  DDB: { fieldId: 'DDB', label: 'Weight', name: 'weight', type: 'number', required: false, unit: 'lb', min: 50, max: 500, helpText: 'Weight in pounds (e.g. 169)', validator: 'weight', row: 4 },
  DAY: { fieldId: 'DAY', label: 'Eye Color', name: 'eyeColor', type: 'select', required: false, options: EYE_COLORS, helpText: 'Eye Color (ANSI D-20)', row: 4 },
  DAZ: { fieldId: 'DAZ', label: 'Hair Color', name: 'hairColor', type: 'select', required: false, options: HAIR_COLORS, helpText: 'Hair Color (ANSI D-20)', row: 4 },
  DDE: { fieldId: 'DDE', label: 'Last Name Truncated', name: 'lastNameTruncated', type: 'select', required: false, options: [{ value: 'T', label: 'Truncated' }, { value: 'N', label: 'Not Truncated' }], helpText: 'Last name truncation indicator', row: 4 },
  DDF: { fieldId: 'DDF', label: 'First Name Truncated', name: 'firstNameTruncated', type: 'select', required: false, options: [{ value: 'T', label: 'Truncated' }, { value: 'N', label: 'Not Truncated' }], helpText: 'First name truncation indicator', row: 4 },
  DDG: { fieldId: 'DDG', label: 'Middle Name Truncated', name: 'middleNameTruncated', type: 'select', required: false, options: [{ value: 'T', label: 'Truncated' }, { value: 'N', label: 'Not Truncated' }], helpText: 'Middle name truncation indicator', row: 4 },
  
  // ✦ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ✦
  // FIELD DDA: KUNCI UTAMA UNTUK STATUS "REAL ID"
  // ✦ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ✦
  DDA: { fieldId: 'DDA', label: 'Real ID Compliance', name: 'complianceType', type: 'select', required: false, options: [{ value: 'F', label: 'Fully Compliant (Real ID)' }, { value: 'N', label: 'Non-Compliant' }], helpText: 'F = Real ID, N = Standard', row: 4 },
};

// Default field order for DL subfile (AAMVA standard ordering)
export const DEFAULT_FIELD_ORDER = [
  'DAQ', // Pindahkan DL Number ke URUTAN PERTAMA
  'DCS', 'DDE', 'DAC', 'DDF', 'DAD', 'DDG', 'DCU',
  'DAG', 'DAI', 'DAJ', 'DAK', 'DCG',
  'DBB', 'DBD', 'DBA',
  'DBC', 'DAU', 'DDB', 'DAY', 'DAZ',
  'DCE', 'DAR', 'DAS',
  'DCF', 'DCK', 'DDJ', 'DDA', // DDA ditambahkan di sini
];

// Profile presets — configurable scanner/decoder profiles
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
  { name: 'Alabama', code: 'AL', iin: '636033', aamvaVersion: '10', jurisdictionVersion: '0403', revision: 'Rev. 01/01/2022 (0403)', includeZk: false },
  { name: 'Alaska', code: 'AK', iin: '636059', aamvaVersion: '10', jurisdictionVersion: '0901', revision: 'Rev. 01/01/2021 (0901)', includeZk: false },
  { name: 'Arizona', code: 'AZ', iin: '636026', aamvaVersion: '10', jurisdictionVersion: '1001', revision: 'Rev. 01/01/2023 (1001)', includeZk: false },
  { name: 'Arkansas', code: 'AR', iin: '636021', aamvaVersion: '10', jurisdictionVersion: '0900', revision: 'Rev. 01/01/2020 (0900)', includeZk: false },
  { name: 'California', code: 'CA', iin: '636014', aamvaVersion: '10', jurisdictionVersion: '1001', revision: 'Rev. 01/01/2024 (1001)', includeZk: false },
  { name: 'Colorado', code: 'CO', iin: '636020', aamvaVersion: '10', jurisdictionVersion: '1001', revision: 'Rev. 01/01/2022 (1001)', includeZk: false },
  { name: 'Connecticut', code: 'CT', iin: '636006', aamvaVersion: '10', jurisdictionVersion: '0900', revision: 'Rev. 01/01/2020 (0900)', includeZk: false },
  { name: 'Delaware', code: 'DE', iin: '636011', aamvaVersion: '10', jurisdictionVersion: '0900', revision: 'Rev. 01/01/2020 (0900)', includeZk: false },
  { name: 'District of Columbia', code: 'DC', iin: '636043', aamvaVersion: '10', jurisdictionVersion: '0900', revision: 'Rev. 01/01/2020 (0900)', includeZk: false },
  { name: 'Florida', code: 'FL', iin: '636010', aamvaVersion: '10', jurisdictionVersion: '0900', revision: 'Rev. 01/01/2020 (0900)', includeZk: false },
  { name: 'Georgia', code: 'GA', iin: '636055', aamvaVersion: '10', jurisdictionVersion: '0900', revision: 'Rev. 01/01/2020 (0900)', includeZk: false },
  { name: 'Hawaii', code: 'HI', iin: '636047', aamvaVersion: '04', jurisdictionVersion: '00', revision: 'Rev. 01/01/2020 (0400)', includeZk: false },
  { name: 'Idaho', code: 'ID', iin: '636050', aamvaVersion: '10', jurisdictionVersion: '1009', revision: 'Rev. 01/01/2023 (1009)', includeZk: false },
  { name: 'Illinois', code: 'IL', iin: '636035', aamvaVersion: '10', jurisdictionVersion: '0800', revision: 'Rev. 01/01/2016 (0800)', includeZk: false },
  { name: 'Indiana', code: 'IN', iin: '636037', aamvaVersion: '10', jurisdictionVersion: '0900', revision: 'Rev. 01/01/2020 (0900)', includeZk: false },
  { name: 'Iowa', code: 'IA', iin: '636018', aamvaVersion: '10', jurisdictionVersion: '0900', revision: 'Rev. 01/01/2017 (0900)', includeZk: false },
  { name: 'Kansas', code: 'KS', iin: '636022', aamvaVersion: '10', jurisdictionVersion: '0900', revision: 'Rev. 01/01/2020 (0900)', includeZk: false },
  { name: 'Kentucky', code: 'KY', iin: '636046', aamvaVersion: '10', jurisdictionVersion: '0900', revision: 'Rev. 01/01/2018 (0900)', includeZk: false },
  { name: 'Louisiana', code: 'LA', iin: '636007', aamvaVersion: '10', jurisdictionVersion: '0900', revision: 'Rev. 01/01/2020 (0900)', includeZk: false },
  { name: 'Maine', code: 'ME', iin: '636041', aamvaVersion: '10', jurisdictionVersion: '0900', revision: 'Rev. 01/01/2020 (0900)', includeZk: false },
  { name: 'Maryland', code: 'MD', iin: '636003', aamvaVersion: '10', jurisdictionVersion: '0900', revision: 'Rev. 01/01/2021 (0900)', includeZk: false },
  { name: 'Massachusetts', code: 'MA', iin: '636002', aamvaVersion: '10', jurisdictionVersion: '0800', revision: 'Rev. 01/01/2016 (0800)', includeZk: false },
  { name: 'Michigan', code: 'MI', iin: '636032', aamvaVersion: '10', jurisdictionVersion: '0800', revision: 'Rev. 01/01/2020 (0800)', includeZk: false },
  { name: 'Minnesota', code: 'MN', iin: '636038', aamvaVersion: '10', jurisdictionVersion: '0900', revision: 'Rev. 01/01/2020 (0900)', includeZk: false },
  { name: 'Mississippi', code: 'MS', iin: '636051', aamvaVersion: '10', jurisdictionVersion: '1000', revision: 'Rev. 01/01/2023 (1000)', includeZk: false },
  { name: 'Missouri', code: 'MO', iin: '636030', aamvaVersion: '10', jurisdictionVersion: '0900', revision: 'Rev. 01/01/2020 (0900)', includeZk: false },
  { name: 'Montana', code: 'MT', iin: '636008', aamvaVersion: '10', jurisdictionVersion: '0800', revision: 'Rev. 01/01/2016 (0800)', includeZk: false },
  { name: 'Nebraska', code: 'NE', iin: '636054', aamvaVersion: '10', jurisdictionVersion: '1000', revision: 'Rev. 01/01/2021 (1000)', includeZk: false },
  { name: 'Nevada', code: 'NV', iin: '636049', aamvaVersion: '10', jurisdictionVersion: '1000', revision: 'Rev. 05/24/2021 (1000)', includeZk: false },
  { name: 'New Hampshire', code: 'NH', iin: '636039', aamvaVersion: '10', jurisdictionVersion: '1000', revision: 'Rev. 01/01/2024 (1000)', includeZk: false },
  { name: 'New Jersey', code: 'NJ', iin: '636036', aamvaVersion: '10', jurisdictionVersion: '0402', revision: 'Rev. 01/01/2020 (0402)', includeZk: false },
  { name: 'New Mexico', code: 'NM', iin: '636009', aamvaVersion: '10', jurisdictionVersion: '0800', revision: 'Rev. 01/01/2016 (0800)', includeZk: false },
  { name: 'New York', code: 'NY', iin: '636001', aamvaVersion: '10', jurisdictionVersion: '1004', revision: 'Rev. 01/01/2022 (1004)', includeZk: false },
  { name: 'North Carolina', code: 'NC', iin: '636004', aamvaVersion: '10', jurisdictionVersion: '0800', revision: 'Rev. 01/01/2016 (0800)', includeZk: false },
  { name: 'North Dakota', code: 'ND', iin: '636034', aamvaVersion: '10', jurisdictionVersion: '1000', revision: 'Rev. 01/01/2023 (1000)', includeZk: false },
  { name: 'Ohio', code: 'OH', iin: '636023', aamvaVersion: '10', jurisdictionVersion: '0901', revision: 'Rev. 01/01/2020 (0901)', includeZk: false },
  { name: 'Oklahoma', code: 'OK', iin: '636058', aamvaVersion: '10', jurisdictionVersion: '0900', revision: 'Rev. 01/01/2020 (0900)', includeZk: false },
  { name: 'Oregon', code: 'OR', iin: '636029', aamvaVersion: '10', jurisdictionVersion: '0900', revision: 'Rev. 01/01/2020 (0900)', includeZk: false },
  { name: 'Pennsylvania', code: 'PA', iin: '636025', aamvaVersion: '10', jurisdictionVersion: '1000', revision: 'Rev. 01/01/2022 (1000)', includeZk: false },
  { name: 'Rhode Island', code: 'RI', iin: '636052', aamvaVersion: '10', jurisdictionVersion: '0801', revision: 'Rev. 01/01/2022 (0801)', includeZk: false },
  { name: 'South Carolina', code: 'SC', iin: '636005', aamvaVersion: '10', jurisdictionVersion: '0900', revision: 'Rev. 01/01/2020 (0900)', includeZk: false },
  { name: 'South Dakota', code: 'SD', iin: '636042', aamvaVersion: '10', jurisdictionVersion: '0900', revision: 'Rev. 01/01/2020 (0900)', includeZk: false },
  { name: 'Tennessee', code: 'TN', iin: '636053', aamvaVersion: '10', jurisdictionVersion: '0600', revision: 'Rev. 01/01/2017 (0600)', includeZk: false },
  { name: 'Texas', code: 'TX', iin: '636015', aamvaVersion: '10', jurisdictionVersion: '0900', revision: 'Rev. 01/01/2022 (0900)', includeZk: false },
  { name: 'Utah', code: 'UT', iin: '636040', aamvaVersion: '10', jurisdictionVersion: '1000', revision: 'Rev. 01/01/2021 (1000)', includeZk: false },
  { name: 'Vermont', code: 'VT', iin: '636024', aamvaVersion: '10', jurisdictionVersion: '0902', revision: 'Rev. 01/01/2020 (0902)', includeZk: false },
  { name: 'Virginia', code: 'VA', iin: '636000', aamvaVersion: '10', jurisdictionVersion: '0300', revision: 'Rev. 01/01/2018 (0300)', includeZk: false },
  { name: 'Washington', code: 'WA', iin: '636045', aamvaVersion: '10', jurisdictionVersion: '0901', revision: 'Rev. 01/01/2025 (0901)', includeZk: false },
  { name: 'West Virginia', code: 'WV', iin: '636061', aamvaVersion: '10', jurisdictionVersion: '0900', revision: 'Rev. 01/01/2020 (0900)', includeZk: false },
  { name: 'Wisconsin', code: 'WI', iin: '636031', aamvaVersion: '10', jurisdictionVersion: '1002', revision: 'Rev. 01/01/2023 (1002)', includeZk: false },
  { name: 'Wyoming', code: 'WY', iin: '636060', aamvaVersion: '10', jurisdictionVersion: '0900', revision: 'Rev. 01/01/2020 (0900)', includeZk: false },
];

export function getJurisdiction(code) {
  return JURISDICTIONS.find(j => j.code === code) || JURISDICTIONS.find(j => j.code === 'NV');
}

export function getFieldDef(fieldId) {
  return STANDARD_FIELDS[fieldId];
}

// Get fields for a jurisdiction + profile, ordered correctly
export function getFields(jurisdictionCode, profileKey) {
  const jur = getJurisdiction(jurisdictionCode);
  const profile = PROFILES[profileKey] || PROFILES.scandit;
  const fields = [];
  for (const fieldId of DEFAULT_FIELD_ORDER) {
    const def = STANDARD_FIELDS[fieldId];
    if (!def) continue;
    // Mark required fields based on profile
    const isRequired = profile.requiredFields.includes(fieldId);
    fields.push({ ...def, required: isRequired });
  }
  return { fields, jurisdiction: jur, profile };
}

const FIRST_NAMES = ['JAMES','JOHN','ROBERT','MICHAEL','WILLIAM','DAVID','RICHARD','JOSEPH','THOMAS','CHARLES','MARY','PATRICIA','JENNIFER','LINDA','BARBARA','ELIZABETH','SUSAN','JESSICA','SARAH','KAREN'];
const LAST_NAMES = ['SMITH','JOHNSON','WILLIAMS','BROWN','JONES','GARCIA','MILLER','DAVIS','RODRIGUEZ','MARTINEZ','HERNANDEZ','LOPEZ','GONZALEZ','WILSON','ANDERSON','THOMAS','TAYLOR','MOORE','JACKSON','MARTIN'];
const STREET_NAMES = ['MAIN','OAK','MAPLE','ELM','CEDAR','PINE','LAKE','HILL','PARK','RIVER','SUNSET','HIGHLAND','VALLEY','SPRING','FOREST'];
const STREET_TYPES = ['ST','AVE','BLVD','DR','RD','LN','CT','WAY','PL','CIR'];
const CITIES_BY_STATE = {
  NV:['LAS VEGAS','RENO','HENDERSON','SPARKS','NORTH LAS VEGAS'],CA:['LOS ANGELES','SAN DIEGO','SAN JOSE','FRESNO','SACRAMENTO'],TX:['HOUSTON','SAN ANTONIO','DALLAS','AUSTIN','FORT WORTH'],FL:['JACKSONVILLE','MIAMI','TAMPA','ORLANDO','ST PETERSBURG'],NY:['NEW YORK CITY','BUFFALO','ROCHESTER','YONKERS','SYRACUSE'],IL:['CHICAGO','AURORA','JOLIET','NAPERVILLE','ROCKFORD'],PA:['PHILADELPHIA','PITTSBURGH','ALLENTOWN','ERIE','READING'],OH:['COLUMBUS','CLEVELAND','CINCINNATI','TOLEDO','AKRON'],GA:['ATLANTA','COLUMBUS','MACON','SAVANNAH','ATHENS'],NC:['CHARLOTTE','RALEIGH','GREENSBORO','WINSTON-SALEM','DURHAM'],
};
const DEFAULT_CITIES = ['SPRINGFIELD','GREENVILLE','MADISON','RIVERSIDE','FAIRVIEW','NEWPORT','FRANKLIN','CHESTER','CLINTON','DENTON'];

function rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

// Generate a synthetic test value for a field (for the calculator/helper and auto-fill)
export function generateTestValue(fieldId, jurisdictionCode) {
  const jur = getJurisdiction(jurisdictionCode);
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
      return randomHeight.padStart(3, '0');
    }
    case 'DDB': return String(Math.floor(Math.random() * 150 + 100)); // 100-250 lbs
    case 'DAY': return rand(['BLK','BRO','BLU','GRN','GRY','HAZ']);
    case 'DAZ': return rand(['BLK','BRO','BLD','RED','GRY']);
    case 'DCE': return rand(['A','B','C','D']);
    case 'DAR': return rand(['NONE','A','B','CORR LENSES','']);
    case 'DAS': return rand(['NONE','H','M','N','']);
    case 'DDJ': return '0';
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