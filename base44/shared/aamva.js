// AAMVA PDF417 Payload Engine — Generator, Validator, Parser
// Based on AAMVA DL/ID Card Design Standard 2025

import {
  JURISDICTIONS, getJurisdiction, getFieldDef, getFields,
  PROFILES, DEFAULT_FIELD_ORDER,
} from './jurisdictions.js';

// Control characters (actual ASCII bytes)
export const LF = 0x0A; // Line Feed — Data Element Separator (header)
export const RS = 0x1E; // Record Separator — Data Element Separator (subfile, AAMVA v10)
export const CR = 0x0D; // Carriage Return — Segment Terminator
export const GS = 0x1D; // Group Separator

const encoder = new TextEncoder();
// Use latin1 (binary-safe) to preserve all control characters (LF, RS, CR, etc.)
const decoder = new TextDecoder('latin1');

function strToBytes(str) {
  return Array.from(encoder.encode(str));
}

function bytesToStr(bytes) {
  return decoder.decode(new Uint8Array(bytes));
}

// ========== NORMALIZATION ==========

export function normalizeValue(fieldDef, value, jurisdiction) {
  if (value === undefined || value === null || value === '') return '';
  let v = String(value).trim();

  switch (fieldDef.fieldId) {
    case 'DBB':
    case 'DBD':
    case 'DBA':
      // Dates: normalize to MMDDCCYY (8 digits)
      v = v.replace(/[^0-9]/g, '');
      if (v.length === 8) return v;
      if (v.length === 6) {
        // Assume MMDDYY -> MMDDCCYY (20xx for YY < 50, 19xx for >= 50)
        const yy = parseInt(v.substring(4));
        const cc = yy < 50 ? '20' : '19';
        return v.substring(0, 4) + cc + v.substring(4);
      }
      return v;
    case 'DAU':
      // Jika versi AAMVA 04 (seperti Hawaii), pakai format lama "XX in "
      if (jurisdiction && jurisdiction.aamvaVersion === '04') {
        v = v.replace(/[^0-9]/g, '');
        return v + ' in ';
      }
      // WAJIB 3 digit angka (AAMVA Standard). Contoh: "69" -> "069"
      v = v.replace(/[^0-9]/g, '');
      return v.padStart(3, '0');
    case 'DDB':
      // WAJIB 3 digit angka. Contoh: "169" -> "169"
      v = v.replace(/[^0-9]/g, '');
      return v.padStart(3, '0');
    case 'DAJ':
      // State: uppercase 2-letter code
      v = v.toUpperCase().substring(0, 2);
      return v;
    case 'DCG':
      // Country: normalize "United States" -> "USA"
      if (/^united\s*states$/i.test(v)) return 'USA';
      if (/^us$/i.test(v)) return 'USA';
      return v.toUpperCase().substring(0, 3);
    case 'DAQ':
    case 'DCF':
    case 'DCK':
      // Alphanumeric IDs: uppercase, strip spaces
      return v.toUpperCase().replace(/\s/g, '');
    default:
      return v.toUpperCase();
  }
}

// ========== VALIDATION ==========

export function validateField(fieldDef, value, jurisdiction) {
  if (fieldDef.required && (!value || value.trim() === '')) {
    return { valid: false, error: `${fieldDef.label} is required` };
  }
  if (!value || value.trim() === '') return { valid: true, error: null };

  const v = String(value).trim();

  switch (fieldDef.validator) {
    case 'date': {
      const digits = v.replace(/[^0-9]/g, '');
      if (digits.length !== 8 && digits.length !== 6) {
        return { valid: false, error: 'Requires a date in the MMDDYYYY format' };
      }
      const mm = parseInt(digits.substring(0, 2));
      const dd = parseInt(digits.substring(2, 4));
      const yyyy = digits.length === 8 ? parseInt(digits.substring(4)) : null;
      if (mm < 1 || mm > 12) return { valid: false, error: 'Invalid month (01-12)' };
      if (dd < 1 || dd > 31) return { valid: false, error: 'Invalid day (01-31)' };
      if (yyyy && (yyyy < 1900 || yyyy > 2100)) return { valid: false, error: 'Invalid year' };
      return { valid: true, error: null };
    }
    case 'zipCode': {
      const digits = v.replace(/[^0-9]/g, '');
      if (digits.length !== 5 && digits.length !== 9) {
        return { valid: false, error: 'ZIP code must be 5 or 9 digits' };
      }
      return { valid: true, error: null };
    }
    case 'height': {
      const inches = parseInt(v);
      if (isNaN(inches) || inches < 36 || inches > 96) {
        return { valid: false, error: 'Height must be 36–96 inches' };
      }
      return { valid: true, error: null };
    }
    case 'weight': {
      const lbs = parseInt(v);
      if (isNaN(lbs) || lbs < 50 || lbs > 500) {
        return { valid: false, error: 'Weight must be 50–500 lbs' };
      }
      return { valid: true, error: null };
    }
    default:
      if (fieldDef.maxLength && v.length > fieldDef.maxLength) {
        return { valid: false, error: `Maximum ${fieldDef.maxLength} characters` };
      }
      return { valid: true, error: null };
  }
}

export function validateForm(data, jurisdictionCode, profileKey) {
  const { fields } = getFields(jurisdictionCode, profileKey);
  const errors = {};
  let hasErrors = false;
  for (const field of fields) {
    const result = validateField(field, data[field.name]);
    if (!result.valid) {
      errors[field.name] = result.error;
      if (field.required) hasErrors = true;
    }
  }
  return { valid: !hasErrors, errors };
}

// ========== PAYLOAD GENERATION ==========

export function generatePayload(data, jurisdictionCode, profileKey, options = {}) {
  const jur = getJurisdiction(jurisdictionCode);
  const profile = PROFILES[profileKey] || PROFILES.scandit;
  const { fields } = getFields(jurisdictionCode, profileKey);

  // Per AAMVA 2025 spec (Annex D.12.3):
  // Header: @ LF RS CR "ANSI " IIN AAMVA_VER JUR_VER NUM_ENTRIES
  // Subfile fields are separated by LF (Data Element Separator)
  const aamvaMajor = parseInt(jur.aamvaVersion);
  const dataElementSep = LF; // LF separates fields within subfiles
  const segmentTerm = CR;

  // Build DL subfile data elements (normalized)
  const dlFields = [];
  for (const field of fields) {
    let value = data[field.name];
    if (field.autoFill === 'jurisdiction') value = jur.code;
    if (field.autoFill === 'country') value = 'USA';
    if (value === undefined || value === null || value === '') continue;
    const normalized = normalizeValue(field, value, jur);
    if (normalized === '') continue;
    dlFields.push({ fieldId: field.fieldId, label: field.label, value: normalized, raw: value });
  }

  // Build DL subfile bytes per AAMVA 2025 spec D.13 example:
  // "DL" LF field1 LF field2 ... LF fieldN CR
  const dlSubfileBytes = [];
  dlSubfileBytes.push(...strToBytes('DL'));
  for (const field of dlFields) {
    dlSubfileBytes.push(LF); // LF before each field
    dlSubfileBytes.push(...strToBytes(field.fieldId + field.value));
  }
  dlSubfileBytes.push(segmentTerm); // CR at end
  const dlSubfileLength = dlSubfileBytes.length;

  // Build ZK subfile (if enabled by jurisdiction)
  let zkSubfileBytes = [];
  let zkSubfileLength = 0;
  if (jur.includeZk) {
    zkSubfileBytes.push(...strToBytes('ZK'));
    zkSubfileBytes.push(LF);
    zkSubfileBytes.push(...strToBytes('DIB' + jur.iin));
    zkSubfileBytes.push(LF);
    zkSubfileBytes.push(...strToBytes('DIB' + jur.jurisdictionVersion));
    zkSubfileBytes.push(segmentTerm);
    zkSubfileLength = zkSubfileBytes.length;
  }

  // ✦ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ✦
  // [ REAL ID FIX ] Build ZH subfile KHUSUS untuk Hawaii
  // ✦ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ✦
  let zhSubfileBytes = [];
  let zhSubfileLength = 0;
  if (jur.code === 'HI') {
    zhSubfileBytes.push(...strToBytes('ZH'));
    zhSubfileBytes.push(LF);
    zhSubfileBytes.push(...strToBytes('ZHAH'));
    zhSubfileBytes.push(LF);
    zhSubfileBytes.push(...strToBytes('ZHB'));
    zhSubfileBytes.push(LF);
    zhSubfileBytes.push(...strToBytes('ZHCHIDL_L'));
    zhSubfileBytes.push(segmentTerm);
    zhSubfileLength = zhSubfileBytes.length;
  }

  const numEntries = 1 + (jur.includeZk ? 1 : 0) + (jur.code === 'HI' ? 1 : 0);
  const designatorSize = 10; // TYPE(2) + OFFSET(4) + LENGTH(4) — no trailing byte between designators

  // Build header fixed part per AAMVA 2025 spec D.12.3:
  const headerFixed = [
    0x40, // @ compliance indicator
    LF,   // Data Element Separator
    RS,   // Record Separator
    CR,   // Segment Terminator
    ...strToBytes('ANSI '), // 5 bytes with trailing space
    ...strToBytes(jur.iin),
    ...strToBytes(String(jur.aamvaVersion).padStart(2, '0').substring(0, 2)),
    ...strToBytes(String(jur.jurisdictionVersion).padStart(2, '0').substring(0, 2)),
    ...strToBytes(String(numEntries).padStart(2, '0')),
  ];

  const totalHeaderLength = headerFixed.length + designatorSize * numEntries;
  const dlOffset = totalHeaderLength;
  const zkOffset = jur.includeZk ? dlOffset + dlSubfileLength : 0;
  const zhOffset = jur.code === 'HI' ? dlOffset + dlSubfileLength + zkSubfileLength : 0;

  // Build subfile designators (Table D.2): TYPE(2) + OFFSET(4) + LENGTH(4)
  const designators = [];
  designators.push(...strToBytes('DL'));
  designators.push(...strToBytes(String(dlOffset).padStart(4, '0')));
  designators.push(...strToBytes(String(dlSubfileLength).padStart(4, '0')));

  if (jur.includeZk) {
    designators.push(...strToBytes('ZK'));
    designators.push(...strToBytes(String(zkOffset).padStart(4, '0')));
    designators.push(...strToBytes(String(zkSubfileLength).padStart(4, '0')));
  }

  if (jur.code === 'HI') {
    designators.push(...strToBytes('ZH'));
    designators.push(...strToBytes(String(zhOffset).padStart(4, '0')));
    designators.push(...strToBytes(String(zhSubfileLength).padStart(4, '0')));
  }

  // Assemble full payload
  const allBytes = [...headerFixed, ...designators, ...dlSubfileBytes, ...zkSubfileBytes, ...zhSubfileBytes];
  const payload = new Uint8Array(allBytes);
  const payloadString = bytesToStr(allBytes);

  const jv2 = String(jur.jurisdictionVersion).padStart(2, '0').substring(0, 2);
  const av2 = String(jur.aamvaVersion).padStart(2, '0').substring(0, 2);

  return {
    payload,
    payloadString,
    header: {
      complianceIndicator: '@',
      fileType: 'ANSI ',
      iin: jur.iin,
      aamvaVersion: av2,
      jurisdictionVersion: jv2,
      numberOfEntries: numEntries,
    },
    subfiles: [
      { type: 'DL', offset: dlOffset, length: dlSubfileLength, fields: dlFields },
      ...(jur.includeZk ? [{ type: 'ZK', offset: zkOffset, length: zkSubfileLength, fields: [] }] : []),
      ...(jur.code === 'HI' ? [{ type: 'ZH', offset: zhOffset, length: zhSubfileLength, fields: [] }] : []),
    ],
    stats: {
      totalPayloadLength: allBytes.length,
      dlSubfileLength,
      zkSubfileLength,
      zhSubfileLength: jur.code === 'HI' ? zhSubfileLength : null,
      dlOffset,
      zkOffset: jur.includeZk ? zkOffset : null,
      zhOffset: jur.code === 'HI' ? zhOffset : null,
      dataElementSeparator: 'LF (0x0A)',
      recordSeparator: 'RS (0x1E)',
      segmentTerminator: 'CR (0x0D)',
    },
    parsedFields: dlFields.map(f => ({
      fieldId: f.fieldId,
      name: f.label,
      value: f.value,
      status: 'valid',
    })),
    jurisdiction: jur,
    profile,
  };
}

// ========== PARSING ==========

export function parsePayload(payloadString) {
  const bytes = strToBytes(payloadString);
  const result = {
    valid: false,
    errors: [],
    warnings: [],
    header: null,
    subfiles: [],
    fields: [],
    totalLength: bytes.length,
  };

  if (bytes.length < 20) {
    result.errors.push('Payload too short to contain a valid AAMVA header');
    return result;
  }

  // Compliance indicator
  if (bytes[0] !== 0x40) {
    result.errors.push('Missing or invalid compliance indicator (expected @ at byte 0)');
  }

  // Data element separator after @
  if (bytes[1] !== LF) {
    result.errors.push('Missing data element separator (LF) after compliance indicator');
  }

  // Check for RS + CR after LF (AAMVA 2025 header: @ LF RS CR ANSI ...)
  let pos = 2;
  if (bytes[2] === RS && bytes[3] === CR) {
    // New 2025 format: @ LF RS CR ANSI ...
    pos = 4;
  }
  // else old format: @ LF ANSI ...

  // File type — "ANSI " (5 bytes with trailing space)
  let fileType = bytesToStr(bytes.slice(pos, pos + 5));
  let fileTypeLength = 5;
  if (fileType === 'ANSI ') {
    // correct
  } else if (bytesToStr(bytes.slice(pos, pos + 4)) === 'ANSI') {
    fileType = 'ANSI';
    fileTypeLength = 4;
    result.warnings.push('File type missing trailing space (should be "ANSI " 5 bytes)');
  } else {
    result.errors.push(`Invalid file type: "${fileType}" (expected "ANSI ")`);
  }

  pos += fileTypeLength;

  // IIN (6 bytes)
  const iin = bytesToStr(bytes.slice(pos, pos + 6));
  if (!/^\d{6}$/.test(iin)) {
    result.errors.push(`Invalid IIN: "${iin}" (must be 6 digits)`);
  }
  pos += 6;

  // AAMVA version (2 bytes)
  const aamvaVersion = bytesToStr(bytes.slice(pos, pos + 2));
  pos += 2;

  // Jurisdiction version (2 bytes)
  const jurisdictionVersion = bytesToStr(bytes.slice(pos, pos + 2));
  pos += 2;

  // Number of entries (2 bytes)
  const numEntriesStr = bytesToStr(bytes.slice(pos, pos + 2));
  const numEntries = parseInt(numEntriesStr, 10);
  if (isNaN(numEntries) || numEntries < 1 || numEntries > 10) {
    result.errors.push(`Invalid number of entries: "${numEntriesStr}" (expected 01-10)`);
  }
  pos += 2;

  // Parse subfile designators (10 bytes each: TYPE(2)+OFFSET(4)+LENGTH(4))
  const subfiles = [];
  for (let i = 0; i < numEntries; i++) {
    if (pos + 10 > bytes.length) {
      result.errors.push(`Subfile designator ${i + 1} truncated`);
      break;
    }
    const type = bytesToStr(bytes.slice(pos, pos + 2));
    const offset = parseInt(bytesToStr(bytes.slice(pos + 2, pos + 6)));
    const length = parseInt(bytesToStr(bytes.slice(pos + 6, pos + 10)));
    subfiles.push({ type, offset, length, designatorPos: pos });
    if (isNaN(offset) || isNaN(length)) {
      result.errors.push(`Invalid offset/length for subfile ${type}`);
    }
    pos += 10;
    // Some implementations add LF between designators — skip if present
    if (pos < bytes.length && bytes[pos] === LF) pos += 1;
  }

  result.header = {
    complianceIndicator: '@',
    fileType,
    iin,
    aamvaVersion,
    jurisdictionVersion,
    numberOfEntries: numEntries,
  };

  // Validate offsets and lengths
  for (const sf of subfiles) {
    if (sf.offset >= bytes.length) {
      result.errors.push(`Subfile ${sf.type} offset ${sf.offset} exceeds payload length ${bytes.length}`);
      continue;
    }
    if (sf.offset + sf.length > bytes.length) {
      result.errors.push(`Subfile ${sf.type} length ${sf.length} exceeds payload bounds (offset ${sf.offset} + length = ${sf.offset + sf.length} > ${bytes.length})`);
      continue;
    }
    // Check subfile type at offset
    const actualType = bytesToStr(bytes.slice(sf.offset, sf.offset + 2));
    if (actualType !== sf.type) {
      result.errors.push(`Subfile type mismatch at offset ${sf.offset}: expected "${sf.type}", found "${actualType}"`);
    }
    // Check segment terminator at end
    const endPos = sf.offset + sf.length - 1;
    if (endPos >= 0 && endPos < bytes.length && bytes[endPos] !== CR) {
      result.warnings.push(`Subfile ${sf.type} missing segment terminator (CR) at byte ${endPos}`);
    }
  }

  // Parse DL subfile fields
  for (const sf of subfiles) {
    if (sf.type !== 'DL') continue;
    const sfData = bytes.slice(sf.offset, sf.offset + sf.length);
    // Find the first separator after "DL"
    let fpos = 2; // after "DL"
    // Detect separator type
    let sepByte = RS;
    if (fpos < sfData.length && sfData[fpos] === LF) sepByte = LF;
    fpos += 1; // skip first separator after subfile type

    const fields = [];
    let current = [];
    for (let i = fpos; i < sfData.length; i++) {
      if (sfData[i] === sepByte) {
        const fieldStr = bytesToStr(current);
        if (fieldStr.length >= 3) {
          const fieldId = fieldStr.substring(0, 3);
          const value = fieldStr.substring(3);
          const fieldDef = getFieldDef(fieldId);
          fields.push({
            fieldId,
            name: fieldDef ? fieldDef.label : fieldId,
            value,
            status: 'valid',
          });
        }
        current = [];
      } else if (sfData[i] === CR) {
        // segment terminator — last field
        const fieldStr = bytesToStr(current);
        if (fieldStr.length >= 3) {
          const fieldId = fieldStr.substring(0, 3);
          const value = fieldStr.substring(3);
          const fieldDef = getFieldDef(fieldId);
          fields.push({
            fieldId,
            name: fieldDef ? fieldDef.label : fieldId,
            value,
            status: 'valid',
          });
        }
        break;
      } else {
        current.push(sfData[i]);
      }
    }
    sf.fields = fields;
    result.fields = fields;
  }

  result.subfiles = subfiles;
  result.valid = result.errors.length === 0;
  return result;
}

// ========== VALIDATION (public API) ==========

export function validatePayload(payloadString) {
  if (!payloadString || payloadString.trim() === '') {
    return { valid: false, errors: ['Empty payload'], warnings: [], header: null, subfiles: [], fields: [], totalLength: 0 };
  }
  return parsePayload(payloadString);
}

// ========== INPUT NORMALIZATION ==========

// Convert escaped payload strings to raw bytes for validation
export function unescapePayload(input) {
  if (!input) return '';
  let result = input;
  // Replace common escape sequences with actual control characters
  result = result.replace(/\\n/g, String.fromCharCode(0x0A));  // \n → LF
  result = result.replace(/\\r/g, String.fromCharCode(0x0D));  // \r → CR
  result = result.replace(/\\x1e/g, String.fromCharCode(0x1E)); // \x1e → RS
  result = result.replace(/\\x1d/g, String.fromCharCode(0x1D)); // \x1d → GS
  result = result.replace(/\\x([0-9a-fA-F]{2})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
  // Also handle Unicode control char symbols (␊ ␍ ␞)
  result = result.replace(/\u240A/g, String.fromCharCode(0x0A)); // ␊ → LF
  result = result.replace(/\u240D/g, String.fromCharCode(0x0D)); // ␍ → CR
  result = result.replace(/\u241E/g, String.fromCharCode(0x1E)); // ␞ → RS
  return result;
}

// ========== DISPLAY HELPERS ==========

export function toHex(payload) {
  const bytes = payload instanceof Uint8Array ? Array.from(payload) : strToBytes(payload);
  return bytes.map(b => b.toString(16).padStart(2, '0').toUpperCase()).join(' ');
}

export function toEscaped(payloadString) {
  const bytes = strToBytes(payloadString);
  return bytes.map(b => {
    if (b === 0x0A) return '\\n';
    if (b === 0x0D) return '\\r';
    if (b === 0x1E) return '\\x1e';
    if (b === 0x1D) return '\\x1d';
    if (b === 0x40) return '@';
    if (b < 32) return '\\x' + b.toString(16).padStart(2, '0');
    return String.fromCharCode(b);
  }).join('');
}

export function toVisual(payloadString) {
  const bytes = strToBytes(payloadString);
  return bytes.map(b => {
    if (b === 0x0A) return '␊';
    if (b === 0x0D) return '␍';
    if (b === 0x1E) return '␞';
    if (b === 0x1D) return '␝';
    if (b < 32) return '·';
    return String.fromCharCode(b);
  }).join('');
}

export function getByteMap(payload) {
  const bytes = payload instanceof Uint8Array ? Array.from(payload) : strToBytes(payload);
  const map = [];
  // Header (AAMVA 2025: @ LF RS CR ANSI IIN AAMVA_VER JUR_VER NUM_ENTRIES)
  map.push({ start: 0, end: 1, length: 1, field: '@ Compliance Indicator' });
  map.push({ start: 1, end: 2, length: 1, field: 'LF Data Element Separator' });
  map.push({ start: 2, end: 3, length: 1, field: 'RS Record Separator' });
  map.push({ start: 3, end: 4, length: 1, field: 'CR Segment Terminator' });
  map.push({ start: 4, end: 9, length: 5, field: 'ANSI File Type (with space)' });
  map.push({ start: 9, end: 15, length: 6, field: 'IIN (Issuer Identification Number)' });
  map.push({ start: 15, end: 17, length: 2, field: 'AAMVA Version' });
  map.push({ start: 17, end: 19, length: 2, field: 'Jurisdiction Version' });
  map.push({ start: 19, end: 21, length: 2, field: 'Number of Entries' });
  // Subfile designators (10 bytes each)
  let pos = 21;
  const parsed = parsePayload(bytesToStr(bytes));
  for (const sf of parsed.subfiles) {
    map.push({ start: pos, end: pos + 2, length: 2, field: `Subfile Type: ${sf.type}` });
    map.push({ start: pos + 2, end: pos + 6, length: 4, field: `${sf.type} Offset: ${sf.offset}` });
    map.push({ start: pos + 6, end: pos + 10, length: 4, field: `${sf.type} Length: ${sf.length}` });
    pos += 10;
  }
  // Subfile data
  for (const sf of parsed.subfiles) {
    map.push({ start: sf.offset, end: sf.offset + 2, length: 2, field: `${sf.type} Subfile Type` });
    // Individual fields
    if (sf.fields) {
      let fpos = sf.offset + 3; // after type + separator
      for (const field of sf.fields) {
        const fieldLen = field.fieldId.length + field.value.length;
        map.push({ start: fpos, end: fpos + fieldLen, length: fieldLen, field: `${field.fieldId} ${field.name}: ${field.value}` });
        fpos += fieldLen + 1; // +1 for separator
      }
    }
  }
  return map;
}

// Get jurisdiction display info for header
export function getHeaderDisplay(jurisdictionCode) {
  const jur = getJurisdiction(jurisdictionCode);
  return {
    name: jur.name,
    revision: jur.revision,
    iin: jur.iin,
    aamvaVersion: jur.aamvaVersion,
    jurisdictionVersion: jur.jurisdictionVersion,
  };
}