const { getRepository } = require('typeorm');
const { Software, Request } = require('../entities');

// Get all software
const getAllSoftware = async (req, res) => {
  try {
    const softwareRepository = getRepository(Software);
    const software = await softwareRepository.find();
    
    // Return empty array instead of null if no software found
    return res.status(200).json(software || []);
  } catch (error) {
    console.error('Error fetching software:', error);
    return res.status(500).json({ message: 'Server error while fetching software' });
  }
};

// Create new software
const createSoftware = async (req, res) => {
  try {
    const { name, description } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: 'Software name is required' });
    }
    
    const softwareRepository = getRepository(Software);
    
    // Check if software with the same name already exists
    const existingSoftware = await softwareRepository.findOne({ where: { name } });
    if (existingSoftware) {
      return res.status(400).json({ message: 'Software with this name already exists' });
    }
    
    // Default access levels if not provided
    const defaultAccessLevels = ['Read', 'Write', 'Admin'];
    
    const newSoftware = softwareRepository.create({
      name,
      description: description || '',
      accessLevels: JSON.stringify(defaultAccessLevels) // Add this field with default values
    });
    
    await softwareRepository.save(newSoftware);
    return res.status(201).json(newSoftware);
  } catch (error) {
    console.error('Error creating software:', error);
    return res.status(500).json({ message: 'Server error while creating software', error: error.message });
  }
};

// Get software by ID
const getSoftwareById = async (req, res) => {
  try {
    const { id } = req.params;
    const softwareRepository = getRepository(Software);
    
    const software = await softwareRepository.findOne({ where: { id } });
    
    if (!software) {
      return res.status(404).json({ message: 'Software not found' });
    }
    
    return res.status(200).json(software);
  } catch (error) {
    console.error('Error fetching software by ID:', error);
    return res.status(500).json({ message: 'Server error while fetching software' });
  }
};

// Update software
const updateSoftware = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, accessLevels } = req.body;
    
    // Find the software to update first
    const softwareRepository = getRepository(Software);
    const software = await softwareRepository.findOne({ 
      where: { id }
    });
    
    if (!software) {
      return res.status(404).json({ message: 'Software not found' });
    }
    
    // Only allow employees with Write access or admins to update
    if (req.user.role !== 'Admin') {
      // Find if the user has an approved Write access request
      const requestRepository = getRepository(Request);
      const hasWriteAccess = await requestRepository.findOne({
        where: {
          user: { id: req.user.id },
          software: { id },
          accessType: 'Write',
          status: 'Approved'
        }
      });
      
      if (!hasWriteAccess) {
        return res.status(403).json({ message: 'You do not have Write access to this software' });
      }
    }
    
    // Update the software
    software.name = name || software.name;
    software.description = description !== undefined ? description : software.description;
    
    // Handle accessLevels
    if (accessLevels && accessLevels.length > 0) {
      // Only admin can change access levels
      if (req.user.role === 'Admin') {
        software.accessLevels = JSON.stringify(accessLevels);
      }
    }
    
    // Save the updated software
    await softwareRepository.save(software);
    
    return res.status(200).json(software);
  } catch (error) {
    console.error('Error updating software:', error);
    return res.status(500).json({ message: 'Error updating software', error: error.message });
  }
};

module.exports = {
  getAllSoftware,
  createSoftware,
  getSoftwareById,
  updateSoftware
};
