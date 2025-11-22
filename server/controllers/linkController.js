const Link = require('../models/Link');

// Generate random code
const generateRandomCode = () => {
  const length = 6;
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let code = '';
  
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return code;
};

// Create a new link
const createLink = async (req, res, next) => {
  try {
    const { target_url } = req.body;
    let { code } = req.body;
    const validatedUrl = req.validatedUrl;

    // Generate code if not provided
    if (!code) {
      let attempts = 0;
      do {
        code = generateRandomCode();
        attempts++;
        if (attempts > 10) {
          return res.status(500).json({ error: 'Failed to generate unique code' });
        }
      } while (await Link.codeExists(code));
    } else {
      // Check if custom code already exists
      if (await Link.codeExists(code)) {
        return res.status(409).json({ error: 'Code already exists' });
      }
    }

    const link = await Link.create(code, validatedUrl);
    res.status(201).json(link);
  } catch (error) {
    next(error);
  }
};

// Get all links
const getAllLinks = async (req, res, next) => {
  try {
    const links = await Link.findAll();
    res.json(links);
  } catch (error) {
    next(error);
  }
};

// Get link stats by code
const getLinkStats = async (req, res, next) => {
  try {
    const { code } = req.params;
    const link = await Link.findByCode(code);

    if (!link) {
      return res.status(404).json({ error: 'Link not found' });
    }

    res.json(link);
  } catch (error) {
    next(error);
  }
};

// Delete link by code
const deleteLink = async (req, res, next) => {
  try {
    const { code } = req.params;
    const link = await Link.deleteByCode(code);

    if (!link) {
      return res.status(404).json({ error: 'Link not found' });
    }

    res.json({ message: 'Link deleted successfully', link });
  } catch (error) {
    next(error);
  }
};

// Redirect to target URL
const redirectLink = async (req, res, next) => {
  try {
    const { code } = req.params;
    const link = await Link.findByCode(code);

    if (!link) {
      return res.status(404).json({ error: 'Link not found' });
    }

    // Increment click count
    await Link.incrementClick(code);

    // Perform 302 redirect
    res.redirect(302, link.target_url);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createLink,
  getAllLinks,
  getLinkStats,
  deleteLink,
  redirectLink
};

