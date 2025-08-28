/**
 * @description Handles requests for the ASL_DA (Aortic Sinus Luminal Diameters) domain.
 */

/**
 * Handles GET requests for the 'ASL_DA' domain.
 * sheet based on parameter, gender, and cardiac phase.
 *
 *
 * @param {object} e - The event parameter from doGet, containing query parameters.
 * @param {string} SPREADSHEET_ID - The ID of the spreadsheet to use.
 * @returns {object} - A result object to be serialized into JSON.
 * @throws {BadRequestError} - If required parameters are missing.
 * @throws {NotFoundError} - If no matching data is found in the sheet.
 */
function handleRequest_asl_da(e, SPREADSHEET_ID) {
  const SHEET_NAME = 'adult_vascular.aortic_sinus';
  
  // --- 1. Extract and Validate Parameters ---
  const { parameter, gender, phase } = e.parameter;

  if (!parameter || !gender || !phase) {
    throw new BadRequestError('Missing one or more required parameters: parameter, gender, phase.');
  }
  
  const normalizedParameter = normalize(parameter);
  const normalizedGender = normalize(gender);
  const normalizedPhase = normalize(phase);

  // --- 2. Fetch and Process Spreadsheet Data ---
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    throw new Error(`Sheet with name '${SHEET_NAME}' was not found.`);
  }

  const data = sheet.getDataRange().getValues();
  const headers = data[0].map(h => normalize(h)); // Normalize headers for robust key access
  const rows = data.slice(1);

  // Find column indices dynamically
  const parameterIndex = headers.indexOf('parameter');
  const genderIndex = headers.indexOf('gender');
  const phaseIndex = headers.indexOf('phase');
  
  if (parameterIndex === -1 || genderIndex === -1 || phaseIndex === -1) {
      throw new Error(`One or more required columns (parameter, gender, phase) not found in sheet '${SHEET_NAME}'.`);
  }

  // --- 3. Find the Matching Row ---
  let foundRow = null;

  for (const row of rows) {
    // Skip empty rows
    if (row.join('').trim() === '') continue;

    const rowParameter = normalize(row[parameterIndex]);
    const rowGender = normalize(row[genderIndex]);
    const rowPhase = normalize(row[phaseIndex]);
    
    if (
      rowParameter === normalizedParameter &&
      rowGender === normalizedGender &&
      rowPhase === normalizedPhase
    ) {
      foundRow = row;
      break; // Stop searching once a match is found
    }
  }

  // --- 4. Format the Response ---
  if (!foundRow) {
    throw new NotFoundError(`No data found for parameter='${parameter}', gender='${gender}', and phase='${phase}'.`);
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
      domain: 'ASL_DA',
      parameter: parameter,
      gender: gender,
      phase: phase
    },
    results: result
  };

  return finalResponse;
}
