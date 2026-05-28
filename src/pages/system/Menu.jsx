import { Dialog, DialogBackdrop, DialogPanel, Tab, TabList, TabPanels, TabPanel, TabGroup } from '@headlessui/react';
import { useContext, useEffect, useState} from "react";
import { AppContext } from "../../context/AppContext";
import { Link } from 'react-router-dom';
import InfoBox from "../../assets/components/InfoBox";
import ConfirmBox from "../../assets/components/DeleteBox";
import UpdateBox from "../../assets/components/UpdateBox";
import { MdAdd } from "react-icons/md";
import { FaRegTrashAlt, FaRegEdit } from "react-icons/fa";
import TableSort from '../../assets/components/TableSort';
import Pagination from '../../assets/components/Pagination';
import sortData from '../../assets/components/sortData';

export default function Menu() {

  const [openAddMenu, setOpenAddMenu] = useState(false);
  const [openUpdateMenu, setOpenUpdateMenu] = useState(false);
  const [openAddSubMenu, setOpenAddSubMenu] = useState(false);
  const [openUpdateSubMenu, setOpenUpdateSubMenu] = useState(false);
  const [open, setOpen] = useState(false);
  const { token } = useContext(AppContext);
  const [status, setStatus] = useState(0);
  const [menu, setMenu] = useState([]);
  const [subMenu, setSubMenu] = useState([]);
  const [id, setId] = useState(null);
  const [stat, setStat] = useState(null);

  //Table Pagination, Search
  const [sortdata, setSortdata] = useState([]);
  const [sorting, setSorting] = useState({ key: "", ascending: true });
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageCount, setPageCount] = useState(0);
  const [dataPerPage, setDataperpage] = useState(10);

  const [formDataMenu, setFormDataMenu] = useState({
    menu_name: "", secondlevel: "",
  });

  const [formDataSubMenu, setFormDataSubMenu] = useState({
    menu_id: "", submenu_name: "", secondlevel: "", path_direction: "", menu_name: "",
  });

  const [errors, setErrors] = useState({});


  //~~~~~~~Search Table~~~~~~~~~~~~~~~~~~~~
  const changePage = (i) => {
    setCurrentPage(i);
    const startItem = (i - 1) * dataPerPage;
    setSortdata(subMenu.slice(startItem, startItem + dataPerPage));
  };

  const handleChange = (value) => {
    changePage(value);
  };

  //Search
  async function searchTable() {
    const filtered = subMenu.filter(rec => 
      rec.menu_name.toLowerCase().includes(search.toLowerCase())||
      rec.submenu_name.toLowerCase().includes(search.toLowerCase())
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
  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  // Get All Menu
  async function getMenu() {
    const res = await fetch("/api/menu", {
      method: "GET",
      headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          Authorization: `Bearer ${token}`,
        },
    });
    const data = await res.json();
    if(res.ok) {
      setMenu(data);
    }
  }
  useEffect(() => {
    getMenu();
  }, []);

  // Get All Sub-Menu
  async function getSubMenu() {
    const res = await fetch("/api/submenu", {
      method: "GET",
      headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          Authorization: `Bearer ${token}`,
        },
    });
    const data = await res.json();
    if(res.ok) {
      setSubMenu(data);
      setPageCount(Math.ceil(data.length / dataPerPage));
      setSortdata(data.slice(0, dataPerPage));
    }
  }
  useEffect(() => {
    getSubMenu();
  }, [dataPerPage]);

  // Add Menu
  async function createMenu(e) {
    e.preventDefault();
    const res = await fetch("/api/menu", {
        method: "post",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formDataMenu),
    });
    const data = await res.json();

    if (data.errors) {
      setErrors(data.errors);
    } else {
      setOpen(true);
      setStatus(1);
      setFormDataMenu({});
      getMenu();
      setStat("Menu");
    }
  }

  // Add Sub-Menu
  async function createSubMenu(e) {
    e.preventDefault();
    const res = await fetch("/api/submenu", {
        method: "post",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formDataSubMenu),
    });
    const data = await res.json();

    if (data.errors) {
      setErrors(data.errors);
    } else {
      setOpen(true);
      setStatus(1);
      setFormDataSubMenu({});
      getSubMenu();
      setStat("Sub-Menu");
    }
  }

  async function closeCreate() {
    setOpen(false);
    setOpenAddMenu(false);
    setOpenAddSubMenu(false);
  }

  // Get Menu
  async function getMenuUpdate(id) {
    setFormDataMenu({});
    if(id){
      const res = await fetch(`/api/menu/${id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json"
        }
      });
      const data = await res.json();
      if(res.ok) {
        setFormDataMenu({
          id: data[0].id,
          menu_name: data[0].menu_name,
          secondlevel: data[0].secondlevel,
        });
      }
    }
  }
  useEffect(() => {
    getMenuUpdate();
  }, []);

  //Update Menu
  async function handleUpdateMenu(e) {
    e.preventDefault();
    const res = await fetch(`/api/menu/${id}`, {
      method: "put",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(formDataMenu),
    });
    const data = await res.json();
    if(data.errors) {
      setErrors(data.errors);
    } else {
      setStatus(4);
      getMenu();
      setStat("Menu");
    }
  }

  // Get Sub-Menu
  async function getSubMenuUpdate(id) {
    setFormDataSubMenu({});
    if(id){
      const res = await fetch(`/api/submenu/${id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json"
        }
      });
      const data = await res.json();
      if(res.ok) {
        setFormDataSubMenu({
          id: data[0].id,
          menu_id: data[0].menu_id,
          submenu_name: data[0].submenu_name,
          secondlevel: data[0].secondlevel,
          path_direction: data[0].path_direction,
          menu_name: data[0].menu_name,
        });
      }
    }
  }
  useEffect(() => {
    getSubMenuUpdate();
  }, []);

  //Update Sub-Dept
  async function handleUpdateSubMenu(e) {
    e.preventDefault();
    const res = await fetch(`/api/submenu/${id}`, {
      method: "put",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(formDataSubMenu),
    });
    const data = await res.json();
    if(data.errors) {
      setErrors(data.errors);
    } else {
      setStatus(4);
      getSubMenu();
      setStat("Sub-Menu");
    }
  }

  //Delete Department
  async function handleDeleteMenu(e) {
    e.preventDefault();
      const res = await fetch(`/api/menu/${id}`, {
        method: "delete",
        headers: {
            Authorization: `Bearer ${token}`,
        }
      });
      const data = await res.json();
      if(res.ok) {
        setStatus(5);
        getMenu();
        getSubMenu();
        setStat("Menu");
      }
  }

  //Delete Sub-Department
  async function handleDeleteSubMenu(e) {
    e.preventDefault();
      const res = await fetch(`/api/submenu/${id}`, {
        method: "delete",
        headers: {
            Authorization: `Bearer ${token}`,
        }
      });
      const data = await res.json();
      if(res.ok) {
        setStatus(5);
        getSubMenu();
        setStat("Sub-Menu");
      }
  }

  async function openUpdate(id) {
    setOpen(true);
    setId(id);
    console.log(stat);
    if (stat === 1) {
      setStatus(3)
    } else if (stat === 2) {
      setStatus(6)
    }
  }

  async function openDeleteMenu(id) {
    setOpen(true);
    setId(id);
    setStatus(2);
  }

  async function openDeleteSubMenu(id) {
    setOpen(true);
    setId(id);
    setStatus(7);
  }

  async function closeUpdate() {
    setOpen(false);
    setOpenUpdateMenu(false);
    setOpenUpdateSubMenu(false);
  }

  async function closeDelete() {
    setOpen(false);
  }

  return (
    <> 
    <div className="flex items-center font-medium border-b border-slate-300 w-full">
      <main className="ml-10 flex-1 mx-auto py-4"><h1>System - Menu</h1></main>
    </div>
    <div className="flex items-center font-medium flex-1 mx-auto py-4">
      <main className="flex-1 mx-auto p-4">
        <div className="max-w-6xl mx-auto sm:px-6 lg:px-8">
          <div className="bg-gray-50 overflow-hidden shadow-md border">
            <div className="p-6 text-gray-900 dark:text-gray-100">
            <TabGroup>
              <TabList className="text-sm">
                <Tab className="data-[selected]: text-gray-800 py-3 px-10 data-[selected]:sm:rounded-t-md data-[selected]:bg-white data-[selected]:border-t data-[selected]:border-l data-[selected]:border-r data-[selected]:text-gray-800">Menu</Tab>
                <Tab className="text-gray-800 py-3 px-10 data-[selected]:sm:rounded-t-md data-[selected]:bg-white data-[selected]:border-t data-[selected]:border-l data-[selected]:border-r data-[selected]:text-gray-800">Sub-Menu</Tab>
              </TabList>
              <TabPanels>
                <TabPanel className="px-5 py-4 bg-white border border-t-0">
                  <div className="overflow-auto">
                    <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400 overflow-hidden">
                      <caption className="text-left caption-top dark:text-gray-800">
                        <div className="flex flex-row py-2">
                          <div className="flex w-full"></div>
                          <div className="flex mb-3">
                            <button type="button" onClick={() => {setOpenAddMenu(true); setFormDataMenu({}); setErrors(false)}} className="h-fit flex flex-row primary-btn py-3 px-5 text-sm tracking-wider font-semibold rounded-md text-white bg-gray-800 hover:bg-gray-600 focus:outline-none"><MdAdd size={20} className="mr-2"/>Add&nbsp;Menu</button>
                          </div> 
                        </div>
                      </caption>
                        <thead className="text-sm  text-center uppercase bg-gray-200 dark:text-gray-800 border-b-2 border-gray-300">
                          <tr className="text-nowrap">
                          <th className="px-3 py-3">No.</th>
                          <th className="px-3 py-3">Menu Name</th>
                          <th className="px-3 py-3">2nd Level Menu</th>
                          <th className="px-3 py-3">Action</th>
                          </tr>
                        </thead>
                        <tbody className="text-sm text-center bg-gray-50 dark:bg-gray-50 dark:text-gray-800 border-b-2 border-gray-300">
                        {menu.length > 0 ? (menu.map(rec => (
                          <tr className="text-sm bg-white border-b dark:bg-gray-50 dark:border-gray-300" key={rec.id}>     
                            <th className="px-3 py-3">
                              <Link className="font-medium text-blue-600 dark:text-blue-500 hover:underline mx-1">{rec.id}
                              </Link>
                            </th>
                            <td className="px-3 py-3">{rec.menu_name}</td>
                            <td className="px-3 py-3">{rec.secondlevel ? rec.secondlevel : "-"}</td>
                            <td>
                            <button onClick={() => {getMenuUpdate(rec.id); setOpenUpdateMenu(true); setErrors(false); setStat(1)}} className="primary-btn text-sm tracking-wider font-semibold rounded-md">
                            <FaRegEdit size={20} className="mr-2 text-green-600"/></button>
                              <button onClick={() => {openDeleteMenu(rec.id)}} className="primary-btn text-sm tracking-wider font-semibold rounded-md">
                                <FaRegTrashAlt size={20} className="text-red-600"/></button>
                            </td>
                          </tr>
                        ))) : (
                          <tr className='text-xs bg-white border-b dark:bg-gray-100 dark:border-gray-300'>
                            <td className='px-3 py-3 text-center' colSpan={13}>Loading...</td>
                          </tr>
                        )}
                      </tbody>                        
                    </table>
                  </div>
                </TabPanel>
                <TabPanel className="px-5 py-4 bg-white border border-t-0">
                  <div className="text-left caption-top dark:text-gray-800">
                    <div className="flex flex-row py-2">
                      <div className="flex w-full"></div>
                      <div className="flex mb-3">
                        <button type="button" onClick={() => {setOpenAddSubMenu(true); setFormDataSubMenu({}); setErrors(false)}} className="h-fit flex flex-row primary-btn py-3 px-5 text-sm tracking-wider font-semibold rounded-md text-white bg-gray-800 hover:bg-gray-600 focus:outline-none"><MdAdd size={20} className="mr-2"/>Add&nbsp;SubMenu</button>
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
                        <thead className="text-sm text-center uppercase bg-gray-200 dark:text-gray-800 border-b-2 border-gray-300">
                          <tr className="text-nowrap">
                          <th className="px-3 py-3">
                            <TableSort sortdata={sortdata} title="No." field="id" sorteddata={sortdata} setSorteddata={setSortdata} sorting={sorting} setSorting={setSorting} />
                          </th>
                          <th className="px-3 py-3">
                            <TableSort sortdata={sortdata} title="Menu Name" field="menu_name" sorteddata={sortdata} setSorteddata={setSortdata} sorting={sorting} setSorting={setSorting} />
                          </th>
                          <th className="px-3 py-3">
                            <TableSort sortdata={sortdata} title="Sub-Menu Name" field="submenu_name" sorteddata={sortdata} setSorteddata={setSortdata} sorting={sorting} setSorting={setSorting} />
                          </th>
                          <th className="px-3 py-3">Second Level</th>
                          <th className="px-3 py-3">
                            <TableSort sortdata={sortdata} title="Path" field="path_direction" sorteddata={sortdata} setSorteddata={setSortdata} sorting={sorting} setSorting={setSorting} />
                          </th>
                          <th className="px-3 py-3">Action</th>
                          </tr>
                        </thead>
                      
                        <tbody className="text-sm text-center bg-gray-50 dark:bg-gray-50 dark:text-gray-800 border-b-2 border-gray-300">
                        {sortdata.length > 0 ? (sortdata.map(rec => (
                          <tr className="text-sm bg-white border-b dark:bg-gray-50 dark:border-gray-300" key={rec.id}>     
                            <th className="px-3 py-3">
                              <Link className="font-medium text-blue-600 dark:text-blue-500 hover:underline mx-1">{rec.id}
                              </Link>
                            </th>
                            <td className="px-3 py-3">{rec.menu_name}</td>
                            <td className="px-3 py-3">{rec.submenu_name}</td>
                            <td className="px-3 py-3">{rec.secondlevel ? rec.secondlevel : "-"}</td>
                            <td className="px-3 py-3">{rec.path_direction}</td>
                            <td>
                            <button onClick={() => {getSubMenuUpdate(rec.id); setOpenUpdateSubMenu(true); setErrors(false); setStat(2)}} className="primary-btn text-sm tracking-wider font-semibold rounded-md">
                              <FaRegEdit size={20} className="mr-2 text-green-600"/></button>
                            <button onClick={() => {openDeleteSubMenu(rec.id)}} className="primary-btn text-sm tracking-wider font-semibold rounded-md">
                              <FaRegTrashAlt size={20} className="text-red-600"/></button>
                            </td>
                          </tr>
                        ))) : (
                          <tr className='text-xs bg-white border-b dark:bg-gray-100 dark:border-gray-300'>
                            <td className='px-3 py-3 text-center' colSpan={13}>Loading...</td>
                          </tr>
                        )}
                      </tbody>                        
                    </table>
                  </div>
                  <Pagination dataSize={subMenu.length} dataPPage={dataPerPage} nPages={pageCount} currentPage={currentPage} setCurrentPage={handleChange} />
                </TabPanel>
              </TabPanels>
            </TabGroup>                    
            </div>
          </div>
        </div>  
      </main> 
    </div>

    {/* Add Menu */}
    <Dialog open={openAddMenu} onClose={setOpenAddMenu} className="relative z-[999]">
      <DialogBackdrop
          transition
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
      />

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <DialogPanel transition className="relative transform overflow-hidden rounded-lg transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-lg data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"> 

            <div className="flex flex-col font-[sans-serif]">
                <div className="w-full mx-auto border border-gray-300 rounded-2xl p-8 bg-gray-50">
                  <div className="text-center mb-4">
                    <h1 className="text-2xl text-left pb-6"> Add Menu Record </h1>
                    
                    <form onSubmit={createMenu} className='w-full mx-auto space-y-6'>
                      <div className='flex flex-row border p-2 bg-gray-100'>
                        <div className='w-full p-4'>
                          <input className="mt-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="Menu Name" value={formDataMenu.menu_name}
                              onChange={(e) => setFormDataMenu({ ...formDataMenu, menu_name: e.target.value })}
                          />
                            {errors.menu_name && <p className="error text-red-700 text-left ml-2">{errors.menu_name[0]}</p>}

                          <input className="mt-4 mb-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="2nd Level Menu" value={formDataMenu.secondlevel}
                              onChange={(e) => setFormDataMenu({ ...formDataMenu, secondlevel: e.target.value })}
                          />
                            {errors.secondlevel && <p className="error text-red-700 text-left ml-2">{errors.secondlevel[0]}</p>}
                        </div>          
                      </div>
                        <div className="!mt-8 float-right">
                          <button className="primary-btn py-3 px-6 text-sm tracking-wider font-semibold rounded-md text-white bg-gray-800 hover:bg-gray-600 focus:outline-none"> Add Menu </button>
                        </div> 
                    </form>
                        <div className="!mt-8 float-right">
                          <button onClick={() => setOpenAddMenu(false)} className="primary-btn py-3 px-6 mr-4 text-sm tracking-wider font-semibold rounded-md text-white bg-gray-500 hover:bg-gray-600 focus:outline-none"> Cancel </button>
                        </div>
                    </div>
                  </div>
                </div>
            </DialogPanel>
          </div>
      </div>
    </Dialog>

    {/* Update Menu */}
    <Dialog open={openUpdateMenu} onClose={setOpenUpdateMenu} className="relative z-[999]">
      <DialogBackdrop
          transition
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
      />

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <DialogPanel transition className="relative transform overflow-hidden rounded-lg transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-lg data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"> 

            <div className="flex flex-col font-[sans-serif]">
                <div className="w-fit mx-auto border border-gray-300 rounded-2xl p-8 bg-gray-50">
                  <div className="text-center mb-4">
                    <h1 className="text-2xl text-left pb-6"> Update Menu Record </h1>
                    
                      <div className='flex flex-row border p-2 bg-gray-100'>
                        <div className='p-4'>
                        <input className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" disabled value={formDataMenu.id} onChange={(e) => setFormDataMenu({ ...formDataMenu, id: e.target.value })}
                          />
                          <input className="mt-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="Menu Name" value={formDataMenu.menu_name}
                              onChange={(e) => setFormDataMenu({ ...formDataMenu, menu_name: e.target.value })}
                          />
                            {errors.menu_name && <p className="error text-red-700 text-left ml-2">{errors.menu_name[0]}</p>}

                          <input className="mt-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="2nd Level Menu" value={formDataMenu.secondlevel}
                              onChange={(e) => setFormDataMenu({ ...formDataMenu, secondlevel: e.target.value })}
                          />
                            {errors.secondlevel && <p className="error text-red-700 text-left ml-2">{errors.secondlevel[0]}</p>}
                        </div>
                      </div>
                        <div className="!mt-8 float-right">
                          <button onClick={() => openUpdate(formDataMenu.id)} className="primary-btn py-3 px-4 text-sm tracking-wider font-semibold rounded-md text-white bg-gray-800 hover:bg-gray-600 focus:outline-none"> Update Menu </button>
                        </div> 
                    
                        <div className="!mt-8 float-right">
                          <button onClick={() => setOpenUpdateMenu(false)} className="primary-btn py-3 px-6 mr-4 text-sm tracking-wider font-semibold rounded-md text-white bg-gray-500 hover:bg-gray-600 focus:outline-none"> Cancel </button>
                        </div>
                    </div>
                  </div>
                </div>
            </DialogPanel>
          </div>
      </div>
    </Dialog>

    {/* Add Sub-Menu */}
    <Dialog open={openAddSubMenu} onClose={setOpenAddSubMenu} className="relative z-[999]">
      <DialogBackdrop
          transition
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
      />

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <DialogPanel transition className="relative transform overflow-hidden rounded-lg transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-lg data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"> 

            <div className="flex flex-col font-[sans-serif]">
                <div className="w-full mx-auto border border-gray-300 rounded-2xl p-8 bg-gray-50">
                  <div className="text-center mb-4">
                    <h1 className="text-2xl text-left pb-6"> Add Sub-Menu Record </h1>
                    
                    <form onSubmit={createSubMenu} className='w-full mx-auto space-y-6'>
                      <div className='flex flex-row border p-2 bg-gray-100'>
                        <div className='w-full p-4'>
                        <select className='mt-4 form-select text-gray-800 bg-white text-sm px-4 w-full py-3 border border-gray-300 rounded-md outline-blue-500' onChange={(e) => setFormDataSubMenu({ ...formDataSubMenu, menu_id: e.target.value })}>
                              <option value="">Select Menu</option>
                            {menu.map((rec, key) =>(
                              <option value={rec.id} key={key}>{rec.menu_name}</option>
                            ))}
                          </select>
                          {errors.menu_id && <p className="error text-red-700 text-left ml-2">{errors.menu_id[0]}</p>}

                          <input className="mt-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="textarea" placeholder="Sub-Menu Name" value={formDataSubMenu.submenu_name}
                              onChange={(e) => setFormDataSubMenu({ ...formDataSubMenu, submenu_name: e.target.value })}
                          />
                            {errors.submenu_name && <p className="error text-red-700 text-left ml-2">{errors.submenu_name[0]}</p>}

                          <input className="mt-4 mb-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="textarea" placeholder="Path" value={formDataSubMenu.path_direction}
                              onChange={(e) => setFormDataSubMenu({ ...formDataSubMenu, path_direction: e.target.value })}
                          />
                            {errors.path_direction && <p className="error text-red-700 text-left ml-2">{errors.path_direction[0]}</p>}
                        </div>          
                      </div>
                        <div className="!mt-8 float-right">
                          <button className="primary-btn py-3 px-4 text-sm tracking-wider font-semibold rounded-md text-white bg-gray-800 hover:bg-gray-600 focus:outline-none"> Add Sub-Menu </button>
                        </div> 
                    </form>
                        <div className="!mt-8 float-right">
                          <button onClick={() => setOpenAddSubMenu(false)} className="primary-btn py-3 px-10 mr-4 text-sm tracking-wider font-semibold rounded-md text-white bg-gray-500 hover:bg-gray-600 focus:outline-none"> Cancel </button>
                        </div>
                    </div>
                  </div>
                </div>
            </DialogPanel>
          </div>
      </div>
    </Dialog>

    {/* Update Sub-Menu */}
    <Dialog open={openUpdateSubMenu} onClose={setOpenUpdateSubMenu} className="relative z-[999]">
      <DialogBackdrop
          transition
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
      />

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <DialogPanel transition className="relative transform overflow-hidden rounded-lg transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-lg data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"> 

            <div className="flex flex-col font-[sans-serif]">
                <div className="w-fit mx-auto border border-gray-300 rounded-2xl p-8 bg-gray-50">
                  <div className="text-center mb-4">
                    <h1 className="text-2xl text-left pb-6"> Update Sub-Menu Record </h1>
                    
                      <div className='flex flex-row border p-2 bg-gray-100'>
                        <div className='p-4'>
                        <input className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" disabled value={formDataSubMenu.id} onChange={(e) => setFormDataSubMenu({ ...setFormDataSubMenu, id: e.target.value })}
                          />

                        <select className='mt-4 form-select text-gray-800 bg-white text-sm px-4 w-full py-3 border border-gray-300 rounded-md outline-blue-500' onChange={(e) => setFormDataSubMenu({ ...formDataSubMenu, menu_id: e.target.value })}>
                            <option>{formDataSubMenu.menu_name}</option>
                            {menu.map((rec, key) =>(
                            <option value={rec.id} key={key}>{rec.menu_name}</option>
                            ))}
                        </select>

                          <input className="mt-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="textarea" placeholder="Sub-Menu Name" value={formDataSubMenu.submenu_name}
                              onChange={(e) => setFormDataSubMenu({ ...formDataSubMenu, submenu_name: e.target.value })}
                          />
                          {errors.submenu_name && <p className="error text-red-700 text-left ml-2">{errors.submenu_name[0]}</p>}

                          <input className="mt-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="textarea" placeholder="Sub-Menu Name" value={formDataSubMenu.path_direction}
                              onChange={(e) => setFormDataSubMenu({ ...formDataSubMenu, path_direction: e.target.value })}
                          />
                          {errors.path_direction && <p className="error text-red-700 text-left ml-2">{errors.path_direction[0]}</p>}
                        </div>          
                      </div>
                        <div className="!mt-8 float-right">
                          <button onClick={() => openUpdate(formDataSubMenu.id)} className="primary-btn py-3 px-4 text-sm tracking-wider font-semibold rounded-md text-white bg-gray-800 hover:bg-gray-600 focus:outline-none"> Update Sub-Menu </button>
                        </div> 
                    
                        <div className="!mt-8 float-right">
                          <button onClick={() => setOpenUpdateSubMenu(false)} className="primary-btn py-3 px-10 mr-4 text-sm tracking-wider font-semibold rounded-md text-white bg-gray-500 hover:bg-gray-600 focus:outline-none"> Cancel </button>
                        </div>
                    </div>
                  </div>
                </div>
            </DialogPanel>
          </div>
      </div>
    </Dialog>

    {status === 1 &&  <InfoBox open={open} setOpen={setOpen} onClose={setOpen}
      title="Confirm Success"
      body={stat + " successfully added!"}
      okConfirm={closeCreate}
      /> 
    }

    {status === 2 &&  <ConfirmBox open={open} setOpen={setOpen}
      title="Confirm Delete"
      body="Are you sure you want to delete this menu?"
      okConfirm={handleDeleteMenu}
      /> 
    }

    {status === 3 && <UpdateBox open={open} setOpen={setOpen}
      title="Confirm Update"
      body="Are you sure you want to update this menu?"
      okConfirm={handleUpdateMenu}
      /> 
    }

    {status === 4 &&  <InfoBox open={open} setOpen={setOpen} onClose={setOpen}
      title="Confirm Success"
      body= {stat + " successfully updated!"}
      okConfirm={closeUpdate}
      /> 
    }

    {status === 5 &&  <InfoBox open={open} setOpen={setOpen} onClose={setOpen}
      title="Confirm Success"
      body= {stat + " successfully deleted!"}
      okConfirm={closeDelete}
      /> 
    }

    {status === 6 && <UpdateBox open={open} setOpen={setOpen}
      title="Confirm Update"
      body="Are you sure you want to update this sub-menu?"
      okConfirm={handleUpdateSubMenu}
      /> 
    } 
    
    {status === 7 &&  <ConfirmBox open={open} setOpen={setOpen}
      title="Confirm Delete"
      body="Are you sure you want to delete this sub-menu?"
      okConfirm={handleDeleteSubMenu}
      /> 
    }

    </>
  )
};
