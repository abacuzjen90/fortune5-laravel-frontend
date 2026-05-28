import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';

const Supplier = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentSupplierId, setCurrentSupplierId] = useState(null);
  const [formData, setFormData] = useState({
    supplier_name: '',
    address: '',
    contact_person: '',
    contact_details: '',
    terms: '',
    tin: '',
    tax: '',
    emailaddress: ''
  });

  const [suppliers, setSuppliers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [status, setStatus] = useState('idle');

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.2 } },
    exit: { opacity: 0, scale: 0.9, transition: { duration: 0.1 } }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, itemsPerPage]);

  const fetchSuppliers = async () => {
    setStatus('loading');
    setIsLoading(true);
    try {
      const response = await axios.get('/api/suppliers');
      setSuppliers(response.data);
      setStatus('success');
    } catch (err) {
      setError(err.message);
      setStatus('error');
      toast.error(`Failed to fetch suppliers: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setIsLoading(true);
    try {
      if (isEditMode) {
        await axios.put(`/api/suppliers/${currentSupplierId}`, formData);
        toast.success('Supplier updated successfully');
      } else {
        await axios.post('/api/suppliers', formData);
        toast.success('Supplier added successfully');
      }
      fetchSuppliers();
      resetForm();
      setIsModalOpen(false);
      setStatus('success');
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message;
      setError(errorMsg);
      setStatus('error');
      toast.error(`Operation failed: ${errorMsg}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (supplier) => {
    setFormData({
      supplier_name: supplier.supplier_name,
      address: supplier.address,
      contact_person: supplier.contact_person || '',
      contact_details: supplier.contact_details || '',
      terms: supplier.terms || '',
      tin: supplier.tin || '',
      tax: supplier.tax || '',
      emailaddress: supplier.emailaddress || ''
    });
    setCurrentSupplierId(supplier.id);
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this supplier?')) {
      setStatus('loading');
      try {
        await axios.delete(`/api/suppliers/${id}`);
        toast.success('Supplier deleted successfully');
        fetchSuppliers();
        setStatus('success');
      } catch (err) {
        setStatus('error');
        toast.error(`Failed to delete supplier: ${err.message}`);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      supplier_name: '',
      address: '',
      contact_person: '',
      contact_details: '',
      terms: '',
      tin: '',
      tax: '',
      emailaddress: ''
    });
    setIsEditMode(false);
    setCurrentSupplierId(null);
  };

  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.supplier_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (supplier.contact_person && supplier.contact_person.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (supplier.tin && supplier.tin.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalSuppliers = filteredSuppliers.length;
  const totalPages = Math.ceil(totalSuppliers / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalSuppliers);
  const currentSuppliers = filteredSuppliers.slice(startIndex, endIndex);

  const goToPage = (page) => {
    if (page < 1) page = 1;
    else if (page > totalPages) page = totalPages;
    setCurrentPage(page);
  };

  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
      <div className="p-8 bg-gray-100 min-h-screen font-sans">
      <header className="mb-6 border-b pb-4">
        <h1 className="text-2xl md:text-3xl font-semibold text-gray-800 tracking-tight">Supplier Entry</h1>
        <p className="text-sm text-gray-600 font-medium">Southseas Cargo - Maintenance</p>
      </header>

      <div className="p-6 bg-gray-100 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex justify-between items-center mb-4 flex-wrap gap-7">
              <input
                type="text"
                placeholder="Search suppliers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-64 md:w-80 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-700 font-normal"
              />
              
              <div className="flex items-center gap-3 flex-wrap">
                <button
                  onClick={() => {
                    resetForm();
                    setIsModalOpen(true);
                  }}
                  className="
                    inline-flex items-center gap-2
                    bg-gradient-to-r from-teal-500 to-cyan-600
                    hover:from-teal-600 hover:to-cyan-700
                    text-white font-medium
                    px-6 py-3 rounded-lg
                    shadow-md hover:shadow-lg
                    transition-all duration-200
                    focus:outline-none focus:ring-4 focus:ring-cyan-300
                    active:scale-95
                    select-none
                    text-sm
                  "
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add New Supplier
                </button>
              </div>
            </div>

            <div className="mb-3 flex items-center justify-between flex-wrap gap-2">
              <div className="text-sm text-gray-700">
                <label htmlFor="itemsPerPage" className="mr-2 font-medium">Show</label>
                <select
                  id="itemsPerPage"
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(Number(e.target.value))}
                  className="border rounded px-2 py-1 text-gray-700"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                  <option value={500}>500</option>
                  <option value={1000}>1000</option>
                </select>
                <span className="ml-2">items per page</span>
              </div>
              <div className="text-sm text-gray-600">
                {totalSuppliers === 0 
                  ? "No suppliers to show"
                  : `Showing ${startIndex + 1} to ${endIndex} of ${totalSuppliers} suppliers`
                }
              </div>
            </div>

            <div className="overflow-auto rounded-lg shadow">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-200 text-gray-700 uppercase tracking-wider">
                  <tr className="text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    <th className="px-4 py-3">#</th>
                    <th className="px-4 py-3">NAME</th>
                    <th className="px-4 py-3">ADDRESS</th>
                    <th className="px-4 py-3">TIN NUMBER</th>
                    <th className="px-4 py-3 text-center">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {currentSuppliers.length ? (
                    currentSuppliers.map((supplier, i) => (
                      <tr key={supplier.id} className="hover:bg-gray-50 transition">
                        <td className="px-4 py-2 text-gray-700">{startIndex + i + 1}</td>
                        <td className="px-4 py-2 text-gray-800 font-medium">{supplier.supplier_name}</td>
                        <td className="px-4 py-2 text-gray-600">{supplier.address}</td>
                        <td className="px-4 py-2 text-gray-600">{supplier.tin}</td>

                        <td className="px-4 py-2 text-center">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => handleEdit(supplier)}
                              className="p-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-700 rounded-full transition"
                              title="Edit Supplier"
                            >
                              <FiEdit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(supplier.id)}
                              className="p-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-full transition"
                              title="Delete Supplier"
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="text-center py-6 text-gray-500">No suppliers found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="mt-4 flex justify-center items-center gap-2 flex-wrap">
                <button
                  onClick={() => goToPage(1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded border bg-gray-200 disabled:opacity-50 text-sm text-gray-700"
                >
                  First
                </button>
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded border bg-gray-200 disabled:opacity-50 text-sm text-gray-700"
                >
                  Prev
                </button>
                {pageNumbers.map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => goToPage(pageNum)}
                    className={`px-3 py-1 rounded border text-sm ${
                      pageNum === currentPage ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}
                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 rounded border bg-gray-200 disabled:opacity-50 text-sm text-gray-700"
                >
                  Next
                </button>
                <button
                  onClick={() => goToPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 rounded border bg-gray-200 disabled:opacity-50 text-sm text-gray-700"
                >
                  Last
                </button>
              </div>
            )}
          </div>
        </div>

        <AnimatePresence>
          {isModalOpen && (
            <motion.div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}>
              <motion.div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-3xl"
                variants={modalVariants}
                initial="hidden"
                animate="visible"
                exit="exit">
                <h3 className="text-xl font-semibold mb-4 text-gray-800 tracking-tight">
                  {isEditMode ? 'Edit Supplier' : 'Add Supplier'}
                </h3>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input 
                    name="supplier_name" 
                    placeholder="Supplier Name" 
                    value={formData.supplier_name} 
                    onChange={handleInputChange} 
                    required 
                    className="border px-4 py-2 rounded-md text-gray-700 focus:ring-2 focus:ring-blue-400 focus:outline-none" 
                  />
                  <input 
                    name="tin" 
                    placeholder="TIN" 
                    value={formData.tin} 
                    onChange={handleInputChange} 
                    className="border px-4 py-2 rounded-md text-gray-700 focus:ring-2 focus:ring-blue-400 focus:outline-none" 
                  />
                  <textarea 
                    name="address" 
                    placeholder="Address" 
                    value={formData.address} 
                    onChange={handleInputChange} 
                    required 
                    className="border px-4 py-2 rounded-md md:col-span-2 text-gray-700 focus:ring-2 focus:ring-blue-400 focus:outline-none" 
                  />
                  <input 
                    name="contact_person" 
                    placeholder="Contact Person" 
                    value={formData.contact_person} 
                    onChange={handleInputChange} 
                    className="border px-4 py-2 rounded-md text-gray-700 focus:ring-2 focus:ring-blue-400 focus:outline-none" 
                  />
                  <input 
                    name="contact_details" 
                    placeholder="Contact Details" 
                    value={formData.contact_details} 
                    onChange={handleInputChange} 
                    className="border px-4 py-2 rounded-md text-gray-700 focus:ring-2 focus:ring-blue-400 focus:outline-none" 
                  />
                  <input 
                    name="terms" 
                    placeholder="Terms" 
                    value={formData.terms} 
                    onChange={handleInputChange} 
                    className="border px-4 py-2 rounded-md text-gray-700 focus:ring-2 focus:ring-blue-400 focus:outline-none" 
                  />
                  <input 
                    name="tax" 
                    type="number" 
                    placeholder="Tax" 
                    value={formData.tax} 
                    onChange={handleInputChange} 
                    className="border px-4 py-2 rounded-md text-gray-700 focus:ring-2 focus:ring-blue-400 focus:outline-none" 
                  />
                  <input 
                    name="emailaddress" 
                    type="email" 
                    placeholder="Email Address" 
                    value={formData.emailaddress} 
                    onChange={handleInputChange} 
                    className="border px-4 py-2 rounded-md text-gray-700 focus:ring-2 focus:ring-blue-400 focus:outline-none" 
                  />
                  <div className="col-span-2 flex justify-end gap-3 mt-4">
                    <button 
                      type="button" 
                      onClick={() => { setIsModalOpen(false); resetForm(); }} 
                      className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      disabled={status === 'loading'} 
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                    >
                      {status === 'loading' ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Supplier;