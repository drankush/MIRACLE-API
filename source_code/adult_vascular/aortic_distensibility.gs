/**
 * @file aortic_distensibility.gs
 * @description Handles requests for the ADULT_AA_DISTENSIBILITY domain.
 */

/**
 * A helper function to check if a given age falls within a specific range string.
 * @param {number} age - The numeric age to check.
 * @param {string} rangeString - The range definition string (e.g., "20-29", "30-39").
 * @returns {boolean} - True if the age is within the range, otherwise false.
 */
function isAgeInRange(age, rangeString) {
  if (!rangeString || typeof rangeString !== 'string') {
    return false;
  }
  const parts = rangeString.split('-');
  if (parts.length !== 2) {
    return false;
  }

  const lowerBound = parseInt(parts[0].trim(), 10);
  const upperBound = parseInt(parts[1].trim(), 10);

  if (isNaN(lowerBound) || isNaN(upperBound)) {
    return false;
  }

  return age >= lowerBound && age <= upperBound;
}


/**
 * Handles GET requests for the 'ADULT_AA_DISTENSIBILITY' domain. 
 * sheet based on parameter, site, gender, and a specific age.
 *
 *
 * @param {object} e - The event parameter from doGet, containing query parameters.
 * @param {string} SPREADSHEET_ID - The ID of the spreadsheet to use.
 * @returns {object} - A result object to be serialized into JSON.
 * @throws {BadRequestError} - If required parameters are missing or invalid.
 * @throws {NotFoundError} - If no matching data is found in the sheet.
 */
function handleRequest_adult_aa_distensibility(e, SPREADSHEET_ID) {
  const SHEET_NAME = 'adult_vascular.aortic_distensibility';

  // --- 1. Extract and Validate Parameters ---
  const { parameter, site, gender, age } = e.parameter;

  if (!parameter || !site || !gender || !age) {
    throw new BadRequestError('Missing one or more required parameters: parameter, site, gender, age.');
  }

  const ageValue = parseInt(age, 10);
  if (isNaN(ageValue)) {
    throw new BadRequestError(`Invalid age value: '${age}'. It must be a number.`);
  }

  const normalizedParameter = normalize(parameter);
  const normalizedSite = normalize(site);
  const normalizedGender = normalize(gender);

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
    const rowSite = normalize(row[headers.indexOf('site')]);
    const rowGender = normalize(row[headers.indexOf('gender')]);
    const rowAgeCat = row[headers.indexOf('age_cat')];

    if (
      rowParameter === normalizedParameter &&
      rowSite === normalizedSite &&
      rowGender === normalizedGender &&
      isAgeInRange(ageValue, rowAgeCat)
    ) {
      foundRow = row;
      break; // Stop searching once a match is found
    }
  }

  // --- 4. Format the Response ---
  if (!foundRow) {
    throw new NotFoundError(`No data found for parameter='${parameter}', site='${site}', gender='${gender}', and age='${age}'.`);
  }

  const result = {
    units: foundRow[headers.indexOf('units')],
    age_cat: foundRow[headers.indexOf('age_cat')], // Also return the age category used for the lookup
    mean: foundRow[headers.indexOf('mean')],
    sd: foundRow[headers.indexOf('sd')],
    ll: foundRow[headers.indexOf('ll')],
    ul: foundRow[headers.indexOf('ul')]
  };

  const finalResponse = {
    inputs: {
      domain: 'ADULT_AA_DISTENSIBILITY',
      parameter,
      site,
      gender,
      age
    },
    results: result
  };

  return finalResponse;
}
