/**
 * @file t2_relaxation.gs
 * @description Handles requests for the T2_RELAX domain.
 */

/**
 * Handles GET requests for the 'T2_RELAX' domain. 
 * sheet based on author, field strength, vendor, and technique.
 *
 *
 * @param {object} e - The event parameter from doGet, containing query parameters.
 * @param {string} SPREADSHEET_ID - The ID of the spreadsheet to use.
 * @returns {object} - A result object to be serialized into JSON.
 * @throws {BadRequestError} - If required parameters are missing or invalid.
 * @throws {NotFoundError} - If no matching data is found in the sheet.
 */
function handleRequest_t2_relax(e, SPREADSHEET_ID) {
  const SHEET_NAME = 'adult_cardiac.t2_relaxation';

  // --- 1. Extract and Validate Parameters ---
  const { parameter, author_year, fs, vendor, technique } = e.parameter;

  if (!parameter || !author_year || !fs || !vendor || !technique) {
    throw new BadRequestError('Missing one or more required parameters: parameter, author_year, fs, vendor, technique.');
  }

  const normalizedParameter = normalize(parameter);
  const normalizedAuthor = normalize(author_year);
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
  const headers = data[0].map(h => normalize(h));
  const rows = data.slice(1);

  // Map URL parameter names to sheet header names
  const paramToHeaderMap = {
    parameter: 'parameter',
    author_year: 'author_year',
    fs: 'fs(t)', // Critical mapping from URL 'fs' to sheet 'fs(T)'
    vendor: 'vendor',
    technique: 'technique'
  };

  // Get column indices based on normalized headers
  const headerIndices = {
    parameter: headers.indexOf(paramToHeaderMap.parameter),
    author: headers.indexOf(paramToHeaderMap.author_year),
    fs: headers.indexOf(paramToHeaderMap.fs),
    vendor: headers.indexOf(paramToHeaderMap.vendor),
    technique: headers.indexOf(paramToHeaderMap.technique),
    units: headers.indexOf('units'),
    mean: headers.indexOf('mean'),
    sd: headers.indexOf('sd'),
    ll: headers.indexOf('ll'),
    ul: headers.indexOf('ul')
  };
  
  // --- 3. Find the Matching Row ---
  let foundRow = null;

  for (const row of rows) {
    // Compare normalized inputs with normalized data from the sheet
    // For 'fs', we compare the string from the URL with the string representation of the sheet value
    if (
      normalize(row[headerIndices.parameter]) === normalizedParameter &&
      normalize(row[headerIndices.author]) === normalizedAuthor &&
      normalize(row[headerIndices.fs]) === normalizedFs &&
      normalize(row[headerIndices.vendor]) === normalizedVendor &&
      normalize(row[headerIndices.technique]) === normalizedTechnique
    ) {
      foundRow = row;
      break; // Found the unique match, exit loop
    }
  }

  // --- 4. Format the Response ---
  if (!foundRow) {
    throw new NotFoundError(`No data found for the specified combination of author_year, fs, vendor, and technique.`);
  }
  
  const result = {
    units: foundRow[headerIndices.units],
    mean: foundRow[headerIndices.mean],
    sd: foundRow[headerIndices.sd],
    ll: foundRow[headerIndices.ll],
    ul: foundRow[headerIndices.ul]
  };

  const finalResponse = {
    inputs: {
      domain: 'T2_RELAX',
      parameter: parameter,
      author_year: author_year,
      fs: fs,
      vendor: vendor,
      technique: technique
    },
    results: result
  };

  return finalResponse;
}
