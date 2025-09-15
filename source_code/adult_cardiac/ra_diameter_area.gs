/**
 * @file ra_diameter_area.gs
 * @description Handles requests for the RA_DA (Right Atria Diameter & Area) domain.
 */

/**
 * Handles GET requests for the 'RA_DA' domain. 
 * sheet based on an exact match of parameter and gender.
 *
 *
 * @param {object} e - The event parameter from doGet, containing query parameters.
 * @param {string} SPREADSHEET_ID - The ID of the spreadsheet to use.
 * @returns {object} - A result object to be serialized into JSON.
 * @throws {BadRequestError} - If required parameters are missing.
 * @throws {NotFoundError} - If no matching data is found in the sheet.
 */
function handleRequest_ra_da(e, SPREADSHEET_ID) {
  const SHEET_NAME = 'adult_cardiac.ra_diameter_area';
  
  // --- 1. Extract and Validate Parameters (METHOD REMOVED) ---
  const { parameter, gender } = e.parameter;

  if (!parameter || !gender) {
    throw new BadRequestError('Missing one or more required parameters: parameter, gender.');
  }
  
  const normalizedParameter = normalize(parameter);
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

  // --- 3. Find the Matching Row (METHOD REMOVED) ---
  let foundRow = null;

  for (const row of rows) {
    const rowParameter = normalize(row[headers.indexOf('parameter')]);
    const rowGender = normalize(row[headers.indexOf('gender')]);

    if (
      rowParameter === normalizedParameter &&
      rowGender === normalizedGender
    ) {
      foundRow = row;
      break; // Stop searching once a match is found
    }
  }

  // --- 4. Format the Response (METHOD REMOVED) ---
  if (!foundRow) {
    throw new NotFoundError(`No data found for parameter='${parameter}' and gender='${gender}'.`);
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
      domain: 'RA_DA',
      parameter: parameter,
      gender: gender
    },
    results: result
  };

  return finalResponse;
}
