/**
 * Handles requests for the 'LV_AGE' domain.
 * Looks up cardiac parameters based on age, gender, and papillary muscle inclusion.
 *
 *
 * @param {object} e The event parameter from doGet, containing query parameters.
 * @param {string} spreadsheetId The ID of the master spreadsheet.
 * @returns {object} A result object to be JSON-stringified.
 * @throws {BadRequestError} If required parameters are missing or invalid.
 * @throws {NotFoundError} If no matching data is found in the spreadsheet.
 */
function handleRequest_lv_age(e, spreadsheetId) {
  const SCRIPT_NAME = 'handleRequest_lv_age';
  const SHEET_NAME = 'adult_cardiac.lv_volumetric_by_age';

  // --- 1. Get and Validate Input Parameters ---
  console.log(`[${SCRIPT_NAME}] - Validating parameters.`);
  
  const { parameter, gender, age, pm } = e.parameter;

  if (!parameter) {
    throw new BadRequestError('Missing required parameter: parameter');
  }
  if (!gender) {
    throw new BadRequestError('Missing required parameter: gender');
  }
  if (!age) {
    throw new BadRequestError('Missing required parameter: age');
  }
  if (!pm) {
    throw new BadRequestError('Missing required parameter: pm');
  }

  const ageNum = parseInt(age, 10);
  if (isNaN(ageNum)) {
    throw new BadRequestError(`Invalid value for 'age'. Expected a number, but got: '${age}'`);
  }

  // Normalize inputs for reliable matching
  const inputGender = gender.toString().trim().toLowerCase();
  const inputPm = pm.toString().trim().toLowerCase();
  const inputParameter = parameter.toString().trim(); // Parameter name is case-sensitive as per data

  // --- 2. Access Spreadsheet Data ---
  console.log(`[${SCRIPT_NAME}] - Accessing spreadsheet: ${spreadsheetId}, Sheet: ${SHEET_NAME}`);
  
  const ss = SpreadsheetApp.openById(spreadsheetId);
  const sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    // This is a server-side configuration issue, not a user error.
    throw new Error(`Configuration Error: Sheet named '${SHEET_NAME}' not found.`);
  }

  const data = sheet.getDataRange().getValues();
  const headers = data.shift().map(h => h.toString().toLowerCase().trim()); // Get headers and normalize

  // Create a map of header names to their column index for robust access
  const headerMap = headers.reduce((acc, header, index) => {
    acc[header] = index;
    return acc;
  }, {});

  // --- 3. Find Matching Row ---
  console.log(`[${SCRIPT_NAME}] - Searching for match: parameter=${inputParameter}, gender=${inputGender}, age=${ageNum}, pm=${inputPm}`);
  let foundRow = null;

  for (const row of data) {
    const rowGender = row[headerMap.gender]?.toString().toLowerCase() || '';
    const rowPm = row[headerMap.pm]?.toString().toLowerCase() || '';
    const rowParameter = row[headerMap.parameter]?.toString() || '';
    const ageGrp = row[headerMap.age_grp]?.toString() || '';

    // Condition 1: Match parameter, gender, and pm
    const basicMatch = (
      rowParameter === inputParameter &&
      rowGender === inputGender &&
      rowPm === inputPm
    );

    if (basicMatch) {
      // Condition 2: Match age by parsing the age_grp range
      const ageParts = ageGrp.split('-');
      if (ageParts.length === 2) {
        const lowerBound = parseInt(ageParts[0], 10);
        const upperBound = parseInt(ageParts[1], 10);
        
        if (!isNaN(lowerBound) && !isNaN(upperBound) && ageNum >= lowerBound && ageNum <= upperBound) {
          foundRow = row;
          break; // Found our match, exit the loop
        }
      }
    }
  }

  // --- 4. Format and Return Response ---
  if (foundRow) {
    console.log(`[${SCRIPT_NAME}] - Match found. Formatting response.`);
    
    // Construct the final JSON object as per requirements
    const result = {
      inputs: {
        domain: "LV_AGE",
        parameter: inputParameter,
        gender: inputGender,
        pm: inputPm,
        age: ageNum
      },
      units: foundRow[headerMap.units],
      results: {
        age_grp: foundRow[headerMap.age_grp], // The actual group used for lookup
        mean: parseFloat(foundRow[headerMap.mean]),
        sd: parseFloat(foundRow[headerMap.sd]),
        ll: parseFloat(foundRow[headerMap.ll]),
        ul: parseFloat(foundRow[headerMap.ul])
      }
    };
    return result;

  } else {
    // If loop finishes and no match is found, throw a NotFoundError
    console.warn(`[${SCRIPT_NAME}] - No match found for the given criteria.`);
    throw new NotFoundError('No data found for the specified parameter, gender, age, and pm combination.');
  }
}
