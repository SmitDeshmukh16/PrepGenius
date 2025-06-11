import Company from '../models/Company.js';

// Create a new company
export const createCompany = async (req, res) => {
  try {
    const company = new Company({
      ...req.body,
      createdBy: req.userId
    });
    await company.save();
    res.status(201).json(company);
  } catch (error) {
    res.status(500).json({ message: 'Error creating company', error: error.message });
  }
};

// Get companies by month and year
export const getCompaniesByMonth = async (req, res) => {
  try {
    const { month, year } = req.query;

    // Query the database to find companies that match the provided month and year
    const companies = await Company.find({
      month: month,
      year: parseInt(year), // Ensure the year is parsed as a number
    }).sort({ presentationDate: 1 }); // Sort by presentationDate or any field you prefer

    if (companies.length === 0) {
      return res.status(404).json({ message: 'No companies found for the given month and year' });
    }

    res.json(companies);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching companies', error: error.message });
  }
};


// Update company
export const updateCompany = async (req, res) => {
  try {
    const { companyId } = req.params;
    const company = await Company.findByIdAndUpdate(
      companyId,
      req.body,
      { new: true }
    );
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }
    res.json(company);
  } catch (error) {
    res.status(500).json({ message: 'Error updating company', error: error.message });
  }
};

// Delete company
export const deleteCompany = async (req, res) => {
  try {
    const { companyId } = req.params;
    await Company.findByIdAndDelete(companyId);
    res.json({ message: 'Company deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting company', error: error.message });
  }
};