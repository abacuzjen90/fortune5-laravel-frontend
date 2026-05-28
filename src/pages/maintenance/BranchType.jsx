import { Dialog, DialogBackdrop, DialogPanel } from '@headlessui/react';
import { useContext, useEffect, useState} from "react";
import { AppContext } from "../../context/AppContext";
import { Link } from 'react-router-dom';
import InfoBox from "../../assets/components/InfoBox";
import ConfirmBox from "../../assets/components/DeleteBox";
import UpdateBox from "../../assets/components/UpdateBox";
import { MdAdd } from "react-icons/md";
import { FaRegTrashAlt, FaRegEdit, FaUserPlus, FaUserEdit } from "react-icons/fa";
import LoadingBox from '../../assets/components/Loading';

export default function BranchType() {

  const [openAddDial, setOpenAddDial] = useState(false);
  const [openUpdateDial, setOpenUpdateDial] = useState(false);
  const [open, setOpen] = useState(false);
  const { token } = useContext(AppContext);
  const [showLoading, setShowLoading] = useState(false);
  const isLoading = () => {setShowLoading(true)};
  const stopLoading = () => {setShowLoading(false)};
  const [status, setStatus] = useState(0);
  const [branchtype, setBranchtype] = useState([]);
  const [id, setId] = useState(null);

  const [formData, setFormData] = useState({
    type: "", description: "",
  });

  const [errors, setErrors] = useState({});
  // const [message, setMessage] = useState();
  
  // Get All Branch Type
  async function getBranchtype() {
    isLoading();
    const res = await fetch("/api/branchtype");
    const data = await res.json();

    if(res.ok) {
      setBranchtype(data);
      stopLoading();
    }
  }

  useEffect(() => {
    getBranchtype();
  }, []);


  // Add Branch Type
  async function handleCreate(e) {
    e.preventDefault();
    const res = await fetch("/api/branchtype", {
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
      // setMessage(data.message);
      setOpen(true);
      setStatus(1);
      setFormData({});
      getBranchtype();
    }
  }

  async function closeCreate() {
    setOpen(false);
    setOpenAddDial(false);
  }


  // Get Branch Type
  async function getBranchtypeUpdate(id) {
    setFormData({});
    if(id){
      const res = await fetch(`/api/branchtype/${id}`);
      const data = await res.json();
      if(res.ok) {
        setFormData({
          id: data[0].id,
          type: data[0].type,
          description: data[0].description,
        });
      }
    }
  }

  useEffect(() => {
    getBranchtypeUpdate();
  }, []);


  //Update Branch Type
  async function openUpdate(id) {
    setOpen(true);
    setStatus(3);
    setId(id);
  }

  async function handleUpdate(e) {
    e.preventDefault();
    const res = await fetch(`/api/branchtype/${id}`, {
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
      getBranchtype();
    }
  }

  async function closeUpdate() {
    setOpen(false);
    setOpenUpdateDial(false);
  }


  //Delete Branch Type
  async function openDelete(id) {
    setOpen(true);
    setStatus(2);
    setId(id);
  }

  async function handleDelete(e) {
    e.preventDefault();
      const res = await fetch(`/api/branchtype/${id}`, {
        method: "delete",
        headers: {
            Authorization: `Bearer ${token}`,
        }
      });
      const data = await res.json();
      console.log(data);
      if(res.ok) {
        // setMessage(data.message);
        setStatus(5);
        getBranchtype();
      }
  }

  async function closeDelete() {
    setOpen(false);
  }


  return (
    <> 
    <div className="flex items-center font-medium border-b border-slate-300 w-full">
      <main className="ml-10 flex-1 mx-auto py-4"><h1>Maintenance - Branch Type</h1></main>
    </div>
    <div className="flex items-center font-medium flex-1 mx-auto py-4">
      <main className="flex-1 mx-auto p-4">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="bg-gray-50 shadow-md border">
            <div className="p-6 text-gray-900 dark:text-gray-100">
              <div className="text-left caption-top dark:text-gray-800">
                <div className="flex flex-row py-2">
                  <div className="flex w-full"><h1>Branch Type List</h1></div>
                  <div className="flex mb-3">
                    <button type="button" onClick={() => {setOpenAddDial(true); setFormData({}); setErrors(false)}} className="h-fit flex flex-row primary-btn py-3 px-5 text-sm tracking-wider font-semibold rounded-md text-white bg-gray-800 hover:bg-gray-600 focus:outline-none"><MdAdd size={20} className="mr-2"/>Add&nbsp;Branch&nbsp;Type</button>
                  </div> 
                </div>
              </div>
              <div className="overflow-auto">
                <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400 overflow-hidden">
                  <thead className="text-sm text-center uppercase bg-gray-200 text-gray-800 border-b border-t border-gray-300">
                    <tr className="text-nowrap">
                    <th className="px-3 py-3">No.</th>
                    <th className="px-3 py-3">Type</th>
                    <th className="px-3 py-3">Description</th>
                    <th className="px-3 py-3">Action</th>
                    </tr>
                  </thead>
                
                  <tbody className="text-sm text-center bg-gray-50 text-gray-800 border-b-2 border-gray-300">
                  {branchtype.length > 0 ? (branchtype.map(rec => (
                    <tr className="text-sm bg-white border-b dark:bg-gray-100 dark:border-gray-300" key={rec.id}>     
                        <th className="px-3 py-3">
                          <Link className="font-medium text-blue-600 dark:text-blue-500 hover:underline mx-1">{rec.id}
                          </Link>
                        </th>
                        <td className="px-3 py-3">{rec.type}</td>
                        <td className="px-3 py-3">{rec.description ? rec.description : "-"}</td>
                        <td>
                        <button onClick={() => {getBranchtypeUpdate(rec.id); setOpenUpdateDial(true); setErrors(false)}} className="primary-btn text-sm tracking-wider font-semibold rounded-md">
                        <FaRegEdit size={20} className="mr-2 text-green-600"/></button>
                          <button onClick={() => openDelete(rec.id)} className="primary-btn text-sm tracking-wider font-semibold rounded-md">
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
            </div>
          </div>
        </div>  
      </main> 
    </div>

    {/* Add Branch Type */}
    <Dialog open={openAddDial} onClose={setOpenAddDial} className="relative z-[999]">
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
                    <h1 className="text-2xl text-left pb-6 flex"><FaUserPlus size={30} className='mr-1'/> Add Branch Type Record </h1>
                    
                    <form onSubmit={handleCreate} className='w-full mx-auto space-y-6'>
                      <div className='flex flex-row border p-2 bg-gray-100'>
                        <div className='w-full p-4'>
                          <input className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="Type" value={formData.type}
                              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                          />
                            {errors.type && <p className="error text-red-700 text-left ml-2">{errors.type[0]}</p>}

                          <textarea className="mt-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="textarea" placeholder="Description" value={formData.description}
                              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          />
                            {/* {errors.description && <p className="error text-red-700 text-left ml-2">{errors.description[0]}</p>} */}
                        </div>          
                      </div>
                        <div className="!mt-8 float-right">
                          <button className="primary-btn py-3 px-4 text-sm tracking-wider font-semibold rounded-md text-white bg-gray-800 hover:bg-gray-600 focus:outline-none"> Add Branch Type </button>
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

    {/* Update Branch Type */}
    <Dialog open={openUpdateDial} onClose={setOpenUpdateDial} className="relative z-[999]">
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
                    <h1 className="text-2xl text-left pb-6 flex"><FaUserEdit size={30} className='mr-1'/> Update Branch Type Record </h1>
                    
                      <div className='flex flex-row border p-2 bg-gray-100'>
                        <div className='w-full text-left p-4'>
                          <p>ID No.:</p>
                          <input className="mb-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" disabled value={formData.id} onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                            />

                          <p>Type:</p>
                          <input className="mb-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="Type" value={formData.type}
                              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                          />
                            {errors.type && <p className="error text-red-700 text-left ml-2">{errors.type[0]}</p>}

                        <p>Description:</p>
                          <textarea className="mb-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="textarea" placeholder="Description" value={formData.description}
                              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          />

                        </div>          
                      </div>
                        <div className="!mt-8 float-right">
                          <button onClick={() => openUpdate(formData.id)} className="primary-btn py-3 px-4 text-sm tracking-wider font-semibold rounded-md text-white bg-gray-800 hover:bg-gray-600 focus:outline-none"> Update Branch Type </button>
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
      body="Branch type successfully added!"
      okConfirm={closeCreate}
      /> 
    }

    {status === 2 &&  <ConfirmBox open={open} setOpen={setOpen}
      title="Confirm Delete"
      body="Are you sure you want to delete this branch type?"
      okConfirm={handleDelete}
      /> 
    }

    {status === 3 && <UpdateBox open={open} setOpen={setOpen}
      title="Confirm Update"
      body="Are you sure you want to update this branch type?"
      okConfirm={handleUpdate}
      /> 
    }

    {status === 4 &&  <InfoBox open={open} setOpen={setOpen} onClose={setOpen}
      title="Confirm Success"
      body="Branch type successfully updated!"
      okConfirm={closeUpdate}
      /> 
    }

    {status === 5 &&  <InfoBox open={open} setOpen={setOpen} onClose={setOpen}
      title="Confirm Success"
      body="Branch type successfully deleted!"
      okConfirm={closeDelete}
      /> 
    }
    
    </>
  )
};
