import { useContext, useEffect, useState} from "react";
import { AppContext } from "../../context/AppContext";
import { useNavigate, useParams } from 'react-router-dom';
import Pagination from '../../assets/components/Pagination';
import TableSort from '../../assets/components/TableSort';
import sortData from '../../assets/components/sortData';
import { Link } from "react-router-dom";
import { MdAdd } from "react-icons/md";
import useScreenSize from "../../assets/components/useScreenSize";
import LoadingBox from "../../assets/components/Loading";
import { Dialog, DialogBackdrop, DialogPanel } from '@headlessui/react';
import InfoBox from "../../assets/components/InfoBox";
import UpdateBox from "../../assets/components/UpdateBox";
import DeleteBox from "../../assets/components/DeleteBox";
import { FaRegEdit, FaCubes, FaUserPlus, FaUserEdit } from "react-icons/fa";

export default function CustomerConsignee() { 
  const { id } = useParams();
  const { token } = useContext(AppContext);
  const [openAddDial, setOpenAddDial] = useState(false);
  const [openUpdateDial, setOpenUpdateDial] = useState(false);
  const [openRatesDial, setOpenRatesDial] = useState(false);
  const [openStatusDial, setOpenStatusDial] = useState(false);
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState(0);
  const [branch, setBranch] = useState([]);
  const [custid, setCustid] = useState(null);
  const [consignee, setConsignee] = useState([]);
  const isMediumScreen = useScreenSize(768);
  const [showLoading, setShowLoading] = useState(false);
  const isLoading = () => {setShowLoading(true)};
  const stopLoading = () => {setShowLoading(false)};
  const [accountType, setAccountType] = useState({account_type: "", registered_name: ""});
  const [formAirLength, setFormAirLength] = useState(null);
  const [rate, setRate] = useState([]);

  const [selectedItems, setSelectedItems] = useState([]);

  //Table Pagination, Search
  const [sortdata, setSortdata] = useState([]);
  const [sorting, setSorting] = useState({ key: "", ascending: true });
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageCount, setPageCount] = useState(0);
  const [dataPerPage, setDataperpage] = useState(10);

  const [formData, setFormData] = useState({
    id: "", cust_uniq_id: "", registered_name: "", charge_to: "", tin_number: "",
    contact_person: "", address: "", mobile_number: "", contact_number: "",
    branch_id: "", value_charge: "", terms: "", rate_cbm: "", rate_kilo: "",
    airvalue: "", minimum: "", advalorem: "", discount: "", small_rate: "",
    medium_rate: "", large_rate: "", parcel_rate: "", account_type: "",
    agency_type: "", vat: "", applicable_tax: "", fcl_value_charge: "", 
    ftr10: "", ftr20: "", ftr40: "", ftr20_flat: "", ftr40_flat: "",
    wheeler4: "", wheeler6: "", wheeler8: "", wheeler10: "", freightliner: "",
    rolling_cargo: "", ftr10_value: "", ftr20_value: "", ftr40_value: "",
    ftr20_flat_value: "", ftr40_flat_value: "", wheeler4_value: "",
    wheeler6_value: "", wheeler8_value: "", wheeler10_value: "",
    freightliner_value: "", rolling_cargo_value: "", reason: "",
    pickup_charge_remarks: "", customer_dr_attachment: "", rates_to_apply: "",
    disabled_encoder: "", date_disabled: "", status: "", blacklist_status: "",
    date_blacklisted: "", old_status: "", verify: "", rate_status: "",
    rate_status_time: "", rate_status_date: "", rate_status_encoder: "",
    blocklist: "", encoded: "", encoder: "", user_updated: "", deactive_by: "",
    blacklisted_by: "", update_rate_user: "", update_rate_time_date: "",
  });

  const [formDataAir, setFormDataAir] = useState([
    { wtbreak: "0-5", express: "", perishable: "", gen_cargo: "", type: "", consignee: "" },
    { wtbreak: "6-49", express: "", perishable: "", gen_cargo: "", type: "", consignee: "" },
    { wtbreak: "50-249", express: "", perishable: "", gen_cargo: "", type: "", consignee: "" },
    { wtbreak: "250", express: "", perishable: "", gen_cargo: "", type: "", consignee: "" }, 
  ]);

  const [errors, setErrors] = useState({});

  const changePage = (i) => {
    setCurrentPage(i);
    const startItem = (i - 1) * dataPerPage;
    setSortdata(specialItem.slice(startItem, startItem + dataPerPage));
  };

  const handleChange = (value) => {
    changePage(value);
  };

  //Search
  async function searchTable() {
    const filtered = consignee.filter(rec => 
      rec.registered_name.toLowerCase().includes(search.toLowerCase()) ||
      rec.address.toLowerCase().includes(search.toLowerCase())
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


  const handleAirCharge = (index, field, value) => {
    // Check if input is not a number
    if (value !== "" && isNaN(value)) {
      setErrors((prevErrors) => ({
          ...prevErrors,
          [index]: { ...prevErrors[index], [field]: "Must be a number" }
      }));
    } else {
      // Remove error if input is valid
      setErrors((prevErrors) => {
        const newErrors = { ...prevErrors };
        if (newErrors[index]) {
            delete newErrors[index][field];
            if (Object.keys(newErrors[index]).length === 0) {
                delete newErrors[index];
            }
        }
        return newErrors;
      });

      // Update form data
      setFormDataAir((prevData) =>
          prevData.map((item, i) =>
              i === index ? { ...item, [field]: value } : item
          )
      );
    }
  };

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
  
    //Branch Dropdown
    const branchOptions = branch.reduce((acc, rec) => {
      const branchGroup = acc[rec.type] || [];
      return {
        ...acc, [rec.type]: [...branchGroup, rec]
    }}, {});

  // Get Customer
  async function getCustomer() {
    const res = await fetch(`/api/customer/${id}`);
    const data = await res.json();
    console.log(data);
    if(res.ok) {
      setAccountType({
      account_type:  data[0].account_type,
      registered_name: data[0].registered_name,
      });
    }
  }
  useEffect(() => {
    getCustomer();
  }, []);


  // Get Customer Consignee
  async function getCustomerConsigneeList() {
    isLoading();
    const res = await fetch(`/api/getcustomerconsignee/${id}`, {
      method: "get",  
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    console.log(data);
    if(res.ok) {
      setConsignee(data);
      setPageCount(Math.ceil(data.length / dataPerPage));
      setSortdata(data.slice(0, dataPerPage));
    }
    stopLoading();
  }
  useEffect(() => {
    getCustomerConsigneeList();
  }, [dataPerPage]);


  // Add Customer Consignee
  async function handleCreate(e) {
    e.preventDefault();
    formData.cust_uniq_id = id;
    formData.account_type = (accountType.account_type === "Prepaid" ? "customer_prepaid_consignee" : "customer_consignee");
    console.log(formData.account_type);
    const res = await fetch("/api/addcustomerconsignee", {
      method: "post",
      headers: {
        Authorization: `Bearer ${token}`,
      },
        body: JSON.stringify(formData),
    });
    const data = await res.json();
    console.log(data);
    
    if (data.errors) {
      setErrors(data.errors);
    } else {
      setOpen(true);
      setStatus(1);
      setFormData({});

      //Insert Aircharge
      const customerId = String(data.customer.id);
      if(formData.account_type == "Prepaid" || formData.account_type == "Account") {
        if (sumExpress === 0 && sumPerishable === 0){
          return "";
        } else {
          const updatedFormDataAir = formDataAir.map(item => ({
            ...item,
            type: formData.account_type,
            consignee: customerId,
            express: Number(item.express) || 0,
            perishable: Number(item.perishable) || 0,
            gen_cargo: Number(item.gen_cargo)
          }));

          const resAir = await fetch("/api/aircharge", {
            method: "post",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({rates: updatedFormDataAir}),
          });
          const dataAir = await resAir.json();

        }
      } else {
        return "";
      }
    }
  }

  async function closeCreate() {
    setOpen(false);
    setOpenAddDial(false);
    getCustomerConsigneeList();
  }


  async function closeDelete() {
    setOpen(false);
  }

  //Update Blacklist Status
  async function updateBlacklistStatus(id, blacklistStatus) {
    isLoading();
    console.log(id)
    console.log(blacklistStatus);
    const res = await fetch(`/api/updateblackliststatus/${id}`, {
      method: "put",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        customer_id: id,
        blacklist_status: blacklistStatus === "n" ? "y" : "n",
      }),
    });
    const data = await res.json();
    console.log(data);
    if(res.ok) {
      getCustomerConsigneeList();
    }
    stopLoading();
  }


  async function updateStatus(id, status) {
    console.log(id);
    const res = await fetch(`/api/updatestatus/${id}`, {
      method: "put",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        customer_id: id,
        status: status === "n" ? "y" : "n",
        reason: formData.reason,
      }),
    });
    const data = await res.json();
    console.log(data);
    if(data.errors) {
      setErrors(data.errors);
    } else {
      setOpen(true);
      setStatus(7);
      getCustomerConsigneeList();
    }
  }


  // Get Customer
  async function getCustomerUpdate(id) {
    setFormData({});
    if(id){
      const res = await fetch(`/api/customer/${id}`);
      const data = await res.json();
      console.log(data);
      if(res.ok) {
        setFormData({
          id: data[0].id,
          registered_name: data[0].registered_name,
          charge_to: data[0].charge_to,
          tin_number: data[0].tin_number,
          contact_person: data[0].contact_person,
          address: data[0].address,
          mobile_number: data[0].mobile_number,
          contact_number: data[0].contact_number,
          branch_id: data[0].branch_id,
          value_charge: data[0].value_charge,
          terms: data[0].terms,
          rate_cbm: data[0].rate_cbm,
          rate_kilo: data[0].rate_kilo,
          airvalue: data[0].airvalue,
          minimum: data[0].minimum,
          advalorem: data[0].advalorem,
          discount: data[0].discount,
          small_rate: data[0].small_rate,
          medium_rate: data[0].medium_rate,
          large_rate: data[0].large_rate,
          parcel_rate: data[0].parcel_rate,
          account_type: data[0].account_type,
          agency_type: data[0].agency_type,
          vat: data[0].vat,
          applicable_tax: data[0].applicable_tax,
          fcl_value_charge: data[0].fcl_value_charge,
          ftr10: data[0].ftr10,
          ftr20: data[0].ftr20,
          ftr40: data[0].ftr40,
          ftr20_flat: data[0].ftr20_flat,
          ftr40_flat: data[0].ftr40_flat,
          wheeler4: data[0].wheeler4,
          wheeler6: data[0].wheeler6,
          wheeler8: data[0].wheeler8,
          wheeler10: data[0].wheeler10,
          freightliner: data[0].freightliner,
          rolling_cargo: data[0].rolling_cargo,
          ftr10_value: data[0].ftr10_value,
          ftr20_value: data[0].ftr20_value,
          ftr40_value: data[0].ftr40_value,
          ftr20_flat_value: data[0].ftr20_flat_value,
          ftr40_flat_value: data[0].ftr40_flat_value,
          wheeler4_value: data[0].wheeler4_value,
          wheeler6_value: data[0].wheeler6_value,
          wheeler8_value: data[0].wheeler8_value,
          wheeler10_value: data[0].wheeler10_value,
          freightliner_value: data[0].freightliner_value,
          rolling_cargo_value: data[0].rolling_cargo_value,
          reason: data[0].reason,
          pickup_charge_remarks: data[0].pickup_charge_remarks,
          customer_dr_attachment: data[0].customer_dr_attachment,
          rates_to_apply: data[0].rates_to_apply,
          disabled_encoder: data[0].disabled_encoder,
          date_disabled: data[0].date_disabled,
          status: data[0].status,
          blacklist_status: data[0].blacklist_status,
          date_blacklisted: data[0].date_blacklisted,
          old_status: data[0].old_status,
          verify: data[0].verify,
          rate_status: data[0].rate_status,
          rate_status_time: data[0].rate_status_time,
          rate_status_date: data[0].rate_status_date,
          rate_status_encoder: data[0].rate_status_encoder,
          blocklist: data[0].blocklist,
          encoded: data[0].encoded,
          encoder: data[0].encoder,
          user_updated: data[0].user_updated,
          deactive_by: data[0].deactive_by,
          blacklisted_by: data[0].blacklisted_by,
          update_rate_user: data[0].update_rate_user,
          update_rate_time_date: data[0].update_rate_time_date,
        });
      }
    }
  }
  useEffect(() => {
    getCustomerUpdate();
  }, []);


  // Get Aircharge
  async function getAirchargeUpdate(id) {
    setFormData({});
    console.log(id);
    if(id){
      const res = await fetch(`/api/aircharge/${id}`);
      const data = await res.json();
      console.log(data.length);
      setFormAirLength(data.length);
      if(res.ok && data.length > 0) {
        setFormDataAir(
          data.map(item => ({
            type: item.type,
            consignee: item.consignee,
            wtbreak: item.wtbreak,
            express: item.express,
            perishable: item.perishable,
            gen_cargo: item.gen_cargo,
        }))
        );
      } else {
        setFormDataAir([
          { wtbreak: "0-5", express: "", perishable: "", gen_cargo: "", type: "" },
          { wtbreak: "6-49", express: "", perishable: "", gen_cargo: "", type: "" },
          { wtbreak: "50-249", express: "", perishable: "", gen_cargo: "", type: "" },
          { wtbreak: "250", express: "", perishable: "", gen_cargo: "", type: "" },
      ]);
      }
    }
  }
  useEffect(() => {
    getAirchargeUpdate();
  }, []);


  //Update Customer
  async function openUpdate(id) {
    setOpen(true);
    setStatus(4);
    setCustid(id);
  }


  async function handleUpdate(e) {
    e.preventDefault();
    formData.cust_uniq_id = id;
    const res = await fetch(`/api/updatecustomerconsignee/${custid}`, {
      method: "put",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(formData),
    });
    const data = await res.json();
    console.log(data);
    if(data.errors) {
      setErrors(data.errors);
    } else {
      setStatus(5);
      getCustomerConsigneeList();

      if(formData.account_type == "Prepaid" || formData.account_type == "Account") {
        if(formAirLength === 0) {
          const addFormDataAir = formDataAir.map(item => ({
            ...item,
            type: formData.account_type,
            consignee: String(formData.id),
            express: Number(item.express) || 0,
            perishable: Number(item.perishable) || 0,
            gen_cargo: Number(item.gen_cargo) || 0
          }));

          const resss = await fetch("/api/aircharge", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ rates: addFormDataAir }),
          });
          const data = await resss.json();
          console.log(data);

        } else {
          const updatedFormDataAir = formDataAir.map((item) => ({
            ...item,
            type: formData.account_type,
            consignee: String(id),
            express: Number(item.express) || 0,
            perishable: Number(item.perishable) || 0,
            gen_cargo: Number(item.gen_cargo) || 0,
          }));
  
          const ress = await fetch(`/api/aircharge/${id}`, {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ rates: updatedFormDataAir }),
          });
          const data = await ress.json();
          console.log(data);
        }
      }
    }
  }

  async function closeUpdate() {
    setOpen(false);
    setOpenUpdateDial(false);
    setOpenRatesDial(false);
    setOpenStatusDial(false);
    getCustomerConsigneeList();
  }

  
  const handleCheckboxChange = (event, record) => {
    const { checked } = event.target;
    setSelectedItems((prev) =>
      checked ? [...prev, {id: record.id, address: record.address, rate_cbm: record.rate_cbm, rate_kilo: record.rate_kilo, 
                              advalorem: record.advalorem, value_charge: record.value_charge, minimum: record.minimum}]
                : prev.filter((item) => item.id !== record.id)
    );
  };

  const handleSelectAll = (event) => {
    const checked = event.target.checked;
    setSelectedItems(checked ? sortdata.map((rec) => ({id: rec.id, address: rec.address, rate_cbm: rec.rate_cbm, rate_kilo: rec.rate_kilo, 
      advalorem: rec.advalorem, value_charge: rec.value_charge, minimum: rec.minimum})) : []);
  };


  //Update Customer Rates
  async function updateCustomerRates(id) {
    isLoading();
    if(selectedItems.length > 0) {
    const custRates = selectedItems.map(item => ({
      ...item,
      cust_id: item.id,
      rate_cbm: Number(item.rate_cbm),
      rate_kilo: Number(item.rate_kilo),
      advalorem: Number(item.advalorem),
      value_charge: Number(item.value_charge),
      minimum: Number(item.minimum),
    }));
    console.log(custRates);

    const res = await fetch(`/api/updatecustomerrates/${id}`, {
      method: "put",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ rates: custRates}),
    });
    const data = await res.json();
    console.log(data);
    if(res.ok) {
      setOpen(true);
      setStatus(6);
      getCustomerConsigneeList();
    }
    }
    stopLoading();
  }


  return (
    <> 
    <div className="flex items-center font-medium border-b border-slate-300">
      <main className="px-4 flex-1 mx-auto py-4"><h1>Customer - Prepaid</h1></main>
    </div>

    <div className="flex items-center font-medium mx-auto py-4">
      <main className="flex-1 mx-auto p-4">
        <div className="mx-auto">
          <div className="bg-gray-50 shadow-md border">
            <div className="p-6 text-gray-900 dark:text-gray-100">
              <div className="text-left caption-top dark:text-gray-800">
                <div className="flex flex-row py-2">
                  <div className="flex w-full"><h1>{accountType.account_type ? <span> { accountType.account_type } ( <strong>{accountType.registered_name}</strong> ) </span> : "-"}</h1></div>
                    <div className="flex mb-3">
                      <button type="button" onClick={() => {setOpenRatesDial(true); setFormData({}); setErrors(false)}} className="h-fit flex flex-row primary-btn py-3 px-5 text-xs tracking-wider font-semibold rounded-md text-white bg-gray-800 hover:bg-gray-600 focus:outline-none"><FaRegEdit size={15} className="mr-1"/>Update&nbsp;Rate</button>
                      <button type="button" onClick={() => {setOpenAddDial(true); setFormData({}); setErrors(false)}} className="h-fit flex flex-row primary-btn ml-1 py-3 px-5 text-xs tracking-wider font-semibold rounded-md text-white bg-gray-800 hover:bg-gray-600 focus:outline-none"><MdAdd size={16}/>Add&nbsp;Consignee</button>
                    </div> 
                  </div>
                </div>
                <div className='text-gray-800 text-sm relative mb-2'>
                  <hr />
                  Per&nbsp;Page <select className='mt-3 form-select text-gray-800 bg-white text-sm px-3 w-20 py-3 border border-gray-300 rounded-md outline-gray-300' value={dataPerPage} onChange={(e) => { setDataperpage(parseInt(e.target.value, 10)); setCurrentPage(1); }}>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={30}>30</option>
                    <option value={40}>40</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                  <div className='absolute inset-y-0 right-0 w-1/4'><input type='text' className='text-gray-800 text-sm my-3 px-4 py-3 w-full bg-white border border-gray-300 rounded-md outline-gray-300' placeholder='Search...' onChange={(e) => setSearch(e.target.value)} value={search} /></div>
                </div>
                <div className={`overflow-x-auto transition-all duration-75 min-w-0 mx-auto ${isMediumScreen ? "w-[calc(100vw-22rem)]" : "w-[calc(100vw-9rem)]"}`}>
                <table className="min-w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                  <thead className="text-xs text-center uppercase bg-gray-200 text-gray-800 border-b border-t border-gray-300">
                    <tr className="text-nowrap">
                      <th className='px-3 py-3'><input type="checkbox" className="h-4 w-4" checked={selectedItems.length === sortdata.length} onChange={handleSelectAll} /></th>
                      <th className='px-3 py-3'><TableSort sortdata={sortdata} title="Customer ID" field="id" sorteddata={sortdata} setSorteddata={setSortdata} sorting={sorting} setSorting={setSorting} /> </th>
                      <th className='px-3 py-3'><TableSort sortdata={sortdata} title="Registered name" field="registered_name" sorteddata={sortdata} setSorteddata={setSortdata} sorting={sorting} setSorting={setSorting} /> </th>
                      <th className='px-3 py-3'>Address</th>
                      <th className='px-3 py-3'>Branch</th>
                      <th className='px-3 py-3'>Mobile Number</th>
                      <th className='px-3 py-3'>Landline Number</th>
                      <th className='px-3 py-3'>Rate/<br/>CBM</th>
                      <th className='px-3 py-3'>Rate/<br/>Kilo</th>
                      <th className='px-3 py-3'>Value Charge</th>
                      <th className="px-3 py-3">Advalorem</th>
                      <th className="px-3 py-3">Minimum</th>
                      <th className="px-3 py-3">Special Item</th>
                      <th className="px-3 py-3">Blacklist Status</th>
                      <th className="px-3 py-3">Status</th>
                    </tr>
                    </thead>
                    <tbody className="text-sm text-center bg-gray-50 dark:bg-gray-700 dark:text-gray-800 border-b-2 border-gray-300">
                    {sortdata.length > 0 ? (sortdata.map(rec => (
                      <tr className="text-xs bg-white border-b dark:bg-gray-100 dark:border-gray-300 hover:bg-gray-50" key={rec.id}>   
                        <td><input type="checkbox" className="h-4 w-4" checked={selectedItems.some((item) => item.id === rec.id)} onChange={(e) => handleCheckboxChange(e, rec)} /></td>  
                        <td className="px-3 py-3">
                          <Link to="#" onClick={() => { setOpenUpdateDial(true); getCustomerUpdate(rec.id); getAirchargeUpdate(rec.id); setErrors(false); }} className="font-medium text-blue-600 dark:text-blue-500 hover:underline mx-1">{rec.id}</Link>
                        </td>
                        <td className="px-3 py-3">{rec.registered_name}</td>
                        <td className="px-3 py-3">{rec.address}</td>
                        <td className="px-3 py-3">{rec.branch}</td>
                        <td className="px-3 py-3">{rec.mobile_number}</td>
                        <td className="px-3 py-3">{rec.contact_number}</td>
                        <td className="px-3 py-3">{rec.rate_cbm}</td>
                        <td className="px-3 py-3">{rec.rate_kilo}</td>
                        <td className="px-3 py-3">{rec.value_charge}</td>
                        <td className="px-3 py-3">{rec.advalorem}</td>
                        <td className="px-3 py-3">{rec.minimum}</td>
                        <td className="px-3 py-3">
                          <Link to={`/maintenance/customer/specialitem/${rec.id}`} target="_blank" rel="noopener noreferrer" className="flex justify-center hover:underline">
                            <FaCubes size={20} className="hover:text-slate-600 mr-1" />
                            Special Item
                          </Link>
                        </td>
                        <td className="px-3 py-3">
                          <Link to="#" onClick={() => { updateBlacklistStatus(rec.id, rec.blacklist_status); }} className="text-green-800 font-bold hover:underline">
                            { rec.blacklist_status === "n" ? "Active" : "Blacklisted" }
                          </Link>
                        </td>
                        <td className="px-3 py-3">
                          <Link to="#"  onClick={() => {setOpenStatusDial(true); getCustomerUpdate(rec.id); setFormData({}); setErrors(false)}} className="text-green-800 font-bold hover:underline">
                            { rec.status === "n" ? "Active" : "Disabled" }
                          </Link>
                        </td>
                      </tr>
                    ))) : (
                      <tr className='text-xs bg-white border-b dark:bg-gray-100 dark:border-gray-300'>
                        <td className='px-3 py-3 text-center' colSpan={13}>Empty</td>
                      </tr>
                    )}
                    </tbody>                        
                  </table>
                </div> 
                <Pagination dataSize={consignee.length} dataPPage={dataPerPage} nPages={pageCount} currentPage={currentPage} setCurrentPage={handleChange} />
            </div>
          </div>
        </div>  
      </main>
    </div>

    {/* Add Customer Consignee */}
    <Dialog open={openAddDial} onClose={setOpenAddDial} className="relative z-[999]">
      <DialogBackdrop
          transition
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
      />

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <DialogPanel transition className="relative transform overflow-hidden rounded-lg transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-screen-xl data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"> 

            <div className="flex flex-col font-[sans-serif]">
              <div className="w-full mx-auto border border-gray-300 rounded-2xl p-8 bg-gray-50">
                <div className="text-center mb-4">
                  <h1 className="text-2xl text-left pb-6 flex"><FaUserPlus size={30} className='mr-1'/> Add Customer Consignee </h1>
                
                <form onSubmit={handleCreate} className='w-full mx-auto space-y-6'>
                <div className='text-left border p-2 bg-gray-100'>
                  <div className='flex flex-row'>
                    <div className='p-2 w-1/2'>
                    <div className='text-xl'>Customer Information<hr/></div>
                      <input className="mt-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="Registered Name" value={formData.registered_name}
                          onChange={(e) => setFormData({ ...formData, registered_name: e.target.value })}
                      />
                        {errors.registered_name && <p className="error text-red-700 text-left ml-2">{errors.registered_name[0]}</p>}

                      <input className=" mt-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="Contact Person" value={formData.contact_person}
                          onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                      />

                      <input className="mt-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="Address" value={formData.address}
                          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      />
                        {errors.address && <p className="error text-red-700 text-left ml-2">{errors.address[0]}</p>}

                      <select className=' mt-4 form-select bg-white text-sm px-3 w-full py-3 border border-gray-300 rounded-md outline-blue-500' onChange={(e) => setFormData({ ...formData, branch_id: e.target.value })}>
                          <option value="">Branch</option>
                          {Object.keys(branchOptions).map((type) => (
                            <optgroup label={type} key={type}>
                              {branchOptions[type].map(({str_list_id}) => (
                                <option key={str_list_id}>{str_list_id}</option>
                              ))}
                            </optgroup>
                          ))}
                        </select>
                        {
                        errors.branch && <p className="error text-red-700 text-left ml-2">{errors.branch[0]}</p>}

                      <input className=" mt-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="Land Line Number" value={formData.contact_number}
                          onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
                      />
                        {errors.contact_number && <p className="error text-red-700 text-left ml-2">{errors.contact_number[0]}</p>}

                      <input className=" mt-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="Mobile Number" value={formData.mobile_number}
                          onChange={(e) => setFormData({ ...formData, mobile_number: e.target.value })}
                      />
                        {errors.mobile_number && <p className="error text-red-700 text-left ml-2">{errors.mobile_number[0]}</p>}

                      <div className="mt-4 text-xl">Customer Rate</div>
                      <hr/>
                        <input className="mt-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="Rate/CBM" value={formData.rate_cbm}
                            onChange={(e) => setFormData({ ...formData, rate_cbm: e.target.value })} />
                        <input className="mt-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="Rate/Kilo" value={formData.rate_kilo}
                            onChange={(e) => setFormData({ ...formData, rate_kilo: e.target.value })} />
                        <input className="mt-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="Value Charge" value={formData.value_charge}
                            onChange={(e) => setFormData({ ...formData, value_charge: e.target.value })} />
                        <input className="mt-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="Advalorem" value={formData.advalorem}
                            onChange={(e) => setFormData({ ...formData, advalorem: e.target.value })} />
                        <input className="mt-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="Minimum" value={formData.minimum}
                            onChange={(e) => setFormData({ ...formData, minimum: e.target.value })} />
                    </div>

                    <div className='p-2 w-1/2'>
                    <div className='text-xl'>FCL Rate<hr/></div>
                      <input className="mt-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="FCL Value Charge" value={formData.fcl_value_charge}
                          onChange={(e) => setFormData({ ...formData, fcl_value_charge: e.target.value })}
                      />
                        {errors.terms && <p className="error text-red-700 text-left ml-2">{errors.terms[0]}</p>}
                      
                    <div className="flex flex-row">
                      <div className="w-1/2 mr-1">
                        <input className="mt-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="10 Ftr. (Rates)" value={formData.ftr10}
                            onChange={(e) => setFormData({ ...formData, ftr10: e.target.value })}
                        />

                        <input className="mt-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="20 Ftr. (Rates)" value={formData.ftr20}
                            onChange={(e) => setFormData({ ...formData, ftr20: e.target.value })}
                        />

                        <input className="mt-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="40 Ftr. (Rates)" value={formData.ftr40}
                            onChange={(e) => setFormData({ ...formData, ftr40: e.target.value })}
                        />

                        <input className="mt-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="4 Wheeler (Rates)" value={formData.wheeler4}
                            onChange={(e) => setFormData({ ...formData, wheeler4: e.target.value })}
                        />

                        <input className="mt-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="6 Wheeler (Rates)" value={formData.wheeler6}
                            onChange={(e) => setFormData({ ...formData, wheeler6: e.target.value })}
                        />

                        <input className="mt-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="8 Wheeler (Rates)" value={formData.wheeler8}
                            onChange={(e) => setFormData({ ...formData, wheeler8: e.target.value })}
                        />

                        <input className="mt-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="10 Wheeler (Rates)" value={formData.wheeler10}
                            onChange={(e) => setFormData({ ...formData, wheeler10: e.target.value })}
                        />

                        <input className="mt-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="Freightliner (Rates)" value={formData.freightliner}
                            onChange={(e) => setFormData({ ...formData, freightliner: e.target.value })}
                        />

                        <input className="mt-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="Rolling Cargo (Rates)" value={formData.rolling_cargo}
                            onChange={(e) => setFormData({ ...formData, rolling_cargo: e.target.value })}
                        />

                        <input className="mt-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="20 Ftr. FLATRACK (Rates)" value={formData.ftr20_flat}
                            onChange={(e) => setFormData({ ...formData, ftr20_flat: e.target.value })}
                        />

                        <input className="mt-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="40 Ftr. FLATRACK (Rates)" value={formData.ftr40_flat}
                            onChange={(e) => setFormData({ ...formData, ftr40_flat: e.target.value })}
                        />
                      </div>
                      <div className="w-1/2 ml-1">
                        <input className=" mt-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="10 Ftr. (DV Minimum)" value={formData.ftr10_value}
                            onChange={(e) => setFormData({ ...formData, ftr10_value: e.target.value })}
                        />

                        <input className=" mt-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="20 Ftr. (DV Minimum)" value={formData.ftr20_value}
                            onChange={(e) => setFormData({ ...formData, ftr20_value: e.target.value })}
                        />

                        <input className=" mt-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="40 Ftr. (DV Minimum)" value={formData.ftr40_value}
                            onChange={(e) => setFormData({ ...formData, ftr40_value: e.target.value })}
                        />

                        <input className=" mt-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="4 Wheeler (DV Minimum)" value={formData.wheeler4_value}
                            onChange={(e) => setFormData({ ...formData, wheeler4_value: e.target.value })}
                        />

                        <input className=" mt-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="6 Wheeler (DV Minimum)" value={formData.wheeler6_value}
                            onChange={(e) => setFormData({ ...formData, wheeler6_value: e.target.value })}
                        />

                        <input className=" mt-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="8 Wheeler (DV Minimum)" value={formData.wheeler8_value}
                            onChange={(e) => setFormData({ ...formData, wheeler8_value: e.target.value })}
                        />

                        <input className=" mt-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="10 Wheeler (DV Minimum)" value={formData.wheeler10_value}
                            onChange={(e) => setFormData({ ...formData, wheeler10_value: e.target.value })}
                        />

                        <input className=" mt-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="Freightliner (DV Minimum)" value={formData.freightliner_value}
                            onChange={(e) => setFormData({ ...formData, freightliner_value: e.target.value })}
                        />

                        <input className=" mt-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="Rolling Cargo (DV Minimum)" value={formData.rolling_cargo_value}
                            onChange={(e) => setFormData({ ...formData, rolling_cargo_value: e.target.value })}
                        />

                        <input className=" mt-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="20 Ftr. FLATRACK (DV Minimum)" value={formData.ftr20_flat_value}
                            onChange={(e) => setFormData({ ...formData, ftr20_flat_value: e.target.value })}
                        />

                        <input className=" mt-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="40 Ftr. FLATRACK (DV Minimum)" value={formData.ftr40_flat_value}
                            onChange={(e) => setFormData({ ...formData, ftr40_flat_value: e.target.value })}
                        />
                      </div>
                    </div>
                    </div>          
                  </div>
                  </div>

                  {/* Air Freight Rate */}
                  <div className='flex flex-col border bg-gray-100 p-3'>
                    <table cellPadding={6} className='text-sm w-3/4'>
                      <thead>
                        <tr>
                          <td className='flex text-left text-xl' colSpan={4}>Air Charge</td>
                        </tr>
                        <tr>
                          <td colSpan={4}><hr/></td>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className='text-left align-bottom'> 
                          <td>Air Value Charge:</td>
                          <td colSpan={3}><input className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-3 w-full py-2 rounded-md outline-blue-500" type="text" placeholder="FCL Value Charge" value={formData.airvalue}
                            onChange={(e) => setFormData({ ...formData, airvalue: e.target.value })}
                          /></td>
                        </tr>
                        <tr className='text-left align-bottom'>
                          <td>&nbsp;</td>
                          <td>Express Cargo Rate</td>
                          <td>Perishable Rate</td>
                          <td>General Cargo Rate</td>
                        </tr>

                      {formDataAir.map((row, index) => (
                        <tr className='text-left align-bottom' key={index}>
                          <td>{row.wtbreak == 250 ? row.wtbreak + "-up" : row.wtbreak} kilos:</td>
                          <td><input className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-3 w-full py-2 rounded-md outline-blue-500" type="text" placeholder="Enter Express Rate" value={row.express}
                            onChange={(e) => handleAirCharge(index, "express", e.target.value)}
                          />
                          {errors[index]?.express && <p className="text-red-500 text-sm">{errors[index].express}</p>}
                          </td>
                          <td><input className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-3 w-full py-2 rounded-md outline-blue-500" type="text" placeholder="Enter Perishable Rate" value={row.perishable}
                            onChange={(e) => handleAirCharge(index, "perishable", e.target.value)}
                          />
                          {errors[index]?.perishable && <p className="text-red-500 text-sm">{errors[index].perishable}</p>}
                          </td>
                          <td><input className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-3 w-full py-2 rounded-md outline-blue-500" type="text" placeholder="Enter General Cargo Rate" value={row.gen_cargo}
                            onChange={(e) => handleAirCharge(index, "gen_cargo", e.target.value)}
                          />
                          {errors[index]?.gen_cargo && <p className="text-red-500 text-sm">{errors[index].gen_cargo}</p>}
                          </td>
                        </tr>
                      ))}
                      </tbody>                   
                    </table>
                  </div>

                    <div className="!mt-8 float-right">
                      <button className="primary-btn py-3 px-4 text-sm tracking-wider font-semibold rounded-md text-white bg-gray-800 hover:bg-gray-600 focus:outline-none"> Add Consignee </button>
                    </div> 
                </form>
                    <div className="!mt-8 float-right">
                      <button onClick={() => setOpenAddDial(false)} className="primary-btn py-3 px-10 mr-4 text-sm tracking-wider font-semibold rounded-md text-white bg-gray-500 hover:bg-gray-600 focus:outline-none"> Cancel </button>
                    </div>
                </div>
              </div>
            </div>
            </DialogPanel>
          </div>
      </div>
    </Dialog>


    {/* Update Customer */}
    <Dialog open={openUpdateDial} onClose={setOpenUpdateDial} className="relative z-[999]">
      <DialogBackdrop
          transition
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
      />

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <DialogPanel transition className="relative transform overflow-hidden rounded-lg transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-screen-xl data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"> 

            <div className="flex flex-col font-[sans-serif]">
              <div className="w-full mx-auto border border-gray-300 rounded-2xl p-8 bg-gray-50">
                <div className="text-center mb-4">
                  <h1 className="text-2xl text-left pb-6 flex"><FaUserEdit size={30} className='mr-1'/> Update Customer Consignee </h1>
                
 
                <div className='text-left border p-2 bg-gray-100'>
                  <div className='flex flex-row'>
                    <div className='p-2 w-1/2'>
                    <div className='text-xl'>Customer Information<hr/></div>
                      <input className="mt-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="Registered Name" value={formData.registered_name}
                          onChange={(e) => setFormData({ ...formData, registered_name: e.target.value })}
                      />
                        {errors.registered_name && <p className="error text-red-700 text-left ml-2">{errors.registered_name[0]}</p>}

                      <input className=" mt-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="Contact Person" value={formData.contact_person}
                          onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                      />

                      <input className="mt-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="Address" value={formData.address}
                          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      />
                        {errors.address && <p className="error text-red-700 text-left ml-2">{errors.address[0]}</p>}

                      <select className=' mt-4 form-select bg-white text-sm px-3 w-full py-3 border border-gray-300 rounded-md outline-blue-500' onChange={(e) => setFormData({ ...formData, branch_id: e.target.value })}>
                          <option value="">{formData.branch_id}</option>
                          {Object.keys(branchOptions).map((type) => (
                            <optgroup label={type} key={type}>
                              {branchOptions[type].map(({str_list_id}) => (
                                <option key={str_list_id}>{str_list_id}</option>
                              ))}
                            </optgroup>
                          ))}
                        </select>
                        {
                        errors.branch && <p className="error text-red-700 text-left ml-2">{errors.branch[0]}</p>}

                      <input className=" mt-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="Land Line Number" value={formData.contact_number}
                          onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
                      />
                        {errors.contact_number && <p className="error text-red-700 text-left ml-2">{errors.contact_number[0]}</p>}

                      <input className=" mt-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="Mobile Number" value={formData.mobile_number}
                          onChange={(e) => setFormData({ ...formData, mobile_number: e.target.value })}
                      />
                        {errors.mobile_number && <p className="error text-red-700 text-left ml-2">{errors.mobile_number[0]}</p>}

                      <div className="mt-4 text-xl">Customer Rate</div>
                      <hr/>
                        <input className="mt-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="Rate/CBM" value={formData.rate_cbm}
                            onChange={(e) => setFormData({ ...formData, rate_cbm: e.target.value })} />
                        <input className="mt-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="Rate/Kilo" value={formData.rate_kilo}
                            onChange={(e) => setFormData({ ...formData, rate_kilo: e.target.value })} />
                        <input className="mt-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="Value Charge" value={formData.value_charge}
                            onChange={(e) => setFormData({ ...formData, value_charge: e.target.value })} />
                        <input className="mt-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="Advalorem" value={formData.advalorem}
                            onChange={(e) => setFormData({ ...formData, advalorem: e.target.value })} />
                        <input className="mt-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="Minimum" value={formData.minimum}
                            onChange={(e) => setFormData({ ...formData, minimum: e.target.value })} />
                    </div>

                    <div className='p-2 w-1/2'>
                    <div className='text-xl'>FCL Rate<hr/></div>
                      <input className="mt-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="FCL Value Charge" value={formData.fcl_value_charge}
                          onChange={(e) => setFormData({ ...formData, fcl_value_charge: e.target.value })}
                      />
                        {errors.terms && <p className="error text-red-700 text-left ml-2">{errors.terms[0]}</p>}
                      
                    <div className="flex flex-row">
                      <div className="w-1/2 mr-1">
                        <input className="mt-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="10 Ftr. (Rates)" value={formData.ftr10}
                            onChange={(e) => setFormData({ ...formData, ftr10: e.target.value })}
                        />

                        <input className="mt-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="20 Ftr. (Rates)" value={formData.ftr20}
                            onChange={(e) => setFormData({ ...formData, ftr20: e.target.value })}
                        />

                        <input className="mt-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="40 Ftr. (Rates)" value={formData.ftr40}
                            onChange={(e) => setFormData({ ...formData, ftr40: e.target.value })}
                        />

                        <input className="mt-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="4 Wheeler (Rates)" value={formData.wheeler4}
                            onChange={(e) => setFormData({ ...formData, wheeler4: e.target.value })}
                        />

                        <input className="mt-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="6 Wheeler (Rates)" value={formData.wheeler6}
                            onChange={(e) => setFormData({ ...formData, wheeler6: e.target.value })}
                        />

                        <input className="mt-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="8 Wheeler (Rates)" value={formData.wheeler8}
                            onChange={(e) => setFormData({ ...formData, wheeler8: e.target.value })}
                        />

                        <input className="mt-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="10 Wheeler (Rates)" value={formData.wheeler10}
                            onChange={(e) => setFormData({ ...formData, wheeler10: e.target.value })}
                        />

                        <input className="mt-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="Freightliner (Rates)" value={formData.freightliner}
                            onChange={(e) => setFormData({ ...formData, freightliner: e.target.value })}
                        />

                        <input className="mt-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="Rolling Cargo (Rates)" value={formData.rolling_cargo}
                            onChange={(e) => setFormData({ ...formData, rolling_cargo: e.target.value })}
                        />

                        <input className="mt-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="20 Ftr. FLATRACK (Rates)" value={formData.ftr20_flat}
                            onChange={(e) => setFormData({ ...formData, ftr20_flat: e.target.value })}
                        />

                        <input className="mt-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="40 Ftr. FLATRACK (Rates)" value={formData.ftr40_flat}
                            onChange={(e) => setFormData({ ...formData, ftr40_flat: e.target.value })}
                        />
                      </div>
                      <div className="w-1/2 ml-1">
                        <input className=" mt-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="10 Ftr. (DV Minimum)" value={formData.ftr10_value}
                            onChange={(e) => setFormData({ ...formData, ftr10_value: e.target.value })}
                        />

                        <input className=" mt-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="20 Ftr. (DV Minimum)" value={formData.ftr20_value}
                            onChange={(e) => setFormData({ ...formData, ftr20_value: e.target.value })}
                        />

                        <input className=" mt-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="40 Ftr. (DV Minimum)" value={formData.ftr40_value}
                            onChange={(e) => setFormData({ ...formData, ftr40_value: e.target.value })}
                        />

                        <input className=" mt-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="4 Wheeler (DV Minimum)" value={formData.wheeler4_value}
                            onChange={(e) => setFormData({ ...formData, wheeler4_value: e.target.value })}
                        />

                        <input className=" mt-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="6 Wheeler (DV Minimum)" value={formData.wheeler6_value}
                            onChange={(e) => setFormData({ ...formData, wheeler6_value: e.target.value })}
                        />

                        <input className=" mt-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="8 Wheeler (DV Minimum)" value={formData.wheeler8_value}
                            onChange={(e) => setFormData({ ...formData, wheeler8_value: e.target.value })}
                        />

                        <input className=" mt-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="10 Wheeler (DV Minimum)" value={formData.wheeler10_value}
                            onChange={(e) => setFormData({ ...formData, wheeler10_value: e.target.value })}
                        />

                        <input className=" mt-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="Freightliner (DV Minimum)" value={formData.freightliner_value}
                            onChange={(e) => setFormData({ ...formData, freightliner_value: e.target.value })}
                        />

                        <input className=" mt-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="Rolling Cargo (DV Minimum)" value={formData.rolling_cargo_value}
                            onChange={(e) => setFormData({ ...formData, rolling_cargo_value: e.target.value })}
                        />

                        <input className=" mt-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="20 Ftr. FLATRACK (DV Minimum)" value={formData.ftr20_flat_value}
                            onChange={(e) => setFormData({ ...formData, ftr20_flat_value: e.target.value })}
                        />

                        <input className=" mt-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="40 Ftr. FLATRACK (DV Minimum)" value={formData.ftr40_flat_value}
                            onChange={(e) => setFormData({ ...formData, ftr40_flat_value: e.target.value })}
                        />
                      </div>
                    </div>
                    </div>          
                  </div>
                  </div>

                  {/* Air Freight Rate */}
                  <div className='flex flex-col border bg-gray-100 p-3'>
                    <table cellPadding={6} className='text-sm w-3/4'>
                      <thead>
                        <tr>
                          <td className='flex text-left text-xl' colSpan={4}>Air Charge</td>
                        </tr>
                        <tr>
                          <td colSpan={4}><hr/></td>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className='text-left align-bottom'> 
                          <td>Air Value Charge:</td>
                          <td colSpan={3}><input className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-3 w-full py-2 rounded-md outline-blue-500" type="text" placeholder="FCL Value Charge" value={formData.airvalue}
                            onChange={(e) => setFormData({ ...formData, airvalue: e.target.value })}
                          /></td>
                        </tr>
                        <tr className='text-left align-bottom'>
                          <td>&nbsp;</td>
                          <td>Express Cargo Rate</td>
                          <td>Perishable Rate</td>
                          <td>General Cargo Rate</td>
                        </tr>

                      {formDataAir.map((row, index) => (
                        <tr className='text-left align-bottom' key={index}>
                          <td>{row.wtbreak == 250 ? row.wtbreak + "-up" : row.wtbreak} kilos:</td>
                          <td><input className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-3 w-full py-2 rounded-md outline-blue-500" type="text" placeholder="Enter Express Rate" value={row.express}
                            onChange={(e) => handleAirCharge(index, "express", e.target.value)}
                          />
                          {errors[index]?.express && <p className="text-red-500 text-sm">{errors[index].express}</p>}
                          </td>
                          <td><input className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-3 w-full py-2 rounded-md outline-blue-500" type="text" placeholder="Enter Perishable Rate" value={row.perishable}
                            onChange={(e) => handleAirCharge(index, "perishable", e.target.value)}
                          />
                          {errors[index]?.perishable && <p className="text-red-500 text-sm">{errors[index].perishable}</p>}
                          </td>
                          <td><input className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-3 w-full py-2 rounded-md outline-blue-500" type="text" placeholder="Enter General Cargo Rate" value={row.gen_cargo}
                            onChange={(e) => handleAirCharge(index, "gen_cargo", e.target.value)}
                          />
                          {errors[index]?.gen_cargo && <p className="text-red-500 text-sm">{errors[index].gen_cargo}</p>}
                          </td>
                        </tr>
                      ))}
                      </tbody>                   
                    </table>
                  </div>

                    <div className="!mt-8 float-right">
                    <button onClick={() => openUpdate(formData.id)} className="primary-btn py-3 px-4 text-sm tracking-wider font-semibold rounded-md text-white bg-gray-800 hover:bg-gray-600 focus:outline-none"> Update Customer </button>
                    </div> 
                
                    <div className="!mt-8 float-right">
                      <button onClick={() => setOpenUpdateDial(false)} className="primary-btn py-3 px-10 mr-4 text-sm tracking-wider font-semibold rounded-md text-white bg-gray-500 hover:bg-gray-600 focus:outline-none"> Cancel </button>
                    </div>
                </div>
              </div>
            </div>
            </DialogPanel>
          </div>
      </div>
    </Dialog>

    {/* Update Rates */}
    <Dialog open={openRatesDial} onClose={setOpenRatesDial} className="relative z-[999]">
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
                    <h1 className="text-2xl text-left flex"><FaUserEdit size={30} className='mr-1'/> Update Customer Rate </h1>
                    <hr/>
                    <div className="text-left mt-8 mb-2"><h1>{ accountType.account_type } ( <strong>{accountType.registered_name}</strong> )</h1></div>
                      <div className='flex flex-row p-2'>
                        <div className="w-full overflow-auto">
                          <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400 overflow-hidden">
                          <thead className="text-xs text-center uppercase bg-gray-200 text-gray-800 border-b border-t border-gray-300">
                              <tr className="text-nowrap">
                              <th className="px-3 py-3">ID No.</th>
                              <th className="px-3 py-3">Address</th>
                              <th className="px-3 py-3">Rate/CBM</th>
                              <th className="px-3 py-3">Rate/Kilo</th>
                              <th className="px-3 py-3">Advalorem</th>
                              <th className="px-3 py-3">Value Charge</th>
                              <th className="px-3 py-3">Minimum</th>
                              </tr>
                            </thead>
                            <tbody className="text-xs text-center bg-gray-50 dark:bg-gray-700 dark:text-gray-800 border-b-2 border-gray-300">
                            {selectedItems.length > 0 ? (selectedItems.map((rec, index) => (
                              <tr className="text-xs bg-white border-b dark:bg-gray-100 dark:border-gray-300 hover:bg-gray-50" key={rec.id}>    
                                  <th className="px-3 py-3">{rec.id}</th>
                                  <td className="px-3 py-3 text-nowrap">{rec.address}</td>
                                  <td className="px-3 py-3">
                                    <input className="register-link text-gray-800 text-right bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" value={rec.rate_cbm} onChange={(e) => { const updatedItems = [...selectedItems]; updatedItems[index] = { ...rec, rate_cbm: e.target.value }; setSelectedItems(updatedItems); }} />
                                  </td>
                                  <td className="px-3 py-3">
                                    <input className="register-link text-gray-800 text-right bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" value={rec.rate_kilo} onChange={(e) => { const updatedItems = [...selectedItems]; updatedItems[index] = { ...rec, rate_kilo: e.target.value }; setSelectedItems(updatedItems); }} />
                                  </td>
                                  <td className="px-3 py-3">
                                    <input className="register-link text-gray-800 text-right bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" value={rec.advalorem} onChange={(e) => { const updatedItems = [...selectedItems]; updatedItems[index] = { ...rec, advalorem: e.target.value }; setSelectedItems(updatedItems); }} />
                                  </td>
                                  <td className="px-3 py-3">
                                    <input className="register-link text-gray-800 text-right bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" value={rec.value_charge} onChange={(e) => { const updatedItems = [...selectedItems]; updatedItems[index] = { ...rec, value_charge: e.target.value }; setSelectedItems(updatedItems); }} />
                                  </td>
                                  <td className="px-3 py-3">
                                    <input className="register-link text-gray-800 text-right bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" value={rec.minimum} onChange={(e) => { const updatedItems = [...selectedItems]; updatedItems[index] = { ...rec, minimum: e.target.value }; setSelectedItems(updatedItems); }} />
                                  </td>
                                </tr>
                            ))) : (
                              <tr className='text-xs bg-white border-b dark:bg-gray-100 dark:border-gray-300'>
                                <td className='px-3 py-3 text-center' colSpan={7}>Empty</td>
                              </tr>
                            )}
                            </tbody>                        
                          </table>
                        </div>        
                      </div>
                        <div className="!mt-8 float-right">
                          <button onClick={() => updateCustomerRates(formData.id)} className="primary-btn py-3 px-4 text-sm tracking-wider font-semibold rounded-md text-white bg-gray-800 hover:bg-gray-600 focus:outline-none"> Update Rate </button>
                        </div> 
                    
                        <div className="!mt-8 float-right">
                          <button onClick={() => setOpenRatesDial(false)} className="primary-btn py-3 px-10 mr-4 text-sm tracking-wider font-semibold rounded-md text-white bg-gray-500 hover:bg-gray-600 focus:outline-none"> Cancel </button>
                        </div>
                    </div>
                  </div>
                </div>
            </DialogPanel>
          </div>
      </div>
    </Dialog>

    {/* Update Status Reason */}
    <Dialog open={openStatusDial} onClose={setOpenStatusDial} className="relative z-[999]">
      <DialogBackdrop
          transition
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
      />

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <DialogPanel transition className="relative transform overflow-hidden rounded-lg transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-xl data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"> 

            <div className="flex flex-col font-[sans-serif]">
                <div className="w-full mx-auto border border-gray-300 rounded-2xl p-8 bg-gray-50">
                  <div className="text-center mb-4">
                    <div className="text-xl text-left pb-2"> Reason for disabling customer? </div>
                      <div className='flex flex-row border p-2 bg-gray-100'>
                        <div className='w-full p-4'>
                          <input className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="Reason" value={formData.reason}
                              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                          />
                            {errors.reason && <p className="error text-red-700 text-left ml-2">{errors.reason[0]}</p>}
                        </div>          
                      </div>
                        <div className="!mt-8 float-right">
                          <button onClick={() => updateStatus(formData.id, formData.status)} className="primary-btn py-3 px-12 text-sm tracking-wider font-semibold rounded-md text-white bg-gray-800 hover:bg-gray-600 focus:outline-none"> OK </button>
                        </div> 
                        <div className="!mt-8 float-right">
                          <button onClick={() => setOpenStatusDial(false)} className="primary-btn py-3 px-10 mr-4 text-sm tracking-wider font-semibold rounded-md text-white bg-gray-500 hover:bg-gray-600 focus:outline-none"> Cancel </button>
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
      title="Add Customer Consignee"
      body="Customer Consignee successfully added!"
      okConfirm={closeCreate}
      /> 
    }

    {status === 2 &&  <InfoBox open={open} setOpen={setOpen} onClose={setOpen}
      title="Confirm Success"
      body="Special Item successfully updated!"
      okConfirm={closeUpdate}
      /> 
    }

    {status === 3 &&  <DeleteBox open={open} setOpen={setOpen} onClose={setOpen}
      title="Confirm Success"
      body="Special Item successfully deleted!"
      okConfirm={closeDelete}
      /> 
    }

    {status === 4 && <UpdateBox open={open} setOpen={setOpen}
      title="Confirm Update"
      body="Are you sure you want to update this customer?"
      okConfirm={handleUpdate}
      /> 
    }

    {status === 5 &&  <InfoBox open={open} setOpen={setOpen} onClose={setOpen}
      title="Confirm Success"
      body="Customer successfully updated!"
      okConfirm={closeUpdate}
      /> 
    }

    {status === 6 &&  <InfoBox open={open} setOpen={setOpen} onClose={setOpen}
      title="Confirm Success"
      body="Customer rates successfully updated!"
      okConfirm={closeUpdate}
      /> 
    }

    {status === 7 &&  <InfoBox open={open} setOpen={setOpen} onClose={setOpen}
      title="Confirm Success"
      body="Customer status successfully updated!"
      okConfirm={closeUpdate}
    /> 
    }
    </>
  )
}