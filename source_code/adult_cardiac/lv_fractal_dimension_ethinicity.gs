/**
 * @file lv_fractal_dimension_ethinicity.gs
 * @description Handles requests for the LV_FD_ETHINICITY domain.
 */

/**
 * Handles GET requests for the 'LV_FD_ETHINICITY' domain. 
 *
 * @param {object} e - The event parameter from doGet, containing query parameters.
 * @returns {object} - A result object to be serialized into JSON.
 * @throws {BadRequestError} - If required parameters are missing.
 * @throws {NotFoundError} - If no matching data is found in the sheet.
 */
function handleRequest_lv_fd_ethinicity(e, SPREADSHEET_ID) {
  const SHEET_NAME = 'adult_cardiac.lv_fractal_dimension_ethinicity';
  
  // --- 1. Extract and Validate Parameters ---
  const { parameter, ethnicity } = e.parameter;

  if (!parameter || !ethnicity) {
    throw new BadRequestError('Missing one or more required parameters: parameter, ethnicity.');
  }

  const normalizedParameter = normalize(parameter);
  const normalizedEthnicity = normalize(ethnicity);

  // --- 2. Fetch and Process Spreadsheet Data ---
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    throw new Error(`Sheet with name '${SHEET_NAME}' was not found.`);
  }

  const data = sheet.getDataRange().getValues();
  const headers = data[0].map(h => normalize(h)); // Normalize headers for robust key access
  const rows = data.slice(1);

  // --- 3. Find the Matching Row ---
  let foundRow = null;

  for (const row of rows) {
    // Normalize data from the sheet for a case-insensitive, trim-safe comparison
    const rowParameter = normalize(row[headers.indexOf('parameter')]);
    const rowEthnicity = normalize(row[headers.indexOf('ethnicity')]);

    if (
      rowParameter === normalizedParameter &&
      rowEthnicity === normalizedEthnicity
    ) {
      foundRow = row;
      break; // Stop searching once a match is found
    }
  }

  // --- 4. Format the Response ---
  if (!foundRow) {
    throw new NotFoundError(`No data found for parameter='${parameter}' and ethnicity='${ethnicity}'.`);
  }
  
  const result = {
    mean: foundRow[headers.indexOf('mean')],
    sd: foundRow[headers.indexOf('sd')],
    ll: foundRow[headers.indexOf('ll')],
    ul: foundRow[headers.indexOf('ul')]
  };

  // Construct the final response object as per the requirements
  const finalResponse = {
    inputs: {
      domain: 'LV_FD_ETHINICITY',
      parameter: parameter,
      ethnicity: ethnicity
    },
    results: result
  };

  return finalResponse;
}
