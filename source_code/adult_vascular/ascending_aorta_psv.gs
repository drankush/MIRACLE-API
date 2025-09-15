/**
 * @description Handles requests for the MPSV_AA_4D domain (Mean Peak Systolic Velocity of the Ascending Aorta).
 */

/**
 * A helper function to check if a given age falls within a specific age range string.
 * @param {number} age - The numeric age to check.
 * @param {string} rangeString - The range definition string (e.g., "18-33 years", "> 60 years").
 * @returns {boolean} - True if the age is within the range, otherwise false.
 */
function isAgeInRange(age, rangeString) {
  const str = rangeString.trim();

  // Case 1: "18-33 years"
  const rangeMatch = str.match(/^(\d+)-(\d+)/);
  if (rangeMatch && rangeMatch.length === 3) {
    const lowerBound = parseInt(rangeMatch[1], 10);
    const upperBound = parseInt(rangeMatch[2], 10);
    return !isNaN(lowerBound) && !isNaN(upperBound) && age >= lowerBound && age <= upperBound;
  }

  // Case 2: "> 60 years"
  const greaterThanMatch = str.match(/^>\s*(\d+)/);
  if (greaterThanMatch && greaterThanMatch.length === 2) {
    const value = parseInt(greaterThanMatch[1], 10);
    return !isNaN(value) && age > value;
  }
  
  // Case 3: "< 20 years" (for future-proofing)
  const lessThanMatch = str.match(/^<\s*(\d+)/);
  if (lessThanMatch && lessThanMatch.length === 2) {
    const value = parseInt(lessThanMatch[1], 10);
    return !isNaN(value) && age < value;
  }

  // Return false if the format is not recognized
  return false;
}


/**
 * Handles GET requests for the 'MPSV_AA_4D' domain. It finds data in the '20_MPSV_AA_4D'
 * sheet based on the parameter and age.
 *
 *
 * @param {object} e - The event parameter from doGet, containing query parameters.
 * @param {string} SPREADSHEET_ID - The ID of the spreadsheet to use.
 * @returns {object} - A result object to be serialized into JSON.
 * @throws {BadRequestError} - If required parameters are missing or invalid.
 * @throws {NotFoundError} - If no matching data is found in the sheet.
 */
function handleRequest_mpsv_aa_4d(e, SPREADSHEET_ID) {
  const SHEET_NAME = 'adult_vascular.ascending_aorta_sv';
  
  // --- 1. Extract and Validate Parameters ---
  const { parameter, age } = e.parameter;

  if (!parameter || !age) {
    throw new BadRequestError('Missing one or more required parameters: parameter, age.');
  }
  
  const ageValue = parseInt(age, 10);
  if (isNaN(ageValue)) {
    throw new BadRequestError(`Invalid age value: '${age}'. It must be an integer.`);
  }

  const normalizedParameter = normalize(parameter);

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
    const rowAgeRange = row[headers.indexOf('age_range')];

    if (
      rowParameter === normalizedParameter &&
      isAgeInRange(ageValue, rowAgeRange)
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
    age_range: foundRow[headers.indexOf('age_range')], // Return the actual range string used
    units: foundRow[headers.indexOf('units')],
    mean: foundRow[headers.indexOf('mean')],
    sd: foundRow[headers.indexOf('sd')],
    ll: foundRow[headers.indexOf('ll')],
    ul: foundRow[headers.indexOf('ul')]
  };

  const finalResponse = {
    inputs: {
      domain: 'MPSV_AA_4D',
      parameter: parameter,
      age: age
    },
    results: result
  };

  return finalResponse;
}
