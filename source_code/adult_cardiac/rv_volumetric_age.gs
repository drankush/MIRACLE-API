/**
 * @file rv_volumetric_age.gs
 * @description Handles requests for the RV_AGE domain (Right Ventricle by Age).
 */

/**
 * A helper function to determine the correct age group string based on a numeric age.
 * Assumes 10-year groupings as defined in the sheet.
 * @param {number} age - The numeric age.
 * @returns {string|null} - The age group string (e.g., "40-49") or null if no group matches.
 */
function getRvAgeGroup(age) {
  if (age >= 20 && age <= 29) return '20-29';
  if (age >= 30 && age <= 39) return '30-39';
  if (age >= 40 && age <= 49) return '40-49';
  if (age >= 50 && age <= 59) return '50-59';
  return null; // Should not happen if age is pre-validated
}


/**
 * Handles GET requests for the 'RV_AGE' domain.
 * sheet based on parameter, gender, and a validated age.
 *
 *
 * @param {object} e - The event parameter from doGet, containing query parameters.
 * @param {string} SPREADSHEET_ID - The ID of the spreadsheet to use.
 * @returns {object} - A result object to be serialized into JSON.
 * @throws {BadRequestError} - If required parameters are missing or invalid.
 * @throws {NotFoundError} - If no matching data is found in the sheet.
 */
function handleRequest_rv_age(e, SPREADSHEET_ID) {
  const SHEET_NAME = 'adult_cardiac.rv_volumetric_age';
  const PM_FILTER = 'volume'; // Papillary muscle inclusion is always 'volume' for this domain.
  
  // --- 1. Extract and Validate Parameters ---
  const { parameter, gender, age } = e.parameter;

  if (!parameter || !gender || !age) {
    throw new BadRequestError('Missing one or more required parameters: parameter, gender, age.');
  }
  
  const ageValue = parseInt(age, 10);
  if (isNaN(ageValue) || ageValue < 20 || ageValue > 59) {
    throw new BadRequestError(`Invalid age: '${age}'. Age must be a whole number between 20 and 59.`);
  }

  const normalizedParameter = normalize(parameter);
  const normalizedGender = normalize(gender);
  const targetAgeGroup = getRvAgeGroup(ageValue);

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
    const rowAgeGrp = row[headers.indexOf('age_grp')]; // No need to normalize target string
    const rowPm = normalize(row[headers.indexOf('pm')]);

    if (
      rowParameter === normalizedParameter &&
      rowGender === normalizedGender &&
      rowAgeGrp === targetAgeGroup &&
      rowPm === PM_FILTER 
    ) {
      foundRow = row;
      break; 
    }
  }

  // --- 4. Format the Response ---
  if (!foundRow) {
    throw new NotFoundError(`No data found for parameter='${parameter}', gender='${gender}', and age='${age}'.`);
  }
  
  const result = {
    units: foundRow[headers.indexOf('units')],
    age_grp: foundRow[headers.indexOf('age_grp')], // Return the matched group
    mean: foundRow[headers.indexOf('mean')],
    sd: foundRow[headers.indexOf('sd')],
    ll: foundRow[headers.indexOf('ll')],
    ul: foundRow[headers.indexOf('ul')]
  };

  const finalResponse = {
    inputs: {
      domain: 'RV_AGE',
      parameter: parameter,
      gender: gender,
      age: age
    },
    results: result
  };

  return finalResponse;
}
