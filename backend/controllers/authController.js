const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getRepository } = require('typeorm');
const { User } = require('../entities');

const SECRET_KEY = process.env.JWT_SECRET || 'default-secret-key';

// User registration
const register = async (req, res) => {
  try {
    const { username, password, role } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }
    
    // Validate role
    const validRoles = ['Employee', 'Manager', 'Admin'];
    if (role && !validRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role. Must be Employee, Manager, or Admin.' });
    }
    
    const userRepository = getRepository(User);
    
    // Check if user already exists
    const existingUser = await userRepository.findOne({ 
      where: { username } 
    });
    
    if (existingUser) {
      return res.status(409).json({ message: 'Username already exists' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create new user
    const newUser = userRepository.create({
      username,
      password: hashedPassword,
      role: role || 'Employee'
    });
    
    await userRepository.save(newUser);
    
    // Don't return the password
    const { password: _, ...userWithoutPassword } = newUser;
    
    return res.status(201).json({
      message: 'User registered successfully',
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Error registering user:', error);
    return res.status(500).json({ message: 'Error registering user', error: error.message });
  }
};

// User login
const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }
    
    const userRepository = getRepository(User);
    
    // Find user - explicitly specify the entity
    const user = await userRepository.findOne({ 
      where: { username } 
    });
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }
    
    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }
    
    // Generate JWT
    const token = jwt.sign(
      { id: user.id, role: user.role, username: user.username },
      SECRET_KEY,
      { expiresIn: '8h' }
    );
    
    // Don't return the password
    const { password: _, ...userWithoutPassword } = user;
    
    return res.json({
      message: 'Login successful',
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Error logging in:', error);
    return res.status(500).json({ message: 'Error logging in', error: error.message });
  }
};

module.exports = {
  register,
  login
};
