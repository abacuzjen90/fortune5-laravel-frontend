import { Dialog, DialogBackdrop, DialogPanel } from '@headlessui/react';
import { useContext, useEffect, useState} from "react";
import { AppContext } from "../../context/AppContext";
import { Link } from 'react-router-dom';
import InfoBox from "../../assets/components/InfoBox";
import ConfirmBox from "../../assets/components/DeleteBox";
import UpdateBox from "../../assets/components/UpdateBox";
import { MdAdd } from "react-icons/md";
import { FaRegTrashAlt, FaRegEdit, FaUserEdit, FaUserPlus } from "react-icons/fa";
import Pagination from '../../assets/components/Pagination';
import TableSort from '../../assets/components/TableSort';
import LoadingBox from '../../assets/components/Loading';
import sortData from '../../assets/components/sortData';
import useScreenSize from "../../assets/components/useScreenSize";

export default function Destination() {

  const [openAddDial, setOpenAddDial] = useState(false);
  const [openUpdateDial, setOpenUpdateDial] = useState(false);
  const [open, setOpen] = useState(false);
  const { token } = useContext(AppContext);
  const [showLoading, setShowLoading] = useState(false);
  const isLoading = () => {setShowLoading(true)};
  const stopLoading = () => {setShowLoading(false)};
  const [status, setStatus] = useState(0);
  const [destination, setDestination] = useState([]);
  const [id, setId] = useState(null);
  const isMediumScreen = useScreenSize(768);

  //Table Pagination, Search
  const [sortdata, setSortdata] = useState([]);
  const [sorting, setSorting] = useState({ key: "", ascending: true });
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageCount, setPageCount] = useState(0);
  const [dataPerPage, setDataperpage] = useState(10);

  const [formData, setFormData] = useState({
    destination: "", rate_cbm: "", rate_kilo: "", value_charge: "", advalorem: "", minimum: "", encoder: "",
  });

  const [errors, setErrors] = useState({});

  const changePage = (i) => {
    setCurrentPage(i);
    const startItem = (i - 1) * dataPerPage;
    setSortdata(destination.slice(startItem, startItem + dataPerPage));
  };

  const handleChange = (value) => {
    changePage(value);
  };


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
  
  // Get Destination List
  async function getDestination() {
    isLoading();
    const res = await fetch("/api/destination");
    const data = await res.json();
    if(res.ok) {
      setDestination(data);
      setPageCount(Math.ceil(data.length / dataPerPage));
      setSortdata(data.slice(0, dataPerPage));
      stopLoading();
    }
  }

  useEffect(() => {
    getDestination();
  }, [dataPerPage]);


  // Add Destination
  async function handleCreate(e) {
    e.preventDefault();
    const res = await fetch("/api/destination", {
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
      getDestination();
    }
  }

  async function closeCreate() {
    setOpen(false);
    setOpenAddDial(false);
  }

  // Get Destination
  async function getDestinationUpdate(id) {
    setFormData({});
    isLoading();
    if(id){
      const res = await fetch(`/api/destination/${id}`);
      const data = await res.json();
      console.log(data);
      if(res.ok) {
        setFormData({
          id: data[0].id,
          destination: data[0].destination,
          rate_cbm: data[0].rate_cbm,
          rate_kilo: data[0].rate_kilo,
          value_charge: data[0].value_charge,
          minimum: data[0].minimum,
          advalorem: data[0].advalorem,
        });
      }
    }
    stopLoading();
  }
  useEffect(() => {
    getDestinationUpdate();
  }, []);


  //Update Destination
  async function openUpdate(id) {
    setOpen(true);
    setStatus(3);
    setId(id);
  }

  async function handleUpdate(e) {
    e.preventDefault();
    const res = await fetch(`/api/destination/${id}`, {
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
      getDestination();
    }
  }

  async function closeUpdate() {
    setOpen(false);
    setOpenUpdateDial(false);
  }


  //Delete Destination
  async function openDelete(id) {
    setOpen(true);
    setStatus(2);
    setId(id);
  }

  async function handleDelete(e) {
    e.preventDefault();
      const res = await fetch(`/api/destination/${id}`, {
        method: "delete",
        headers: {
            Authorization: `Bearer ${token}`,
        }
      });
      const data = await res.json();
      console.log(data);
      if(res.ok) {
        setStatus(5);
        getDestination();
      }
  }

  async function closeDelete() {
    setOpen(false);
  }

  return (
    <> 
    <div className="flex items-center font-medium border-b border-slate-300 w-full">
      <main className="px-4 flex-1 mx-auto py-4"><h1>Maintenance - Destination</h1></main>
    </div>
    <div className="flex items-center font-medium flex-1 mx-auto py-4 ">
      <main className="flex-1 mx-auto p-4">
        <div className="mx-auto">
          <div className="bg-gray-50 shadow-md border">
            <div className="p-6 text-gray-900 dark:text-gray-100">
              <div className="text-left caption-top dark:text-gray-800">
                <div className="flex flex-row py-2">
                  <div className="flex w-full"><h1>Destination</h1></div>
                    <div className="flex mb-3">
                      <button type="button" onClick={() => {setOpenAddDial(true); setFormData({}); setErrors(false)}} className="h-fit flex flex-row primary-btn py-3 px-5 text-sm tracking-wider font-semibold rounded-md text-white bg-gray-800 hover:bg-gray-600 focus:outline-none"><MdAdd size={20} className="mr-2"/>Add&nbsp;Destination</button>
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
                  {/* {message && <p className="error opacity-100 delay-300 text-blue-700 text-left ml-2">{message}</p>} */}
                    <thead className="text-xs text-center uppercase bg-gray-200 text-gray-800 border-b border-t border-gray-300">
                      <tr className="text-nowrap">
                      <th className="px-3 py-3">
                        <TableSort title="No." field="id" sorteddata={sortdata} setSorteddata={setSortdata} sorting={sorting} setSorting={setSorting} />
                      </th>
                      <th className="px-3 py-3">
                        <TableSort title="Destination" field="destination" sorteddata={sortdata} setSorteddata={setSortdata} sorting={sorting} setSorting={setSorting} />
                      </th>
                      <th className="px-3 py-3">
                        <TableSort title="Rate CBM" field="rate_cbm" sorteddata={sortdata} setSorteddata={setSortdata} sorting={sorting} setSorting={setSorting} />
                      </th>
                      <th className="px-3 py-3">
                        <TableSort title="Rate Kilo" field="rate_kilo" sorteddata={sortdata} setSorteddata={setSortdata} sorting={sorting} setSorting={setSorting} />
                      </th>
                      <th className="px-3 py-3">
                        <TableSort title="Value Charge" field="value_charge" sorteddata={sortdata} setSorteddata={setSortdata} sorting={sorting} setSorting={setSorting} />
                      </th>
                      <th className="px-3 py-3">
                        <TableSort title="Minimum" field="minimum" sorteddata={sortdata} setSorteddata={setSortdata} sorting={sorting} setSorting={setSorting} />
                      </th>
                      <th className="px-3 py-3">
                        <TableSort title="Advalorem" field="advalorem" sorteddata={sortdata} setSorteddata={setSortdata} sorting={sorting} setSorting={setSorting} />
                      </th>
                      <th className="px-3 py-3">
                        <TableSort title="Encoder" field="encoder" sorteddata={sortdata} setSorteddata={setSortdata} sorting={sorting} setSorting={setSorting} />
                      </th>
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
                          <td className="px-3 py-3">{rec.destination}</td>
                          <td className="px-3 py-3">{rec.rate_cbm ? rec.rate_cbm : "-"}</td>
                          <td className="px-3 py-3">{rec.rate_kilo ? rec.rate_kilo : "-"}</td>
                          <td className="px-3 py-3">{rec.value_charge ? rec.value_charge : "-"}</td>
                          <td className="px-3 py-3">{rec.minimum ? rec.minimum : "-"}</td>
                          <td className="px-3 py-3">{rec.advalorem ? rec.advalorem : "-"}</td>
                          <td className="px-3 py-3">{rec.encoder}</td>
                          <td>
                          <button onClick={() => {getDestinationUpdate(rec.id); setOpenUpdateDial(true); setErrors(false)}} className="primary-btn text-sm tracking-wider font-semibold rounded-md">
                          <FaRegEdit size={20} className="mr-2 text-green-600"/></button>
                            <button onClick={() => openDelete(rec.id)} className="primary-btn text-sm tracking-wider font-semibold rounded-md">
                              <FaRegTrashAlt size={20} className="text-red-600"/></button>
                          </td>
                          
                        </tr>
                    ))) : (
                      <tr className='text-xs bg-white border-b dark:bg-gray-100 dark:border-gray-300'>
                        <td className='px-3 py-3 text-center' colSpan={9}>Loading...</td>
                      </tr>
                    )}
                     </tbody>                        
                  </table>
                </div> 
                <Pagination dataSize={destination.length} dataPPage={dataPerPage} nPages={pageCount} currentPage={currentPage} setCurrentPage={handleChange} />
            </div>
          </div>
        </div>  
      </main> 
    </div>

    {/* Add Destination */}
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
                    <h1 className="text-2xl text-left pb-6 flex"><FaUserPlus size={30} className='mr-1'/> Add Destination Record </h1>
                    
                    <form onSubmit={handleCreate} className='w-full mx-auto space-y-6'>
                      <div className='flex flex-row border p-2 bg-gray-100'>
                        <div className='w-full p-4'>
                          <input className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="Destination" value={formData.destination}
                              onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                          />
                            {errors.destination && <p className="error text-red-700 text-left ml-2">{errors.destination[0]}</p>}

                          <input className="mt-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="Rate/CBM" value={formData.rate_cbm}
                              onChange={(e) => setFormData({ ...formData, rate_cbm: e.target.value })}
                          />
                            {errors.rate_cbm && <p className="error text-red-700 text-left ml-2">{errors.rate_cbm[0]}</p>}

                          <input className="mt-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="Rate/Kilo" value={formData.rate_kilo}
                              onChange={(e) => setFormData({ ...formData, rate_kilo: e.target.value })}
                          />
                            {errors.rate_kilo && <p className="error text-red-700 text-left ml-2">{errors.rate_kilo[0]}</p>}

                          <input className="mt-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="Declared Value Charge / Php 1,000.00" value={formData.value_charge}
                              onChange={(e) => setFormData({ ...formData, value_charge: e.target.value })}
                          />
                            {errors.value_charge && <p className="error text-red-700 text-left ml-2">{errors.value_charge[0]}</p>}

                          <input className="mt-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="Customer Minimum" value={formData.minimum}
                              onChange={(e) => setFormData({ ...formData, minimum: e.target.value })}
                          />
                            {errors.minimum && <p className="error text-red-700 text-left ml-2">{errors.minimum[0]}</p>}

                          <input className="mt-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="Advalorem" value={formData.advalorem}
                              onChange={(e) => setFormData({ ...formData, advalorem: e.target.value })}
                          />
                          {errors.advalorem && <p className="error text-red-700 text-left ml-2">{errors.advalorem[0]}</p>}
                        </div>          
                      </div>
                        <div className="!mt-8 float-right">
                          <button className="primary-btn py-3 px-4 text-sm tracking-wider font-semibold rounded-md text-white bg-gray-800 hover:bg-gray-600 focus:outline-none"> Add Destination </button>
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

    {/* Update Destination */}
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
                    <h1 className="text-2xl text-left pb-6 flex"><FaUserEdit size={30} className='mr-1'/> Update Destination Record </h1>
                    
                      <div className='flex flex-row border p-2 bg-gray-100'>
                        <div className='w-full text-left p-4'>
                          <p>Destination ID:</p>
                          <input className="mb-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" disabled value={formData.id} onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                          />

                          <p>Destination:</p>
                          <input className="mb-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="Destination" value={formData.destination}
                              onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                          />
                            {errors.destination && <p className="error text-red-700 text-left ml-2">{errors.destination[0]}</p>}

                            <p>Rate/CBM:</p>
                          <input className="mb-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="Rate/CBM" value={formData.rate_cbm}
                              onChange={(e) => setFormData({ ...formData, rate_cbm: e.target.value })}
                          />
                            {errors.rate_cbm && <p className="error text-red-700 text-left ml-2">{errors.rate_cbm[0]}</p>}

                            <p>Rate/Kilo:</p>
                          <input className="mb-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="Rate/Kilo" value={formData.rate_kilo}
                              onChange={(e) => setFormData({ ...formData, rate_kilo: e.target.value })}
                          />
                            {errors.rate_kilo && <p className="error text-red-700 text-left ml-2">{errors.rate_kilo[0]}</p>}

                            <p>Declared Value Charge / Php 1,000.00:</p>
                          <input className="mb-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="Declared Value Charge / Php 1,000.00" value={formData.value_charge}
                              onChange={(e) => setFormData({ ...formData, value_charge: e.target.value })}
                          />
                            {errors.value_charge && <p className="error text-red-700 text-left ml-2">{errors.value_charge[0]}</p>}

                          <p>Customer Minimum:</p>
                          <input className="mb-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="Customer Minimum" value={formData.minimum}
                              onChange={(e) => setFormData({ ...formData, minimum: e.target.value })}
                          />
                            {errors.minimum && <p className="error text-red-700 text-left ml-2">{errors.minimum[0]}</p>}

                          <p>Advalorem:</p>
                          <input className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="Advalorem" value={formData.advalorem}
                              onChange={(e) => setFormData({ ...formData, advalorem: e.target.value })}
                          />
                          {errors.advalorem && <p className="error text-red-700 text-left ml-2">{errors.advalorem[0]}</p>}
                        </div>          
                      </div>
                        <div className="!mt-8 float-right">
                          <button onClick={() => openUpdate(formData.id)} className="primary-btn py-3 px-4 text-sm tracking-wider font-semibold rounded-md text-white bg-gray-800 hover:bg-gray-600 focus:outline-none"> Update Destination </button>
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
      body="Destination successfully added!"
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
