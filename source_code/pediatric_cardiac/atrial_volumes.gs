
/** File:@atrial_volumes.gs
 * Calculates Body Surface Area (BSA) using the DuBois formula.
 * @param {number} ht_cm Height in centimeters.
 * @param {number} wt_kg Weight in kilograms.
 * @return {number|null} The calculated BSA in m^2, or null if inputs are invalid.
 */
function calculateBSA_Pediatrics(ht_cm, wt_kg) {
  if (isNaN(ht_cm) || isNaN(wt_kg) || ht_cm <= 0 || wt_kg <= 0) {
    return null;
  }
  // DuBois formula: BSA (m2) = 0.007184 * Weight(kg)^0.425 * Height(cm)^0.725
  return 0.007184 * Math.pow(wt_kg, 0.425) * Math.pow(ht_cm, 0.725);
}

/**
 * Calculates the Standard Deviation Score (SDS or z-score) using the LMS method.
 * SDS = [((X/M)^L) - 1] / (L * S)
 * @param {number} X The measured value (e.g., LAVi, RAVi).
 * @param {number} L The L parameter from LMS.
 * @param {number} M The M parameter from LMS.
 * @param {number} S The S parameter from LMS.
 * @return {number|null} The calculated SDS, or null if calculation fails.
 */
function calculateSDS_Pediatrics(X, L, M, S) {
  if (isNaN(X) || isNaN(L) || isNaN(M) || isNaN(S) || M <= 0 || (L === 0 && S === 0)) {
    return null;
  }
  try {
    // Guard against negative base for power operation
    if (X <= 0 || M <= 0) {
      return null;
    }
    var ratio = X / M;
    // Guard against very large/small intermediate values
    if (ratio <= 0) {
      return null;
    }
    var ratioToL = Math.pow(ratio, L);
    var numerator = ratioToL - 1;
    var denominator = L * S;
    if (denominator === 0) {
      return null;
    }
    return numerator / denominator;
  } catch (e) {
    console.error("Error calculating SDS (PEDS):", e.message);
    return null;
  }
}

/**
 * Calculates the percentile from a z-score (SDS) using the standard normal distribution.
 * @param {number} sds The z-score (Standard Deviation Score).
 * @return {number|null} The calculated percentile (0-100), or null if input is invalid.
 */
function calculatePercentileFromZ_Pediatrics(sds) {
  if (isNaN(sds)) {
    return null;
  }
  // Approximation for NORM.S.DIST(sds, TRUE) * 100
  var z = sds / Math.sqrt(2.0);
  var t = 1.0 / (1.0 + 0.5 * Math.abs(z));
  var erf = 1.0 - t * Math.exp( -z*z -  1.26551223 +
      t * ( 1.00002368 +
      t * ( 0.37409196 +
      t * ( 0.09678418 +
      t * (-0.18628806 +
      t * ( 0.27886807 +
      t * (-1.13520398 +
      t * ( 1.48851587 +
      t * (-0.82215223 +
      t * ( 0.17087277))))))))));
  var phi = z >= 0 ? (1.0 + erf) / 2.0 : (1.0 - erf) / 2.0;
  return phi * 100;
}

/**
 * Normalizes a string value for comparison (lowercase, trimmed).
 * Handles null/undefined.
 * @param {*} s The value to normalize.
 * @return {string} The normalized string.
 */
function normalizeValue(s) {
  if (s == null) return '';
  return s.toString().trim().toLowerCase();
}

/**
 * Loads data from a specific sheet within the main spreadsheet.
 * @param {string} spreadsheetId The ID of the spreadsheet.
 * @param {string} sheetName The name of the sheet to load.
 * @return {Array<Object>} An array of objects representing the rows of data.
 */
function loadSheetData_Pediatrics(spreadsheetId, sheetName) {
  const ss = SpreadsheetApp.openById(spreadsheetId);
  const sh = ss.getSheetByName(sheetName);
  if (!sh) {
    throw new Error(`Sheet '${sheetName}' not found in spreadsheet.`);
  }
  const vals = sh.getDataRange().getValues();
  if (vals.length === 0) {
    throw new Error(`Sheet '${sheetName}' is empty.`);
  }
  const hdrs = vals.shift().map(String).map(str => str.trim().toLowerCase());
  return vals.map(r => Object.fromEntries(r.map((v, i) => [hdrs[i], v])));
}

// File: pediatrics.gs
// [All other functions remain the same until handleRequest_pediatrics]

/**
 * The main handler function for the Pediatrics domain.
 * @param {Object} e The event object containing request parameters (e.parameter).
 * @param {string} spreadsheetId The ID of the main spreadsheet.
 * @param {number} startTime The timestamp when the request started (for timeout checks).
 * @param {number} timeoutMs The maximum allowed execution time in milliseconds.
 * @return {Object} The final JSON response object.
 */
function handleRequest_pediatrics(e, spreadsheetId, startTime, timeoutMs) {
  console.log("DEBUG: handleRequest_pediatrics called with params:", e.parameter);
  
  // --- 1. Normalize Parameter Keys (Case-Insensitive) ---
  const normalizedParameters = {};
  if (e.parameter) {
    for (const key in e.parameter) {
      if (e.parameter.hasOwnProperty(key)) {
        normalizedParameters[normalizeValue(key)] = e.parameter[key];
      }
    }
  }
  
  // --- 2. Validate Required Inputs ---
  const requiredFields = ['parameter', 'gender', 'age', 'av', 'ht_cm', 'wt_kg'];
  const inputs = {};
  
  // Check for missing required parameters
  for (const field of requiredFields) {
    const value = normalizedParameters[field];
    if (value === undefined || value === null || value === '') {
      throw new BadRequestError(`Missing required parameter: ${field}`);
    }
    inputs[field] = value;
  }
  
  // Validate parameter value
  const normalizedParameter = normalizeValue(inputs.parameter);
  if (!normalizedParameter.startsWith('lavi') && !normalizedParameter.startsWith('ravi')) {
    throw new BadRequestError(`Unsupported parameter value: '${inputs.parameter}'. Must start with 'LAVi' or 'RAVi'.`);
  }
  
  // Validate gender
  const normalizedGender = normalizeValue(inputs.gender);
  if (normalizedGender !== 'male' && normalizedGender !== 'female') {
    throw new BadRequestError(`Invalid gender value: '${inputs.gender}'. Must be 'Male' or 'Female'.`);
  }
  
  // Validate age (with gender-specific ranges)
  const age = parseFloat(inputs.age);
  if (isNaN(age) || age < 0) {
    throw new BadRequestError(`Invalid age value: '${inputs.age}'. Must be a positive number.`);
  }
  
  // CORRECTED GENDER-SPECIFIC AGE VALIDATION
  if (normalizedGender === 'male' && (age < 6 || age > 20)) {
    throw new BadRequestError(`Age out of range for male patients: ${age}. Must be between 6-20 years.`);
  }
  if (normalizedGender === 'female' && (age < 4 || age > 18)) {
    throw new BadRequestError(`Age out of range for female patients: ${age}. Must be between 4-18 years.`);
  }
  
  // Validate other numeric parameters
  const numericFields = ['av', 'ht_cm', 'wt_kg'];
  for (const field of numericFields) {
    const value = parseFloat(inputs[field]);
    if (isNaN(value) || value <= 0) {
      throw new BadRequestError(`Invalid ${field} value: '${inputs[field]}'. Must be a positive number.`);
    }
  }
  
  // --- 3. Perform Initial Derivations ---
  const derived = {};
  
  // Calculate BSA
  const bsa = calculateBSA_Pediatrics(parseFloat(inputs.ht_cm), parseFloat(inputs.wt_kg));
  if (bsa === null) {
    throw new BadRequestError("Failed to calculate BSA. Invalid ht_cm or wt_kg values.");
  }
  derived.bsa = bsa;
  
  // Calculate LAVi or RAVi
  const avValue = parseFloat(inputs.av);
  let measuredValue = null;
  
  if (normalizedParameter.startsWith('lavi')) {
    measuredValue = avValue / bsa;
    derived.LAVi = measuredValue;
    derived.RAVi = null;
  } else if (normalizedParameter.startsWith('ravi')) {
    measuredValue = avValue / bsa;
    derived.RAVi = measuredValue;
    derived.LAVi = null;
  }
  
  // --- 4. Load Reference Data ---
  const refData = loadSheetData_Pediatrics(spreadsheetId, 'pediatrics_cardiac.atrial_volumes');
  
  // --- 5. Find Matching Row ---
  let match = null;
  const normalizedMatchContext = {
    parameter: normalizedParameter,
    gender: normalizedGender,
    age: Math.floor(age).toString()  // Ensure integer age for matching
  };
  
  for (let i = 0; i < refData.length; i++) {
    const row = refData[i];
    let isMatch = true;
    
    for (const logicalField in normalizedMatchContext) {
      if (normalizedMatchContext.hasOwnProperty(logicalField)) {
        const contextValue = normalizedMatchContext[logicalField];
        const sheetValue = normalizeValue(row[logicalField]);
        
        if (sheetValue !== contextValue) {
          isMatch = false;
          break;
        }
      }
    }
    
    if (isMatch) {
      match = row;
      break;
    }
    
    // Timeout check
    if (Date.now() - startTime > timeoutMs) {
      throw new Error('Script execution timed out while searching for matching reference data.');
    }
  }
  
  if (!match) {
    const matchInfo = Object.keys(normalizedMatchContext)
      .map(k => `${k}='${normalizedMatchContext[k]}'`)
      .join(', ');
    throw new NotFoundError(`No reference data found for: ${matchInfo}`);
  }
  
  // --- 6. Perform Final Derivations ---
  let calculatedSDS = null;
  let calculatedPercentile = null;
  
  if (measuredValue !== null && match.l !== undefined && match.m !== undefined && match.s !== undefined) {
    calculatedSDS = calculateSDS_Pediatrics(
      measuredValue,
      parseFloat(match.l),
      parseFloat(match.m),
      parseFloat(match.s)
    );
    
    if (calculatedSDS !== null) {
      calculatedPercentile = calculatePercentileFromZ_Pediatrics(calculatedSDS);
    }
  }
  
  // --- 7. Build Final Response ---
  const out = { input: {}, reference_data: {}, results: {} };
  
  // Populate input section
  for (const key in e.parameter) {
    if (e.parameter.hasOwnProperty(key)) {
      out.input[key] = e.parameter[key];
    }
  }
  
  // Add derived values
  out.input.bsa = derived.bsa;
  out.input.LAVi = derived.LAVi;
  out.input.RAVi = derived.RAVi;
  
  // Populate reference_data section
  out.reference_data.lookup_age_years = parseFloat(match.age);
  out.reference_data.L = parseFloat(match.l);
  out.reference_data.M = parseFloat(match.m);
  out.reference_data.S = parseFloat(match.s);
  out.reference_data.P3_ml_per_m2 = parseFloat(match.p3);
  out.reference_data.P50_ml_per_m2 = parseFloat(match.p50);
  out.reference_data.P97_ml_per_m2 = parseFloat(match.p97);
  out.reference_data.percentiles_unit = match.percentiles_unit;
  
  // Populate results section
  out.results.calculated_sds = calculatedSDS;
  out.results.calculated_percentile = calculatedPercentile;
  
  return out;
}
