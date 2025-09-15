/**
 * @description Handles requests for the TA_D (Thoracic Aortic Diameters) domain.
 */

/**
 * Handles GET requests for the 'TA_D' domain. 
 * sheet based on parameter, gender, phase, and technique.
 *
 * This function is dynamically called by the doGet function in Code.gs.
 *
 * @param {object} e - The event parameter from doGet, containing query parameters.
 * @param {string} SPREADSHEET_ID - The ID of the spreadsheet to use.
 * @returns {object} - A result object to be serialized into JSON.
 * @throws {BadRequestError} - If required parameters are missing.
 * @throws {NotFoundError} - If no matching data is found in the sheet.
 */
function handleRequest_ta_d(e, SPREADSHEET_ID) {
  const SHEET_NAME = 'adult_vascular.thoracic_aorta_diameter';
  
  // --- 1. Extract and Validate Parameters ---
  const { parameter, gender, phase, technique } = e.parameter;

  if (!parameter || !gender || !phase || !technique) {
    throw new BadRequestError('Missing one or more required parameters: parameter, gender, phase, technique.');
  }

  // Assuming normalize() is globally available from Code.gs
  const normalizedParameter = normalize(parameter);
  const normalizedGender = normalize(gender);
  const normalizedPhase = normalize(phase);
  const normalizedTechnique = normalize(technique);

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
    // Normalize data from the sheet for a case-insensitive comparison
    const rowParameter = normalize(row[headers.indexOf('parameter')]);
    const rowGender = normalize(row[headers.indexOf('gender')]);
    const rowPhase = normalize(row[headers.indexOf('phase')]);
    const rowTechnique = normalize(row[headers.indexOf('technique')]);

    if (
      rowParameter === normalizedParameter &&
      rowGender === normalizedGender &&
      rowPhase === normalizedPhase &&
      rowTechnique === normalizedTechnique
    ) {
      foundRow = row;
      break; // Stop searching once a match is found
    }
  }

  // --- 4. Format the Response ---
  if (!foundRow) {
    throw new NotFoundError(`No data found for the combination: parameter='${parameter}', gender='${gender}', phase='${phase}', technique='${technique}'.`);
  }
  
  const result = {
    units: foundRow[headers.indexOf('units')],
    mean: foundRow[headers.indexOf('mean')],
    sd: foundRow[headers.indexOf('sd')],
    ll: foundRow[headers.indexOf('ll')],
    ul: foundRow[headers.indexOf('ul')]
  };

  // Construct the final response object as per the requirements
  const finalResponse = {
    inputs: {
      domain: 'TA_D',
      parameter: parameter,
      gender: gender,
      phase: phase,
      technique: technique
    },
    results: result
  };

  return finalResponse;
}
