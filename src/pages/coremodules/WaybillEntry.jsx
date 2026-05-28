import { Dialog, DialogBackdrop, DialogPanel, Tab, TabList, TabPanels, TabPanel, TabGroup } from '@headlessui/react';
import { memo, useContext, useEffect, useState, useRef} from "react";
import { AppContext } from "../../context/AppContext";
import { Link } from 'react-router-dom';
import InfoBox from "../../assets/components/InfoBox";
import ConfirmBox from "../../assets/components/DeleteBox";
import UpdateBox from "../../assets/components/UpdateBox";
import { FaRegTrashAlt, FaRegEdit, FaUserEdit, FaUserPlus, FaTrash,
         FaPlus, FaSearch, FaReply, FaRegListAlt, FaWpforms, FaSave, FaTimes } from "react-icons/fa";
import Pagination from '../../assets/components/Pagination';
import TableSort from '../../assets/components/TableSort';
import RunningClock from '../../assets/components/RunningClock';
import LoadingBox from '../../assets/components/Loading';
import sortData from '../../assets/components/sortData';
import useScreenSize from "../../assets/components/useScreenSize";
import ErrorDisplay from "../../assets/components/ErrorDisplay";
import SuccessDisplay from "../../assets/components/SuccessDisplay";


export default function WaybillEntry() {

  const [openAddDial, setOpenAddDial] = useState(false);
  const [openAddConsignee, setOpenAddConsignee] = useState(false);
  const [openAddShipper, setOpenAddShipper] = useState(false);
  const [openLookUp, setOpenLookUp] = useState(false);
  const [openLookUpPopUp, setOpenLookUpPopUp] = useState(false);
  const [openOtherCharge, setOpenOtherCharge] = useState(false);
  const [openUpdateDial, setOpenUpdateDial] = useState(false);
  const [open, setOpen] = useState(false);
  const { token, user } = useContext(AppContext);
  const [showLoading, setShowLoading] = useState(false);
  const isLoading = () => {setShowLoading(true)};
  const stopLoading = () => {setShowLoading(false)};
  const [status, setStatus] = useState(0);
  const [destination, setDestination] = useState([]);
  const [masterlist, setMasterlist] = useState([]);
  const [branch, setBranch] = useState([]);
  const [id, setId] = useState(null);
  const [filters, setFilters] = useState({ dob: ""});
  const isMediumScreen = useScreenSize(768);
  const [selectedCusttype, setSelectedCusttype] = useState('');
  const [custShipper, setCustShipper] = useState([]);
  const [selectedShipper, setSelectedShipper] = useState('');
  const [selectedConsignee, setSelectedConsignee] = useState('');
  const [custConsignee, setCustConsignee] = useState([]);
  const [shipperDetails, setShipperDetails] = useState('');
  const [optCharge, setOptCharge] = useState('c');
  const [optSizeType, setOptSizeType] = useState('s');
  const [measurements, setMeasurements] = useState([
    { length: "", width: "", height: "", quantity: "", unit: "" }
  ]);
  const [lookUpCaption, setLookUpCaption] = useState(null);
  const today = new Date().toISOString().split('T')[0]; // "YYYY-MM-DD"
  const [wbno, setWbno] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [custSpecialItem, setCustSpecialItem] = useState([]);

  //Table Pagination, Search
  const [sortdata, setSortdata] = useState([]);
  const [sorting, setSorting] = useState({ key: "", ascending: true });
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageCount, setPageCount] = useState(0);
  const [dataPerPage, setDataperpage] = useState(10);


  const [formData, setFormData] = useState({
    destination_to: "", waybillno: "", hwaybillnumber: "", crs_number: "", type: "", modeoftransaction: "", customer_type: "",
    charge_to: "", shipper: "", consignee: "", waybill_address: "", address: "", mobile_number: "", contact_number: "", destination_from: "",
    memo: "", shipper_own_risk: "", send_sms: "", wb_missing_status: "", waybilldate: "", ptf_status: "", terms: "", customer_minimum: "", encoder: "", encoded: today,
    appraiser: "", pickupby: "", typist_name: "", customer_dr_attachment: "", rates_to_apply: "", glass: "", liquid: "", breakable: "", food: "", perishable: "",
  });
  
  const [formShipper, setFormShipper] = useState({
    cust_uniq_id: "", registered_name: "", contact_person: "", address: "", contact_number: "", mobile_number: "",
  });

  const [formConsignee, setFormConsignee] = useState({
    cust_uniq_id: "", registered_name: "", contact_person: "", address: "", contact_number: "", mobile_number: "",
    branch_id: "", rate_cbm: "", rate_kilo: "", value_charge: "", advalorem: "", minimum: "", account_type: "",
  });

  const [custData, setCustData] = useState({
    branch_id: "", charge_to: "", address: "", terms: "", minimum: "",
  });

  const [perCBM, setPerCBM] = useState({
    waybillno: "", wb_description: "", unit: "", quantity: "", declared_value2: "",
    consignee: "", shipper: "", goingto: "", type: "", account_type: "",
  });


  const [advaloremData, setAdvaloremData] = useState({
    waybillno: "", wb_description: "", unit: "", quantity: "", declared_value2: "",
    consignee: "", shipper: "", goingto: "", type: "",
  });

  const [perKilo, setPerKilo] = useState({
    waybillno: "", wb_description: "", unit: "", quantity: "", kilo_quantity: "", declared_value2: "",  
    consignee: "", shipper: "", goingto: "", type: "",
  });

  const [specificItem, setSpecificItem] = useState ({
    waybillno: "", wb_description: "", unit: "", quantity: "", declared_value2: "",  cus_specialitem_remarks: "", cus_specialitem_id: "",
    consignee: "", shipper: "", goingto: "", type: "",
  });


  const shouldShowConsigneeButton = 
  formData.type === "account" || 
  formData.type === "prepaid";

  const shouldShowShipperButton = 
  formData.type === "collect" ||
  formData.type === "servicecargo";

  const [errors, setErrors] = useState({});
  const [errorShipper, setErrorShipper] = useState({});
  const [errorConsignee, setErrorConsignee] = useState({});
  const [success, setSuccess] = useState(false);
  const [errorPerCBM, setErrorPerCBM] = useState({});
  const [errorAdvalorem, setErrorAdvalorem] = useState({});
  const [errorPerKilo, setErrorPerKilo] = useState({});
  const [errorSpecialItem, setErrorSpecialItem] = useState({});

  const changePage = (i) => {
    setCurrentPage(i);
    const startItem = (i - 1) * dataPerPage;
    setSortdata(destination.slice(startItem, startItem + dataPerPage));
  };


  //Measurement Row Increment ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  const handleMeasurement = (index, field, value) => {
    const updated = [...measurements];
    updated[index][field] = value;
    setMeasurements(updated);
  };

  const addRow = () => {
    setMeasurements([
      ...measurements,
      { length: "", width: "", height: "", quantity: "", unit: "" }
    ]);
  };

  const deleteRow = (index) => {
    const updated = measurements.filter((_, i) => i !== index);
    setMeasurements(updated);
  };
  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  //Search and Table Sorting
  async function searchTable() {
    const filtered = destination.filter(rec => 
      rec.destination.toLowerCase().includes(search.toLowerCase())
    ).slice(0, dataPerPage);
    setSortdata(filtered);
    setCurrentPage(1);
  }
  useEffect(() => {
    searchTable();
  }, [search]);

  useEffect(() => {
    const sorted = sortData(sortdata, sorting);
    setSortdata(sorted);
  }, [sorting]);
  //~~~~~~~~~~~~~~~~~~~~~~~~~~

  //Branch Dropdown
  const branchOptions = branch.reduce((acc, rec) => {
    const branchGroup = acc[rec.type] || [];
    return {
      ...acc, [rec.type]: [...branchGroup, rec]
  }}, {});

  //Datepicker
  useEffect(() => {
    if (!filters.dob) {
      const today = new Date().toISOString().split("T")[0]; // "YYYY-MM-DD"
      setFilters((prev) => ({ ...prev, dob: today }));
    }
  }, []);

  const datePickerChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value, // this will be in "YYYY-MM-DD" format automatically
    }));
    console.log("Selected date:", value); // already in "YYYY-MM-DD"
  };


  // Get Employee
  async function getMasterlist() {
    const res = await fetch("/api/masterlists");
    const data = await res.json();
    if(res.ok) {
      setMasterlist(data);
    }
  }
  useEffect(() => {
      getMasterlist();
    }, []);


  // Get Branch
  async function getBranch() {
    const res = await fetch("/api/branchdata", {
      method: "get",  
      headers: {
        Authorization: `Bearer ${token}`,
      },
  });
    const data = await res.json();
    if(res.ok) {
      setBranch(data);
    }
  }
  useEffect(() => {
    getBranch();
  }, []);


  // Get WaybillNo
  async function getWaybillNo() {
    const res = await fetch(`/api/getwaybillno/${user.id}`, {
      method: "get",  
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json();
    if(res.ok) {
      setWbno(`${user.branch}-${String(user.id).padStart(4, '0')}-${data.waybill_no}`);
    }
  }
  useEffect(() => {
    getWaybillNo();
  }, []);


  // Get Customer Special Item
  async function getCustomerSpecialItem() {
    const queryParams = new URLSearchParams({
      consignee: formData.consignee || '',
      shipper: formData.shipper || '',
      type: formData.type || '',
      goingto: custData.branch_id ? custData.branch_id : formData.destination_to,
    });

    const res = await fetch(`/api/getcustomerspecialitem?${queryParams.toString()}`, {
      method: "get",  
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json();
    if(res.ok) {
      setCustSpecialItem(data);
    }
  }


  // Get Special Item Details
  async function getSpecialItemDetails(id) {
    isLoading();
    const res = await fetch(`/api/specialitem/${id}`, {
      method: "get",  
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json();
    console.log(data);
    if(res.ok) {
      setSpecificItem(prev => ({
        ...prev,
        unit: data.unit,
        rate: parseFloat(data.rate_php).toFixed(2),
      }));
    }
    stopLoading();
  }


  // Add Waybill
  async function handleCreate(e) {
    e.preventDefault();
    const res = await fetch("/api/waybillheader", {
        method: "post",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
    });
    const data = await res.json()
    console.log(data);
    if (data.errors) {
      setErrors(data.errors);
    } else {
      setOpen(true);
      setStatus(1);
      setFormData({});
    }
  }


  // Add Shipper
  async function handleCreateShipper(e) {
    e.preventDefault();
    isLoading();
    const res = await fetch("/api/addcustomerwaybillshipper", {
        method: "post",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formShipper),
    });
    const data = await res.json();

    if (data.errors) {
      setErrorShipper(data.errors);
    } else {
      setSuccess(true);
      setErrorShipper({});
      setFormShipper({ registered_name: "",
        contact_person: "", address: "",
        contact_number: "", mobile_number: "",
        cust_uniq_id: "",
      });
    }
    stopLoading();
  }


  // Add Consignee
  async function handleCreateConsignee(e) {
    e.preventDefault();
    isLoading();
    const res = await fetch("/api/addcustomerwaybillconsignee", {
        method: "post",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formConsignee),
    });
    const data = await res.json()

    if (data.errors) {
      setErrorConsignee(data.errors);
    } else {
      setSuccess(true);
      setErrorConsignee({});
      setFormConsignee({ cust_uniq_id: "", registered_name: "",
        contact_person: "", address: "", contact_number: "",
        mobile_number: "", branch_address: "", rate_cbm: "",
        rate_kilo: "", value_charge: "", advalorem: "", minimum: "",
        account_type: "",
      });
    }
    stopLoading();
  }

   useEffect(() => {
    setFormConsignee(prev => ({
      ...prev,
      cust_uniq_id: formData.shipper
    }));
  }, [formData.shipper]);


  useEffect(() => {
    setFormConsignee(prev => ({
      ...prev,
      account_type: formData.type
    }));
  }, [formData.type]);


  useEffect(() => {
    setFormShipper(prev => ({
      ...prev,
      cust_uniq_id: formData.consignee
    }));
  }, [formData.consignee]);


  useEffect(() => {
    if (custData.branch_id) {
      setFormData(prev => ({
        ...prev,
        destination_to: custData.branch_id,
      }));
    }
  }, [custData.branch_id]);


  useEffect(() => {
    setPerCBM(prev => ({
      ...prev,
      consignee: formData.consignee,
      shipper: formData.shipper,
      goingto: custData.branch_id ? custData.branch_id : formData.destination_to,
      account_type: formData.type,
    }));

    setAdvaloremData(prev => ({
      ...prev,
      consignee: formData.consignee,
      shipper: formData.shipper,
      goingto: custData.branch_id ? custData.branch_id : formData.destination_to,
    }));

    setPerKilo(prev => ({
      ...prev,
      consignee: formData.consignee,
      shipper: formData.shipper,
      goingto: custData.branch_id ? custData.branch_id : formData.destination_to,
      type: formData.type,
    }));

    setSpecificItem(prev => ({
      ...prev,
      consignee: formData.consignee,
      shipper: formData.shipper,
      goingto: custData.branch_id ? custData.branch_id : formData.destination_to,
      type: formData.type,
    }));
  }, [formData.consignee, formData.shipper, formData.destination_to]);



  async function closeCreate() {
    setOpen(false);
    setOpenAddDial(false);
  }


// Get Shipper
  async function getWaybillShipper(type_id) {
    isLoading();
      const res = await fetch(`/api/getwaybillshipper/${type_id}`, {
        method: "get",  
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if(res.ok) {
        setCustShipper(data);
        setCustData({branch_id: "", charge_to: "",
           address: "", terms: "", minimum: ""});
      }  
    stopLoading();
  }
  useEffect(() => {
    getWaybillShipper(selectedCusttype);
  }, [selectedCusttype]);


  // Get Consignee
  async function getWaybillConsignee(type_id) {
    isLoading();
      const res = await fetch(`/api/getwaybillconsignee/${type_id}`, {
        method: "get",  
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if(res.ok) {
        setCustConsignee(data);
        setCustData({branch_id: "", charge_to: "",
           address: "", terms: "", minimum: ""});
      }  
    stopLoading();
  }
  useEffect(() => {
    getWaybillConsignee(selectedCusttype);
  }, [selectedCusttype]);


  // Get Shipper-Consignee
  async function getShipperConsignee(id) {
    isLoading();
      const res = await fetch(`/api/getshipperconsignee/${id}?type=${formData.type}`, {
        method: "get",  
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if(res.ok) {
        setCustConsignee(data);
      }  
    stopLoading();
  }
  useEffect(() => {
    getShipperConsignee(selectedShipper);
  }, [selectedShipper]);


  // Get Consignee-Shipper
  async function getConsigneeShipper(id) {
    isLoading();
      const res = await fetch(`/api/getconsigneeshipper/${id}?type=${formData.type}`, {
        method: "get",  
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if(res.ok) {
        setCustShipper(data);
      }  
    stopLoading();
  }
  useEffect(() => {
    getConsigneeShipper(selectedConsignee);
  }, [selectedConsignee]);


  // Get Customer Details
  async function getCustomerDetails(id) {
    if(id){
      const res = await fetch(`/api/customer/${id}`, {
        method: "get",  
        headers: {
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


  // Save Per CBM
  async function createPerCBM(e) {
    e.preventDefault();
    isLoading();
    const res = await fetch("/api/savepercbm", {
        method: "post",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(perCBM),
    });
    const data = await res.json();
    console.log(data);
    if (data.errors) {
      setErrorAdvalorem(data.errors);
    } else {
      setShowSuccess(true);
      setErrorPerCBM({});
      setPerCBM({
        wb_description: "",
        unit: "",
        quantity: "",
        declared_value2: "",
        type: "",
      });
    }
    stopLoading();
  }


  // Save Advalorem
  async function createAdvalorem(e) {
    e.preventDefault();
    isLoading();
    const res = await fetch("/api/saveadvalorem", {
        method: "post",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(advaloremData),
    });
    const data = await res.json();
    console.log(data);
    if (data.errors) {
      setErrorAdvalorem(data.errors);
    } else {
      setShowSuccess(true);
      setErrorAdvalorem({});
      setAdvaloremData({
        wb_description: "",
        unit: "",
        quantity: "",
        declared_value2: "",
      });
    }
    stopLoading();
  }


  // Save Per Kilo
  async function createPerKilo(e) {
    e.preventDefault();
    isLoading();
    const res = await fetch("/api/saveperkilo", {
        method: "post",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(perKilo),
    });
    const data = await res.json();
    console.log(data);
    if (data.errors) {
      setErrorPerKilo(data.errors);
    } else {
      setShowSuccess(true);
      setErrorPerKilo({});
      setPerKilo({
        wb_description: "",
        unit: "",
        quantity: "",
        declared_value2: "",
        kilo_quantity: "",
      });
    }
    stopLoading();
  }


  // Save Special Item
  async function createSpecialItem(e) {
    e.preventDefault();
    isLoading();
    const res = await fetch("/api/savespecialitem", {
        method: "post",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(specificItem),
    });
    const data = await res.json();
    console.log(data);
    if (data.errors) {
      setErrorSpecialItem(data.errors);
    } else {
      setShowSuccess(true);
      setErrorSpecialItem({});
      setSpecificItem({
        cus_specialitem_id: "",
        wb_description: "",
        unit: "",
        rate: "",
        quantity: "",
        declared_value2: "",
        cus_specialitem_remarks: "",
      });
    }
    stopLoading();
  }



  const handleClearOption = () => {
    setFormData({ ...formData, glass: "", liquid: "",
      breakable: "", food: "", perishable: "" });
  };


  const openDialLookup = () => {
    const { type, shipper, consignee } = formData;

    if (!type) {
      setOpenLookUpPopUp(true);
      setLookUpCaption("Please select Account Type.");
    } else if (type === "collect" && !consignee) {
      setOpenLookUpPopUp(true);
      setLookUpCaption("Please select Consignee.");
    } else if (["account", "prepaid", "servicecargo"].includes(type) && !shipper) {
      setOpenLookUpPopUp(true);
      setLookUpCaption("Please select Shipper.");
    } else if (!shipper || !consignee) {
      setOpenLookUpPopUp(true);
      setLookUpCaption(
      !shipper
        ? "Please select Shipper."
        : "Please select Consignee."
    ) ;
    } else {
      setOpenLookUp(true);
    }
  };

  
  const openConsignee = () => {
    if(!formData.shipper){
      setOpenLookUpPopUp(true);
      setLookUpCaption("Please select Shipper to add new Consignee.");
    } else {
    setOpenAddConsignee(true);
    }
  };


  const openShipper = () => {
    if(!formData.consignee){
      setOpenLookUpPopUp(true);
      setLookUpCaption("Please select Consignee to add new Shipper.");
    } else {
    setOpenAddShipper(true);
    }
  };


  // const errorDisplay = () => {
  //   const errorRef = useRef(null);

  //   useEffect(() => {
  //     if (Object.keys(errors).length > 0 && errorRef.current) {
  //       errorRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
  //     }
  //   }, [errors]);

  //   const entries = Object.entries(errors);
  //   if (entries.length === 0) return null;

  //   const [firstKey, firstMessages] = entries[0];

  //   return (
  //     <div ref={errorRef} className="animate-fade-pulse error text-red-700 text-left border bg-red-100 p-4 rounded mb-2 scroll-mt-24">
  //       {firstMessages[0]}{" "}
  //       {entries.length > 1 && (
  //         <span className="ml-2 text-sm text-red-500">
  //           (+{entries.length - 1} more error{entries.length - 1 > 1 ? "s" : ""})
  //         </span>
  //       )}
  //     </div>
  //   );
  // };

  // const SuccessDisplay = ({ success }) => {
  //   const successRef = useRef(null);
  //   useEffect(() => {
  //     if (success && successRef.current) {
  //       successRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
  //     }
  //   }, [success]);
  //   if (!success) return null;
  //   return (
  //     <div ref={successRef} className="animate-fade-pulse text-green-700 text-left border border-green-300 bg-green-100 p-4 rounded mb-2 scroll-mt-24" >
  //       ✅ Customer successfully added!
  //     </div>
  //   );
  // };


  
  return (
    <> 
    <div className="flex items-center font-medium border-b border-slate-300 w-full">
      <main className="px-4 flex-1 mx-auto py-4"><h1>Core Modules - Waybill Entry</h1></main>
    </div>
    <div className="flex items-center font-medium flex-1 mx-auto py-4">
      <main className="flex-1 mx-auto p-4">
        <div className="mx-auto">
          <div className="bg-gray-50 shadow-md border mb-20">
            <div className="p-6 text-gray-900">
              <div className="text-left caption-top dark:text-gray-800">
              </div>
              <form onSubmit={handleCreate}>
              <ErrorDisplay errors={errors} />
              <div className="py-4 flex w-full mx-auto space-y-6">
              <div className="w-full mx-auto space-y-6">
              <div className='border p-2 bg-gray-100'>
                <div className='flex flex-row'>
                  <div className='p-4 w-1/2'>
                    <label>Branch:</label>   
                    <select className='mb-4 form-select text-gray-800 bg-white text-sm px-4 w-full py-3 border border-gray-300 rounded-md outline-blue-500' value={formData.destination_to || ""} onChange={(e) => {setFormData({ ...formData, destination_to: e.target.value })}}>
                        <option value="">{custData.branch_id || "-" }</option>
                        {Object.keys(branchOptions).map((type) => (
                        <optgroup label={type} key={type}>
                          {branchOptions[type].map(({str_list_id}) => (
                            <option key={str_list_id}>{str_list_id}</option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                    
                    <label>System Waybill Number:</label>   
                    <input className="mb-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="Waybill Number" value={formData.waybillno = wbno} onChange={(e) => setFormData({ ...formData, waybillno: e.target.value })} disabled/>

                    <label>Waybill Reference Number:</label>   
                    <input className="mb-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="Waybill Ref Number" value={formData.hwaybillnumber} onChange={(e) => setFormData({ ...formData, hwaybillnumber: e.target.value })} />

                    <label>CRS Number:</label>   
                    <input className="mb-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="CRS Number" value={formData.crs_number} onChange={(e) => setFormData({ ...formData, crs_number: e.target.value })} />

                    <div className='flex space-x-2'>
                      <div className='w-1/2'>Customer Type:</div>
                      <div className='w-1/2'>Mode of Transaction:</div>
                    </div>
                    <div className='flex flex-row space-x-2 mb-4'> 
                      <select className='form-select text-gray-800 bg-white text-sm px-4 w-full py-3 border border-gray-300 rounded-md outline-blue-500'
                        onChange={(e) => {setFormData({ ...formData, type: e.target.value }); setSelectedCusttype(e.target.value)}}>
                        <option value="">Select Customer Type</option>
                        <option value="collect">1 - Freight Collect</option>
                        <option value="account">2 - Account</option>
                        <option value="prepaid">3 - Prepaid</option>
                        <option value="servicecargo">4 - Service Cargo</option>
                      </select>
  
                      <select className='form-select text-gray-800 bg-white text-sm px-4 w-full py-3 border border-gray-300 rounded-md outline-blue-500'
                        onChange={(e) => {setFormData({ ...formData, modeoftransaction: e.target.value })}}>
                        <option value="">Select A Transport</option>
                        <option value="Air">1 - Air</option>
                        <option value="Land">2 - Land</option>
                        <option value="Sea">3 - Sea</option>
                      </select>
                    </div>

                    {formData.type === "prepaid" &&
                      <label className="flex items-center space-x-2 -mt-3 mb-4">
                        <input type="checkbox" className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" checked={formData.ptf_status === true} onChange={(e) => setFormData({ ...formData, ptf_status: e.target.checked})} />
                        <span className='text-orange-600 font-semibold'> PAYMENT TO FOLLOW </span>
                      </label>
                    }

                    <label>Charge To:</label>   
                    <input className="mb-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="Charge To" value={formData.charge_to = custData.charge_to} onChange={(e) => setFormData({ ...formData, charge_to: e.target.value })} />

                    <label>Shipper:</label>   
                    <select className='mb-4 form-select text-gray-800 bg-white text-sm px-4 w-full py-3 border border-gray-300 rounded-md outline-blue-500'
                      onChange={(e) => {
                        const value = e.target.value;
                        if(!formData.consignee) {
                          getShipperConsignee(value);
                          getCustomerDetails(value);
                        }
                        setFormData({ ...formData, shipper: e.target.value })}}>
                      <option value="">Select A Shipper</option>
                        {custShipper.length > 0 ? (custShipper.map((rec, key) =>(
                          <option key={key} value={rec.id}>{rec.id + " - " + rec.registered_name}</option>
                        ))) : (
                          <option>Empty Record</option>
                        )}
                    </select>

                    {shouldShowShipperButton && (
                    <div className="flex justify-end -mt-2">
                      <button type='button' onClick={() => {openShipper(); setErrorShipper(false)}} className="flex primary-btn py-1 px-4 text-xs tracking-wider rounded-md text-white bg-gray-800 hover:bg-gray-600 focus:outline-none"><FaUserPlus size={15} className='mr-1'/> Insert Shipper </button>
                    </div>
                    )}

                    <label>Consignee:</label>   
                    <select className='mb-4 form-select text-gray-800 bg-white text-sm px-4 w-full py-3 border border-gray-300 rounded-md outline-blue-500'
                      onChange={(e) => { 
                        const value = e.target.value;
                        if(!formData.shipper) {
                          getConsigneeShipper(value);
                          getCustomerDetails(value);
                        }
                        setFormData({ ...formData, consignee: e.target.value })}}>
                      <option value="">Select A Consignee</option>
                        {custConsignee.length > 0 ? (custConsignee.map((rec, key) => (
                          <option key={key} value={rec.id}>{rec.id + " - " + rec.registered_name}</option>
                        ))) : (
                          <option>Empty Record</option>
                        )}
                    </select>

                    {shouldShowConsigneeButton && (
                    <div className="flex justify-end -mt-2">
                      <button type='button' onClick={() => {openConsignee(); setErrorConsignee(false)}} className="flex primary-btn py-1 px-4 text-xs tracking-wider rounded-md text-white bg-gray-800 hover:bg-gray-600 focus:outline-none"><FaUserPlus size={15} className='mr-1'/> Insert Consignee </button>
                    </div>
                    )}

                    <label>Address:</label>   
                    <input className="mb-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="Address" value={formData.address = custData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />

                    <div className='flex space-x-2'>
                      <div className='w-1/2'>Mobile Number:</div>
                      <div className='w-1/2'>Landline Number:</div>
                    </div>  
                    <div className='flex flex-row space-x-2'> 
                      <input className="mb-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="Mobile Number" value={formData.mobile_number} onChange={(e) => setFormData({ ...formData, mobile_number: e.target.value })} />
                      
                      <input className="mb-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="Landline Number" value={formData.contact_number} onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })} />
                    </div>
                    
                    <div className='flex space-x-2'>
                      <div className='w-1/2'>Destination From:</div>
                      <div className='w-1/2'>Destination To:</div>
                    </div>
                    <div className='mb-4 flex flex-row space-x-2'> 
                      <select className='form-select bg-white text-sm px-3 w-1/2 py-3 border border-gray-300 rounded-md outline-blue-500' onChange={(e) => {setFormData({ ...formData, destination_from: e.target.value }); setSelectedBranch(e.target.value)}}>
                        <option value="">From</option>
                        {Object.keys(branchOptions).map((type) => (
                          <optgroup label={type} key={type}>
                            {branchOptions[type].map(({str_list_id}) => (
                              <option key={str_list_id}>{str_list_id}</option>
                            ))}
                          </optgroup>
                        ))}
                      </select>
                        
                      <select className='form-select text-gray-800 bg-white text-sm px-4 w-1/2 py-3 border border-gray-300 rounded-md outline-blue-500'
                        onChange={(e) => {setFormData({ ...formData, destination_to: e.target.value })}}>
                          <option value="">Destination To</option>
                          {Object.keys(branchOptions).map((type) => (
                          <optgroup label={type} key={type}>
                            {branchOptions[type].map(({str_list_id}) => (
                              <option key={str_list_id}>{str_list_id}</option>
                            ))}
                          </optgroup>
                        ))}
                      </select>
                    </div>

                    <label>Memo (Notes):</label>   
                    <textarea className="mb-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" placeholder="Memo (Notes)" value={formData.memo} onChange={(e) => setFormData({ ...formData, memo: e.target.value })} />

                    <div className='border border-slate-300 rounded-md p-4'>
                      <label className="flex items-center space-x-2 pb-2">
                        <input type="checkbox" className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" checked={formData.shipper_own_risk === true} onChange={(e) => setFormData({ ...formData, shipper_own_risk: e.target.checked})} />
                        <span> Shipper's Own Risk</span>
                      </label>

                      <label className="flex items-center space-x-2 pb-2">
                        <input type="checkbox" className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" checked={formData.send_sms === true} onChange={(e) => setFormData({ ...formData, send_sms: e.target.checked})} />
                        <span> Send SMS</span>
                      </label>

                      <label className="flex items-center space-x-2">
                        <input type="checkbox" className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" checked={formData.wb_missing_status === true} onChange={(e) => setFormData({ ...formData, wb_missing_status: e.target.checked})} />
                        <span>WB Missing Status</span>
                      </label>
                    </div>
                  </div>

                  <div className='p-4 w-1/2'>
                    <label>Transaction Date:</label>   
                    <input name='dob' className="mb-4 register-link px-4 py-3 w-full border border-gray-300 text-sm text-gray-800 rounded-md outline-blue-500" type="date" value={formData.waybilldate = filters.dob} onChange={datePickerChange} />

                    <label>Customer Status:</label>   
                    <input className="mb-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="Customer Status" value={formData.ptf_status} onChange={(e) => setFormData({ ...formData, ptf_status: e.target.value })} />

                    <label>Terms:</label>   
                    <input className="mb-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="Terms" value={formData.terms = custData.terms} onChange={(e) => setFormData({ ...formData, terms: e.target.value })} />

                    <label>Customer Minimum:</label>   
                    <input className="mb-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="Customer Minimum" value={formData.customer_minimum = custData.minimum} onChange={(e) => setFormData({ ...formData, customer_minimum: e.target.value })} />

                    <label>Encoder:</label> 
                    <input className="mb-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="Branch" value={user.name} onChange={(e) => setFormData({ ...formData, encoder: e.target.value })} disabled/>
                        
                    <div className='flex space-x-2'>
                      <div className='w-1/2'>Encoded:</div>
                      <div className='w-1/2'>Time Encoded:</div>
                    </div>
                    <div className='flex flex-row space-x-2'>    
                      <input name='dob' className="mb-4 register-link px-4 py-3 w-1/2 border border-gray-300 text-sm text-gray-800 rounded-md outline-blue-500" type="date" value={formData.encoded} readOnly/>
                      <div className='w-1/2 flex'><div className='flex ml-4 mb-3 items-center'><RunningClock /></div></div>
                    </div>

                    <label>Appraised By:</label>   
                    <select className='mb-4 form-select text-gray-800 bg-white text-sm px-4 w-full py-3 border border-gray-300 rounded-md outline-blue-500' onChange={(e) => setFormData({ ...formData, appraiser: e.target.value })}>
                      <option value="">Select Employee</option>
                      {masterlist.map((rec, key) =>(
                      <option value={rec.id} key={key}>{rec.first_name + " " + rec.last_name}</option>
                      ))}
                    </select>

                    <label>Pick-Up By:</label>   
                    <select className='mb-4 form-select text-gray-800 bg-white text-sm px-4 w-full py-3 border border-gray-300 rounded-md outline-blue-500' onChange={(e) => setFormData({ ...formData, pickupby: e.target.value })}>
                      <option value="">Select Employee</option>
                      {masterlist.map((rec, key) =>(
                      <option value={rec.id} key={key}>{rec.first_name + " " + rec.last_name}</option>
                      ))}
                    </select>

                    <label>Typist/Prepared By:</label>   
                    <select className='mb-4 form-select text-gray-800 bg-white text-sm px-4 w-full py-3 border border-gray-300 rounded-md outline-blue-500' onChange={(e) => setFormData({ ...formData, typist_name: e.target.value })}>
                      <option value="">Typist Name/Prepared By</option>
                      {masterlist.map((rec, key) =>(
                      <option value={rec.id} key={key}>{rec.first_name + " " + rec.last_name}</option>
                      ))}
                    </select>

                    <label>Customer DR Attachments Needed:</label>   
                    <textarea className="mb-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" placeholder="Customer DR Attachments Needed" value={formData.customer_dr_attachment} onChange={(e) => setFormData({ ...formData, customer_dr_attachment: e.target.value })} />

                    <label>Rates To Apply:</label>   
                    <textarea className="mb-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" placeholder="Rates To Apply" value={formData.rates_to_apply} onChange={(e) => setFormData({ ...formData, rates_to_apply: e.target.value })} />    

                    <div className='border border-slate-300 rounded-md p-4'>
                      <div className='flex pb-2'>
                        <label className="flex items-center space-x-2 w-1/2">
                          <input type="radio" name="glassOption" value="y" checked={formData.glass === "y"} className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" onChange={(e) => setFormData({ ...formData, glass: e.target.value })} />
                          <span>With Glass</span>
                        </label>   
                        <label className="flex items-center space-x-2 w-1/2">
                          <input type="radio" name="glassOption" value="n" checked={formData.glass === "n"} className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" onChange={(e) => setFormData({ ...formData, glass: e.target.value })} />
                          <span>Without Glass</span>
                        </label>
                      </div>
                      <div className='flex pb-2'>
                        <label className="flex items-center space-x-2 w-1/2">
                          <input type="radio" name="liquidOption" value="y" checked={formData.liquid === "y"} className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" onChange={(e) => setFormData({ ...formData, liquid: e.target.value })} />
                          <span>Liquid</span>
                        </label>   
                        <label className="flex items-center space-x-2 w-1/2">
                          <input type="radio" name="liquidOption" value="n" checked={formData.liquid === "n"} className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" onChange={(e) => setFormData({ ...formData, liquid: e.target.value })} />
                          <span>Non-Liquid</span>
                        </label>  
                      </div>
                      <div className='flex pb-2'>
                        <label className="flex items-center space-x-2 w-1/2">
                          <input type="radio" name="breakable" value="y" checked={formData.breakable ==="y"} className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" onChange={(e) => setFormData({ ...formData, breakable: e.target.value })} />
                          <span>Breakable</span>
                        </label>   
                        <label className="flex items-center space-x-2 w-1/2">
                          <input type="radio" name="breakable" value="n" checked={formData.breakable ==="n"} className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" onChange={(e) => setFormData({ ...formData, breakable: e.target.value })} />
                          <span>Non-Breakable</span>
                        </label>  
                      </div>
                      <div className='flex'>
                        <label className="flex items-center space-x-2 w-1/2">
                          <input type="radio" name="food" value="y" checked={formData.food === "y"} className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" onChange={(e) => setFormData({ ...formData, food: e.target.value, perishable: "p" })} />
                          <span>Food</span>
                        </label>   
                        <label className="flex items-center space-x-2 w-1/2">
                          <input type="radio" name="food" value="n" checked={formData.food === "n"} className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" onChange={(e) => setFormData({ ...formData, food: e.target.value, perishable: "" })} />
                          <span>Non-Food</span>
                        </label>  
                      </div>
                      <div className='ml-8 text-sm'>
                        <label className="flex items-center space-x-2 w-1/2">
                          <input type="radio" name="perishable" value="p" disabled={formData.food ==="n"} checked={formData.perishable === "p"} className="h-3 w-3 text-blue-600 border-gray-300 rounded focus:ring-blue-500" onChange={(e) => setFormData({ ...formData, perishable: e.target.value })} />
                          <span>Perishable</span>
                        </label>   
                        <label className="flex items-center space-x-2 w-1/2">
                          <input type="radio" name="perishable" value="n" disabled={formData.food ==="n"} checked={formData.perishable === "n"} className="h-3 w-3 text-blue-600 border-gray-300 rounded focus:ring-blue-500" onChange={(e) => setFormData({ ...formData, perishable: e.target.value })} />
                          <span>Non-Perishable</span>
                        </label>  
                      </div>
                    </div>
                    <div className="flex justify-end pt-2">
                      <button type="button" onClick={handleClearOption} className="primary-btn py-1 px-6 text-sm tracking-wider font-semibold rounded-md text-white bg-gray-800 hover:bg-gray-600 focus:outline-none"> Clear </button>
                    </div>
                  </div>
                </div>
                <div className='flex p-4'>
                  <div className="flex space-x-2">
                    <button type="button" onClick={() => {openDialLookup(); setErrors(false); setErrorAdvalorem({}); setShowSuccess(false); getCustomerSpecialItem();}} className="flex primary-btn py-3 px-4 text-sm tracking-wider font-semibold rounded-md text-white bg-gray-800 hover:bg-gray-600 focus:outline-none"><FaSearch size={18}/>&nbsp;Look Up [F2] </button>

                    <button type="button" onClick={() => {setOpenOtherCharge(true); setErrors(false)}} className="flex primary-btn py-3 px-4 text-sm tracking-wider font-semibold rounded-md text-white bg-gray-800 hover:bg-gray-600 focus:outline-none"><FaPlus size={18}/>&nbsp;Other Charge </button>

                    <button className="flex primary-btn py-3 px-4 text-sm tracking-wider font-semibold rounded-md text-white bg-gray-800 hover:bg-gray-600 focus:outline-none"><FaSave size={18}/>&nbsp;Save Waybill [F4] </button>

                    <button onClick={() => openUpdate(formData.id)} className="flex primary-btn py-3 px-4 text-sm tracking-wider font-semibold rounded-md text-white bg-gray-800 hover:bg-gray-600 focus:outline-none"><FaReply size={18}/>&nbsp;Create New Waybill [F5] </button>
                  </div> 
                </div>
              </div>
              <div className='border bg-gray-100'>
                <div>
                  <div className='flex ml-4 mt-4'>
                    <FaRegListAlt size={25} />&nbsp;<h1>Waybill Item</h1>
                  </div>
                  <div className='flex pb-4'>
                    <div className={`p-4 overflow-x-auto transition-all duration-75 min-w-0 mx-auto ${isMediumScreen ? "w-[calc(100vw-22rem)]" : "w-[calc(100vw-9rem)]"}`}>
                      <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                        <caption className="text-left caption-top dark:text-gray-800">
                          <div className="flex flex-row py-2">
                            <div className="flex w-full"></div>
                          </div>
                        </caption>
                          <thead className="text-sm  text-center uppercase bg-gray-200 text-gray-800 border-b border-t border-gray-300">
                            <tr className="text-nowrap">
                            <th className="px-3 py-3">Computed Volume</th>
                            <th className="px-3 py-3">Unit</th>
                            <th className="px-3 py-3">Published Rate</th>
                            <th className="px-3 py-3">Description</th>
                            <th className="px-3 py-3">Freight Charge</th>
                            </tr>
                          </thead>
                          <tbody className="text-sm text-center bg-gray-50 dark:bg-gray-700 dark:text-gray-800 border-b-2 border-gray-300">
                          {destination.length < 0 ? (destination.map(rec => (
                            <tr className="text-sm bg-white border-b dark:bg-gray-50 dark:border-gray-300" key={rec.id}>     
                              <th className="px-3 py-3">
                                <Link className="font-medium text-blue-600 dark:text-blue-500 hover:underline mx-1">{rec.id}
                                </Link>
                              </th>
                              <td className="px-3 py-3">{rec.department}</td>
                            </tr>
                          ))) : (
                            <tr className='text-xs bg-white border-b dark:bg-gray-100 dark:border-gray-300'>
                              <td className='px-3 py-3 text-center' colSpan={5}>No Data</td>
                            </tr>
                          )}
                        </tbody>                        
                      </table>
                    </div>
                  </div>
                  <hr />
                  <div className="grid grid-cols-3 gap-4 p-4">
                    <div className="flex flex-col items-start">
                      <span className="text-gray-700">Subtotal</span>
                      <span className="text-green-700 text-2xl mt-8">0.00</span>
                    </div>
                    <div className="flex flex-col items-start">
                      <span className="text-gray-700">Value Added Tax (VAT) @ 12%</span>
                      <span className="text-green-700 text-2xl mt-8">0.00</span>
                    </div>
                    <div className="flex flex-col items-start">
                      <span className="text-gray-700">Total Freight Charge</span>
                      <span className="text-green-700 text-2xl mt-8">0.00</span>
                    </div>
                  </div>
                </div>
              </div>
              </div>
              </div>
              </form>
            </div>
          </div>
        </div>  
      </main> 
    </div>


    {/* Add Customer Shipper */}
      <Dialog open={openAddShipper} onClose={setOpenAddShipper} className="relative z-[999]">
        <DialogBackdrop
            transition
            className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
        />
  
        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <DialogPanel transition className="relative transform overflow-hidden rounded-lg transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-screen-sm data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"> 
  
              <div className="flex flex-col font-[sans-serif]">
                <div className="w-full mx-auto border border-gray-300 rounded-2xl p-8 bg-gray-50">
                  <div className="text-center mb-4">
                    <h1 className="text-2xl text-left pb-6 flex"><FaUserPlus size={30} className='mr-1'/> Add Customer Shipper </h1>
                  <SuccessDisplay success={success} />
                  <form onSubmit={handleCreateShipper} className='w-full mx-auto space-y-6'>
                  <div className='text-left border p-2 bg-gray-100'>
                    <div className='flex flex-row'>
                      <div className='p-2 w-full'>
                        <label>Registered Name</label>
                        <input className="mb-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="Registered Name" value={formShipper.registered_name}
                            onChange={(e) => setFormShipper({ ...formShipper, registered_name: e.target.value })}
                        />
                          {errorShipper.registered_name && <p className="error text-red-700 text-right ml-2 -mt-4">{errorShipper.registered_name[0]}</p>}
  
                        <label>Contact Person</label>
                        <input className="mb-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="Contact Person" value={formShipper.contact_person}
                            onChange={(e) => setFormShipper({ ...formShipper, contact_person: e.target.value })}
                        />
  
                        <label>Address</label>
                        <input className="mb-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="Address" value={formShipper.address}
                            onChange={(e) => setFormShipper({ ...formShipper, address: e.target.value })}
                        />
                        {errorShipper.address && <p className="error text-red-700 text-right ml-2 -mt-4">{errorShipper.address[0]}</p>}

                        <label>Landline Number</label>
                        <input className=" mb-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="Land Line Number" value={formShipper.contact_number}
                            onChange={(e) => setFormShipper({ ...formShipper, contact_number: e.target.value })}
                        />
  
                        <label className='flex'>Mobile Number <p className='text-red-700'>&nbsp;(International Format: 9123456789) Required!</p></label>
                        <input className=" mb-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="Mobile Number" value={formShipper.mobile_number}
                            onChange={(e) => setFormShipper({ ...formShipper, mobile_number: e.target.value })}
                        />
                          {errorShipper.mobile_number && <p className="error text-red-700 text-right ml-2 -mt-4">{errorShipper.mobile_number[0]}</p>}

                        <input type='text' value={formShipper.cust_uniq_id} onChange={(e) => setFormShipper({ ...formShipper, cust_uniq_id: e.target.value })} hidden/>
                      </div>        
                    </div>
                    </div>
  
                      <div className="!mt-8 float-right">
                        <button className="primary-btn py-3 px-4 text-sm tracking-wider font-semibold rounded-md text-white bg-gray-800 hover:bg-gray-600 focus:outline-none"> Add Shipper </button>
                      </div> 
                  </form>
                      <div className="!mt-8 float-right">
                        <button onClick={() => setOpenAddShipper(false)} className="primary-btn py-3 px-10 mr-4 text-sm tracking-wider font-semibold rounded-md text-white bg-gray-500 hover:bg-gray-600 focus:outline-none"> Cancel </button>
                      </div>
                  </div>
                </div>
              </div>
              </DialogPanel>
            </div>
        </div>
      </Dialog>

    {/* Add Customer Consignee */}
      <Dialog open={openAddConsignee} onClose={setOpenAddConsignee} className="relative z-[999]">
        <DialogBackdrop
            transition
            className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
        />
  
        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <DialogPanel transition className="relative transform overflow-hidden rounded-lg transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-screen-sm data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"> 
  
              <div className="flex flex-col font-[sans-serif]">
                <div className="w-full mx-auto border border-gray-300 rounded-2xl p-8 bg-gray-50">
                  <div className="text-center mb-4">
                    <h1 className="text-2xl text-left pb-6 flex"><FaUserPlus size={30} className='mr-1'/> Add Customer Consignee </h1>
                  <SuccessDisplay success={success} />
                  <form onSubmit={handleCreateConsignee} className='w-full mx-auto space-y-6'>
                  <div className='text-left border p-2 bg-gray-100'>
                    <div className='flex flex-row'>
                      <div className='p-2 w-full'>
                        <label>Registered Name</label> 
                        <input className="mb-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="Registered Name" value={formConsignee.registered_name}
                            onChange={(e) => setFormConsignee({ ...formConsignee, registered_name: e.target.value })}
                        />
                          {errorConsignee.registered_name && <p className="error text-red-700 text-right ml-2 -mt-4">{errorConsignee.registered_name[0]}</p>}
  
                        <label>Contact Person</label>
                        <input className=" mb-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="Contact Person" value={formConsignee.contact_person}
                            onChange={(e) => setFormConsignee({ ...formConsignee, contact_person: e.target.value })}
                        />
  
                        <label>Address</label>
                        <input className="mb-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="Address" value={formConsignee.address}
                            onChange={(e) => setFormConsignee({ ...formConsignee, address: e.target.value })}
                        />
                          {errorConsignee.address && <p className="error text-red-700 text-right ml-2 -mt-4">{errorConsignee.address[0]}</p>}
  
                        <label>Landline Number</label>
                        <input className=" mb-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="Land Line Number" value={formConsignee.contact_number}
                            onChange={(e) => setFormConsignee({ ...formConsignee, contact_number: e.target.value })}
                        />
                          {errors.contact_number && <p className="error text-red-700 text-left ml-2">{errors.contact_number[0]}</p>}
  
                        <label className='flex'>Mobile Number <p className='text-red-700'>&nbsp;(International Format: 9123456789) Required!</p></label>
                        <input className=" mb-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="Mobile Number" value={formConsignee.mobile_number}
                            onChange={(e) => setFormConsignee({ ...formConsignee, mobile_number: e.target.value })}
                        />
                          {errorConsignee.mobile_number && <p className="error text-red-700 text-right ml-2 -mt-4">{errorConsignee.mobile_number[0]}</p>}

                        <label>Branch Address</label>   
                        <select className='mb-4 form-select text-gray-800 bg-white text-sm px-4 w-full py-3 border border-gray-300 rounded-md outline-blue-500'
                          onChange={(e) => {setFormConsignee({ ...formConsignee, branch_id: e.target.value })}}>
                            <option value="">Select Branch</option>
                            {Object.keys(branchOptions).map((type) => (
                            <optgroup label={type} key={type}>
                              {branchOptions[type].map(({str_list_id}) => (
                                <option key={str_list_id}>{str_list_id}</option>
                              ))}
                            </optgroup>
                          ))}
                        </select>
                        {errorConsignee.branch_id && <p className="error text-red-700 text-right ml-2 -mt-4">{errorConsignee.branch_id[0]}</p>}
  
                        <label>Rate/CBM</label>
                        <input className=" mb-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="Rate/CBM" value={formConsignee.rate_cbm}
                            onChange={(e) => setFormConsignee({ ...formConsignee, rate_cbm: e.target.value })}
                        />
                          {errorConsignee.rate_cbm && <p className="error text-red-700 text-right ml-2 -mt-4">{errorConsignee.rate_cbm[0]}</p>}

                        <label>Rate/Kilo</label>
                        <input className=" mb-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="Rate/Kilo" value={formConsignee.rate_kilo}
                            onChange={(e) => setFormConsignee({ ...formConsignee, rate_kilo: e.target.value })}
                        />
                          {errorConsignee.rate_kilo && <p className="error text-red-700 text-right ml-2 -mt-4">{errorConsignee.rate_kilo[0]}</p>}

                        <label>Value Charge</label>
                        <input className=" mb-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="Value Charge" value={formConsignee.value_charge}
                            onChange={(e) => setFormConsignee({ ...formConsignee, value_charge: e.target.value })}
                        />
                          {errorConsignee.value_charge && <p className="error text-red-700 text-right ml-2 -mt-4">{errorConsignee.value_charge[0]}</p>}

                        <label>Advalorem</label>
                        <input className=" mb-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="Advalorem" value={formConsignee.advalorem}
                            onChange={(e) => setFormConsignee({ ...formConsignee, advalorem: e.target.value })}
                        />
                          {errorConsignee.advalorem && <p className="error text-red-700 text-right ml-2 -mt-4">{errorConsignee.advalorem[0]}</p>}

                        <label>Minimum</label>
                        <input className=" mb-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="Minimum" value={formConsignee.minimum}
                            onChange={(e) => setFormConsignee({ ...formConsignee, minimum: e.target.value })}
                        />
                          {errorConsignee.minimum && <p className="error text-red-700 text-right ml-2 -mt-4">{errorConsignee.minimum[0]}</p>}

                        <input type='text' value={formConsignee.cust_uniq_id} onChange={(e) => setFormConsignee({ ...formConsignee, cust_uniq_id: e.target.value })} hidden/>
                        <input type='text' value={formConsignee.account_type} onChange={(e) => setFormConsignee({ ...formConsignee, account_type: e.target.value })} hidden/>
                      </div>        
                    </div>
                    </div>
  
                      <div className="!mt-8 float-right">
                        <button className="primary-btn py-3 px-4 text-sm tracking-wider font-semibold rounded-md text-white bg-gray-800 hover:bg-gray-600 focus:outline-none"> Add Consignee </button>
                      </div> 
                  </form>
                      <div className="!mt-8 float-right">
                        <button onClick={() => setOpenAddConsignee(false)} className="primary-btn py-3 px-10 mr-4 text-sm tracking-wider font-semibold rounded-md text-white bg-gray-500 hover:bg-gray-600 focus:outline-none"> Cancel </button>
                      </div>
                  </div>
                </div>
              </div>
              </DialogPanel>
            </div>
        </div>
      </Dialog>

    {/* Look Up */}
      <Dialog open={openLookUp} onClose={setOpenLookUp} className="relative z-[999]">
        <DialogBackdrop
            transition
            className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
        />
  
        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <DialogPanel transition className="relative transform overflow-hidden rounded-lg transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-screen-lg data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"> 
  
              <div className="flex flex-col font-[sans-serif]">
                <div className="w-full mx-auto border border-gray-300 rounded-2xl p-8 bg-gray-50">
                  <div className="text-center mb-4">
                    <h1 className="text-2xl justify-center text-center pb-6 flex"> Waybill Product Entry </h1>
                  
                  <div className='text-left border p-2 bg-gray-100'>
                    <div className='flex flex-row'>
                      <div className='p-2 w-full'>
              <TabGroup>
                <TabList className="text-md font-semibold space-x-1">
                  <Tab className="data-[selected]: text-gray-800 py-3 px-5 border-t border-l border-r rounded-t-md bg-slate-300 data-[selected]:sm:rounded-t-md data-[selected]:bg-white data-[selected]:border-t data-[selected]:border-l data-[selected]:border-r data-[selected]:text-gray-800">Per CBM</Tab>
                  <Tab className="text-gray-800 py-3 px-5 border-t border-l border-r rounded-t-md bg-slate-300 data-[selected]:sm:rounded-t-md data-[selected]:bg-white data-[selected]:border-t data-[selected]:border-l data-[selected]:border-r data-[selected]:text-gray-800">Per Kilo</Tab>
                  <Tab className="text-gray-800 py-3 px-5 border-t border-l border-r rounded-t-md bg-slate-300 data-[selected]:sm:rounded-t-md data-[selected]:bg-white data-[selected]:border-t data-[selected]:border-l data-[selected]:border-r data-[selected]:text-gray-800">Specific Item</Tab>
                  <Tab className="text-gray-800 py-3 px-5 border-t border-l border-r rounded-t-md bg-slate-300 data-[selected]:sm:rounded-t-md data-[selected]:bg-white data-[selected]:border-t data-[selected]:border-l data-[selected]:border-r data-[selected]:text-gray-800">FCL</Tab>
                  <Tab className="text-gray-800 py-3 px-5 border-t border-l border-r rounded-t-md bg-slate-300 data-[selected]:sm:rounded-t-md data-[selected]:bg-white data-[selected]:border-t data-[selected]:border-l data-[selected]:border-r data-[selected]:text-gray-800">Air Freight Charge</Tab>
                  <Tab className="text-gray-800 py-3 px-5 border-t border-l border-r rounded-t-md bg-slate-300 data-[selected]:sm:rounded-t-md data-[selected]:bg-white data-[selected]:border-t data-[selected]:border-l data-[selected]:border-r data-[selected]:text-gray-800">Other Charges</Tab>
                  <Tab className="text-gray-800 py-3 px-5 border-t border-l border-r rounded-t-md bg-slate-300 data-[selected]:sm:rounded-t-md data-[selected]:bg-white data-[selected]:border-t data-[selected]:border-l data-[selected]:border-r data-[selected]:text-gray-800">Advalorem</Tab>
                </TabList>
                <TabPanels>
                  <TabPanel className="px-5 py-4 bg-white border border-t-0">
                    <label className='flex text-sm'><p className='font-semibold'>Note:&nbsp;</p> Fields with <p className='text-red-500 font-semibold'>&nbsp;*&nbsp;</p> are required.</label>
      
                      <div className="overflow-auto">
                        <form onSubmit={createPerCBM} className='w-full mx-auto space-y-6'>
                        <table className="text-sm text-left rtl:text-right overflow-hidden">
                          <tr>
                            <th className="px-3 py-3">Description:</th>
                            <td className="px-3 py-3 flex space-x-2">
                              <textarea className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-96 py-3 rounded-md outline-blue-500" placeholder="Description" value={perCBM.wb_description} onChange={(e) => setPerCBM({ ...perCBM, wb_description: e.target.value })} />
                                <p className='text-2xl justify-center items-center text-red-700'>*</p>
                            </td>
                          </tr>
                          <tr>     
                            <th className="px-3 py-3">Measurement Type:</th>
                            <td className="px-3 py-3">
                              <select className='form-select text-gray-800 bg-white text-sm px-4 w-96 py-3 border border-gray-300 rounded-md outline-blue-500' value={perCBM.type}
                                onChange={(e) => {setPerCBM({ ...perCBM, type: e.target.value })}}>
                                <option>Per Piece</option>
                                <option>Blocking</option>
                              </select>
                            </td>
                          </tr>       
                          <tr>     
                            <th className="px-3 py-3">Quantity:</th>
                            <td className="px-3 py-3 flex space-x-2">
                              <input className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-40 py-3 rounded-md outline-blue-500" type="text" placeholder="Quantity" value={perCBM.quantity} onChange={(e) => setPerCBM({ ...perCBM, quantity: e.target.value })} />
                              <p className='text-2xl justify-center items-center text-red-700'>*</p>     
                            </td>
                          </tr>    
                          <tr>     
                            <th className="px-3 py-3" valign="top">Measurement:</th>
                            <td className="px-3 py-3 space-y-2">
                              {measurements.map((row, index) => (
                                <div key={index} className="space-x-2 flex mb-2">
                                  <input type="text" placeholder="L" value={row.length} onChange={(e) => handleMeasurement(index, "length", e.target.value)} className="register-link w-20 py-2 px-4 border rounded-md" />
                                  <p className="text-2xl flex items-center justify-center">*</p>
                                  <input type="text" placeholder="W" value={row.width} onChange={(e) => handleMeasurement(index, "width", e.target.value)} className="register-link w-20 py-2 px-4 border rounded-md" />
                                  <p className="text-2xl flex items-center justify-center">*</p>
                                  <input type="text" placeholder="H" value={row.height} onChange={(e) => handleMeasurement(index, "height", e.target.value)} className="register-link w-20 py-2 px-4 border rounded-md" />
                                  <p className="text-2xl flex items-center justify-center">*</p>
                                  <input type="text" placeholder="Q" value={row.quantity} onChange={(e) => handleMeasurement(index, "quantity", e.target.value)} className="register-link w-20 py-2 px-4 border rounded-md" />
                                  <input type="text" placeholder="Unit" value={row.unit} onChange={(e) => handleMeasurement(index, "unit", e.target.value)} className="register-link w-20 py-2 px-4 border rounded-md"/>
                                  {index !== 0 && (
                                    <button
                                      onClick={() => deleteRow(index)}
                                      className="p-2 text-red-600 hover:text-red-800"
                                      title="Delete Row"
                                    >
                                      <FaTrash />
                                    </button>
                                  )}
                                </div>
                              ))}
                            </td>
                            <td rowSpan={10} valign='top'>
                              <button onClick={addRow} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 flex items-center">
                                <FaPlus/>
                              </button>
                            </td>
                          </tr>
                          <tr>     
                            <th className="px-3 py-3">Declared Value:</th>
                            <td className="px-3 py-3 flex space-x-2">
                              <input className="mb-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-60 py-3 rounded-md outline-blue-500" type="text" placeholder="Declared Value" value={perCBM.declared_value2} onChange={(e) => setPerCBM({ ...perCBM, declared_value2: e.target.value })} />
                              <p className='text-2xl justify-center items-center text-red-700'>*</p>     
                              <input type='text' value={perCBM.waybillno = wbno} onChange={(e) => setPerCBM({ ...perCBM, waybillno: e.target.value })} /> 
                            </td>
                          </tr>                        
                        </table>
                        <SuccessDisplay success={showSuccess} message="✅CBM entry submitted!" />
                        <ErrorDisplay errors={errorPerCBM} />

                        <div className="!mt-8 float-right">
                          <button className="flex primary-btn py-3 px-8 text-sm tracking-wider font-semibold rounded-md text-white bg-gray-800 hover:bg-gray-600 focus:outline-none"><FaSave size={18}/>&nbsp;Save CBM </button>
                        </div>
                        </form>
                        <div className="!mt-8 float-right">
                          <button type="button" onClick={() => {setOpenLookUp(false); setErrorPerCBM(false); setShowSuccess(false);}} className="flex primary-btn py-3 px-10 mr-4 text-sm tracking-wider font-semibold rounded-md text-white bg-red-400 hover:bg-red-600 focus:outline-none"><FaTimes size={18}/>&nbsp;Cancel </button>
                        </div>
                    </div>
                  </TabPanel>
                  

                  <TabPanel className="px-5 py-4 bg-white border border-t-0">
                    <label className='flex text-sm'><p className='font-semibold'>Note:&nbsp;</p> Fields with <p className='text-red-500 font-semibold'>&nbsp;*&nbsp;</p> are required.</label>
                    <div className="overflow-auto">
                    <form onSubmit={createPerKilo} className='w-full mx-auto space-y-6'>
                      <table className="text-sm text-left rtl:text-right overflow-hidden">
                        <tr>
                          <th className="px-3 py-3">Description:</th>
                          <td className="px-3 py-3 flex space-x-2">
                            <textarea className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-96 py-3 rounded-md outline-blue-500" placeholder="Description" value={perKilo.wb_description} onChange={(e) => setPerKilo({ ...perKilo, wb_description: e.target.value })} />
                              <p className='text-2xl justify-center items-center text-red-700'>*</p>
                          </td>
                        </tr>    
                        <tr>     
                          <th className="px-3 py-3">Quantity:</th>
                          <td className="px-3 py-3 flex space-x-2">
                            <input className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-40 py-3 rounded-md outline-blue-500" type="text" placeholder="Quantity" value={perKilo.quantity} onChange={(e) => setPerKilo({ ...perKilo, quantity: e.target.value })} />
                            <p className='text-2xl justify-center items-center text-red-700'>*</p>  
                          </td>
                        </tr>                 
                        <tr>     
                          <th className="px-3 py-3">Number of Kilo:</th>
                          <td className="px-3 py-3 flex space-x-2">
                            <input className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-40 py-3 rounded-md outline-blue-500" type="text" placeholder="Number of Kilo" value={perKilo.kilo_quantity} onChange={(e) => setPerKilo({ ...perKilo,kilo_quantity: e.target.value })} />
                            <p className='text-2xl justify-center items-center text-red-700'>*</p>        
                          </td>
                        </tr>  
                        <tr>     
                          <th className="px-3 py-3">Unit:</th>
                          <td className="px-3 py-3 flex space-x-2">
                            <input className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-40 py-3 rounded-md outline-blue-500" type="text" placeholder="Unit" value={perKilo.unit} onChange={(e) => setPerKilo({ ...perKilo, unit: e.target.value })} />
                            <p className='text-2xl justify-center items-center text-red-700'>*</p>    
                          </td>
                        </tr>  
                        <tr>     
                          <th className="px-3 py-3">Declared Value:</th>
                          <td className="px-3 py-3 flex space-x-2">
                            <input className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-40 py-3 rounded-md outline-blue-500" type="text" placeholder="Declared Value" value={perKilo.declared_value2} onChange={(e) => setPerKilo({ ...perKilo, declared_value2: e.target.value })} />
                            <p className='text-2xl justify-center items-center text-red-700'>*</p> 
                            <input type='text' value={perKilo.waybillno = wbno} onChange={(e) => setPerKilo({ ...perKilo, waybillno: e.target.value })} hidden/>      
                          </td>
                        </tr>           
                      </table>

                      <SuccessDisplay success={showSuccess} message="✅Kilo entry submitted!" />
                      <ErrorDisplay errors={errorPerKilo} />

                      <div className="!mt-8 float-right">
                        <button className="flex primary-btn py-3 px-8 text-sm tracking-wider font-semibold rounded-md text-white bg-gray-800 hover:bg-gray-600 focus:outline-none"><FaSave size={18}/>&nbsp;Save Kilo </button>
                      </div>
                    </form>
                      <div className="!mt-8 float-right">
                        <button type="button" onClick={() => {setOpenLookUp(false); setErrorPerKilo(false); setShowSuccess(false);}} className="flex primary-btn py-3 px-10 mr-4 text-sm tracking-wider font-semibold rounded-md text-white bg-red-400 hover:bg-red-600 focus:outline-none"><FaTimes size={18}/>&nbsp;Cancel </button>
                      </div>
                    </div>
                  </TabPanel>

                  
                  <TabPanel className="px-5 py-4 bg-white border border-t-0">
                    <label className='flex text-sm'><p className='font-semibold'>Note:&nbsp;</p> Fields with <p className='text-red-500 font-semibold'>&nbsp;*&nbsp;</p> are required.</label>
                    <div className="overflow-auto">
                    <form onSubmit={createSpecialItem} className='w-full mx-auto space-y-6'>
                      <table className="text-sm text-left rtl:text-right overflow-hidden">
                        <tr>
                          <th className="px-3 py-3">Specific Item:</th>
                          <td className="px-3 py-3 flex space-x-2">
                            <select className='form-select text-gray-800 bg-white text-sm px-4 w-96 py-3 border border-gray-300 rounded-md outline-blue-500' value={specificItem.cus_specialitem_id} onChange={(e) => { setSpecificItem({ ...specificItem, cus_specialitem_id: e.target.value }); getSpecialItemDetails(e.target.value)} }>
                              <option value="">Select Special Item</option>
                              {custSpecialItem.map((special_item) => (
                                <option key={special_item.id} value={special_item.id}>{`${special_item.item} (${special_item.unit}) - ₱${parseFloat(special_item.rate).toFixed(2)}`}</option>
                              ))}
                            </select>
                              <p className='text-2xl justify-center items-center text-red-700'>*</p>
                              {errors.customer_dr_attachment && <p className="error text-red-700 text-right ml-2 -mt-4">{errors.customer_dr_attachment[0]}</p>}
                          </td>
                        </tr>    
                        <tr>     
                          <th className="px-3 py-3">Unit:</th>
                          <td className="px-3 py-3 flex space-x-2">
                            <input className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-40 py-3 rounded-md outline-blue-500" type="text" placeholder="Unit" value={specificItem.unit} onChange={(e) => setSpecificItem({ ...specificItem, unit: e.target.value })} />
                            <p className='text-2xl justify-center items-center text-red-700'>*</p>     
                          </td>
                        </tr> 
                        <tr>     
                          <th className="px-3 py-3">Rate Php:</th>
                          <td className="px-3 py-3 flex space-x-2">
                            <input className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-40 py-3 rounded-md outline-blue-500" type="text" placeholder="Rate Php" value={specificItem.rate} onChange={(e) => setSpecificItem({ ...specificItem, rate: e.target.value })} readOnly />
                            <p className='text-2xl justify-center items-center text-red-700'>*</p> 
                          </td>
                        </tr>  
                        <tr>     
                          <th className="px-3 py-3">Quantity:</th>
                          <td className="px-3 py-3 flex space-x-2">
                            <input className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-40 py-3 rounded-md outline-blue-500" type="text" placeholder="Quantity" value={specificItem.quantity} onChange={(e) => setSpecificItem({ ...specificItem, quantity: e.target.value })} />
                            <p className='text-2xl justify-center items-center text-red-700'>*</p>  
                          </td>
                        </tr>                 
                        <tr>     
                          <th className="px-3 py-3">Declared Value:</th>
                          <td className="px-3 py-3 flex space-x-2">
                            <input className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-40 py-3 rounded-md outline-blue-500" type="text" placeholder="Declared Value" value={specificItem.declared_value2} onChange={(e) => setSpecificItem({ ...specificItem, declared_value2: e.target.value })} />
                            <p className='text-2xl justify-center items-center text-red-700'>*</p>    
                          </td>
                        </tr>       
                        <tr>     
                          <th className="px-3 py-3">Remarks:</th>
                          <td className="px-3 py-3">
                            <textarea className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-96 py-3 rounded-md outline-blue-500" placeholder="Product Note" value={specificItem.cus_specialitem_remarks} onChange={(e) => setSpecificItem({ ...specificItem, cus_specialitem_remarks: e.target.value })} />
                            <input type='text' value={specificItem.waybillno = wbno} onChange={(e) => setSpecificItem({ ...specificItem, waybillno: e.target.value })} hidden  />
                          </td>
                        </tr>
                      </table>
                      <SuccessDisplay success={showSuccess} message="✅Special Item entry submitted!" />
                      <ErrorDisplay errors={errorSpecialItem} />

                      <div className="!mt-8 float-right">
                        <button className="flex primary-btn py-3 px-8 text-sm tracking-wider font-semibold rounded-md text-white bg-gray-800 hover:bg-gray-600 focus:outline-none"><FaSave size={18}/>&nbsp;Save Special Item </button>
                      </div>
                    </form>
                      <div className="!mt-8 float-right">
                        <button type="button" onClick={() => {setOpenLookUp(false); setErrorSpecialItem(false); setShowSuccess(false);}} className="flex primary-btn py-3 px-10 mr-4 text-sm tracking-wider font-semibold rounded-md text-white bg-red-400 hover:bg-red-600 focus:outline-none"><FaTimes size={18}/>&nbsp;Cancel </button>
                      </div>
                    </div>
                  </TabPanel>


                  <TabPanel className="px-5 py-4 bg-white border border-t-0">
                    <label className='flex text-sm'><p className='font-semibold'>Note:&nbsp;</p> Fields with <p className='text-red-500 font-semibold'>&nbsp;*&nbsp;</p> are required.</label>
                    <div className="overflow-auto">
                      <table className="text-sm text-left rtl:text-right overflow-hidden">
                        <tr>
                          <th className="px-3 py-3">Description:</th>
                          <td className="px-3 py-3 flex space-x-2">
                            <textarea className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-96 py-3 rounded-md outline-blue-500" placeholder="Description" value={formData.customer_dr_attachment} onChange={(e) => setFormData({ ...formData, customer_dr_attachment: e.target.value })} />
                              <p className='text-2xl justify-center items-center text-red-700'>*</p>
                              {errors.customer_dr_attachment && <p className="error text-red-700 text-right ml-2 -mt-4">{errors.customer_dr_attachment[0]}</p>}
                          </td>
                        </tr>   
                        <tr>
                          <th className="px-3 py-3">Container:</th>
                          <td className="px-3 py-3 flex space-x-2">
                            <select className='form-select text-gray-800 bg-white text-sm px-4 w-96 py-3 border border-gray-300 rounded-md outline-blue-500'
                              onChange={(e) => {setFormData({ ...formData, type: e.target.value })}}>
                              <option>10ft</option>
                              <option>20ft</option>
                              <option>40ft</option>
                              <option>20ft FLATRACK</option>
                              <option>40ft FLATRACK</option>
                              <option>4 WHEELER</option>
                              <option>6 WHEELER</option>
                              <option>8 WHEELER</option>
                              <option>10 WHEELER</option>
                              <option>FREIGHTLINER TRACTOR HEAD W/TRAILER</option>
                            </select>
                              {errors.customer_dr_attachment && <p className="error text-red-700 text-right ml-2 -mt-4">{errors.customer_dr_attachment[0]}</p>}
                          </td>
                        </tr>    
                        <tr>     
                          <th className="px-3 py-3"># of Container:</th>
                          <td className="px-3 py-3 flex space-x-2">
                            <input className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-20 py-3 rounded-md outline-blue-500" type="text" value={formData.terms = custData.terms} onChange={(e) => setFormData({ ...formData, terms: e.target.value })} />
                            <p className='text-2xl justify-center items-center text-red-700'>*</p>
                            {errors.terms && <p className="error text-red-700 text-right ml-2 -mt-4">{errors.terms[0]}</p>}        
                          </td>
                        </tr>                 
                        <tr>     
                          <th className="px-3 py-3">Declared Value:</th>
                          <td className="px-3 py-3 flex space-x-2">
                            <input className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-40 py-3 rounded-md outline-blue-500" type="text" placeholder="Declared Value" value={formData.terms = custData.terms} onChange={(e) => setFormData({ ...formData, terms: e.target.value })} />
                            <p className='text-2xl justify-center items-center text-red-700'>*</p>
                            {errors.terms && <p className="error text-red-700 text-right ml-2 -mt-4">{errors.terms[0]}</p>}        
                          </td>
                        </tr>
                      </table>
                      <div className="flex space-x-2 justify-end py-6">
                        <button type="button" className="flex primary-btn py-3 px-8 text-sm tracking-wider font-semibold rounded-md text-white bg-gray-800 hover:bg-gray-600 focus:outline-none"><FaSave size={18}/>&nbsp;Save FCL </button>

                        <button type="button" onClick={() => setOpenLookUp(false)} className="flex primary-btn py-3 px-10 mr-4 text-sm tracking-wider font-semibold rounded-md text-white bg-red-400 hover:bg-red-600 focus:outline-none"><FaTimes size={18}/>&nbsp;Cancel </button>
                      </div>
                    </div>
                  </TabPanel>

                  <TabPanel className="px-5 py-4 bg-white border border-t-0">
                    <label className='flex text-sm'><p className='font-semibold'>Note:&nbsp;</p> Fields with <p className='text-red-500 font-semibold'>&nbsp;*&nbsp;</p> are required.</label>
                    <div className="overflow-auto">
                      <table className="text-sm text-left rtl:text-right overflow-hidden">
                        <tr>
                          <th className="px-3 py-3">Charge Type:</th>
                          <td className="px-3 py-3 flex items-center space-x-6">
                            <div className="flex items-center space-x-1">
                              <input
                                type="radio" id="cargo" name="chargeOption" value="c" checked={optCharge === "c"} onChange={(e) => setOptCharge(e.target.value)} className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"/>
                              <label htmlFor="cargo">Cargo</label>
                            </div>

                            <div className="flex items-center space-x-1">
                              <input type="radio" id="pouch" name="chargeOption" value="p" checked={optCharge === "p"} onChange={(e) => setOptCharge(e.target.value)} className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"/>
                              <label htmlFor="pouch">Pouch</label>
                            </div>
                            </td>
                        </tr> 
                        {optCharge === "c" ?
                        <>
                        <tr>     
                          <th className="px-3 py-3">Commodity Type:</th>
                          <td className="px-3 py-3">
                            <select className='form-select text-gray-800 bg-white text-sm px-4 w-96 py-3 border border-gray-300 rounded-md outline-blue-500'
                              onChange={(e) => {setFormData({ ...formData, type: e.target.value })}}>
                              <option>Express</option>
                              <option>Perishable</option>
                              <option>General Cargo</option>
                            </select>
                          </td>
                        </tr>   
                        <tr>
                          <th className="px-3 py-3">Description:</th>
                          <td className="px-3 py-3 flex space-x-2">
                            <textarea className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-96 py-3 rounded-md outline-blue-500" placeholder="Description" value={formData.customer_dr_attachment} onChange={(e) => setFormData({ ...formData, customer_dr_attachment: e.target.value })} />
                              <p className='text-2xl justify-center items-center text-red-700'>*</p>
                              {errors.customer_dr_attachment && <p className="error text-red-700 text-right ml-2 -mt-4">{errors.customer_dr_attachment[0]}</p>}
                          </td>
                        </tr>
                        <tr>     
                          <th className="px-3 py-3">Quantity:</th>
                          <td className="px-3 py-3 flex space-x-2">
                            <input className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-40 py-3 rounded-md outline-blue-500" type="text" placeholder="Quantity" value={formData.terms = custData.terms} onChange={(e) => setFormData({ ...formData, terms: e.target.value })} />
                            <p className='text-2xl justify-center items-center text-red-700'>*</p>
                            {errors.terms && <p className="error text-red-700 text-right ml-2 -mt-4">{errors.terms[0]}</p>}        
                          </td>
                        </tr>
                        <tr>
                          <th className="px-3 py-3 align-top">Measurement:</th>
                          <td className="px-3 py-3 space-y-2">
                            {measurements.map((row, index) => (
                              <div key={index} className="space-x-2 flex mb-2">
                                <input type="text" placeholder="L" value={row.length} onChange={(e) => handleMeasurement(index, "length", e.target.value)} className="register-link w-20 py-2 px-4 border rounded-md" />
                                <p className="text-2xl flex items-center justify-center">*</p>
                                <input type="text" placeholder="W" value={row.width} onChange={(e) => handleMeasurement(index, "width", e.target.value)} className="register-link w-20 py-2 px-4 border rounded-md" />
                                <p className="text-2xl flex items-center justify-center">*</p>
                                <input type="text" placeholder="H" value={row.height} onChange={(e) => handleMeasurement(index, "height", e.target.value)} className="register-link w-20 py-2 px-4 border rounded-md" />
                                <p className="text-2xl flex items-center justify-center">*</p>
                                <input type="text" placeholder="Q" value={row.quantity} onChange={(e) => handleMeasurement(index, "quantity", e.target.value)} className="register-link w-20 py-2 px-4 border rounded-md" />
                                <input type="text" placeholder="Unit" value={row.unit} onChange={(e) => handleMeasurement(index, "unit", e.target.value)} className="register-link w-20 py-2 px-4 border rounded-md"/>
                                {index !== 0 && (
                                  <button
                                    onClick={() => deleteRow(index)}
                                    className="p-2 text-red-600 hover:text-red-800"
                                    title="Delete Row"
                                  >
                                    <FaTrash />
                                  </button>
                                )}
                              </div>
                            ))}
                          </td>
                          <td rowSpan={10} valign='top'>
                            <button onClick={addRow} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 flex items-center">
                              <FaPlus/>
                            </button>
                          </td>
                        </tr>
                        <tr>     
                          <th className="px-3 py-3">Number of Kilo:</th>
                          <td className="px-3 py-3 flex space-x-2">
                            <input className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-40 py-3 rounded-md outline-blue-500" type="text" placeholder="Number of Kilo" value={formData.terms = custData.terms} onChange={(e) => setFormData({ ...formData, terms: e.target.value })} />
                            <p className='text-2xl justify-center items-center text-red-700'>*</p>
                            {errors.terms && <p className="error text-red-700 text-right ml-2 -mt-4">{errors.terms[0]}</p>}        
                          </td>
                        </tr>  
                        <tr>     
                          <th className="px-3 py-3">Actual Weight:</th>
                          <td className="px-3 py-3 flex space-x-2">
                            <input className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-40 py-3 rounded-md outline-blue-500" type="text" placeholder="Weight" value={formData.terms = custData.terms} onChange={(e) => setFormData({ ...formData, terms: e.target.value })} />
                            <p className='text-2xl justify-center items-center text-red-700'>*</p>
                            {errors.terms && <p className="error text-red-700 text-right ml-2 -mt-4">{errors.terms[0]}</p>}        
                          </td>
                        </tr>  
                        <tr>     
                          <th className="px-3 py-3">Declared Value:</th>
                          <td className="px-3 py-3 flex space-x-2">
                            <input className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-40 py-3 rounded-md outline-blue-500" type="text" placeholder="Declared Value" value={formData.terms = custData.terms} onChange={(e) => setFormData({ ...formData, terms: e.target.value })} />
                            <p className='text-2xl justify-center items-center text-red-700'>*</p>
                            {errors.terms && <p className="error text-red-700 text-right ml-2 -mt-4">{errors.terms[0]}</p>}        
                          </td>
                        </tr>  
                        </>
                        : 
                        <>
                        <tr>
                          <th className="px-3 py-3">Description:</th>
                          <td className="px-3 py-3 flex space-x-2">
                            <textarea className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-96 py-3 rounded-md outline-blue-500" placeholder="Description" value={formData.customer_dr_attachment} onChange={(e) => setFormData({ ...formData, customer_dr_attachment: e.target.value })} />
                              {errors.customer_dr_attachment && <p className="error text-red-700 text-right ml-2 -mt-4">{errors.customer_dr_attachment[0]}</p>}
                          </td>
                        </tr>
                        <tr>     
                          <th className="px-3 py-3">Quantity:</th>
                          <td className="px-3 py-3 flex space-x-2">
                            <input className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-40 py-3 rounded-md outline-blue-500" type="text" placeholder="Quantity" value={formData.terms = custData.terms} onChange={(e) => setFormData({ ...formData, terms: e.target.value })} />
                            {errors.terms && <p className="error text-red-700 text-right ml-2 -mt-4">{errors.terms[0]}</p>}        
                          </td>
                        </tr>
                        <tr>
                          <th className="px-3 py-3">Size Type:</th>
                          <td className="px-3 py-3 flex items-center space-x-6">
                            <div className="flex items-center space-x-1">
                              <input
                                type="radio" id="small" name="sizetypeOption" value="s" checked={optSizeType === "s"} onChange={(e) => setOptSizeType(e.target.value)} className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"/>
                              <label htmlFor="small">Small</label>
                            </div>

                            <div className="flex items-center space-x-1">
                              <input type="radio" id="medium" name="sizetypeOption" value="m" checked={optSizeType === "m"} onChange={(e) => setOptSizeType(e.target.value)} className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"/>
                              <label htmlFor="medium">Medium</label>
                            </div>

                            <div className="flex items-center space-x-1">
                              <input type="radio" id="large" name="sizetypeOption" value="l" checked={optSizeType === "l"} onChange={(e) => setOptSizeType(e.target.value)} className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"/>
                              <label htmlFor="large">Large</label>
                            </div>
                          </td>
                        </tr> 
                        <tr>     
                          <th className="px-3 py-3">Amount Charge:</th>
                          <td className="px-3 py-3 flex space-x-2">
                            <input className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-40 py-3 rounded-md outline-blue-500" type="text" placeholder="Amount Charge" value={formData.terms = custData.terms} onChange={(e) => setFormData({ ...formData, terms: e.target.value })} />
                            {errors.terms && <p className="error text-red-700 text-right ml-2 -mt-4">{errors.terms[0]}</p>}        
                          </td>
                        </tr>
                        </>
                        }          
                      </table>
                      <div className="flex space-x-2 justify-end py-6">
                        <button type="button" className="flex primary-btn py-3 px-8 text-sm tracking-wider font-semibold rounded-md text-white bg-gray-800 hover:bg-gray-600 focus:outline-none"><FaSave size={18}/>&nbsp;Save </button>

                        <button type="button" onClick={() => setOpenLookUp(false)} className="flex primary-btn py-3 px-10 mr-4 text-sm tracking-wider font-semibold rounded-md text-white bg-red-400 hover:bg-red-600 focus:outline-none"><FaTimes size={18}/>&nbsp;Cancel </button>
                      </div>
                    </div>
                  </TabPanel>

                  <TabPanel className="px-5 py-4 bg-white border border-t-0">
                    <label className='flex text-sm'><p className='font-semibold'>Note:&nbsp;</p> Fields with <p className='text-red-500 font-semibold'>&nbsp;*&nbsp;</p> are required.</label>
                    <div className="overflow-auto">
                      <table className="text-sm text-left rtl:text-right overflow-hidden">
                        <tr>
                          <th className="px-3 py-3">Charge Description:</th>
                          <td className="px-3 py-3 flex space-x-2">
                            <textarea className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-96 py-3 rounded-md outline-blue-500" placeholder="Description" value={formData.customer_dr_attachment} onChange={(e) => setFormData({ ...formData, customer_dr_attachment: e.target.value })} />  
                              {errors.customer_dr_attachment && <p className="error text-red-700 text-right ml-2 -mt-4">{errors.customer_dr_attachment[0]}</p>}
                          </td>
                        </tr>     
                        <tr>     
                          <th className="px-3 py-3">Amount:</th>
                          <td className="px-3 py-3 flex space-x-2">
                            <input className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-40 py-3 rounded-md outline-blue-500" type="text" placeholder="Amount" value={formData.terms = custData.terms} onChange={(e) => setFormData({ ...formData, terms: e.target.value })} />
                            {errors.terms && <p className="error text-red-700 text-right ml-2 -mt-4">{errors.terms[0]}</p>}        
                          </td>
                        </tr>           
                      </table>
                      <div className="flex space-x-2 justify-end py-20">
                        <button type="button" className="flex primary-btn py-3 px-8 text-sm tracking-wider font-semibold rounded-md text-white bg-gray-800 hover:bg-gray-600 focus:outline-none"><FaSave size={18}/>&nbsp;Add Charge</button>

                        <button type="button" onClick={() => setOpenLookUp(false)} className="flex primary-btn py-3 px-10 mr-4 text-sm tracking-wider font-semibold rounded-md text-white bg-red-400 hover:bg-red-600 focus:outline-none"><FaTimes size={18}/>&nbsp;Cancel </button>
                      </div>
                    </div>
                  </TabPanel>

                  <TabPanel className="px-5 py-4 bg-white border border-t-0">
                    <label className='flex text-sm'><p className='font-semibold'>Note:&nbsp;</p> Fields with <p className='text-red-500 font-semibold'>&nbsp;*&nbsp;</p> are required.</label>
                    
                      <div className="overflow-auto">
                        <form onSubmit={createAdvalorem} className='w-full mx-auto space-y-6'>
                          <table className="text-sm text-left rtl:text-right overflow-hidden">
                            <tr>
                              <th className="px-3 py-3">Description:</th>
                              <td className="px-3 py-3 flex space-x-2">
                                <textarea className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-96 py-3 rounded-md outline-blue-500" placeholder="Description" value={advaloremData.wb_description} onChange={(e) => setAdvaloremData({ ...advaloremData, wb_description: e.target.value })} />
                              </td>
                            </tr>    
                            <tr>     
                              <th className="px-3 py-3">Quantity:</th>
                              <td className="px-3 py-3 flex space-x-2">
                                <input className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-40 py-3 rounded-md outline-blue-500 text-right" type="text" placeholder="Quantity" value={advaloremData.quantity} onChange={(e) => setAdvaloremData({ ...advaloremData, quantity: e.target.value })} />       
                              </td>
                            </tr>                 
                            <tr>     
                              <th className="px-3 py-3">Unit:</th>
                              <td className="px-3 py-3 flex space-x-2">
                                <input className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-40 py-3 rounded-md outline-blue-500 text-right" type="text" placeholder="Unit" value={advaloremData.unit} onChange={(e) => setAdvaloremData({ ...advaloremData, unit: e.target.value })} />      
                              </td>
                            </tr>  
                            <tr>     
                              <th className="px-3 py-3">Declared Value:</th>
                              <td className="px-3 py-3 flex space-x-2">
                                <input className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-40 py-3 rounded-md outline-blue-500 text-right" type="text" placeholder="Declared Value" value={advaloremData.declared_value2} onChange={(e) => setAdvaloremData({ ...advaloremData, declared_value2: e.target.value })} />

                                <input type='text' value={advaloremData.waybillno = wbno} onChange={(e) => setAdvaloremData({ ...advaloremData, waybillno: e.target.value })} hidden/>
                              </td>
                            </tr>           
                          </table>
                          <SuccessDisplay success={showSuccess} message="✅ Advalorem entry submitted!" />
                          <ErrorDisplay errors={errorAdvalorem} />

                          <div className="!mt-8 float-right">
                            <button className="flex primary-btn py-3 px-8 text-sm tracking-wider font-semibold rounded-md text-white bg-gray-800 hover:bg-gray-600 focus:outline-none"><FaSave size={18}/>&nbsp;Save Advalorem </button>
                          </div>
                        </form>
                        <div className="!mt-8 float-right">
                          <button type="button" onClick={() => {setOpenLookUp(false); setErrorAdvalorem(false); setShowSuccess(false);}} className="flex primary-btn py-3 px-10 mr-4 text-sm tracking-wider font-semibold rounded-md text-white bg-red-400 hover:bg-red-600 focus:outline-none"><FaTimes size={18}/>&nbsp;Cancel </button>
                        </div>
                      </div>
                  </TabPanel>
                </TabPanels>
              </TabGroup>   
                      </div>        
                    </div>
                    </div>
                  </div>
                </div>
              </div>
              </DialogPanel>
            </div>
        </div>
      </Dialog>

    {/* Add Other Charge */}
      <Dialog open={openOtherCharge} onClose={setOpenOtherCharge} className="relative z-[999]">
        <DialogBackdrop
            transition
            className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
        />
  
        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <DialogPanel transition className="relative transform overflow-hidden rounded-lg transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-screen-sm data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"> 
  
              <div className="flex flex-col font-[sans-serif]">
                <div className="w-full mx-auto border border-gray-300 rounded-2xl p-8 bg-gray-50">
                  <div className="text-center mb-4">
                    <h1 className="text-2xl justify-center pb-6 flex"> Other Charge </h1>
                  
                  <form onSubmit={handleCreate} className='w-full mx-auto space-y-6'>
                  <div className='text-left border p-2 bg-gray-100'>
                    <div className='flex flex-row'>
                      <div className='p-2 w-full'>
                        <label>Charge Description</label>
                        <textarea className="mb-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" placeholder="Description" value={formData.customer_dr_attachment} onChange={(e) => setFormData({ ...formData, customer_dr_attachment: e.target.value })} />
                          {errors.registered_name && <p className="error text-red-700 text-left ml-2">{errors.registered_name[0]}</p>}
  
                        <label>Amount</label>
                        <input className=" mb-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="Amount" value={formData.contact_person} onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })} />
                      </div>        
                    </div>
                    </div>
  
                      <div className="!mt-8 float-right">
                        <button className="flex primary-btn py-3 px-4 text-sm tracking-wider font-semibold rounded-md text-white bg-gray-800 hover:bg-gray-600 focus:outline-none"><FaPlus size={18}/>&nbsp;Insert Other Charge </button>
                      </div> 
                  </form>
                      <div className="!mt-8 float-right">
                        <button onClick={() => setOpenOtherCharge(false)} className="flex primary-btn py-3 px-10 mr-4 text-sm tracking-wider font-semibold rounded-md text-white bg-red-400 hover:bg-red-600 focus:outline-none"><FaTimes size={18}/>&nbsp;Cancel </button>
                      </div>
                  </div>
                </div>
              </div>
              </DialogPanel>
            </div>
        </div>
      </Dialog>

    {/* LookUp PopUp */}
      <Dialog open={openLookUpPopUp} onClose={setOpenLookUpPopUp} className="relative z-[999]">
        <DialogBackdrop
            transition
            className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
        />
  
        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <DialogPanel transition className="relative transform overflow-hidden rounded-lg transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-screen-sm data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"> 
  
              <div className="flex flex-col font-[sans-serif]">
                <div className="w-full mx-auto border border-gray-300 rounded-2xl p-8 bg-gray-50">
                  <div className="text-center mb-4">
                    <h1 className="text-2xl justify-center pb-6 flex"> </h1>
                  
                  <div className='text-center border p-2 py-6 bg-gray-100'>
                    <div className='flex flex-row text-xl'>
                     {lookUpCaption}
                    </div>
                  </div>
                    
                      <div className="!mt-8 float-right">
                        <button onClick={() => setOpenLookUpPopUp(false)} className="flex primary-btn py-3 px-6 mr-4 text-sm tracking-wider font-semibold rounded-md text-white bg-slate-600 hover:bg-slate-400 focus:outline-none"> OK </button>
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
      body="Waybill successfully added!"
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
      body="Are you sure you want to update this destination?"
      okConfirm={handleUpdate}
      /> 
    }

    {status === 4 &&  <InfoBox open={open} setOpen={setOpen} onClose={setOpen}
      title="Confirm Success"
      body="Destination successfully updated!"
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
