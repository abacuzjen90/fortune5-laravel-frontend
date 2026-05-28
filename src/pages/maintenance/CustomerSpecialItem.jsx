import { useContext, useEffect, useState} from "react";
import { AppContext } from "../../context/AppContext";
import { useNavigate, useParams } from 'react-router-dom';
import Pagination from '../../assets/components/Pagination';
import TableSort from '../../assets/components/TableSort';
import sortData from '../../assets/components/sortData';
import { MdAdd } from "react-icons/md";
import useScreenSize from "../../assets/components/useScreenSize";
import LoadingBox from "../../assets/components/Loading";
import { Dialog, DialogBackdrop, DialogPanel } from '@headlessui/react';
import InfoBox from "../../assets/components/InfoBox";
import DeleteBox from "../../assets/components/DeleteBox";

import { FaRegTrashAlt, FaRegEdit, FaUserPlus, FaUserEdit } from "react-icons/fa";

export default function SpecialItem() { 
  const { id } = useParams();
  const { token } = useContext(AppContext);
  const navigate = useNavigate();
  const [openAddDial, setOpenAddDial] = useState(false);
  const [openUpdateDial, setOpenUpdateDial] = useState(false);
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState(0);
  const [customer, setCustomer] = useState([]);
  const [specialItem, setSpecialItem] = useState([]);
  const isMediumScreen = useScreenSize(768);
  const [showLoading, setShowLoading] = useState(false);
  const isLoading = () => {setShowLoading(true)};
  const stopLoading = () => {setShowLoading(false)};
  const [accountType, setAccountType] = useState(null);


  //Table Pagination, Search
  const [sortdata, setSortdata] = useState([]);
  const [sorting, setSorting] = useState({ key: "", ascending: true });
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageCount, setPageCount] = useState(0);
  const [dataPerPage, setDataperpage] = useState(10);

  const [formData, setFormData] = useState({
    id: "", customer_id: "", consignee_id: "", special_item: "",
    rate_php: 0, unit: "", length: 0, width: 0, height: 0,
    cbm: 0, kilo: 0, value_charge: 0, account_type: "",
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
    const filtered = specialItem.filter(rec => 
      rec.special_item.toLowerCase().includes(search.toLowerCase()) ||
      rec.unit.toLowerCase().includes(search.toLowerCase())
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
  async function getCustomer() {
    const res = await fetch(`/api/customer/${id}`);
    const data = await res.json();
    console.log(data);
    if(res.ok) {
      setAccountType(data[0].account_type);
    }
  }
  useEffect(() => {
    getCustomer();
  }, []);


  // Get Special Item
  async function getSpecialItem() { 
    isLoading();
    const res = await fetch(`/api/getspecialitem/${id}`, {
      method: "get",  
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    console.log(data);
    if(res.ok) {
      setSpecialItem(data);
      setPageCount(Math.ceil(data.length / dataPerPage));
      setSortdata(data.slice(0, dataPerPage));
      stopLoading();
    }
  }
  useEffect(() => {
    getSpecialItem();
  }, [dataPerPage]);


  // Add Special Item
  async function handleCreate(e) {
    e.preventDefault();
    formData.customer_id = id;
    formData.consignee_id = 0;
    const acctype = accountType ? (accountType === "Collect" ? "Collect" : "Account") : "Branch";
    console.log(acctype);
    formData.account_type = acctype;
    const res = await fetch("/api/specialitem", {
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
      setErrors(false);
    }
  }

  async function closeCreate() {
    setOpen(false);
    setOpenAddDial(false);
    getSpecialItem();
  }

  // Get Special Item
  async function getSpecialItemUpdate(itemId) {
    setFormData({});
    if(itemId){
      const res = await fetch(`/api/specialitem/${itemId}`);
      const data = await res.json();
      console.log(data);
      if(res.ok) {
        setFormData({
          id: data.id || "",
          special_item: data.special_item || "",
          rate_php: data.rate_php ?? 0,
          unit: data.unit || "",
          length: data.length ?? 0,
          width: data.width ?? 0,
          height: data.height ?? 0,
          cbm: data.cbm ?? 0,
          kilo: data.kilo ?? 0,
          value_charge: data.value_charge ?? 0,
        });
      }
    }
  }
  useEffect(() => {
    getSpecialItemUpdate();
  }, []);


  //Update Special Item
  async function updateSpecialItem(id) {
    console.log(id);
    const res = await fetch(`/api/specialitem/${id}`, {
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
      setOpen(true);
      setFormData({});
    }
  }

  async function closeUpdate() {
    setOpen(false);
    setOpenUpdateDial(false);
    getSpecialItem();
  }

  //Delete Special Item
  async function deleteSpecialItem(id) {
      const res = await fetch(`/api/specialitem/${id}`, {
        method: "delete",
        headers: {
            Authorization: `Bearer ${token}`,
        }
      });
      const data = await res.json();
      console.log(data);
      if(res.ok) {
        setOpen(true);
        setStatus(3);
        getSpecialItem();
      }
  }

  async function closeDelete() {
    setOpen(false);
  }


  return (
    <> 
    <div className="flex items-center font-medium border-b border-slate-300">
      <main className="px-4 flex-1 mx-auto py-4"><h1>Customer - Special Item</h1></main>
    </div>

    <div className="flex items-center font-medium mx-auto py-4">
      <main className="flex-1 mx-auto p-4">
        <div className="mx-auto">
          <div className="bg-gray-50 shadow-md border">
            <div className="p-6 text-gray-900 dark:text-gray-100">
              <div className="text-left caption-top dark:text-gray-800">
                <div className="flex flex-row py-2">
                  <div className="flex w-full"><h1>Special Item</h1></div>
                  <div className="flex mb-3">
                      <button type="button" onClick={() => {setOpenAddDial(true); setFormData({}); setErrors(false)}} className="h-fit flex flex-row primary-btn py-3 px-5 text-xs tracking-wider font-semibold rounded-md text-white bg-gray-800 hover:bg-gray-600 focus:outline-none"><MdAdd size={16}/>Add&nbsp;Item</button>
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
                      <th className='px-3 py-3'><TableSort sortdata={sortdata} title="Special Item" field="special_item" sorteddata={sortdata} setSorteddata={setSortdata} sorting={sorting} setSorting={setSorting} /> </th>
                      <th className='px-3 py-3'>Unit</th>
                      <th className='px-3 py-3'>Rate in Php</th>
                      <th className='px-3 py-3'>Length</th>
                      <th className='px-3 py-3'>Width</th>
                      <th className='px-3 py-3'>Height</th>
                      <th className='px-3 py-3'>CBM</th>
                      <th className='px-3 py-3'>Kilo</th>
                      <th className='px-3 py-3'>Value Charge</th>
                      <th className="px-3 py-3">Action</th>
                    </tr>
                    </thead>
                    <tbody className="text-sm text-center bg-gray-50 dark:bg-gray-700 dark:text-gray-800 border-b-2 border-gray-300">
                    {sortdata.length > 0 ? (sortdata.map(rec => (
                      <tr className="text-xs bg-white border-b dark:bg-gray-100 dark:border-gray-300 hover:bg-gray-50" key={rec.id}>     
                        <td className="px-3 py-3">{rec.special_item}</td>
                        <td className="px-3 py-3">{rec.unit}</td>
                        <td className="px-3 py-3">{rec.rate_php}</td>
                        <td className="px-3 py-3">{rec.length}</td>
                        <td className="px-3 py-3">{rec.width}</td>
                        <td className="px-3 py-3">{rec.height}</td>
                        <td className="px-3 py-3">{rec.cbm}</td>
                        <td className="px-3 py-3">{rec.kilo}</td>
                        <td className="px-3 py-3">{rec.value_charge}</td>
                        <td>
                        <button onClick={() => {setOpenUpdateDial(true); getSpecialItemUpdate(rec.id); setErrors(false)}} className="primary-btn text-sm tracking-wider font-semibold rounded-md">
                        <FaRegEdit size={20} className="mr-2 text-green-600"/></button>
                          <button onClick={() => deleteSpecialItem(rec.id)} className="primary-btn text-sm tracking-wider font-semibold rounded-md">
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
                <Pagination dataSize={specialItem.length} dataPPage={dataPerPage} nPages={pageCount} currentPage={currentPage} setCurrentPage={handleChange} />
            </div>
          </div>
        </div>  
      </main>
    </div>

    {/* Add Special Item */}
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
                    <h1 className="text-2xl text-left pb-6 flex"><FaUserPlus size={30} className='mr-1'/> Add Special Item</h1>
                    
                    <form onSubmit={handleCreate} className='w-full mx-auto space-y-6'>
                      <div className='flex flex-row border p-2 bg-gray-100'>
                        <div className='w-full p-4 text-left'>
                          <table className="w-full" cellPadding={4}>
                            <thead>
                              <tr>
                                <td>Unit:</td>
                                <td><input className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-1/2 py-3 rounded-md outline-blue-500" type="text" placeholder="Unit" value={formData.unit} onChange={(e) => setFormData({ ...formData, unit: e.target.value })} />
                                {errors.unit && <p className="error text-red-700 text-left ml-2">{errors.unit[0]}</p>}</td>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td>Special Item:</td>
                                <td><input className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500"    type="text" placeholder="Special Item" value={formData.special_item} onChange={(e) => setFormData({ ...formData, special_item: e.target.value })}/>
                                {errors.special_item && <p className="error text-red-700 text-left ml-2">{errors.special_item[0]}</p>}</td>
                              </tr>
                              <tr>
                                <td>Rate in Php:</td>
                                <td><input className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-1/2 py-3 rounded-md outline-blue-500" type="text" placeholder="Rate in Php" value={formData.rate_php} onChange={(e) => setFormData({ ...formData, rate_php: e.target.value })} />
                                  {errors.rate_php && <p className="error text-red-700 text-left ml-2">{errors.rate_php[0]}</p>}</td>
                              </tr>
                              <tr>
                                <td>Measurement:</td>
                                <td><input className="mr-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-1/4 py-3 rounded-md outline-blue-500" type="text" placeholder="Length" value={formData.length} onChange={(e) => setFormData({ ...formData, length: e.target.value })} />
                                <input className="mr-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-1/4 py-3 rounded-md outline-blue-500" type="text" placeholder="Width" value={formData.width} onChange={(e) => setFormData({ ...formData, width: e.target.value })} />
                                <input className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-1/4 py-3 rounded-md outline-blue-500" type="text" placeholder="Height" value={formData.height} onChange={(e) => setFormData({ ...formData,height: e.target.value })} />                     
                                </td>
                              </tr>
                              {(errors.length || errors.width || errors.height) && <tr><td>&nbsp;</td><td colSpan={2}><p className="text-red-700 text-left ml-2">Please do not leave blank or input valid value.</p></td></tr>}
                              <tr>
                                <td>CBM:</td>
                                <td><input className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-1/2 py-3 rounded-md outline-blue-500"    type="text" placeholder="CBM" value={formData.cbm} onChange={(e) => setFormData({ ...formData, cbm: e.target.value })}/>
                                {errors.cbm && <p className="error text-red-700 text-left ml-2">{errors.cbm[0]}</p>}
                              </td>
                              </tr>
                              <tr>
                                <td>Kilo:</td>
                                <td><input className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-1/2 py-3 rounded-md outline-blue-500"    type="text" placeholder="Kilo" value={formData.kilo} onChange={(e) => setFormData({ ...formData, kilo: e.target.value })}/>
                                {errors.kilo && <p className="error text-red-700 text-left ml-2">{errors.kilo[0]}</p>}
                                </td>
                              </tr>
                              <tr>
                                <td>Value Charge:</td>
                                <td><input className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-1/2 py-3 rounded-md outline-blue-500"    type="text" placeholder="Value Charge" value={formData.value_charge} onChange={(e) => setFormData({ ...formData, value_charge: e.target.value })}/>
                                {errors.value_charge && <p className="error text-red-700 text-left ml-2">{errors.value_charge[0]}</p>}
                                </td>
                              </tr>
                            </tbody>
                          </table>                           
                        </div>          
                      </div>
                        <div className="!mt-8 float-right">
                          <button className="primary-btn py-3 px-10 text-sm tracking-wider font-semibold rounded-md text-white bg-gray-800 hover:bg-gray-600 focus:outline-none"> Add Item </button>
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

    {/* Update Special Item */}
    <Dialog open={openUpdateDial} onClose={setOpenUpdateDial} className="relative z-[999]">
      <DialogBackdrop
          transition
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
      />

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <DialogPanel transition className="relative transform overflow-hidden rounded-lg transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-screen-sm data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"> 

            <div className="flex flex-col font-[sans-serif]">
                <div className="w-fit mx-auto border border-gray-300 rounded-2xl p-8 bg-gray-50">
                  <div className="text-center mb-4">
                    <h1 className="text-2xl text-left pb-6 flex"><FaUserEdit size={30} className='mr-1'/> Update Special Item </h1>
                    
                      <div className='flex flex-row border p-2 bg-gray-100'>
                        <div className='w-full p-4 text-left'>
                          <table className="w-full" cellPadding={4}>
                            <thead>
                              <tr>
                                <td>Unit:</td>
                                <td><input className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-1/2 py-3 rounded-md outline-blue-500" type="text" placeholder="Unit" value={formData.unit} onChange={(e) => setFormData({ ...formData, unit: e.target.value })} />
                                {errors.unit && <p className="error text-red-700 text-left ml-2">{errors.unit[0]}</p>}</td>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td>Special Item:</td>
                                <td><input className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500"    type="text" placeholder="Special Item" value={formData.special_item} onChange={(e) => setFormData({ ...formData, special_item: e.target.value })}/>
                                {errors.special_item && <p className="error text-red-700 text-left ml-2">{errors.special_item[0]}</p>}</td>
                              </tr>
                              <tr>
                                <td>Rate in Php:</td>
                                <td><input className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-1/2 py-3 rounded-md outline-blue-500" type="text" placeholder="Rate in Php" value={formData.rate_php} onChange={(e) => setFormData({ ...formData, rate_php: e.target.value })} />
                                  {errors.rate_php && <p className="error text-red-700 text-left ml-2">{errors.rate_php[0]}</p>}</td>
                              </tr>
                              <tr>
                                <td>Measurement:</td>
                                <td><input className="mr-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-1/4 py-3 rounded-md outline-blue-500" type="text" placeholder="Length" value={formData.length} onChange={(e) => setFormData({ ...formData, length: e.target.value })} />
                                <input className="mr-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-1/4 py-3 rounded-md outline-blue-500" type="text" placeholder="Width" value={formData.width} onChange={(e) => setFormData({ ...formData, width: e.target.value })} />
                                <input className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-1/4 py-3 rounded-md outline-blue-500" type="text" placeholder="Height" value={formData.height} onChange={(e) => setFormData({ ...formData,height: e.target.value })} />                     
                                </td>
                              </tr>
                              {(errors.length || errors.width || errors.height) && <tr><td>&nbsp;</td><td colSpan={2}><p className="text-red-700 text-left ml-2">Please do not leave blank or input valid value.</p></td></tr>}
                              <tr>
                                <td>CBM:</td>
                                <td><input className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-1/2 py-3 rounded-md outline-blue-500"    type="text" placeholder="CBM" value={formData.cbm} onChange={(e) => setFormData({ ...formData, cbm: e.target.value })}/>
                                {errors.cbm && <p className="error text-red-700 text-left ml-2">{errors.cbm[0]}</p>}
                              </td>
                              </tr>
                              <tr>
                                <td>Kilo:</td>
                                <td><input className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-1/2 py-3 rounded-md outline-blue-500"    type="text" placeholder="Kilo" value={formData.kilo} onChange={(e) => setFormData({ ...formData, kilo: e.target.value })}/>
                                {errors.kilo && <p className="error text-red-700 text-left ml-2">{errors.kilo[0]}</p>}
                                </td>
                              </tr>
                              <tr>
                                <td>Value Charge:</td>
                                <td><input className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-1/2 py-3 rounded-md outline-blue-500"    type="text" placeholder="Value Charge" value={formData.value_charge} onChange={(e) => setFormData({ ...formData, value_charge: e.target.value })}/>
                                {errors.value_charge && <p className="error text-red-700 text-left ml-2">{errors.value_charge[0]}</p>}
                                </td>
                              </tr>
                            </tbody>
                          </table>                           
                        </div>           
                      </div>
                        <div className="!mt-8 float-right">
                          <button onClick={() => {updateSpecialItem(formData.id); setStatus(2)}} className="primary-btn py-3 px-10 text-sm tracking-wider font-semibold rounded-md text-white bg-gray-800 hover:bg-gray-600 focus:outline-none"> Update </button>
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
      title="Add Special Item"
      body="Special Item successfully added!"
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
    </>
  )
}