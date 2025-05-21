const { getRepository } = require('typeorm');
const { Request, Software, User } = require('../entities');

// Get all requests (Admin only)
const getAllRequests = async (req, res) => {
  try {
    const requestRepository = getRepository(Request);
    const requests = await requestRepository.find({ 
      relations: ['user', 'software'] 
    });
    
    return res.status(200).json(requests || []);
  } catch (error) {
    console.error('Error fetching requests:', error);
    return res.status(500).json({ message: 'Server error while fetching requests' });
  }
};

// Get user's requests
const getUserRequests = async (req, res) => {
  try {
    const userId = req.user.id;
    const requestRepository = getRepository(Request);
    
    const requests = await requestRepository.find({ 
      where: { user: { id: userId } },
      relations: ['software'] 
    });
    
    return res.status(200).json(requests || []);
  } catch (error) {
    console.error('Error fetching user requests:', error);
    return res.status(500).json({ message: 'Server error while fetching requests' });
  }
};

// Create new request
const createRequest = async (req, res) => {
  try {
    const { softwareId, accessType, reason } = req.body;
    const userId = req.user.id;
    
    if (!softwareId || !accessType || !reason) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    const softwareRepository = getRepository(Software);
    const software = await softwareRepository.findOne({ where: { id: softwareId } });
    
    if (!software) {
      return res.status(404).json({ message: 'Software not found' });
    }
    
    const requestRepository = getRepository(Request);
    
    // Check if user already has a pending request for this software
    const existingRequest = await requestRepository.findOne({
      where: {
        user: { id: userId },
        software: { id: softwareId },
        status: 'Pending'
      }
    });
    
    if (existingRequest) {
      return res.status(400).json({ message: 'You already have a pending request for this software' });
    }
    
    const newRequest = requestRepository.create({
      user: { id: userId },
      software: { id: softwareId },
      accessType,
      reason,
      status: 'Pending'
    });
    
    await requestRepository.save(newRequest);
    
    // Get the full request with relations for the response
    const savedRequest = await requestRepository.findOne({
      where: { id: newRequest.id },
      relations: ['software', 'user']
    });
    
    return res.status(201).json(savedRequest);
  } catch (error) {
    console.error('Error creating request:', error);
    return res.status(500).json({ message: 'Server error while creating request', error: error.message });
  }
};

// Update request status (Admin only)
const updateRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!status || !['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: 'Valid status required (Approved or Rejected)' });
    }
    
    const requestRepository = getRepository(Request);
    const request = await requestRepository.findOne({ 
      where: { id },
      relations: ['user', 'software']
    });
    
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }
    
    if (request.status !== 'Pending') {
      return res.status(400).json({ message: 'Only pending requests can be updated' });
    }
    
    request.status = status;
    await requestRepository.save(request);
    
    return res.status(200).json(request);
  } catch (error) {
    console.error('Error updating request status:', error);
    return res.status(500).json({ message: 'Server error while updating request status' });
  }
};

// Get request by ID
const getRequestById = async (req, res) => {
  try {
    const { id } = req.params;
    const requestRepository = getRepository(Request);
    
    const request = await requestRepository.findOne({ 
      where: { id },
      relations: ['user', 'software']
    });
    
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }
    
    // Only allow admins or the request owner to view the request
    if (req.user.role !== 'Admin' && req.user.role !== 'Manager' && request.user.id !== req.user.id) {
      return res.status(403).json({ message: 'You do not have permission to view this request' });
    }
    
    return res.status(200).json(request);
  } catch (error) {
    console.error('Error fetching request by ID:', error);
    return res.status(500).json({ message: 'Server error while fetching request' });
  }
};

module.exports = {
  getAllRequests,
  getUserRequests,
  createRequest,
  updateRequestStatus,
  getRequestById
};
