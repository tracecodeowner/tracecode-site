import {
  JURISDICTIONS,
  getStateAutoCalcRules,
  getStateProfile,
} from './jurisdictions.js';

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const LETTERS_AND_DIGITS = `${LETTERS}0123456789`;

const CALCULATOR_NAMES = new Set([
  'CA_calculate_ICN', 'CA_calculate_DD',
  'MS_calculate_ICN', 'MS_calculate_DD',
  'AL_calculate_ICN', 'AL_2024_calculate_ICN',
  'FL_calculate_ICN', 'FL_calculate_DD',
  'TX_calculate_DD_improved', 'TX_calculate_DD',
  'TX_2016_calculate_ICN', 'TX_2020_calculate_ICN',
  'IL_calculate_ICN', 'IL_calculate_DD', 'WA_calculate_DD',
  'GA_calculate_ICN', 'GA_calculate_DD', 'GA_calculate_ICN_2015', 'GA_calculate_DD_2015',
  'OH_calculate_ICN', 'OH_calculate_DD', 'CO_calculate_DD',
  'AZ_calculate_ICN', 'AZ_2023_calculate_ICN', 'AZ_calculate_DD',
  'PA_calculate_ICN', 'PA_calculate_DD', 'NC_calculate_ICN', 'NC_calculate_DD',
  'MA_calculate_ICN', 'MA_calculate_DD', 'CT_calculate_ICN_new', 'CT_calculate_ICN', 'CT_calculate_DD',
  'OR_calculate_ICN', 'OR_calculate_DD', 'NV_calculate_ICN', 'NV_2021_calculate_ICN', 'NV_calculate_DD',
  'NY_calculate_DD', 'ME_calculate_ICN', 'ME_calculate_DD', 'MN_calculate_ICN', 'MN_calculate_DD',
  'ND_calculate_ICN', 'ND_2023_calculate_ICN', 'ND_calculate_DD', 'ND_2023_calculate_DD',
  'NE_2021_calculate_ICN', 'NE_2021_calculate_DD', 'NE_calculate_ICN', 'NE_calculate_DD',
  'NH_calculate_ICN', 'NH_calculate_DD', 'SC_calculate_DD', 'TN_calculate_ICN', 'TN_calculate_DD',
  'VA_calculate_ICN', 'VA_calculate_DD', 'MD_calculate_ICN', 'MD_2021_calculate_ICN',
  'MD_calculate_DD', 'MD_2021_calculate_DD', 'MI_calculate_ICN',
  'NJ_2020_calculate_ICN', 'NJ_2020_calculate_DD', 'WI_calculate_ICN', 'WI_calculate_DD',
  'UT_calculate_ICN', 'UT_calculate_DD', 'AR_calculate_ICN', 'AR_calculate_DD',
  'ID_calculate_ICN', 'ID_calculate_DD', 'ID_calculate_ICN_2023', 'ID_calculate_DD_2023',
  'MT_calculate_ICN', 'MT_calculate_DD', 'IN_calculate_ICN', 'IN_calculate_DD',
  'NM_calculate_ICN', 'NM_calculate_DD', 'RI_calculate_ICN', 'RI_calculate_DD', 'RI_calculate_DD_2022',
  'DC_calculate_DD', 'LA_calculate_ICN', 'MO_calculate_ICN', 'MO_2020_calculate_ICN',
  'MO_calculate_DD', 'MO_2020_calculate_DD', 'KS_calculate_ICN', 'KS_calculate_DD',
  'WY_calculate_ICN', 'WY_calculate_DD', 'SD_calculate_ICN', 'SD_calculate_DD',
  'KY_2012_calculate_ICN', 'KY_2012_calculate_DD', 'KY_2018_calculate_DD',
  'AK_calculate_ICN', 'AK_calculate_DD', 'OK_calculate_ICN', 'OK_calculate_DD',
  'DE_calculate_ICN', 'DE_calculate_DD', 'HI_calculate_DD', 'HI_calculate_ICN',
  'IA_2011_calculate_DD', 'IA_2017_calculate_DD', 'IA_2011_calculate_ICN', 'IA_2017_calculate_ICN',
  'MB_calculate_ICN', 'MB_calculate_DD', 'SK_calculate_ICN', 'SK_calculate_DD',
  'ON_calculate_ICN', 'ON_calculate_DD', 'AB_calculate_DD', 'YT_calculate_DD', 'QC_calculate_DD',
  'WV_calculate_ICN', 'WV_calculate_DD', 'VT_calculate_DD',
]);

const REVISION_OVERRIDES = {
  AL_pre2024: { ICN: 'AL_calculate_ICN' },
  AL_2024: { ICN: 'AL_2024_calculate_ICN' },
  AL_2022: { ICN: 'AL_2024_calculate_ICN' },
  CT_legacy: { ICN: 'CT_calculate_ICN', DD: 'CT_calculate_DD' },
  AZ_pre2023: { ICN: 'AZ_calculate_ICN', DD: 'AZ_calculate_DD' },
  AZ_2023: { ICN: 'AZ_2023_calculate_ICN', DD: 'AZ_calculate_DD' },
  GA_2015: { ICN: 'GA_calculate_ICN_2015', DD: 'GA_calculate_DD_2015' },
  ID_pre2023: { ICN: 'ID_calculate_ICN', DD: 'ID_calculate_DD' },
  ID_2023: { ICN: 'ID_calculate_ICN_2023', DD: 'ID_calculate_DD_2023' },
  IA_2011: { ICN: 'IA_2011_calculate_ICN', DD: 'IA_2011_calculate_DD' },
  IA_2017: { ICN: 'IA_2017_calculate_ICN', DD: 'IA_2017_calculate_DD' },
  KY_2012: { ICN: 'KY_2012_calculate_ICN', DD: 'KY_2012_calculate_DD' },
  KY_2018: { ICN: 'KY_2012_calculate_ICN', DD: 'KY_2018_calculate_DD' },
  MD_pre2021: { ICN: 'MD_calculate_ICN', DD: 'MD_calculate_DD' },
  MD_2021: { ICN: 'MD_2021_calculate_ICN', DD: 'MD_2021_calculate_DD' },
  MO_pre2020: { ICN: 'MO_calculate_ICN', DD: 'MO_calculate_DD' },
  MO_2020: { ICN: 'MO_2020_calculate_ICN', DD: 'MO_2020_calculate_DD' },
  ND_pre2023: { ICN: 'ND_calculate_ICN', DD: 'ND_calculate_DD' },
  ND_2023: { ICN: 'ND_2023_calculate_ICN', DD: 'ND_2023_calculate_DD' },
  NE_pre2021: { ICN: 'NE_calculate_ICN', DD: 'NE_calculate_DD' },
  NE_2021: { ICN: 'NE_2021_calculate_ICN', DD: 'NE_2021_calculate_DD' },
  NV_pre2021: { ICN: 'NV_calculate_ICN', DD: 'NV_calculate_DD' },
  NV_2021: { ICN: 'NV_2021_calculate_ICN', DD: 'NV_calculate_DD' },
  RI_pre2022: { ICN: 'RI_calculate_ICN', DD: 'RI_calculate_DD' },
  RI_2022: { ICN: 'RI_calculate_ICN', DD: 'RI_calculate_DD_2022' },
  RI_2017: { ICN: 'RI_calculate_ICN', DD: 'RI_calculate_DD' },
  TX_2016: { ICN: 'TX_2016_calculate_ICN', DD: 'TX_calculate_DD_improved' },
  TX_2020: { ICN: 'TX_2020_calculate_ICN', DD: 'TX_calculate_DD' },
};

const DATA_ALIASES = {
  documentNumber: ['dlNumber', 'DAQ', 'documentNumber', 'number'],
  issueDate: ['issueDate', 'DBD', 'DOI'],
  expiryDate: ['expiryDate', 'DBA', 'expirationDate'],
  birthDate: ['birthDate', 'DBB', 'DOB', 'brithDate'],
  lastName: ['lastName', 'DCS', 'surname'],
  firstName: ['firstName', 'DAC', 'givenName'],
  sex: ['sex', 'DBC', 'gender'],
  height: ['height', 'DAU'],
  auditInfo: ['auditInfo', 'auditInformation', 'audit'],
  option1: ['option1', 'optionOne'],
  officeCode: ['officeCode', 'issuingOfficeCode', 'issuingOffice', 'office', 'CODE', 'source_IN_CODE', 'source_LA_OFFICE'],
  icn: ['icn', 'DCK'],
};

function readValue(data, key) {
  let value = (DATA_ALIASES[key] || [key])
    .map((alias) => data?.[alias])
    .find((candidate) => candidate !== undefined && candidate !== null);
  if (value === undefined) {
    const keyPattern = {
      auditInfo: /audit/i,
      officeCode: /office/i,
      option1: /option.?1/i,
    }[key];
    if (keyPattern) {
      const match = Object.entries(data || {}).find(([name]) => keyPattern.test(name));
      value = match?.[1];
    }
  }
  return String(value ?? '').trim();
}

function missing(key, label, length) {
  const rawValue = readValue(currentData, key);
  const value = ['issueDate', 'expiryDate', 'birthDate'].includes(key)
    ? rawValue.replace(/\D/g, '')
    : rawValue;
  if (!value) return `${label} is required.`;
  if (
    length
    && (Array.isArray(length) ? !length.includes(value.length) : value.length !== length)
  ) {
    return `${label} must be ${length} characters.`;
  }
  return null;
}

let currentData = {};

function failFor(key, label, length) {
  return missing(key, label, length);
}

function required(...requirements) {
  for (const [key, label, length] of requirements) {
    const error = failFor(key, label, length);
    if (error) return error;
  }
  return null;
}

function value(key) {
  return readValue(currentData, key);
}

function validDate(key, label) {
  const date = value(key).replace(/\D/g, '');
  if (!/^\d{8}$/.test(date)) return `${label} must be a valid MMDDYYYY date.`;
  const month = Number(date.slice(0, 2));
  const day = Number(date.slice(2, 4));
  const year = Number(date.slice(4));
  const candidate = new Date(Date.UTC(year, month - 1, day));
  if (
    candidate.getUTCFullYear() !== year
    || candidate.getUTCMonth() !== month - 1
    || candidate.getUTCDate() !== day
  ) {
    return `${label} must be a valid MMDDYYYY date.`;
  }
  return null;
}

function requireFields(...requirements) {
  const error = required(...requirements);
  if (error) return error;
  for (const [key, label] of requirements) {
    if (['issueDate', 'expiryDate', 'birthDate'].includes(key)) {
      const dateError = validDate(key, label);
      if (dateError) return dateError;
    }
  }
  return null;
}

function randomNumericString(length) {
  return Array.from({ length }, () => String(Math.floor(Math.random() * 10))).join('');
}

function randomLetter() {
  return LETTERS[Math.floor(Math.random() * LETTERS.length)];
}

function randomDigit() {
  return randomNumericString(1);
}

function randomLetterAndDigit() {
  return LETTERS_AND_DIGITS[Math.floor(Math.random() * LETTERS_AND_DIGITS.length)];
}

export const getRandomNumericString = randomNumericString;
export const getRandomLetter = randomLetter;
export const getRandomDigit = randomDigit;
export const getRandomLetterAndDigit = randomLetterAndDigit;
export const get_letter_corresponding_month = monthLetter;

export function getNumberOfDaysFromBeginnigOfYear(mmddyyyy) {
  const normalized = String(mmddyyyy || '').replace(/\D/g, '');
  if (!/^\d{8}$/.test(normalized)) return '';
  const month = Number(normalized.slice(0, 2));
  const day = Number(normalized.slice(2, 4));
  const year = Number(normalized.slice(4));
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year
    || date.getUTCMonth() !== month - 1
    || date.getUTCDate() !== day
  ) return '';
  return String(Math.floor((date.getTime() - Date.UTC(year, 0, 1)) / 86400000) + 1);
}

function paddedDays(date, offset = 0) {
  return String(Number(getNumberOfDaysFromBeginnigOfYear(date)) + offset).padStart(3, '0').slice(-3);
}

function sexValue() {
  const sex = value('sex');
  if (sex === '1') return 'M';
  if (sex === '2') return 'F';
  return sex;
}

function monthLetter(month) {
  return String.fromCharCode(Number(month) + 64);
}

/** @returns {{ success: true, value: string, related?: Record<string, string> }} */
function success(output, related) {
  return { success: true, value: output, ...(related ? { related } : {}) };
}

/** @returns {{ success: false, error: string }} */
function invalid(message) {
  return { success: false, error: message };
}

function calculateNamedFunction(functionName) {
  const doc = value('documentNumber');
  const issue = value('issueDate').replace(/\D/g, '');
  const expiry = value('expiryDate').replace(/\D/g, '');
  const birth = value('birthDate').replace(/\D/g, '');
  const last = value('lastName');
  const first = value('firstName');
  const sex = sexValue();
  const height = value('height');
  const days = (date) => getNumberOfDaysFromBeginnigOfYear(date);
  const random = randomNumericString;
  const letter = randomLetter;
  const digit = randomDigit;
  const alnum = randomLetterAndDigit;
  const dd = (str, req) => {
    const error = requireFields(...req);
    return error ? invalid(`DD calculation error. ${error}`) : success(str());
  };
  const icn = (str, req) => {
    const error = requireFields(...req);
    return error ? invalid(`ICN calculation error. ${error}`) : success(str());
  };
  const reqDate = (name, label) => [name, label, 8];
  const reqDoc = (length) => ['documentNumber', 'DL number', length];
  const reqName = (key, label) => [key, label];
  const reqSex = ['sex', 'Sex'];

  switch (functionName) {
    case 'CA_calculate_ICN':
      return icn(() => issue.slice(-2) + days(issue) + doc + '0401', [reqDoc(8), reqDate('issueDate', 'Issue date')]);
    case 'CA_calculate_DD':
      return dd(() => `${issue.slice(0, 2)}/${issue.slice(2, 4)}/${issue.slice(-4)}${random(5)}/AAFD/${expiry.slice(-2)}`, [reqDate('issueDate', 'Issue date'), reqDate('expiryDate', 'Expiry date')]);
    case 'MS_calculate_ICN':
      return success(`05100${random(6)}23${random(3)}`);
    case 'MS_calculate_DD':
      return dd(() => `${birth.slice(-2, -1)}${letter()}${Array.from({ length: 7 }, alnum).join('')}${birth.slice(-1)}${last[0]}${first[0]}${issue.slice(-2)}${paddedDays(issue)}${sex}${expiry.slice(-2)}${expiry.slice(2, 4)}${monthLetter(expiry.slice(0, 2))}`, [reqDate('birthDate', 'Birth date'), reqDate('issueDate', 'Issue date'), reqDate('expiryDate', 'Expiry date'), reqName('lastName', 'Last name'), reqName('firstName', 'First name'), reqSex]);
    case 'AL_calculate_ICN':
      return success(`0000000000${random(7)}401`);
    case 'AL_2024_calculate_ICN':
      return icn(() => `${doc}${random(5)}${issue.slice(-2)}${paddedDays(issue, 4)}01`, [reqDoc(8), reqDate('issueDate', 'Issue date')]);
    case 'FL_calculate_ICN':
      return success(`0100${random(12)}`);
    case 'FL_calculate_DD':
      return dd(() => `${letter()}${random(2)}${issue.slice(-2)}${issue.slice(0, 4)}${random(4)}`, [reqDate('issueDate', 'Issue date')]);
    case 'TX_calculate_DD_improved': {
      const year = issue.slice(-2);
      const month = issue.slice(0, 2);
      const day = issue.slice(2, 4);
      return dd(() => `006${year[0]}9${year[1]}8${month[0]}0${month[1]}5${day[0]}0${day[1]}${random(6)}`, [reqDate('issueDate', 'Issue date')]);
    }
    case 'TX_calculate_DD':
      return success(random(20));
    case 'TX_2016_calculate_ICN': {
      const [month, day, year] = [issue.slice(0, 2), issue.slice(2, 4), issue.slice(-4)].map(Number);
      const date = new Date(Date.UTC(year, month - 1, day + 1));
      const nextDay = `${date.getUTCFullYear()}${String(date.getUTCMonth() + 1).padStart(2, '0')}${String(date.getUTCDate()).padStart(2, '0')}`;
      return icn(() => `${doc}  ${nextDay}`, [reqDoc(8), reqDate('issueDate', 'Issue date')]);
    }
    case 'TX_2020_calculate_ICN':
      return success(`10000${random(6)}`);
    case 'IL_calculate_ICN':
      return icn(() => `${doc}IL${letter()}${alnum()}${letter()}${letter()}01`, [reqDoc(12)]);
    case 'IL_calculate_DD':
      return dd(() => `${issue.slice(-4)}${issue.slice(0, 4)}${random(3)}${letter()}${letter()}${random(4)}`, [reqDate('issueDate', 'Issue date')]);
    case 'WA_calculate_DD':
      return dd(() => `${doc}${value('auditInfo')}`, [reqDoc(12), ['auditInfo', 'Audit information', 13]]);
    case 'GA_calculate_ICN':
      return success(`1000${random(7)}`);
    case 'GA_calculate_DD':
      return success(`${random(11)}00${random(5)}`);
    case 'GA_calculate_ICN_2015':
      return success(`2${random(9)}100401`);
    case 'GA_calculate_DD_2015':
      return dd(() => `${value('icn').slice(0, -2)}${random(4)}`, [['icn', 'ICN', 16]]);
    case 'OH_calculate_ICN':
      return success(`${letter()}${random(8)}`);
    case 'OH_calculate_DD':
      return success(`0${random(7)}0`);
    case 'CO_calculate_DD':
      return success(random(7));
    case 'AZ_calculate_ICN':
      return icn(() => `${issue.slice(-2)}${days(issue)}AZ00${random(7)}0301`, [reqDate('issueDate', 'Issue date')]);
    case 'AZ_2023_calculate_ICN':
      return success(`48${random(9)}`);
    case 'AZ_calculate_DD':
      return dd(() => `${random(4)}${letter()}${letter()}${random(3)}${last[0]}${random(4)}${first[0]}${birth.slice(-1)}`, [reqDate('birthDate', 'Birth date'), reqName('firstName', 'First name'), reqName('lastName', 'Last name')]);
    case 'PA_calculate_ICN':
      return icn(() => `02500${random(6)}${issue.slice(-2)}${random(3)}`, [reqDate('issueDate', 'Issue date')]);
    case 'PA_calculate_DD':
      return dd(() => `${issue.slice(-2)}${days(issue)}${random(10)}00000${random(5)}`, [reqDate('issueDate', 'Issue date')]);
    case 'NC_calculate_ICN':
      return icn(() => `${doc}NC${alnum()}${alnum()}${alnum()}${alnum()}01`, [reqDoc(12)]);
    case 'NC_calculate_DD':
      return success(`001${random(7)}`);
    case 'MA_calculate_ICN':
      return icn(() => `${issue.slice(-2)}${days(issue)}${doc}0601`, [reqDoc(9), reqDate('issueDate', 'Issue date')]);
    case 'MA_calculate_DD':
      return dd(() => `${issue} REV 02222016`, [reqDate('issueDate', 'Issue date')]);
    case 'CT_calculate_ICN_new':
      return icn(() => `${doc}CT${Array.from({ length: 6 }, alnum).join('')}`, [reqDoc(9), reqDate('issueDate', 'Issue date')]);
    case 'CT_calculate_ICN':
      return icn(() => `${doc}CT${digit()}${letter()}${letter()}${letter()}01`, [reqDoc(9)]);
    case 'CT_calculate_DD':
      return dd(() => `${issue.slice(-2)}${issue.slice(0, 4)}${String(Math.floor(Math.random() * 3) + 12).padStart(2, '0')}${String(Math.floor(Math.random() * 60)).padStart(2, '0')}${String(Math.floor(Math.random() * 60)).padStart(2, '0')}01MV${letter()}${digit()}`, [reqDate('issueDate', 'Issue date')]);
    case 'OR_calculate_ICN':
      return success(`AA${random(7)}`);
    case 'OR_calculate_DD':
      return success(`200${random(6)}`);
    case 'NV_calculate_ICN':
      return success(`0015${random(7)}01`);
    case 'NV_2021_calculate_ICN':
      return success(`0019${random(7)}01`);
    case 'NV_calculate_DD':
      return dd(() => Array.from({ length: 21 }, alnum).join(''), [reqDate('issueDate', 'Issue date')]);
    case 'NY_calculate_DD':
      return success(`${Array.from({ length: 8 }, alnum).join('')}06`);
    case 'ME_calculate_ICN':
      return icn(() => `F${issue.slice(-2)}${paddedDays(issue, 4)}${doc}0101`, [reqDoc(7), reqDate('issueDate', 'Issue date')]);
    case 'ME_calculate_DD':
      return success(`00000000000000000${random(8)}`);
    case 'MN_calculate_ICN':
      return icn(() => `${doc}01${paddedDays(issue, 3)}01`, [reqDoc(13), reqDate('issueDate', 'Issue date')]);
    case 'MN_calculate_DD':
      return success(`0000000${random(7)}`);
    case 'ND_calculate_ICN':
      return success(`034001${random(10)}`);
    case 'ND_2023_calculate_ICN':
      return success(`05100${random(11)}`);
    case 'ND_calculate_DD':
    case 'ND_2023_calculate_DD': {
      const suffix = functionName === 'ND_calculate_DD' ? 'NDZ' : 'YDZ';
      const error = requireFields(reqDate('birthDate', 'Birth date'), reqDate('expiryDate', 'Expiry date'), ['height', 'Height'], reqDoc(9), reqName('lastName', 'Last name'), reqName('firstName', 'First name'), reqSex);
      if (error) return invalid(`DD calculation error. ${error}`);
      const sexDigit = sex === 'M' ? '5' : '1';
      return success(`${birth.slice(-2, -1)}${doc}${last[0]}${first[0]}${sexDigit}2${expiry.slice(-1)}${expiry.slice(2, 4)}${letter().toLowerCase()}${letter()}${height}${suffix}`);
    }
    case 'NE_2021_calculate_ICN': {
      const result = icn(() => `${doc}NETYCO01`, [reqDoc(9)]);
      return result.success ? { ...result, related: { DD: `054${result.value}${random(5)}` } } : result;
    }
    case 'NE_2021_calculate_DD':
      return dd(() => `054${value('icn')}${random(5)}`, [['icn', 'ICN', 17]]);
    case 'NE_calculate_ICN': {
      const result = success(`0540000${random(4)}00000`);
      return { ...result, related: { DD: result.value } };
    }
    case 'NE_calculate_DD':
      return dd(() => value('icn'), [['icn', 'ICN', 16]]);
    case 'NH_calculate_ICN': {
      const result = success(`0${random(7)}`);
      return { ...result, related: { DD: result.value } };
    }
    case 'NH_calculate_DD':
      return dd(() => value('icn'), [['icn', 'ICN', 8]]);
    case 'SC_calculate_DD':
      return dd(() => `${random(8)}${expiry.slice(0, 2)}${expiry.slice(-2)}${days(expiry)}${random(4)}`, [reqDate('expiryDate', 'Expiry date')]);
    case 'TN_calculate_ICN':
      return icn(() => `${issue.slice(-2)}${days(issue)}${random(9)}0101`, [reqDate('issueDate', 'Issue date')]);
    case 'TN_calculate_DD':
      return dd(() => `${random(2)}0${issue.slice(-2)}${issue.slice(0, 4)}${random(7)}`, [reqDate('issueDate', 'Issue date')]);
    case 'VA_calculate_ICN':
      return success(`0060101${random(9)}`);
    case 'VA_calculate_DD':
      return success(`0${random(8)}`);
    case 'MD_calculate_ICN':
      return success(`100${random(7)}`);
    case 'MD_2021_calculate_ICN':
      return success(`1010${random(6)}`);
    case 'MD_calculate_DD':
      return success(`${random(6)}${letter()}${letter()}${digit()}`);
    case 'MD_2021_calculate_DD':
      return success(random(9));
    case 'MI_calculate_ICN':
      return icn(() => `${doc.replace(/\s/g, '')}${birth.slice(-4)}${birth.slice(0, 4)}${expiry.slice(-2)}${expiry.slice(0, 2)}`, [reqDate('birthDate', 'Birth date'), reqDate('expiryDate', 'Expiry date'), reqDoc(17)]);
    case 'NJ_2020_calculate_ICN':
      return icn(() => `${last[0]}${Array.from({ length: 9 }, alnum).join('')}NJ${random(2)}SL01`, [reqName('lastName', 'Last name')]);
    case 'NJ_2020_calculate_DD':
      return dd(() => `${value('option1').slice(-2)}${issue.slice(-4)}${paddedDays(issue)}0000${random(4)}`, [reqName('option1', 'Option 1'), reqDate('issueDate', 'Issue date')]);
    case 'WI_calculate_ICN':
      return success(`0130100${random(9)}`);
    case 'WI_calculate_DD':
      return dd(() => `OT${last[0].toUpperCase()}${letter()}${letter()}${issue.slice(-4)}${issue.slice(0, 4)}${Math.random() < 0.5 ? '10' : '15'}${random(6)}`, [reqName('lastName', 'Last name'), reqDate('issueDate', 'Issue date')]);
    case 'UT_calculate_ICN':
      return icn(() => `${doc}UT${digit()}${digit()}SL01`, [reqDoc(9)]);
    case 'UT_calculate_DD':
      return success(random(8));
    case 'AR_calculate_ICN':
      return success(`021011${random(10)}`);
    case 'AR_calculate_DD':
      return success(`${random(9)} ${random(4)}`);
    case 'ID_calculate_ICN':
      return success(`000${random(7)}`);
    case 'ID_calculate_DD':
      return dd(() => `010${issue.slice(-2)}${random(3)}00${random(2)}`, [reqDate('issueDate', 'Issue date')]);
    case 'ID_calculate_ICN_2023':
      return success(`MT${random(6)}H${random(6)}001`);
    case 'ID_calculate_DD_2023':
      return success(random(15));
    case 'MT_calculate_ICN': {
      const data = Array.from({ length: 6 }, alnum).join('');
      return success(`1100${digit()}${data}FMT${alnum()}${letter()}${letter()}001`);
    }
    case 'MT_calculate_DD':
      return dd(() => `${issue.slice(-4)}${issue.slice(0, 4)}${random(12)}`, [reqDate('issueDate', 'Issue date')]);
    case 'IN_calculate_ICN':
      return success(`03701${random(11)}`);
    case 'IN_calculate_DD':
    case 'NM_calculate_DD':
      return dd(() => `${issue.slice(0, 4)}${issue.slice(-2)}${value('officeCode')}00${random(3)}`, [['officeCode', 'Issuing office code', 3], reqDate('issueDate', 'Issue date')]);
    case 'NM_calculate_ICN':
      return icn(() => `${doc}01`, [reqDoc(9)]);
    case 'RI_calculate_ICN':
      return icn(() => `O${doc}RI${letter()}${letter()}TL01`, [['documentNumber', 'DL number', [7, 8]]]);
    case 'RI_calculate_DD':
      return dd(() => Number(issue.slice(-4)) > 2017
        ? random(6)
        : `${doc}${issue.slice(-4)}${issue.slice(0, 4)}${random(6)}`, [reqDate('issueDate', 'Issue date'), ...(Number(issue.slice(-4)) <= 2017 ? [reqDoc(7)] : [])]);
    case 'RI_calculate_DD_2022':
      return success(random(7));
    case 'DC_calculate_DD':
      return success(random(8));
    case 'LA_calculate_ICN':
      return success(`00700${random(11)}`);
    case 'MO_calculate_ICN':
      return icn(() => `${issue.slice(-2)}${paddedDays(issue, 1)}${doc}0101`, [reqDate('issueDate', 'Issue date'), reqDoc(10)]);
    case 'MO_2020_calculate_ICN':
      return icn(() => `${issue.slice(-2)}${paddedDays(issue, 2)}${doc}0101`, [reqDate('issueDate', 'Issue date'), reqDoc(10)]);
    case 'MO_calculate_DD':
      return dd(() => `${issue.slice(-2)}${doc.slice(1, 4)}${days(issue)}00${random(2)}`, [reqDate('issueDate', 'Issue date'), reqDoc(10)]);
    case 'MO_2020_calculate_DD':
      return dd(() => `${issue.slice(-2)}14${random(4)}00${random(2)}`, [reqDate('issueDate', 'Issue date')]);
    case 'KS_calculate_ICN':
      return icn(() => `${issue.slice(-2)}${paddedDays(issue, 3)}${doc.replace(/-/g, '')}0101`, [reqDate('issueDate', 'Issue date'), reqDoc(11)]);
    case 'KS_calculate_DD': {
      const day = paddedDays(issue, 1);
      return dd(() => `${birth.slice(-2, -1)}${day}${random(6)}${birth.slice(-1)}${last[0]}${first[0]}${issue.slice(-2)}${day}${sex}${expiry.slice(-2)}${expiry.slice(2, 4)}${monthLetter(expiry.slice(0, 2))}B`, [reqDate('birthDate', 'Birth date'), reqDate('issueDate', 'Issue date'), reqDate('expiryDate', 'Expiry date'), reqName('lastName', 'Last name'), reqName('firstName', 'First name'), reqSex]);
    }
    case 'WY_calculate_ICN':
    case 'WY_calculate_DD': {
      const generated = `100003${random(3)}7`;
      return success(generated, { [functionName.endsWith('ICN') ? 'DD' : 'ICN']: generated });
    }
    case 'SD_calculate_ICN':
      return success(`042000${random(10)}`);
    case 'SD_calculate_DD':
      return dd(() => `${doc}${issue.slice(-4)}${issue.slice(0, 4)}${random(7)}`, [reqDate('issueDate', 'Issue date'), reqDoc(8)]);
    case 'KY_2012_calculate_ICN':
      return icn(() => `04600${issue.slice(-2)}${random(9)}`, [reqDate('issueDate', 'Issue date')]);
    case 'KY_2012_calculate_DD':
      return success(`43${random(13)}0`);
    case 'KY_2018_calculate_DD':
      return dd(() => `${issue.slice(-4)}${issue.slice(0, 2)}${issue.slice(3, 5)}${random(8)} 01111`, [reqDate('issueDate', 'Issue date')]);
    case 'AK_calculate_ICN':
      return success(`1000${random(6)}`);
    case 'AK_calculate_DD':
      return dd(() => `8${random(6)} ${random(3)}${issue.slice(-2)}${issue.slice(0, 4)}${letter()}${letter()}${letter()}-${Math.random() < 0.5 ? '0' : '1'}`, [reqDate('issueDate', 'Issue date')]);
    case 'OK_calculate_ICN':
      return icn(() => `${doc}OK${alnum()}${alnum()}SL01`, [reqDoc(10)]);
    case 'OK_calculate_DD':
      return dd(() => `${doc}${birth.slice(0, 4)}${birth.slice(-2)}${issue.slice(0, 4)}${issue.slice(-2)}R`, [reqDoc(10), reqDate('issueDate', 'Issue date'), reqDate('birthDate', 'Birth date')]);
    case 'DE_calculate_ICN':
      return success(`0110${random(12)}`);
    case 'DE_calculate_DD':
      return dd(() => `L${issue.slice(-4)}${issue.slice(0, 4)}${random(6)}C`, [reqDate('issueDate', 'Issue date')]);
    case 'HI_calculate_DD': {
      const tail = `${random(6)}${Array.from({ length: 6 }, alnum).join('')}`;
      return dd(() => `${issue.slice(-4)}${issue.slice(0, 4)}${tail}-ICWH`, [reqDate('issueDate', 'Issue date')]);
    }
    case 'HI_calculate_ICN': {
      const date = new Date(Number(issue.slice(-4)), Number(issue.slice(0, 2)), Number(issue.slice(2, 4)));
      date.setDate(date.getDate() + 6);
      const formatted = `${String(date.getMonth()).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}${date.getFullYear()}`;
      return icn(() => `${issue.slice(-4)}${formatted.slice(0, 4)}_106336_2_1${random(2)}`, [reqDate('issueDate', 'Issue date')]);
    }
    case 'IA_2011_calculate_DD':
    case 'IA_2017_calculate_DD':
      return dd(() => `${random(9)}${last[0]}${first[0]}${random(4)}${sex}${expiry.slice(2, 4)}${expiry.slice(0, 2)}${expiry.slice(-2)}${functionName.includes('2011') ? 'R' : 'D'}`, [reqDate('expiryDate', 'Expiry date'), reqName('lastName', 'Last name'), reqName('firstName', 'First name'), reqSex]);
    case 'IA_2011_calculate_ICN':
    case 'IA_2017_calculate_ICN': {
      const offset = functionName.includes('2011') ? 1 : 3;
      return icn(() => `${doc}${issue.slice(-2)}${paddedDays(issue, offset)}0101`, [reqDoc(9), reqDate('issueDate', 'Issue date')]);
    }
    case 'MB_calculate_ICN':
    case 'MB_calculate_DD':
      return success(random(9));
    case 'SK_calculate_ICN':
      return success(`${letter()}${random(8)}`);
    case 'SK_calculate_DD':
      return success(random(10));
    case 'ON_calculate_ICN':
      return success(random(7));
    case 'ON_calculate_DD':
      return success(`G${letter()}${random(7)}`);
    case 'AB_calculate_DD':
      return success(`0${random(3)}-${random(5)}`);
    case 'YT_calculate_DD':
      return dd(() => `${doc}R0`, [reqDoc(6)]);
    case 'QC_calculate_DD':
      return success(`PE${letter()}${letter()}${random(2)}${letter()}${letter()}${letter()}`);
    case 'WV_calculate_ICN':
      return icn(() => `${doc}WV${letter()}${letter()}${letter()}${letter()}01`, [reqDoc(7)]);
    case 'WV_calculate_DD':
      return dd(() => `${birth.slice(0, 4)}${birth.slice(-2)}${last[0]}${first[0]}${expiry.slice(-2)}${expiry.slice(0, 2)}`, [reqDate('birthDate', 'Birth date'), reqDate('expiryDate', 'Expiry date'), reqName('lastName', 'Last name'), reqName('firstName', 'First name')]);
    case 'VT_calculate_DD':
      return dd(() => `${issue.slice(0, 4)}${issue.slice(-2)}${random(4)}${doc}`, [reqDoc(8), reqDate('issueDate', 'Issue date')]);
    default:
      return invalid(`No client-side implementation is registered for ${functionName}.`);
  }
}

function resolveCalculatorFunction(stateCode, field) {
  const rawKey = String(stateCode || '').trim();
  const inputKey = rawKey.toUpperCase();
  const overrideKey = Object.keys(REVISION_OVERRIDES)
    .find((key) => key.toUpperCase() === inputKey);
  const profile = getStateProfile(rawKey) || getStateProfile(inputKey.split('_')[0]);
  const target = field === 'DD' ? 'DD' : 'ICN';
  const directOverride = REVISION_OVERRIDES[overrideKey]?.[target];
  if (directOverride && CALCULATOR_NAMES.has(directOverride)) return directOverride;
  const hasRevisionFunction = Boolean(overrideKey)
    || [...CALCULATOR_NAMES].some((name) => name.startsWith(`${inputKey}_calculate_`));
  const profileKey = hasRevisionFunction ? overrideKey || inputKey : profile?.slug || inputKey;
  const state = inputKey.split('_')[0];
  const ruleFieldId = target === 'DD' ? 'DCF' : 'DCK';
  const sourceFunction = getStateAutoCalcRules(state)[ruleFieldId]?.calcOnclick
    || getStateAutoCalcRules(profileKey)[ruleFieldId]?.calcOnclick
    || '';
  const functionName = sourceFunction.match(/^\s*([A-Za-z_$][\w$]*)\s*\(/)?.[1];
  const overrides = REVISION_OVERRIDES[overrideKey || profileKey]?.[target];
  if (overrides && CALCULATOR_NAMES.has(overrides)) return overrides;
  if (functionName && CALCULATOR_NAMES.has(functionName)) return functionName;
  const revisionFunction = `${profileKey}_calculate_${target}`;
  if (CALCULATOR_NAMES.has(revisionFunction)) return revisionFunction;
  const stateFunction = `${state}_calculate_${target}`;
  if (CALCULATOR_NAMES.has(stateFunction)) return stateFunction;

  if (target === 'DD') {
    const alternate = `${profileKey}_calculate_DD_2022`;
    if (CALCULATOR_NAMES.has(alternate)) return alternate;
  }
  return null;
}

export const EXTRACTED_CALCULATION_FUNCTIONS = Object.freeze([...CALCULATOR_NAMES]);

const calculationKeys = new Set([
  ...JURISDICTIONS.map(({ code }) => code),
  ...JURISDICTIONS.map(({ code }) => getStateProfile(code)?.slug).filter(Boolean),
  ...[...CALCULATOR_NAMES].map((name) => name.split('_calculate_')[0]),
  ...Object.keys(REVISION_OVERRIDES),
]);
export const STATE_CALCULATION_MAP = Object.freeze(Object.fromEntries(
  [...calculationKeys].map((key) => [
    key,
    Object.freeze({
      DD: resolveCalculatorFunction(key, 'DD'),
      ICN: resolveCalculatorFunction(key, 'ICN'),
    }),
  ])
));

export function calculateField(stateCode, field, formData = {}) {
  const target = String(field || '').toUpperCase();
  if (!['DD', 'ICN'].includes(target)) {
    return invalid(`Unsupported calculation field "${field}". Use "DD" or "ICN".`);
  }
  const functionName = resolveCalculatorFunction(stateCode, target);
  if (!functionName) {
    return invalid(`No ${target} calculation function is available for ${stateCode}.`);
  }
  currentData = formData || {};
  try {
    return calculateNamedFunction(functionName);
  } finally {
    currentData = {};
  }
}

export function calculateDD(stateCode, formData = {}) {
  return calculateField(stateCode, 'DD', formData);
}

export function calculateICN(stateCode, formData = {}) {
  return calculateField(stateCode, 'ICN', formData);
}
