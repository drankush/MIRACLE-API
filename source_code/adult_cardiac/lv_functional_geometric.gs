/**
 * Domain-specific handler for LV_FG (Left Ventricular Functional & Geometric parameters)
 * @param {Object} e - The event parameter from doGet
 * @param {string} spreadsheetId - The spreadsheet ID from the main engine
 * @param {number} startTime - Start time for timeout tracking
 * @param {number} timeoutMs - Timeout limit in milliseconds
 * @returns {Object} - Formatted response object
 */
function handleRequest_lv_fg(e, spreadsheetId, startTime, timeoutMs) {
  // Extract and validate required parameters
  const parameter = e.parameter.parameter;
  const gender = e.parameter.gender;
  
  // Validate parameter
  if (!parameter) {
    throw new BadRequestError('Missing required parameter: parameter');
  }
  
  // Validate gender
  if (!gender) {
    throw new BadRequestError('Missing required parameter: gender');
  }
  
  // Normalize gender input
  const normalizedGender = normalize(gender);
  if (normalizedGender !== 'male' && normalizedGender !== 'female') {
    throw new BadRequestError('Invalid gender. Must be "male" or "female"');
  }
  
  // Open spreadsheet and get data
  const sheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName('adult_cardiac.lv_functional_geometric);
  if (!sheet) {
    throw new NotFoundError('Domain database not found');
  }
  
  // Get all data from sheet
  const dataRange = sheet.getDataRange();
  const values = dataRange.getValues();
  
  // Extract headers (first row)
  const headers = values[0];
  const parameterIndex = headers.indexOf('parameter');
  const unitsIndex = headers.indexOf('units');
  const genderIndex = headers.indexOf('gender');
  const meanIndex = headers.indexOf('mean');
  const sdIndex = headers.indexOf('sd');
  const llIndex = headers.indexOf('ll');
  const ulIndex = headers.indexOf('ul');
  
  // Validate that all required columns exist
  if (parameterIndex === -1 || genderIndex === -1 || meanIndex === -1 || 
      sdIndex === -1 || llIndex === -1 || ulIndex === -1) {
    throw new Error('Required columns missing in worksheet');
  }
  
  // Search for matching row
  let foundRow = null;
  for (let i = 1; i < values.length; i++) {
    const row = values[i];
    const rowParameter = normalize(row[parameterIndex]);
    const rowGender = normalize(row[genderIndex]);
    
    if (rowParameter === normalize(parameter) && rowGender === normalizedGender) {
      foundRow = row;
      break;
    }
  }
  
  // If no matching row found
  if (!foundRow) {
    throw new NotFoundError(`No data found for parameter '${parameter}' and gender '${gender}'`);
  }
  
  // Extract values
  const units = foundRow[unitsIndex] || '';
  const mean = foundRow[meanIndex];
  const sd = foundRow[sdIndex];
  const ll = foundRow[llIndex];
  const ul = foundRow[ulIndex];
  
  // Build response
  return {
    inputs: {
      domain: 'LV_FG',
      parameter: parameter,
      gender: gender
    },
    units: units,
    results: {
      mean: mean,
      sd: sd,
      ll: ll,
      ul: ul
    }
  };
}
