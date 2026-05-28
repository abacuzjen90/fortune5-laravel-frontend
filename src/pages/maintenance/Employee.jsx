import { Dialog, DialogBackdrop, DialogPanel } from '@headlessui/react';
import { useContext, useEffect, useState} from "react";
import { AppContext } from "../../context/AppContext";
import { Link } from 'react-router-dom';
import Currency from "../../assets/components/CurrencyFormat";
import InfoBox from "../../assets/components/InfoBox";
import { MdAdd } from "react-icons/md";
import Pagination from '../../assets/components/Pagination';
import TableSort from '../../assets/components/TableSort';
import sortData from '../../assets/components/sortData';
import useScreenSize from "../../assets/components/useScreenSize";
import LoadingBox from '../../assets/components/Loading';
import { FaUserPlus } from 'react-icons/fa';

export default function Masterlist() {
  const [openAdd, setOpenAdd] = useState(false);
  const [open, setOpen] = useState(false);
  const { token } = useContext(AppContext);
  const [status, setStatus] = useState(0);
  const [showLoading, setShowLoading] = useState(false);
  const isLoading = () => {setShowLoading(true)};
  const stopLoading = () => {setShowLoading(false)};
  const [masterlist, setMasterlist] = useState([]);
  const [designation, setDesignation] = useState([]);
  const [branch, setBranch] = useState([]);
  const [department, setDepartment] = useState([]);
  const [filters, setFilters] = useState([]);
  const isMediumScreen = useScreenSize(768);

   //Table Pagination, Search
   const [sortdata, setSortdata] = useState([]);
   const [sorting, setSorting] = useState({ key: "", ascending: true });
   const [search, setSearch] = useState('');
   const [currentPage, setCurrentPage] = useState(1);
   const [pageCount, setPageCount] = useState(0);
   const [dataPerPage, setDataPerPage] = useState(10);
  
  const [formData, setFormData] = useState({
    branch: "", department: "", designation: "", salary_type: "",
    first_name: "", middle_name: "", last_name: "",
    address: "", dateofbirth: "",
    age: "", gender: "", contact_number: "", pagibig: "",
    sss: "", philhealth: "", tin: "", 
    basic_pay: "", cola: "", employment_status: "",
    datehired: "", dateregularized: "",  remarks: "",
    employee_type: "",
  });

  const [errors, setErrors] = useState({});
  

  //Datepicker
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFilters({
        ...filters,
        [name]: value,
    });
    console.log(value);
  };

  const changePage = (i) => {
    setCurrentPage(i);
    const startItem = (i - 1) * dataPerPage;
    setSortdata(masterlist.slice(startItem, startItem + dataPerPage));
  };

  const handleChange = (value) => {
    changePage(value);
  };

  //Search
  async function searchTable() {
    const filtered = masterlist.filter(rec => 
      rec.first_name.toLowerCase().includes(search.toLowerCase()) ||
      rec.middle_name.toLowerCase().includes(search.toLowerCase()) ||
      rec.last_name.toLowerCase().includes(search.toLowerCase()) ||
      rec.employee_type.toLowerCase().includes(search.toLowerCase()) ||
      rec.branch.toLowerCase().includes(search.toLowerCase()) ||
      rec.department.toLowerCase().includes(search.toLowerCase()) ||
      rec.designation.toLowerCase().includes(search.toLowerCase()) ||
      rec.employment_status.toLowerCase().includes(search.toLowerCase())
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

  //Branch Dropdown
  const branchOptions = branch.reduce((acc, rec) => {
    const branchGroup = acc[rec.type] || [];
    return {
      ...acc, [rec.type]: [...branchGroup, rec]
  }}, {});


  // Get Department
  async function getDepartment() {
    const res = await fetch("/api/deptdata", {
      method: "get",  
      headers: {
        Authorization: `Bearer ${token}`,
      },
  });
    const data = await res.json();
    if(res.ok) {
      setDepartment(data);
    }
  }
  useEffect(() => {
    getDepartment();
  }, []);

  //Department Dropdown
  const deptOptions = department.reduce((acc, rec) => {
    const deptGroup = acc[rec.department] || [];
    return {
      ...acc, [rec.department]: [...deptGroup, rec]
  }}, {});

  // Add Employee
  async function handleCreate(e) {
    e.preventDefault();
    const res = await fetch("/api/masterlists", {
        method: "post",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
    });
    console.log(formData);

    const data = await res.json()

    if (data.errors) {
      setErrors(data.errors);
    } else {
      setOpen(true);
      setStatus(1);
      setFormData({});
      setErrors(false);
    }
  }

  async function closeCreate() {
    setOpen(false);
    setOpenAdd(false);
    getMasterlist();
  }

  // Get Employee
  async function getMasterlist() {
    isLoading();
    const res = await fetch("/api/masterlists");
    const data = await res.json();
    if(res.ok) {
      setMasterlist(data);
      setPageCount(Math.ceil(data.length / dataPerPage));
      setSortdata(data.slice(0, dataPerPage));
      stopLoading();
    }
  }
  useEffect(() => {
    getMasterlist();
  }, [dataPerPage]);

  // Get Designation List
  async function getDesignation() {
    const res = await fetch("/api/designation");
    const data = await res.json();
    if(res.ok) {
      setDesignation(data);
    }
  }
  useEffect(() => {
    getDesignation();
  }, []);

  //Employee Number
  const idarray = masterlist.map(emp_id => {
    return (emp_id.id);
  });
  const empid = (idarray[idarray.length - 1] + 1);


  return (
    <> 
    <div className="flex items-center font-medium border-b border-slate-300 w-full">
      <main className="px-4 flex-1 mx-auto py-4"><h1>Maintenance - Employee</h1></main>
    </div>

    <div className="flex items-center font-medium mx-auto py-4">
      <main className="flex-1 mx-auto p-4">
        <div className="mx-auto">
          <div className=" bg-gray-50 shadow-md border">
            <div className="p-6 text-gray-900 dark:text-gray-100">
              <div className="text-left caption-top dark:text-gray-800">
                <div className="flex flex-row py-2">
                  <div className="w-full"><h1>Employee's Masterlist</h1></div>
                  <div className="flex mb-2">
                    <button type="button" onClick={() => {setOpenAdd(true); setFormData({}); setErrors(false)}} className="h-fit flex flex-row primary-btn py-3 px-6 text-sm tracking-wider font-semibold rounded-md text-white bg-gray-800 hover:bg-gray-600 focus:outline-none"><MdAdd size={20} className="mr-2"/>Add&nbsp;Employee</button>
                  </div> 
                </div>
              </div>
              <div className='text-gray-800 text-sm relative mb-2'>
                <hr />
                Per&nbsp;Page <select className='mt-3 form-select text-gray-800 bg-white text-sm px-3 w-20 py-3 border border-gray-300 rounded-md outline-gray-300' value={dataPerPage} onChange={(e) => { setDataPerPage(parseInt(e.target.value, 10)); setCurrentPage(1); }}>
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
                    <th className='px-3 py-3'>
                      <TableSort sortdata={sortdata} title="No." field="id" sorteddata={sortdata} setSorteddata={setSortdata} sorting={sorting} setSorting={setSorting} /> 
                    </th>
                    <th className='px-3 py-3'>
                      <TableSort sortdata={sortdata} title="Employee Name" field="first_name" sorteddata={sortdata} setSorteddata={setSortdata} sorting={sorting} setSorting={setSorting} /> 
                    </th>
                    <th className='px-3 py-3'>
                      <TableSort sortdata={sortdata} title="Branch" field="branch" sorteddata={sortdata} setSorteddata={setSortdata} sorting={sorting} setSorting={setSorting} /> 
                    </th>
                    <th className='px-3 py-3'>
                      <TableSort sortdata={sortdata} title="Department" field="department" sorteddata={sortdata} setSorteddata={setSortdata} sorting={sorting} setSorting={setSorting} /> 
                    </th>
                    <th className='px-3 py-3'>
                      <TableSort sortdata={sortdata} title="Section" field="section" sorteddata={sortdata} setSorteddata={setSortdata} sorting={sorting} setSorting={setSorting} /> 
                    </th>
                    <th className='px-3 py-3'>
                      <TableSort sortdata={sortdata} title="Designation" field="designation" sorteddata={sortdata} setSorteddata={setSortdata} sorting={sorting} setSorting={setSorting} /> 
                    </th>
                    <th className='px-3 py-3'>
                      <TableSort sortdata={sortdata} title="Date Hired" field="datehired" sorteddata={sortdata} setSorteddata={setSortdata} sorting={sorting} setSorting={setSorting} /> 
                    </th>
                    <th className='px-3 py-3'>
                      <TableSort sortdata={sortdata} title="Date Regularized" field="dateregularized" sorteddata={sortdata} setSorteddata={setSortdata} sorting={sorting} setSorting={setSorting} /> 
                    </th>
                    <th className='px-3 py-3'>
                      <TableSort sortdata={sortdata} title="Employment Status" field="employment_status" sorteddata={sortdata} setSorteddata={setSortdata} sorting={sorting} setSorting={setSorting} /> 
                    </th>
                    <th className='px-3 py-3'>
                      <TableSort sortdata={sortdata} title="Salary Type" field="salary_type" sorteddata={sortdata} setSorteddata={setSortdata} sorting={sorting} setSorting={setSorting} /> 
                    </th>
                    <th className='px-3 py-3'>
                      <TableSort sortdata={sortdata} title="Basic Pay" field="basic_pay" sorteddata={sortdata} setSorteddata={setSortdata} sorting={sorting} setSorting={setSorting} /> 
                    </th>
                    <th className='px-3 py-3'>
                      <TableSort sortdata={sortdata} title="Cola" field="cola" sorteddata={sortdata} setSorteddata={setSortdata} sorting={sorting} setSorting={setSorting} /> 
                    </th>
                    </tr>
                  </thead>
                  <tbody className="text-sm bg-gray-50 text-gray-800 border-b-2 border-gray-300">
                  {sortdata.length > 0 ? (sortdata.map(rec => (
                    <tr className="text-xs border-b bg-gray-100 border-gray-300 hover:bg-gray-50" key={rec.id}>     
                      <th className="px-3 py-3">
                        <Link to={`/maintenance/employee/details/${rec.id}`} className="font-medium text-blue-600 dark:text-blue-500 hover:underline mx-1">
                        {rec.id}</Link>
                      </th>
                      <td className="px-3 py-3">{rec.first_name + " " + rec.middle_name + " " + rec.last_name}</td>
                      <td className="px-3 py-3 text-center">{rec.branch}</td>
                      <td className="px-3 py-3 text-center">{rec.department}</td>
                      <td className="px-3 py-3 text-center">{rec.section ? rec.section : "-"}</td>
                      <td className="px-3 py-3 text-center">{rec.designation}</td>
                      <td className="px-3 py-3 text-center whitespace-nowrap">{rec.datehired}</td>
                      <td className="px-3 py-3 text-center whitespace-nowrap">{rec.dateregularized}</td>
                      <td className="px-3 py-3 text-center">{rec.employment_status}</td>
                      <td className="px-3 py-3 text-center">{rec.salary_type}</td>
                      <td className="px-3 py-3 text-right">{Currency(rec.basic_pay)}</td>
                      <td className="px-3 py-3 text-right">{Currency(rec.cola)}</td>                
                    </tr>
                      ))) : (
                      <tr className='text-xs bg-white border-b dark:bg-gray-100 dark:border-gray-300'>
                        <td className='px-3 py-3 text-center' colSpan={13}>Loading...</td>
                      </tr>
                      )}
                    </tbody>
                </table>
              </div>
              <Pagination dataSize={masterlist.length} dataPPage={dataPerPage} nPages={pageCount} currentPage={currentPage} setCurrentPage={handleChange} />
            </div>
          </div>
        </div>  
      </main> 
    </div>

    <Dialog open={openAdd} onClose={setOpenAdd} className="relative z-[999]">
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
                    <h1 className="text-2xl text-left pb-6 flex"> <FaUserPlus size={30} className='mr-1'/> Add Employee Record </h1>
                    
                    <form onSubmit={handleCreate} className='w-full mx-auto space-y-6'>
                      <div className='flex flex-row border p-2 bg-gray-100'>
                        <div className='p-4 w-1/2'>    
                            <select className='mb-1 form-select bg-white text-sm px-3 w-full py-3 border border-gray-300 rounded-md outline-blue-500' onChange={(e) => setFormData({ ...formData, branch: e.target.value })}>
                              <option value="">Select Branch</option>
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
          
                          <input className="mt-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text"  disabled value={'Employee Number: ' + empid}/>

                          <select className='mt-4 form-select text-gray-800 bg-white text-sm px-4 w-full py-3 border border-gray-300 rounded-md outline-blue-500' onChange={(e) => setFormData({ ...formData, department: e.target.value })}>
                            <option value="">Select Department</option>
                            {Object.keys(deptOptions).map((department) => (
                              <optgroup label={department} key={department}>
                                {deptOptions[department].map(({department_sub}) => (
                                  <option key={department_sub}>{department_sub}</option>
                                ))}
                              </optgroup>
                            ))}
                          </select>
                          {errors.department && <p className="error text-red-700 text-left ml-2">{errors.department[0]}</p>}

                          <select className='mt-4 form-select text-gray-800 bg-white text-sm px-4 w-full py-3 border border-gray-300 rounded-md outline-blue-500' onChange={(e) => setFormData({ ...formData, designation: e.target.value })}>
                              <option value="">Select Designation</option>
                            {designation.map((rec, key) => (
                              <option key={key}>{rec.designation}</option>
                            ))}
                          </select>
                          {errors.designation && <p className="error text-red-700 text-left ml-2">{errors.designation[0]}</p>}

                          <select className='mt-4 form-select text-gray-800 bg-white text-sm px-4 w-full py-3 border border-gray-300 rounded-md outline-blue-500' onChange={(e) => setFormData({ ...formData, employee_type: e.target.value })}>
                              <option value="">Select Payroll Type</option>
                              <option>Monthly</option>
                              <option>Weekly</option>
                              <option>Daily</option>
                            </select>
                            {errors.employee_type && <p className="error text-red-700 text-left ml-2">{errors.employee_type[0]}</p>}

                          <div className='flex mt-4'>
                            <input className="mr-2 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="First Name" value={formData.first_name}
                                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                            />
                        
                            <input className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="Middle Name" value={formData.middle_name}
                                onChange={(e) => setFormData({ ...formData, middle_name: e.target.value })}
                            />

                            <input className="ml-2 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="Last Name" value={formData.last_name}
                                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                            />   
                          </div>
                            {(errors.first_name || errors.middle_name || errors.last_name ) ? <p className="error text-red-700 text-left ml-2">Please complete name details.</p> : ""}
                              
                          <input className="mt-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="Address" value={formData.address}
                              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                          />
                            {errors.address && <p className="error text-red-700 text-left ml-2">{errors.address[0]}</p>}      

                          {/* <input className="mt-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="Date of Birth" value={formData.dateofbirth}
                              onChange={(e) => setFormData({ ...formData, dateofbirth: e.target.value })}
                          />
                            {errors.dateofbirth && <p className="error text-red-700 text-left ml-2">{errors.dateofbirth[0]}</p>} */}

                          
                          <div className='flex mt-4'>
                          <p className='p-2 align-middle text-sm'>Date&nbsp;of&nbsp;Birth</p>
                            <input name='dob' className="register-link px-4 py-3 w-full border border-gray-300 text-sm text-gray-800 rounded-md outline-blue-500" type="date" value={formData.dateofbirth = filters.dob || ""} onChange={handleInputChange}
                            />
                          </div>
                          {errors.dateofbirth && <p className="error text-red-700 text-left ml-2">{errors.dateofbirth[0]}</p>}

                          <input className="mt-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="Age" value={formData.age}
                              onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                          />
                            {errors.age && <p className="error text-red-700 text-left ml-2">{errors.age[0]}</p>}    

                            <select className='mt-4 form-select text-gray-800 bg-white text-sm px-4 w-full py-3 border border-gray-300 rounded-md outline-blue-500' onChange={(e) => setFormData({ ...formData, gender: e.target.value })}>
                              <option value="">Select Gender</option>
                              <option>Male</option>
                              <option>Female</option>
                              <option>Others</option>
                            </select>
                            {errors.gender && <p className="error text-red-700 text-left ml-2">{errors.gender[0]}</p>}

                          <input className="mt-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="Contact Number" value={formData.contact_number}
                              onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
                          />
                            {errors.contact_number && <p className="error text-red-700 text-left ml-2">{errors.contact_number[0]}</p>}  
                        </div>

                        <div className='p-4 w-1/2'>
                          <input className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="SSS" value={formData.sss}
                              onChange={(e) => setFormData({ ...formData, sss: e.target.value })}
                          />
                            {errors.sss && <p className="error text-red-700 text-left ml-2">{errors.sss[0]}</p>}

                          <input className=" mt-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="Pag-Ibig" value={formData.pagibig}
                              onChange={(e) => setFormData({ ...formData, pagibig: e.target.value })}
                          />
                            {errors.pagibig && <p className="error text-red-700 text-left ml-2">{errors.pagibig[0]}</p>}

                          <input className=" mt-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="PhilHealth" value={formData.philhealth}
                              onChange={(e) => setFormData({ ...formData, philhealth: e.target.value })}
                          />
                            {errors.philhealth && <p className="error text-red-700 text-left ml-2">{errors.philhealth[0]}</p>}

                          <input className=" mt-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="TIN" value={formData.tin}
                              onChange={(e) => setFormData({ ...formData, tin: e.target.value })}
                          />
                            {errors.tin && <p className="error text-red-700 text-left ml-2">{errors.tin[0]}</p>}

                            <select className='mt-4 form-select text-gray-800 bg-white text-sm px-4 w-full py-3 border border-gray-300 rounded-md outline-blue-500' onChange={(e) => setFormData({ ...formData, salary_type: e.target.value })}>
                              <option value="">Select Salary Type</option>
                              <option>Per Trip</option>
                              <option>Daily</option>
                              <option>Semi-Monthly</option>
                            </select>
                            {errors.salary_type && <p className="error text-red-700 text-left ml-2">{errors.salary_type[0]}</p>}

                          <input className=" mt-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="Basic Salary" value={formData.basic_pay}
                              onChange={(e) => setFormData({ ...formData, basic_pay: e.target.value })}
                          />
                            {errors.basic_pay && <p className="error text-red-700 text-left ml-2">{errors.basic_pay[0]}</p>}

                          <input className=" mt-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="Cola" value={formData.cola}
                              onChange={(e) => setFormData({ ...formData, cola: e.target.value })}
                          />
                            {errors.cola && <p className="error text-red-700 text-left ml-2">{errors.cola[0]}</p>}

                            <select className='mt-4 form-select text-gray-800 bg-white text-sm px-4 w-full py-3 border border-gray-300 rounded-md outline-blue-500' onChange={(e) => setFormData({ ...formData, employment_status: e.target.value })}>
                              <option value="">Employment Status</option>
                              <option>Regular</option>
                              <option>Per Project</option>
                              <option>Terminated</option>
                              <option>Resigned</option>
                              <option>Casual</option>
                              <option>Sub-Contractor</option>
                              <option>Probationary</option>
                              <option>Fixed-Term</option>
                            </select>
                            {errors.employment_status && <p className="error text-red-700 text-left ml-2">{errors.employment_status[0]}</p>}

                          {/* <input className=" mt-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="Date Hired" value={formData.datehired}
                              onChange={(e) => setFormData({ ...formData, datehired: e.target.value })}
                          /> */}

                          <div className='flex mt-4'>
                            <p className='p-2 align-middle text-sm'>Date&nbsp;Hired</p>  
                            <input name='dhired' className="register-link px-4 py-3 w-full border border-gray-300 text-sm text-gray-800 rounded-md outline-blue-500" type="date" value={formData.datehired = filters.dhired || ""} onChange={handleInputChange}
                            />
                          </div>
                            {errors.datehired && <p className="error text-red-700 text-left ml-2">{errors.datehired[0]}</p>}

                            <div className='flex mt-4'>
                            <p className='p-2 align-middle text-sm'>Date&nbsp;Regularized</p>  
                            <input name='dregularized' className="register-link px-4 py-3 w-full border border-gray-300 text-sm text-gray-800 rounded-md outline-blue-500" type="date" value={formData.dateregularized = filters.dregularized || ""} onChange={handleInputChange}
                            />
                          </div>
                            {errors.dateregularized && <p className="error text-red-700 text-left ml-2">{errors.dateregularized[0]}</p>}  

                          <input className=" mt-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="Remarks" value={formData.remarks}
                              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                          />
                        </div>          
                      </div>
                        <div className="!mt-8 float-right">
                          <button className="primary-btn py-3 px-4 text-sm tracking-wider font-semibold rounded-md text-white bg-gray-800 hover:bg-gray-600 focus:outline-none"> Add Employee </button>
                        </div> 
                    </form>
                        <div className="!mt-8 float-right">
                          <button onClick={() => setOpenAdd(false)} className="primary-btn py-3 px-10 mr-4 text-sm tracking-wider font-semibold rounded-md text-white bg-gray-500 hover:bg-gray-600 focus:outline-none"> Cancel </button>
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
      title="Add Employee Record"
      body="Employee Record successfully added!"
      okConfirm={closeCreate}
      /> 
    }
  
    </>
  )
}