import assert from 'node:assert/strict';
import test from 'node:test';

import {
  calculateField,
  EXTRACTED_CALCULATION_FUNCTIONS,
  getNumberOfDaysFromBeginnigOfYear,
  STATE_CALCULATION_MAP,
} from './calculations.js';
import {
  generateTestValue,
  getFields,
  JURISDICTIONS,
  getStateProfile,
} from './jurisdictions.js';

test('maps the extracted calculations to app state and revision keys', () => {
  assert.equal(EXTRACTED_CALCULATION_FUNCTIONS.length, 124);
  assert.equal(new Set(EXTRACTED_CALCULATION_FUNCTIONS).size, 124);
  const mappedFunctions = new Set(
    Object.values(STATE_CALCULATION_MAP).flatMap(({ DD, ICN }) => [DD, ICN]).filter(Boolean)
  );
  assert.deepEqual(
    EXTRACTED_CALCULATION_FUNCTIONS.filter((name) => !mappedFunctions.has(name)),
    [],
    'every extracted function should be reachable through a state or revision key'
  );

  for (const { code } of JURISDICTIONS) {
    const profileSlug = getStateProfile(code).slug;
    const stateMap = STATE_CALCULATION_MAP[code];
    const revisionMap = STATE_CALCULATION_MAP[profileSlug];
    assert.ok(stateMap, `${code}: state code should have a calculation mapping`);
    assert.ok(revisionMap, `${code}: profile revision should have a calculation mapping`);
    assert.ok(
      stateMap.DD || stateMap.ICN,
      `${code}: at least one extracted DD or ICN calculation should be available`
    );
  }

  assert.equal(STATE_CALCULATION_MAP.CA_2024.ICN, 'CA_calculate_ICN');
  assert.equal(STATE_CALCULATION_MAP.NV_2021.ICN, 'NV_2021_calculate_ICN');
  assert.equal(STATE_CALCULATION_MAP.TX_2016.ICN, 'TX_2016_calculate_ICN');
  assert.equal(STATE_CALCULATION_MAP.TX_2020.ICN, 'TX_2020_calculate_ICN');
  assert.equal(STATE_CALCULATION_MAP.IL.ICN, 'IL_calculate_ICN');
  assert.equal(STATE_CALCULATION_MAP.AZ_2023.ICN, 'AZ_2023_calculate_ICN');
  assert.equal(STATE_CALCULATION_MAP.AZ_pre2023.ICN, 'AZ_calculate_ICN');
  assert.equal(STATE_CALCULATION_MAP.CT_legacy.ICN, 'CT_calculate_ICN');
  assert.equal(STATE_CALCULATION_MAP.NV_pre2021.ICN, 'NV_calculate_ICN');
});

test('ports date and random helpers', () => {
  assert.equal(getNumberOfDaysFromBeginnigOfYear('01012024'), '1');
  assert.equal(getNumberOfDaysFromBeginnigOfYear('03012024'), '61');
  assert.equal(getNumberOfDaysFromBeginnigOfYear('02292023'), '');
});

test('client-side API replacements preserve the extracted output formats', () => {
  const originalRandom = Math.random;
  Math.random = () => 0;
  try {
    const nevada = calculateField('NV', 'DD', { issueDate: '01012024' });
    assert.deepEqual(nevada, { success: true, value: 'AAAAAAAAAAAAAAAAAAAAA' });

    const connecticut = calculateField('CT', 'ICN', {
      dlNumber: '123456789',
      issueDate: '01012024',
    });
    assert.deepEqual(connecticut, { success: true, value: '123456789CTAAAAAA' });
  } finally {
    Math.random = originalRandom;
  }
});

test('revision-specific formulas select the matching extracted implementation', () => {
  const originalRandom = Math.random;
  Math.random = () => 0;
  try {
    assert.equal(
      calculateField('TX_2016', 'DD', { issueDate: '03212023' }).value.slice(0, 14),
      '00629380035201'
    );
    assert.equal(
      calculateField('TX_2020', 'ICN', {}).value,
      '10000000000'
    );
    assert.equal(
      calculateField('NV_2021', 'ICN', {}).value,
      '0019000000001'
    );
  } finally {
    Math.random = originalRandom;
  }
});

test('calculations report missing or malformed dependencies without generating output', () => {
  assert.deepEqual(calculateField('CA', 'ICN', {}), {
    success: false,
    error: 'ICN calculation error. DL number is required.',
  });
  assert.deepEqual(calculateField('CA', 'DD', { issueDate: '02292023', expiryDate: '01012030' }), {
    success: false,
    error: 'DD calculation error. Issue date must be a valid MMDDYYYY date.',
  });
  assert.deepEqual(calculateField('ND', 'DD', {
    birthDate: '01011990',
    expiryDate: '01012030',
    dlNumber: '123456789',
    firstName: 'JANE',
    lastName: 'DOE',
    sex: '2',
  }), {
    success: false,
    error: 'DD calculation error. Height is required.',
  });
});

test('every active state calculation either returns a value or an explicit unsupported error', () => {
  for (const { code } of JURISDICTIONS) {
    const { fields } = getFields(code, 'scandit');
    const data = {
      issueDate: '03212024',
      expiryDate: '07242030',
      birthDate: '01151990',
      firstName: 'JANE',
      lastName: 'SMITH',
      sex: '1',
      height: '069',
      option1: 'WV',
      auditInfo: '1234567890123',
      officeCode: '123',
      icn: '12345678901234567',
    };
    for (const field of fields) {
      if (field.aamvaFieldId === 'DAQ') data[field.name] = generateTestValue('DAQ', code);
      if (field.aamvaFieldId === 'DCK') data[field.name] = generateTestValue('DCK', code);
      if (field.aamvaFieldId === 'DCF') data[field.name] = generateTestValue('DCF', code);
      if (field.notEncoded && field.placeholder) data[field.name] = field.placeholder;
    }

    const results = ['DD', 'ICN'].map((field) => calculateField(code, field, data));
    assert.ok(
      results.some(({ success: calculationSucceeded }) => calculationSucceeded),
      `${code}: at least one extracted calculation should run`
    );
    for (const result of results) {
      if (result.success) assert.ok(result.value.length, `${code}: generated values are non-empty`);
      else assert.match(result.error, /^No (DD|ICN) calculation function is available/);
    }
  }
});
