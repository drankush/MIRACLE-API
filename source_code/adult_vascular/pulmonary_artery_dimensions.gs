/**
 * @file pulmonary_artery_dimensions.gs
 * @description Handles requests for the ADULT_PA domain.
 * This script provides normal dimensions and distension values for the pulmonary arteries in adults.
 */

/**
 * Handles GET requests for the 'ADULT_PA' domain.
 * sheet based on the specified parameter, gender, and vessel.
 *
 *
 * @param {object} e - The event parameter from doGet, containing query parameters.
 * @param {string} SPREADSHEET_ID - The ID of the spreadsheet to use.
 * @returns {object} - A result object to be serialized into JSON.
 * @throws {BadRequestError} - If required parameters are missing.
 * @throws {NotFoundError} - If no matching data is found in the sheet.
 */
function handleRequest_adult_pa(e, SPREADSHEET_ID) {
  const SHEET_NAME = 'adult_vascular.pulmonary_artery_dimensions';

  // --- 1. Extract and Validate Parameters ---
  const { parameter, gender, vessel } = e.parameter;

  if (!parameter || !gender || !vessel) {
    throw new BadRequestError('Missing one or more required parameters: parameter, gender, vessel.');
  }

  const normalizedParameter = normalize(parameter);
  const normalizedGender = normalize(gender);
  const normalizedVessel = normalize(vessel);

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
    const rowParameter = normalize(row[headers.indexOf('parameter')]);
    const rowGender = normalize(row[headers.indexOf('gender')]);
    const rowVessel = normalize(row[headers.indexOf('vessel')]);

    if (
      rowParameter === normalizedParameter &&
      rowGender === normalizedGender &&
      rowVessel === normalizedVessel
    ) {
      foundRow = row;
      break; // Stop searching once a match is found
    }
  }

  // --- 4. Format the Response ---
  if (!foundRow) {
    throw new NotFoundError(`No data found for parameter='${parameter}', gender='${gender}', and vessel='${vessel}'.`);
  }

  const result = {
    units: foundRow[headers.indexOf('units')],
    mean: foundRow[headers.indexOf('mean')],
    ll: foundRow[headers.indexOf('ll')],
    ul: foundRow[headers.indexOf('ul')]
  };

  // Construct the final response object as per the requirements
  const finalResponse = {
    inputs: {
      domain: 'ADULT_PA',
      parameter: parameter,
      gender: gender,
      vessel: vessel
    },
    results: result
  };

  return finalResponse;
}
