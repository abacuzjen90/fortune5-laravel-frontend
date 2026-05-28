import { Dialog, DialogBackdrop, DialogPanel } from '@headlessui/react';
import { useContext, useEffect, useState} from "react";
import { AppContext } from "../../context/AppContext";
import { Link } from 'react-router-dom';
import InfoBox from "../../assets/components/InfoBox";
import { MdAdd } from "react-icons/md";
import Pagination from '../../assets/components/Pagination';
import TableSort from '../../assets/components/TableSort';
import sortData from '../../assets/components/sortData';
import useScreenSize from "../../assets/components/useScreenSize";
import LoadingBox from '../../assets/components/Loading';
import { FaUserPlus } from 'react-icons/fa';

export default function Branch() {
  const [openAdd, setOpenAdd] = useState(false);
  const [open, setOpen] = useState(false);
  const { token } = useContext(AppContext);
  const [showLoading, setShowLoading] = useState(false);
  const isLoading = () => {setShowLoading(true)};
  const stopLoading = () => {setShowLoading(false)};
  const [status, setStatus] = useState(0);
  const [branch, setBranch] = useState([]);
  const [branchType, setbranchType] = useState([]);
  const [masterlist, setMasterlist] = useState([]);
  const isMediumScreen = useScreenSize(768);

  //Table Pagination, Search
  const [sortdata, setSortdata] = useState([]);
  const [sorting, setSorting] = useState({ key: "", ascending: true });
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageCount, setPageCount] = useState(0);
  const [dataPerPage, setDataPerPage] = useState(10);
    
  const [formData, setFormData] = useState({
    str_list_id: "", head_person: "", branchtype_id: "", branchtype: "",
    acronym: "", description: "", str_list_address: "",
    contact_number: "", per_cbm: "", per_kilo: "", val_charge: "",
    fcl_value_charge: "", min_charge: "", advalorem: "", ftr10: "",
    ftr20: "", ftr40: "", wheeler4: "", wheeler6: "", wheeler8: "", wheeler10: "", 
    freightliner: "", rolling_cargo: "", ftr10_value: "", ftr20_value: "", ftr40_value: "",
    wheeler4_value: "", wheeler6_value: "",  wheeler8_value: "", wheeler10_value: "",
    freightliner_value: "", rolling_cargo_value: "", airvalue: "", management_fee: "",
    agency_10ftr: "", agency_20ftr: "", agency_40ftr: "",
    small_rate: "", medium_rate: "", large_rate: "", parcel_rate: "", status: "",
  });

  const [errors, setErrors] = useState({});

  const changePage = (i) => {
    setCurrentPage(i);
    const startItem = (i - 1) * dataPerPage;
    setSortdata(branch.slice(startItem, startItem + dataPerPage));
  };

  const handleChange = (value) => {
    changePage(value);
  };

  //Search
  async function searchTable() {
    const filtered = branch.filter(rec => 
      rec.str_list_id.toLowerCase().includes(search.toLowerCase()) ||
      rec.branchtype.toLowerCase().includes(search.toLowerCase()) ||
      rec.first_name.toLowerCase().includes(search.toLowerCase()) ||
      rec.last_name.toLowerCase().includes(search.toLowerCase()) ||
      rec.str_list_address.toLowerCase().includes(search.toLowerCase())
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

  // Get Branch Type
  async function getbranchType() {
    const res = await fetch("/api/branchtype");
    const data = await res.json();
    if(res.ok) {
      setbranchType(data);
    }
  }
  useEffect(() => {
    getbranchType();
  }, []);

  // Get Branch
  async function getBranch() {
    isLoading();
    const res = await fetch("/api/branch");
    const data = await res.json();
    if(res.ok) {
      setBranch(data);
      setPageCount(Math.ceil(data.length / dataPerPage));
      setSortdata(data.slice(0, dataPerPage));
      stopLoading();
    }
  }
  useEffect(() => {
    getBranch();
  }, [dataPerPage]);

  // Create Branch
  async function handleCreate(e) {
    e.preventDefault();
    //fetch branchtype table
    if(formData.branchtype_id) {
      const typeres = await fetch(`/api/branchtype/${formData.branchtype_id}`);
      const typedata = await typeres.json();
      formData.branchtype = typedata[0].type;
    }

    const res = await fetch("/api/branch", {
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
    setOpenAdd(false);
    getBranch();
  }

  // for(var x = 0; x < data.length; x++){
      //   const empres = await fetch(`/api/masterlists/${data[x].head_person}`);
      //   const empdata = await empres.json();
      //   data[x].head_person = { fname: empdata[0].first_name, lname: empdata[0].last_name };
      // } 

  return (
    <> 
    <div className="flex items-center font-medium border-b border-slate-300 w-full">
      <main className="px-4 flex-1 mx-auto py-4"><h1>Maintenance - Branch</h1></main>
    </div>
    <div className="flex items-center font-medium flex-1 mx-auto py-4">
      <main className="flex-1 mx-auto p-4">
        <div className="mx-auto">
          <div className="bg-gray-50 shadow-md border">
            <div className="p-6 text-gray-900 dark:text-gray-100">
              <div className="text-left caption-top dark:text-gray-800">
                <div className="flex flex-row py-2">
                  <div className="flex w-full"><h1>Branch List</h1></div>
                  <div className="flex mb-2">
                    <button type="button" onClick={() => {setOpenAdd(true); setFormData({}); setErrors(false)}} className="h-fit flex flex-row primary-btn py-3 px-5 text-sm tracking-wider font-semibold rounded-md text-white bg-gray-800 hover:bg-gray-600 focus:outline-none"><MdAdd size={20} className="mr-2"/>Add&nbsp;Branch&nbsp;</button>
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
                <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                  <thead className="text-xs text-center uppercase bg-gray-200 text-gray-800 border-b border-t border-gray-300">
                    <tr className="text-nowrap">
                    <th className='px-3 py-3'>
                      <TableSort sortdata={sortdata} title="No." field="id" sorteddata={sortdata} setSorteddata={setSortdata} sorting={sorting} setSorting={setSorting} /> 
                    </th>
                    <th className="px-3 py-3">
                      <TableSort sortdata={sortdata} title="Branch Code" field="str_list_id" sorteddata={sortdata} setSorteddata={setSortdata} sorting={sorting} setSorting={setSorting} />
                    </th>
                    <th className="px-3 py-3">
                      <TableSort sortdata={sortdata} title="Branch Type" field="branchtype" sorteddata={sortdata} setSorteddata={setSortdata} sorting={sorting} setSorting={setSorting} />
                    </th>
                    <th className="px-3 py-3">
                      <TableSort sortdata={sortdata} title="Head Person" field="first_name" sorteddata={sortdata} setSorteddata={setSortdata} sorting={sorting} setSorting={setSorting} />
                    </th>
                    <th className="px-3 py-3">Address</th>
                    <th className="px-3 py-3">Contact Number</th>
                    <th className="px-3 py-3">Per CBM</th>
                    <th className="px-3 py-3">Per Kilo</th>
                    <th className="px-3 py-3">Value Charge</th>
                    <th className="px-3 py-3">Minimum</th>
                    <th className="px-3 py-3">Ad Valorem</th>
                    <th className="px-3 py-3">FCL Value Charge</th>
                    <th className="px-3 py-3">Special Item</th>
                    </tr>
                  </thead>
                  
                  <tbody className="text-xs bg-gray-50 text-gray-800 border-b-2 border-gray-300">
                  {sortdata.length > 0 ? (sortdata.map(rec => (
                    <tr className="text-xs border-b bg-gray-100 border-gray-300 hover:bg-gray-50" key={rec.id}>     
                      <th className="px-3 py-3">
                        <Link to={`/maintenance/branch/details/${rec.id}`} className="font-medium text-blue-600 dark:text-blue-500 hover:underline mx-1">{rec.id}</Link>
                      </th>
                      <td className="px-3 py-3">{rec.str_list_id}</td>
                      <td className="px-3 py-3">{rec.branchtype}</td>
                      <td className="px-3 py-3">{rec.first_name + " " + rec.last_name}</td>
                      <td className="px-3 py-3">{rec.str_list_address}</td>
                      <td className="px-3 py-3 text-center">{rec.contact_number ? rec.contact_number : "-"}</td>
                      <td className="px-3 py-3 text-right">{rec.per_cbm}</td>
                      <td className="px-3 py-3 text-right">{rec.per_kilo}</td>
                      <td className="px-3 py-3 text-right">{rec.val_charge}</td>
                      <td className="px-3 py-3 text-right">{rec.min_charge}</td>
                      <td className="px-3 py-3 text-right">{rec.advalorem}</td>
                      <td className="px-3 py-3 text-right">{rec.fcl_value_charge}</td>
                      <td className="px-3 py-3 text-right whitespace-nowrap"><Link className='text-blue-500'>Special Item</Link></td>
                    </tr>
                  ))) : (
                    <tr className='text-xs bg-white border-b dark:bg-gray-100 dark:border-gray-300'>
                      <td className='px-3 py-3 text-center' colSpan={13}>Loading...</td>
                    </tr>
                  )}
                  </tbody>
                </table>
              </div>
              <Pagination dataSize={branch.length} dataPPage={dataPerPage} nPages={pageCount} currentPage={currentPage} setCurrentPage={handleChange} />
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
                    <h1 className="text-2xl text-left pb-6 flex"><FaUserPlus size={30} className='mr-1'/> Add Branch Record </h1>
                  
                    <form onSubmit={handleCreate} className='w-full mx-auto space-y-6'>
                      <div className='flex flex-row border p-2 bg-gray-100'>
                      {/* Header */}
                        <div className='p-4 w-1/2'>    
                          <input className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="Branch Code" value={formData.str_list_id}
                              onChange={(e) => setFormData({ ...formData, str_list_id: e.target.value })}
                          />
                            {errors.str_list_id && <p className="error text-red-700 text-left ml-2">{errors.str_list_id[0]}</p>}

                          <input className=" mt-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="Branch Acronym" value={formData.acronym}
                              onChange={(e) => setFormData({ ...formData, acronym: e.target.value })}
                          />
                            {errors.acronym && <p className="error text-red-700 text-left ml-2">{errors.acronym[0]}</p>}

                          <select className='mt-4 form-select text-gray-800 bg-white text-sm px-4 w-full py-3 border border-gray-300 rounded-md outline-blue-500' onChange={(e) => setFormData({ ...formData, head_person: e.target.value })}>
                            <option value="">Select Employee</option>
                            {masterlist.map((rec, key) =>(
                            <option value={rec.id} key={key}>{rec.first_name + " " + rec.last_name}</option>
                            ))}
                          </select>
                          {errors.head_person && <p className="error text-red-700 text-left ml-2">{errors.head_person[0]}</p>}                      
                        </div>
                        <div className='p-4 w-1/2'>
                          <select className='form-select text-gray-800 bg-white text-sm px-4 w-full py-3 border border-gray-300 rounded-md outline-blue-500'
                            onChange={(e) => setFormData({ ...formData, branchtype_id: e.target.value })}>
                              <option value="">Select Branch Type</option>
                              {branchType.map((rec, key) =>(
                                <option value={rec.id} key={key}>{rec.type}</option>
                              ))}
                          </select>
                            {errors.branchtype_id && <p className="error text-red-700 text-left ml-2">{errors.branchtype_id[0]}</p>}                  

                          <input className="mt-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="Address" value={formData.str_list_address}
                              onChange={(e) => setFormData({ ...formData, str_list_address: e.target.value })}
                          />
                            {errors.str_list_address && <p className="error text-red-700 text-left ml-2">{errors.str_list_address[0]}</p>}

                          <input className=" mt-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="Contact Number" value={formData.contact_number}
                              onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
                          />
                            {errors.contact_number && <p className="error text-red-700 text-left ml-2">{errors.contact_number[0]}</p>}
                        </div>
                      </div>

                      {/* Published Rate */}
                      <div className='flex flex-col border bg-gray-100 p-3'>
                        <table cellPadding={6} className='text-sm w-2/4'>
                          <thead>
                            <tr>
                              <td className='flex text-left text-xl'>Published Rate</td>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className='text-left align-bottom'> 
                              <td>Per CBM:</td>
                              <td><input className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-3 w-full py-2 rounded-md outline-blue-500" type="text" placeholder="CBM Rate" value={formData.per_cbm}
                                onChange={(e) => setFormData({ ...formData, per_cbm: e.target.value })}
                              /></td>
                            </tr>
                            <tr className='text-left align-bottom'>
                              <td>Per Kilo:</td>
                              <td><input className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-3 w-full py-2 rounded-md outline-blue-500" type="text" placeholder="Kilo Rate" value={formData.per_kilo}
                                onChange={(e) => setFormData({ ...formData, per_kilo: e.target.value })}
                              /></td>
                            </tr>
                            <tr className='text-left align-bottom'>
                              <td>Value Charge:</td>
                              <td><input className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-3 w-full py-2 rounded-md outline-blue-500" type="text" placeholder="Value Charge" value={formData.val_charge}
                                onChange={(e) => setFormData({ ...formData, val_charge: e.target.value })}
                              /></td>
                            </tr>
                            <tr className='text-left align-bottom'>
                              <td>Minimum Charge:</td>
                              <td><input className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-3 w-full py-2 rounded-md outline-blue-500" type="text" placeholder="Minimum Charge" value={formData.min_charge}
                                onChange={(e) => setFormData({ ...formData, min_charge: e.target.value })}
                              /></td>
                            </tr>
                            <tr className='text-left align-bottom'>
                              <td>Advalorem:</td>
                              <td><input className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-3 w-full py-2 rounded-md outline-blue-500" type="text" placeholder="Advalorem" value={formData.advalorem}
                                onChange={(e) => setFormData({ ...formData, advalorem: e.target.value })}
                              /></td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      {/* FCL Rate */}
                      <div className='flex flex-col border bg-gray-100 p-3'>
                        <table cellPadding={6} className='text-sm w-3/4'>
                          <thead>
                            <tr>
                              <td className='flex text-left text-xl'>FCL Rate</td>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className='text-left align-bottom'> 
                              <td>FCL Value Charge:</td>
                              <td><input className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-3 w-full py-2 rounded-md outline-blue-500" type="text" placeholder="FCL Value Charge" value={formData.fcl_value_charge}
                                onChange={(e) => setFormData({ ...formData, fcl_value_charge: e.target.value })}
                              /></td>
                              <td></td>
                            </tr>
                            <tr className='text-left align-bottom'>
                              <td></td>
                              <td>Rates</td>
                              <td>DV Minimum</td>
                            </tr>
                            <tr className='text-left align-bottom'>
                              <td>10 ftr:</td>
                              <td><input className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-3 w-full py-2 rounded-md outline-blue-500" type="text" placeholder="10FTR Rates" value={formData.ftr10}
                                onChange={(e) => setFormData({ ...formData, ftr10: e.target.value })}
                              /></td>
                              <td><input className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-3 w-full py-2 rounded-md outline-blue-500" type="text" placeholder="10FTR DV Minimum" value={formData.ftr10_value}
                                onChange={(e) => setFormData({ ...formData, ftr10_value: e.target.value })}
                              /></td>
                            </tr>
                            <tr className='text-left align-bottom'>
                              <td>20 ftr:</td>
                              <td><input className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-3 w-full py-2 rounded-md outline-blue-500" type="text" placeholder="20FTR Rates" value={formData.ftr20}
                                onChange={(e) => setFormData({ ...formData, ftr20: e.target.value })}
                              /></td>
                              <td><input className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-3 w-full py-2 rounded-md outline-blue-500" type="text" placeholder="20FTR DV Minimum" value={formData.ftr20_value}
                                onChange={(e) => setFormData({ ...formData, ftr20_value: e.target.value })}
                              /></td>
                            </tr>
                            <tr className='text-left align-bottom'>
                              <td>40 ftr:</td>
                              <td><input className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-3 w-full py-2 rounded-md outline-blue-500" type="text" placeholder="40FTR Rates" value={formData.ftr40}
                                onChange={(e) => setFormData({ ...formData, ftr40: e.target.value })}
                              /></td>
                              <td><input className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-3 w-full py-2 rounded-md outline-blue-500" type="text" placeholder="40FTR DV Minimum" value={formData.ftr40_value}
                                onChange={(e) => setFormData({ ...formData, ftr40_value: e.target.value })}
                              /></td>
                            </tr>
                            <tr className='text-left align-bottom'>
                              <td>4 Wheeler:</td>
                              <td><input className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-3 w-full py-2 rounded-md outline-blue-500" type="text" placeholder="4 Wheeler Rates" value={formData.wheeler4}
                                onChange={(e) => setFormData({ ...formData, wheeler4: e.target.value })}
                              /></td>
                              <td><input className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-3 w-full py-2 rounded-md outline-blue-500" type="text" placeholder="4 Wheeler DV Minimum" value={formData.wheeler4_value}
                                onChange={(e) => setFormData({ ...formData, wheeler4_value: e.target.value })}
                              /></td>
                            </tr>
                            <tr className='text-left align-bottom'>
                              <td>6 Wheeler:</td>
                              <td><input className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-3 w-full py-2 rounded-md outline-blue-500" type="text" placeholder="6 Wheeler Rates" value={formData.wheeler6}
                                onChange={(e) => setFormData({ ...formData, wheeler6: e.target.value })}
                              /></td>
                              <td><input className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-3 w-full py-2 rounded-md outline-blue-500" type="text" placeholder="6 Wheeler DV Minimum" value={formData.wheeler6_value}
                                onChange={(e) => setFormData({ ...formData, wheeler6_value: e.target.value })}
                              /></td>
                            </tr>
                            <tr className='text-left align-bottom'>
                              <td>8 Wheeler:</td>
                              <td><input className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-3 w-full py-2 rounded-md outline-blue-500" type="text" placeholder="8 Wheeler Rates" value={formData.wheeler8}
                                onChange={(e) => setFormData({ ...formData, wheeler8: e.target.value })}
                              /></td>
                              <td><input className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-3 w-full py-2 rounded-md outline-blue-500" type="text" placeholder="8 Wheeler DV Minimum" value={formData.wheeler8_value}
                                onChange={(e) => setFormData({ ...formData, wheeler8_value: e.target.value })}
                              /></td>
                            </tr>
                            <tr className='text-left align-bottom'>
                              <td>10 Wheeler:</td>
                              <td><input className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-3 w-full py-2 rounded-md outline-blue-500" type="text" placeholder="10 Wheeler Rates" value={formData.wheeler10}
                                onChange={(e) => setFormData({ ...formData, wheeler10: e.target.value })}
                              /></td>
                              <td><input className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-3 w-full py-2 rounded-md outline-blue-500" type="text" placeholder="10 Wheeler DV Minimum" value={formData.wheeler10_value}
                                onChange={(e) => setFormData({ ...formData, wheeler10_value: e.target.value })}
                              /></td>
                            </tr>
                            <tr className='text-left align-bottom'>
                              <td>Freightliner:</td>
                              <td><input className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-3 w-full py-2 rounded-md outline-blue-500" type="text" placeholder="Freightliner Rates" value={formData.freightliner}
                                onChange={(e) => setFormData({ ...formData, freightliner: e.target.value })}
                              /></td>
                              <td><input className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-3 w-full py-2 rounded-md outline-blue-500" type="text" placeholder="Freightliner DV Minimum" value={formData.freightliner_value}
                                onChange={(e) => setFormData({ ...formData, freightliner_value: e.target.value })}
                              /></td>
                            </tr>
                            <tr className='text-left align-bottom'>
                              <td>Rolling Cargo:</td>
                              <td><input className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-3 w-full py-2 rounded-md outline-blue-500" type="text" placeholder="Rolling Cargo Rates" value={formData.rolling_cargo}
                                onChange={(e) => setFormData({ ...formData, rolling_cargo: e.target.value })}
                              /></td>
                              <td><input className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-3 w-full py-2 rounded-md outline-blue-500" type="text" placeholder="Rolling Cargo DV Minimum" value={formData.rolling_cargo_value}
                                onChange={(e) => setFormData({ ...formData, rolling_cargo_value: e.target.value })}
                              /></td>
                            </tr>    
                          </tbody>                   
                        </table>
                      </div>

                      {/* Air Freight Rate */}
                      <div className='flex flex-col border bg-gray-100 p-3'>
                        <table cellPadding={6} className='text-sm w-full'>
                          <thead>
                            <tr>
                              <td colSpan={4}><div className='flex text-left text-xl'>Air Freight Rate</div></td>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className='text-left align-bottom'> 
                              <td>Air Value Charge:</td>
                              <td><input className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-3 w-full py-2 rounded-md outline-blue-500" type="text" placeholder="Air Value Charge" value={formData.airvalue}
                                onChange={(e) => setFormData({ ...formData, airvalue: e.target.value })}
                              /></td>
                              <td></td>
                              <td></td>
                            </tr>
                            <tr className='text-left align-bottom'>
                              <td>WT Break</td>
                              <td>Express/Rate</td>
                              <td>Perishable/Rate</td>
                              <td>Gen. Cargo/Rate</td>
                            </tr>
                            <tr className='text-left align-bottom'>
                              <td>0 - 5 Kilos:</td>
                              <td><input className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-3 w-full py-2 rounded-md outline-blue-500" type="text" placeholder="0 - 5 Kilos Express/Rate"/></td>
                              <td><input className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-3 w-full py-2 rounded-md outline-blue-500" type="text" placeholder="0 - 5 Kilos Perishable/Rate"/></td>
                              <td><input className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-3 w-full py-2 rounded-md outline-blue-500" type="text" placeholder="0 - 5 Kilos Gen. Cargo/Rate"/></td>
                            </tr>
                            <tr className='text-left align-bottom'>
                              <td>6 - 49 Kilos:</td>
                              <td><input className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-3 w-full py-2 rounded-md outline-blue-500" type="text" placeholder="6 - 49 Kilos Express/Rate"/></td>
                              <td><input className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-3 w-full py-2 rounded-md outline-blue-500" type="text" placeholder="6 - 49 Kilos Perishable/Rate"/></td>
                              <td><input className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-3 w-full py-2 rounded-md outline-blue-500" type="text" placeholder="6 - 49 Kilos Gen. Cargo/Rate"/></td>
                            </tr>
                            <tr className='text-left align-bottom'>
                              <td>50 - 249 Kilos:</td>
                              <td><input className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-3 w-full py-2 rounded-md outline-blue-500" type="text" placeholder="50 - 249 Kilos Express/Rate"/></td>
                              <td><input className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-3 w-full py-2 rounded-md outline-blue-500" type="text" placeholder="50 - 249 Kilos Perishable/Rate"/></td>
                              <td><input className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-3 w-full py-2 rounded-md outline-blue-500" type="text" placeholder="50 - 249 Kilos Gen. Cargo/Rate"/></td>
                            </tr>
                            <tr className='text-left align-bottom'>
                              <td>250 - Up Kilos:</td>
                              <td><input className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-3 w-full py-2 rounded-md outline-blue-500" type="text" placeholder="250 - Up Kilos Express/Rate"/></td>
                              <td><input className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-3 w-full py-2 rounded-md outline-blue-500" type="text" placeholder="250 - Up Kilos Perishable/Rate"/></td>
                              <td><input className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-3 w-full py-2 rounded-md outline-blue-500" type="text" placeholder="250 - Up Kilos Gen. Cargo/Rate"/></td>
                            </tr>    
                          </tbody>
                        </table>
                      </div>

                      {/* Documents Rate */}
                      <div className='flex flex-col border bg-gray-100 p-3'>
                        <table cellPadding={6} className='text-sm w-4/6 mb-4'>
                          <thead>
                            <tr>
                              <td colSpan={4}><div className='flex text-left text-xl'>Documents Rate</div>
                              <p className='text-left'><i>(min. of 5 pieces per pick up)</i></p>
                              </td>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className='text-left align-bottom'> 
                              <td>Small</td>
                              <td><input className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-3 w-full py-2 rounded-md outline-blue-500" type="text" placeholder="Small Rate" value={formData.small_rate}
                                onChange={(e) => setFormData({ ...formData, small_rate: e.target.value })}
                              /></td>
                            </tr>
                            <tr className='text-left align-bottom'>
                              <td>Medium</td>
                              <td><input className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-3 w-full py-2 rounded-md outline-blue-500" type="text" placeholder="Medium Rate" value={formData.medium_rate}
                                onChange={(e) => setFormData({ ...formData, medium_rate: e.target.value })}
                              /></td>
                            </tr>
                            <tr className='text-left align-bottom'>
                              <td>Large <i>(max of 2kg.)</i></td>
                              <td><input className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-3 w-full py-2 rounded-md outline-blue-500" type="text" placeholder="Large Charge" value={formData.large_rate}
                                onChange={(e) => setFormData({ ...formData, large_rate: e.target.value })}
                              /></td>
                            </tr>
                            <tr className='text-left align-bottom'>
                              <td className='whitespace-nowrap'>Non - Documents Rate<p className='text-left'><i>(Three kilos and Below with Commercial Value)</i></p></td>
                              <td></td>
                            </tr>
                            <tr className='text-left align-bottom'>
                              <td>Parcel Rate:</td>
                              <td><input className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-3 w-full py-2 rounded-md outline-blue-500" type="text" placeholder="Parcel Rate" value={formData.parcel_rate}
                                onChange={(e) => setFormData({ ...formData, parcel_rate: e.target.value })}
                              /></td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      <div className="!mt-8 float-right">
                        <button className="primary-btn py-3 px-4 text-sm tracking-wider font-semibold rounded-md text-white bg-gray-800 hover:bg-gray-600 focus:outline-none"> Add Branch </button>
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
      title="Add Branch Record"
      body="Branch Record successfully added!"
      okConfirm={closeCreate}
      /> 
    }

    </>
  )
};
