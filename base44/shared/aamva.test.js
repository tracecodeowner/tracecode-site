import assert from 'node:assert/strict';
import test from 'node:test';

import {
  generatePayload,
  normalizeValue,
  parsePayload,
} from './aamva.js';
import {
  DEFAULT_FIELD_ORDER,
  generateTestValue,
  getFieldDef,
  getJurisdiction,
  PROFILES,
} from './jurisdictions.js';

test('standard fields use the correct AAMVA identifiers', () => {
  assert.equal(getFieldDef('DCA').name, 'dlClass');
  assert.equal(getFieldDef('DCB').name, 'restrictions');
  assert.equal(getFieldDef('DCD').name, 'endorsement');
  assert.equal(getFieldDef('DDB').name, 'cardRevisionDate');
  assert.equal(getFieldDef('DDJ').name, 'under21Until');
  assert.equal(getFieldDef('DDK').name, 'organDonor');
  assert.equal(getFieldDef('DAW').name, 'weight');

  for (const incorrectId of ['DCE', 'DAR', 'DAS']) {
    assert.equal(getFieldDef(incorrectId), undefined);
    assert.equal(DEFAULT_FIELD_ORDER.includes(incorrectId), false);
  }

  for (const fieldId of ['DCA', 'DCB', 'DCD', 'DDB', 'DDJ', 'DDK', 'DAW']) {
    assert.ok(getFieldDef(fieldId), `${fieldId} should have a standard field definition`);
    assert.ok(DEFAULT_FIELD_ORDER.includes(fieldId), `${fieldId} should be in the standard field order`);
  }

  for (const profile of Object.values(PROFILES)) {
    for (const fieldId of profile.requiredFields) {
      assert.ok(getFieldDef(fieldId), `${fieldId} should be defined for ${profile.name}`);
    }
  }
});

test('normalizes card dates, height, and weight to their standard payload forms', () => {
  const nevada = getJurisdiction('NV');

  assert.equal(normalizeValue(getFieldDef('DDB'), '07242023', nevada), '07242023');
  assert.equal(normalizeValue(getFieldDef('DDJ'), '01152006', nevada), '01152006');
  assert.equal(normalizeValue(getFieldDef('DAU'), '65', nevada), '065 in');
  assert.equal(normalizeValue(getFieldDef('DAW'), '169 lb', nevada), '169');
});

test('auto-fill derives DDB and DDJ dates from issue and birth dates', () => {
  assert.equal(
    generateTestValue('DDB', 'NV', { issueDate: '07242023' }),
    '07242023'
  );
  assert.equal(
    generateTestValue('DDJ', 'NV', { birthDate: '01152005' }),
    '01152026'
  );
});

test('payload generation emits standard field IDs and normalized values', () => {
  const payload = generatePayload({
    dlNumber: 'NV1234567',
    lastName: 'SMITH',
    firstName: 'JANE',
    address: '123 MAIN ST',
    city: 'LAS VEGAS',
    state: 'NV',
    zipCode: '89101',
    country: 'USA',
    birthDate: '01151985',
    issueDate: '07242023',
    expiryDate: '07242031',
    cardRevisionDate: '07242023',
    under21Until: '01152006',
    sex: '2',
    height: '65',
    weight: '169',
    dlClass: 'D',
    restrictions: 'A',
    endorsement: 'H',
    organDonor: '1',
  }, 'NV', 'scandit');

  const parsed = parsePayload(payload.payloadString);
  assert.equal(parsed.valid, true, parsed.errors.join('; '));

  const generated = Object.fromEntries(
    parsed.fields.map(({ fieldId, value }) => [fieldId, value])
  );

  assert.equal(generated.DCA, 'D');
  assert.equal(generated.DCB, 'A');
  assert.equal(generated.DCD, 'H');
  assert.equal(generated.DDK, '1');
  assert.equal(generated.DAU, '065 in');
  assert.equal(generated.DAW, '169');
  assert.equal(generated.DCE, undefined);
  assert.equal(generated.DAR, undefined);
  assert.equal(generated.DAS, undefined);
});
