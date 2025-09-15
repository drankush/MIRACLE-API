/**
 * @file rv_volumetric.gs
 * @description Handles requests for the RV (Right Ventricle) domain.
 */

/**
 * A helper function to check if a given age falls within a specific range string.
 * @param {number} age - The numeric age to check.
 * @param {string} rangeString - The range definition string (e.g., "20-79").
 * @returns {boolean} - True if the age is within the range (inclusive), otherwise false.
 */
function isAgeInRange(age, rangeString) {
  if (!rangeString || typeof rangeString !== 'string') return false;
  
  const parts = rangeString.split('-').map(s => parseInt(s.trim(), 10));
  if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
    const [min, max] = parts;
    return age >= min && age <= max;
  }
  return false;
}

/**
 * Handles GET requests for the 'RV' domain.
 * sheet based on parameter, gender, age, and papillary muscle (pm) inclusion.
 *
 *
 * @param {object} e - The event parameter from doGet, containing query parameters.
 * @param {string} SPREADSHEET_ID - The ID of the spreadsheet to use.
 * @returns {object} - A result object to be serialized into JSON.
 * @throws {BadRequestError} - If required parameters are missing or invalid.
 * @throws {NotFoundError} - If no matching data is found in the sheet.
 */
function handleRequest_rv(e, SPREADSHEET_ID) {
  const SHEET_NAME = 'adult_cardiac.rv_volumetric';
  
  // --- 1. Extract and Validate Parameters ---
  const { parameter, gender, age, pm } = e.parameter;

  if (!parameter || !gender || !age || !pm) {
    throw new BadRequestError('Missing one or more required parameters: parameter, gender, age, pm.');
  }
  
  const ageValue = parseInt(age, 10);
  if (isNaN(ageValue)) {
    throw new BadRequestError(`Invalid age value: '${age}'. It must be an integer.`);
  }

  const normalizedParameter = normalize(parameter);
  const normalizedGender = normalize(gender);
  const normalizedPm = normalize(pm);

  // --- 2. Fetch and Process Spreadsheet Data ---
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    throw new Error(`Sheet with name '${SHEET_NAME}' was not found.`);
  }

  const data = sheet.getDataRange().getValues();
  const headers = data[0].map(h => normalize(h));
  const rows = data.slice(1);

  // --- 3. Find the Matching Row ---
  let foundRow = null;

  for (const row of rows) {
    const rowParameter = normalize(row[headers.indexOf('parameter')]);
    const rowGender = normalize(row[headers.indexOf('gender')]);
    const rowPm = normalize(row[headers.indexOf('pm')]);
    const rowAgeRange = row[headers.indexOf('age')];

    if (
      rowParameter === normalizedParameter &&
      rowGender === normalizedGender &&
      rowPm === normalizedPm &&
      isAgeInRange(ageValue, rowAgeRange)
    ) {
      foundRow = row;
      break; 
    }
  }

  // --- 4. Format the Response ---
  if (!foundRow) {
    throw new NotFoundError(`No data found for parameter='${parameter}', gender='${gender}', age='${age}', pm='${pm}'.`);
  }
  
  const result = {
    units: foundRow[headers.indexOf('units')],
    mean: foundRow[headers.indexOf('mean')],
    sd: foundRow[headers.indexOf('sd')],
    ll: foundRow[headers.indexOf('ll')],
    ul: foundRow[headers.indexOf('ul')]
  };

  const finalResponse = {
    inputs: {
      domain: 'RV',
      parameter: parameter,
      gender: gender,
      age: age,
      pm: pm
    },
    results: result
  };

  return finalResponse;
}
