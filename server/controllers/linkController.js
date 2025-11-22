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
      // Check if custom code already exists (codes must be globally unique)
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
    const hasPagination = req.query.page || req.query.limit || req.query.start !== undefined;
    
    if (hasPagination) {
      const limit = parseInt(req.query.limit) || 10;
      
      // Validate limit
      if (limit < 1 || limit > 100) {
        return sendError(res, 400, 'Limit must be between 1 and 100');
      }

      let links, total, pagination;

      if (req.query.start !== undefined) {
        // Offset-based pagination (start parameter)
        // First page: start=0 (entries 1-10)
        // Second page: start=10 (entries 11-20)
        // Third page: start=20 (entries 21-30)
        const start = parseInt(req.query.start) || 0;
        
        if (start < 0) {
          return sendError(res, 400, 'Start must be greater than or equal to 0');
        }

        // Get paginated links and total count
        [links, total] = await Promise.all([
          Link.findAllWithOffset(start, limit),
          Link.getTotalCount()
        ]);

        // Calculate pagination metadata
        const nextStart = start + limit;
        const prevStart = start - limit;
        const hasNext = nextStart < total;
        const hasPrev = start > 0;
        const currentPage = Math.floor(start / limit) + 1;
        const totalPages = Math.ceil(total / limit);

        pagination = {
          start,
          limit,
          total,
          currentPage,
          totalPages,
          nextStart: hasNext ? nextStart : null,
          prevStart: hasPrev ? prevStart : null,
          hasNext,
          hasPrev,
          // Entry range info
          from: total > 0 ? start + 1 : 0,
          to: Math.min(start + limit, total)
        };
      } else if (req.query.page) {
        // Page-based pagination (page parameter)
        // Page 1: entries 1-10 (start=0)
        // Page 2: entries 11-20 (start=10)
        const page = parseInt(req.query.page) || 1;
        
        if (page < 1) {
          return sendError(res, 400, 'Page must be greater than 0');
        }

        const start = (page - 1) * limit;

        // Get paginated links and total count
        [links, total] = await Promise.all([
          Link.findAllWithOffset(start, limit),
          Link.getTotalCount()
        ]);

        // Calculate pagination metadata
        const totalPages = Math.ceil(total / limit);
        const nextStart = page < totalPages ? start + limit : null;
        const prevStart = page > 1 ? start - limit : null;

        pagination = {
          page,
          start,
          limit,
          total,
          totalPages,
          nextStart,
          prevStart,
          hasNext: page < totalPages,
          hasPrev: page > 1,
          // Entry range info
          from: total > 0 ? start + 1 : 0,
          to: Math.min(start + limit, total)
        };
      } else {
        // Only limit provided, start from 0
        const start = 0;
        [links, total] = await Promise.all([
          Link.findAllWithOffset(start, limit),
          Link.getTotalCount()
        ]);

        const nextStart = limit < total ? limit : null;
        pagination = {
          start: 0,
          limit,
          total,
          currentPage: 1,
          totalPages: Math.ceil(total / limit),
          nextStart,
          prevStart: null,
          hasNext: limit < total,
          hasPrev: false,
          from: total > 0 ? 1 : 0,
          to: Math.min(limit, total)
        };
      }

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
    console.log(`[REDIRECT] Processing redirect for code: ${code}`);
    
    // Find link first
    const link = await Link.findByCode(code);
    console.log(`[REDIRECT] Link found:`, link ? `ID: ${link.id}, URL: ${link.target_url}, Current clicks: ${link.total_clicks}` : 'NOT FOUND');

    if (!link) {
      console.log(`[REDIRECT] Link not found for code: ${code}`);
      return res.status(404).json({ error: 'Link not found' });
    }

    // CRITICAL: Increment click count BEFORE redirect
    // Use await to ensure database update completes
    console.log(`[REDIRECT] Attempting to increment click count for code: ${code}`);
    const updatedLink = await Link.incrementClick(code);
    
    if (updatedLink) {
      console.log(`[REDIRECT] Successfully updated - Code: ${code}, New count: ${updatedLink.total_clicks}, Last clicked: ${updatedLink.last_clicked}`);
    } else {
      console.error(`[REDIRECT] Failed to update click count for code: ${code}`);
    }
    
    // Perform 302 redirect AFTER update completes
    console.log(`[REDIRECT] Redirecting to: ${link.target_url}`);
    return res.redirect(302, link.target_url);
  } catch (error) {
    console.error('[REDIRECT] Error in redirectLink:', error);
    console.error('[REDIRECT] Error stack:', error.stack);
    // If error occurs, try to get link and redirect anyway
    try {
      const { code } = req.params;
      const link = await Link.findByCode(code);
      if (link && link.target_url) {
        console.log(`[REDIRECT] Error occurred but redirecting anyway to: ${link.target_url}`);
        return res.redirect(302, link.target_url);
      }
    } catch (err) {
      console.error('[REDIRECT] Secondary error:', err);
    }
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

