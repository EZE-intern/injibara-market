const bcrypt = require('bcryptjs');
const { findByEmail, create } = require('../models/userModel');
const generateToken = require('../utils/generateToken');

// @desc    Register a new user
const registerUser = async (req, res) => {
  try {
    const { full_name, email, password, phone, role } = req.body;

    // full_name, email, እና password ብቻ አስፈላጊ (required) እንዲሆኑ ማድረግ
    if (!full_name || !email || !password) {
      return res.status(400).json({ message: 'እባክዎ ሁሉንም አስፈላጊ መስኮች ይሙሉ' });
    }

    const userExists = await findByEmail(email); // 👈 UserModel.findByEmail ሳይሆን ቀጥታ findByEmail
    if (userExists) {
      return res.status(400).json({ message: 'በዚህ ኢሜይል የተመዘገበ ተጠቃሚ አለ' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const userRole = role || 'customer';

    const userId = await create({
      full_name,
      email,
      password: hashedPassword,
      role: userRole,
    });

    res.status(201).json({
      id: userId,
      full_name,
      email,
      role: userRole,
      token: generateToken(userId, userRole),
    });
  } catch (error) {
    res.status(500).json({ message: 'Registration error', error: error.message });
  }
};

// @desc    Login user
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'እባክዎ ኢሜይል እና የይለፍ ቃል ያስገቡ' });
    }

    const user = await findByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'የተሳሳተ ኢሜይል ወይም የይለፍ ቃል' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'የተሳሳተ ኢሜይል ወይም የይለፍ ቃል' });
    }

    res.json({
      id: user.id,
      name: user.full_name,
      email: user.email,
      role: user.role,
      token: generateToken(user.id, user.role),
    });
  } catch (error) {
    res.status(500).json({ message: 'Login error', error: error.message });
  }
};

module.exports = { registerUser, loginUser };
