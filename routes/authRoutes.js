const express = require('express');
const { body } = require('express-validator');
const { register, login, logout, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const h = require('../middleware/asyncHandler');

const router = express.Router();

router.post('/register', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('username').isLength({ min: 3 }).withMessage('Username min 3 chars'),
  body('email').isEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password min 6 chars'),
], h(register));

router.post('/login', [body('email').isEmail(), body('password').notEmpty()], h(login));
router.post('/logout', h(logout));
router.get('/me', protect, h(getMe));

module.exports = router;
