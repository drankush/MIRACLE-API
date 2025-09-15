/**
 * @file aortic_pwv.gs
 * @description Handles requests for the ADULT_PWV domain.
 */

/**
 * A helper function to check if a given age falls within a category string (e.g., "30-39").
 * @param {number} age - The numeric age to check.
 * @param {string} ageCategoryString - The range definition string (e.g., "30-39", "<30").
 * @returns {boolean} - True if the age is within the category, otherwise false.
 */
function isAgeInRange(age, ageCategoryString) {
  const str = ageCategoryString.trim();

  // Case 1: Handle ranges like "30-39"
  const rangeParts = str.split('-');
  if (rangeParts.length === 2) {
    const lowerBound = parseInt(rangeParts[0], 10);
    const upperBound = parseInt(rangeParts[1], 10);
    if (!isNaN(lowerBound) && !isNaN(upperBound)) {
      return age >= lowerBound && age <= upperBound;
    }
  }

  // Case 2: Handle open-ended ranges like "<30" or "≥80"
  if (str.startsWith('<')) {
    const value = parseInt(str.replace(/[^0-9]/g, ''), 10);
    return !isNaN(value) && age < value;
  }
  if (str.includes('≥') || str.includes('>=')) {
    const value = parseInt(str.replace(/[^0-9]/g, ''), 10);
    return !isNaN(value) && age >= value;
  }

  // Return false if the format is not recognized
  return false;
}


/**
 * Handles GET requests for the 'ADULT_PWV' domain. It finds pulse wave velocity data
 * based on parameter and age.
 *
 *
 * @param {object} e - The event parameter from doGet, containing query parameters.
 * @param {string} SPREADSHEET_ID - The ID of the spreadsheet to use.
 * @returns {object} - A result object to be serialized into JSON.
 * @throws {BadRequestError} - If required parameters are missing or invalid.
 * @throws {NotFoundError} - If no matching data is found in the sheet.
 */
function handleRequest_adult_pwv(e, SPREADSHEET_ID) {
  const SHEET_NAME = 'adult_vascular.aortic_pwv';
  
  // --- 1. Extract and Validate Parameters ---
  const { parameter, gender, age } = e.parameter;

  if (!parameter || !gender || !age) {
    throw new BadRequestError('Missing one or more required parameters: parameter, gender, age.');
  }
  
  const ageValue = parseInt(age, 10);
  if (isNaN(ageValue) || ageValue < 0) {
    throw new BadRequestError(`Invalid age value: '${age}'. It must be a non-negative number.`);
  }

  const normalizedParameter = normalize(parameter);
  // Note: The gender parameter is accepted for API consistency but is not used in the lookup for this specific dataset.
  
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
    const rowAgeCat = row[headers.indexOf('age_cat')];

    if (
      rowParameter === normalizedParameter &&
      isAgeInRange(ageValue, rowAgeCat)
    ) {
      foundRow = row;
      break;
    }
  }

  // --- 4. Format the Response ---
  if (!foundRow) {
    throw new NotFoundError(`No data found for parameter='${parameter}' and age='${age}'.`);
  }
  
  const result = {
    age_cat: foundRow[headers.indexOf('age_cat')], // Return the actual age category used
    median: foundRow[headers.indexOf('median')],
    ll_5th_percentile: foundRow[headers.indexOf('ll_5th_percentile')],
    ul_95th_percentile: foundRow[headers.indexOf('ul_95th_percentile')]
  };

  const finalResponse = {
    inputs: {
      domain: 'ADULT_PWV',
      parameter: parameter,
      gender: gender, // Echo gender even though it's not used in the lookup
      age: age
    },
    results: result
  };

  return finalResponse;
}
