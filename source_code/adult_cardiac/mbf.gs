/**
 * @file mbf.gs
 * @description Handles requests for the MBF (Myocardial Blood Flow) domain.
 */

/**
 * Handles GET requests for the 'MBF' domain. It finds Myocardial Blood Flow data based on parameter, author, and an optional gender.
 *
 *
 * @param {object} e - The event parameter from doGet, containing query parameters.
 * @returns {object} - A result object to be serialized into JSON.
 * @throws {BadRequestError} - If required parameters are missing.
 * @throws {NotFoundError} - If no matching data is found in the sheet.
 */
function handleRequest_mbf(e, SPREADSHEET_ID) {
  const SHEET_NAME = 'adult_cardiac.mbf';
  
  // --- 1. Extract and Validate Parameters ---
  const { parameter, author_year, gender } = e.parameter;

  if (!parameter || !author_year) {
    throw new BadRequestError('Missing one or more required parameters: parameter, author_year.');
  }

  // normalize(gender) will return an empty string '' if gender is undefined,
  // which is exactly what we need to match the empty cells in the sheet.
  const normalizedParameter = normalize(parameter);
  const normalizedAuthor = normalize(author_year);
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

  // --- 3. Find the Matching Row ---
  let foundRow = null;

  for (const row of rows) {
    const rowParameter = normalize(row[headers.indexOf('parameter')]);
    const rowAuthor = normalize(row[headers.indexOf('author_year')]);
    const rowGender = normalize(row[headers.indexOf('gender')]);

    // This condition elegantly handles the optional gender.
    // If input gender is not provided, normalizedGender is '', which matches the rows with empty gender cells.
    // If input gender is provided, it will match 'male' or 'female' rows.
    if (
      rowParameter === normalizedParameter &&
      rowAuthor === normalizedAuthor &&
      rowGender === normalizedGender
    ) {
      foundRow = row;
      break; // Stop searching once a match is found
    }
  }

  // --- 4. Format the Response ---
  if (!foundRow) {
    const genderMsg = gender ? `, gender='${gender}'` : ' (overall/non-gender-specific)';
    throw new NotFoundError(`No data found for parameter='${parameter}', author_year='${author_year}'${genderMsg}.`);
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
      domain: 'MBF',
      parameter: parameter,
      author_year: author_year,
      // Only include gender in the input echo if it was provided
      ...(gender && { gender: gender })
    },
    results: result
  };

  return finalResponse;
}
