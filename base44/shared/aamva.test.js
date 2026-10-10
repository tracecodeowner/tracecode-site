import assert from 'node:assert/strict';
import test from 'node:test';

import {
  generatePayload,
  normalizeValue,
  parsePayload,
  validateForm,
} from './aamva.js';
import {
  DEFAULT_FIELD_ORDER,
  generateTestValue,
  getFieldDef,
  getFields,
  getStateAutoCalcRules,
  getStateProfile,
  JURISDICTIONS,
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

  for (const incorrectId of ['DAR', 'DAS']) {
    assert.equal(getFieldDef(incorrectId), undefined);
    assert.equal(DEFAULT_FIELD_ORDER.includes(incorrectId), false);
  }

  for (const fieldId of ['DCA', 'DCB', 'DCD', 'DDB', 'DDJ', 'DDK', 'DAW', 'DCE', 'DCL']) {
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

test('auto-fill derives DDB from the state profile and DDJ from the birth date', () => {
  assert.equal(
    generateTestValue('DDB', 'NV', { issueDate: '07242023' }),
    '05242021'
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

test('payload generation includes auto-filled jurisdiction and country for every state', () => {
  for (const { code } of JURISDICTIONS) {
    const { payloadString } = generatePayload({}, code, 'scandit');
    const parsed = parsePayload(payloadString);
    const generated = Object.fromEntries(
      parsed.fields.map(({ fieldId, value }) => [fieldId, value])
    );

    assert.equal(parsed.valid, true, `${code}: ${parsed.errors.join('; ')}`);
    assert.equal(generated.DAJ, code, `${code}: DAJ should contain the jurisdiction code`);
    assert.equal(generated.DCG, 'USA', `${code}: DCG should contain the country code`);
    if (getFields(code, 'scandit').fields.some(({ fieldId }) => fieldId === 'DCB')) {
      assert.equal(generated.DCB, 'NONE', `${code}: empty restrictions should default to NONE`);
    }
    assert.equal(parsed.header.jurisdictionVersion, getJurisdiction(code).jurisdictionVersion);
    assert.match(getJurisdiction(code).jurisdictionVersion, /^\d{2}$/);
  }
});

test('payload force-includes Minnesota address line 2 and supplies Hawaii truncation defaults', () => {
  const minnesota = generatePayload({}, 'MN', 'scandit');
  const minnesotaParsed = parsePayload(minnesota.payloadString);
  assert.ok(
    minnesotaParsed.fields.some(({ fieldId, value }) => fieldId === 'DAH' && value === ''),
    'Minnesota DAH must be present even when its value is empty'
  );
  assert.ok(
    minnesota.payloadString.includes('ZMZMAN\nZMBN'),
    'Minnesota ZM subfile format remains unchanged'
  );
  assert.equal(generatePayload({}, 'NV', 'scandit').stats.dlOffset, 31);
  assert.equal(minnesota.stats.dlOffset, 41);

  const hawaiiParsed = parsePayload(generatePayload({}, 'HI', 'scandit').payloadString);
  for (const fieldId of ['DDE', 'DDF', 'DDG']) {
    assert.equal(
      hawaiiParsed.fields.find((field) => field.fieldId === fieldId)?.value,
      'U',
      `Hawaii ${fieldId} defaults to unknown truncation status`
    );
  }
});

test('validateForm passes the selected jurisdiction to field validation', () => {
  const result = validateForm({ height: '20' }, 'HI', 'scandit');
  assert.match(result.errors.height, /Height must be/);
});

test('card revision, Real ID status, and weight range are available for every jurisdiction', () => {
  for (const { code } of JURISDICTIONS) {
    const { fields } = getFields(code, 'scandit');
    const revisionDateField = fields.find(({ fieldId }) => fieldId === 'DDB');
    const realIdField = fields.find(({ fieldId }) => fieldId === 'DDA');
    const weightRangeField = fields.find(({ fieldId }) => fieldId === 'DCE');
    const profile = getStateProfile(code);

    assert.ok(revisionDateField, `${code}: DDB should be available`);
    assert.ok(realIdField, `${code}: DDA should be available`);
    assert.ok(weightRangeField, `${code}: DCE should be available`);
    assert.equal(
      revisionDateField.autoFillValue || '',
      generateTestValue('DDB', code),
      `${code}: DDB should follow the selected state profile`
    );

    const { payloadString } = generatePayload({
      cardRevisionDate: '04152024',
      complianceType: 'F',
      weight: '169',
    }, code, 'scandit');
    const parsed = parsePayload(payloadString);
    const revisionDate = parsed.fields.find(({ fieldId }) => fieldId === 'DDB');
    const realIdStatus = parsed.fields.find(({ fieldId }) => fieldId === 'DDA');
    const weightRange = parsed.fields.find(({ fieldId }) => fieldId === 'DCE');

    assert.equal(parsed.valid, true, `${code}: ${parsed.errors.join('; ')}`);
    assert.equal(revisionDate?.value, '04152024', `${code}: DDB should preserve the entered date`);
    assert.equal(realIdStatus?.value, 'F', `${code}: DDA should preserve the Real ID status`);
    assert.equal(weightRange?.value, undefined, `${code}: DCE should only be emitted when explicitly filled`);

    const autoFilled = parsePayload(generatePayload({
      issueDate: '03212023',
    }, code, 'scandit').payloadString);
    const autoRevision = autoFilled.fields.find(({ fieldId }) => fieldId === 'DDB')?.value || '';
    assert.equal(autoRevision, profile.cardRevisionDate || generateTestValue('DDB', code), `${code}: DDB should not use the issue date as a fallback`);
  }
});

test('state-source fields keep their help, calculators, and unmapped status', () => {
  for (const { code } of JURISDICTIONS) {
    const { fields } = getFields(code, 'scandit');
    for (const field of fields) {
      assert.ok(field.helpText?.trim(), `${code}: ${field.label} should have visible help text`);
    }
    for (const sourceField of getStateProfile(code).fields) {
      const field = fields.find(({ sourceName }) => sourceName === sourceField.sourceName);
      assert.ok(field, `${code}: ${sourceField.sourceName} should be displayed`);
      if (sourceField.fieldId) {
        assert.ok(field.helpText, `${code}: ${sourceField.sourceName} should have help text`);
      } else {
        assert.equal(field.notEncoded, true, `${code}: unmapped ${sourceField.sourceName} must not be encoded`);
      }
    }
  }

  assert.equal(generateTestValue('DCE', 'NV', { weight: '169' }), '4');
  assert.equal(generateTestValue('DCE', 'NV', { weight: '320' }), '9');

  const { fields: southCarolinaFields } = getFields('SC', 'scandit');
  const raceField = southCarolinaFields.find(({ fieldId }) => fieldId === 'DCL');
  assert.ok(raceField, 'South Carolina exposes ANSI D-20 race data');
  assert.ok(raceField.options.some(({ value }) => value === 'AI'));
  assert.ok(getFieldDef('DAZ').options.some(({ value }) => value === 'BLN'));

  const payload = parsePayload(generatePayload({
    raceEthnicity: 'AI',
    weightRange: '4',
  }, 'SC', 'scandit').payloadString);
  assert.equal(payload.fields.find(({ fieldId }) => fieldId === 'DCL')?.value, 'AI');
  assert.equal(payload.fields.find(({ fieldId }) => fieldId === 'DCE')?.value, '4');

  const jurisdictionWithUnmappedField = JURISDICTIONS.find(({ code }) =>
    getStateProfile(code).fields.some(({ fieldId }) => !fieldId)
  );
  assert.ok(jurisdictionWithUnmappedField, 'at least one source profile has unmapped fields');
  const { fields: sourceFields } = getFields(jurisdictionWithUnmappedField.code, 'scandit');
  const unmappedField = sourceFields.find(({ notEncoded }) => notEncoded);
  assert.ok(unmappedField, 'source-only fields are shown');
  const sourceOnlyPayload = parsePayload(generatePayload({
    [unmappedField.name]: 'SOURCE VALUE',
  }, jurisdictionWithUnmappedField.code, 'scandit').payloadString);
  assert.equal(
    sourceOnlyPayload.fields.some(({ fieldId }) => fieldId === unmappedField.sourceName),
    false,
    'source-only fields are not emitted as nonstandard AAMVA identifiers'
  );
});

test('state auto-calculators generate values matching every available CSV rule', () => {
  const autoCalcFieldIds = ['DAQ', 'DBD', 'DBA', 'DCK', 'DCF'];

  for (const { code } of JURISDICTIONS) {
    const rules = getStateAutoCalcRules(code);
    const { fields } = getFields(code, 'scandit');
    const generated = {};
    for (const fieldId of autoCalcFieldIds) {
      const rule = rules[fieldId];
      assert.ok(rule, `${code}: ${fieldId} should have a CSV auto-calculation rule`);
      const formField = fields.find(({ aamvaFieldId }) => aamvaFieldId === fieldId);
      assert.ok(formField?.calculator, `${code}: ${fieldId} should show its calculator button`);
      assert.ok(formField.helpText.trim(), `${code}: ${fieldId} should show its tooltip`);
      if (rule.tooltip) {
        assert.ok(formField.helpText.includes(rule.tooltip), `${code}: ${fieldId} should include its CSV tooltip`);
      }
      generated[fieldId] = generateTestValue(fieldId, code, {
        issueDate: generated.DBD || '03152023',
        birthDate: '02101990',
        dlNumber: generated.DAQ || '123456789',
        lastName: 'HERNANDEZ',
        firstName: 'JOHN',
      });

      assert.ok(generated[fieldId], `${code}: ${fieldId} should generate a value`);
      if (rule.pattern) {
        assert.match(
          generated[fieldId],
          new RegExp(`^(?:${rule.pattern})$`),
          `${code}: ${fieldId} should match its CSV pattern`
        );
      }
      if (rule.minLength && (!rule.placeholder || rule.placeholder.length >= Number(rule.minLength))) {
        assert.ok(generated[fieldId].length >= Number(rule.minLength), `${code}: ${fieldId} is too short`);
      }
      if (rule.maxLength) {
        assert.ok(generated[fieldId].length <= Number(rule.maxLength), `${code}: ${fieldId} is too long`);
      }
    }
  }
});
