/**
 * Handles requests for the ventricular_parameters domain.
 * This function is called by the main doGet router in Code.gs.
 * 
 * @param {Object} e The event parameter from the web request.
 * @param {string} SPREADSHEET_ID The ID of the master spreadsheet.
 * @param {number} startTime The start time of the request for timeout tracking.
 * @param {number} TIMEOUT_MS The timeout duration in milliseconds.
 * @returns {Object} A JSON object with the calculated reference values.
 */
function handleRequest_pediatric_ventricle(e, SPREADSHEET_ID, startTime, TIMEOUT_MS) {
  // 1. --- PARSE AND VALIDATE INPUTS ---
  const params = e.parameter;
  const rawParam = params.parameter;
  const rawGender = params.gender;
  const rawMeasured = params.measured;
  const rawHt = params.ht_cm;
  const rawWt = params.wt_kg;

  if (!rawParam || !rawGender || !rawMeasured || !rawHt || !rawWt) {
    throw new BadRequestError('Missing one or more required parameters: parameter, gender, measured, ht_cm, wt_kg.');
  }

  const gender = normalize(rawGender);
  if (gender !== 'male' && gender !== 'female') {
    throw new BadRequestError("Parameter 'gender' must be 'male' or 'female'.");
  }

  const measured = parseFloat(rawMeasured);
  const ht_cm = parseFloat(rawHt);
  const wt_kg = parseFloat(rawWt);

  if (isNaN(measured) || isNaN(ht_cm) || isNaN(wt_kg)) {
    throw new BadRequestError("Parameters 'measured', 'ht_cm', and 'wt_kg' must be valid numbers.");
  }
  
  let reqParam = normalize(rawParam);
  let isRequestIndexed = false;
  // Handle indexed parameters (e.g., LVEDVi)
  if (reqParam.endsWith('i')) {
      isRequestIndexed = true;
      reqParam = reqParam.slice(0, -1);
  }

  // 2. --- PERFORM INITIAL CALCULATIONS ---
  const bsa = calculateBSA_(ht_cm, wt_kg);
  if (isNaN(bsa) || bsa <= 0) {
      throw new BadRequestError("Could not calculate a valid BSA from the provided height and weight.");
  }

  // 3. --- FETCH AND FIND REFERENCE DATA ---
  const lookupKey = `${reqParam}_${gender}`;
  const data = getSheetDataAsObjects_(SPREADSHEET_ID, 'pediatric_cardiac.ventricular_parameters');
  const refRow = data.find(row => normalize(row.parameter_key) === lookupKey);

  if (!refRow) {
    throw new NotFoundError(`No reference data found for parameter '${rawParam}' and gender '${rawGender}'. Check spelling.`);
  }

  // 4. --- CALCULATE PERCENTILE VALUES ---
  const zScores = { '3rd': -2, '10th': -1, '50th': 0, '97th': 2, '90th': 1 };
  const zValues = { '-2': null, '-1': null, '0': null, '1': null, '2': null };
  const percentiles = {};

  for (const z of Object.keys(zValues)) {
    const zNum = parseInt(z, 10);
    const zPrefix = zNum === 0 ? 'z0' : (zNum > 0 ? `z${zNum}` : `zneg${Math.abs(zNum)}`);
    const a = parseFloat(refRow[`a_${zPrefix}`]);
    const b = parseFloat(refRow[`b_${zPrefix}`]);
    const c = parseFloat(refRow[`c_${zPrefix}`]);

    let absValue = calculateAllometric_(a, b, c, bsa);
    zValues[z] = absValue;
  }
  
  // 5. --- CALCULATE Z-SCORE AND PERCENTILE FOR MEASURED VALUE ---
  
  // If the user requested an indexed value, we must first "un-index" their measured value
  // to compare it against our absolute (non-indexed) calculated percentiles.
  const absoluteMeasured = isRequestIndexed ? measured * bsa : measured;

  const calculatedZ = interpolateZScore_(absoluteMeasured, zValues);
  const calculatedPercentile = normDistCDF_(calculatedZ) * 100;
  
  // 6. --- ASSEMBLE FINAL JSON RESPONSE ---
  
  // Now, format the output percentiles. If the original request was indexed,
  // divide all our absolute calculated values by BSA.
  for (const pName in zScores) {
    let z = zScores[pName];
    let finalValue = zValues[z.toString()];
    if (isRequestIndexed) {
      finalValue /= bsa;
    }
    percentiles[`${pName}_percentile`] = parseFloat(finalValue.toFixed(2));
  }
  
  const finalUnits = isRequestIndexed ? `${refRow.units}/m2` : refRow.units;

  return {
    echo: {
      domain: "Pediatric_Ventricle",
      requested_parameter: rawParam,
      measured_value: measured,
      units: finalUnits,
      height_cm: ht_cm,
      weight_kg: wt_kg,
      gender: gender,
      calculated_bsa_m2: parseFloat(bsa.toFixed(3))
    },
    results: {
      calc_z: parseFloat(calculatedZ.toFixed(2)),
      calc_percentile: parseFloat(calculatedPercentile.toFixed(2)),
      ...percentiles
    }
  };
}


// ────── HELPER FUNCTIONS ──────

/**
 * Calculates Body Surface Area (BSA) using the Du Bois & Du Bois formula.
 * @param {number} heightCm Height in centimeters.
 * @param {number} weightKg Weight in kilograms.
 * @returns {number} BSA in square meters.
 */
function calculateBSA_(heightCm, weightKg) {
  return 0.007184 * Math.pow(heightCm, 0.725) * Math.pow(weightKg, 0.425);
}

/**
 * Calculates a value based on the allometric formula: (a * BSA + b)^c
 * @param {number} a Coefficient 'a'.
 * @param {number} b Coefficient 'b'.
 * @param {number} c Coefficient 'c'.
 * @param {number} bsa Body Surface Area.
 * @returns {number} The calculated value.
 */
function calculateAllometric_(a, b, c, bsa) {
    return Math.pow((a * bsa) + b, c);
}

/**
 * Interpolates a Z-score from a measured value given the values at standard Z-scores.
 * @param {number} measuredValue The patient's measured value (absolute, not indexed).
 * @param {Object} zValues An object mapping Z-scores ('-2', '-1', etc.) to their calculated absolute values.
 * @returns {number} The interpolated Z-score.
 */
function interpolateZScore_(measuredValue, zValues) {
    const zPoints = Object.keys(zValues).map(k => parseInt(k, 10)).sort((a, b) => a - b); // [-2, -1, 0, 1, 2]

    // Find the interval where the measured value lies
    for (let i = 0; i < zPoints.length - 1; i++) {
        const zLower = zPoints[i];
        const zUpper = zPoints[i+1];
        const valLower = zValues[zLower.toString()];
        const valUpper = zValues[zUpper.toString()];

        if (measuredValue >= valLower && measuredValue <= valUpper) {
            // Linear interpolation
            const proportion = (measuredValue - valLower) / (valUpper - valLower);
            if (isNaN(proportion)) return zLower; // Handle case where valUpper === valLower
            return zLower + proportion * (zUpper - zLower);
        }
    }
    
    // Extrapolation for values outside the 3rd-97th percentile range
    if (measuredValue < zValues['-2']) {
        const proportion = (measuredValue - zValues['-2']) / (zValues['-1'] - zValues['-2']);
        return -2 + proportion;
    }
    if (measuredValue > zValues['2']) {
        const proportion = (measuredValue - zValues['2']) / (zValues['2'] - zValues['1']);
        return 2 + proportion;
    }

    return NaN; // Should not be reached
}

/**
 * Standard Normal Cumulative Distribution Function (CDF).
 * Converts a Z-score to a percentile (0.0 to 1.0).
 * Uses the relationship with the error function (erf).
 * @param {number} z The Z-score.
 * @returns {number} The cumulative probability.
 */
function normDistCDF_(z) {
    // erf(z) = (2/sqrt(pi)) * integral from 0 to z of e^(-t^2) dt
    // cdf(z) = 0.5 * (1 + erf(z / sqrt(2)))
    // This approximation of erf is accurate to ~6 decimal places.
    const erf = (x) => {
        const sign = (x >= 0) ? 1 : -1;
        x = Math.abs(x);
        const a1 =  0.254829592;
        const a2 = -0.284496736;
        const a3 =  1.421413741;
        const a4 = -1.453152027;
        const a5 =  1.061405429;
        const p  =  0.3275911;
        const t = 1.0 / (1.0 + p * x);
        const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
        return sign * y;
    };
    return 0.5 * (1 + erf(z / Math.sqrt(2)));
}

/**
 * Fetches data from a sheet and converts it to an array of objects.
 * Caches the result for 5 minutes to improve performance.
 * @param {string} spreadsheetId The ID of the Google Spreadsheet.
 * @param {string} sheetName The name of the sheet to fetch data from.
 * @returns {Array<Object>} An array of objects, where each object represents a row.
 */
function getSheetDataAsObjects_(spreadsheetId, sheetName) {
  const cache = CacheService.getScriptCache();
  const cacheKey = `data_${spreadsheetId}_${sheetName}`;
  const cached = cache.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }

  const sheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName(sheetName);
  const range = sheet.getDataRange();
  const values = range.getValues();
  
  if (values.length < 2) return [];

  const headers = values[0].map(h => normalize(h));
  const data = [];
  for (let i = 1; i < values.length; i++) {
    let rowObject = {};
    for (let j = 0; j < headers.length; j++) {
      rowObject[headers[j]] = values[i][j];
    }
    data.push(rowObject);
  }

  cache.put(cacheKey, JSON.stringify(data), 300); // Cache for 5 minutes
  return data;
}
