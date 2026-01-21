// ────── CONFIGURATION ──────
const SPREADSHEET_ID = '1ai6VLRXBFMcxcR6qQ6oukNA6ewDUrovWIHt6KuKLEx0';
const TIMEOUT_MS = 25000; // Adjust if needed, but beware Apps Script limits

// Custom error classes for proper error categorization (even though we can't change HTTP status)
class BadRequestError extends Error {
  constructor(message) {
    super(message);
    this.name = 'BadRequestError';
    // Note: We can't actually set HTTP status, but we'll categorize errors
  }
}

class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = 'NotFoundError';
  }
}

function normalize(s) {
  if (s == null) return '';
  return s.toString().trim().toLowerCase();
}

function doGet(e) {
  const startTime = Date.now();
  try {
    const rawDom = e.parameter.domain;
    if (!rawDom) {
      throw new BadRequestError('Missing required parameter: domain');
    }
    
    const dom = normalize(rawDom);
    const handlerFunctionName = `handleRequest_${dom}`; // e.g., 'handleRequest_pediatrics'

    // Check if the domain-specific handler function exists globally
    if (typeof globalThis[handlerFunctionName] === 'function') {
      console.log(`DEBUG: Calling domain-specific handler: ${handlerFunctionName}`);
      try {
        // Call the domain-specific handler function
        const result = globalThis[handlerFunctionName](e, SPREADSHEET_ID, startTime, TIMEOUT_MS);
        
        return ContentService
          .createTextOutput(JSON.stringify(result, null, 2))
          .setMimeType(ContentService.MimeType.JSON);
          
      } catch (handlerErr) {
        console.error(`Error in domain-specific handler '${handlerFunctionName}':`, handlerErr);
        
        // Create proper error response structure
        const errorResponse = {
          error: handlerErr.message,
          error_type: handlerErr.name
        };
        
        // For client-side parsing, include the intended status code in the response
        if (handlerErr instanceof BadRequestError) {
          errorResponse.intended_status = 400;
        } else if (handlerErr instanceof NotFoundError) {
          errorResponse.intended_status = 404;
        } else {
          errorResponse.intended_status = 500;
        }
        
        return ContentService
          .createTextOutput(JSON.stringify(errorResponse, null, 2))
          .setMimeType(ContentService.MimeType.JSON);
      }
    } else {
      console.error(`DEBUG: Domain-specific handler function '${handlerFunctionName}' not found.`);
      throw new BadRequestError(`Unsupported domain: '${rawDom}'. No handler found.`);
    }

  } catch (err) {
    console.error("doGet Error:", err);
    
    // Create error response with intended status
    const errorResponse = {
      error: err.message,
      error_type: err.name || 'ServerError',
      intended_status: err instanceof BadRequestError ? 400 : 500
    };
    
    return ContentService
      .createTextOutput(JSON.stringify(errorResponse, null, 2))
      .setMimeType(ContentService.MimeType.JSON);
  }
}