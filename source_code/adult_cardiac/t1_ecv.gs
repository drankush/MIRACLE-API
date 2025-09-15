/**
 * @file t1_ecv.gs
 * @description Handles requests for the T1_RELAX domain.
 */

/**
 * Handles GET requests for the 'T1_RELAX' domain.
 * sheet based on parameter, field strength, vendor, and technique.
 *
 *
 * @param {object} e - The event parameter from doGet, containing query parameters.
 * @param {string} SPREADSHEET_ID - The ID of the spreadsheet to use.
 * @returns {object} - A result object to be serialized into JSON.
 * @throws {BadRequestError} - If required parameters are missing or invalid.
 * @throws {NotFoundError} - If no matching data is found in the sheet.
 */
function handleRequest_t1_relax(e, SPREADSHEET_ID) {
  const SHEET_NAME = 'adult_cardiac.t1_ecv';
  
  // --- 1. Extract and Validate Parameters ---
  const { parameter, fs, vendor, technique } = e.parameter;

  if (!parameter || !fs || !vendor || !technique) {
    throw new BadRequestError('Missing one or more required parameters: parameter, fs, vendor, technique.');
  }

  const normalizedParameter = normalize(parameter);
  const normalizedFs = normalize(fs);
  const normalizedVendor = normalize(vendor);
  const normalizedTechnique = normalize(technique);

  // --- 2. Fetch and Process Spreadsheet Data ---
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    throw new Error(`Sheet with name '${SHEET_NAME}' was not found.`);
  }

  const data = sheet.getDataRange().getValues();
  const headers = data[0].map(h => normalize(h)); // Normalize headers for robust key access
  const rows = data.slice(1);
  
  // Find the index of our columns. Note the special header 'fs(t)'.
  const paramIndex = headers.indexOf('parameter');
  const fsIndex = headers.indexOf('fs(t)'); // Matches the normalized header 'fs(T)'
  const vendorIndex = headers.indexOf('vendor');
  const techniqueIndex = headers.indexOf('technique');
  
  if (fsIndex === -1) {
    throw new Error("Header 'fs(T)' not found in the sheet. Please check the sheet configuration.");
  }

  // --- 3. Find the Matching Row ---
  let foundRow = null;

  for (const row of rows) {
    // Normalize data from the sheet for a reliable comparison
    const rowParameter = normalize(row[paramIndex]);
    const rowFs = normalize(row[fsIndex]);
    const rowVendor = normalize(row[vendorIndex]);
    const rowTechnique = normalize(row[techniqueIndex]);

    if (
      rowParameter === normalizedParameter &&
      rowFs === normalizedFs &&
      rowVendor === normalizedVendor &&
      rowTechnique === normalizedTechnique
    ) {
      foundRow = row;
      break; // Stop searching once a match is found
    }
  }

  // --- 4. Format the Response ---
  if (!foundRow) {
    const errorMsg = `No data found for parameter='${parameter}', fs='${fs}', vendor='${vendor}', technique='${technique}'.`;
    throw new NotFoundError(errorMsg);
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
      domain: 'T1_RELAX',
      parameter: parameter,
      fs: fs,
      vendor: vendor,
      technique: technique
    },
    results: result
  };

  return finalResponse;
}
