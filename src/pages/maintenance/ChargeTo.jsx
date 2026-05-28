import { Dialog, DialogBackdrop, DialogPanel } from '@headlessui/react';
import { useContext, useEffect, useState} from "react";
import { AppContext } from "../../context/AppContext";
import { Link } from 'react-router-dom';
import InfoBox from "../../assets/components/InfoBox";
import ConfirmBox from "../../assets/components/DeleteBox";
import UpdateBox from "../../assets/components/UpdateBox";
import { MdAdd } from "react-icons/md";
import { FaRegTrashAlt, FaRegEdit, FaUserPlus, FaUserEdit } from "react-icons/fa";
import Pagination from '../../assets/components/Pagination';
import TableSort from '../../assets/components/TableSort';
import sortData from '../../assets/components/sortData';
import LoadingBox from '../../assets/components/Loading';
import useScreenSize from "../../assets/components/useScreenSize";

export default function ChargeTo() {

  const [openAddDial, setOpenAddDial] = useState(false);
  const [openUpdateDial, setOpenUpdateDial] = useState(false);
  const [open, setOpen] = useState(false);
  const { token } = useContext(AppContext);
  const [showLoading, setShowLoading] = useState(false);
  const isLoading = () => {setShowLoading(true)};
  const stopLoading = () => {setShowLoading(false)};
  const [status, setStatus] = useState(0);
  const [chargeto, setChargeto] = useState([]);
  const [id, setId] = useState(null);
  const [branch, setBranch] = useState([]);
  const isMediumScreen = useScreenSize(768);

  //Table Pagination, Search
  const [sortdata, setSortdata] = useState([]);
  const [sorting, setSorting] = useState({ key: "", ascending: true });
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageCount, setPageCount] = useState(0);
  const [dataPerPage, setDataperpage] = useState(10);

  const [formData, setFormData] = useState({
    payer_name: "", branch: "", address: "", mobile_number: "", contact_person: "", remarks: "",
  });

  const [errors, setErrors] = useState({});

  const changePage = (i) => {
    setCurrentPage(i);
    const startItem = (i - 1) * dataPerPage;
    setSortdata(chargeto.slice(startItem, startItem + dataPerPage));
  };

  const handleChange = (value) => {
    changePage(value);
  };

  //Search
  async function searchTable() {
    const filtered = chargeto.filter(rec => 
      rec.payer_name.toLowerCase().includes(search.toLowerCase()) ||
      rec.branch.toLowerCase().includes(search.toLowerCase())
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

  
  // Get Charge To List
  async function getChargeTo() {
    isLoading();
    const res = await fetch("/api/chargeto");
    const data = await res.json();
    if(res.ok) {
      setChargeto(data);
      setPageCount(Math.ceil(data.length / dataPerPage));
      setSortdata(data.slice(0, dataPerPage));
      stopLoading();
    }
  }

  useEffect(() => {
    getChargeTo();
  }, [dataPerPage]);


  // Add Designation
  async function handleCreate(e) {
    e.preventDefault();
    const res = await fetch("/api/chargeto", {
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
      getChargeTo();
    }
  }

  async function closeCreate() {
    setOpen(false);
    setOpenAddDial(false);
  }

  // Get Charge To
  async function getChargetoUpdate(id) {
    setFormData({});
    if(id){
      const res = await fetch(`/api/chargeto/${id}`);
      const data = await res.json();
      if(res.ok) {
        setFormData({
          id: data[0].id,
          payer_name: data[0].payer_name,
          branch: data[0].branch,
          address: data[0].address,
          mobile_number: data[0].mobile_number,
          contact_person: data[0].contact_person,
          remarks: data[0].remarks,
        });
      }
    }
  }
  useEffect(() => {
    getChargetoUpdate();
  }, []);


  //Update Charge To
  async function openUpdate(id) {
    setOpen(true);
    setStatus(3);
    setId(id);
  }

  async function handleUpdate(e) {
    e.preventDefault();
    const res = await fetch(`/api/chargeto/${id}`, {
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
      setStatus(4);
      getChargeTo();
    }
  }

  async function closeUpdate() {
    setOpen(false);
    setOpenUpdateDial(false);
  }


  //Delete Charge To
  async function openDelete(id) {
    setOpen(true);
    setStatus(2);
    setId(id);
  }

  async function handleDelete(e) {
    e.preventDefault();
      const res = await fetch(`/api/chargeto/${id}`, {
        method: "delete",
        headers: {
            Authorization: `Bearer ${token}`,
        }
      });
      const data = await res.json();
      console.log(data);
      if(res.ok) {
        setStatus(5);
        getChargeTo();
      }
  }

  async function closeDelete() {
    setOpen(false);
  }

  return (
    <> 
    <div className="flex items-center font-medium border-b border-slate-300 w-full">
      <main className="ml-10 flex-1 mx-auto py-4"><h1>Maintenance - Charge To</h1></main>
    </div>
    <div className="flex items-center font-medium flex-1 mx-auto py-4 ">
      <main className="flex-1 mx-auto p-4">
        <div className="mx-auto">
          <div className="bg-gray-50 shadow-md border">
            <div className="p-6 text-gray-900 dark:text-gray-100">
              <div className="text-left caption-top dark:text-gray-800">
                <div className="flex flex-row py-2">
                  <div className="flex w-full"><h1>Charge To</h1></div>
                    <div className="flex mb-3">
                      <button type="button" onClick={() => {setOpenAddDial(true); setFormData({}); setErrors(false)}} className="h-fit flex flex-row primary-btn py-3 px-5 text-sm tracking-wider font-semibold rounded-md text-white bg-gray-800 hover:bg-gray-600 focus:outline-none"><MdAdd size={20}/>Add&nbsp;Charge&nbsp;To</button>
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
                  <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-center uppercase bg-gray-200 text-gray-800 border-b border-t border-gray-300">
                      <tr className="text-nowrap">
                      <th className="px-3 py-3">
                        <TableSort sortdata={sortdata} title="No." field="id" sorteddata={sortdata} setSorteddata={setSortdata} sorting={sorting} setSorting={setSorting} />
                      </th>
                      <th className="px-3 py-3">
                        <TableSort sortdata={sortdata} title="Charge To" field="payer_name" sorteddata={sortdata} setSorteddata={setSortdata} sorting={sorting} setSorting={setSorting} />
                      </th>
                      <th className="px-3 py-3">
                        <TableSort sortdata={sortdata} title="Branch" field="branch" sorteddata={sortdata} setSorteddata={setSortdata} sorting={sorting} setSorting={setSorting} />
                      </th>
                      <th className="px-3 py-3">Address</th>
                      <th className="px-3 py-3">Mobile Number</th>
                      <th className="px-3 py-3">Contact Person</th>
                      <th className="px-3 py-3">Remarks</th>
                      <th className="px-3 py-3">Action</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm text-center bg-gray-50 dark:bg-gray-700 dark:text-gray-800 border-b-2 border-gray-300">
                    {sortdata.length > 0 ? (sortdata.map(rec => (
                      <tr className="text-xs bg-white border-b dark:bg-gray-100 dark:border-gray-300 hover:bg-gray-50" key={rec.id}>     
                          <th className="px-3 py-3">
                            <Link className="font-medium text-blue-600 dark:text-blue-500 hover:underline mx-1">{rec.id}
                            </Link>
                          </th>
                          <td className="px-3 py-3">{rec.payer_name}</td>
                          <td className="px-3 py-3">{rec.branch}</td>
                          <td className="px-3 py-3">{rec.address}</td>
                          <td className="px-3 py-3">{rec.mobile_number}</td>
                          <td className="px-3 py-3">{rec.contact_person}</td>
                          <td className="px-3 py-3">{rec.remarks}</td>
                          <td>
                          <button onClick={() => {getChargetoUpdate(rec.id); setOpenUpdateDial(true); setErrors(false)}} className="primary-btn text-sm tracking-wider font-semibold rounded-md">
                          <FaRegEdit size={20} className="mr-2 text-green-600"/></button>
                            <button onClick={() => openDelete(rec.id)} className="primary-btn text-sm tracking-wider font-semibold rounded-md">
                              <FaRegTrashAlt size={20} className="text-red-600"/></button>
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
                <Pagination dataSize={chargeto.length} dataPPage={dataPerPage} nPages={pageCount} currentPage={currentPage} setCurrentPage={handleChange} />
            </div>
          </div>
        </div>  
      </main> 
    </div>

    {/* Add Charge To */}
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
                    <h1 className="text-2xl text-left pb-6 flex"><FaUserPlus size={30} className='mr-1'/> Add Charge To Record </h1>
                    
                    <form onSubmit={handleCreate} className='w-full mx-auto space-y-6'>
                      <div className='flex flex-row border p-2 bg-gray-100'>
                        <div className='w-full p-4'>
                          <input className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="Charge To" value={formData.payer_name}
                              onChange={(e) => setFormData({ ...formData, payer_name: e.target.value })}
                          />
                            {errors.payer_name && <p className="error text-red-700 text-left ml-2">{errors.payer_name[0]}</p>}

                          <select className='mt-4 form-select bg-white text-sm px-3 w-full py-3 border border-gray-300 rounded-md outline-blue-500' onChange={(e) => setFormData({ ...formData, branch: e.target.value })}>
                          <option value="">Branch Address</option>
                          {Object.keys(branchOptions).map((type) => (
                            <optgroup label={type} key={type}>
                              {branchOptions[type].map(({str_list_id}) => (
                                <option key={str_list_id}>{str_list_id}</option>
                              ))}
                            </optgroup>
                          ))}
                          </select>
                          {errors.branch && <p className="error text-red-700 text-left ml-2">{errors.branch[0]}</p>}

                          <input className="mt-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="Address" value={formData.address}
                              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                          />
                            {errors.address && <p className="error text-red-700 text-left ml-2">{errors.address[0]}</p>}

                          <input className="mt-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="Mobile Number" value={formData.mobile_number}
                              onChange={(e) => setFormData({ ...formData, mobile_number: e.target.value })}
                          />
                            {errors.mobile_number && <p className="error text-red-700 text-left ml-2">{errors.mobile_number[0]}</p>}

                          <input className="mt-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="Contact Person" value={formData.contact_person}
                              onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                          />
                            {errors.contact_person && <p className="error text-red-700 text-left ml-2">{errors.contact_person[0]}</p>}

                          <input className="mt-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="Remarks" value={formData.remarks}
                              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                          />
                            {errors.remarks && <p className="error text-red-700 text-left ml-2">{errors.remarks[0]}</p>}
                        </div>          
                      </div>
                        <div className="!mt-8 float-right">
                          <button className="primary-btn py-3 px-4 text-sm tracking-wider font-semibold rounded-md text-white bg-gray-800 hover:bg-gray-600 focus:outline-none"> Add Charge To </button>
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

    {/* Update Charge To */}
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
                    <h1 className="text-2xl text-left pb-6 flex"><FaUserEdit size={30} className='mr-1'/> Update Charge To Record </h1>
                    
                    <div className='flex flex-row border p-2 bg-gray-100'>
                      <div className='w-full text-left p-4'>
                        <p>ID No.:</p>
                        <input className="mb-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" disabled type="text" placeholder="Charge To" value={formData.id}
                            onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                        />

                        <p>Charge To:</p>
                        <input className="mb-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="Charge To" value={formData.payer_name}
                            onChange={(e) => setFormData({ ...formData, payer_name: e.target.value })}
                        />
                          {errors.payer_name && <p className="error text-red-700 text-left ml-2">{errors.payer_name[0]}</p>}

                        <p>Branch Address:</p>
                        <select className='mb-4 form-select bg-white text-sm px-3 w-full py-3 border border-gray-300 rounded-md outline-blue-500' onChange={(e) => setFormData({ ...formData, branch: e.target.value })}>
                        <option value="">{formData.branch}</option>
                        {Object.keys(branchOptions).map((type) => (
                          <optgroup label={type} key={type}>
                            {branchOptions[type].map(({str_list_id}) => (
                              <option key={str_list_id}>{str_list_id}</option>
                            ))}
                          </optgroup>
                        ))}
                        </select>
                        {errors.branch && <p className="error text-red-700 text-left ml-2">{errors.branch[0]}</p>}

                        <p>Address:</p>
                        <input className="mb-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="Address" value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        />
                          {errors.address && <p className="error text-red-700 text-left ml-2">{errors.address[0]}</p>}

                        <p>Mobile Number:</p>
                        <input className="mb-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="Mobile Number" value={formData.mobile_number}
                            onChange={(e) => setFormData({ ...formData, mobile_number: e.target.value })}
                        />
                          {errors.mobile_number && <p className="error text-red-700 text-left ml-2">{errors.mobile_number[0]}</p>}

                        <p>Contact Person:</p>
                        <input className="mb-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="Contact Person" value={formData.contact_person}
                            onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                        />
                          {errors.contact_person && <p className="error text-red-700 text-left ml-2">{errors.contact_person[0]}</p>}

                        <p>Remarks:</p>
                        <input className="mb-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="Remarks" value={formData.remarks}
                            onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                        />
                          {errors.remarks && <p className="error text-red-700 text-left ml-2">{errors.remarks[0]}</p>}
                      </div>          
                    </div>
                        <div className="!mt-8 float-right">
                          <button onClick={() => openUpdate(formData.id)} className="primary-btn py-3 px-4 text-sm tracking-wider font-semibold rounded-md text-white bg-gray-800 hover:bg-gray-600 focus:outline-none"> Update Charge To </button>
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
    
    <LoadingBox open={showLoading} onClose={stopLoading} setOpen={stopLoading} />

    {status === 1 &&  <InfoBox open={open} setOpen={setOpen} onClose={setOpen}
      title="Confirm Success"
      body="Charge To successfully added!"
      okConfirm={closeCreate}
      /> 
    }

    {status === 2 &&  <ConfirmBox open={open} setOpen={setOpen}
      title="Confirm Delete"
      body="Are you sure you want to delete this charge to?"
      okConfirm={handleDelete}
      /> 
    }

    {status === 3 && <UpdateBox open={open} setOpen={setOpen}
      title="Confirm Update"
      body="Are you sure you want to update this charge to?"
      okConfirm={handleUpdate}
      /> 
    }

    {status === 4 &&  <InfoBox open={open} setOpen={setOpen} onClose={setOpen}
      title="Confirm Success"
      body="Charge To successfully updated!"
      okConfirm={closeUpdate}
      /> 
    }

    {status === 5 &&  <InfoBox open={open} setOpen={setOpen} onClose={setOpen}
      title="Confirm Success"
      body="Charge to successfully deleted!"
      okConfirm={closeDelete}
      /> 
    }
    
    </>
  )
};
