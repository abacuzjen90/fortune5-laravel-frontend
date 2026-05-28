import { memo, useContext, useEffect, useState, useRef} from "react";
import { AppContext } from "../../context/AppContext";
import { useNavigate, useParams } from 'react-router-dom';
import { Dialog, DialogBackdrop, DialogPanel } from '@headlessui/react';
import { Link } from 'react-router-dom';
import InfoBox from "../../assets/components/InfoBox";
import ConfirmBox from "../../assets/components/DeleteBox";
import UpdateBox from "../../assets/components/UpdateBox";
import { FaTrash, FaPlus, FaRegListAlt, FaSave, FaRegEdit } from "react-icons/fa";
import LoadingBox from '../../assets/components/Loading';
import useScreenSize from "../../assets/components/useScreenSize";
import ErrorDisplay from "../../assets/components/ErrorDisplay";
import SuccessDisplay from "../../assets/components/SuccessDisplay";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";


export default function StockUpdate() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [openAddDial, setOpenAddDial] = useState(false);
  const [openBigItem, setOpenBigItem] = useState(false);
  const [open, setOpen] = useState(false);
  const { token, user } = useContext(AppContext);
  const [showLoading, setShowLoading] = useState(false);
  const isLoading = () => {setShowLoading(true)};
  const stopLoading = () => {setShowLoading(false)};
  const [status, setStatus] = useState(0);
  const [masterlist, setMasterlist] = useState([]);
  const [filtersOr, setFiltersOr] = useState({ orderdate: ""});
  const [filtersDr, setFiltersDr] = useState({ deliverydate: ""});
  const isMediumScreen = useScreenSize(768);
  const [inventoryItem, setInvenyoryItem] = useState([]);
  const [bigUnit, setBigUnit] = useState([]);
  const [smallUnit, setSmallUnit] = useState([]);
  const [expandedRows, setExpandedRows] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [grandTotal, setGrandTotal] = useState(0);

  const today = new Date().toISOString().split('T')[0]; // "YYYY-MM-DD"


  const [stockHeader, setStockHeader] = useState({
    supplier_name: "", delivery_receipt: "", order_date: "", delivery_date: "", remarks: "",
  });

  const [stockDetails, setStockDetails] = useState([
    { header_id: "", product_id: "", sku: "", unit: "", quantity: "", price_per_unit: "", cost_per_unit: "", discount: "0", total_purchase_cost: "", common_name: "", big_unit: "", big_qty: "", big_price: "", big_cost: "", small_conversion: "", big_conversion: "1", }
  ]);

  const [productData, setProductData] = useState({
    id: "", order_date: "", delivery_date: "", delivery_receipt: "", supplier_name: "", remarks: "",
  });

  const [deletedIds, setDeletedIds] = useState([]);

  const [errors, setErrors] = useState({});

  //Hardware Row Increment ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  const handleHardware = (index, field, value) => {
    isLoading();

    const updated = [...stockDetails];

    // Handle nested fields (e.g., "big.unit")
    if (field.includes(".")) {
      const keys = field.split("."); // ["big", "unit"]
      updated[index][keys[0]] = {
        ...updated[index][keys[0]],
        [keys[1]]: value,
      };
    } else {
      updated[index][field] = value;
    }

    const bigQty = parseFloat(updated[index].big_qty) || 0;
    const bigcost = parseFloat(updated[index].big_cost) || 0;
    const cost_per_unit = parseFloat(updated[index].cost_per_unit) || 0;
    const discountPercent = parseFloat(updated[index].discount) || 0;

    const subtotal = bigQty * bigcost;
    const discountAmount = subtotal * (discountPercent / 100);
    const total_purchase_cost = subtotal - discountAmount;

    updated[index].total_purchase_cost = total_purchase_cost >= 0 ? total_purchase_cost.toFixed(2) : "0.00";

    const conversion = parseFloat(updated[index].small_conversion) || 0;
    const bigCost = parseFloat(updated[index].big_cost) || 0;

    // 🔹 Auto-calc cost_per_unit when big_cost or conversion changes

      if (field === "small_conversion") {
        if (conversion && Number(conversion) > 0) {
          updated[index].cost_per_unit = (bigCost / conversion).toFixed(2);
          updated[index].quantity = bigQty * conversion;
        } else {
          updated[index].cost_per_unit = "";
          updated[index].quantity = "";
        }
      }

    const grandTotal = updated.reduce((sum, row) => {
      const val = parseFloat(row.total_purchase_cost) || 0;
      return sum + val;
    }, 0);

    setGrandTotal(grandTotal);

    setStockDetails(updated);
    stopLoading();
  };


  const addRow = () => {
    setStockDetails([
      ...stockDetails,
      { id: "", product_id: "", sku: "", quantity: "", cost_per_unit: "", price_per_unit: "", discount: "0", total_purchase_cost: "" }
    ]);
  };

  const deleteRow = (index) => {
    const updated = [...stockDetails];
    const [removed] = updated.splice(index, 1);

    if (removed.id && Number(removed.id) > 0) {
      setDeletedIds(prev => [...prev, removed.id]);
    }

    setStockDetails(updated);
  };

  useEffect(() => {
  console.log("Updated Deleted IDs:", deletedIds);
}, [deletedIds]);

  //Datepicker
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0]; // "YYYY-MM-DD"
    setFiltersOr((prev) => ({
      ...prev,
      orderdate: prev.orderdate || today,
    }));

    setFiltersDr((prev) => ({
      ...prev,
      deliverydate: prev.deliverydate || today,
    }));
  }, []);

  const datePickerChange = (e) => {
    const { name, value } = e.target;
    setFiltersOr((prev) => ({
      ...prev,
      [name]: value, // this will be in "YYYY-MM-DD" format automatically
    }));

    setFiltersDr((prev) => ({
      ...prev,
      [name]: value, // this will be in "YYYY-MM-DD" format automatically
    }));
    console.log("Selected date:", value); // already in "YYYY-MM-DD"
  };


  // Get Stock HEader
    async function getStockH() {
      isLoading();
      const res = await fetch(`/api/stockheader/${id}`, {
        method: "get",  
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if(res.ok) {
        setStockHeader({
          id: data[0].id,
          supplier_name: data[0].supplier_name,
          delivery_receipt: data[0].delivery_receipt,
          order_date: data[0].order_date,
          delivery_date: data[0].delivery_date,
          remarks: data[0].remarks,
        });
      }
      stopLoading();
    }
    useEffect(() => {
      getStockH();
    }, []);


    // Get Stock Details
    async function getStockD() {
      isLoading();
      const res = await fetch(`/api/getstockdetails/${id}`, {
        method: "get",  
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();

      if(res.ok) {
        const normalizedData = data.map((d) => ({
          id: d.id,
          header_id: d.header_id || "",
          product_id: d.product_id || "",
          sku: d.sku || "",
          quantity: d.quantity || "",
          cost_per_unit: d.cost_per_unit || "",
          price_per_unit: d.price_per_unit || "",
          discount: d.discount,
          total_purchase_cost: d.total_purchase_cost || "",
          big_qty: d.big_qty || "",
          unit: d.unit || "",
          big_unit: d.big_unit || "",
          big_price: d.big_price || "",
          big_cost: d.big_cost || "",
          big_conversion: d.big_conversion || "1",
          small_conversion: d.small_conversion || "",
        }));

         const totalPurchaseSum = normalizedData.reduce(
            (sum, item) => sum + Number(item.total_purchase_cost),
            0
          );

        setStockDetails(normalizedData);
        setGrandTotal(totalPurchaseSum);
      }
      stopLoading();
    }
    useEffect(() => {
      getStockD();
    }, []);


  // Get Item List
  async function getItemList() {
    isLoading();
      const res = await fetch("/api/inventoryitem", {
      method: "GET",
      headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          Authorization: `Bearer ${token}`,
        },
    });
      const data = await res.json();
      if(res.ok) {
        setInvenyoryItem(data);
      }  
    stopLoading();
  }
  useEffect(() => {
    getItemList();
  }, []);

  const itemOptions = inventoryItem.map(item => ({
    value: item.id,
    label: `${item.sku} - ${item.product_name}`,
    sku: item.sku,
    cost_per_unit: item.cost_per_unit,
  }));
  

  // Get Item List
    async function getBigUnitList() {
      isLoading();
        const res = await fetch("/api/inventoryunitbig", {
          method: "GET",
          headers: {
              "Content-Type": "application/json",
              "Accept": "application/json",
              Authorization: `Bearer ${token}`,
            },
        });
        const data = await res.json();
        if(res.ok) {
          setBigUnit(data);
        }  
      stopLoading();
    }
    useEffect(() => {
      getBigUnitList();
    }, []);
  
  
    // Get Item List
    async function getSmallUnitList() {
      isLoading();
        const res = await fetch("/api/inventoryunitsmall", {
          method: "GET",
          headers: {
              "Content-Type": "application/json",
              "Accept": "application/json",
              Authorization: `Bearer ${token}`,
            },
        });
        const data = await res.json();
        if(res.ok) {
          setSmallUnit(data);
        }  
      stopLoading();
    }
    useEffect(() => {
      getSmallUnitList();
    }, []);


  // Update Purchase Stock
  async function handleUpdate(e) {
    isLoading();
    e.preventDefault();

    // 1. Quick client-side check to avoid submitting empty details
    const validatedDetails = stockDetails.map(item => ({
      ...item,
      big_conversion: item.big_conversion ? item.big_conversion : 1,
    }));

    if (
      !validatedDetails.length || validatedDetails.some(item => !item.product_id || !item.big_unit || !item.big_qty || !item.big_conversion || !item.big_cost || !item.big_price ||

        (!isNaN(parseFloat(item.big_cost)) &&
          !isNaN(parseFloat(item.big_price)) &&
          parseFloat(item.big_cost) >= parseFloat(item.big_price)) ||

        (!isNaN(parseFloat(item.cost_per_unit)) &&
          !isNaN(parseFloat(item.price_per_unit)) &&
          parseFloat(item.cost_per_unit) >= parseFloat(item.price_per_unit))
      )
    ) {
      setErrors((prev) => {
        const newError = { stockDetails: ['Stock details cannot be empty, incomplete, or have invalid pricing (cost must be less than price).'] };
        return JSON.stringify(prev) === JSON.stringify(newError) ? prev : newError;
      });
      setOpen(false);
      stopLoading();
      return;
    }

    // 2. Check for duplicate product_id
    const seenProducts = new Set();
    const duplicate = stockDetails.find(item => {
      if (seenProducts.has(item.product_id)) {
        return true;
      }
      seenProducts.add(item.product_id);
      return false;
    });

    if (duplicate) {
      setErrors({ stockDetails: ['Duplicate product selected: ' + duplicate.product_id] });
      stopLoading();
      return;
    }

    const header = await fetch(`/api/stockheader/${id}`, {
      method: "put",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(stockHeader),
    });
    const dataheader = await header.json();
    console.log(dataheader);

    const stockDetailsWithHeader = validatedDetails.map(item => ({
      ...item,
      header_id: id,
    }));

    const details = await fetch(`/api/stockdetails/${id}`, {
      method: "put",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        stockDetails: stockDetailsWithHeader,
        deletedIds, // include deletedIds here
      }),
    });
    const datadetails = await details.json();
    console.log(datadetails);

    if (dataheader.errors) {
      setErrors(dataheader.errors);
      setOpen(false);
    } else if (datadetails.errors) {
      setErrors(datadetails.errors);
      setOpen(false);
    } else {
      setErrors(false);
      setOpen(true);
      setStatus(1);
      // setStockHeader({
      //   supplier_name: "",
      //   delivery_receipt: "",
      //   order_date: "",
      //   delivery_date: "",
      //   remarks: "",
      // });
      // setStockDetails([
      //   { product_id: "", sku: "", quantity: "", cost_per_unit: "", discount: "", total_purchase_cost: "" }
      // ]);
      setDeletedIds([]); // clear after success
    }

    stopLoading();
  }



  async function closeCreate() {
    setOpen(false);
    setOpenAddDial(false);
  }


  // Get Customer Details
  async function getCustomerDetails(id) {
    if(id){
      const res = await fetch(`/api/customer/${id}`, {
        method: "get",  
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if(res.ok) {
        setCustData({
          branch_id: data[0].branch_id,
          charge_to: data[0].charge_to,
          address: data[0].address,
          terms: data[0].terms,
          minimum: data[0].minimum,
        });
      }
    }
  }
  useEffect(() => {
    getCustomerDetails();
  }, []);


  async function openUpdate() {
    setOpen(true);
    setStatus(3);
  }

  // async function handleUpdate(e) {
  //   e.preventDefault();
  //   isLoading();
  //   const res = await fetch(`/api/stockheader/${id}`, {
  //     method: "put",
  //     headers: {
  //       Authorization: `Bearer ${token}`,
  //     },
  //     body: JSON.stringify(stockHeader),
  //   });
  //   const data = await res.json();
  //   console.log(res);
  //   if(data.errors) {
  //     setErrors(data.errors);
  //     setOpen(false);
  //   } else {
  //     setStatus(4);
  //   }
  //   stopLoading();
  // }

  async function closeUpdate() {
      setOpen(false);
      //navigate('/maintenance/stocklist');
    }


    // Get Product Details
  async function getProduct(id) {
    console.log(id);
    setProductData({});
    if(id){
      const res = await fetch(`/api/inventoryitem/${id}`, {
        method: "get",  
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      console.log(data);
      if(res.ok) {
        setProductData({
          id: data[0].id,
          product_name: data[0].product_name,
          sku: data[0].sku,
          cost_per_unit: data[0].cost_per_unit,
          reorder_level: data[0].reorder_level,
        });
      }
    }
  }

  return (
    <> 
    <div className="flex items-center font-medium border-b border-slate-300 w-full">
      <main className="px-4 flex-1 mx-auto py-4"><h1>Purchase Stock</h1></main>
    </div>
    <div className="flex items-center font-medium flex-1 mx-auto py-4">
      <main className="flex-1 mx-auto p-4">
        <div className={`overflow-x-auto transition-all duration-75 min-w-0 mx-auto ${isMediumScreen ? "w-[calc(100vw-19rem)]" : "w-[calc(100vw-6rem)]"}`}>
          <div className="bg-gray-50 shadow-md border mb-20">
            <div className="p-6 text-gray-900">
              <div className="text-left caption-top dark:text-gray-800">
              </div>
              <ErrorDisplay errors={errors} clearErrors={() => setErrors({})} />
              <div className="py-4 flex w-full mx-auto space-y-6">
              <div className="w-full mx-auto space-y-6">
              <div className='border p-2 bg-gray-100'>
                <div className="flex flex-row py-2 p-4">
                  <div className="flex w-full"><FaRegListAlt size={25} />&nbsp;<h1>Stock Header</h1></div>
                  <div className="flex mb-3">
                    <button onClick={() => openUpdate()} className="h-fit flex flex-row primary-btn py-3 px-5 text-sm tracking-wider font-semibold rounded-md text-white bg-gray-800 hover:bg-gray-600 focus:outline-none"><FaRegEdit size={20} className="mr-2"/>Update&nbsp;Stock</button>
                  </div> 
                </div>
                <hr />
                <div className='flex flex-row'>
                  <div className="p-4 w-1/2 space-y-4">
                    {/* Order Date */}
                    <div className="flex flex-col">
                      <label className="mb-1 text-sm font-medium text-gray-700">
                        Order Date
                      </label>
                      <DatePicker
                        selected={stockHeader.order_date}
                        onChange={(date) =>
                          setStockHeader((prev) => ({ ...prev, order_date: date ? format(date, "yyyy-MM-dd") : "", }))
                        }
                        dateFormat="MM/dd/yyyy"
                        className="register-link px-4 py-3 w-full border border-gray-300 text-sm text-gray-800 rounded-md outline-blue-500"
                        placeholderText="MM/DD/YYYY"
                      />
                    </div>

                    {/* Receipt No. */}
                    <div className="flex flex-col">
                      <label className="mb-1 text-sm font-medium text-gray-700">
                        Receipt No.
                      </label>
                      <input
                        type="text"
                        placeholder="Delivery Receipt No."
                        value={stockHeader.delivery_receipt}
                        onChange={(e) =>
                          setStockHeader({ ...stockHeader, delivery_receipt: e.target.value })
                        }
                        className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 py-3 w-full rounded-md outline-blue-500"
                      />
                    </div>

                    {/* Remarks */}
                    <div className="flex flex-col">
                      <label className="mb-1 text-sm font-medium text-gray-700">
                        Remarks
                      </label>
                      <input
                        type="text"
                        placeholder="Remarks"
                        value={stockHeader.remarks}
                        onChange={(e) =>
                          setStockHeader({ ...stockHeader, remarks: e.target.value })
                        }
                        className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 py-3 w-full rounded-md outline-blue-500"
                      />
                    </div>
                  </div>

                  <div className="p-4 w-1/2 space-y-4">
                    {/* Delivery Date */}
                    <div className="flex flex-col">
                      <label className="mb-1 text-sm font-medium text-gray-700">
                        Delivery Date
                      </label>
                      <DatePicker
                        selected={stockHeader.delivery_date}
                        onChange={(date) =>
                          setStockHeader((prev) => ({ ...prev, delivery_date: date ? format(date, "yyyy-MM-dd") : "", }))
                        }
                        dateFormat="MM/dd/yyyy"
                        className="register-link px-4 py-3 w-full border border-gray-300 text-sm text-gray-800 rounded-md outline-blue-500"
                        placeholderText="MM/DD/YYYY"
                      />
                    </div>

                    {/* Supplier Name */}
                    <div className="flex flex-col">
                      <label className="mb-1 text-sm font-medium text-gray-700">
                        Supplier Name
                      </label>
                      <input
                        type="text"
                        placeholder="Supplier Name"
                        value={stockHeader.supplier_name}
                        onChange={(e) =>
                          setStockHeader({ ...stockHeader, supplier_name: e.target.value })
                        }
                        className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 py-3 w-full rounded-md outline-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className='border bg-gray-100'>
                <div>
                  <div className='flex ml-4 mt-4'>
                    <FaRegListAlt size={25} />&nbsp;<h1>Stock Hardware</h1>
                  </div>
                  <div className='flex'>
                    <div className={`overflow-x-auto transition-all duration-75 min-w-0 mx-auto p-4 ${isMediumScreen ? "w-[calc(100vw-22rem)]" : "w-[calc(100vw-9rem)]"}`}>
                      <table className="min-w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                        <caption className="text-left caption-top dark:text-gray-800">
                          <div className="flex flex-row py-2">
                            <div className="flex w-full justify-end">
                              <button type='button' onClick={addRow} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 flex items-center">
                                <FaPlus/> Add Row
                              </button>
                            </div>
                          </div>
                        </caption>
                          <thead className="text-xs text-center uppercase bg-gray-200 text-gray-800 border-b border-t border-gray-300">
                            <tr className="text-nowrap">
                              <th className="w-8"></th>
                              <th className="px-2 py-3 text-left w-4/12">Product Name</th>
                              <th className="px-2 py-3 w-2/12">SKU</th>
                              <th className="px-2 py-3 w-1/12">Quantity</th>
                              <th className="px-2 py-3 w-2/12">Unit</th>
                              <th className="px-2 py-3 w-1/12">Cost Per Unit</th>
                              <th className="px-2 py-3 w-1/12">Discount</th>
                              <th className="px-2 py-3 w-2/12">Total Purchase Cost</th>
                              <th className="px-2 py-3 w-8">-</th>
                            </tr>
                          </thead>
                          <tbody className="text-sm text-center bg-gray-50 dark:bg-gray-50 dark:text-gray-800 border-b-2 border-gray-300">
                            {stockDetails.map((row, index) => (
                            <tr className="text-xs bg-white border-b dark:bg-gray-50 dark:border-gray-300">    
                              <td className="px-2">
                                <div className="relative group inline-block">
                                  <button
                                    type="button"
                                    //onClick={() => toggleRow(index)}
                                    onClick={() => {
                                      if (row.product_id) {
                                        setSelectedIndex(index);
                                        getProduct(row.product_id);
                                        setOpenBigItem(true);
                                        setErrors(false);
                                      } else {
                                        alert("Product ID is missing!");
                                      }
                                    }}
                                    className={`px-2 py-1 h-6 rounded font-bold 
                                      ${expandedRows.includes(index) ? "bg-green-500 text-white" : "bg-blue-500 text-white"}`}
                                  >
                                    {expandedRows.includes(index) ? "<" : ">"}
                                  </button>

                                  {/* Tooltip */}
                                  <span
                                    className="absolute bottom-8 left-3 -translate-x-1/2 mt-1 px-2 py-1 text-xs text-white bg-gray-700 rounded opacity-0 
                                              group-hover:opacity-100 transition-opacity"
                                  >
                                    {expandedRows.includes(index) ? "Collapse" : "Expand"}
                                  </span>
                                </div>
                              </td>    
                              <td className="px-2 py-3 flex gap-2">
                                <Select
                                  name={`stockDetails[${index}][product_id]`} // or "item_id", "inventory_item_id" etc.
                                  inputId={`stockDetails${index}product_id`} // unique id for accessibility
                                  className="w-full text-left"
                                  classNamePrefix="select"
                                  placeholder="Select Product"
                                  value={itemOptions.find(opt => opt.value === row.product_id)}
                                  onChange={(selected) => {handleHardware(index, "product_id", selected ? selected.value : null);
                                                           handleHardware(index, "sku", selected ? selected.sku : "");
                                                           //handleHardware(index, "cost_per_unit", selected ? selected.cost_per_unit : "");
                                  }}
                                  options={itemOptions}
                                  isClearable
                                  menuPortalTarget={document.body}
                                  styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                                />

                                {/* <input type="text" placeholder="Product Name" name={`stockDetails[${index}][product_id]`} value={row.product_id} onChange={(e) => handleHardware(index, "product_id", e.target.value)} className="register-link py-2 px-4 w-full border rounded-md text-left" /> */}
                              </td>
                              <td className="px-2 py-3">
                                <input type="text" placeholder="SKU" name={`stockDetails[${index}][sku]`} value={row.sku} onChange={(e) => handleHardware(index, "sku", e.target.value)} className="register-link py-2 px-2 w-full border rounded-md text-center bg-gray-100" />
                              </td>
                              <td className="px-2 py-3">
                                <input type="text" placeholder="Big Qty" name={`stockDetails[${index}][big_qty]`} value={row.big_qty} onChange={(e) => handleHardware(index, "big_qty", e.target.value)} className="register-link py-2 px-2 w-full border rounded-md text-center bg-gray-100" />
                              </td>
                              <td className="px-2 py-3">
                                <select className='form-select text-gray-800 bg-white text-sm px-2 w-full py-2 border border-gray-300 rounded-md outline-blue-500' name={`stockDetails[${index}][big_unit]`} value={row.big_unit} onChange={(e) => handleHardware(index, "big_unit", e.target.value)}>
                                <option value="">Select</option>
                                  {bigUnit.map((rec, key) =>(
                                    <option value={rec.big_unit} key={key}>{rec.big_unit}</option>
                                  ))}
                              </select>
                              </td>
                              <td className="px-2 py-3">
                                <input type="text" placeholder="CPU" name={`stockDetails[${index}][big_cost]`} value={row.big_cost} onChange={(e) => handleHardware(index, "big_cost", e.target.value)} className="register-link py-2 px-2 w-full border rounded-md text-right bg-gray-100" />
                              </td>
                              <td className="px-2 py-3">
                                <div className="relative">
                                  <input type="text" placeholder="Discount" name={`stockDetails[${index}][discount]`} value={row.discount} onChange={(e) => handleHardware(index, "discount", e.target.value)} className="register-link py-2 px-6 w-full border rounded-md text-right" max="100" min="0" />
                                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 text-sm">%</span>
                                </div>
                              </td>
                              <td className="px-2 py-3">
                                <input type="text" placeholder="TPC" name={`stockDetails[${index}][total_purchase_cost]`} value={row.total_purchase_cost} onChange={(e) => handleHardware(index, "total_purchase_cost", e.target.value)} className="register-link py-2 px-2 w-full border rounded-md text-right" readOnly/>
                              </td>
                              <td>{index !== 0 && (
                                    <button
                                      type='button'
                                      onClick={() => deleteRow(index)}
                                      className=" text-red-600 hover:text-red-800"
                                      title="Delete Row"
                                    >
                                      <FaTrash size={18}/>
                                    </button>
                                  )}</td>
                            </tr>
                            ))}

                        </tbody>  
                        <tfoot>
                            <tr className="text-sm bg-white border-b dark:bg-gray-50 dark:border-gray-300">
                              <td className="px-3 py-3" colSpan={6}>&nbsp;</td>
                              <td className="px-3 py-3 whitespace-nowrap">Total Amount</td>
                              <td className="px-3 py-3 text-right text-slate-800 font-semibold">{grandTotal.toFixed(2)}</td>
                              <td className="px-3 py-3">&nbsp;</td>
                            </tr>
                        </tfoot>                                     
                      </table>
                    </div>
                  </div>
                  <hr />
                </div>
              </div>
              </div>
              </div>
            </div>
          </div>
        </div>  
      </main> 
    </div>


    {/* Issuance Details */}
    <Dialog open={openBigItem} onClose={setOpenBigItem} className="relative z-[999]">
      <DialogBackdrop
          transition
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
      />

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <DialogPanel transition className="relative transform overflow-hidden transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-screen-md data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"> 

          {/* Close button */}
        <button
          onClick={() => setOpenBigItem(false)}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition"
        >
          ✕
        </button>

            <div className="flex flex-col font-[sans-serif]">
              <div className="w-full mx-auto border border-gray-300 p-8 bg-gray-50">
                <div className="text-center mb-4">
                  <h1 className="text-2xl text-left p-2 flex bg-slate-800 mt-4 text-slate-200"> {productData.id} - {productData.product_name} </h1>
                      {/* Details Section */}
                      <div className="bg-white shadow p-6 overflow-x-auto">
                      <table className="w-full text-sm border-collapse border">
                        <thead>
                          <tr className="bg-gray-50 text-gray-700 font-bold border-t border-b">
                            <th className="px-3 py-3 text-left">-</th>
                            <th className="px-3 py-3 text-left">Big Unit</th>
                            <th className="px-3 py-3 text-left">Small Unit</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedIndex !== null && (
                          <>
                          <tr>
                            <td className="px-3 py-3 text-left">Item Unit</td>                            
                            <td className="px-3 py-3">
                              <select className='form-select text-gray-800 bg-white text-sm px-2 w-full py-3 border border-gray-300 rounded-md outline-blue-500' value={stockDetails[selectedIndex]?.big_unit ?? ""} onChange={(e) => handleHardware(selectedIndex, "big_unit", e.target.value)}>
                                <option value="">Select Unit</option>
                                  {bigUnit.map((rec, key) =>(
                                    <option value={rec.big_unit} key={key}>{rec.big_unit}</option>
                                  ))}
                              </select>
                            </td>                            
                            <td className="px-3 py-3">
                              <select className='form-select text-gray-800 bg-white text-sm px-2 w-full py-3 border border-gray-300 rounded-md outline-blue-500' value={stockDetails[selectedIndex]?.unit ?? ""} onChange={(e) => handleHardware(selectedIndex, "unit", e.target.value)}>
                                <option value="">Select Unit</option>
                                  {smallUnit.map((rec, key) =>(
                                    <option value={rec.small_unit} key={key}>{rec.small_unit}</option>
                                  ))}
                              </select>
                            </td>                            
                          </tr>
                          <tr>
                            <td className="px-3 py-3 text-left">Unit Conversion</td>                            
                            <td className="px-3 py-3">
                              <input
                                type="text"
                                placeholder="0"
                                className="register-link py-2 px-2 w-full border rounded-md text-right bg-gray-50"
                                value={stockDetails[selectedIndex]?.big_conversion ?? "1"}
                                onChange={(e) => handleHardware(selectedIndex, "big_conversion", e.target.value)}
                                onInput={(e) => {
                                  e.target.value = e.target.value.replace(/[^0-9.]|\.(?=.*\.)/g, "");
                                }}
                                disabled
                              />
                            </td>                            
                            <td className="px-3 py-3">
                              <input
                                type="text"
                                placeholder="0"
                                className="register-link py-2 px-2 w-full border rounded-md text-right bg-gray-50"
                                value={stockDetails[selectedIndex]?.small_conversion ?? ""}
                                onChange={(e) => handleHardware(selectedIndex, "small_conversion", e.target.value)}
                                onInput={(e) => {
                                  e.target.value = e.target.value.replace(/[^0-9.]|\.(?=.*\.)/g, "");
                                }}
                              />
                            </td>                            
                          </tr>
                          <tr>
                            <td className="px-3 py-3 text-left">Cost</td>                            
                            <td className="px-3 py-3">
                              <input
                                type="text"
                                placeholder="0.00"
                                className="register-link py-2 px-2 w-full border rounded-md text-right bg-gray-50"
                                value={stockDetails[selectedIndex]?.big_cost ?? ""}
                                onChange={(e) => handleHardware(selectedIndex, "big_cost", e.target.value)}
                                onInput={(e) => {
                                  e.target.value = e.target.value.replace(/[^0-9.]|\.(?=.*\.)/g, "");
                                }}
                              />
                            </td>                            
                            <td className="px-3 py-3">
                              <input
                                type="text"
                                placeholder="0.00"
                                value={stockDetails[selectedIndex]?.cost_per_unit ?? ""}
                                className="register-link py-2 px-2 w-full border rounded-md text-right bg-gray-50"
                                 onChange={(e) => handleHardware(selectedIndex, "cost_per_unit", e.target.value)}
                                onInput={(e) => {
                                  e.target.value = e.target.value.replace(/[^0-9.]|\.(?=.*\.)/g, "");
                                }}
                              />
                            </td>                            
                          </tr>
                          <tr>
                            <td className="px-3 py-3 text-left">Price</td>                            
                            <td className="px-3 py-3">
                              <input
                                type="text"
                                placeholder="0.00"
                                className="register-link py-2 px-2 w-full border rounded-md text-right bg-gray-50"
                                value={stockDetails[selectedIndex]?.big_price ?? ""}
                                onChange={(e) => handleHardware(selectedIndex, "big_price", e.target.value)}
                                onInput={(e) => {
                                  e.target.value = e.target.value.replace(/[^0-9.]|\.(?=.*\.)/g, "");
                                }}
                              />
                            </td>                            
                            <td className="px-3 py-3">
                              <input
                                type="text"
                                placeholder="0.00"
                                className="register-link py-2 px-2 w-full border rounded-md text-right bg-gray-50"
                                value={stockDetails[selectedIndex]?.price_per_unit ?? ""}
                                onChange={(e) => handleHardware(selectedIndex, "price_per_unit", e.target.value)}
                                onInput={(e) => {
                                  e.target.value = e.target.value.replace(/[^0-9.]|\.(?=.*\.)/g, "");
                                }}
                              />
                            </td>                            
                          </tr>
                          <tr>
                            <td className="px-3 py-3 text-left">Quantity</td>                            
                            <td className="px-3 py-3">
                              <input
                                type="text"
                                placeholder="0"
                                className="register-link py-2 px-2 w-full border rounded-md text-right bg-gray-50"
                                value={stockDetails[selectedIndex]?.big_qty ?? ""}
                                onChange={(e) => handleHardware(selectedIndex, "big_qty", e.target.value)}
                                onInput={(e) => {
                                  e.target.value = e.target.value.replace(/[^0-9.]|\.(?=.*\.)/g, "");
                                }}
                              />
                            </td>                            
                            <td className="px-3 py-3">
                              <input
                                type="text"
                                placeholder="0"
                                className="register-link py-2 px-2 w-full border rounded-md text-right bg-gray-50"
                                value={stockDetails[selectedIndex]?.quantity ?? ""}
                                onChange={(e) => handleHardware(selectedIndex, "quantity", e.target.value)}
                                onInput={(e) => {
                                  e.target.value = e.target.value.replace(/[^0-9.]|\.(?=.*\.)/g, "");
                                }}
                              />
                            </td>                            
                          </tr>
                          </>
                          )}
                        </tbody>
                      </table>
                    </div>
                      <div className="!mt-8 float-right">
                        <button onClick={() => setOpenBigItem(false)} className="primary-btn py-3 px-10 mr-4 text-sm tracking-wider font-semibold rounded-md text-white bg-slate-500 hover:bg-slate-600 focus:outline-none"> Close </button>
                      </div>
                  </div>
                </div>
              </div>
            </DialogPanel>
          </div>
      </div>
    </Dialog>


    <LoadingBox open={showLoading} onClose={stopLoading} setOpen={stopLoading} />

    {status === 1 &&  <InfoBox open={open} setOpen={setOpen} onClose={setOpen}
      title="Confirm Success"
      body="Purchase stock successfully added!"
      okConfirm={closeCreate}
      /> 
    }

    {status === 2 &&  <ConfirmBox open={open} setOpen={setOpen}
      title="Confirm Delete"
      body="Are you sure you want to delete this destination?"
      okConfirm={handleDelete}
      /> 
    }

    {status === 3 && <UpdateBox open={open} setOpen={setOpen}
      title="Confirm Update"
      body="Are you sure you want to update this purchase stock?"
      okConfirm={handleUpdate}
      /> 
    }

    {status === 4 &&  <InfoBox open={open} setOpen={setOpen} onClose={setOpen}
      title="Confirm Success"
      body="Purchase stock successfully updated!"
      okConfirm={closeUpdate}
      /> 
    }

    {status === 5 &&  <InfoBox open={open} setOpen={setOpen} onClose={setOpen}
      title="Confirm Success"
      body="Destination successfully deleted!"
      okConfirm={closeDelete}
      /> 
    }
    
    </>
  )
};
