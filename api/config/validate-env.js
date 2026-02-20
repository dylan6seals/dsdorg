/**
 * Environment Variable Validation
 * Validates that all required environment variables are set
 * Call this at the start of each serverless function handler
 */

const requiredEnvVars = [
  'MONGODB_URI',
  'ADMIN_PASSWORD',
  'JWT_SECRET',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET'
];

/**
 * Validates that all required environment variables are present
 * @throws {Error} If any required environment variable is missing
 */
function validateEnv() {
  const missing = requiredEnvVars.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      'Please ensure all required variables are set in your .env file or deployment environment.'
    );
  }
}

module.exports = { validateEnv };
