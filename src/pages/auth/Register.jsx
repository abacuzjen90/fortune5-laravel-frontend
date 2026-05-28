import { useContext, useState, useEffect} from "react";
import { Link, useNavigate } from "react-router-dom";
import { AppContext } from "../../context/AppContext";
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';
import { FaRegTrashAlt, FaRegEdit } from "react-icons/fa";
import { MdAdd } from "react-icons/md";
import Pagination from '../../assets/components/Pagination';
import TableSort from '../../assets/components/TableSort';
import sortData from '../../assets/components/sortData';
import InfoBox from "../../assets/components/InfoBox";
import useScreenSize from "../../assets/components/useScreenSize";
import LoadingBox from '../../assets/components/Loading';
import { motion } from "framer-motion";
//import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
//import Sidebar from "../../Components/Sidebar";

export default function Register() {
    // note to unlocked this const make sure you uncomment the {token} register a new account
    // const {token, setToken} = useContext(AppContext) 
    const { token } = useContext(AppContext);
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const [openEdit, setOpenEdit] = useState(false);
    const [employee, setEmployee] = useState([]) ;
    const [branch, setBranch] = useState([]);
    const [role, setRole] = useState([]);
    const [status, setStatus] = useState(0);
    const [openinfo, setOpeninfo] = useState(false);
    const isMediumScreen = useScreenSize(768);
    const [showLoading, setShowLoading] = useState(false);
    const isLoading = () => {setShowLoading(true)};
    const stopLoading = () => {setShowLoading(false)};
    const [preview, setPreview] = useState(null);
    const [openImage, setOpenImage] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
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
        id: "",
        name: "",
        email: "",
        branch: "",
        role: "",
        password: "",
        password_confirmation: "",
        image: null,
    });


    const idFormat = (empid) => {
        return String(empid).padStart(4, "0");
    };

    const changePage = (i) => {
        setCurrentPage(i);
        const startItem = (i - 1) * dataPerPage;
        setSortdata(employee.slice(startItem, startItem + dataPerPage));
    };

    const handleChange = (value) => {
        changePage(value);
    };

    //Search
    async function searchTable() {
        const filtered = employee.filter(rec => 
        rec.name.toLowerCase().includes(search.toLowerCase()) ||
        rec.email.toLowerCase().includes(search.toLowerCase()) ||
        rec.branch.toLowerCase().includes(search.toLowerCase()) ||
        rec.role.toLowerCase().includes(search.toLowerCase())
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

    //Branch Dropdown
    const branchOptions = branch.reduce((acc, rec) => {
        const branchGroup = acc[rec.type] || [];
        return {
        ...acc, [rec.type]: [...branchGroup, rec]
    }}, {});

    const [errors, setErrors] = useState({});

    // Get Branch
    async function getBranch() {
        const res = await fetch("/api/branchdata", {
        method: "get",  
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
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

    // Get Role
    async function getRole() {
        const res = await fetch("/api/designation", {
        method: "get",  
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            Authorization: `Bearer ${token}`,
        },
        });
        const data = await res.json();
        if(res.ok) {
        setRole(data);
        }
    }
    useEffect(() => {
        getRole();
    }, []);

    async function handleRegister(e) {
        e.preventDefault();
        isLoading();
        setErrors({});

        try {
            let imagePath = null;

            // 🔥 STEP 1: Upload image (same pattern as handleCreate)
            if (formData.image instanceof File) {
            const file = formData.image;

            const signRes = await fetch(`${apiUrl}/upload-image-user`, {
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

            const signData = await signRes.json();

            if (signData.status !== 1) {
                throw new Error(signData.message || "Failed to get upload URL");
            }

            await fetch(signData.upload_url, {
                method: "PUT",
                headers: {
                "Content-Type": file.type,
                },
                body: file,
            });

            imagePath = signData.path;
            }

            // 🔥 STEP 2: Send register data (JSON only)
            const res = await fetch("/api/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                name: formData.name,
                email: formData.email,
                branch: formData.branch,
                role: formData.role,
                password: formData.password,
                password_confirmation: formData.password_confirmation,
                image: imagePath, // 👈 same as inventory pattern
            }),
            });

            const data = await res.json();

            if (data.errors) {
            setErrors(data.errors);
            return;
            }

            getEmployee();
            setStatus(2);
            setOpeninfo(true);

            setFormData({
            id: "",
            name: "",
            email: "",
            branch: "",
            role: "",
            password: "",
            password_confirmation: "",
            image: null,
            });

        } catch (error) {
            console.error("Register error:", error);
        } finally {
            stopLoading();
        }
    }


    async function getEmployee() {
    const res = await fetch("/api/employee", {
      method: "get",  
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json();
    if (res.ok) {
        setPageCount(Math.ceil(data.length / dataPerPage));
        setSortdata(data.slice(0, dataPerPage));
        setEmployee(data);
    }
    }
    useEffect(() => {
        getEmployee();
    }, [dataPerPage]);

    // Get Account Record
    async function getAccountId(id) {
    //setFormData({});
    setPreview(null);
      if(id){
        const res = await fetch(`/api/employee/${id}`, {
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
            name: data[0].name,
            email: data[0].email,
            branch: data[0].branch,
            role: data[0].role,
            image: data[0].image,
            });

            if (data[0].image) {
                setPreview(`${BASE_URL}${data[0].image}`);
            } 
        }
      }
    }
    useEffect(() => {
        getAccountId();
    }, []);

    async function updateAccount(id) {
        isLoading();
        setErrors({});

        try {
            let imagePath = formData.image; // keep existing by default

            // 🔥 STEP 1: Upload ONLY if new file is selected
            if (formData.image instanceof File) {
            const file = formData.image;

            const signRes = await fetch(`${apiUrl}/upload-image-user`, {
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

            const signData = await signRes.json();

            if (signData.status !== 1) {
                throw new Error(signData.message || "Failed to get upload URL");
            }

            await fetch(signData.upload_url, {
                method: "PUT",
                headers: {
                "Content-Type": file.type,
                },
                body: file,
            });

            imagePath = signData.path; // 👈 new uploaded path
            }

            // 🔥 STEP 2: Update user (JSON only)
            const res = await fetch(`/api/employee/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                name: formData.name,
                email: formData.email,
                branch: formData.branch,
                role: formData.role,
                password: formData.password || undefined,
                password_confirmation: formData.password_confirmation || undefined,
                image: imagePath, // 👈 important
            }),
            });

            const data = await res.json();

            console.log(data);

            if (data.errors) {
            setErrors(data.errors);
            return;
            }

            getEmployee();
            setStatus(1);
            setOpeninfo(true);

        } catch (error) {
            console.error("Update error:", error);
        } finally {
            stopLoading();
        }
    }

    async function deleteAccount(id) {
    console.log(id);
        const res = await fetch(`/api/employee/${id}`, {
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
        getEmployee();
        setStatus(3);
        setOpeninfo(true);
        }
    }

    async function closeCreate() {
        setOpeninfo(false);
        setOpenEdit(false);
        setOpen(false);
    }

    
    return (
        <>
        <div className="flex items-center font-medium border-b border-slate-300 w-full">
            <main className="px-4 flex-1 mx-auto py-4"><h1 className='text-2xl font-bold'>Register</h1></main>
        </div>

        <div className="flex items-center font-medium flex-1 mx-auto py-4">
        <main className="flex-1 mx-auto p-4">
        <div className={`overflow-x-auto transition-all duration-75 min-w-0 mx-auto ${isMediumScreen ? "w-[calc(100vw-19rem)]" : "w-[calc(100vw-6rem)]"}`}>
        <div className=" bg-gray-50 shadow-md border">
            <div className="p-6 text-gray-900 dark:text-gray-100">
              <div className="text-left caption-top dark:text-gray-800">
                <div className="flex flex-row py-2">
                  <div className="flex w-full"><h1>Employee's Account</h1></div>
                    <div className="flex mb-3">
                      <button type="button" onClick={() => {setOpen(true); setFormData({}); setErrors(false); setPreview(null)}} className="h-fit flex flex-row primary-btn py-3 px-5 text-sm tracking-wider font-semibold rounded-md text-white bg-gray-800 hover:bg-gray-600 focus:outline-none"><MdAdd size={20} className="mr-2"/>Add&nbsp;Account</button>
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
                <div className="overflow-x-auto">
                <table className="min-w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-center uppercase bg-gray-200 text-gray-800 border-b border-t border-gray-300">
                      <tr className="text-nowrap">
                      <th className="px-3 py-3">
                      <TableSort sortdata={sortdata} title="No." field="id" sorteddata={sortdata} setSorteddata={setSortdata} sorting={sorting} setSorting={setSorting} />
                      </th>
                      <th className="px-3 py-3">Employee Name</th>
                      <th className="px-3 py-3">Branch</th>
                      <th className="px-3 py-3">Role</th>
                      <th className="px-3 py-3">Email Address</th>
                      <th className="px-3 py-3">Created At</th>
                      <th className="px-3 py-3 text-center">Actions</th>
                      </tr>
                    </thead>
                  
                    <tbody className="text-xs text-center bg-gray-50 text-gray-800 border-b-2 border-gray-300">
                    {sortdata.length > 0 ? (sortdata.map(rec => (
                      <tr className="bg-white border-b dark:bg-gray-100 dark:border-gray-300 hover:bg-gray-50"  key={rec.id}>
                          <th className="px-3 py-3 text-center">{rec.id}</th>
                          <td className="px-3 py-3 text-left flex gap-3">
                            <div className="flex items-center gap-5">
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
                                src={`${BASE_URL}images/users/user.png`}
                                onClick={() => {
                                  setSelectedImage(`${BASE_URL}images/users/user.png`);
                                  setOpenImage(true);
                                }}
                                className="w-10 h-10 object-cover shadow-md rounded-md 
                                  cursor-zoom-in transform transition duration-300 
                                  hover:scale-105 hover:shadow-xl"
                              />
                            )}  
                            <span className="flex items-center h-10">
                                {rec.name}
                            </span>
                            </div>
                          </td>
                          <td className="px-3 py-3">{rec.branch}</td>
                          <td className="px-3 py-3">{rec.role}</td>
                          <td className="px-3 py-3">{rec.email}</td>
                          <td className="px-3 py-3">{new Date(rec.created_at).toLocaleString()}</td>
                          <td className="px-3 py-3 text-center">
                          <button type="button" onClick={() => {getAccountId(rec.id); setOpenEdit(true); setErrors(false)}}>
                          <FaRegEdit size={20} className="mr-2 text-green-600"/></button>
                            <button onClick={() => deleteAccount(rec.id)} className="primary-btn text-sm tracking-wider font-semibold rounded-md">
                              <FaRegTrashAlt size={20} className="text-red-600"/></button>
                          </td>
                        </tr>
                        ))) : (
                        <tr className="bg-white border-b dark:bg-gray-100 dark:border-gray-300">
                            <td className='px-3 py-3 text-center' colSpan={13}>Loading...</td>
                        </tr>
                        )}
                    </tbody>  
                </table>
            </div>
            <Pagination dataSize={employee.length} dataPPage={dataPerPage} nPages={pageCount} currentPage={currentPage} setCurrentPage={handleChange} />
          </div>
          </div>
          </div>
          </main>
        </div>

        {/* ~~~~~~~~~~~~~~~~~~~~~~~~~ MODAL REGISTRATION FORM ~~~~~~~~~~~~~~~~~~ */}
            <Dialog open={open} onClose={setOpen} className="relative z-[999]">
            <DialogBackdrop
                transition
                className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
            />

            <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                    <DialogPanel transition className="relative transform overflow-hidden text-left transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-2xl data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95">

                        <div className="flex flex-col font-[sans-serif] p-4">
                            <div className="max-w-2xl w-full mx-auto border border-gray-300 p-8 bg-gray-100">
                            <div className="text-center mb-4">
                            <h1 className="title pb-6"> Register a new account </h1>
                            {/* {token} */}
                            
                            <form onSubmit={handleRegister} className="w-full mx-auto space-y-6">
                                <div>
                                    <input className="register-link text-gray-800 bg-white border border-gray-300 w-full text-sm px-4 py-3 rounded-md outline-blue-500" type="text" placeholder="Name" value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                    {errors.name && <p className="error text-red-700 pt-2">{errors.name[0]}</p>}
                                </div>

                                <div>
                                    <input className="register-link text-gray-800 bg-white border border-gray-300 w-full text-sm px-4 py-3 rounded-md outline-blue-500" type="text" placeholder="Email" value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                    {errors.email && <p className="error text-red-700 pt-2">{errors.email[0]}</p>}
                                </div>

                                <div>
                                    <select className='form-select bg-white text-sm px-3 w-full py-3 border border-gray-300 rounded-md outline-blue-500' value={formData.branch} onChange={(e) => setFormData({ ...formData, branch: e.target.value })}>
                                    <option value="">Select Branch</option>
                                    <option value="Isabela">Isabela</option>
                                    </select>
                                    {
                                    errors.branch && <p className="error text-red-700 pt-2">{errors.branch[0]}</p>}
                                </div>

                                <div>
                                    <select className='mt-4 form-select text-gray-800 bg-white text-sm px-4 w-full py-3 border border-gray-300 rounded-md outline-blue-500' onChange={(e) => setFormData({ ...formData, role: e.target.value })}>
                                        <option value="">Select Role</option>
                                        {role.map((rec, key) => (
                                        <option key={key}>{rec.designation}</option>
                                        ))}
                                    </select>
                                    {errors.role && <p className="error text-red-700 pt-2">{errors.role[0]}</p>}
                                </div>

                                <div>
                                    <input className="register-link text-gray-800 bg-white border border-gray-300 w-full text-sm px-4 py-3 rounded-md outline-blue-500" type="password" placeholder="Password" value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    />
                                    {errors.password && <p className="error text-red-700 pt-2">{errors.password[0]}</p>}
                                </div>

                                <div>
                                    <input className="register-link text-gray-800 bg-white border border-gray-300 w-full text-sm px-4 py-3 rounded-md outline-blue-500" type="password" placeholder="Confirm Password" value={formData.password_confirmation}
                                        onChange={(e) => setFormData({ ...formData, password_confirmation: e.target.value })}
                                    />
                                </div>

                                <div>
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
                                
                                <div className="!mt-8 float-right">
                                    <button className="primary-btn w-full py-3 px-10 text-sm tracking-wider font-semibold rounded-md text-white bg-gray-800 hover:bg-gray-600 focus:outline-none"> Register </button>
                                </div>
                            </form>
                                <div className="!mt-8 float-right">
                                    <button onClick={() => setOpen(false)} className="primary-btn py-3 px-10 mr-4 text-sm tracking-wider font-semibold rounded-md text-white bg-red-500 hover:bg-red-600 focus:outline-none"> Cancel </button>
                                </div>
                            </div>
                            </div>
                        </div>

                    </DialogPanel>
                </div>
            </div>
            </Dialog>


            {/* ~~~~~~~~~~~~~~~~~~~~~~~~~ MODAL UPDATE FORM ~~~~~~~~~~~~~~~~~~ */}
            <Dialog open={openEdit} onClose={setOpenEdit} className="relative z-[999]">
            <DialogBackdrop
                transition
                className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
            />

            <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                    <DialogPanel transition className="relative transform overflow-hidden text-left transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-2xl data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95">

                        <div className="flex flex-col font-[sans-serif] p-4">
                            <div className="max-w-2xl w-full mx-auto border border-gray-300 p-8 bg-gray-100">
                            <div className="text-center mb-4 w-full mx-auto space-y-6">
                            <h1 className="title pb-3"> Update account </h1>
                            {/* {token} */}
                            
                                <div>
                                    <input className="register-link text-gray-800 bg-white border border-gray-300 w-full text-sm px-4 py-3 rounded-md outline-blue-500" type="text"  placeholder="Name" value={idFormat(formData.id)} disabled/>
                                </div>

                                <div>
                                    <input className="register-link text-gray-800 bg-white border border-gray-300 w-full text-sm px-4 py-3 rounded-md outline-blue-500" type="text"  placeholder="Name" value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                    {errors.name && <p className="error text-red-700 pt-2">{errors.name[0]}</p>}
                                </div>

                                <div>
                                    <input className="register-link text-gray-800 bg-white border border-gray-300 w-full text-sm px-4 py-3 rounded-md outline-blue-500" type="text" placeholder="Email" value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                    {errors.email && <p className="error text-red-700 pt-2">{errors.email[0]}</p>}
                                </div>

                                <div>
                                    <select className='form-select bg-white text-sm px-3 w-full py-3 border border-gray-300 rounded-md outline-blue-500' onChange={(e) => setFormData({ ...formData, branch: e.target.value })}>
                                    <option>{formData.branch}</option>
                                    {/* {Object.keys(branchOptions).map((type) => (
                                        <optgroup label={type} key={type}>
                                        {branchOptions[type].map(({str_list_id}) => (
                                            <option key={str_list_id}>{str_list_id}</option>
                                        ))}
                                        </optgroup>
                                    ))} */}
                                    </select>
                                    {
                                    errors.branch && <p className="error text-red-700 pt-2">{errors.branch[0]}</p>}
                                </div>

                                <div>
                                    <select className='form-select text-gray-800 bg-white text-sm px-4 w-full py-3 border border-gray-300 rounded-md outline-blue-500' onChange={(e) => setFormData({ ...formData, role: e.target.value })}>
                                        <option value="">{formData.role}</option>
                                        {role.map((rec, key) => (
                                        <option key={key}>{rec.designation}</option>
                                        ))}
                                    </select>
                                    {errors.role && <p className="error text-red-700 pt-2">{errors.role[0]}</p>}
                                </div>

                                <div>
                                    <input className="register-link text-gray-800 bg-white border border-gray-300 w-full text-sm px-4 py-3 rounded-md outline-blue-500" type="password" placeholder="Password" value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    />
                                    {errors.password && <p className="error text-red-700 pt-2">{errors.password[0]}</p>}
                                </div>

                                <div>
                                    <input className="register-link text-gray-800 bg-white border border-gray-300 w-full text-sm px-4 py-3 rounded-md outline-blue-500" type="password" placeholder="Confirm New Password" value={formData.password_confirmation}
                                        onChange={(e) => setFormData({ ...formData, password_confirmation: e.target.value })}
                                    />
                                </div>

                                <div>
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

                                <div className="!mt-8 float-right">
                                    <button onClick={() => updateAccount(formData.id)} className="primary-btn w-full py-3 px-10 text-sm tracking-wider font-semibold rounded-md text-white bg-gray-800 hover:bg-gray-600 focus:outline-none"> Update </button>
                                </div>
                                <div className="!mt-8 float-right">
                                    <button onClick={() => setOpenEdit(false)} className="primary-btn py-3 px-10 mr-4 text-sm tracking-wider font-semibold rounded-md text-white bg-red-500 hover:bg-red-600 focus:outline-none"> Cancel </button>
                                </div>
                            </div>
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

            {status === 1 &&  <InfoBox open={openinfo} setOpen={setOpeninfo} onClose={setOpeninfo}
                title="Confirm Success"
                body={"User successfully updated!"}
                okConfirm={closeCreate}
                /> 
            }

            {status === 2 &&  <InfoBox open={openinfo} setOpen={setOpeninfo} onClose={setOpeninfo}
                title="Confirm Success"
                body={"User successfully added!"}
                okConfirm={closeCreate}
                /> 
            }

            {status === 3 &&  <InfoBox open={openinfo} setOpen={setOpeninfo} onClose={setOpeninfo}
                title="Confirm Success"
                body="User successfully deleted!"
                okConfirm={closeCreate}
                /> 
            }
        </>
    )
}