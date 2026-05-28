import React, { useState, useEffect } from "react";

const VouchersPayable = () => {
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [lineItems, setLineItems] = useState([
    { 
      account: "", 
      description: "", 
      qty: 1, 
      price: 0, 
      amount: 0, 
      branch: "", 
      vatType: "VAT",
      vatAmount: 0
    },
  ]);

  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [poNumber, setPoNumber] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [remarks, setRemarks] = useState("");
  const [suppliers, setSuppliers] = useState([]);
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState({
    suppliers: true,
    vouchers: true
  });
  const [error, setError] = useState(null);
  const [saveLoading, setSaveLoading] = useState(false);

  // Fetch suppliers from API
  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const response = await fetch('/api/suppliers');
        if (!response.ok) {
          throw new Error('Failed to fetch suppliers');
        }
        const data = await response.json();
        setSuppliers(data);
        setLoading(prev => ({ ...prev, suppliers: false }));
      } catch (err) {
        setError(err.message);
        console.error('Error fetching suppliers:', err);
        setLoading(prev => ({ ...prev, suppliers: false }));
      }
    };

    fetchSuppliers();
  }, []);

  // Fetch vouchers from API
  useEffect(() => {
    const fetchVouchers = async () => {
      try {
        const response = await fetch('/api/payables');
        if (!response.ok) {
          throw new Error('Failed to fetch vouchers');
        }
        const data = await response.json();
        const formattedVouchers = data.map(voucher => ({
          id: voucher.id,
          apv: voucher.id.toString(),
          invoiceDate: new Date(voucher.invoice_date).toISOString().split('T')[0],
          dueDate: new Date(voucher.due_date).toISOString().split('T')[0],
          bill: voucher.invoice_number,
          supplier: voucher.supplier?.supplier_name || 'Unknown Supplier',
          amountDue: parseFloat(voucher.total || 0).toLocaleString('en-US', { minimumFractionDigits: 2 }),
          total: parseFloat(voucher.total || 0).toLocaleString('en-US', { minimumFractionDigits: 2 }),
          status: voucher.status === 'y' ? 'Approved' : 
                 voucher.status === 'n' ? 'Pending' :
                 voucher.status === 'a' ? 'Awaiting Approval' :
                 voucher.status === 'c' ? 'Cancelled' : 'On Hold'
        }));
        setVouchers(formattedVouchers);
        setLoading(prev => ({ ...prev, vouchers: false }));
      } catch (err) {
        setError(err.message);
        console.error('Error fetching vouchers:', err);
        setLoading(prev => ({ ...prev, vouchers: false }));
      }
    };

    fetchVouchers();
  }, []);

  const selectedSupplierData = suppliers.find(supplier => 
    supplier.supplier_name === selectedSupplier
  ) || {
    contact_details: "",
    address: "",
    contact_person: "",
    id: null
  };

  const updateLineItem = (index, field, value) => {
    const updatedItems = [...lineItems];
    updatedItems[index][field] = field === "qty" || field === "price" ? parseFloat(value) || 0 : value;
    
    // Calculate amount
    updatedItems[index].amount = parseFloat((updatedItems[index].qty * updatedItems[index].price).toFixed(2));
    
    // Calculate VAT amount if VAT type is selected
    if (field === "qty" || field === "price" || field === "vatType") {
      updatedItems[index].vatAmount = updatedItems[index].vatType === "VAT" ? 
        parseFloat((updatedItems[index].amount * 0.12).toFixed(2)) : 
        0;
    }
    
    setLineItems(updatedItems);
  };

  const toggleVatType = (index) => {
    const updatedItems = [...lineItems];
    updatedItems[index].vatType = updatedItems[index].vatType === "VAT" ? "Non-VAT" : "VAT";
    updatedItems[index].vatAmount = updatedItems[index].vatType === "VAT" ? 
      parseFloat((updatedItems[index].amount * 0.12).toFixed(2)) : 
      0;
    setLineItems(updatedItems);
  };

  const addLineItem = () => {
    setLineItems([...lineItems, { 
      account: "", 
      description: "", 
      qty: 1, 
      price: 0, 
      amount: 0, 
      branch: "", 
      vatType: "VAT",
      vatAmount: 0
    }]);
  };

  const removeLineItem = (index) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter((_, i) => i !== index));
    }
  };

  const calculateTotals = () => {
    const subtotal = lineItems.reduce((sum, item) => sum + (item.amount || 0), 0);
    const totalVat = lineItems.reduce((sum, item) => sum + (item.vatAmount || 0), 0);
    const totalAmountDue = subtotal + totalVat;
    
    return {
      subtotal: subtotal.toFixed(2),
      totalVat: totalVat.toFixed(2),
      totalAmountDue: totalAmountDue.toFixed(2)
    };
  }

  const { subtotal, totalVat, totalAmountDue } = calculateTotals();

  const handleSaveVoucher = async () => {
    setSaveLoading(true);
    try {
      const supplier = suppliers.find(s => s.supplier_name === selectedSupplier);
      if (!supplier) {
        throw new Error('Please select a valid supplier');
      }

      if (!invoiceNumber || !poNumber) {
        throw new Error('Invoice number and PO number are required');
      }

      if (lineItems.some(item => !item.account || !item.description || item.price <= 0)) {
        throw new Error('Please fill all line items with valid data');
      }

      const payload = {
        supplier_id: supplier.id,
        invoice_number: invoiceNumber,
        PO: poNumber,
        invoice_date: invoiceDate,
        due_date: dueDate,
        note: remarks,
        line_items: lineItems.map(item => ({
          account: item.account,
          description: item.description,
          qty: item.qty,
          price: item.price,
          vatType: item.vatType,
          branch: item.branch
        })),
      };

      const response = await fetch('/api/payables', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to save voucher');
      }

      const data = await response.json();
      
      // Refresh the vouchers list
      const vouchersResponse = await fetch('/api/payables');
      const vouchersData = await vouchersResponse.json();
      const formattedVouchers = vouchersData.map(voucher => ({
        id: voucher.id,
        apv: voucher.id.toString(),
        invoiceDate: new Date(voucher.invoice_date).toISOString().split('T')[0],
        dueDate: new Date(voucher.due_date).toISOString().split('T')[0],
        bill: voucher.invoice_number,
        supplier: voucher.supplier?.supplier_name || 'Unknown Supplier',
        amountDue: parseFloat(voucher.total || 0).toLocaleString('en-US', { minimumFractionDigits: 2 }),
        total: parseFloat(voucher.total || 0).toLocaleString('en-US', { minimumFractionDigits: 2 }),
        status: voucher.status === 'y' ? 'Approved' : 
               voucher.status === 'n' ? 'Pending' :
               voucher.status === 'a' ? 'Awaiting Approval' :
               voucher.status === 'c' ? 'Cancelled' : 'On Hold'
      }));
      setVouchers(formattedVouchers);

      // Reset form
      setLineItems([{ 
        account: "", 
        description: "", 
        qty: 1, 
        price: 0, 
        amount: 0, 
        branch: "", 
        vatType: "VAT",
        vatAmount: 0
      }]);
      setSelectedSupplier("");
      setPoNumber("");
      setInvoiceNumber("");
      setInvoiceDate(new Date().toISOString().split('T')[0]);
      setDueDate(new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
      setRemarks("");

      alert('Voucher saved successfully!');
      setShowModal(false);
    } catch (err) {
      alert(`Error: ${err.message}`);
      console.error('Error saving voucher:', err);
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading.suppliers || loading.vouchers) {
    return (
      <div className="p-8 flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-700">Loading Vouchers Payable...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
          <p className="font-bold">Error</p>
          <p>{error}</p>
          <button 
            onClick={() => setError(null)}
            className="mt-2 bg-red-500 text-white px-3 py-1 rounded text-sm"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-100 min-h-screen font-sans">
      <header className="mb-6 border-b pb-4">
        <h1 className="text-2xl md:text-3xl font-semibold text-gray-800 tracking-tight">Vouchers Payable</h1>
        <p className="text-sm text-gray-600 font-medium">Southseas Cargo - Accounting</p>
      </header>

      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Search APV</label>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by APV # or supplier..."
            className="w-64 px-4 py-2 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
          />
        </div>
        <div className="flex flex-wrap gap-2 justify-end">
          {["Create Payables", "Create Check Voucher", "Print Check", "History", "Summary"].map((label, idx) => {
            const colors = [
              "from-teal-500 to-cyan-600",
              "from-blue-500 to-blue-600",
              "from-gray-500 to-gray-600",
              "from-amber-500 to-amber-600",
              "from-teal-500 to-teal-600",
            ];
            
            const icons = [
              <svg key="create" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>,
              <svg key="check" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>,
              <svg key="print" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" />
              </svg>,
              <svg key="history" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>,
              <svg key="summary" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
              </svg>
            ];
            
            return (
              <button
                key={label}
                className={`bg-gradient-to-r ${colors[idx]} text-white font-medium px-4 py-2 rounded-md shadow transition text-sm flex items-center`}
                onClick={label === "Create Payables" ? () => setShowModal(true) : undefined}
              >
                {icons[idx]}
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="overflow-x-auto bg-white shadow-md rounded-lg">
        <table className="min-w-full divide-y divide-gray-200 text-sm text-left text-gray-700">
          <thead className="bg-gray-200 text-gray-700 uppercase tracking-wider">
            <tr>
              <th className="px-4 py-2">APV #</th>
              <th className="px-4 py-2">Invoice Date</th>
              <th className="px-4 py-2">Due Date</th>
              <th className="px-4 py-2">Bill / Invoice #</th>
              <th className="px-4 py-2">Supplier</th>
              <th className="px-4 py-2 text-right">Amount Due</th>
              <th className="px-4 py-2 text-right">Total</th>
              <th className="px-4 py-2 text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            {vouchers
              .filter((v) => 
                v.apv.includes(search) || 
                v.supplier.toLowerCase().includes(search.toLowerCase()) ||
                v.bill.toLowerCase().includes(search.toLowerCase())
              )
              .map((v, i) => (
                <tr key={i} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2">{v.apv}</td>
                  <td className="px-4 py-2">{v.invoiceDate}</td>
                  <td className="px-4 py-2">{v.dueDate}</td>
                  <td className="px-4 py-2">{v.bill}</td>
                  <td className="px-4 py-2">{v.supplier}</td>
                  <td className="px-4 py-2 text-right">{v.amountDue}</td>
                  <td className="px-4 py-2 text-right">{v.total}</td>
                  <td className="px-4 py-2 text-center">
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                      v.status === 'Approved' ? 'bg-green-100 text-green-800' :
                      v.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                      v.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {v.status}
                    </span>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg w-full max-w-6xl shadow-lg">
            <div className="max-h-[90vh] overflow-y-auto p-6">
              <div className="flex justify-between items-center bg-gradient-to-r from-teal-500 to-cyan-600 text-white px-6 py-3 rounded-t-lg">
                <h2 className="text-lg font-semibold">Create Voucher Payable</h2>
                <button 
                  onClick={() => setShowModal(false)} 
                  className="text-white text-2xl hover:text-gray-200"
                >
                  &times;
                </button>
              </div>

              <div className="p-6 space-y-4">
                {/* Supplier Inputs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Supplier <span className="text-red-500">*</span></label>
                    <select
                      value={selectedSupplier}
                      onChange={(e) => setSelectedSupplier(e.target.value)}
                      className="w-full border rounded px-3 py-2"
                      required
                    >
                      <option value="">Select a supplier</option>
                      {suppliers.map((supplier) => (
                        <option key={supplier.id} value={supplier.supplier_name}>
                          {supplier.supplier_name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                    <div className="border rounded px-3 py-2 bg-gray-50">
                      {selectedSupplierData.contact_details || "-"}
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Supplier Address</label>
                  <div className="border rounded px-3 py-2 bg-gray-50 min-h-[60px]">
                    {selectedSupplierData.address || "-"}
                  </div>
                </div>

                {/* PO Reference */}
                <div className="border rounded p-4 bg-gray-50">
                  <h3 className="text-sm font-semibold mb-3">PO Reference</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">PO Number <span className="text-red-500">*</span></label>
                      <input 
                        placeholder="Enter PO number" 
                        className="border rounded px-3 py-2 w-full" 
                        value={poNumber}
                        onChange={(e) => setPoNumber(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Invoice Number <span className="text-red-500">*</span></label>
                      <input 
                        placeholder="Enter invoice number" 
                        className="border rounded px-3 py-2 w-full" 
                        value={invoiceNumber}
                        onChange={(e) => setInvoiceNumber(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Invoice Date <span className="text-red-500">*</span></label>
                      <input 
                        type="date" 
                        className="border rounded px-3 py-2 w-full" 
                        value={invoiceDate}
                        onChange={(e) => setInvoiceDate(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Due Date <span className="text-red-500">*</span></label>
                      <input 
                        type="date" 
                        className="border rounded px-3 py-2 w-full" 
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Payable Information */}
                <div className="border rounded p-4 bg-gray-50 mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Payable Number</label>
                      <div className="border rounded px-3 py-2 bg-gray-100">Auto-generated</div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Date Created</label>
                      <div className="border rounded px-3 py-2 bg-gray-100">{new Date().toISOString().split('T')[0]}</div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Username</label>
                      <div className="border rounded px-3 py-2 bg-gray-100">Current User</div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Remarks</label>
                    <textarea 
                      placeholder="Enter Remarks" 
                      className="border rounded px-3 py-2 w-full" 
                      rows={2}
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                    />
                  </div>
                </div>

                {/* Line Items */}
                <div>
                  <h3 className="text-sm font-semibold mb-2">Line Items <span className="text-red-500">*</span></h3>
                  <div className="overflow-x-auto">
                    <table className="w-full table-auto border border-gray-300 text-sm">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="p-2 border">Expenses Account</th>
                          <th className="p-2 border">Description</th>
                          <th className="p-2 border">Qty</th>
                          <th className="p-2 border">Price</th>
                          <th className="p-2 border">VAT Type</th>
                          <th className="p-2 border">VAT (12%)</th>
                          <th className="p-2 border">Amount</th>
                          <th className="p-2 border">Class(Branch)</th>
                          <th className="p-2 border">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {lineItems.map((item, idx) => (
                          <tr key={idx}>
                            <td className="p-1 border">
                              <input 
                                value={item.account} 
                                onChange={(e) => updateLineItem(idx, "account", e.target.value)} 
                                className="w-full border rounded px-1 py-1" 
                                required
                              />
                            </td>
                            <td className="p-1 border">
                              <input 
                                value={item.description} 
                                onChange={(e) => updateLineItem(idx, "description", e.target.value)} 
                                className="w-full border rounded px-1 py-1" 
                                required
                              />
                            </td>
                            <td className="p-1 border">
                              <input 
                                type="number" 
                                min="1"
                                step="1"
                                value={item.qty} 
                                onChange={(e) => updateLineItem(idx, "qty", e.target.value)} 
                                className="w-full border rounded px-1 py-1" 
                                required
                              />
                            </td>
                            <td className="p-1 border">
                              <input 
                                type="number" 
                                step="0.01" 
                                min="0"
                                value={item.price} 
                                onChange={(e) => updateLineItem(idx, "price", e.target.value)} 
                                className="w-full border rounded px-1 py-1" 
                                required
                              />
                            </td>
                            <td className="p-1 border text-center">
                              <label className="inline-flex items-center">
                                <input 
                                  type="checkbox" 
                                  checked={item.vatType === "VAT"}
                                  onChange={() => toggleVatType(idx)}
                                  className="form-checkbox h-4 w-4 text-blue-600"
                                />
                                <span className="ml-2 text-xs">{item.vatType}</span>
                              </label>
                            </td>
                            <td className="p-1 border text-right">
                              {item.vatAmount.toFixed(2)}
                            </td>
                            <td className="p-1 border text-right">
                              {item.amount.toFixed(2)}
                            </td>
                            <td className="p-1 border">
                              <input 
                                value={item.branch} 
                                onChange={(e) => updateLineItem(idx, "branch", e.target.value)} 
                                className="w-full border rounded px-1 py-1" 
                              />
                            </td>
                            <td className="p-1 border text-center">
                              <button 
                                onClick={() => removeLineItem(idx)} 
                                className="text-red-500 hover:underline text-xs"
                                disabled={lineItems.length <= 1}
                              >
                                Remove
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <button 
                    onClick={addLineItem} 
                    className="mt-2 text-sm text-blue-600 hover:underline"
                  >
                    + Add Line Item
                  </button>
                </div>

                {/* Totals */}
                <div className="flex justify-end mt-4">
                  <div className="w-full md:w-1/2 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Subtotal:</span>
                      <input 
                        readOnly 
                        value={subtotal} 
                        className="text-right border rounded px-2 py-1 w-32 bg-gray-50" 
                      />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Total VAT:</span>
                      <input 
                        readOnly 
                        value={totalVat} 
                        className="text-right border rounded px-2 py-1 w-32 bg-gray-50" 
                      />
                    </div>
                    <div className="flex justify-between items-center font-semibold border-t pt-2">
                      <span className="text-sm">Total Amount Due:</span>
                      <input 
                        readOnly 
                        value={totalAmountDue} 
                        className="text-right border rounded px-2 py-1 w-32 bg-gray-100 font-bold" 
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 p-4 border-t">
                <button 
                  onClick={() => setShowModal(false)} 
                  className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
                
                <button 
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition flex items-center justify-center min-w-[120px]"
                  onClick={handleSaveVoucher}
                  disabled={saveLoading}
                >
                  {saveLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </>
                  ) : 'Save Voucher'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VouchersPayable;