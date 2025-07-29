const express = require('express');

const { loginAdmin, verifyAdmin } = require('../controllers/auth');

const router = new express.Router();

router.post('/admin/login', loginAdmin);
router.get('/admin/verify', verifyAdmin);

module.exports = router;
