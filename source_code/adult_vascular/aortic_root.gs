/**
 * @description Handles requests for the AORTIC_ROOT_D domain.
 */

/**
 * Handles GET requests for the 'AORTIC_ROOT_D' domain. 
 *
 * @param {object} e - The event parameter from doGet, containing query parameters.
 * @returns {object} - A result object to be serialized into JSON.
 * @throws {BadRequestError} - If required parameters are missing.
 * @throws {NotFoundError} - If no matching data is found in the sheet.
 */
function handleRequest_aortic_root_d(e, SPREADSHEET_ID) {
  const SHEET_NAME = 'adult_vascular.aortic_root';
  
  // --- 1. Extract and Validate Parameters ---
  const { parameter, gender, technique } = e.parameter;

  if (!parameter || !gender || !technique) {
    throw new BadRequestError('Missing one or more required parameters: parameter, gender, technique.');
  }
  
  const normalizedParameter = normalize(parameter);
  const normalizedGender = normalize(gender);
  const normalizedTechnique = normalize(technique);

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
    const rowTechnique = normalize(row[headers.indexOf('technique')]);

    if (
      rowParameter === normalizedParameter &&
      rowGender === normalizedGender &&
      rowTechnique === normalizedTechnique
    ) {
      foundRow = row;
      break; // Stop searching once a match is found
    }
  }

  // --- 4. Format the Response ---
  if (!foundRow) {
    throw new NotFoundError(`No data found for parameter='${parameter}', gender='${gender}', and technique='${technique}'.`);
  }
  
  const results = {
    units: foundRow[headers.indexOf('units')],
    mean: foundRow[headers.indexOf('mean')],
    sd: foundRow[headers.indexOf('sd')],
    ll: foundRow[headers.indexOf('ll')],
    ul: foundRow[headers.indexOf('ul')]
  };

  // Construct the final response object as per the requirements
  const finalResponse = {
    inputs: {
      domain: 'AORTIC_ROOT_D',
      parameter: parameter,
      gender: gender,
      technique: technique
    },
    results: results
  };

  return finalResponse;
}
