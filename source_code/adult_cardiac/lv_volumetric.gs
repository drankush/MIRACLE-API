/**
 * @lv_volumetric.gs
 * Handler for domain=LV
 *
 *
 * Behavior:
 * - Requires: parameter, gender, pm, age (integer)
 * - pm=mass -> allowed age 18..83
 * - pm=volume -> allowed age 16..83
 *   If no exact-age row, falls back to a row with blank age (wildcard).
 * - Returns: { inputs, units, results } or an error object (BadRequestError / NotFoundError).
 *
 * Note: This file expects BadRequestError, NotFoundError and normalize() to exist globally
 */
function handleRequest_lv(e, spreadsheetId, startTime, timeoutMs) {
  // --- Helpers ---
  const _norm = (v) => (v == null ? '' : String(v).trim().toLowerCase());
  const maybeNumber = (v) => {
    if (v === '' || v == null) return null;
    if (typeof v === 'number') return v;
    const n = Number(String(v).trim());
    return Number.isFinite(n) ? n : (String(v).trim() || null);
  };

  // --- Input extraction & basic validation ---
  const params = (e && e.parameter) ? e.parameter : {};
  const inputDomain = params.domain || 'LV';
  const rawParam = params.parameter;
  const rawGender = params.gender;
  const rawPm = params.pm;
  const rawAge = params.age;

  if (!rawParam) throw new BadRequestError('Missing required parameter: parameter');
  if (!rawGender) throw new BadRequestError('Missing required parameter: gender');
  if (!rawPm) throw new BadRequestError('Missing required parameter: pm');
  if (rawAge == null || rawAge === '') throw new BadRequestError('Missing required parameter: age');

  const parameter = _norm(rawParam);
  const gender = _norm(rawGender);
  const pm = _norm(rawPm);
  // allowed parameters list
  const ALLOWED_PARAMETERS = [
    'lvedv', 'lvedvi', 'lvesv', 'lvesvi', 'lvsv', 'lvsvi',
    'lvef', 'lvm', 'lvmi', 'co', 'ci', 'lvm/edv'
  ];
  if (!ALLOWED_PARAMETERS.includes(parameter)) {
    throw new BadRequestError(`Invalid parameter value: '${rawParam}'. Must be one of the allowed parameters.`);
  }

  // validate gender
  if (gender !== 'male' && gender !== 'female') {
    throw new BadRequestError(`Invalid gender value: '${rawGender}'. Must be 'male' or 'female'.`);
  }

  // validate pm
  if (pm !== 'mass' && pm !== 'volume') {
    throw new BadRequestError(`Invalid pm value: '${rawPm}'. Must be 'mass' or 'volume'.`);
  }

  // parse and validate age (must be integer)
  const requestedAge = Number(String(rawAge).trim());
  if (!Number.isFinite(requestedAge) || !Number.isInteger(requestedAge)) {
    throw new BadRequestError(`Invalid age value: '${rawAge}'. Age must be an integer.`);
  }

  // pm-specific allowed request-age ranges
  const PM_ALLOWED = { mass: { min: 18, max: 83 }, volume: { min: 16, max: 83 } };
  const allowed = PM_ALLOWED[pm];
  if (requestedAge < allowed.min || requestedAge > allowed.max) {
    throw new BadRequestError(
      `Invalid age: ${requestedAge}. For pm=${pm}, age must be between ${allowed.min} and ${allowed.max}.`
    );
  }

  // --- Open spreadsheet and locate sheet ---
  const sheetName = 'adult_cardiac.lv_volumetric';
  const ss = SpreadsheetApp.openById(spreadsheetId);
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) throw new NotFoundError(`Sheet '${sheetName}' not found in spreadsheet ${spreadsheetId}`);

  const lastCol = sheet.getLastColumn();
  if (lastCol < 1) throw new NotFoundError(`Sheet '${sheetName}' appears empty or has no columns.`);
  const headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  const headerIndex = {};
  headers.forEach((h, i) => { headerIndex[_norm(h)] = i; });

  const requiredHeaders = ['parameter','units','gender','mean','sd','ll','ul','age','pm'];
  for (const h of requiredHeaders) {
    if (headerIndex[h] === undefined) {
      throw new BadRequestError(`Missing required header '${h}' in sheet '${sheetName}'.`);
    }
  }

  const lastRow = sheet.getLastRow();
  if (lastRow < 2) throw new NotFoundError(`No data rows found in sheet '${sheetName}'.`);
  const data = sheet.getRange(2, 1, lastRow - 1, lastCol).getValues();

  // --- Find matches: exact parameter/gender/pm, then exact-age if present, else blank-age fallback ---
  const candidates = [];
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    const rowParam = _norm(row[headerIndex['parameter']]);
    const rowGender = _norm(row[headerIndex['gender']]);
    const rowPm = _norm(row[headerIndex['pm']]);
    if (rowParam === parameter && rowGender === gender && rowPm === pm) {
      const rowAgeCell = row[headerIndex['age']];
      // normalize row age if numeric or string numeric
      let rowAgeNum = null;
      if (rowAgeCell !== '' && rowAgeCell != null) {
        const n = Number(String(rowAgeCell).trim());
        if (Number.isFinite(n)) rowAgeNum = n;
      }
      candidates.push({
        rowIndex: i + 2,
        raw: row,
        rowAgeNum: rowAgeNum, // null means blank/non-numeric (treated as wildcard)
        rowAgeRaw: rowAgeCell
      });
    }
  }

  if (candidates.length === 0) {
    throw new NotFoundError(
      `No rows found matching parameter='${rawParam}', gender='${rawGender}', pm='${rawPm}' in sheet '${sheetName}'.`
    );
  }

  // prefer exact numeric age match
  let chosen = candidates.find(c => c.rowAgeNum === requestedAge) || null;
  // fallback to wildcard (blank/ non-numeric age cell)
  if (!chosen) {
    chosen = candidates.find(c => c.rowAgeNum === null) || null;
  }

  if (!chosen) {
    throw new NotFoundError(
      `No matching reference data row found for { parameter='${rawParam}', gender='${rawGender}', pm='${rawPm}', age=${requestedAge} }`
    );
  }

  // --- Build and return result (no _meta) ---
  const r = chosen.raw;
  const unitsVal = r[headerIndex['units']];
  const meanVal = maybeNumber(r[headerIndex['mean']]);
  const sdVal = maybeNumber(r[headerIndex['sd']]);
  const llVal = maybeNumber(r[headerIndex['ll']]);
  const ulVal = maybeNumber(r[headerIndex['ul']]);

  const result = {
    inputs: {
      domain: inputDomain,
      parameter: rawParam,
      gender: rawGender,
      pm: rawPm,
      age: requestedAge
    },
    units: unitsVal,
    results: {
      mean: meanVal,
      sd: sdVal,
      ll: llVal,
      ul: ulVal
    }
  };

  return result;
}
