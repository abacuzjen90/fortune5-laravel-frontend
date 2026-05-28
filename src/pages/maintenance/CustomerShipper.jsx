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
import { FaUserPlus, FaUserEdit } from "react-icons/fa";

export default function CustomerShipper() { 
  const { id } = useParams();
  const { token } = useContext(AppContext);
  const [openAddDial, setOpenAddDial] = useState(false);
  const [openUpdateDial, setOpenUpdateDial] = useState(false);
  const [openStatusDial, setOpenStatusDial] = useState(false);
  const [openRatesDial, setOpenRatesDial] = useState(false);
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState(0);
  const [branch, setBranch] = useState([]);
  const [custid, setCustid] = useState(null);
  const [shipper, setShipper] = useState([]);
  const isMediumScreen = useScreenSize(768);
  const [showLoading, setShowLoading] = useState(false);
  const isLoading = () => {setShowLoading(true)};
  const stopLoading = () => {setShowLoading(false)};
  const [accountType, setAccountType] = useState({account_type: "", registered_name: ""});

  //Table Pagination, Search
  const [sortdata, setSortdata] = useState([]);
  const [sorting, setSorting] = useState({ key: "", ascending: true });
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageCount, setPageCount] = useState(0);
  const [dataPerPage, setDataperpage] = useState(10);

  const [formData, setFormData] = useState({
    id: "", cust_uniq_id: "", registered_name: "",
    contact_person: "", address: "", mobile_number: "", contact_number: "",
    branch_id: "", pickup_charge_remarks: "", customer_dr_attachment: "", rates_to_apply: "",
    status: "", verify: "", encoder: "", reason: "",
  });

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
    const filtered = shipper.filter(rec => 
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

  // Get Customer
  async function getCustomer() {
    const res = await fetch(`/api/customer/${id}`);
    const data = await res.json();
    console.log(data);
    if(res.ok) {
      setAccountType({
      account_type:  (data[0].account_type === "servicecargo" ? "Service Cargo" : data[0].account_type),
      registered_name: data[0].registered_name,
      });
    }
  }
  useEffect(() => {
    getCustomer();
  }, []);


  // Get Customer Shipper
  async function getCustomerShipperList() { 
    isLoading();
    const res = await fetch(`/api/getcustomershipper/${id}`, {
      method: "get",  
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    console.log(data);
    if(res.ok) {
      setShipper(data);
      setPageCount(Math.ceil(data.length / dataPerPage));
      setSortdata(data.slice(0, dataPerPage));
    }
    stopLoading();
  }
  useEffect(() => {
    getCustomerShipperList();
  }, [dataPerPage]);


  // Add Customer Shipper
  async function handleCreate(e) {
    e.preventDefault();
    formData.cust_uniq_id = id;
    formData.account_type =  "customer_shipper";
    const res = await fetch("/api/addcustomershipper", {
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
    }
  }

  async function closeCreate() {
    setOpen(false);
    setOpenAddDial(false);
    getCustomerShipperList();
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
      getCustomerShipperList();
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
      getCustomerShipperList();
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
          contact_person: data[0].contact_person,
          address: data[0].address,
          mobile_number: data[0].mobile_number,
          contact_number: data[0].contact_number,
          branch_id: data[0].branch_id,
          account_type: data[0].account_type,
          pickup_charge_remarks: data[0].pickup_charge_remarks,
          customer_dr_attachment: data[0].customer_dr_attachment,
          rates_to_apply: data[0].rates_to_apply,
          status: data[0].status,
          verify: data[0].verify,
          encoder: data[0].encoder,
        });
      }
    }
  }
  useEffect(() => {
    getCustomerUpdate();
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
    const res = await fetch(`/api/updatecustomershipper/${custid}`, {
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
      getCustomerShipperList();
    }
  }

  async function closeUpdate() {
    setOpen(false);
    setOpenUpdateDial(false);
    setOpenRatesDial(false);
    setOpenStatusDial(false);
    getCustomerShipperList();
  }



  return (
    <> 
    <div className="flex items-center font-medium border-b border-slate-300">
      <main className="px-4 flex-1 mx-auto py-4"><h1>Customer - Collect</h1></main>
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
                      <button type="button" onClick={() => {setOpenAddDial(true); setFormData({}); setErrors(false)}} className="h-fit flex flex-row primary-btn ml-1 py-3 px-5 text-xs tracking-wider font-semibold rounded-md text-white bg-gray-800 hover:bg-gray-600 focus:outline-none"><MdAdd size={16}/>Add&nbsp;Shipper</button>
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
                      <th className='px-3 py-3'><TableSort sortdata={sortdata} title="Customer ID" field="id" sorteddata={sortdata} setSorteddata={setSortdata} sorting={sorting} setSorting={setSorting} /> </th>
                      <th className='px-3 py-3'><TableSort sortdata={sortdata} title="Registered name" field="registered_name" sorteddata={sortdata} setSorteddata={setSortdata} sorting={sorting} setSorting={setSorting} /> </th>
                      <th className='px-3 py-3'>Contact Person</th>
                      <th className='px-3 py-3'>Address</th>
                      <th className='px-3 py-3'>Mobile Number</th>
                      <th className='px-3 py-3'>Landline Number</th>
                      <th className='px-3 py-3'>Pickup Charge Amount</th>
                      <th className='px-3 py-3'>Customers with DR Attachments</th>
                      <th className='px-3 py-3'>Rates to Apply</th>
                      <th className="px-3 py-3">Encoder</th>
                      <th className="px-3 py-3">Blacklist Status</th>
                      <th className="px-3 py-3">Status</th>
                    </tr>
                    </thead>
                    <tbody className="text-sm text-center bg-gray-50 dark:bg-gray-700 dark:text-gray-800 border-b-2 border-gray-300">
                    {sortdata.length > 0 ? (sortdata.map(rec => (
                      <tr className="text-xs bg-white border-b dark:bg-gray-100 dark:border-gray-300 hover:bg-gray-50" key={rec.id}>   
                        <td className="px-3 py-3">
                          <Link to="#" onClick={() => { setOpenUpdateDial(true); getCustomerUpdate(rec.id); setErrors(false); }} className="font-medium text-blue-600 dark:text-blue-500 hover:underline mx-1">{rec.id}</Link>
                        </td>
                        <td className="px-3 py-3">{rec.registered_name}</td>
                        <td className="px-3 py-3">{rec.contact_person}</td>
                        <td className="px-3 py-3">{rec.address}</td>
                        <td className="px-3 py-3">{rec.mobile_number}</td>
                        <td className="px-3 py-3">{rec.contact_number}</td>
                        <td className="px-3 py-3">{rec.pickup_charge_remarks}</td>
                        <td className="px-3 py-3">{rec.customer_dr_attachment}</td>
                        <td className="px-3 py-3">{rec.rates_to_apply}</td>
                        <td className="px-3 py-3">{rec.name}</td>
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
                <Pagination dataSize={shipper.length} dataPPage={dataPerPage} nPages={pageCount} currentPage={currentPage} setCurrentPage={handleChange} />
            </div>
          </div>
        </div>  
      </main>
    </div>

    {/* Add Customer Shipper */}
    <Dialog open={openAddDial} onClose={setOpenAddDial} className="relative z-[999]">
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
                
                <form onSubmit={handleCreate} className='w-full mx-auto space-y-6'>
                <div className='text-left border p-2 bg-gray-100'>
                  <div className='flex flex-row'>
                    <div className='p-2 w-full'>
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

                      <input className=" mt-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="Land Line Number" value={formData.contact_number}
                          onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
                      />
                        {errors.contact_number && <p className="error text-red-700 text-left ml-2">{errors.contact_number[0]}</p>}

                      <input className=" mt-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="Mobile Number" value={formData.mobile_number}
                          onChange={(e) => setFormData({ ...formData, mobile_number: e.target.value })}
                      />
                        {errors.mobile_number && <p className="error text-red-700 text-left ml-2">{errors.mobile_number[0]}</p>}
                      
                      <input className=" mt-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="Pickup Charge Amount" value={formData.pickup_charge_remarks}
                          onChange={(e) => setFormData({ ...formData, pickup_charge_remarks: e.target.value })}
                      />
                        {errors.pickup_charge_remarks && <p className="error text-red-700 text-left ml-2">{errors.pickup_charge_remarks[0]}</p>}

                      <input className=" mt-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="DR Attachments Needed" value={formData.customer_dr_attachment}
                          onChange={(e) => setFormData({ ...formData, customer_dr_attachment: e.target.value })}
                      />
                        {errors.customer_dr_attachment && <p className="error text-red-700 text-left ml-2">{errors.customer_dr_attachment[0]}</p>}
                    </div>        
                  </div>
                  </div>

                    <div className="!mt-8 float-right">
                      <button className="primary-btn py-3 px-4 text-sm tracking-wider font-semibold rounded-md text-white bg-gray-800 hover:bg-gray-600 focus:outline-none"> Add Shipper </button>
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
            <DialogPanel transition className="relative transform overflow-hidden rounded-lg transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-screen-sm data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"> 

            <div className="flex flex-col font-[sans-serif]">
              <div className="w-full mx-auto border border-gray-300 rounded-2xl p-8 bg-gray-50">
                <div className="text-center mb-4">
                  <h1 className="text-2xl text-left pb-6 flex"><FaUserEdit size={30} className='mr-1'/> Update Customer Shipper </h1>
                
  
                <div className='text-left border p-2 bg-gray-100'>
                  <div className='flex flex-row'>
                  <div className='p-2 w-full'>
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

                      <input className=" mt-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="Land Line Number" value={formData.contact_number}
                          onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
                      />
                        {errors.contact_number && <p className="error text-red-700 text-left ml-2">{errors.contact_number[0]}</p>}

                      <input className=" mt-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="Mobile Number" value={formData.mobile_number}
                          onChange={(e) => setFormData({ ...formData, mobile_number: e.target.value })}
                      />
                        {errors.mobile_number && <p className="error text-red-700 text-left ml-2">{errors.mobile_number[0]}</p>}
                      
                      <input className=" mt-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="Pickup Charge Amount" value={formData.pickup_charge_remarks}
                          onChange={(e) => setFormData({ ...formData, pickup_charge_remarks: e.target.value })}
                      />
                        {errors.pickup_charge_remarks && <p className="error text-red-700 text-left ml-2">{errors.pickup_charge_remarks[0]}</p>}

                      <input className=" mt-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="DR Attachments Needed" value={formData.customer_dr_attachment}
                          onChange={(e) => setFormData({ ...formData, customer_dr_attachment: e.target.value })}
                      />
                        {errors.customer_dr_attachment && <p className="error text-red-700 text-left ml-2">{errors.customer_dr_attachment[0]}</p>}
                    </div>
                  </div>
                  </div>

                    <div className="!mt-8 float-right">
                    <button onClick={() => openUpdate(formData.id)} className="primary-btn py-3 px-4 text-sm tracking-wider font-semibold rounded-md text-white bg-gray-800 hover:bg-gray-600 focus:outline-none"> Update Shipper </button>
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
      title="Add Customer Shipper"
      body="Customer Shipper successfully added!"
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