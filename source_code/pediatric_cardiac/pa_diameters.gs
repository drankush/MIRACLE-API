/**
 * @description Handles requests for the PEDS_PA domain (Pediatric Pulmonary Artery Diameters).
 */

// --- Helper Functions for PEDS_PA ---

/**
 * Calculates Body Surface Area (BSA) in m² using the Mosteller formula.
 * @param {number} weightKg - Weight in kilograms.
 * @param {number} heightCm - Height in centimeters.
 * @returns {number} BSA in square meters.
 * @throws {BadRequestError} if inputs are not positive numbers.
 */
function calculateBSA_Mosteller(weightKg, heightCm) {
  if (weightKg <= 0 || heightCm <= 0) {
    throw new BadRequestError('Weight and height must be positive values.');
  }
  // Mosteller formula: BSA (m²) = sqrt((weight_kg * height_cm) / 3600)
  return Math.sqrt((weightKg * heightCm) / 3600);
}

/**
 * Calculates the cumulative distribution function (CDF) for a standard normal distribution.
 * This is used to convert a z-score to a percentile.
 * It relies on an approximation of the error function (erf).
 * @param {number} z - The z-score.
 * @returns {number} The percentile, as a value between 0 and 1.
 */
function standardNormalCdf(z) {
  // A&S formula 7.1.26, an approximation of the error function (erf)
  function erf(x) {
    const a1 =  0.254829592;
    const a2 = -0.284496736;
    const a3 =  1.421413741;
    const a4 = -1.453152027;
    const a5 =  1.061405429;
    const p  =  0.3275911;

    const sign = (x >= 0) ? 1 : -1;
    x = Math.abs(x);

    const t = 1.0 / (1.0 + p * x);
    const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
    
    return sign * y;
  }
  // The CDF of the standard normal distribution is related to erf
  return 0.5 * (1 + erf(z / Math.sqrt(2)));
}


/**
 * Handles GET requests for the 'PEDS_PA' domain. It calculates z-scores and reference
 * values for pediatric pulmonary artery diameters based on BSA.
 *
 *
 * @param {object} e - The event parameter from doGet, containing query parameters.
 * @param {string} SPREADSHEET_ID - The ID of the spreadsheet to use.
 * @returns {object} - A result object to be serialized into JSON.
 * @throws {BadRequestError} - If required parameters are missing or invalid.
 * @throws {NotFoundError} - If no matching data is found in the sheet.
 */
function handleRequest_peds_pa(e, SPREADSHEET_ID) {
  const SHEET_NAME = 'pediatric_cardiac.pa_diameters';
  
  // --- 1. Extract and Validate Parameters ---
  const { parameter, wt_kg, ht_cm, measured } = e.parameter;

  if (!parameter || !wt_kg || !ht_cm || !measured) {
    throw new BadRequestError('Missing one or more required parameters: parameter, wt_kg, ht_cm, measured.');
  }

  const weightKg = parseFloat(wt_kg);
  const heightCm = parseFloat(ht_cm);
  const measuredValue = parseFloat(measured);
  
  if (isNaN(weightKg) || isNaN(heightCm) || isNaN(measuredValue)) {
     throw new BadRequestError('Invalid input: wt_kg, ht_cm, and measured must all be numbers.');
  }

  const normalizedParameter = normalize(parameter);
  
  // --- 2. Perform Initial Calculations ---
  const bsa = calculateBSA_Mosteller(weightKg, heightCm);

  // --- 3. Fetch Spreadsheet Data ---
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    throw new Error(`Sheet with name '${SHEET_NAME}' was not found.`);
  }

  const data = sheet.getDataRange().getValues();
  const headers = data[0].map(h => normalize(h));
  const rows = data.slice(1);
  
  // Find the row that matches the input parameter
  const dataRow = rows.find(row => normalize(row[headers.indexOf('parameter')]) === normalizedParameter);
  
  if (!dataRow) {
    throw new NotFoundError(`No regression data found for parameter: '${parameter}'.`);
  }

  // --- 4. Extract Regression Coefficients ---
  const a = parseFloat(dataRow[headers.indexOf('a')]);
  const b = parseFloat(dataRow[headers.indexOf('b')]);
  const c = parseFloat(dataRow[headers.indexOf('c')]);
  const sd = parseFloat(dataRow[headers.indexOf('sd')]);

  if (isNaN(a) || isNaN(b) || isNaN(c) || isNaN(sd)) {
      throw new Error(`Data corruption in spreadsheet for parameter '${parameter}'. Coefficients are not numbers.`);
  }

  // --- 5. Perform Core Z-Score Calculations ---
  // Predicted diameter = a + b * BSA^c
  const predictedDiameter = a + b * Math.pow(bsa, c);
  
  // Z‑score = (measured – predicted) / SD
  const zScore = (measuredValue - predictedDiameter) / sd;
  
  // Lower and upper limits correspond to z-scores of -2 and +2
  const lowerLimit = predictedDiameter - 2 * sd;
  const upperLimit = predictedDiameter + 2 * sd;

  // Convert z-score to percentile
  const percentile = standardNormalCdf(zScore) * 100;
  
  // --- 6. Format the Response ---
  const finalResponse = {
    inputs: {
      domain: 'PEDS_PA',
      parameter: parameter,
      wt_kg: wt_kg,
      ht_cm: ht_cm,
      measured: measured
    },
    results: {
      units: "mm",
      mean: parseFloat(predictedDiameter.toFixed(2)),
      ll: parseFloat(lowerLimit.toFixed(2)),
      ul: parseFloat(upperLimit.toFixed(2)),
      calculated_z_score: parseFloat(zScore.toFixed(2)),
      calculated_percentile: parseFloat(percentile.toFixed(2))
    }
  };

  return finalResponse;
}
