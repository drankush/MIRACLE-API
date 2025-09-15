// This file contains the domain-specific logic for 'athletes'.

/**
 * Main handler function for the 'athletes' domain.
 *
 * @param {Object} e The event object containing request parameters.
 * @param {number} startTime The timestamp when the request started.
 * @param {number} TIMEOUT_MS The maximum execution time allowed.
 * @returns {Object} The final JSON output object.
 */
function handleRequest_athletes(e, SPREADSHEET_ID, startTime, TIMEOUT_MS) {
  console.log("DEBUG: handleRequest_athletes called with params:", e.parameter);

  // --- 1. Validate Required Inputs ---
  const requiredParams = ['parameter', 'gender', 'sport_act_hrs'];
  const inputs = {};
  
  // Check for missing required parameters
  for (const param of requiredParams) {
    const value = e.parameter[param];
    if (value === undefined || value === null || value === '') {
      throw new BadRequestError(`Missing required parameter: ${param}`);
    }
    // Store raw value, especially important for sport_act_hrs which needs to be a number
    inputs[param] = param === 'sport_act_hrs' ? parseFloat(value) : value;
  }

  // Validate sport_act_hrs is a number
  if (isNaN(inputs.sport_act_hrs) || inputs.sport_act_hrs < 0 || inputs.sport_act_hrs > 168) {
     throw new BadRequestError(`Invalid value for sport_act_hrs: ${e.parameter.sport_act_hrs}. Must be a number between 0 and 168.`);
  }

  // --- 2. Derive 'category' from 'sport_act_hrs' ---
  let derivedCategory;
  const hrs = inputs.sport_act_hrs;
  if (hrs >= 0 && hrs < 9) {
    derivedCategory = 'NON';
  } else if (hrs >= 9 && hrs <= 18) {
    derivedCategory = 'REGULAR';
  } else if (hrs > 18 && hrs <= 168) {
    derivedCategory = 'ELITE';
  } else {
    // This should never happen due to the validation above, but keeping for safety
    throw new BadRequestError(`Value for sport_act_hrs (${hrs}) is outside the valid range (0-168).`);
  }
  console.log(`DEBUG: Derived category '${derivedCategory}' from sport_act_hrs=${hrs}`);

  // --- 3. Load Reference Data ---
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const refDataSheetName = 'adult_cardiac.athletes';
  const sh = ss.getSheetByName(refDataSheetName);
  if (!sh) throw new Error(`Sheet not found: '${refDataSheetName}'`);
  const vals = sh.getDataRange().getValues();
  if (vals.length === 0) throw new Error(`Sheet '${refDataSheetName}' is empty`);
  
  // Assuming the first row is the header
  const hdrs = vals.shift().map(h => h.toString().trim().toLowerCase()); // Normalize headers
  const refData = vals.map(r => Object.fromEntries(r.map((v, i) => [hdrs[i], v])));
  console.log(`DEBUG: Loaded ${refData.length} rows from '${refDataSheetName}'.`);

  // --- 4. Find Matching Row ---
  let match = null;
  const normalizedInputs = {
    parameter: inputs.parameter.toString().trim().toLowerCase(),
    gender: inputs.gender.toString().trim().toLowerCase(),
    category: derivedCategory.toLowerCase() // Use the derived, lowercased category for matching
  };

  console.log("DEBUG: Normalized inputs for matching:", normalizedInputs);

  for (let i = 0; i < refData.length; i++) {
    const row = refData[i];
    let isMatch = true;

    // Check parameter
    if ((row.parameter || '').toString().trim().toLowerCase() !== normalizedInputs.parameter) {
      isMatch = false;
    }
    // Check gender
    else if ((row.gender || '').toString().trim().toLowerCase() !== normalizedInputs.gender) {
      isMatch = false;
    }
    // Check category
    else if ((row.category || '').toString().trim().toLowerCase() !== normalizedInputs.category) {
      isMatch = false;
    }

    if (isMatch) {
      console.log(`DEBUG: Found matching row at index ${i}:`, row);
      match = row;
      break;
    }

    // Check for execution timeout during matching loop
    if (Date.now() - startTime > TIMEOUT_MS) {
      throw new Error('Script execution timed out while searching for matching data.');
    }
  }

  if (!match) {
    const matchInfo = `parameter='${inputs.parameter}', gender='${inputs.gender}', category='${derivedCategory}'`;
    throw new NotFoundError(`No matching reference data row found for { ${matchInfo} }`);
  }

  // --- 5. Build Response ---
  const out = {
    input: {
      parameter: inputs.parameter, // Echo original case
      gender: inputs.gender,       // Echo original case
      sport_act_hrs: inputs.sport_act_hrs, // Echo original value
      category: derivedCategory    // Echo derived value in original case
    },
    reference_data: {
      units: match.units,
      mean: match.mean,
      sd: match.sd,
      ll: match.ll,
      ul: match.ul
    }
  };

  console.log("DEBUG: Final output built:", out);
  return out;
}
