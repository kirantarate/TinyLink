const Link = require('../models/Link');
const { sendSuccess, sendError, sendPaginated } = require('../utils/responseHelper');

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
          return sendError(res, 500, 'Failed to generate unique code');
        }
      } while (await Link.codeExists(code));
    } else {
      // Check if custom code already exists
      if (await Link.codeExists(code)) {
        return sendError(res, 409, 'Code already exists');
      }
    }

    const link = await Link.create(code, validatedUrl);
    return sendSuccess(res, 201, link, 'Link created successfully');
  } catch (error) {
    next(error);
  }
};

// Get all links with optional pagination
const getAllLinks = async (req, res, next) => {
  try {
    // Check if pagination parameters are provided
    const hasPagination = req.query.page || req.query.limit;
    
    if (hasPagination) {
      // Parse query parameters
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      
      // Validate pagination parameters
      if (page < 1) {
        return sendError(res, 400, 'Page must be greater than 0');
      }
      if (limit < 1 || limit > 100) {
        return sendError(res, 400, 'Limit must be between 1 and 100');
      }

      // Get paginated links and total count
      const [links, total] = await Promise.all([
        Link.findAllPaginated(page, limit),
        Link.getTotalCount()
      ]);

      // Calculate pagination metadata
      const totalPages = Math.ceil(total / limit);
      const pagination = {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      };

      return sendPaginated(res, links, pagination);
    } else {
      // Return all links in simple array format (for automated testing compatibility)
      const links = await Link.findAll();
      return res.status(200).json(links);
    }
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
      return sendError(res, 404, 'Link not found');
    }

    return sendSuccess(res, 200, link, 'Link stats retrieved successfully');
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
      return sendError(res, 404, 'Link not found');
    }

    return sendSuccess(res, 200, link, 'Link deleted successfully');
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

