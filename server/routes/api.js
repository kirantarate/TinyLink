const express = require('express');
const router = express.Router();
const linkController = require('../controllers/linkController');
const { validateCreateLink, validateCodeParam } = require('../middleware/validation');

// POST /api/links - Create a new link
router.post('/links', validateCreateLink, linkController.createLink);

// GET /api/links - Get all links
router.get('/links', linkController.getAllLinks);

// GET /api/links/:code - Get link stats by code
router.get('/links/:code', validateCodeParam, linkController.getLinkStats);

// DELETE /api/links/:code - Delete link by code
router.delete('/links/:code', validateCodeParam, linkController.deleteLink);

module.exports = router;

