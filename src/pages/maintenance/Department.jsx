import { Dialog, DialogBackdrop, DialogPanel, Tab, TabList, TabPanels, TabPanel, TabGroup } from '@headlessui/react';
import { useContext, useEffect, useState} from "react";
import { AppContext } from "../../context/AppContext";
import { Link } from 'react-router-dom';
import InfoBox from "../../assets/components/InfoBox";
import ConfirmBox from "../../assets/components/DeleteBox";
import UpdateBox from "../../assets/components/UpdateBox";
import { MdAdd } from "react-icons/md";
import { FaRegTrashAlt, FaRegEdit, FaUserPlus, FaUserEdit } from "react-icons/fa";
import LoadingBox from '../../assets/components/Loading';

export default function Department() {

  const [openAddDept, setOpenAddDept] = useState(false);
  const [openUpdateDept, setOpenUpdateDept] = useState(false);
  const [openAddSubdept, setOpenAddSubdept] = useState(false);
  const [openUpdateSubdept, setOpenUpdateSubdept] = useState(false);
  const [open, setOpen] = useState(false);
  const { token } = useContext(AppContext);
  const [showLoading, setShowLoading] = useState(false);
  const isLoading = () => {setShowLoading(true)};
  const stopLoading = () => {setShowLoading(false)};
  const [status, setStatus] = useState(0);
  const [dept, setDept] = useState([]);
  const [subdept, setSubdept] = useState([]);
  const [id, setId] = useState(null);
  const [stat, setStat] = useState(null);

  const [formDataDept, setFormDataDept] = useState({
    department: "",
  });

  const [formDataSubdept, setFormDataSubdept] = useState({
    department_header_id: "", department_sub: "",
  });

  const [errors, setErrors] = useState({});
  
  // Get All Department
  async function getDept() {
    isLoading();
    const res = await fetch("/api/department");
    const data = await res.json();
    if(res.ok) {
      setDept(data);
      stopLoading();
    }
  }
  useEffect(() => {
    getDept();
  }, []);

  // Get All Sub-Department
  async function getSubdept() {
    const res = await fetch("/api/subdepartment");
    const data = await res.json();
    if(res.ok) {
      setSubdept(data);
    }
  }
  useEffect(() => {
    getSubdept();
  }, []);

  // Add Department
  async function createDept(e) {
    e.preventDefault();
    const res = await fetch("/api/department", {
        method: "post",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formDataDept),
    });
    const data = await res.json()
    console.log(data);

    if (data.errors) {
      setErrors(data.errors);
    } else {
      setOpen(true);
      setStatus(1);
      setFormDataDept({});
      getDept();
      setStat("Department");
    }
  }

  // Add Sub-Department
  async function createSubdept(e) {
    e.preventDefault();
    const res = await fetch("/api/subdepartment", {
        method: "post",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formDataSubdept),
    });
    const data = await res.json()
    console.log(data);

    if (data.errors) {
      setErrors(data.errors);
    } else {
      setOpen(true);
      setStatus(1);
      setFormDataSubdept({});
      getSubdept();
      setStat("Sub-Department");
    }
  }

  async function closeCreate() {
    setOpen(false);
    setOpenAddDept(false);
    setOpenAddSubdept(false);
  }

  // Get Department
  async function getDeptUpdate(id) {
    setFormDataDept({});
    if(id){
      const res = await fetch(`/api/department/${id}`);
      const data = await res.json();
      if(res.ok) {
        setFormDataDept({
          id: data[0].id,
          department: data[0].department,
        });
      }
    }
  }
  useEffect(() => {
    getDeptUpdate();
  }, []);

  //Update Department
  async function handleUpdateDept(e) {
    e.preventDefault();
    const res = await fetch(`/api/department/${id}`, {
      method: "put",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(formDataDept),
    });
    const data = await res.json();
    if(data.errors) {
      setErrors(data.errors);
    } else {
      setStatus(4);
      getDept();
      setStat("Department");
    }
  }

  // Get Sub-Department
  async function getSubdeptUpdate(id) {
    setFormDataSubdept({});
    if(id){
      const res = await fetch(`/api/subdepartment/${id}`);
      const data = await res.json();
      if(res.ok) {
        setFormDataSubdept({
          id: data[0].id,
          department_header_id: data[0].department_header_id,
          department_sub: data[0].department_sub,
          department: data[0].department,
        });
      }
    }
  }
  useEffect(() => {
    getSubdeptUpdate();
  }, []);

  //Update Sub-Dept
  async function handleUpdateSubdept(e) {
    e.preventDefault();
    const res = await fetch(`/api/subdepartment/${id}`, {
      method: "put",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(formDataSubdept),
    });
    const data = await res.json();
    if(data.errors) {
      setErrors(data.errors);
    } else {
      setStatus(4);
      getSubdept();
      setStat("Sub-Department");
    }
  }

  //Delete Department
  async function handleDeleteDept(e) {
    e.preventDefault();
      const res = await fetch(`/api/department/${id}`, {
        method: "delete",
        headers: {
            Authorization: `Bearer ${token}`,
        }
      });
      const data = await res.json();
      console.log(data);  
      if(res.ok) {
        setStatus(5);
        getDept();
        setStat("Department");
      }
  }

  //Delete Sub-Department
  async function handleDeleteSubdept(e) {
    e.preventDefault();
      const res = await fetch(`/api/subdepartment/${id}`, {
        method: "delete",
        headers: {
            Authorization: `Bearer ${token}`,
        }
      });
      const data = await res.json();
      console.log(data);  
      if(res.ok) {
        setStatus(5);
        getSubdept();
        setStat("Sub-Department");
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

  async function openDeleteDept(id) {
    setOpen(true);
    setId(id);
    setStatus(2);
  }

  async function openDeleteSubdept(id) {
    setOpen(true);
    setId(id);
    setStatus(7);
  }

  async function closeUpdate() {
    setOpen(false);
    setOpenUpdateDept(false);
    setOpenUpdateSubdept(false);
  }

  async function closeDelete() {
    setOpen(false);
  }

  return (
    <> 
    <div className="flex items-center font-medium border-b border-slate-300 w-full">
      <main className="ml-10 flex-1 mx-auto py-4"><h1>Maintenance - Department</h1></main>
    </div>
    <div className="flex items-center font-medium flex-1 mx-auto py-4">
      <main className="flex-1 mx-auto p-4">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="bg-gray-50 overflow-hidden shadow-md border">
            <div className="p-6 text-gray-900">
            <TabGroup>
              <TabList className="text-sm">
                <Tab className="data-[selected]: text-gray-800 py-3 px-5 data-[selected]:sm:rounded-t-md data-[selected]:bg-white data-[selected]:border-t data-[selected]:border-l data-[selected]:border-r data-[selected]:text-gray-800">Department</Tab>
                <Tab className="text-gray-800 py-3 px-5 data-[selected]:sm:rounded-t-md data-[selected]:bg-white data-[selected]:border-t data-[selected]:border-l data-[selected]:border-r data-[selected]:text-gray-800">Sub-Department</Tab>
              </TabList>
              <TabPanels>
                <TabPanel className="px-5 py-4 bg-white border border-t-0">
                  <div className="overflow-auto">
                    <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400 overflow-hidden">
                      <caption className="text-left caption-top dark:text-gray-800">
                        <div className="flex flex-row py-2">
                          <div className="flex w-full"></div>
                          <div className="flex mb-3">
                            <button type="button" onClick={() => {setOpenAddDept(true); setFormDataDept({}); setErrors(false)}} className="h-fit flex flex-row primary-btn py-3 px-5 text-sm tracking-wider font-semibold rounded-md text-white bg-gray-800 hover:bg-gray-600 focus:outline-none"><MdAdd size={20} className="mr-2"/>Add&nbsp;Dept.</button>
                          </div> 
                        </div>
                      </caption>
                        <thead className="text-sm  text-center uppercase bg-gray-200 text-gray-800 border-b border-t border-gray-300">
                          <tr className="text-nowrap">
                          <th className="px-3 py-3">No.</th>
                          <th className="px-3 py-3">Department</th>
                          <th className="px-3 py-3">Action</th>
                          </tr>
                        </thead>
                        <tbody className="text-sm text-center bg-gray-50 dark:bg-gray-700 dark:text-gray-800 border-b-2 border-gray-300">
                        {dept.length > 0 ? (dept.map(rec => (
                          <tr className="text-sm bg-white border-b dark:bg-gray-50 dark:border-gray-300" key={rec.id}>     
                            <th className="px-3 py-3">
                              <Link className="font-medium text-blue-600 dark:text-blue-500 hover:underline mx-1">{rec.id}
                              </Link>
                            </th>
                            <td className="px-3 py-3">{rec.department}</td>
                            <td>
                            <button onClick={() => {getDeptUpdate(rec.id); setOpenUpdateDept(true); setErrors(false); setStat(1)}} className="primary-btn text-sm tracking-wider font-semibold rounded-md">
                            <FaRegEdit size={20} className="mr-2 text-green-600"/></button>
                              <button onClick={() => {openDeleteDept(rec.id)}} className="primary-btn text-sm tracking-wider font-semibold rounded-md">
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
                  <div className="overflow-auto">
                    <table className="w-full text-sm text-left rtl:text-right text-gray-500  overflow-hidden">
                      <caption className="text-left caption-top text-gray-800">
                        <div className="flex flex-row py-2">
                          <div className="flex w-full"></div>
                          <div className="flex mb-3">
                            <button type="button" onClick={() => {setOpenAddSubdept(true); setFormDataSubdept({}); setErrors(false)}} className="h-fit flex flex-row primary-btn py-3 px-5 text-sm tracking-wider font-semibold rounded-md text-white bg-gray-800 hover:bg-gray-600 focus:outline-none"><MdAdd size={20} className="mr-2"/>Add&nbsp;Sub&nbsp;Dept.</button>
                          </div> 
                        </div>
                      </caption>
                        <thead className="text-sm  text-center uppercase bg-gray-200 text-gray-800 border-b border-t border-gray-300">
                          <tr className="text-nowrap">
                          <th className="px-3 py-3">No.</th>
                          <th className="px-3 py-3">Department</th>
                          <th className="px-3 py-3">Sub-Department</th>
                          <th className="px-3 py-3">Action</th>
                          </tr>
                        </thead>
                      
                        <tbody className="text-sm text-center bg-gray-50 dark:bg-gray-700 dark:text-gray-800 border-b-2 border-gray-300">
                        {subdept.length > 0 ? (subdept.map(rec => (
                          <tr className="text-sm bg-white border-b dark:bg-gray-50 dark:border-gray-300" key={rec.id}>     
                            <th className="px-3 py-3">
                              <Link className="font-medium text-blue-600 dark:text-blue-500 hover:underline mx-1">{rec.id}
                              </Link>
                            </th>
                            <td className="px-3 py-3">{rec.department}</td>
                            <td className="px-3 py-3">{rec.department_sub}</td>
                            <td>
                            <button onClick={() => {getSubdeptUpdate(rec.id); setOpenUpdateSubdept(true); setErrors(false); setStat(2)}} className="primary-btn text-sm tracking-wider font-semibold rounded-md">
                            <FaRegEdit size={20} className="mr-2 text-green-600"/></button>
                              <button onClick={() => {openDeleteSubdept(rec.id)}} className="primary-btn text-sm tracking-wider font-semibold rounded-md">
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
              </TabPanels>
            </TabGroup>                    
            </div>
          </div>
        </div>  
      </main> 
    </div>

    {/* Add Department */}
    <Dialog open={openAddDept} onClose={setOpenAddDept} className="relative z-[999]">
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
                    <h1 className="text-2xl text-left pb-6 flex"><FaUserPlus size={30} className='mr-1'/> Add Department Record </h1>
                    
                    <form onSubmit={createDept} className='w-full mx-auto space-y-6'>
                      <div className='flex flex-row border p-2 bg-gray-100'>
                        <div className='w-full p-4'>
                          <input className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="Department" value={formDataDept.department}
                              onChange={(e) => setFormDataDept({ ...formDataDept, department: e.target.value })}
                          />
                            {errors.department && <p className="error text-red-700 text-left ml-2">{errors.department[0]}</p>}
                        </div>          
                      </div>
                        <div className="!mt-8 float-right">
                          <button className="primary-btn py-3 px-4 text-sm tracking-wider font-semibold rounded-md text-white bg-gray-800 hover:bg-gray-600 focus:outline-none"> Add Department </button>
                        </div> 
                    </form>
                        <div className="!mt-8 float-right">
                          <button onClick={() => setOpenAddDept(false)} className="primary-btn py-3 px-10 mr-4 text-sm tracking-wider font-semibold rounded-md text-white bg-gray-500 hover:bg-gray-600 focus:outline-none"> Cancel </button>
                        </div>
                    </div>
                  </div>
                </div>
            </DialogPanel>
          </div>
      </div>
    </Dialog>

    {/* Update Department */}
    <Dialog open={openUpdateDept} onClose={setOpenUpdateDept} className="relative z-[999]">
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
                    <h1 className="text-2xl text-left pb-6 flex"><FaUserEdit size={30} className='mr-1'/> Update Department Record </h1>
                    
                      <div className='flex flex-row border p-2 bg-gray-100'>
                        <div className='w-full text-left p-4'>
                        <p>ID No.:</p>
                        <input className="mb-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" disabled value={formDataDept.id} onChange={(e) => setFormDataDept({ ...formDataDept, id: e.target.value })}
                          />

                        <p>Department:</p>
                        <input className="mb-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="Type" value={formDataDept.department}
                              onChange={(e) => setFormDataDept({ ...formDataDept, department: e.target.value })}
                          />
                            {errors.department && <p className="error text-red-700 text-left ml-2">{errors.department[0]}</p>}
                        </div>          
                      </div>
                        <div className="!mt-8 float-right">
                          <button onClick={() => openUpdate(formDataDept.id)} className="primary-btn py-3 px-4 text-sm tracking-wider font-semibold rounded-md text-white bg-gray-800 hover:bg-gray-600 focus:outline-none"> Update Department </button>
                        </div> 
                    
                        <div className="!mt-8 float-right">
                          <button onClick={() => setOpenUpdateDept(false)} className="primary-btn py-3 px-10 mr-4 text-sm tracking-wider font-semibold rounded-md text-white bg-gray-500 hover:bg-gray-600 focus:outline-none"> Cancel </button>
                        </div>
                    </div>
                  </div>
                </div>
            </DialogPanel>
          </div>
      </div>
    </Dialog>

    {/* Add Sub-Department */}
    <Dialog open={openAddSubdept} onClose={setOpenAddSubdept} className="relative z-[999]">
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
                    <h1 className="text-2xl text-left pb-6 flex"><FaUserPlus size={30} className='mr-1'/> Add Sub-Department Record </h1>
                    
                    <form onSubmit={createSubdept} className='w-full mx-auto space-y-6'>
                      <div className='flex flex-row border p-2 bg-gray-100'>
                        <div className='w-full p-4'>
                        <select className='mt-4 form-select text-gray-800 bg-white text-sm px-4 w-full py-3 border border-gray-300 rounded-md outline-blue-500' onChange={(e) => setFormDataSubdept({ ...formDataSubdept, department_header_id: e.target.value })}>
                              <option value="">Select Department</option>
                            {dept.map((rec, key) =>(
                              <option value={rec.id} key={key}>{rec.department}</option>
                            ))}
                          </select>
                          {errors.department_header_id && <p className="error text-red-700 text-left ml-2">{errors.department_header_id[0]}</p>}
                          <input className="mt-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="textarea" placeholder="Sub-Department" value={formDataSubdept.department_sub}
                              onChange={(e) => setFormDataSubdept({ ...formDataSubdept, department_sub: e.target.value })}
                          />
                            {errors.department_sub && <p className="error text-red-700 text-left ml-2">{errors.department_sub[0]}</p>}
                        </div>          
                      </div>
                        <div className="!mt-8 float-right">
                          <button className="primary-btn py-3 px-4 text-sm tracking-wider font-semibold rounded-md text-white bg-gray-800 hover:bg-gray-600 focus:outline-none"> Add Sub-Department </button>
                        </div> 
                    </form>
                        <div className="!mt-8 float-right">
                          <button onClick={() => setOpenAddSubdept(false)} className="primary-btn py-3 px-10 mr-4 text-sm tracking-wider font-semibold rounded-md text-white bg-gray-500 hover:bg-gray-600 focus:outline-none"> Cancel </button>
                        </div>
                    </div>
                  </div>
                </div>
            </DialogPanel>
          </div>
      </div>
    </Dialog>

    {/* Update Sub-Department */}
    <Dialog open={openUpdateSubdept} onClose={setOpenUpdateSubdept} className="relative z-[999]">
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
                    <h1 className="text-2xl text-left pb-6 flex"><FaUserEdit size={30} className='mr-1'/> Update Sub-Department Record </h1>
                    
                      <div className='flex flex-row border p-2 bg-gray-100'>
                        <div className='w-full text-left p-4'>
                        <p>ID No.:</p>
                        <input className="mb-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" disabled value={formDataSubdept.id} onChange={(e) => setFormDataSubdept({ ...setFormDataSubdept, id: e.target.value })}
                        />

                        <p>Department:</p>
                        <select className='mb-4 form-select text-gray-800 bg-white text-sm px-4 w-full py-3 border border-gray-300 rounded-md outline-blue-500' onChange={(e) => setFormDataSubdept({ ...formDataSubdept, department_header_id: e.target.value })}>
                          <option>{formDataSubdept.department}</option>
                            {dept.map((rec, key) =>(
                          <option value={rec.id} key={key}>{rec.department}</option>
                            ))}
                        </select>
                          
                        <p>Sub-Department:</p>
                        <input className="mb-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="textarea" placeholder="Sub-Department" value={formDataSubdept.department_sub}
                            onChange={(e) => setFormDataSubdept({ ...formDataSubdept, department_sub: e.target.value })}
                          />
                          {errors.department_sub && <p className="error text-red-700 text-left ml-2">{errors.department_sub[0]}</p>}
                        </div>          
                      </div>
                        <div className="!mt-8 float-right">
                          <button onClick={() => openUpdate(formDataSubdept.id)} className="primary-btn py-3 px-4 text-sm tracking-wider font-semibold rounded-md text-white bg-gray-800 hover:bg-gray-600 focus:outline-none"> Update Sub-Department </button>
                        </div> 
                    
                        <div className="!mt-8 float-right">
                          <button onClick={() => setOpenUpdateSubdept(false)} className="primary-btn py-3 px-10 mr-4 text-sm tracking-wider font-semibold rounded-md text-white bg-gray-500 hover:bg-gray-600 focus:outline-none"> Cancel </button>
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
      body={stat + " successfully added!"}
      okConfirm={closeCreate}
      /> 
    }

    {status === 2 &&  <ConfirmBox open={open} setOpen={setOpen}
      title="Confirm Delete"
      body="Are you sure you want to delete this department?"
      okConfirm={handleDeleteDept}
      /> 
    }

    {status === 3 && <UpdateBox open={open} setOpen={setOpen}
      title="Confirm Update"
      body="Are you sure you want to update this department?"
      okConfirm={handleUpdateDept}
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
      body="Are you sure you want to update this sub-department?"
      okConfirm={handleUpdateSubdept}
      /> 
    } 
    
    {status === 7 &&  <ConfirmBox open={open} setOpen={setOpen}
      title="Confirm Delete"
      body="Are you sure you want to delete this sub-department?"
      okConfirm={handleDeleteSubdept}
      /> 
    }

    </>
  )
};
