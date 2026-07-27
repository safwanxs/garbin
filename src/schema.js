/**
 * @typedef {Object} Location
 * @property {number} lat - Latitude
 * @property {number} lng - Longitude
 */

/**
 * @typedef {Object} Bin
 * @property {string} id - Unique identifier for the bin
 * @property {Location} location - Coordinates of the bin
 * @property {string} address - Human-readable address
 * @property {string} capacity - E.g., '1100L'
 * @property {string} lastPickupDate - ISO Date string of last pickup
 * @property {'normal' | 'flagged' | 'overflowing'} status - Current status of the bin
 * @property {boolean} predictiveFlag - True if AI predicts overflow
 * @property {number} reportCountPastWeek - Count of reports in the last 7 days
 * @property {string} createdAt - ISO Date string
 */

/**
 * @typedef {Object} GeminiClassification
 * @property {boolean} isOverflowing
 * @property {'low' | 'medium' | 'high'} severity
 * @property {number} confidenceScore - Value between 0 and 1
 * @property {string} rawResponse - Full JSON response from Gemini
 */

/**
 * @typedef {Object} Report
 * @property {string} id - Unique identifier for the report
 * @property {string} binId - ID of the bin being reported
 * @property {string} [userId] - Optional ID of the user reporting
 * @property {string} photoUrl - URL of the uploaded image
 * @property {GeminiClassification} geminiClassification - AI assessment
 * @property {'pending' | 'reviewed' | 'resolved'} status - Report processing status
 * @property {string} reportedAt - ISO Date string
 */

/**
 * @typedef {Object} RouteStop
 * @property {string} binId - ID of the bin to pick up
 * @property {'overflowing' | 'flagged'} reason - Why the bin is on the route
 * @property {number} priority - Order priority (lower is higher priority)
 * @property {'pending' | 'collected'} status - Pickup status
 */

/**
 * @typedef {Object} Route
 * @property {string} id - Unique route ID
 * @property {string} date - Date of the route (YYYY-MM-DD)
 * @property {'draft' | 'assigned' | 'in-progress' | 'completed'} status
 * @property {string} assignedTruckId - ID of the truck/driver
 * @property {RouteStop[]} stops - Ordered list of stops
 * @property {string} createdAt - ISO Date string
 */

/**
 * @typedef {Object} User
 * @property {string} id - Unique user ID
 * @property {'resident' | 'staff' | 'driver'} role
 * @property {string} displayName
 * @property {string} email
 * @property {number} [trustScore] - Relevant for residents to prevent spam
 * @property {string} createdAt - ISO Date string
 */

export {};
