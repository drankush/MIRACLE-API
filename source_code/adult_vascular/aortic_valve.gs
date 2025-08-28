/**
 * @description Handles requests for the MAVPV_4D domain (Mean Aortic Valve Peak Velocity).
 */

/**
 * Calculates the percentile of a given value within a normal distribution.
 * It uses the Abramowitz and Stegun approximation for the error function (erf)
 * to compute the cumulative distribution function (CDF).
 * @param {number} measuredValue - The value for which to calculate the percentile (x).
 * @param {number} mean - The mean of the distribution (μ).
 * @param {number} sd - The standard deviation of the distribution (σ).
 * @returns {number} The calculated percentile, rounded to two decimal places.
 */
function calculatePercentile(measuredValue, mean, sd) {
  if (sd <= 0) {
    // Cannot calculate percentile if standard deviation is zero or negative.
    return null;
  }
  
  // 1. Calculate the Z-score
  const z = (measuredValue - mean) / sd;

  // 2. Calculate the Cumulative Distribution Function (CDF) using an approximation
  // This is an approximation of the standard normal CDF, Φ(z).
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989423 * Math.exp(-z * z / 2);
  let probability = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  
  if (z > 0) {
    probability = 1 - probability;
  }

  // 3. Convert probability to percentile and round it
  const percentile = probability * 100;
  return parseFloat(percentile.toFixed(2));
}


/**
 * Handles GET requests for the 'MAVPV_4D' domain. It finds data in the '21_MAVPV_4D'
 * sheet based on parameter and gender, then calculates a percentile for the measured value.
 *
 * @param {object} e - The event parameter from doGet, containing query parameters.
 * @param {string} SPREADSHEET_ID - The ID of the spreadsheet to use.
 * @returns {object} - A result object to be serialized into JSON.
 * @throws {BadRequestError} - If required parameters are missing or invalid.
 * @throws {NotFoundError} - If no matching data is found in the sheet.
 */
function handleRequest_mavpv_4d(e, SPREADSHEET_ID) {
  const SHEET_NAME = 'aortic_valve';

  // --- 1. Extract and Validate Parameters ---
  const { parameter, gender, measured } = e.parameter;

  if (!parameter || !gender || !measured) {
    throw new BadRequestError('Missing one or more required parameters: parameter, gender, measured.');
  }

  const measuredValue = parseFloat(measured);
  if (isNaN(measuredValue)) {
    throw new BadRequestError(`Invalid measured value: '${measured}'. It must be a number.`);
  }

  const normalizedParameter = normalize(parameter);
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
    const rowGender = normalize(row[headers.indexOf('gender')]);

    if (rowParameter === normalizedParameter && rowGender === normalizedGender) {
      foundRow = row;
      break;
    }
  }

  // --- 4. Format the Response ---
  if (!foundRow) {
    throw new NotFoundError(`No data found for parameter='${parameter}' and gender='${gender}'.`);
  }

  const mean = parseFloat(foundRow[headers.indexOf('mean')]);
  const sd = parseFloat(foundRow[headers.indexOf('sd')]);
  
  // Calculate the percentile for the user's measured value
  const percentile = calculatePercentile(measuredValue, mean, sd);

  const result = {
    units: foundRow[headers.indexOf('units')],
    mean: mean,
    sd: sd,
    ll: foundRow[headers.indexOf('ll')],
    ul: foundRow[headers.indexOf('ul')],
    calculated_percentile: percentile,
  };

  const finalResponse = {
    inputs: {
      domain: 'MAVPV_4D',
      parameter: parameter,
      gender: gender,
      measured: measured
    },
    results: result
  };

  return finalResponse;
}
