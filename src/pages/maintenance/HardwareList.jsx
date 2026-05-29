import { Dialog, DialogBackdrop, DialogPanel } from '@headlessui/react';
import { useContext, useEffect, useState} from "react";
import { AppContext } from "../../context/AppContext";
import { Link } from 'react-router-dom';
import InfoBox from "../../assets/components/InfoBox";
import ConfirmBox from "../../assets/components/DeleteBox";
import UpdateBox from "../../assets/components/UpdateBox";
import { MdAdd } from "react-icons/md";
import { FaRegTrashAlt, FaRegEdit, FaUserEdit, FaUserPlus, FaHammer } from "react-icons/fa";
import Pagination from '../../assets/components/Pagination';
import TableSort from '../../assets/components/TableSort';
import LoadingBox from '../../assets/components/Loading';
import sortData from '../../assets/components/sortData';
import useScreenSize from "../../assets/components/useScreenSize";
import { motion } from "framer-motion";

export default function Hardware() {

  const [openAddDial, setOpenAddDial] = useState(false);
  const [openUpdateDial, setOpenUpdateDial] = useState(false);
  const [open, setOpen] = useState(false);
  const { token } = useContext(AppContext);
  const [showLoading, setShowLoading] = useState(false);
  const isLoading = () => {setShowLoading(true)};
  const stopLoading = () => {setShowLoading(false)};
  const [status, setStatus] = useState(0);
  const [hardware, setHardware] = useState([]);
  const [id, setId] = useState(null);
  const [preview, setPreview] = useState(null);
  const [openImage, setOpenImage] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const isMediumScreen = useScreenSize(768);
  const apiUrl = import.meta.env.VITE_API_URL;
  const BASE_URL = "https://111hardware-images.s3.ap-southeast-1.amazonaws.com/";
  

  //Table Pagination, Search
  const [sortdata, setSortdata] = useState([]);
  const [sorting, setSorting] = useState({ key: "", ascending: true });
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageCount, setPageCount] = useState(0);
  const [dataPerPage, setDataperpage] = useState(10);

  const [formData, setFormData] = useState({
    product_name: "", sku: "", cost_per_unit: "", reorder_level: "", image: null,
  });

  const [errors, setErrors] = useState({});

  const changePage = (i) => {
    setCurrentPage(i);
    const startItem = (i - 1) * dataPerPage;
    setSortdata(hardware.slice(startItem, startItem + dataPerPage));
  };

  const handleChange = (value) => {
    changePage(value);
  };



  //Search and Table Sorting
  async function searchTable() {
    const filtered = hardware.filter(rec => 
      rec.product_name.toLowerCase().includes(search.toLowerCase()) ||
      rec.sku.toLowerCase().includes(search.toLowerCase())
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
  
  // Get Hardware List
  async function getHardware() {
    isLoading();
    const res = await fetch("/api/inventoryitem", {
      method: "GET",
      headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
    });
    const data = await res.json();
    if(res.ok) {
      setHardware(data);
      setPageCount(Math.ceil(data.length / dataPerPage));
      setSortdata(data.slice(0, dataPerPage));
      stopLoading();
    }
  }

  useEffect(() => {
    getHardware();
  }, [dataPerPage]);


  // Add Hardware
  async function handleCreate(e) {
    e.preventDefault();

    setErrors({});

    const newErrors = {};
    if (!(formData.product_name || "").trim()) newErrors.product_name = ["Product Name is required."];
    if (!(formData.sku || "").trim()) newErrors.sku = ["SKU is required."];
    if (!formData.cost_per_unit || isNaN(formData.cost_per_unit)) newErrors.cost_per_unit = ["Cost must be a number."];
    if (!formData.reorder_level || isNaN(formData.reorder_level)) newErrors.reorder_level = ["Reorder Level must be a number."];

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      isLoading();

      let imagePath = null;

      // 🔥 ONLY upload here (on submit)
      if (formData.image) {
        const file = formData.image;

        // 1. get signed URL
        const res = await fetch(`${apiUrl}/upload-image-item`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            file_name: file.name,
            file_type: file.type,
          }),
        });

        const data = await res.json();

        if (data.status !== 1) {
          throw new Error("Failed to get upload URL");
        }

        // 2. upload to S3
        await fetch(data.upload_url, {
          method: "PUT",
          headers: {
            "Content-Type": file.type,
          },
          body: file,
        });

        imagePath = data.path;
      }

      // 🔥 now send JSON only
      const res = await fetch(`${apiUrl}/addinventoryitem`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          product_name: formData.product_name,
          sku: formData.sku,
          cost_per_unit: formData.cost_per_unit,
          reorder_level: formData.reorder_level,
          image: imagePath,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        if (data?.errors) {
          setErrors(data.errors);
        } else {
          console.error("Server error", res.status, res.statusText);
        }
        return;
      }

      const data = await res.json();
      console.log(data);

      setOpen(true);
      setStatus(1);

      setFormData({
        product_name: "",
        sku: "",
        cost_per_unit: "",
        reorder_level: "",
        image: null,
      });

      setPreview(null);
      getHardware();

    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      stopLoading();
    }
  }


  async function closeCreate() {
    setOpen(false);
    setOpenAddDial(false);
  }

  
  // Get Hardware
  async function getHardwareUpdate(id) {
    isLoading();
    setFormData({
      product_name: "",
      sku: "",
      cost_per_unit: "",
      reorder_level: "",
      image: null, // initialize
    });
    setPreview(null); // reset preview

    if (id) {
      try {
        const res = await fetch(`/api/inventoryitem/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json"
        }
      });
        const data = await res.json();  

        if (res.ok && data.length > 0) {
          const item = data[0];
          setFormData({
            id: item.id,
            product_name: item.product_name,
            sku: item.sku,
            cost_per_unit: item.cost_per_unit,
            reorder_level: item.reorder_level,
            image: item.image || null, // assign image path
          });

          // Optional: set preview if you have an <img> for preview
          if (item.image) {
            setPreview(`${BASE_URL}${item.image}`);
          } 
          // else {
          //   setPreview(`http://127.0.0.1:8000/storage/inventory_images/tools.jpg`);
          // }
        }
      } catch (error) {
        console.error("Error fetching hardware:", error);
      }
    }

    stopLoading();
  }



  //Update Hardware
  async function openUpdate(id) {
    setOpen(true);
    setStatus(3);
    setId(id);
  }

  // Update Hardware
  async function handleUpdate(e) {
    e.preventDefault();
    isLoading();

    setErrors({});

    // validation
    const newErrors = {};
    if (!(formData.product_name || "").trim()) newErrors.product_name = ["Product Name is required."];
    if (!(formData.sku || "").trim()) newErrors.sku = ["SKU is required."];
    if (!formData.cost_per_unit || isNaN(formData.cost_per_unit)) newErrors.cost_per_unit = ["Cost must be a number."];
    if (!formData.reorder_level || isNaN(formData.reorder_level)) newErrors.reorder_level = ["Reorder Level must be a number."];

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      stopLoading();
      return;
    }

    try {
      let imagePath = formData.image; 
      // 👆 could be:
      // - string (existing image path)
      // - File (new upload)
      // - null

      // 🔥 If user selected NEW image → upload first
      if (formData.image instanceof File) {
        const file = formData.image;

        // 1. get signed URL
        const resUpload = await fetch(`${apiUrl}/upload-image-item`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            file_name: file.name,
            file_type: file.type,
          }),
        });

        const uploadData = await resUpload.json();

        if (uploadData.status !== 1) {
          throw new Error("Failed to get upload URL");
        }

        // 2. upload to S3
        await fetch(uploadData.upload_url, {
          method: "PUT",
          headers: {
            "Content-Type": file.type,
          },
          body: file,
        });

        imagePath = uploadData.path; // 👈 new image path
      }

      // 🔥 send JSON (NO FormData anymore)
      const res = await fetch(`${apiUrl}/updateinventoryitem/${id}`, {
        method: "POST", // or PUT if your backend supports it
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          product_name: formData.product_name,
          sku: formData.sku,
          cost_per_unit: formData.cost_per_unit,
          reorder_level: formData.reorder_level,
          image: imagePath, // 👈 string path only
        }),
      });

      const data = await res.json();
      console.log(res.status, data);

      if (data.errors) {
        setErrors(data.errors);
        setOpen(false);
      } else {
        setStatus(4);
        getHardware();
      }

    } catch (error) {
      console.error("Update error:", error);
    } finally {
      stopLoading();
    }
  }


  async function closeUpdate() {
    setOpen(false);
    setOpenUpdateDial(false);
  }


  //Delete Hardware
  async function openDelete(id) {
    setOpen(true);
    setStatus(2);
    setId(id);
  }

  async function handleDelete(e) {
    e.preventDefault();
      const res = await fetch(`/api/inventoryitem/${id}`, {
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
        getHardware();
      }
  }

  async function closeDelete() {
    setOpen(false);
  }


  return (
    <> 
    <div className="flex items-center font-medium border-b border-slate-300 w-full">
      <main className="px-4 flex-1 mx-auto py-4"><h1 className='text-2xl font-bold'>Maintenance - Hardware</h1></main>
    </div>
    <div className="flex items-center font-medium flex-1 mx-auto py-4 ">
      <main className="flex-1 mx-auto p-4">
        <div className={`overflow-x-auto transition-all duration-75 min-w-0 mx-auto ${isMediumScreen ? "w-[calc(100vw-19rem)]" : "w-[calc(100vw-6rem)]"}`}>
          <div className="bg-gray-50 shadow-md border">
            <div className="p-6 text-gray-900 dark:text-gray-100">
              <div className="text-left caption-top dark:text-gray-800">
                <div className="flex flex-row py-2">
                  <div className="flex w-full"><h1>Hardware List</h1></div>
                    <div className="flex mb-3">
                      <button type="button" onClick={() => {setOpenAddDial(true); setFormData({}); setErrors(false); setPreview(null)}} className="h-fit flex flex-row primary-btn py-3 px-5 text-sm tracking-wider font-semibold rounded-md text-white bg-gray-800 hover:bg-gray-600 focus:outline-none"><MdAdd size={20} className="mr-2"/>Add&nbsp;Hardware</button>
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
                      <th className="px-3 py-3">
                        <TableSort title="No." field="id" sorteddata={sortdata} setSorteddata={setSortdata} sorting={sorting} setSorting={setSorting} />
                      </th>
                      <div className="w-full text-left">
                        <th className="px-3 py-3 text-left">
                        <TableSort title="Product Name" field="product_name" sorteddata={sortdata} setSorteddata={setSortdata} sorting={sorting} setSorting={setSorting} />
                        </th>
                      </div>
                      <th className="px-3 py-3">
                        <TableSort title="SKU" field="sku" sorteddata={sortdata} setSorteddata={setSortdata} sorting={sorting} setSorting={setSorting} />
                      </th>
                      <th className="px-3 py-3">
                        <TableSort title="Cost Per Unit" field="cost_per_unit" sorteddata={sortdata} setSorteddata={setSortdata} sorting={sorting} setSorting={setSorting} />
                      </th>
                      <th className="px-3 py-3">Reorder Level</th>
                      <th className="px-3 py-3">Image</th>
                      <th className="px-3 py-3">Action</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm text-center bg-gray-50 dark:bg-gray-100 dark:text-gray-800 border-b-2 border-gray-300">
                    {sortdata.length > 0 ? (sortdata.map(rec => (
                      <tr className="text-sm bg-white border-b dark:bg-gray-100 dark:border-gray-300 hover:bg-gray-50" key={rec.id}>     
                          <th className="px-3 py-3">
                            <Link className="font-medium text-blue-600 dark:text-blue-500 hover:underline mx-1">{rec.id}
                            </Link>
                          </th>
                          <td className="px-3 py-3 text-left">{rec.product_name}</td>
                          <td className="px-3 py-3">{rec.sku}</td>
                          <td className="px-3 py-3 text-right">₱{rec.cost_per_unit.toFixed(2)}</td>
                          <td className="px-3 py-3">{rec.reorder_level}</td>
                          <td className="py-2 flex justify-center items-center">
                            {rec.image ? (
                              <img
                                src={`${BASE_URL}${rec.image}`}
                                alt={rec.image}
                                key={rec.id}
                                onClick={() => {
                                  setSelectedImage(`${BASE_URL}${rec.image}`);
                                  setOpenImage(true);
                                }}
                                className="w-10 h-10 object-cover shadow-md rounded-md 
                                  cursor-zoom-in transform transition duration-300 
                                  hover:scale-105 hover:shadow-xl"
                              />
                            ) : (
                              <img
                                src={`${BASE_URL}images/hardware/tools.jpg`}
                                onClick={() => {
                                  setSelectedImage(`${BASE_URL}images/hardware/tools.jpg`);
                                  setOpenImage(true);
                                }}
                                className="w-10 h-10 object-cover shadow-md rounded-md 
                                  cursor-zoom-in transform transition duration-300 
                                  hover:scale-105 hover:shadow-xl"
                              />
                            )}  
                          </td>
                          <td>
                          <button onClick={() => {getHardwareUpdate(rec.id); setOpenUpdateDial(true); setErrors(false)}} className="primary-btn text-sm tracking-wider font-semibold rounded-md">
                          <FaRegEdit size={20} className="mr-2 text-green-600"/></button>
                            <button onClick={() => openDelete(rec.id)} className="primary-btn text-sm tracking-wider font-semibold rounded-md">
                              <FaRegTrashAlt size={20} className="text-red-600"/></button>
                          </td>
                          
                        </tr>
                    ))) : (
                      <tr className='text-xs bg-white border-b dark:bg-gray-100 dark:border-gray-300'>
                        <td className='px-3 py-3 text-center' colSpan={13}>No Data</td>
                      </tr>
                    )}
                     </tbody>                        
                  </table>
                </div> 
                <Pagination dataSize={hardware.length} dataPPage={dataPerPage} nPages={pageCount} currentPage={currentPage} setCurrentPage={handleChange} />
            </div>
          </div>
        </div>  
      </main> 
    </div>

    {/* Add Hardware */}
    <Dialog open={openAddDial} onClose={setOpenAddDial} className="relative z-[999]">
      <DialogBackdrop
          transition
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
      />

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <DialogPanel transition className="relative transform overflow-hidden transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-2xl data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"> 

            <div className="flex flex-col font-[sans-serif]">
                <div className="w-full mx-auto border border-gray-300 p-8 bg-gray-50">
                  <div className="text-center mb-4">
                    <h1 className="text-2xl text-left pb-6 flex"><FaHammer size={30} className='mr-1'/> Add Hardware </h1>
                    
                    <form onSubmit={handleCreate} className='w-full mx-auto space-y-6'>
                      <div className='flex flex-row border p-2 bg-gray-100'>
                        <div className='w-full p-4'>
                          <input className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="Product Name" value={formData.product_name}
                              onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
                          />
                            {errors.product_name && <p className="error text-red-700 text-left ml-2">{errors.product_name[0]}</p>}

                          <input className="mt-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="SKU" value={formData.sku}
                              onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                          />
                            {errors.sku && <p className="error text-red-700 text-left ml-2">{errors.sku[0]}</p>}

                          <input className="mt-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="number" placeholder="Cost Per Unit" value={formData.cost_per_unit || ""}
                              onChange={(e) => setFormData({ ...formData, cost_per_unit: e.target.value })}
                          />
                            {errors.cost_per_unit && <p className="error text-red-700 text-left ml-2">{errors.cost_per_unit[0]}</p>}

                          <input className="mt-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="number" placeholder="Reorder Level" value={formData.reorder_level || ""}
                              onChange={(e) => setFormData({ ...formData, reorder_level: e.target.value })}
                          />
                            {errors.reorder_level && <p className="error text-red-700 text-left ml-2">{errors.reorder_level[0]}</p>}

                          <input className="mt-4 block w-full text-sm px-4 py-1 text-gray-700 border border-gray-300 rounded-md cursor-pointer bg-white file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-800 file:text-white hover:file:bg-gray-600" name="image" type="file" accept="image/*" onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              setFormData({ ...formData, image: file });
                              // store preview URL in state
                              setPreview(URL.createObjectURL(file));
                            }
                          }} />
                            {errors.image && <p className="error text-red-700 text-left ml-2">{errors.image[0]}</p>}
                            {preview && (
                              <div className="mt-3 flex flex-col items-center">
                                <img
                                  src={preview}
                                  alt="Preview"
                                  className="w-64 h-64 object-cover rounded-md border"
                                />
                              </div>
                            )}
                        </div>          
                      </div>
                        <div className="!mt-8 float-right">
                          <button className="primary-btn py-3 px-4 text-sm tracking-wider font-semibold rounded-md text-white bg-gray-800 hover:bg-gray-600 focus:outline-none"> Add Hardware </button>
                        </div> 
                    </form>
                        <div className="!mt-8 float-right">
                          <button onClick={() => setOpenAddDial(false)} className="primary-btn py-3 px-10 mr-4 text-sm tracking-wider font-semibold rounded-md text-white bg-red-500 hover:bg-red-600 focus:outline-none"> Cancel </button>
                        </div>
                    </div>
                  </div>
                </div>
            </DialogPanel>
          </div>
      </div>
    </Dialog>

    {/* Update Hardware */}
    <Dialog open={openUpdateDial} onClose={setOpenUpdateDial} className="relative z-[999]">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
      />

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <DialogPanel
            transition
            className="relative transform overflow-hidden transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-2xl data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
          >
            <div className="flex flex-col font-[sans-serif]">
              <div className="w-full mx-auto border border-gray-300 p-8 bg-gray-50">
                <h1 className="text-2xl text-left pb-6 flex">
                  <FaHammer size={30} className="mr-1" /> Update Hardware
                </h1>

                <form onSubmit={(e) => {e.preventDefault(); openUpdate(formData.id)}} className="w-full mx-auto space-y-6">
                  <div className="flex flex-row border p-2 bg-gray-100">
                    <div className="w-full p-4 text-left">
                      {/* ID */}
                      <p>ID No.:</p>
                      <input
                        className="mb-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500"
                        type="text"
                        disabled
                        value={formData.id || ""}
                      />

                      {/* Product Name */}
                      <p>Product Name:</p>
                      <input
                        className="mb-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500"
                        type="text"
                        placeholder="Product Name"
                        value={formData.product_name || ""}
                        onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
                      />
                      {errors.product_name && <p className="error text-red-700 text-left ml-2">{errors.product_name[0]}</p>}

                      {/* SKU */}
                      <p>SKU:</p>
                      <input
                        className="mb-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500"
                        type="text"
                        placeholder="SKU"
                        value={formData.sku || ""}
                        onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                      />
                      {errors.sku && <p className="error text-red-700 text-left ml-2">{errors.sku[0]}</p>}

                      {/* Cost */}
                      <p>Cost Per Unit:</p>
                      <input
                        className="mb-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500"
                        type="number"
                        placeholder="Cost Per Unit"
                        value={formData.cost_per_unit || ""}
                        onChange={(e) => setFormData({ ...formData, cost_per_unit: e.target.value })}
                      />
                      {errors.cost_per_unit && <p className="error text-red-700 text-left ml-2">{errors.cost_per_unit[0]}</p>}

                      {/* Reorder Level */}
                      <p>Reorder Level:</p>
                      <input
                        className="mb-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500"
                        type="number"
                        placeholder="Reorder Level"
                        value={formData.reorder_level || ""}
                        onChange={(e) => setFormData({ ...formData, reorder_level: e.target.value })}
                      />
                      {errors.reorder_level && <p className="error text-red-700 text-left ml-2">{errors.reorder_level[0]}</p>}

                      {/* Image Upload */}
                      <p>Image:</p>
                      <input
                        type="file"
                        accept="image/*"
                        name="image"
                        className="block w-full text-sm px-4 py-1 text-gray-700 border border-gray-300 rounded-md cursor-pointer bg-white file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-800 file:text-white hover:file:bg-gray-600"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            setFormData({ ...formData, image: file });
                            setPreview(URL.createObjectURL(file));
                          }
                        }}
                      />
                      {errors.image && <p className="error text-red-700 text-left ml-2">{errors.image[0]}</p>}

                      {preview ? (
                        <div className="mt-3 flex flex-col items-center">
                          <img
                            src={preview}
                            alt="Preview"
                            className="w-64 h-64 object-cover rounded-md border"
                          />
                        </div>
                      ) : (
                        <div className='p-4 text-center'>
                          <p>No Uploaded Image</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex justify-end mt-6 gap-4">
                    <button
                      type="submit"
                      className="primary-btn py-3 px-4 text-sm tracking-wider font-semibold rounded-md text-white bg-gray-800 hover:bg-gray-600 focus:outline-none"
                    >
                      Update Hardware
                    </button>

                    <button
                      type="button"
                      onClick={() => setOpenUpdateDial(false)}
                      className="primary-btn py-3 px-10 text-sm tracking-wider font-semibold rounded-md text-white bg-red-500 hover:bg-red-600 focus:outline-none"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>

   {/* Image Modal */}
    <Dialog open={openImage} onClose={() => setOpenImage(false)} className="relative z-[999]">
      <DialogBackdrop className="fixed inset-0 bg-black/70 transition-opacity" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="bg-transparent">
          {selectedImage && (
            <motion.img
              key={selectedImage}
              src={selectedImage}
              alt="Large preview"
              className="max-h-[80vh] max-w-full object-contain rounded-lg shadow-2xl cursor-zoom-out"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              onClick={() => setOpenImage(false)} // click image to close
            />
          )}
        </DialogPanel>
      </div>
    </Dialog>

    
    <LoadingBox open={showLoading} onClose={stopLoading} setOpen={stopLoading} />

    {status === 1 &&  <InfoBox open={open} setOpen={setOpen} onClose={setOpen}
      title="Confirm Success"
      body="Hardware successfully added!"
      okConfirm={closeCreate}
      /> 
    }

    {status === 2 &&  <ConfirmBox open={open} setOpen={setOpen}
      title="Confirm Delete"
      body="Are you sure you want to delete this hardware?"
      okConfirm={handleDelete}
      /> 
    }

    {status === 3 && <UpdateBox open={open} setOpen={setOpen}
      title="Confirm Update"
      body="Are you sure you want to update this hardware?"
      okConfirm={handleUpdate}
      /> 
    }

    {status === 4 &&  <InfoBox open={open} setOpen={setOpen} onClose={setOpen}
      title="Confirm Success"
      body="Hardware successfully updated!"
      okConfirm={closeUpdate}
      /> 
    }

    {status === 5 &&  <InfoBox open={open} setOpen={setOpen} onClose={setOpen}
      title="Confirm Success"
      body="Hardware successfully deleted!"
      okConfirm={closeDelete}
      /> 
    }
    
    </>
  )
};
