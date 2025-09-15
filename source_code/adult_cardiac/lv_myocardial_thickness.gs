// @lv_myocardial_thickness.gs
/**
 * Main handler function for the 'lvmt' domain.
 *
 * @param {Object} e The event object containing request parameters.
 * @param {number} startTime The timestamp when the request started.
 * @param {number} TIMEOUT_MS The maximum execution time allowed.
 * @returns {Object} The final JSON output object.
 */
function handleRequest_lvmt(e, SPREADSHEET_ID, startTime, TIMEOUT_MS) {
  console.log("DEBUG: handleRequest_lvmt called with params:", e.parameter);

  // --- 1. Validate Required Inputs ---
  const requiredParams = ['parameter', 'segment', 'gender'];
  const inputs = {};
  
  // Check for missing required parameters
  for (const param of requiredParams) {
    const value = e.parameter[param];
    if (value === undefined || value === null || value === '') {
      throw new BadRequestError(`Missing required parameter: ${param}`);
    }
    inputs[param] = value;
  }

  // Validate parameter is either 'SA' or 'LA'
  const normalizedParameter = inputs.parameter.toString().trim().toUpperCase();
  if (normalizedParameter !== 'SA' && normalizedParameter !== 'LA') {
    throw new BadRequestError(`Invalid parameter value: '${inputs.parameter}'. Must be 'SA' or 'LA'.`);
  }
  inputs.parameter = normalizedParameter; // Store normalized value

  // Validate gender
  const normalizedGender = inputs.gender.toString().trim().toLowerCase();
  if (normalizedGender !== 'male' && normalizedGender !== 'female') {
    throw new BadRequestError(`Invalid gender value: '${inputs.gender}'. Must be 'Male' or 'Female'.`);
  }
  inputs.gender = normalizedGender.charAt(0).toUpperCase() + normalizedGender.slice(1); // Capitalize for consistent output

  // --- 2. Load Reference Data ---
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const refDataSheetName = 'adult_cardiac.lv_myocardial_thickness'; 
  const sh = ss.getSheetByName(refDataSheetName);
  if (!sh) throw new Error(`Sheet not found: '${refDataSheetName}'`);
  const vals = sh.getDataRange().getValues();
  if (vals.length === 0) throw new Error(`Sheet '${refDataSheetName}' is empty`);
  
  // Normalize headers
  const hdrs = vals.shift().map(h => h.toString().trim().toLowerCase());
  const refData = vals.map(r => Object.fromEntries(r.map((v, i) => [hdrs[i], v])));
  console.log(`DEBUG: Loaded ${refData.length} rows from '${refDataSheetName}'.`);

  // --- 3. Find Matching Row ---
  let match = null;
  const normalizedInputs = {
    parameter: inputs.parameter.toLowerCase(), // 'sa' or 'la' for matching
    segment: inputs.segment.toString().trim().toLowerCase(),
    gender: inputs.gender.toLowerCase()
  };

  console.log("DEBUG: Normalized inputs for matching:", normalizedInputs);

  for (let i = 0; i < refData.length; i++) {
    const row = refData[i];
    let isMatch = true;

    // Check parameter
    if ((row.parameter || '').toString().trim().toLowerCase() !== normalizedInputs.parameter) {
      isMatch = false;
    }
    // Check segment
    else if ((row.segment || '').toString().trim().toLowerCase() !== normalizedInputs.segment) {
      isMatch = false;
    }
    // Check gender
    else if ((row.gender || '').toString().trim().toLowerCase() !== normalizedInputs.gender) {
      isMatch = false;
    }

    if (isMatch) {
      console.log(`DEBUG: Found matching row at index ${i}:`, row);
      match = row;
      break;
    }

    // Check for execution timeout
    if (Date.now() - startTime > TIMEOUT_MS) {
      throw new Error('Script execution timed out while searching for matching data.');
    }
  }

  if (!match) {
    const matchInfo = `parameter='${inputs.parameter}', segment='${inputs.segment}', gender='${inputs.gender}'`;
    throw new NotFoundError(`No matching reference data row found for { ${matchInfo} }`);
  }

  // --- 4. Build Response ---
  const out = {
    input: {
      parameter: inputs.parameter,
      segment: inputs.segment,
      gender: inputs.gender
    },
    reference_data: {
      unit: match.unit,
      mean: match.mean,
      sd: match.sd,
      ll: match.ll,
      ul: match.ul
    }
  };

  console.log("DEBUG: Final lvmt output built:", out);
  return out;
}
