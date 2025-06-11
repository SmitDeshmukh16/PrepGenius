import axios from 'axios';
import { motion } from 'framer-motion';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Briefcase, Calendar, Download, Edit2, GraduationCap, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

function PlacementCalendar() {
  const [companies, setCompanies] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [editingCompany, setEditingCompany] = useState(null);
  const userRole = localStorage.getItem('userRole');
  const [formData, setFormData] = useState({
    name: '',
    month: '',
    year: new Date().getFullYear(),
    jobDescription: '',
    eligibilityCriteria: {
      cgpa: 0,
      backlog: 0,
      branches: []
    },
    ctc: 0,
    presentationDate: '',
    presentationTime: '',
    oaDate: '',
    oaTime: '',
    interviewDate: '',
    interviewTime: '',
  });

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const branches = [
    'Computer Science',
    'Information Technology',
    'ENTC',
    'AIDS',
    'ECE',
  ];

  useEffect(() => {
    if (selectedMonth && selectedYear) {
      fetchCompanies();
    }
  }, [selectedMonth, selectedYear]);

  const fetchCompanies = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:5000/api/companies?month=${selectedMonth}&year=${selectedYear}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCompanies(response.data);
    } catch (error) {
      toast.error('Failed to fetch companies');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (editingCompany) {
        await axios.put(
          `http://localhost:5000/api/companies/${editingCompany._id}`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success('Company updated successfully');
      } else {
        await axios.post(
          'http://localhost:5000/api/companies',
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success('Company added successfully');
      }
      setIsModalOpen(false);
      setEditingCompany(null);
      setFormData({
        name: '',
        month: '',
        year: new Date().getFullYear(),
        jobDescription: '',
        eligibilityCriteria: {
          cgpa: 0,
          backlog: 0,
          branches: []
        },
        ctc: 0,
        presentationDate: '',
        presentationTime: '',
        oaDate: '',
        oaTime: '',
        interviewDate: '',
        interviewTime: '',
      });
      fetchCompanies();
    } catch (error) {
      toast.error(editingCompany ? 'Failed to update company' : 'Failed to add company');
    }
  };

  const handleEdit = (company) => {
    setEditingCompany(company);
    setFormData({
      ...company,
      presentationDate: company.presentationDate || '',
      presentationTime: company.presentationTime || '',
      oaDate: company.oaDate || '',
      oaTime: company.oaTime || '',
      interviewDate: company.interviewDate || '',
      interviewTime: company.interviewTime || '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (companyId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `http://localhost:5000/api/companies/${companyId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Company deleted successfully');
      fetchCompanies();
    } catch (error) {
      toast.error('Failed to delete company');
    }
  };

  const exportToPDF = () => {
    const input = document.getElementById('companies-container');
    html2canvas(input).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF();
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('placement-calendar.pdf');
    });
  };
  return (
    <div className="p-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap justify-between items-center gap-4 mb-8"
      >
        <h1 className="text-4xl font-bold">Placement Calendar</h1>
        
        <div className="flex gap-4">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-4 py-2 bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Month</option>
            {months.map(month => (
              <option key={month} value={month}>{month}</option>
            ))}
          </select>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="px-4 py-2 bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {[...Array(5)].map((_, i) => {
              const year = new Date().getFullYear() + i;
              return (
                <option key={year} value={year}>{year}</option>
              );
            })}
          </select>

          {userRole === 'enterprise' && (
            <button
              onClick={() => {
                setEditingCompany(null);
                setFormData({
                  name: '',
                  month: selectedMonth,
                  year: selectedYear,
                  jobDescription: '',
                  eligibilityCriteria: {
                    cgpa: 0,
                    backlog: 0,
                    branches: []
                  },
                  ctc: 0,
                  presentationDate: '',
                  presentationTime: '',
                  oaDate: '',
                  oaTime: '',
                  interviewDate: '',
                  interviewTime: '',
                });
                setIsModalOpen(true);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Company
            </button>
          )}

          <button
            onClick={exportToPDF}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Download className="w-5 h-5" />
            Export PDF
          </button>
        </div>
      </motion.div>

      {selectedMonth && selectedYear ? (
        <div id="companies-container" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.map(company => (
            <motion.div
              key={company._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-800 rounded-xl p-6 hover:shadow-lg transition-all"
            >
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-semibold">{company.name}</h2>
                {userRole === 'enterprise' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(company)}
                      className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(company._id)}
                      className="p-2 hover:bg-red-500 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 text-gray-400">
                  <Calendar className="w-5 h-5" />
                  <div>
                    <p>Presentation: {new Date(company.presentationDate).toLocaleDateString()} {company.presentationTime}</p>
                    <p>Presentation: {company.presentationDate} {company.presentationTime}</p>
                    <p>OA: {company.oaDate} {company.oaTime}</p>
                    <p>Interview: {company.interviewDate} {company.interviewTime}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-gray-400">
                  <Briefcase className="w-5 h-5" />
                  <span>CTC: ₹{company.ctc} LPA</span>
                </div>

                <div className="flex items-center gap-2 text-gray-400">
                  <GraduationCap className="w-5 h-5" />
                  <div>
                    <p>Min CGPA: {company.eligibilityCriteria.cgpa}</p>
                    <p>Max Backlogs: {company.eligibilityCriteria.backlog}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-2">Eligible Branches</h3>
                  <div className="flex flex-wrap gap-2">
                    {company.eligibilityCriteria.branches.map(branch => (
                      <span
                        key={branch}
                        className="px-2 py-1 bg-gray-700 rounded-full text-xs"
                      >
                        {branch}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-400">
          Please select a month and year to view companies
        </div>
      )}

      {/* Create/Edit Company Modal */}
      {isModalOpen && userRole === 'enterprise' && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800 rounded-xl max-w-md w-full p-6"
          >
            <h2 className="text-2xl font-bold mb-6">
              {editingCompany ? 'Edit Company' : 'Add Company'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Company Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Job Description
                </label>
                <textarea
                  value={formData.jobDescription}
                  onChange={(e) => setFormData({ ...formData, jobDescription: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Minimum CGPA
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.eligibilityCriteria.cgpa}
                    onChange={(e) => setFormData({
                      ...formData,
                      eligibilityCriteria: {
                        ...formData.eligibilityCriteria,
                        cgpa: parseFloat(e.target.value)
                      }
                    })}
                    className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Maximum Backlogs
                  </label>
                  <input
                    type="number"
                    value={formData.eligibilityCriteria.backlog}
                    onChange={(e) => setFormData({
                      ...formData,
                      eligibilityCriteria: {
                        ...formData.eligibilityCriteria,
                        backlog: parseInt(e.target.value)
                      }
                    })}
                    className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Eligible Branches
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {branches.map(branch => (
                    <label key={branch} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.eligibilityCriteria.branches.includes(branch)}
                        onChange={(e) => {
                          const updatedBranches = e.target.checked
                            ? [...formData.eligibilityCriteria.branches, branch]
                            : formData.eligibilityCriteria.branches.filter(b => b !== branch);
                          setFormData({
                            ...formData,
                            eligibilityCriteria: {
                              ...formData.eligibilityCriteria,
                              branches: updatedBranches
                            }
                          });
                        }}
                        className="rounded bg-gray-700 border-gray-600 text-blue-500 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-300">{branch}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  CTC (in LPA)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.ctc}
                  onChange={(e) => setFormData({ ...formData, ctc: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Presentation Date
                  </label>
                  <input
                    type="date"
                    value={formData.presentationDate}
                    onChange={(e) => setFormData({ ...formData, presentationDate: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Presentation Time
                  </label>
                  <input
                    type="time"
                    value={formData.presentationTime}
                    onChange={(e) => setFormData({ ...formData, presentationTime: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    OA Date
                  </label>
                  <input
                    type="date"
                    value={formData.oaDate}
                    onChange={(e) => setFormData({ ...formData, oaDate: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    OA Time
                  </label>
                  <input
                    type="time"
                    value={formData.oaTime}
                    onChange={(e) => setFormData({ ...formData, oaTime: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Interview Date
                  </label>
                  <input
                    type="date"
                    value={formData.interviewDate}
                    onChange={(e) => setFormData({ ...formData, interviewDate: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Interview Time
                  </label>
                  <input
                    type="time"
                    value={formData.interviewTime}
                    onChange={(e) => setFormData({ ...formData, interviewTime: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingCompany ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default PlacementCalendar;