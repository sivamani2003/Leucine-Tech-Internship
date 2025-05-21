const jwt = require('jsonwebtoken');
const { getRepository } = require('typeorm');
const { User } = require('../entities');

const SECRET_KEY = process.env.JWT_SECRET
