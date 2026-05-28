import { Dialog, DialogBackdrop, DialogPanel } from '@headlessui/react';
import { useContext, useEffect, useState} from "react";
import { AppContext } from "../context/AppContext";
import { Link } from 'react-router-dom';
import InfoBox from "../assets/components/InfoBox";
import ConfirmBox from "../assets/components/DeleteBox";
import UpdateBox from "../assets/components/UpdateBox";
import { MdAdd, MdMoney } from "react-icons/md";
import { FaRegTrashAlt, FaRegEdit, FaUserEdit, FaUserPlus, FaUser, FaHome, FaCalendar, FaFile, FaFileAlt, FaDollarSign } from "react-icons/fa";
import { TbHomePlus, TbHomeEdit } from "react-icons/tb";
import Pagination from '../assets/components/Pagination';
import TableSort from '../assets/components/TableSort';
import LoadingBox from '../assets/components/Loading';
import sortData from '../assets/components/sortData';
import DatePicker from "react-datepicker";
import { format } from "date-fns";
import useScreenSize from "../assets/components/useScreenSize";

export default function RentalSpace() {

  const [openAddDial, setOpenAddDial] = useState(false);
  const [openUpdateDial, setOpenUpdateDial] = useState(false);
  const [openTenantDial, setOpenTenantDial] = useState(false);
  const [openAddTenantDial, setOpenAddTenantDial] = useState(false);
  const [openUpdateTenantDial, setOpenUpdateTenantDial] = useState(false);
  const [openUnitDial, setOpenUnitDial] = useState(false);
  const [openExpensesDial, setOpenExpensesDial] = useState(false);
  const [openAddExpensesDial, setOpenAddExpensesDial] = useState(false);
  const [openUpdateExpensesDial, setOpenUpdateExpensesDial] = useState(false);
  const [openAddLeaseDial, setOpenAddLeaseDial] = useState(false);
  const [openUpdateLeaseDial, setOpenUpdateLeaseDial] = useState(false);
  const [openReportDial, setOpenReportDial] = useState(false);
  const [open, setOpen] = useState(false);
  const { token } = useContext(AppContext);
  const [showLoading, setShowLoading] = useState(false);
  const isLoading = () => {setShowLoading(true)};
  const stopLoading = () => {setShowLoading(false)};
  const [status, setStatus] = useState(0);
  const [rental, setRental] = useState([]);
  const [tenant, setTenant] = useState([]);
  const [lease, setLease] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [id, setId] = useState(null);
  const [monitoringDataHistory, setMonitoringDataHistory] = useState([]);
  const [filterType, setFilterType] = useState("monthly");
  const isMediumScreen = useScreenSize(768);

  //Table Pagination, Search
  const [sortdata, setSortdata] = useState([]);
  const [sorting, setSorting] = useState({ key: "", ascending: true });
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageCount, setPageCount] = useState(0);
  const [dataPerPage, setDataperpage] = useState(10);

  const [formData, setFormData] = useState({
    property_name: "", unit_number: "", type: "", address: "", monthly_rent: "", status: ""
  });

  const [formDataTenant, setFormDataTenant] = useState({
    first_name: "", last_name: "", address: "", contact_number: "", email_address: ""
  });

  const [formDataLease, setFormDataLease] = useState({
    unit_id: 0, tenant_id: 0, start_date: "", end_date: "", monthly_rent: "", deposit: "", reference_number: "", notes: "",
  });

  const [historyParams, setHistoryParams] = useState({
    unit_id: 0, tenant_id: 0, month: "", year: "",
  });

  const [formDataExpenses, setFormDataExpenses] = useState({
    date: "", property: "", category: "", amount: "", notes: "",
  });

  const [errors, setErrors] = useState({});

  const changePage = (i) => {
    setCurrentPage(i);
    const startItem = (i - 1) * dataPerPage;
    setSortdata(lease.slice(startItem, startItem + dataPerPage));
  };

  const handleChange = (value) => {
    changePage(value);
  };


  //Search and Table Sorting
  async function searchTable() {
    const filtered = lease.filter(rec => 
      rec.start_date.toLowerCase().includes(search.toLowerCase())
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
  
  // Get Lease List
  async function getLease() {
    isLoading();
    const res = await fetch("/api/rentallease", {
      method: "GET",
      headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          Authorization: `Bearer ${token}`,
        },
    });
    const data = await res.json();
    if(res.ok) {
      setLease(data);
      setPageCount(Math.ceil(data.length / dataPerPage));
      setSortdata(data.slice(0, dataPerPage));
      stopLoading();
    }
  }
  useEffect(() => {
    getLease();
  }, [dataPerPage]);


  // Get Rental List
  async function getRental() {
    isLoading();
    const res = await fetch("/api/rentalspace", {
      method: "GET",
      headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          Authorization: `Bearer ${token}`,
        },
    });
    const data = await res.json();
    if(res.ok) {
      setRental(data);
      stopLoading();
    }
  }
  useEffect(() => {
    getRental();
  }, []);


  // Get Tenant List
  async function getTenant() {
    isLoading();
    const res = await fetch("/api/rentaltenant", {
      method: "GET",
      headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          Authorization: `Bearer ${token}`,
        },
    });
    const data = await res.json();
    if(res.ok) {
      setTenant(data);
      stopLoading();
    }
  }
  useEffect(() => {
    getTenant();
  }, []);


  // Get Expenses List
  async function getExpenses() {
    isLoading();
    const res = await fetch("/api/rentalexpenses", {
      method: "GET",
      headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          Authorization: `Bearer ${token}`,
        },
    });
    const data = await res.json();
    console.log(data);
    if(res.ok) {
      setExpenses(data);
      stopLoading();
    }
  }
  useEffect(() => {
    getExpenses();
  }, []);


  // Add Rental
  async function handleCreate(e) {
    isLoading();
    e.preventDefault();
    const res = await fetch("/api/rentalspace", {
        method: "post",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
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
      getRental();
    }
    stopLoading();
  }

  async function closeCreate() {
    setOpen(false);
    setOpenAddDial(false);
    setOpenAddTenantDial(false);
    setOpenAddLeaseDial(false);
    setOpenAddExpensesDial(false);
  }

    // Add Tenant
  async function handleCreateTenant(e) {
    isLoading();
    e.preventDefault();
    const res = await fetch("/api/rentaltenant", {
        method: "post",
        headers: {
         "Content-Type": "application/json",
          "Accept": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formDataTenant),
    });
    const data = await res.json()
    console.log(data);

    if (data.errors) {
      setErrors(data.errors);
    } else {
      setOpen(true);
      setStatus(6);
      setFormDataTenant({});
      getTenant();
    }
    stopLoading();
  }

  // Add Lease
  async function handleCreateLease(e) {
    isLoading();
    e.preventDefault();
    const res = await fetch("/api/rentallease", {
        method: "post",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formDataLease),
    });
    const data = await res.json()
    console.log(data);

    if (data.errors) {
      setErrors(data.errors);
    } else {
      setOpen(true);
      setStatus(11);
      setFormDataLease({});
      getLease();
    }
    stopLoading();
  }

  // Add Expenses
  async function handleCreateExpenses(e) {
    isLoading();
    e.preventDefault();
    const res = await fetch("/api/rentalexpenses", {
        method: "post",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formDataExpenses),
    });
    const data = await res.json()
    console.log(data);

    if (data.errors) {
      setErrors(data.errors);
    } else {
      setOpen(true);
      setStatus(15);
      setFormDataExpenses({});
      getExpenses();
    }
    stopLoading();
  }

  // Get Rental
  async function getRentalUpdate(id) {
    setFormData({});
    if(id){
      isLoading();
      const res = await fetch(`/api/rentalspace/${id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json"
        }
      });
      const data = await res.json();
      if(res.ok) {
        setFormData({
          id: data[0].id,
          property_name: data[0].property_name,
          unit_number: data[0].unit_number,
          type: data[0].type,
          address: data[0].address,
          monthly_rent: data[0].monthly_rent,
          status: data[0].status,
        });
      }
      stopLoading();
    }
  }

  // Get Tenant
  async function getTenantUpdate(id) {
    setFormDataTenant({});
    if(id){
      isLoading();
      const res = await fetch(`/api/rentaltenant/${id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json"
        }
      });
      const data = await res.json();
      if(res.ok) {
        setFormDataTenant({
          id: data[0].id,
          first_name: data[0].first_name,
          last_name: data[0].last_name,
          address: data[0].address,
          contact_number: data[0].contact_number,
          email_address: data[0].email_address,
        });
      }
      stopLoading();
    }
  }

   // Get Lease
  async function getLeaseUpdate(id) {
    setFormDataLease({});
    if(id){
      isLoading();
      const res = await fetch(`/api/rentallease/${id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json"
        }
      });
      const data = await res.json();
      if(res.ok) {
        setFormDataLease({
          id: data[0].leaseid,
          unit_id: data[0].unit_id,
          tenant_id: data[0].tenant_id,
          first_name: data[0].first_name,
          last_name: data[0].last_name,
          property_name: data[0].property_name,
          unit_number: data[0].unit_number,
          start_date: data[0].start_date,
          end_date: data[0].end_date,
          monthly_rent: data[0].monthly_rent,
          deposit: data[0].deposit,
          reference_number: data[0].reference_number,
          notes: data[0].notes,
        });
      }
      stopLoading();
    }
  }

  // Get Expense
  async function getExpensesUpdate(id) {
    setFormDataExpenses({});
    if(id){
      isLoading();
      const res = await fetch(`/api/rentalexpenses/${id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json"
        }
      });
      const data = await res.json();
      console.log(data);
      if(res.ok) {
        setFormDataExpenses({
          id: data[0].id,
          date: data[0].date,
          property: data[0].property,
          category: data[0].category,
          amount: data[0].amount,
          notes: data[0].notes,
          property_name: data[0].property_name,
          unit_number: data[0].unit_number,
        });
      }
      stopLoading();
    }
  }

  //Update Rental
  async function openUpdate(id) {
    setOpen(true);
    setStatus(3);
    setId(id);
  }

  async function handleUpdate(e) {
    isLoading();
    e.preventDefault();
    const res = await fetch(`/api/rentalspace/${id}`, {
      method: "put",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(formData),
    });
    const data = await res.json();
    console.log(data);
    if(data.errors) {
      setErrors(data.errors);
    } else {
      setStatus(4);
      getRental();
    }
    isLoading();
  }

  async function closeUpdate() {
    setOpen(false);
    setOpenUpdateDial(false);
    setOpenUpdateTenantDial(false);
    setOpenUpdateLeaseDial(false);
    setOpenUpdateExpensesDial(false);
  }


  //Update Tenant
  async function openUpdateTenant(id) {
    setOpen(true);
    setStatus(7);
    setId(id);
  }

  async function handleUpdateTenant(e) {
    isLoading();
    e.preventDefault();
    const res = await fetch(`/api/rentaltenant/${id}`, {
      method: "put",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(formDataTenant),
    });
    const data = await res.json();
    console.log(data);
    if(data.errors) {
      setErrors(data.errors);
    } else {
      setStatus(8);
      getTenant();
    }
    isLoading();
  }


  //Delete Rental
  async function openDelete(id) {
    setOpen(true);
    setStatus(2);
    setId(id);
  }

  async function handleDelete(e) {
    isLoading();
    e.preventDefault();
      const res = await fetch(`/api/rentalspace/${id}`, {
        method: "delete",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          Authorization: `Bearer ${token}`,
        }
      });
      const data = await res.json();
      console.log(data);
      if(res.ok) {
        setStatus(5);
        getRental();
      }
      isLoading();
  }

  async function closeDelete() {
    setOpen(false);
  }

  //Delete Tenant
  async function openDeleteTenant(id) {
    console.log(id);
    setOpen(true);
    setStatus(9);
    setId(id);
  }

  async function handleDeleteTenant(e) {
    console.log(id);
    isLoading();
    e.preventDefault();
      const res = await fetch(`/api/rentaltenant/${id}`, {
        method: "delete",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          Authorization: `Bearer ${token}`,
        }
      });
      const data = await res.json();
      console.log(data);
      if(res.ok) {
        setStatus(10);
        getTenant();
      }
      isLoading();
  }


  //Update Lease
  async function openUpdateLease(id) {
    setOpen(true);
    setStatus(12);
    setId(id);
  }

  async function handleUpdateLease(e) {
    console.log(id);
    isLoading();
    e.preventDefault();
    const res = await fetch(`/api/rentallease/${id}`, {
      method: "put",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(formDataLease),
    });
    const data = await res.json();
    console.log(res);
    if(data.errors) {
      setErrors(data.errors);
    } else {
      setStatus(13);
      getLease();
    }
    isLoading();
  }

  //Delete Lease
  async function openDeleteLease(id) {
    console.log(id);
    setOpen(true);
    setStatus(14);
    setId(id);
  }

  async function handleDeleteLease(e) {
    console.log(id);
    isLoading();
    e.preventDefault();
      const res = await fetch(`/api/rentallease/${id}`, {
        method: "delete",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          Authorization: `Bearer ${token}`,
        }
      });
      const data = await res.json();
      console.log(data);
      if(res.ok) {
        setStatus(10);
        getLease();
      }
      isLoading();
  }


    //Update Expenses
  async function openUpdateExpenses(id) {
    setOpen(true);
    setStatus(16);
    setId(id);
  }

  async function handleUpdateExpenses(e) {
    isLoading();
    e.preventDefault();
    const res = await fetch(`/api/rentalexpenses/${id}`, {
      method: "put",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(formDataExpenses),
    });
    const data = await res.json();
    console.log(res);
    if(data.errors) {
      setErrors(data.errors);
    } else {
      setStatus(17);
      getExpenses();
    }
    isLoading();
  }

  //Delete Expenses
  async function openDeleteExpenses(id) {
    console.log(id);
    setOpen(true);
    setStatus(18);
    setId(id);
  }

  async function handleDeleteExpenses(e) {
    console.log(id);
    isLoading();
    e.preventDefault();
      const res = await fetch(`/api/rentalexpenses/${id}`, {
        method: "delete",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          Authorization: `Bearer ${token}`,
        }
      });
      const data = await res.json();
      console.log(data);
      if(res.ok) {
        setStatus(19);
        getExpenses();
      }
      isLoading();
  }


  const fetchTransactionHistory = async () => {
    try {
      isLoading();
      const params = new URLSearchParams();
      console.log(historyParams.year)
      console.log(historyParams.month)

      if (historyParams.month) {
        params.append("month", historyParams.month);
      }

      if (historyParams.year) {
        params.append("year", historyParams.year);
      }

      if (historyParams.unit_id) {
        params.append("unit_id", historyParams.unit_id);
      }

      if (historyParams.tenant_id) {
        params.append("tenant_id", historyParams.tenant_id);
      }

      const response = await fetch(`/api/rentaltransactionhistory?${params.toString()}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch transaction history");
      }

      const data = await response.json();
      console.log(data);
      setMonitoringDataHistory(data.records || []);
    } catch (error) {
      console.error("Search error:", error);
      setMonitoringDataHistory([]);
    } finally {
      stopLoading();
    }
  }

  const totalMonthlyRent = monitoringDataHistory.reduce((sum, rec) => {
    return sum + (Number(rec.monthly_rent) || 0);
  }, 0);

  

  return (
    <> 
    <div className="flex items-center font-medium border-b border-slate-300 w-full">
      <main className="px-4 flex-1 mx-auto py-4"><h1 className='text-2xl font-bold'>Rental Record</h1></main>
    </div>
    <div className="flex items-center font-medium flex-1 mx-auto py-4 ">
      <main className="flex-1 mx-auto p-4">
        <div className={`overflow-x-auto transition-all duration-75 min-w-0 mx-auto ${isMediumScreen ? "w-[calc(100vw-19rem)]" : "w-[calc(100vw-6rem)]"}`}>
          <div className="bg-gray-50 shadow-md border">
            <div className="p-6 text-gray-900 dark:text-gray-100">
              <div className="text-left caption-top dark:text-gray-800">
                <div className="flex flex-row py-2">
                  <div className="flex w-full"><h1>Rental Record</h1></div>
                    <div className="flex mb-3 gap-2">
                      <div className='group relative'>
                        <button type="button" onClick={() => {setOpenUnitDial(true); setFormData({}); setErrors(false)}} className="h-fit flex flex-row primary-btn py-3 px-6 text-sm tracking-wider font-semibold rounded-md text-white bg-gray-800 hover:bg-gray-600 focus:outline-none">
                          <span className="group-hover:hidden">
                            <FaHome size={16} />
                          </span>
                          <span className="hidden group-hover:inline text-xs">
                            Unit
                          </span>
                        </button>
                      </div>
                      <div className='group relative'>
                        <button type="button" onClick={() => {setOpenTenantDial(true); setFormDataTenant({}); setErrors(false)}} className="h-fit flex flex-row primary-btn py-3 px-6 text-sm tracking-wider font-semibold rounded-md text-white bg-gray-800 hover:bg-gray-600 focus:outline-none">
                          <span className="group-hover:hidden">
                            <FaUser size={16} />
                          </span>
                          <span className="hidden group-hover:inline text-xs">
                            Tenant
                          </span>
                        </button>
                      </div>
                      <div className='group relative'>
                        <button type="button" onClick={() => {setOpenAddLeaseDial(true); setFormDataLease({}); setErrors(false)}} className="h-fit flex flex-row primary-btn py-3 px-6 text-sm tracking-wider font-semibold rounded-md text-white bg-gray-800 hover:bg-gray-600 focus:outline-none">
                          <span className="group-hover:hidden">
                            <FaCalendar size={16} />
                          </span>
                          <span className="hidden group-hover:inline text-xs">
                            Lease
                          </span>
                        </button>
                      </div>
                      <div className='group relative'>
                        <button type="button" onClick={() => {setOpenReportDial(true); setHistoryParams({}); setMonitoringDataHistory([]); setFilterType("monthly")}} className="h-fit flex flex-row primary-btn py-3 px-6 text-sm tracking-wider font-semibold rounded-md text-white bg-gray-800 hover:bg-gray-600 focus:outline-none">
                          <span className="group-hover:hidden">
                            <FaFileAlt size={16} />
                          </span>
                          <span className="hidden group-hover:inline text-xs">
                            Reports
                          </span>
                        </button>
                      </div>
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
                <div className="overflow-auto">
                  <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400 overflow-hidden">
                  {/* {message && <p className="error opacity-100 delay-300 text-blue-700 text-left ml-2">{message}</p>} */}
                  <thead className="text-xs text-center uppercase bg-gray-200 text-gray-800 border-b border-t border-gray-300">
                      <tr className="text-nowrap">
                      <th className="px-2 py-3">
                        <TableSort title="No." field="id" sorteddata={sortdata} setSorteddata={setSortdata} sorting={sorting} setSorting={setSorting} />
                      </th>
                      <th className="px-2 py-3">
                        <TableSort title="Property Name" field="property_name" sorteddata={sortdata} setSorteddata={setSortdata} sorting={sorting} setSorting={setSorting} />
                      </th>
                      <th className="px-2 py-3">
                        <TableSort title="Unit Number" field="unit_number" sorteddata={sortdata} setSorteddata={setSortdata} sorting={sorting} setSorting={setSorting} />
                      </th>
                      <th className="px-2 py-3">
                        <TableSort title="Tenant" field="first_name" sorteddata={sortdata} setSorteddata={setSortdata} sorting={sorting} setSorting={setSorting} />
                      </th>
                      <th className="px-2 py-3">
                        <TableSort title="Rented Month" field="start_date" sorteddata={sortdata} setSorteddata={setSortdata} sorting={sorting} setSorting={setSorting} />
                      </th>
                      <th className="px-2 py-3">
                        <TableSort title="Monthly Rent" field="monthly_rent" sorteddata={sortdata} setSorteddata={setSortdata} sorting={sorting} setSorting={setSorting} />
                      </th>
                      <th className="px-2 py-3">
                        <TableSort title="Deposit" field="deposit" sorteddata={sortdata} setSorteddata={setSortdata} sorting={sorting} setSorting={setSorting} />
                      </th>
                      <th className="px-2 py-3">
                        <TableSort title="Reference#" field="reference_number" sorteddata={sortdata} setSorteddata={setSortdata} sorting={sorting} setSorting={setSorting} />
                      </th>
                      <th className="px-2 py-3">
                        <TableSort title="Notes" field="notes" sorteddata={sortdata} setSorteddata={setSortdata} sorting={sorting} setSorting={setSorting} />
                      </th>
                      <th className="px-2 py-3">
                        <TableSort title="Date Added" field="created_at" sorteddata={sortdata} setSorteddata={setSortdata} sorting={sorting} setSorting={setSorting} />
                      </th>
                      <th className="px-2 py-3">Action</th>
                      </tr>
                    </thead>
                    <tbody className="text-xs text-center bg-gray-50 dark:bg-gray-700 dark:text-gray-800 border-b-2 border-gray-300">
                    {sortdata.length > 0 ? (sortdata.map((rec, i) => (
                      <tr className="text-xs bg-white border-b dark:bg-gray-100 dark:border-gray-300 hover:bg-gray-50" key={rec.id}>     
                          <th className="px-2 py-3">
                            <Link className="font-medium text-blue-600 dark:text-blue-500 hover:underline mx-1">{i+1}.
                            </Link>
                          </th>
                          <td className="px-2 py-3 text-left">{rec.property_name}</td>
                          <td className="px-2 py-3">{rec.unit_number}</td>
                          <td className="px-2 py-3 whitespace-nowrap">{rec.first_name} {rec.last_name}</td>
                          <td className="px-2 py-3 whitespace-nowrap">{rec.start_date}</td>
                          <td className="px-2 py-3 text-right">{rec.monthly_rent.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                          <td className="px-2 py-3 text-right">{rec.deposit ? rec.deposit.toLocaleString(undefined, { minimumFractionDigits: 2 }) : "0.00"}</td>
                          <td className="px-2 py-3">{rec.reference_number ? rec.reference_number : "--"}</td>
                          <td className="px-2 py-3">{rec.notes ? rec.notes : "--"}</td>
                          <td className="px-2 py-3">
                            {format(new Date(rec.created_at), "MM/dd/yyyy")}
                            <br />
                            <span className="text-gray-500">
                              {format(new Date(rec.created_at), "hh:mm a")}
                            </span>
                          </td>
                          <td>
                          <button onClick={() => {getLeaseUpdate(rec.id); setOpenUpdateLeaseDial(true); setErrors(false)}} className="primary-btn text-sm tracking-wider font-semibold rounded-md">
                          <FaRegEdit size={20} className="mr-1 text-green-600"/></button>
                            <button onClick={() => openDeleteLease(rec.leaseid)} className="primary-btn text-sm tracking-wider font-semibold rounded-md">
                              <FaRegTrashAlt size={20} className="text-red-600"/></button>
                          </td> 
                          
                        </tr>
                    ))) : (
                      <tr className='text-xs bg-white border-b dark:bg-gray-100 dark:border-gray-300'>
                        <td className='px-3 py-3 text-center' colSpan={11}>No Record</td>
                      </tr>
                    )}
                     </tbody>                        
                  </table>
                </div> 
                <Pagination dataSize={lease.length} dataPPage={dataPerPage} nPages={pageCount} currentPage={currentPage} setCurrentPage={handleChange} />
            </div>
          </div>
        </div>  
      </main> 
    </div>

    
    {/* Rental Unit */}
    <Dialog open={openUnitDial} onClose={setOpenUnitDial} className="relative z-[999]">
      <DialogBackdrop
          transition
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
      />

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <DialogPanel transition className="relative transform overflow-hidden transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-5xl data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"> 

            <div className="flex flex-col font-[sans-serif]">
              <div className="w-full mx-auto border-gray-300 p-8 bg-gray-50">
                <div className="text-center mb-4">
                  <h1 className="text-2xl text-left flex"><FaHome size={30} className='mr-1'/> Units Record </h1>
                  
                  <div className="py-6 text-gray-900 dark:text-gray-100">
                    <div className="text-left caption-top dark:text-gray-800 -mt-4">
                      <div className="flex flex-row py-2">
                        <div className="flex w-full"><h1></h1></div>
                        <div className="flex gap-2 mb-2">
                          <button type="button" onClick={() => {setOpenAddDial(true); setFormData({}); setErrors(false)}} className="h-fit flex flex-row primary-btn py-2 px-3 text-xs tracking-wider font-semibold rounded-md text-white bg-gray-800 hover:bg-gray-600 focus:outline-none"><MdAdd size={18}/>Add&nbsp;Unit</button>
                          <button type="button" onClick={() => {setOpenExpensesDial(true); setFormData({}); setErrors(false)}} className="h-fit flex flex-row primary-btn py-2 px-3 text-xs tracking-wider font-semibold rounded-md text-white bg-gray-800 hover:bg-gray-600 focus:outline-none"><FaDollarSign size={18}/>Expenses</button>
                        </div> 
                      </div>
                    </div>
                    
                      <div className="overflow-auto">
                        <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400 overflow-hidden">
                        <thead className="text-xs text-center uppercase bg-gray-200 text-gray-800 border-b border-t border-gray-300">
                          <tr className="text-nowrap border-gray-300 border-b">
                            
                          </tr>
                          <tr className="text-nowrap">
                            <th className="px-3 py-3">No.</th>
                            <th className="px-3 py-3">Property Name</th>
                            <th className="px-3 py-3 whitespace-nowrap">Unit Number</th>
                            <th className="px-3 py-3">Type</th>
                            <th className="px-3 py-3">Address</th>
                            <th className="px-3 py-3">Monthly Rent</th>
                            <th className="px-3 py-3">Status</th>
                            <th className="px-3 py-3">Action</th>
                          </tr>
                          </thead>
                          <tbody className="text-xs text-center bg-gray-50 dark:bg-gray-700 dark:text-gray-800 border-b-2 border-gray-300">
                            {rental.length > 0 ? (rental.map((rec, i) => (
                            <tr key={rec.id} className="text-xs bg-white border-b dark:bg-gray-100 dark:border-gray-300 hover:bg-gray-50">     
                              <th className="px-3 py-3">{i+1}.</th>
                              <td className="px-3 py-3">{rec.property_name}</td>
                              <td className="px-3 py-3">{rec.unit_number}</td>
                              <td className="px-3 py-3">{rec.type}</td>
                              <td className="px-3 py-3">{rec.address}</td>
                              <td className="px-3 py-3 text-right">{Number(rec.monthly_rent).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                              <td className="px-3 py-3">{rec.status ? rec.status : "--"}</td>
                              <td>
                                <button onClick={() => {getRentalUpdate(rec.id); setOpenUpdateDial(true); setErrors(false)}} className="primary-btn text-sm tracking-wider font-semibold rounded-md">
                                <FaRegEdit size={16} className="mr-2 text-green-600"/></button>
                                <button onClick={() => openDelete(rec.id)} className="primary-btn text-sm tracking-wider font-semibold rounded-md">
                                  <FaRegTrashAlt size={16} className="text-red-600"/></button>
                              </td>  
                            </tr>
                            ))) : (
                            <tr className='text-xs bg-white border-b dark:bg-gray-100 dark:border-gray-300'>
                              <td className='px-3 py-3 text-center' colSpan={8}>No Record</td>
                            </tr>
                            )}
                          </tbody>                        
                        </table>
                      </div> 
                        <div className="!mt-8 float-right ">
                          <button onClick={() => setOpenUnitDial(false)} className="primary-btn py-2 px-8 text-sm tracking-wider font-semibold rounded-md text-white bg-gray-500 hover:bg-gray-600 focus:outline-none"> Close </button>
                        </div>
                  </div>
                    
                </div>
              </div>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>

    {/* Add Rental Type */}
    <Dialog open={openAddDial} onClose={setOpenAddDial} className="relative z-[999]">
      <DialogBackdrop
          transition
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
      />

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <DialogPanel transition className="relative transform overflow-hidden transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-lg data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"> 

            <div className="flex flex-col font-[sans-serif]">
                <div className="w-full mx-auto border-gray-300 p-8 bg-gray-50">
                  <div className="text-center mb-4">
                    <h1 className="text-2xl text-left pb-6 flex"><TbHomePlus size={30} className='mr-1'/> Add Unit Record </h1>
                    
                    <form onSubmit={handleCreate} className='w-full mx-auto space-y-6'>
                      <div className='flex flex-row border p-2 bg-gray-100'>
                        <div className='w-full p-4'>
                          <input className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="Property Name" value={formData.property_name}
                              onChange={(e) => setFormData({ ...formData, property_name: e.target.value })}
                          />
                            {errors.property_name && <p className="error text-red-700 text-left ml-2">{errors.property_name[0]}</p>}

                          <input className="mt-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="Unit Number" value={formData.unit_number}
                              onChange={(e) => setFormData({ ...formData, unit_number: e.target.value })}
                          />
                            {errors.unit_number && <p className="error text-red-700 text-left ml-2">{errors.unit_number[0]}</p>}

                          <input className="mt-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="Type" value={formData.type}
                              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                          />
                            {errors.type && <p className="error text-red-700 text-left ml-2">{errors.type[0]}</p>}

                          <input className="mt-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="Address" value={formData.address}
                              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                          />
                            {errors.address && <p className="error text-red-700 text-left ml-2">{errors.address[0]}</p>}

                          <input className="mt-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="Monthly Rent" value={formData.monthly_rent}
                              onChange={(e) => setFormData({ ...formData, monthly_rent: e.target.value })}
                          />
                            {errors.monthly_rent && <p className="error text-red-700 text-left ml-2">{errors.monthly_rent[0]}</p>}

                          {/* <input className="mt-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="Status" value={formData.status}
                              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                          /> */}
                          <select
                            value={formData.status}
                            onChange={(e) => setFormData({...formData, status: e.target.value})}
                            className="mt-4 border rounded w-full py-3 bg-white text-gray-800 border-gray-300 px-4"
                          >
                            <option value="">Select</option>
                            <option>Active</option>
                            <option>Inactive</option>
                          </select>
                            {errors.status && <p className="error text-red-700 text-left ml-2">{errors.status[0]}</p>}
                        </div>
                      </div>
                        <div className="!mt-8 float-right">
                          <button className="primary-btn py-2 px-3 text-sm tracking-wider font-semibold rounded-md text-white bg-gray-800 hover:bg-gray-600 focus:outline-none"> Add Unit </button>
                        </div> 
                    </form>
                        <div className="!mt-8 float-right">
                          <button onClick={() => setOpenAddDial(false)} className="primary-btn py-2 px-8 mr-4 text-sm tracking-wider font-semibold rounded-md text-white bg-gray-500 hover:bg-gray-600 focus:outline-none"> Cancel </button>
                        </div>
                    </div>
                  </div>
                </div>
            </DialogPanel>
          </div>
      </div>
    </Dialog>

    {/* Update Rental Type */}
    <Dialog open={openUpdateDial} onClose={setOpenUpdateDial} className="relative z-[999]">
      <DialogBackdrop
          transition
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
      />

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                  <DialogPanel transition className="relative transform overflow-hidden transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-lg data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95">

            <div className="flex flex-col font-[sans-serif]">
                <div className="w-full mx-auto border border-gray-300 p-8 bg-gray-50">
                  <div className="text-center mb-4">
                    <h1 className="text-2xl text-left pb-6 flex"><TbHomeEdit size={30} className='mr-1'/> Update Unit Record </h1>
                    
                      <div className='flex flex-row border p-2 bg-gray-100'>
                        <div className='w-full text-left p-4'>
                          <input className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="Property Name" value={formData.property_name}
                              onChange={(e) => setFormData({ ...formData, property_name: e.target.value })}
                          />
                            {errors.property_name && <p className="error text-red-700 text-left ml-2">{errors.property_name[0]}</p>}

                          <input className="mt-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="Unit Number" value={formData.unit_number}
                              onChange={(e) => setFormData({ ...formData, unit_number: e.target.value })}
                          />
                            {errors.unit_number && <p className="error text-red-700 text-left ml-2">{errors.unit_number[0]}</p>}

                          <input className="mt-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="Type" value={formData.type}
                              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                          />
                            {errors.type && <p className="error text-red-700 text-left ml-2">{errors.type[0]}</p>}

                          <input className="mt-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="Address" value={formData.address}
                              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                          />
                            {errors.address && <p className="error text-red-700 text-left ml-2">{errors.address[0]}</p>}

                          <input className="mt-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="Monthly Rent" value={formData.monthly_rent}
                              onChange={(e) => setFormData({ ...formData, monthly_rent: e.target.value })}
                          />
                            {errors.monthly_rent && <p className="error text-red-700 text-left ml-2">{errors.monthly_rent[0]}</p>}

                          <input className="mt-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="Status" value={formData.status}
                              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                          />
                            {errors.status && <p className="error text-red-700 text-left ml-2">{errors.status[0]}</p>}
                        
                        </div>          
                      </div>
                        <div className="!mt-8 float-right">
                          <button onClick={() => openUpdate(formData.id)} className="primary-btn py-2 px-3 text-sm tracking-wider font-semibold rounded-md text-white bg-gray-800 hover:bg-gray-600 focus:outline-none"> Update Unit </button>
                        </div> 
                    
                        <div className="!mt-8 float-right">
                          <button onClick={() => setOpenUpdateDial(false)} className="primary-btn py-2 px-8 mr-2 text-sm tracking-wider font-semibold rounded-md text-white bg-gray-500 hover:bg-gray-600 focus:outline-none"> Cancel </button>
                        </div>
                    </div>
                  </div>
                </div>
            </DialogPanel>
          </div>
      </div>
    </Dialog>


    {/* Rental Tenant */}
    <Dialog open={openTenantDial} onClose={setOpenTenantDial} className="relative z-[999]">
      <DialogBackdrop
          transition
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
      />

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <DialogPanel transition className="relative transform overflow-hidden transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-5xl data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"> 

            <div className="flex flex-col font-[sans-serif]">
              <div className="w-full mx-auto border-gray-300 p-8 bg-gray-50">
                <div className="text-center mb-4">
                  <h1 className="text-2xl text-left flex"><FaUser size={30} className='mr-1'/> Tenant Record </h1>
                  
                  <div className="py-6 text-gray-900 dark:text-gray-100">
                    <div className="text-left caption-top dark:text-gray-800 -mt-4">
                      <div className="flex flex-row py-2">
                        <div className="flex w-full"><h1></h1></div>
                        <div className="flex gap-2 mb-2">
                          <button type="button" onClick={() => {setOpenAddTenantDial(true); setFormDataTenant({}); setErrors(false)}} className="h-fit flex flex-row primary-btn py-2 px-3 text-xs tracking-wider font-semibold rounded-md text-white bg-gray-800 hover:bg-gray-600 focus:outline-none"><MdAdd size={18}/>Add&nbsp;Tenant</button>
                        </div> 
                      </div>
                    </div>
                    
                      <div className="overflow-auto">
                        <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400 overflow-hidden">
                        <thead className="text-xs text-center uppercase bg-gray-200 text-gray-800 border-b border-t border-gray-300">
                          <tr className="text-nowrap border-gray-300 border-b">
                            
                          </tr>
                          <tr className="text-nowrap">
                            <th className="px-3 py-3">No.</th>
                            <th className="px-3 py-3">Tenant Name</th>
                            <th className="px-3 py-3 whitespace-nowrap">Contact Number</th>
                            <th className="px-3 py-3">Address</th>
                            <th className="px-3 py-3">Email Address</th>
                            <th className="px-3 py-3">Action</th>
                          </tr>
                          </thead>
                          <tbody className="text-xs text-center bg-gray-50 dark:bg-gray-700 dark:text-gray-800 border-b-2 border-gray-300">
                            {tenant.length > 0 ? (tenant.map((rec, i) => (
                            <tr key={rec.id} className="text-xs bg-white border-b dark:bg-gray-100 dark:border-gray-300 hover:bg-gray-50">     
                              <th className="px-3 py-3">{i+1}.</th>
                              <td className="px-3 py-3">{rec.first_name} {rec.last_name}</td>  
                              <td className="px-3 py-3">{rec.contact_number ? rec.contact_number : "--"}</td>  
                              <td className="px-3 py-3">{rec.address ? rec.address : "--"}</td>  
                              <td className="px-3 py-3">{rec.email_address ? rec.email_address : "--"}</td>
                              <td>
                                <button onClick={() => {getTenantUpdate(rec.id); setOpenUpdateTenantDial(true); setErrors(false)}} className="primary-btn text-sm tracking-wider font-semibold rounded-md">
                                <FaRegEdit size={16} className="mr-2 text-green-600"/></button>
                                <button onClick={() => openDeleteTenant(rec.id)} className="primary-btn text-sm tracking-wider font-semibold rounded-md">
                                  <FaRegTrashAlt size={16} className="text-red-600"/></button>
                              </td>  
                            </tr>
                            ))) : (
                            <tr className='text-xs bg-white border-b dark:bg-gray-100 dark:border-gray-300'>
                              <td className='px-3 py-3 text-center' colSpan={6}>No Record</td>
                            </tr>
                            )}
                          </tbody>                        
                        </table>
                      </div> 
                        <div className="!mt-8 float-right ">
                          <button onClick={() => setOpenTenantDial(false)} className="primary-btn py-2 px-8 text-sm tracking-wider font-semibold rounded-md text-white bg-gray-500 hover:bg-gray-600 focus:outline-none"> Close </button>
                        </div>
                  </div>
                    
                </div>
              </div>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>

    {/* Add Tenant Record */}
    <Dialog open={openAddTenantDial} onClose={setOpenAddTenantDial} className="relative z-[999]">
      <DialogBackdrop
          transition
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
      />

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <DialogPanel transition className="relative transform overflow-hidden transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-lg data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"> 

            <div className="flex flex-col font-[sans-serif]">
                <div className="w-full mx-auto border-gray-300 p-8 bg-gray-50">
                  <div className="text-center mb-4">
                    <h1 className="text-2xl text-left pb-6 flex"><FaUserPlus size={30} className='mr-1'/> Add Tenant Record </h1>
                    
                    <form onSubmit={handleCreateTenant} className='w-full mx-auto space-y-6'>
                      <div className='flex flex-row border p-2 bg-gray-100'>
                        <div className='w-full p-4'>
                          <input className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="First Name" value={formDataTenant.first_name}
                              onChange={(e) => setFormDataTenant({ ...formDataTenant, first_name: e.target.value })}
                          />
                            {errors.first_name && <p className="error text-red-700 text-left ml-2">{errors.first_name[0]}</p>}

                          <input className="mt-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="Last Name" value={formDataTenant.last_name}
                              onChange={(e) => setFormDataTenant({ ...formDataTenant, last_name: e.target.value })}
                          />
                            {errors.last_name && <p className="error text-red-700 text-left ml-2">{errors.last_name[0]}</p>}

                          <input className="mt-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="Address" value={formDataTenant.address}
                              onChange={(e) => setFormDataTenant({ ...formDataTenant, address: e.target.value })}
                          />
                            {errors.address && <p className="error text-red-700 text-left ml-2">{errors.address[0]}</p>}

                          <input className="mt-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="Contact Number" value={formDataTenant.contact_number}
                              onChange={(e) => setFormDataTenant({ ...formDataTenant, contact_number: e.target.value })}
                          />
                            {errors.contact_number && <p className="error text-red-700 text-left ml-2">{errors.contact_number[0]}</p>}

                          <input className="mt-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="Email Address" value={formDataTenant.email_address}
                              onChange={(e) => setFormDataTenant({ ...formDataTenant, email_address: e.target.value })}
                          />
                            {errors.email_address && <p className="error text-red-700 text-left ml-2">{errors.email_address[0]}</p>}
                        </div>
                      </div>
                        <div className="!mt-8 float-right">
                          <button className="primary-btn py-2 px-3 text-sm tracking-wider font-semibold rounded-md text-white bg-gray-800 hover:bg-gray-600 focus:outline-none"> Add Tenant </button>
                        </div> 
                    </form>
                        <div className="!mt-8 float-right">
                          <button onClick={() => setOpenAddTenantDial(false)} className="primary-btn py-2 px-8 mr-2 text-sm tracking-wider font-semibold rounded-md text-white bg-gray-500 hover:bg-gray-600 focus:outline-none"> Cancel </button>
                        </div>
                    </div>
                  </div>
                </div>
            </DialogPanel>
          </div>
      </div>
    </Dialog>


    {/* Update Tenant */}
    <Dialog open={openUpdateTenantDial} onClose={setOpenUpdateTenantDial} className="relative z-[999]">
      <DialogBackdrop
          transition
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
      />

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                  <DialogPanel transition className="relative transform overflow-hidden transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-lg data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95">

            <div className="flex flex-col font-[sans-serif]">
                <div className="w-full mx-auto border border-gray-300 p-8 bg-gray-50">
                  <div className="text-center mb-4">
                    <h1 className="text-2xl text-left pb-6 flex"><FaUserEdit size={30} className='mr-1'/> Update Tenant Record </h1>
                      <div className='flex flex-row border p-2 bg-gray-100'>
                        <div className='w-full p-4'>
                          <input className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="First Name" value={formDataTenant.first_name}
                              onChange={(e) => setFormDataTenant({ ...formDataTenant, first_name: e.target.value })}
                          />
                            {errors.first_name && <p className="error text-red-700 text-left ml-2">{errors.first_name[0]}</p>}

                          <input className="mt-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="Last Name" value={formDataTenant.last_name}
                              onChange={(e) => setFormDataTenant({ ...formDataTenant, last_name: e.target.value })}
                          />
                            {errors.last_name && <p className="error text-red-700 text-left ml-2">{errors.last_name[0]}</p>}

                          <input className="mt-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="Address" value={formDataTenant.address}
                              onChange={(e) => setFormDataTenant({ ...formDataTenant, address: e.target.value })}
                          />
                            {errors.address && <p className="error text-red-700 text-left ml-2">{errors.address[0]}</p>}

                          <input className="mt-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="Contact Number" value={formDataTenant.contact_number}
                              onChange={(e) => setFormDataTenant({ ...formDataTenant, contact_number: e.target.value })}
                          />
                            {errors.contact_number && <p className="error text-red-700 text-left ml-2">{errors.contact_number[0]}</p>}

                          <input className="mt-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="Email Address" value={formDataTenant.email_address}
                              onChange={(e) => setFormDataTenant({ ...formDataTenant, email_address: e.target.value })}
                          />
                            {errors.email_address && <p className="error text-red-700 text-left ml-2">{errors.email_address[0]}</p>}
                        </div>          
                      </div>
                        <div className="!mt-8 float-right">
                          <button onClick={() => openUpdateTenant(formDataTenant.id)} className="primary-btn py-2 px-3 text-sm tracking-wider font-semibold rounded-md text-white bg-gray-800 hover:bg-gray-600 focus:outline-none"> Update Tenant </button>
                        </div> 
                    
                        <div className="!mt-8 float-right">
                          <button onClick={() => setOpenUpdateTenantDial(false)} className="primary-btn py-2 px-8 mr-2 text-sm tracking-wider font-semibold rounded-md text-white bg-gray-500 hover:bg-gray-600 focus:outline-none"> Cancel </button>
                        </div>
                    </div>
                  </div>
                </div>
            </DialogPanel>
          </div>
      </div>
    </Dialog>


    {/* Add Lease */}
    <Dialog open={openAddLeaseDial} onClose={setOpenAddLeaseDial} className="relative z-[999]">
      <DialogBackdrop
          transition
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
      />

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <DialogPanel transition className="relative transform overflow-hidden transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-xl data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"> 

            <div className="flex flex-col font-[sans-serif]">
                <div className="w-full mx-auto border-gray-300 p-8 bg-gray-50">
                  <div className="text-center mb-4">
                    <h1 className="text-2xl text-left pb-6 flex"><TbHomePlus size={30} className='mr-1'/> Add Lease Record </h1>
                    
                    <form onSubmit={handleCreateLease} className='w-full mx-auto space-y-6'>
                      <div className='flex flex-row border p-2 bg-gray-100'>
                        <div className='w-full p-4'>
                          <select className='mt-4 form-select text-gray-800 bg-white text-sm px-4 w-full py-3 border border-gray-300 rounded-md outline-blue-500' onChange={(e) => setFormDataLease({ ...formDataLease, unit_id: e.target.value })}>
                              <option value="">Select Unit</option>
                            {rental.map((rec, key) =>(
                              <option value={rec.id} key={key}>{rec.property_name} - {rec.unit_number}</option>
                            ))}
                          </select>
                            {errors.unit_id && <p className="error text-red-700 text-left ml-2">{errors.unit_id[0]}</p>}

                          <select className='mt-4 form-select text-gray-800 bg-white text-sm px-4 w-full py-3 border border-gray-300 rounded-md outline-blue-500' onChange={(e) => setFormDataLease({ ...formDataLease, tenant_id: e.target.value })}>
                              <option value="">Select Tenant</option>
                            {tenant.map((rec, key) =>(
                              <option value={rec.id} key={key}>{rec.first_name} {rec.last_name}</option>
                            ))}
                          </select>
                            {errors.tenant_id && <p className="error text-red-700 text-left ml-2">{errors.tenant_id[0]}</p>}
                          
                          <div className='flex gap-2'>
                          <div className='text-left mt-4'>
                          <label>Month:</label>&nbsp;&nbsp;
                          <DatePicker
                            selected={
                              formDataLease.start_date
                                ? new Date(formDataLease.start_date)
                                : null
                            }
                            onChange={(start_date) =>
                              setFormDataLease((prev) => ({
                                ...prev,
                                start_date: start_date
                                  ? format(start_date, "MMMM yyyy")
                                  : "",
                              }))
                            }
                            dateFormat="MMMM yyyy"
                            showMonthYearPicker
                            className="w-full py-2 px-4 text-left border border-gray-300 rounded"
                            placeholderText="MM/YYYY"
                          />
                            {errors.start_date && <p className="error text-red-700 text-left ml-2">{errors.start_date[0]}</p>}
                          </div>
                          </div>

                          <input className="mt-4 register-link text-gray-800 text-right bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="number" placeholder="Monthly Rent" value={formDataLease.monthly_rent}
                              onChange={(e) => setFormDataLease({ ...formDataLease, monthly_rent: e.target.value })}
                          />
                            {errors.monthly_rent && <p className="error text-red-700 text-left ml-2">{errors.monthly_rent[0]}</p>}

                          <input className="mt-4 register-link text-gray-800 text-right bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="number" placeholder="Deposit" value={formDataLease.deposit}
                              onChange={(e) => setFormDataLease({ ...formDataLease, deposit: e.target.value })}
                          />
                            {errors.deposit && <p className="error text-red-700 text-left ml-2">{errors.deposit[0]}</p>}

                          <input className="mt-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="Reference Number" value={formDataLease.reference_number}
                              onChange={(e) => setFormDataLease({ ...formDataLease, reference_number: e.target.value })}
                          />
                            {errors.reference_number && <p className="error text-red-700 text-left ml-2">{errors.reference_number[0]}</p>}

                          <input className="mt-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="Notes" value={formDataLease.notes}
                              onChange={(e) => setFormDataLease({ ...formDataLease, notes: e.target.value })}
                          />
                            {errors.notes && <p className="error text-red-700 text-left ml-2">{errors.notes[0]}</p>}
                        </div>
                      </div>
                        <div className="!mt-8 float-right">
                          <button className="primary-btn py-2 px-3 text-sm tracking-wider font-semibold rounded-md text-white bg-gray-800 hover:bg-gray-600 focus:outline-none"> Add Lease </button>
                        </div> 
                    </form>
                        <div className="!mt-8 float-right">
                          <button onClick={() => setOpenAddLeaseDial(false)} className="primary-btn py-2 px-8 mr-4 text-sm tracking-wider font-semibold rounded-md text-white bg-gray-500 hover:bg-gray-600 focus:outline-none"> Cancel </button>
                        </div>
                    </div>
                  </div>
                </div>
            </DialogPanel>
          </div>
      </div>
    </Dialog>


    {/* Update Lease Type */}
    <Dialog open={openUpdateLeaseDial} onClose={setOpenUpdateLeaseDial} className="relative z-[999]">
      <DialogBackdrop
          transition
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
      />

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                  <DialogPanel transition className="relative transform overflow-hidden transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-xl data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95">

            <div className="flex flex-col font-[sans-serif]">
                <div className="w-full mx-auto border border-gray-300 p-8 bg-gray-50">
                  <div className="text-center mb-4">
                    <h1 className="text-2xl text-left pb-6 flex"><TbHomeEdit size={30} className='mr-1'/> Update Lease Record </h1>
                    
                      <div className='flex flex-row border p-2 bg-gray-100'>
                        <div className='w-full p-4'>
                          <select className='mt-4 form-select text-gray-800 bg-white text-sm px-4 w-full py-3 border border-gray-300 rounded-md outline-blue-500' onChange={(e) => setFormDataLease({ ...formDataLease, unit_id: e.target.value })}>
                              <option value={formDataLease.unit_id}>{formDataLease.property_name} - {formDataLease.unit_number}</option>
                            {rental.map((rec, key) =>(
                              <option value={rec.id} key={key}>{rec.property_name} - {rec.unit_number}</option>
                            ))}
                          </select>
                            {errors.unit_id && <p className="error text-red-700 text-left ml-2">{errors.unit_id[0]}</p>}

                          <select className='mt-4 form-select text-gray-800 bg-white text-sm px-4 w-full py-3 border border-gray-300 rounded-md outline-blue-500' onChange={(e) => setFormDataLease({ ...formDataLease, tenant_id: e.target.value })}>
                              <option value={formDataLease.tenant_id}>{formDataLease.first_name} {formDataLease.last_name}</option>
                            {tenant.map((rec, key) =>(
                              <option value={rec.id} key={key}>{rec.first_name} {rec.last_name}</option>
                            ))}
                          </select>
                            {errors.tenant_id && <p className="error text-red-700 text-left ml-2">{errors.tenant_id[0]}</p>}
                          
                          <div className='flex gap-2'>
                            <div className='text-left mt-4'>
                            <label>Month:</label>&nbsp;&nbsp;
                            <DatePicker
                              selected={
                                formDataLease.start_date
                                  ? new Date(formDataLease.start_date)
                                  : null
                              }
                              onChange={(start_date) =>
                                setFormDataLease((prev) => ({
                                  ...prev,
                                  start_date: start_date
                                    ? format(start_date, "MMMM yyyy")
                                    : "",
                                }))
                              }
                              dateFormat="MMMM yyyy"
                              showMonthYearPicker
                              className="w-full py-2 px-4 text-left border border-gray-300 rounded"
                              placeholderText="MM/YYYY"
                            />
                              {errors.start_date && <p className="error text-red-700 text-left ml-2">{errors.start_date[0]}</p>}
                            </div>
                          </div>

                          <input className="mt-4 register-link text-gray-800 text-right bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="Monthly Rent" value={formDataLease.monthly_rent}
                              onChange={(e) => setFormDataLease({ ...formDataLease, monthly_rent: e.target.value })}
                          />
                            {errors.monthly_rent && <p className="error text-red-700 text-left ml-2">{errors.monthly_rent[0]}</p>}

                          <input className="mt-4 register-link text-gray-800 text-right bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="Deposit" value={formDataLease.deposit}
                              onChange={(e) => setFormDataLease({ ...formDataLease, deposit: e.target.value })}
                          />
                            {errors.deposit && <p className="error text-red-700 text-left ml-2">{errors.deposit[0]}</p>}

                          <input className="mt-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="Reference Number" value={formDataLease.reference_number}
                              onChange={(e) => setFormDataLease({ ...formDataLease, reference_number: e.target.value })}
                          />
                            {errors.reference_number && <p className="error text-red-700 text-left ml-2">{errors.reference_number[0]}</p>}

                          <input className="mt-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="Notes" value={formDataLease.notes}
                              onChange={(e) => setFormDataLease({ ...formDataLease, notes: e.target.value })}
                          />
                            {errors.notes && <p className="error text-red-700 text-left ml-2">{errors.notes[0]}</p>}
                        </div>          
                      </div>
                        <div className="!mt-8 float-right">
                          <button onClick={() => openUpdateLease(formDataLease.id)} className="primary-btn py-2 px-3 text-sm tracking-wider font-semibold rounded-md text-white bg-gray-800 hover:bg-gray-600 focus:outline-none"> Update Lease </button>
                        </div> 
                    
                        <div className="!mt-8 float-right">
                          <button onClick={() => setOpenUpdateLeaseDial(false)} className="primary-btn py-2 px-8 mr-2 text-sm tracking-wider font-semibold rounded-md text-white bg-gray-500 hover:bg-gray-600 focus:outline-none"> Cancel </button>
                        </div>
                    </div>
                  </div>
                </div>
            </DialogPanel>
          </div>
      </div>
    </Dialog>


    {/* Unit Expenses */}
    <Dialog open={openExpensesDial} onClose={setOpenExpensesDial} className="relative z-[999]">
      <DialogBackdrop
          transition
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
      />

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <DialogPanel transition className="relative transform overflow-hidden transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-4xl data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"> 

            <div className="flex flex-col font-[sans-serif]">
              <div className="w-full mx-auto border-gray-300 p-8 bg-gray-50">
                <div className="text-center mb-4">
                  <h1 className="text-2xl text-left flex"><FaDollarSign size={30} className='mr-1'/> Expenses Record </h1>
                  
                  <div className="py-6 text-gray-900 dark:text-gray-100">
                    <div className="text-left caption-top dark:text-gray-800 -mt-4">
                      <div className="flex flex-row py-2">
                        <div className="flex w-full"><h1></h1></div>
                        <div className="flex gap-2 mb-2">
                          <button type="button" onClick={() => {setOpenAddExpensesDial(true); setFormDataExpenses({}); setErrors(false)}} className="h-fit flex flex-row primary-btn py-2 px-3 text-xs tracking-wider font-semibold rounded-md text-white bg-gray-800 hover:bg-gray-600 focus:outline-none"><MdAdd size={18}/>Add&nbsp;Expenses</button>
                        </div> 
                      </div>
                    </div>
                    
                      <div className="overflow-auto">
                        <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400 overflow-hidden">
                        <thead className="text-xs text-center uppercase bg-gray-200 text-gray-800 border-b border-t border-gray-300">
                          <tr className="text-nowrap border-gray-300 border-b">
                            
                          </tr>
                          <tr className="text-nowrap">
                            <th className="px-3 py-3">No.</th>
                            <th className="px-3 py-3">Date</th>
                            <th className="px-3 py-3 whitespace-nowrap">Property</th>
                            <th className="px-3 py-3">Category</th>
                            <th className="px-3 py-3">Amount</th>
                            <th className="px-3 py-3">Notes</th>
                            <th className="px-3 py-3">Action</th>
                          </tr>
                          </thead>
                          <tbody className="text-xs text-center bg-gray-50 dark:bg-gray-700 dark:text-gray-800 border-b-2 border-gray-300">
                            {expenses.length > 0 ? (expenses.map((rec, i) => (
                            <tr key={rec.id} className="text-xs bg-white border-b dark:bg-gray-100 dark:border-gray-300 hover:bg-gray-50">     
                              <th className="px-3 py-3">{i+1}.</th>
                              <td className="px-3 py-3">{rec.date}</td>
                              <td className="px-3 py-3">{rec.property_name} - {rec.unit_number}</td>
                              <td className="px-3 py-3">{rec.category}</td>
                              <td className="px-3 py-3 text-right">{Number(rec.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                              <td className="px-3 py-3">{rec.notes}</td>
                              <td>
                                <button onClick={() => {getExpensesUpdate(rec.id); setOpenUpdateExpensesDial(true); setErrors(false)}} className="primary-btn text-sm tracking-wider font-semibold rounded-md">
                                <FaRegEdit size={16} className="mr-2 text-green-600"/></button>
                                <button onClick={() => openDeleteExpenses(rec.id)} className="primary-btn text-sm tracking-wider font-semibold rounded-md">
                                  <FaRegTrashAlt size={16} className="text-red-600"/></button>
                              </td>  
                            </tr>
                            ))) : (
                            <tr className='text-xs bg-white border-b dark:bg-gray-100 dark:border-gray-300'>
                              <td className='px-3 py-3 text-center' colSpan={8}>No Record</td>
                            </tr>
                            )}
                          </tbody>                        
                        </table>
                      </div> 
                        <div className="!mt-8 float-right ">
                          <button onClick={() => setOpenExpensesDial(false)} className="primary-btn py-2 px-8 text-sm tracking-wider font-semibold rounded-md text-white bg-gray-500 hover:bg-gray-600 focus:outline-none"> Close </button>
                        </div>
                  </div>
                    
                </div>
              </div>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>


    {/* Add Rental Expenses */}
    <Dialog open={openAddExpensesDial} onClose={setOpenAddExpensesDial} className="relative z-[999]">
      <DialogBackdrop
          transition
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
      />

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <DialogPanel transition className="relative transform overflow-hidden transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-lg data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"> 

            <div className="flex flex-col font-[sans-serif]">
                <div className="w-full mx-auto border-gray-300 p-8 bg-gray-50">
                  <div className="text-center mb-4">
                    <h1 className="text-2xl text-left pb-6 flex"><TbHomePlus size={30} className='mr-1'/> Add Expenses Record </h1>
                    
                    <form onSubmit={handleCreateExpenses} className='w-full mx-auto space-y-6'>
                      <div className='flex flex-row border p-2 bg-gray-100'>
                        <div className='w-full p-4'>
                          <div className='text-left'>
                            <label>Month:</label>&nbsp;&nbsp;
                            <DatePicker
                              selected={
                                formDataExpenses.date
                                  ? new Date(formDataExpenses.date)
                                  : null
                              }
                              onChange={(date) =>
                                setFormDataExpenses((prev) => ({
                                  ...prev,
                                  date: date
                                    ? format(date, "MMMM yyyy")
                                    : "",
                                }))
                              }
                              dateFormat="MMMM yyyy"
                              showMonthYearPicker
                              className="w-full py-2 px-4 text-left border border-gray-300 rounded"
                              placeholderText="MM/YYYY"
                            />
                              {errors.date && <p className="error text-red-700 text-left ml-2">{errors.date[0]}</p>}
                          </div>

                          <select className='mt-4 form-select text-gray-800 bg-white text-sm px-4 w-full py-3 border border-gray-300 rounded-md outline-blue-500' onChange={(e) => setFormDataExpenses({ ...formDataExpenses, property: e.target.value })}>
                              <option value="">Select Property</option>
                            {rental.map((rec, key) =>(
                              <option value={rec.id} key={key}>{rec.property_name} - {rec.unit_number}</option>
                            ))}
                          </select>
                            {errors.property && <p className="error text-red-700 text-left ml-2">{errors.property[0]}</p>}

                          <select
                            value={formDataExpenses.category}
                            onChange={(e) => setFormDataExpenses({...formDataExpenses, category: e.target.value})}
                            className="mt-4 text-sm border rounded w-full py-3 bg-white text-gray-800 border-gray-300 px-4"
                          >
                            <option value="">Select Category</option>
                            <option>Cashout</option>
                            <option>Construction</option>
                            <option>Maintenance</option>
                          </select>
                            {errors.category && <p className="error text-red-700 text-left ml-2">{errors.category[0]}</p>}

                          <input className="mt-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="Amount" value={formDataExpenses.amount} onChange={(e) => setFormDataExpenses({ ...formDataExpenses, amount: e.target.value })}
                          />
                            {errors.amount && <p className="error text-red-700 text-left ml-2">{errors.amount[0]}</p>}

                          <input className="mt-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="Notes" value={formDataExpenses.notes}
                              onChange={(e) => setFormDataExpenses({ ...formDataExpenses, notes: e.target.value })}
                          />
                            {errors.notes && <p className="error text-red-700 text-left ml-2">{errors.notes[0]}</p>}
                        </div>
                      </div>
                        <div className="!mt-8 float-right">
                          <button className="primary-btn py-2 px-3 text-sm tracking-wider font-semibold rounded-md text-white bg-gray-800 hover:bg-gray-600 focus:outline-none"> Add Expenses </button>
                        </div> 
                    </form>
                        <div className="!mt-8 float-right">
                          <button onClick={() => setOpenAddExpensesDial(false)} className="primary-btn py-2 px-8 mr-4 text-sm tracking-wider font-semibold rounded-md text-white bg-gray-500 hover:bg-gray-600 focus:outline-none"> Cancel </button>
                        </div>
                    </div>
                  </div>
                </div>
            </DialogPanel>
          </div>
      </div>
    </Dialog>


    {/* Update Expenses */}
    <Dialog open={openUpdateExpensesDial} onClose={setOpenUpdateExpensesDial} className="relative z-[999]">
      <DialogBackdrop
          transition
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
      />

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                  <DialogPanel transition className="relative transform overflow-hidden transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-lg data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95">

            <div className="flex flex-col font-[sans-serif]">
                <div className="w-full mx-auto border border-gray-300 p-8 bg-gray-50">
                  <div className="text-center mb-4">
                    <h1 className="text-2xl text-left pb-6 flex"><TbHomeEdit size={30} className='mr-1'/> Update Expenses Record </h1>
                    
                      <div className='flex flex-row border p-2 bg-gray-100'>
                        <div className='w-full p-4'>
                          <div className='text-left'>
                            <label>Month:</label>&nbsp;&nbsp;
                            <DatePicker
                              selected={
                                formDataExpenses.date
                                  ? new Date(formDataExpenses.date)
                                  : null
                              }
                              onChange={(date) =>
                                setFormDataExpenses((prev) => ({
                                  ...prev,
                                  date: date
                                    ? format(date, "MMMM yyyy")
                                    : "",
                                }))
                              }
                              dateFormat="MMMM yyyy"
                              showMonthYearPicker
                              className="w-full py-2 px-4 text-left border border-gray-300 rounded"
                              placeholderText="MM/YYYY"
                            />
                              {errors.date && <p className="error text-red-700 text-left ml-2">{errors.date[0]}</p>}
                          </div>

                          <select className='mt-4 form-select text-gray-800 bg-white text-sm px-4 w-full py-3 border border-gray-300 rounded-md outline-blue-500' onChange={(e) => setFormDataExpenses({ ...formDataExpenses, property: e.target.value })}>
                              <option value={formDataExpenses.property}>{formDataExpenses.property_name} - {formDataExpenses.unit_number}</option>
                            {rental.map((rec, key) =>(
                              <option value={rec.id} key={key}>{rec.property_name} - {rec.unit_number}</option>
                            ))}
                          </select>
                            {errors.property && <p className="error text-red-700 text-left ml-2">{errors.property[0]}</p>}

                          <select
                            value={formDataExpenses.category}
                            onChange={(e) => setFormDataExpenses({...formDataExpenses, category: e.target.value})}
                            className="mt-4 text-sm border rounded w-full py-3 bg-white text-gray-800 border-gray-300 px-4"
                          >
                            <option>{formDataExpenses.category}</option>
                            <option>Cashout</option>
                            <option>Construction</option>
                            <option>Maintenance</option>
                          </select>
                            {errors.category && <p className="error text-red-700 text-left ml-2">{errors.category[0]}</p>}

                          <input className="mt-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="Amount" value={formDataExpenses.amount} onChange={(e) => setFormDataExpenses({ ...formDataExpenses, amount: e.target.value })}
                          />
                            {errors.amount && <p className="error text-red-700 text-left ml-2">{errors.amount[0]}</p>}

                          <input className="mt-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="Notes" value={formDataExpenses.notes}
                              onChange={(e) => setFormDataExpenses({ ...formDataExpenses, notes: e.target.value })}
                          />
                            {errors.notes && <p className="error text-red-700 text-left ml-2">{errors.notes[0]}</p>}
                        </div>          
                      </div>
                        <div className="!mt-8 float-right">
                          <button onClick={() => openUpdateExpenses(formDataExpenses.id)} className="primary-btn py-2 px-3 text-sm tracking-wider font-semibold rounded-md text-white bg-gray-800 hover:bg-gray-600 focus:outline-none"> Update Expenses </button>
                        </div> 
                    
                        <div className="!mt-8 float-right">
                          <button onClick={() => setOpenUpdateExpensesDial(false)} className="primary-btn py-2 px-8 mr-2 text-sm tracking-wider font-semibold rounded-md text-white bg-gray-500 hover:bg-gray-600 focus:outline-none"> Cancel </button>
                        </div>
                    </div>
                  </div>
                </div>
            </DialogPanel>
          </div>
      </div>
    </Dialog>


    {/* Reports */}
    <Dialog open={openReportDial} onClose={setOpenReportDial} className="relative z-[999]">
      <DialogBackdrop
          transition
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
      />

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <DialogPanel transition className="relative transform overflow-hidden transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-7xl data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"> 

            <div className="flex flex-col font-[sans-serif]">
              <div className="w-full mx-auto border-gray-300 p-8 bg-gray-50">
                <div className="text-center mb-4">
                  <h1 className="text-2xl text-left flex"><FaFileAlt size={30} className='mr-1'/> Rental Reports </h1>
                  
                  <div className="py-6 text-gray-900 dark:text-gray-100">
                    <div className="text-left caption-top dark:text-gray-800 -mt-4">
                      <div className="flex flex-row py-2">
                        <form onSubmit={(e) => {e.preventDefault(); fetchTransactionHistory(); }} className="flex flex-col md:flex-row gap-4 w-full">
                          <div className='flex py-2 w-2/3 gap-2 h-14'>
                            <select
                              value={filterType}
                              onChange={(e) => {
                                setFilterType(e.target.value);

                                setHistoryParams({
                                  month: "",
                                  year: ""
                                });
                              }}
                              className="border px-4 py-2 rounded"
                            >
                              <option value="monthly">MM</option>
                              <option value="yearly">YY</option>
                            </select>
                            
                            {filterType === "monthly" && (
                              <DatePicker
                                selected={
                                  historyParams.month
                                    ? new Date(historyParams.month)
                                    : null
                                }
                                onChange={(month) =>
                                  setHistoryParams((prev) => ({
                                    ...prev,
                                    month: month ? format(month, "MMMM yyyy") : "",
                                  }))
                                }
                                dateFormat="MMMM yyyy"
                                showMonthYearPicker
                                className="w-full py-2 px-4 border border-gray-300 rounded"
                                placeholderText="Select Month"
                              />
                            )}

                            {filterType === "yearly" && (
                              <DatePicker
                                selected={
                                  historyParams.year
                                    ? new Date(historyParams.year)
                                    : null
                                }
                                onChange={(year) =>
                                  setHistoryParams((prev) => ({
                                    ...prev,
                                    year: year ? format(year, "yyyy") : "",
                                  }))
                                }
                                dateFormat="yyyy"
                                showYearPicker
                                className="w-full py-2 px-4 border border-gray-300 rounded"
                                placeholderText="Select Year"
                              />
                            )}

                            <select className='form-select text-gray-800 bg-white text-sm px-4 w-1/3 border border-gray-300 rounded-md outline-blue-500' onChange={(e) => setHistoryParams({ ...historyParams, unit_id: e.target.value })}>
                                <option value="">Select Unit</option>
                              {rental.map((rec, key) =>(
                                <option value={rec.id} key={key}>{rec.property_name} - {rec.unit_number}</option>
                              ))}
                            </select>

                            <select className='form-select text-gray-800 bg-white text-sm px-4 w-1/3 border border-gray-300 rounded-md outline-blue-500' onChange={(e) => setHistoryParams({ ...historyParams, tenant_id: e.target.value })}>
                                <option value="">Select Tenant</option>
                              {tenant.map((rec, key) =>(
                                <option value={rec.id} key={key}>{rec.first_name} {rec.last_name}</option>
                              ))}
                            </select>

                            <button
                                type="submit"
                                className="px-8 bg-slate-800 text-white rounded-md hover:bg-slate-600 transition"
                              >
                                Search
                              </button>
                          </div>
                        </form>
                      </div>
                    </div>
                    
                      <div className="overflow-auto">

                      <div id="print-section">
                        <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400 overflow-hidden">
                        <thead className="text-xs text-center uppercase bg-gray-200 text-gray-800 border-b border-t border-gray-300">
                          <tr className="text-nowrap">
                            <th className="px-2 py-3">No.</th>
                            <th className="px-2 py-3">Property Name</th>
                            <th className="px-2 py-3 whitespace-nowrap">Unit Number</th>
                            <th className="px-2 py-3">Type</th>  
                            <th className="px-2 py-3">Rented Month</th>
                            <th className="px-2 py-3">Monthly Rent</th>
                            <th className="px-2 py-3">Tenant Name</th>
                            <th className="px-2 py-3">Contact Number</th>
                            <th className="px-2 py-3">Tenant Address</th>
                            <th className="px-2 py-3">Reference#</th>
                            <th className="px-2 py-3">Note</th>
                            <th className="px-2 py-3">Date Added</th>
                          </tr>
                          </thead>
                          <tbody className="text-xs text-center bg-gray-50 dark:bg-gray-700 dark:text-gray-800 border-b-2 border-gray-300">
                           {monitoringDataHistory.length > 0 ? (
                            <>
                            {monitoringDataHistory.map((rec, i) => (
                              <tr key={rec.id} className="text-xs bg-white border-b dark:bg-gray-100 dark:border-gray-300 hover:bg-gray-50">
                                <th className="px-2 py-3">{i + 1}.</th>
                                <td className="px-2 py-3">{rec.property_name}</td>
                                <td className="px-2 py-3">{rec.unit_number}</td>
                                <td className="px-2 py-3">{rec.type}</td>
                                <td className="px-2 py-3">{rec.start_date}</td>
                                <td className="px-2 py-3 text-right">
                                  {Number(rec.monthly_rent).toLocaleString(undefined, {
                                    minimumFractionDigits: 2,
                                  })}
                                </td>
                                <td className="px-2 py-3">{rec.first_name} {rec.last_name}</td>
                                <td className="px-2 py-3">{rec.contact_number ? rec.contact_number : "--"}</td>
                                <td className="px-2 py-3">{rec.tenant_address}</td>
                                <td className="px-2 py-3">{rec.reference_number ? rec.reference_number : "--"}</td>
                                <td className="px-2 py-3 w-20">{rec.notes ? rec.notes : "--"}</td>
                                <td className="px-2 py-3">
                                  {format(new Date(rec.created_at), "MM/dd/yyyy")}
                                  <br />
                                  <span className="text-gray-500">
                                    {format(new Date(rec.created_at), "hh:mm a")}
                                  </span>
                                </td>
                              </tr>
                            ))}

                            <tr className="text-xs font-semibold bg-gray-200 border-t-2 border-gray-400">
                              <td colSpan="5" className="px-2 py-3 text-right">
                                TOTAL
                              </td>
                              <td className="px-2 py-3 text-right">
                                {totalMonthlyRent.toLocaleString(undefined, {
                                  minimumFractionDigits: 2,
                                })}
                              </td>
                              <td className="px-2 py-3" colSpan={6}>&nbsp;</td>
                            </tr>
                            </>
                          ) : (
                            <tr className='text-xs border-b dark:bg-gray-100 dark:border-gray-300'>
                              <td colSpan="12" className="text-center py-4">
                                No records found.
                              </td>
                            </tr>
                          )}
                          </tbody>                        
                        </table></div>
                      </div> 
                        <div className="!mt-8 float-right ">
                          <button onClick={() => setOpenReportDial(false)} className="primary-btn py-2 px-8 text-sm tracking-wider font-semibold rounded-md text-white bg-gray-500 hover:bg-gray-600 focus:outline-none"> Close </button>
                          <button onClick={() => window.print()} className="text-sm mb-4 ml-1 px-4 py-2 bg-slate-800 text-white font-semibold rounded-md hover:bg-gray-600 focus:outline-none">Print Report</button>
                        </div>
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
      body="Rental successfully added!"
      okConfirm={closeCreate}
      /> 
    }

    {status === 6 &&  <InfoBox open={open} setOpen={setOpen} onClose={setOpen}
      title="Confirm Success"
      body="Tenant successfully added!"
      okConfirm={closeCreate}
      /> 
    }

    {status === 11 &&  <InfoBox open={open} setOpen={setOpen} onClose={setOpen}
      title="Confirm Success"
      body="Lease successfully added!"
      okConfirm={closeCreate}
      /> 
    }

    {status === 2 &&  <ConfirmBox open={open} setOpen={setOpen}
      title="Confirm Delete"
      body="Are you sure you want to delete this rental?"
      okConfirm={handleDelete}
      /> 
    }

    {status === 9 &&  <ConfirmBox open={open} setOpen={setOpen}
      title="Confirm Delete"
      body="Are you sure you want to delete this tenant?"
      okConfirm={handleDeleteTenant}
      /> 
    }

    {status === 14 &&  <ConfirmBox open={open} setOpen={setOpen}
      title="Confirm Delete"
      body="Are you sure you want to delete this lease?"
      okConfirm={handleDeleteLease}
      /> 
    }

    {status === 3 && <UpdateBox open={open} setOpen={setOpen}
      title="Confirm Update"
      body="Are you sure you want to update this rental?"
      okConfirm={handleUpdate}
      /> 
    }

    {status === 7 && <UpdateBox open={open} setOpen={setOpen}
      title="Confirm Update"
      body="Are you sure you want to update this tenant?"
      okConfirm={handleUpdateTenant}
      /> 
    }

    {status === 12 && <UpdateBox open={open} setOpen={setOpen}
      title="Confirm Update"
      body="Are you sure you want to update this lease?"
      okConfirm={handleUpdateLease}
      /> 
    }

    {status === 4 &&  <InfoBox open={open} setOpen={setOpen} onClose={setOpen}
      title="Confirm Success"
      body="Rental successfully updated!"
      okConfirm={closeUpdate}
      /> 
    }

    {status === 8 &&  <InfoBox open={open} setOpen={setOpen} onClose={setOpen}
      title="Confirm Success"
      body="Tenant successfully updated!"
      okConfirm={closeUpdate}
      /> 
    }

    {status === 13 &&  <InfoBox open={open} setOpen={setOpen} onClose={setOpen}
      title="Confirm Success"
      body="Lease successfully updated!"
      okConfirm={closeUpdate}
      /> 
    }

    {status === 5 &&  <InfoBox open={open} setOpen={setOpen} onClose={setOpen}
      title="Confirm Success"
      body="Rental successfully deleted!"
      okConfirm={closeDelete}
      /> 
    }

    {status === 10 &&  <InfoBox open={open} setOpen={setOpen} onClose={setOpen}
      title="Confirm Success"
      body="Tenant successfully deleted!"
      okConfirm={closeDelete}
      /> 
    }

    {status === 15 &&  <InfoBox open={open} setOpen={setOpen} onClose={setOpen}
      title="Confirm Success"
      body="Expenses successfully added!"
      okConfirm={closeCreate}
      /> 
    }

    {status === 16 && <UpdateBox open={open} setOpen={setOpen}
      title="Confirm Update"
      body="Are you sure you want to update this expenses?"
      okConfirm={handleUpdateExpenses}
      /> 
    }

    {status === 17 &&  <InfoBox open={open} setOpen={setOpen} onClose={setOpen}
      title="Confirm Success"
      body="Expenses successfully updated!"
      okConfirm={closeUpdate}
      /> 
    }

    {status === 18 &&  <ConfirmBox open={open} setOpen={setOpen}
      title="Confirm Delete"
      body="Are you sure you want to delete this expenses?"
      okConfirm={handleDeleteExpenses}
      /> 
    }

    {status === 19 &&  <InfoBox open={open} setOpen={setOpen} onClose={setOpen}
      title="Confirm Success"
      body="Expenses successfully deleted!"
      okConfirm={closeDelete}
      /> 
    }
    
    </>
  )
};
