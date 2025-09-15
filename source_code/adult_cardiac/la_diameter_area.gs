/**
 * @file la_diameter_area.gs
 * @description Handles requests for the LA_DA (Left Atria Diameter & Area) domain.
 */

/**
 * Handles GET requests for the 'LA_DA' domain. 
 * sheet based on parameter, gender, and method.
 *
 *
 * @param {object} e - The event parameter from doGet, containing query parameters.
 * @param {string} SPREADSHEET_ID - The ID of the spreadsheet to use.
 * @returns {object} - A result object to be serialized into JSON.
 * @throws {BadRequestError} - If required parameters are missing.
 * @throws {NotFoundError} - If no matching data is found in the sheet.
 */
function handleRequest_la_da(e, SPREADSHEET_ID) {
  const SHEET_NAME = 'adult_cardiac.la_diameter_area.gs';
  
  // --- 1. Extract and Validate Parameters ---
  const { parameter, gender, method } = e.parameter;

  if (!parameter || !gender || !method) {
    throw new BadRequestError('Missing one or more required parameters: parameter, gender, method.');
  }
  
  const normalizedParameter = normalize(parameter);
  const normalizedGender = normalize(gender);
  const normalizedMethod = normalize(method);

  // --- 2. Fetch and Process Spreadsheet Data ---
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    throw new Error(`Sheet with name '${SHEET_NAME}' was not found.`);
  }

  const data = sheet.getDataRange().getValues();
  const headers = data[0].map(h => normalize(h)); // Normalize headers
  const rows = data.slice(1);

  // --- 3. Find the Matching Row ---
  let foundRow = null;

  for (const row of rows) {
    const rowParameter = normalize(row[headers.indexOf('parameter')]);
    const rowGender = normalize(row[headers.indexOf('gender')]);
    const rowMethod = normalize(row[headers.indexOf('method')]);

    if (
      rowParameter === normalizedParameter &&
      rowGender === normalizedGender &&
      rowMethod === normalizedMethod
    ) {
      foundRow = row;
      break; // Stop searching once a match is found
    }
  }

  // --- 4. Format the Response ---
  if (!foundRow) {
    throw new NotFoundError(`No data found for parameter='${parameter}', gender='${gender}', and method='${method}'.`);
  }
  
  const result = {
    units: foundRow[headers.indexOf('units')],
    mean: foundRow[headers.indexOf('mean')],
    sd: foundRow[headers.indexOf('sd')],
    ll: foundRow[headers.indexOf('ll')],
    ul: foundRow[headers.indexOf('ul')]
  };

  // Construct the final response object
  const finalResponse = {
    inputs: {
      domain: 'LA_DA', // Use the clean domain name
      parameter: parameter,
      gender: gender,
      method: method
    },
    results: result
  };

  return finalResponse;
}
