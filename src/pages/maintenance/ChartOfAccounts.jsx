import React, { useState, useEffect } from "react";
import axios from 'axios';

const ChartOfAccounts = () => {
  //Modal
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showSubClassModal, setShowSubClassModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedSubClass, setSelectedSubClass] = useState(null);
  const [accountHeaders, setAccountHeaders] = useState([]);
  const [accountSubClasses, setAccountSubClasses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const api = axios.create({
    baseURL: 'http://127.0.0.1:8000/api',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  });

  //Accountheader
  const [formData, setFormData] = useState({
    id: '',
    description: '',
    hsno: ''
  });

  //Accountsub
  const [subClassFormData, setSubClassFormData] = useState({
    id: '',
    haccountid: '',
    subtitle: '',
    subsequenceno: ''
  });

  //Add Accounts-Accounttitle
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [accountFormData, setAccountFormData] = useState({
    id: '',
    saccountid: '',
    title: '',
    description: '',
    tsequenceno: '',
    chartno: ''
  });

  const handleAccountInputChange = (e) => {
    const { name, value } = e.target;
    setAccountFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  //Accounttitle submit
  const handleAccountSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      const accountsResponse = await api.get('/account-titles');
      const existingAccounts = accountsResponse.data;
      
      const subClassAccounts = existingAccounts.filter(
        acc => String(acc.saccountid) === String(accountFormData.saccountid)
      );
      
      const highestAccount = subClassAccounts.reduce((max, acc) => {
        const currentNum = parseInt(acc.chartno.substring(2));
        return currentNum > max ? currentNum : max;
      }, 0);
      
      const refNum = selectedSubClass.subsequenceno.toString().padStart(2, '0');
      const newAccountNum = `${refNum}${(highestAccount + 1).toString().padStart(3, '0')}`;
      
      const accountData = {
        ...accountFormData,
        chartno: newAccountNum,
        tsequenceno: highestAccount + 1,
        haccountid: selectedSubClass.haccountid
      };

    const response = await api.post('/account-titles', accountData);
    
    const titlesResponse = await api.get('/account-titles');
    setAccountTitles(titlesResponse.data);
    
    alert('Account created successfully!');
    
    setShowAccountModal(false);
    setAccountFormData({
      id: '',
      saccountid: '',
      title: '',
      description: '',
      tsequenceno: '',
      chartno: ''
    });
    
  } catch (error) {
    console.error('Error saving account:', error);
    alert(`Failed to create account: ${error.response?.data?.message || error.message}`);
  } finally {
    setIsSaving(false);
  }
};

  const [accountTitles, setAccountTitles] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [headersResponse, subClassesResponse, titlesResponse] = await Promise.all([
          api.get('/account-headers'),
          api.get('/account-subs'),
          api.get('/account-titles')
        ]);
        
        setAccountHeaders(headersResponse.data);
        setAccountSubClasses(subClassesResponse.data);
        setAccountTitles(titlesResponse.data);
        
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const getAccountsForSubClass = (subClassId) => {
    return accountTitles
      .filter(account => String(account.saccountid) === String(subClassId))
      .sort((a, b) => a.tsequenceno - b.tsequenceno);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [headersResponse, subClassesResponse] = await Promise.all([
          api.get('/account-headers'),
          api.get('/account-subs')
        ]);
        setAccountHeaders(headersResponse.data);
        setAccountSubClasses(subClassesResponse.data);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openDropdownId && !event.target.closest('.dropdown-container')) {
        setOpenDropdownId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openDropdownId]);

  //Filtering
  const filteredHeaders = accountHeaders.filter(header => 
    header.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    accountSubClasses.some(
      sub => String(sub.haccountid) === String(header.id) && 
             sub.subtitle.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const getNextSequenceNumber = (accountClassId) => {

    const subClasses = accountSubClasses
      .filter(sub => String(sub.haccountid) === String(accountClassId))
      .sort((a, b) => a.subsequenceno - b.subsequenceno);
    
    if (subClasses.length === 0) return 1;
    
    const highestSeq = Math.max(...subClasses.map(sub => sub.subsequenceno));
    return highestSeq + 1;
  };

  const getSubClassesForHeader = (headerId) => {
    try {
      if (!accountSubClasses || !Array.isArray(accountSubClasses)) return [];
      
      return accountSubClasses
        .filter(sub => sub && String(sub.haccountid) === String(headerId))
        .sort((a, b) => {
          const seqA = Number(a?.subsequenceno) || 0;
          const seqB = Number(b?.subsequenceno) || 0;
          return seqA - seqB;
        });
    } catch (error) {
      console.error('Error in getSubClassesForHeader:', error);
      return [];
    }
  };
  
  const resetForm = () => {
    setFormData({
      id: '',
      description: '',
      hsno: ''
    });
    setIsEditMode(false);
  };

  const resetSubClassForm = () => {
    setSubClassFormData({
      id: '',
      haccountid: '',
      subtitle: '',
      subsequenceno: ''
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubClassInputChange = (e) => {
  const { name, value } = e.target;
  
  if (name === 'haccountid') {
    const nextSeq = getNextSequenceNumber(value);
    setSubClassFormData(prev => ({
      ...prev,
      [name]: value,
      subsequenceno: nextSeq
    }));
  } else {
    setSubClassFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (isEditMode) {
        await api.put(`/account-headers/${formData.id}`, formData);
        setAccountHeaders(accountHeaders.map(item => 
          item.id === formData.id ? formData : item
        ));
      } else {
        const response = await api.post('/account-headers', formData);
        setAccountHeaders([...accountHeaders, response.data]);
      }
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Error saving account header:', error);
      alert(`Failed to ${isEditMode ? 'update' : 'create'} account class`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubClassSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (isEditMode) {
        await api.put(`/account-subs/${subClassFormData.id}`, {
          haccountid: subClassFormData.haccountid,
          subtitle: subClassFormData.subtitle,
          subsequenceno: Number(subClassFormData.subsequenceno)
        });
        
        setAccountSubClasses(accountSubClasses.map(item => 
          item.id === subClassFormData.id ? {
            ...item,
            subtitle: subClassFormData.subtitle,
            subsequenceno: subClassFormData.subsequenceno
          } : item
        ));
      } else {
        const response = await api.post('/account-subs', {
          haccountid: subClassFormData.haccountid,
          subtitle: subClassFormData.subtitle,
          subsequenceno: Number(subClassFormData.subsequenceno)
        });

        const newSubClass = {
          ...response.data,
          id: response.data.id || Date.now(),
          haccountid: subClassFormData.haccountid,
          subtitle: subClassFormData.subtitle,
          subsequenceno: subClassFormData.subsequenceno
        };

        setAccountSubClasses(prev => [...prev, newSubClass]);
      }
      
      setShowSubClassModal(false);
      resetSubClassForm();
      setIsEditMode(false);
    } catch (error) {
      console.error('Error saving sub-class:', error);
      alert(`Failed to ${isEditMode ? 'update' : 'create'} sub-class: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

const fetchAccountTitles = async () => {
  try {
    const response = await api.get('/account-titles');

  } catch (error) {
    console.error('Error fetching account titles:', error);
  }
};
    //Dropdown for sub class
    const DropdownMenu = ({ subClassId, onClose, onEdit, onAddAccounts }) => {
    return (
      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
        <div className="py-1">
          <button
            onClick={() => {
              onEdit();
              onClose();
            }}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            Edit Sub-Account
          </button>
          <button
            onClick={() => {
              onAddAccounts();
              onClose();
            }}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            Add Accounts
          </button>
        </div>
      </div>
    );
  };

  const TableSkeleton = () => (
    <>
      {[...Array(5)].map((_, i) => (
        <tr key={i} className="animate-pulse">
          <td className="p-3"><div className="h-4 bg-gray-200 rounded"></div></td>
          <td className="p-3"><div className="h-4 bg-gray-200 rounded"></div></td>
          <td className="p-3"><div className="h-4 bg-gray-200 rounded"></div></td>
          <td className="p-3"><div className="h-4 bg-gray-200 rounded"></div></td>
        </tr>
      ))}
    </>
  );


  return (
    <div className="p-8 bg-gray-100 min-h-screen font-sans">
      <div className="dropdown-container">
        <style>{`
          .dropdown-container {
            position: relative;
            display: inline-flex;
            align-items: center;
            gap: 8px;
          }

          .class-row td {
            color: #008080 !important;
            font-weight: 700 !important;
          }

          .subclass-row td:nth-child(2) {
            color: #008B8B !important;
            font-weight: 500 !important;
          }

          .account-row td:nth-child(3),
          .account-row td:nth-child(4) {
            color: #2F4F4F !important;
            font-weight: 400 !important;
          }
        `}</style>
      </div>
      <header className="mb-6 border-b pb-4">
        <h1 className="text-2xl md:text-3xl font-semibold text-gray-800 tracking-tight">
          Chart of Accounts
        </h1>
        <p className="text-sm text-gray-600 font-medium">Southseas Cargo - Maintenance</p>
      </header>

      <div className="p-6 bg-gray-100 min-h-screen">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
          <div className="w-full md:w-auto">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search Account Title:
            </label>
            <input
              type="text"
              placeholder="Search Account Title"
              className="w-full md:w-64 px-4 py-2 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 font-normal"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex space-x-2 w-full md:w-auto justify-end">
            <button
              onClick={() => {
                resetForm();
                setShowModal(true);
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
              Create Class
            </button>
            <button
              onClick={() => {
                resetSubClassForm();
                setShowSubClassModal(true);
              }}
              className="
                inline-flex items-center gap-2
                bg-gradient-to-r from-blue-500 to-indigo-600
                hover:from-blue-600 hover:to-indigo-700
                text-white font-medium
                px-6 py-3 rounded-lg
                shadow-md hover:shadow-lg
                transition-all duration-200
                focus:outline-none focus:ring-4 focus:ring-indigo-300
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
              Create Sub Class
            </button>
          </div>
        </div>

        {error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error! </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        ) : (
          <>
            {/* Account Sub-Classes Table */}
            <div className="overflow-x-auto bg-white shadow-md rounded-lg">
              <table className="min-w-full text-sm text-left">
                <thead className="bg-gray-200 text-gray-700 uppercase tracking-wider">
                  <tr>
                    <th className="p-3 font-medium">Class</th>
                    <th className="p-3 font-medium">Sub Class</th>
                    <th className="p-3 font-medium">Accounts</th>
                    <th className="p-3 font-medium">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                  <TableSkeleton />
                ) : filteredHeaders.length > 0 ? (
                  filteredHeaders.map((header) => {
                    const subClasses = getSubClassesForHeader(header.id);

                    return (
                      <React.Fragment key={header.id}>
                        {/* Class Header Row */}
                        <tr className="class-row">
                          <td className="p-3 font-medium">
                            {header.description}
                          </td>
                          <td className="p-3"></td>
                          <td className="p-3"></td>
                          <td className="p-3"></td>
                        </tr>
                        
                        {/* Sub Classes and their Accounts */}
                        {subClasses.map((subClass) => {
                          const accounts = getAccountsForSubClass(subClass.id);
                          
                          return (
                            <React.Fragment key={subClass.id}>
                              {/* Sub Class Row */}
                              <tr className="subclass-row hover:bg-gray-50 relative">
                                <td className="p-3"></td>
                                <td className="p-3 flex justify-between items-center dropdown-container">
                                  {subClass.subtitle}
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setOpenDropdownId(openDropdownId === subClass.id ? null : subClass.id);
                                    }}
                                    className="text-gray-500 hover:text-gray-700 focus:outline-none flex items-center"
                                  >
                                    <svg 
                                      className={`h-4 w-4 transition-transform duration-200 ${openDropdownId === subClass.id ? 'transform rotate-180' : ''}`}
                                      fill="none" 
                                      viewBox="0 0 24 24" 
                                      stroke="currentColor"
                                    >
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                  </button>
                                  {openDropdownId === subClass.id && (
                                    <DropdownMenu
                                      subClassId={subClass.id}
                                      onClose={() => setOpenDropdownId(null)}
                                      onEdit={() => {
                                        setSelectedSubClass(subClass);
                                        setSubClassFormData({
                                          id: subClass.id,
                                          haccountid: subClass.haccountid,
                                          subtitle: subClass.subtitle,
                                          subsequenceno: subClass.subsequenceno
                                        });
                                        setIsEditMode(true);
                                        setShowSubClassModal(true);
                                      }}
                                      onAddAccounts={() => {
                                        setSelectedSubClass(subClass);
                                        setAccountFormData({
                                          ...accountFormData,
                                          saccountid: subClass.id
                                        });
                                        setShowAccountModal(true);
                                      }}
                                    />
                                  )}
                                  </td>
                                    <td className="p-3"></td>
                                    <td className="p-3"></td>
                                  </tr>
                              
                              {/* Accounts for this Sub Class */}
                              {accounts.map((account) => (
                                    <tr key={account.id} className="account-row hover:bg-gray-50">
                                    <td className="p-3"></td>
                                    <td className="p-3"></td>
                                    <td className="p-3 font-medium">
                                      ({account.chartno}) {account.title}
                                    </td>
                                    <td className="p-3">
                                      {account.description}
                                    </td>
                                  </tr>
                                ))}
                            </React.Fragment>
                          );
                        })}
                      </React.Fragment>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="4" className="p-4 text-center text-gray-500">
                      No matching accounts found.
                    </td>
                  </tr>
                )}
              </tbody>
              </table>
            </div>
          </>
        )}

        {/* Account Class Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 relative">
              <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-2 tracking-tight">
                {isEditMode ? "Update Account Class" : "Add Account Class"}
              </h2>
              
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    name="description"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none text-gray-700 font-normal"
                    placeholder="Account class description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    HSNO
                  </label>
                  <input
                    type="number"
                    name="hsno"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none text-gray-700 font-normal"
                    placeholder="12345"
                    value={formData.hsno}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      resetForm();
                      setShowModal(false);
                    }}
                    disabled={isSaving}
                    className="px-5 py-2.5 rounded-lg bg-red-500 text-white hover:bg-red-600 font-medium shadow-sm transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-red-400 text-sm disabled:opacity-70"
                  >
                    Discard
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className={`px-6 py-2.5 rounded-lg text-white font-medium shadow-md hover:shadow-lg transition-all duration-150 focus:outline-none focus:ring-4 text-sm disabled:opacity-70 ${
                      isEditMode
                        ? "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 focus:ring-indigo-400"
                        : "bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 focus:ring-emerald-400"
                    }`}
                  >
                    {isSaving ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {isEditMode ? "Updating..." : "Saving..."}
                      </span>
                    ) : isEditMode ? "Update" : "Save"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

   {showAccountModal && (
      <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 relative">
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-2 tracking-tight">
            {isEditMode ? "Edit Account" : "Add Account"}
          </h2>
          
          <form onSubmit={handleAccountSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Account Class:
              </label>
              <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700">
                {selectedSubClass && accountHeaders.find(header => header.id === selectedSubClass.haccountid)?.description}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sub Class:
              </label>
              <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700">
                {selectedSubClass?.subtitle}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Account #:
              </label>
              <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700">
                {selectedSubClass?.subsequenceno.toString().padStart(2, '0')}XXX
                <span className="text-sm text-gray-500 ml-2">(Will be auto-generated as {selectedSubClass?.subsequenceno.toString().padStart(2, '0')}001, {selectedSubClass?.subsequenceno.toString().padStart(2, '0')}002, etc.)</span>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Account Title:
              </label>
              <input
                type="text"
                name="title"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none text-gray-700 font-normal"
                placeholder="e.g. Cash on Hand"
                value={accountFormData.title}
                onChange={handleAccountInputChange}
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description:
              </label>
              <textarea
                name="description"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none text-gray-700 font-normal"
                placeholder="e.g. Cash on hand at a particular time / undeposited"
                value={accountFormData.description}
                onChange={handleAccountInputChange}
                required
                rows={3}
              />
            </div>

            <input
              type="hidden"
              name="tsequenceno"
              value={accountFormData.tsequenceno}
            />

            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={() => {
                  setAccountFormData({
                    id: '',
                    saccountid: '',
                    title: '',
                    description: '',
                    tsequenceno: '',
                    chartno: ''
                  });
                  setShowAccountModal(false);
                }}
                disabled={isSaving}
                className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium shadow-sm transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-gray-400 text-sm disabled:opacity-70"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium shadow-md hover:shadow-lg transition-all duration-150 focus:outline-none focus:ring-4 focus:ring-indigo-400 text-sm disabled:opacity-70"
              >
                {isSaving ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </span>
                ) : "Save Account"}
              </button>
            </div>
          </form>
        </div>
      </div>
    )}

        {/* Sub Class Modal */}
        {showSubClassModal && (
      <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 relative">
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-2 tracking-tight">
            {isEditMode ? "Edit Sub Class" : "Add Sub Class"}
          </h2>
          
          <form onSubmit={handleSubClassSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Account Class:
              </label>
              <select
                name="haccountid"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none text-gray-700 font-normal"
                value={subClassFormData.haccountid}
                onChange={handleSubClassInputChange}
                required
                disabled={isEditMode}
              >
                <option value="">Select Account Class</option>
                {accountHeaders.map((header) => (
                  <option key={header.id} value={header.id}>
                    {header.description}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reference #:
              </label>
              <input
                type="number"
                name="subsequenceno"
                className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none text-gray-700 font-normal ${
                  isEditMode ? "bg-gray-100 cursor-not-allowed" : ""
                }`}
                value={subClassFormData.subsequenceno}
                onChange={handleSubClassInputChange}
                required
                readOnly={isEditMode} 
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description:
              </label>
              <input
                type="text"
                name="subtitle"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none text-gray-700 font-normal"
                placeholder="Enter Description"
                value={subClassFormData.subtitle}
                onChange={handleSubClassInputChange}
                required
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  resetSubClassForm();
                  setShowSubClassModal(false);
                  setIsEditMode(false);
                }}
                disabled={isSaving}
                className="px-5 py-2.5 rounded-lg bg-red-500 text-white hover:bg-red-600 font-medium shadow-sm transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-red-400 text-sm disabled:opacity-70"
              >
                Discard
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium shadow-md hover:shadow-lg transition-all duration-150 focus:outline-none focus:ring-4 focus:ring-indigo-400 text-sm disabled:opacity-70"
              >
                {isSaving ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    {isEditMode ? "Updating..." : "Saving..."}
                  </span>
                ) : isEditMode ? "Update Sub Class" : "Save Sub Class"}
              </button>
            </div>
          </form>
        </div>
      </div>
    )}
      </div>
    </div>
  );
};

export default ChartOfAccounts;