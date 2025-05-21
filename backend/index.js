const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { createConnection } = require('typeorm');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const { getRepository } = require('typeorm');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5002;

// Middleware


const allowedOrigins = [
  'https://leucine-tech-internship.vercel.app',
  'http://localhost:5173' 
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(bodyParser.json());

// Database Connection
createConnection({
  type: 'sqlite',
  database: 'database.sqlite',
  entities: [
    require('./entities').User,
    require('./entities').Software,
    require('./entities').Request
  ],
  synchronize: true,
})
.then(() => {
  console.log('Connected to database');
  
  
  const { User, Software, Request } = require('./entities');
  

  const authController = require('./controllers/authController');
  const softwareController = require('./controllers/softwareController');
  const requestController = require('./controllers/requestController');
  
  const SECRET_KEY = process.env.JWT_SECRET || 'default-secret-key';
  
  const authenticate = async (req, res, next) => {
    try {
     
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      const token = authHeader.split(' ')[1];
     
      const decoded = jwt.verify(token, SECRET_KEY);
      
     
      const userRepository = getRepository(User);

      const user = await userRepository.findOne({ 
        where: { id: decoded.id }
      });
      
      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }
      
      req.user = user;
      next();
    } catch (error) {
      console.error('Authentication error:', error);
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
  };

  const authorize = (roles) => {
    return (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      const allowedRoles = Array.isArray(roles) ? roles : [roles];
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ message: 'Access forbidden' });
      }

      next();
    };
  };

  // Auth Routes
  app.post('/api/auth/signup', authController.register);
  app.post('/api/auth/login', authController.login);

  // Software Routes
  app.get('/api/software', authenticate, softwareController.getAllSoftware);
  app.post('/api/software', authenticate, authorize('Admin'), softwareController.createSoftware);
  app.get('/api/software/:id', authenticate, softwareController.getSoftwareById);
  app.patch('/api/software/:id', authenticate, softwareController.updateSoftware);

  // Request Routes
  app.get('/api/requests', authenticate, authorize(['Admin', 'Manager']), requestController.getAllRequests);
  app.get('/api/requests/my-requests', authenticate, requestController.getUserRequests);
  app.post('/api/requests', authenticate, authorize('Employee'), requestController.createRequest);
  app.patch('/api/requests/:id/status', authenticate, authorize(['Admin', 'Manager']), requestController.updateRequestStatus);
  app.get('/api/requests/:id', authenticate, requestController.getRequestById);

  app.use((err, req, res, next) => {
    console.error('Global error handler:', err.stack);
    res.status(500).send({ message: 'Something went wrong!', error: err.message });
  });

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
})
.catch((error) => {
  console.error('Error connecting to database:', error);
});
