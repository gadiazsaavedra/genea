const express = require('express');
const router = express.Router();
const eventsController = require('../controllers/events.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const multer = require('multer');

const upload = multer({ dest: 'uploads/' });

router.use(verifyToken);

router.get('/', eventsController.getAllEvents);
router.post('/', eventsController.createEvent);
router.post('/:eventId/photos', upload.array('photos'), eventsController.uploadEventPhotos);

module.exports = router;