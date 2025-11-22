const express = require('express');
const router = express.Router();
const linkController = require('../controllers/linkController');
const { validateCodeParam } = require('../middleware/validation');

// Health check endpoint
router.get('/healthz', (req, res) => {
  res.status(200).json({
    ok: true,
    version: '1.0',
    timestamp: new Date().toISOString()
  });
});

// Stats page endpoint - /code/:code
router.get('/code/:code', validateCodeParam, linkController.getLinkStats);

// Redirect endpoint - must be last to catch all /:code routes
router.get('/:code', validateCodeParam, linkController.redirectLink);

module.exports = router;

