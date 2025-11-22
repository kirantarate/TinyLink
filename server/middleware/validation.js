const validator = require('validator');

// Validate URL
const validateUrl = (url) => {
  if (!url || typeof url !== 'string') {
    return { valid: false, error: 'URL is required' };
  }

  // Add protocol if missing
  let formattedUrl = url.trim();
  if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
    formattedUrl = 'https://' + formattedUrl;
  }

  if (!validator.isURL(formattedUrl, { require_protocol: true })) {
    return { valid: false, error: 'Invalid URL format' };
  }

  return { valid: true, url: formattedUrl };
};

// Validate short code format [A-Za-z0-9]{6,8}
const validateCode = (code) => {
  if (!code || typeof code !== 'string') {
    return { valid: false, error: 'Code is required' };
  }

  const codeRegex = /^[A-Za-z0-9]{6,8}$/;
  if (!codeRegex.test(code)) {
    return { valid: false, error: 'Code must be 6-8 alphanumeric characters' };
  }

  return { valid: true };
};

// Middleware to validate create link request
const validateCreateLink = (req, res, next) => {
  const { target_url, code } = req.body;

  // Validate target URL
  const urlValidation = validateUrl(target_url);
  if (!urlValidation.valid) {
    return res.status(400).json({ error: urlValidation.error });
  }

  // If custom code provided, validate it
  if (code) {
    const codeValidation = validateCode(code);
    if (!codeValidation.valid) {
      return res.status(400).json({ error: codeValidation.error });
    }
  }

  // Attach validated URL to request
  req.validatedUrl = urlValidation.url;
  next();
};

// Middleware to validate code parameter
const validateCodeParam = (req, res, next) => {
  const { code } = req.params;
  const codeValidation = validateCode(code);
  
  if (!codeValidation.valid) {
    return res.status(400).json({ error: codeValidation.error });
  }

  next();
};

module.exports = {
  validateUrl,
  validateCode,
  validateCreateLink,
  validateCodeParam
};

