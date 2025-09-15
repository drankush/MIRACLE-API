/**
 * @file lv_global_strain.gs
 * @description Handles requests for the LV_STRAIN domain.
 */

/**
 * Handles GET requests for the 'LV_STRAIN' domain. 
 * sheet based on parameter, technique, and (conditionally) gender.
 *
 *
 * @param {object} e - The event parameter from doGet, containing query parameters.
 * @param {string} SPREADSHEET_ID - The ID of the spreadsheet to use.
 * @returns {object} - A result object to be serialized into JSON.
 * @throws {BadRequestError} - If required parameters are missing or invalid.
 * @throws {NotFoundError} - If no matching data is found in the sheet.
 */
function handleRequest_lv_strain(e, SPREADSHEET_ID) {
  const SHEET_NAME = 'adult_cardiac.lv_global_strain';

  // --- 1. Extract and Validate Parameters ---
  const { parameter, technique, gender } = e.parameter;

  if (!parameter || !technique) {
    throw new BadRequestError("Missing one or more required parameters: 'parameter', 'technique'.");
  }

  const normalizedParameter = normalize(parameter);
  const normalizedTechnique = normalize(technique);
  const normalizedGender = normalize(gender); // Will be '' if gender is not provided

  // Conditional Validation: Gender is REQUIRED only for '2D_FT_CMR'
  if (normalizedTechnique === '2d_ft_cmr' && !normalizedGender) {
    throw new BadRequestError("The 'gender' parameter is required when technique is '2D_FT_CMR'.");
  }

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
    const rowData = {
      parameter: normalize(row[headers.indexOf('parameter')]),
      technique: normalize(row[headers.indexOf('technique')]),
      gender: normalize(row[headers.indexOf('gender')])
    };

    // Base match for parameter and technique must always be true
    const baseMatch = (rowData.parameter === normalizedParameter && rowData.technique === normalizedTechnique);
    
    if (baseMatch) {
      // If technique is 2D_FT_CMR, we must also match the gender
      if (normalizedTechnique === '2d_ft_cmr') {
        if (rowData.gender === normalizedGender) {
          foundRow = row;
          break;
        }
      } 
      // For other techniques, we match the row where gender is empty
      else {
        if (rowData.gender === '') {
          foundRow = row;
          break;
        }
      }
    }
  }

  // --- 4. Format the Response ---
  if (!foundRow) {
    throw new NotFoundError(`No data found for the specified combination: parameter='${parameter}', technique='${technique}'` + (gender ? `, gender='${gender}'` : ''));
  }

  const result = {
    mean: foundRow[headers.indexOf('mean')],
    sd: foundRow[headers.indexOf('sd')],
    ll: foundRow[headers.indexOf('ll')],
    ul: foundRow[headers.indexOf('ul')]
  };

  const finalResponse = {
    inputs: e.parameter, // Echo all provided inputs
    units: foundRow[headers.indexOf('units')],
    results: result
  };

  return finalResponse;
}
