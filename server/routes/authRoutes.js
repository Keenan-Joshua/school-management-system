const express = require('express');
const router = express.Router();
const { verifyToken, verifyRole } = require('../middleware/authMiddleware');
const {
    register,
    checkSetupStatus,
    createUser,
    login,
    resetPassword,
    adminResetPassword,
    getAllUsers,
    deleteUser,
} = require('../controllers/authController');

router.post('/register', register);
router.get('/setup-status', checkSetupStatus);
router.post('/login', login);

router.use(verifyToken);

router.put('/admin-reset-password', verifyRole('administrator'), adminResetPassword);
router.put('/reset-password', resetPassword);
router.post('/users', verifyRole('administrator'), createUser);
router.get('/users', verifyRole('administrator'), getAllUsers);
router.delete('/users/:id', verifyRole('administrator'), deleteUser);

module.exports = router;