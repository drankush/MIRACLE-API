/**
 * @file lv_fractal_dimension_bmi.gs
 * @description Handles requests for the LV_FD_BMI domain.
 */

/**
 * A helper function to check if a given BMI value falls within a specific range string.
 * @param {number} bmi - The numeric BMI value to check.
 * @param {string} rangeString - The range definition string (e.g., "≥30", "<25", "25 to <30").
 * @returns {boolean} - True if the BMI is within the range, otherwise false.
 */
function isBmiInRange(bmi, rangeString) {
  const str = rangeString.trim();

  // Case 1: "≥30" or ">=30"
  if (str.includes('≥') || str.includes('>=')) {
    const value = parseFloat(str.replace(/[^0-9.]/g, ''));
    return !isNaN(value) && bmi >= value;
  }

  // Case 2: "<25"
  if (str.startsWith('<')) {
    const value = parseFloat(str.replace(/[^0-9.]/g, ''));
    return !isNaN(value) && bmi < value;
  }

  // Case 3: "25 to <30"
  const rangeMatch = str.match(/(\d+\.?\d*)\s+to\s+<(\d+\.?\d*)/);
  if (rangeMatch && rangeMatch.length === 3) {
    const lowerBound = parseFloat(rangeMatch[1]);
    const upperBound = parseFloat(rangeMatch[2]);
    return !isNaN(lowerBound) && !isNaN(upperBound) && bmi >= lowerBound && bmi < upperBound;
  }

  // Return false if the format is not recognized
  return false;
}


/**
 * Handles GET requests for the 'LV_FD_BMI' domain.
 * sheet based on parameter, gender, and BMI.
 *
 *
 * @param {object} e - The event parameter from doGet, containing query parameters.
 * @param {string} SPREADSHEET_ID - The ID of the spreadsheet to use.
 * @param {number} startTime - The timestamp when the request started.
 * @param {number} TIMEOUT_MS - The timeout for the request.
 * @returns {object} - A result object to be serialized into JSON.
 * @throws {BadRequestError} - If required parameters are missing or invalid.
 * @throws {NotFoundError} - If no matching data is found in the sheet.
 */
function handleRequest_lv_fd_bmi(e, SPREADSHEET_ID) {
  const SHEET_NAME = 'adult_cardiac.lv_fractal_dimension_bmi';
  
  // --- 1. Extract and Validate Parameters ---
  const { parameter, gender, BMI } = e.parameter;

  if (!parameter || !gender || !BMI) {
    throw new BadRequestError('Missing one or more required parameters: parameter, gender, BMI.');
  }
  
  const bmiValue = parseFloat(BMI);
  if (isNaN(bmiValue)) {
    throw new BadRequestError(`Invalid BMI value: '${BMI}'. It must be a number.`);
  }

  const normalizedParameter = normalize(parameter);
  const normalizedGender = normalize(gender);

  // --- 2. Fetch and Process Spreadsheet Data ---
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    // This is a server configuration issue, so a generic error is appropriate.
    throw new Error(`Sheet with name '${SHEET_NAME}' was not found.`);
  }

  const data = sheet.getDataRange().getValues();
  const headers = data[0].map(h => normalize(h)); // Normalize headers for robust key access
  const rows = data.slice(1);

  // --- 3. Find the Matching Row ---
  let foundRow = null;

  for (const row of rows) {
    const rowParameter = normalize(row[headers.indexOf('parameter')]);
    const rowGender = normalize(row[headers.indexOf('gender')]);
    const rowBmiRange = row[headers.indexOf('bmi_range')];

    if (
      rowParameter === normalizedParameter &&
      rowGender === normalizedGender &&
      isBmiInRange(bmiValue, rowBmiRange)
    ) {
      foundRow = row;
      break; // Stop searching once a match is found
    }
  }

  // --- 4. Format the Response ---
  if (!foundRow) {
    throw new NotFoundError(`No data found for parameter='${parameter}', gender='${gender}', and BMI='${BMI}'.`);
  }
  
  const result = {
    bmi_range: foundRow[headers.indexOf('bmi_range')], // Return the actual range string used
    mean: foundRow[headers.indexOf('mean')],
    sd: foundRow[headers.indexOf('sd')],
    ll: foundRow[headers.indexOf('ll')],
    ul: foundRow[headers.indexOf('ul')]
  };

  // Construct the final response object as per the requirements
  const finalResponse = {
    inputs: {
      domain: 'LV_FD_BMI',
      parameter: parameter,
      gender: gender,
      BMI: BMI
    },
    results: result
  };

  return finalResponse;
}
