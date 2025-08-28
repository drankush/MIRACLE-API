/**
 * @description Handles requests for the AA_D (Ascending Aortic Diameter) domain.
 */

/**
 * A helper function to check if a given age falls within a specific range string.
 * @param {number} age - The numeric age to check.
 * @param {string} rangeString - The range definition string (e.g., "25-35", "<25", ">65").
 * @returns {boolean} - True if the age is within the range, otherwise false.
 */
function isAgeInRange(age, rangeString) {
  const str = rangeString.trim();

  // Case 1: "25-35"
  const rangeMatch = str.match(/^(\d+)-(\d+)$/);
  if (rangeMatch && rangeMatch.length === 3) {
    const lowerBound = parseInt(rangeMatch[1], 10);
    const upperBound = parseInt(rangeMatch[2], 10);
    return !isNaN(lowerBound) && !isNaN(upperBound) && age >= lowerBound && age <= upperBound;
  }
  
  // Case 2: "<25" or "≤25"
  if (str.startsWith('<') || str.startsWith('≤')) {
    const value = parseInt(str.replace(/[^0-9]/g, ''), 10);
    return !isNaN(value) && age <= value;
  }
  
  // Case 3: ">65" or "≥65"
  if (str.startsWith('>') || str.startsWith('≥')) {
    const value = parseInt(str.replace(/[^0-9]/g, ''), 10);
    return !isNaN(value) && age >= value;
  }

  // Return false if the format is not recognized
  return false;
}


/**
 * Handles GET requests for the 'AA_D' domain.
 *
 * @param {object} e - The event parameter from doGet, containing query parameters.
 * @param {string} SPREADSHEET_ID - The ID of the spreadsheet to use.
 * @returns {object} - A result object to be serialized into JSON.
 * @throws {BadRequestError} - If required parameters are missing or invalid.
 * @throws {NotFoundError} - If no matching data is found in the sheet.
 */
function handleRequest_aa_d(e, SPREADSHEET_ID) {
  const SHEET_NAME = 'adult_vascular.ascending_aorta_diameters';
  
  // --- 1. Extract and Validate Parameters ---
  const { parameter, gender, age, technique } = e.parameter;

  if (!parameter || !gender || !age || !technique) {
    throw new BadRequestError('Missing one or more required parameters: parameter, gender, age, technique.');
  }

  const normalizedParameter = normalize(parameter);
  const normalizedGender = normalize(gender);
  const normalizedTechnique = normalize(technique);

  const ageValue = parseInt(age, 10);
  if (isNaN(ageValue)) {
    throw new BadRequestError(`Invalid age value: '${age}'. It must be an integer.`);
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
    const rowData = {};
    headers.forEach((header, i) => {
      rowData[header] = row[i];
    });

    const rowParameter = normalize(rowData.parameter);
    const rowGender = normalize(rowData.gender);
    const rowTechnique = normalize(rowData.technique);
    const rowAgeCat = rowData.age_cat;

    if (
      rowParameter === normalizedParameter &&
      rowGender === normalizedGender &&
      rowTechnique === normalizedTechnique &&
      isAgeInRange(ageValue, rowAgeCat)
    ) {
      foundRow = rowData;
      break;
    }
  }

  // --- 4. Format the Response ---
  if (!foundRow) {
    throw new NotFoundError(`No data found for the specified criteria (parameter, gender, age, technique).`);
  }
  
  const result = {
    age_cat_matched: foundRow.age_cat,
    units: foundRow.units,
    median: foundRow.median,
    ll: foundRow.ll,
    ul: foundRow.ul
  };

  const finalResponse = {
    inputs: e.parameter, // Echo all provided inputs
    results: result
  };

  return finalResponse;
}
