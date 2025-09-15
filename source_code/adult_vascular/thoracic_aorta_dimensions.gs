/**
 * @file thoracic_aorta_dimensions.gs
 * @description Handles requests for the TA_D domain (Thoracic Aorta Diameters).
 */

/**
 * Handles GET requests for the 'TA_D' domain. It finds thoracic aorta reference values
 * based on parameter, gender, age, and technique.
 *
 *
 * @param {object} e - The event parameter from doGet, containing query parameters.
 * @param {string} SPREADSHEET_ID - The ID of the spreadsheet to use.
 * @returns {object} - A result object to be serialized into JSON.
 * @throws {BadRequestError} - If required parameters are missing or invalid.
 * @throws {NotFoundError} - If no matching data is found in the sheet.
 */
function handleRequest_ta_d(e, SPREADSHEET_ID) {
  const SHEET_NAME = 'adult_vascular.thoracic_aorta_dimensions';
  const MIN_AGE = 25;
  const MAX_AGE = 35;
  
  // --- 1. Extract and Validate Parameters ---
  const { parameter, gender, age, technique } = e.parameter;

  if (!parameter || !gender || !age || !technique) {
    throw new BadRequestError('Missing one or more required parameters: parameter, gender, age, technique.');
  }
  
  const ageValue = parseInt(age, 10);
  if (isNaN(ageValue)) {
    throw new BadRequestError(`Invalid age value: '${age}'. It must be a whole number.`);
  }

  // Specific business logic validation for this domain
  if (ageValue < MIN_AGE || ageValue > MAX_AGE) {
      throw new BadRequestError(`Age must be between ${MIN_AGE} and ${MAX_AGE}. You provided: ${age}.`);
  }

  const normalizedParameter = normalize(parameter);
  const normalizedGender = normalize(gender);
  const normalizedTechnique = normalize(technique);

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
    // Read the data from the current row using header indexes
    const rowParameter = normalize(row[headers.indexOf('parameter')]);
    const rowGender = normalize(row[headers.indexOf('gender')]);
    const rowTechnique = normalize(row[headers.indexOf('technique')]);

    // This sheet has a fixed age range, which we already validated
    if (
      rowParameter === normalizedParameter &&
      rowGender === normalizedGender &&
      rowTechnique === normalizedTechnique
    ) {
      foundRow = row;
      break; 
    }
  }

  // --- 4. Format the Response ---
  if (!foundRow) {
    throw new NotFoundError(`No data found for the specified criteria: parameter='${parameter}', gender='${gender}', age='${age}', technique='${technique}'.`);
  }
  
  const result = {
    units: foundRow[headers.indexOf('units')],
    median: foundRow[headers.indexOf('median')],
    ll_10th_percentile: foundRow[headers.indexOf('ll_10th_percentile')],
    ul_90th_percentile: foundRow[headers.indexOf('ul_90th_percentile')]
  };

  const finalResponse = {
    inputs: {
      domain: 'TA_D',
      parameter: parameter,
      gender: gender,
      age: age,
      technique: technique
    },
    results: result
  };

  return finalResponse;
}
