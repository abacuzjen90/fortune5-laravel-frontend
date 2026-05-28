import { useContext, useEffect, useState, useRef} from "react";
import { AppContext } from "../../context/AppContext";
import { useNavigate, useParams } from 'react-router-dom';
import DeleteBox from "../../assets/components/DeleteBox";
import UpdateBox from "../../assets/components/UpdateBox";
import InfoBox from "../../assets/components/InfoBox";
import LoadingBox from "../../assets/components/Loading";
import { FaRegTrashAlt, FaRegEdit, FaUpload, FaRegUser, FaFile } from "react-icons/fa";
import { Dialog, DialogBackdrop, DialogPanel } from '@headlessui/react';
import Currency from "../../assets/components/CurrencyFormat";

export default function EmployeeDetails() { 
  const { id } = useParams();
  const { user, token } = useContext(AppContext);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState(0);
  const [designation, setDesignation] = useState([]);
  const [branch, setBranch] = useState([]);
  const [department, setDepartment] = useState([]);
  const [loandetails, setLoandetails] = useState([]);
  const [filters, setFilters] = useState([]);
  const [image, setImage] = useState(null);
  const [prevImage, setPrevImage] = useState(null);
  const [profileImage, setProfileImage] = useState([]);
  const [imagedisp, setImagedisp] = useState([]);
  const [message, setMessage] = useState('');
  const [imgId, setImgId] = useState(null);
  const fileInputRef = useRef(null);
  const [imageSize, setImageSize] = useState(null);
  const [openAddLoan, setOpenAddLoan] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
  const isLoading = () => {setShowLoading(true)};
  const stopLoading = () => {setShowLoading(false)};

  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    branch: "", department: "", designation: "", salary_type: "",
    first_name: "", middle_name: "", last_name: "",
    address: "", dateofbirth: "",
    age: "", gender: "", contact_number: "", pagibig: "",
    sss: "", philhealth: "", tin: "", 
    basic_pay: "", cola: "", employment_status: "",
    datehired: "", dateregularized: "",  remarks: "",
    employee_type: "",
    pag_ibig_prem: "", cash_loan: "", cash_bond: "", sss_loan: "", mp2: "",
    emp_liab: "", health_card: "", sss_calamity: "", sss_lrp: "", hdmf_loan: "", calamity: "",
    cash_loan_amount: "", cash_bond_amount: "", sss_loan_amount: "", mp2_amount: "", hdmf_loan_amount: "", sss_calamity_amount: "", health_card_amount: "", sss_lrp_amount: "", calamity_amount: "",
    cash_loan_term: "", cash_bond_term: "", sss_loan_term: "", mp2_term: "", hdmf_loan_term: "", sss_calamity_term: "", health_card_term: "", sss_lrp_term: "", calamity_term: "",
  });

  const [picData] = useState({
    masterlist_id: "", encoder: "", encoded: "", profile_image: "",
  });


    const handleImageChange = (e) => {
      setMessage(null);
      const file = e.target.files[0];
      const sizeMb = (file.size / 1024 / 1024);
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
          setMessage('Invalid file type. Please upload an image.');
          setPrevImage(null);
          setImageSize(0);
          fileInputRef.current.value = null;
      } else  if (file.size > 5 * 1024 * 1024) {
        setMessage('File size should be less than 5MB.');
        setPrevImage(null);
        setImageSize(0);
        fileInputRef.current.value = null;
        return;
    } else {
        setPrevImage(URL.createObjectURL(e.target.files[0]));
        setImage(file);
        setImageSize(sizeMb.toFixed(2));
      };
    }

    const handleUploadImage = async (e) => {
      e.preventDefault();
      if (!image) {
        setMessage('Please select an image!');
      } else {
        isLoading();
      const formData = new FormData();
      formData.append('photo', image);
      formData.append('masterlist_id', picData.masterlist_id);
      formData.append('encoder', picData.encoder);
      formData.append('encoded', picData.encoded);
      formData.append('profile_image', picData.profile_image);
      try {
        const res = await fetch('http://127.0.0.1:8000/api/uploadimage', {
          method: 'POST',
          body: formData,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (res.ok) {
          setPrevImage(null);
          getImage();
          setOpen(true);
          setStatus(9);
          fileInputRef.current.value = null;
          setImageSize(null);
          stopLoading();
        } else {
          setMessage('Error uploading image!,');
        }
      } catch (error) {
        setMessage('Error uploading image!.');
        console.error(error);
      }
    }
    };

    async function handleDeleteImg(e) {
      e.preventDefault();
        const res = await fetch(`/api/deleteimage/${imgId}`, {
          method: "delete",
          headers: {
              Authorization: `Bearer ${token}`,
          }
        });
        if(res.ok) {
          getImage();
          getProfileImage();
          setStatus(6);
        }
    }

    // Get Image
  async function getImage() {
    const res = await fetch(`/api/showimage/${id}`, {
      method: "get",  
      headers: { Authorization: `Bearer ${token}` },
  });
      const data = await res.json();
      setImagedisp(data);
  }
  useEffect(() => {
    getImage();
  }, []);

    // Get Profile Image
    async function getProfileImage() {
      const res = await fetch(`/api/showprofileimage/${id}`, {
        method: "get",  
        headers: { Authorization: `Bearer ${token}` },
    });
        const data = await res.json();
        setProfileImage(data);
    }
    useEffect(() => {
      getProfileImage();
    }, []);

    async function ToProfileImage(e) {
      e.preventDefault();
      isLoading();
      await fetch(`/api/unprofileimage/${id}`, {
        method: "put",
        headers: { Authorization: `Bearer ${token}` },
      });

      await fetch(`/api/toprofileimage/${imgId}`, {
        method: "put",
        headers: { Authorization: `Bearer ${token}` },
      });
      setStatus(8);
      getProfileImage();
      stopLoading();
    }


  //Datepicker
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFilters({
        ...filters,
        [name]: value,
    });
    console.log(value);
  };

  // Get Branch
  async function getBranch() {
    const res = await fetch("/api/branchdata", {
      method: "get",  
      headers: { Authorization: `Bearer ${token}` },
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
      headers: { Authorization: `Bearer ${token}` },
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


  // Get Employee
    async function getEmpdetails() {
      isLoading();
      const res = await fetch(`/api/masterlists/${id}`);
      const data = await res.json();
      if(res.ok) {
        setFormData({
          id: data[0].id,
          branch: data[0].branch,
          department: data[0].department,
          designation: data[0].designation,
          salary_type: data[0].salary_type,
          first_name: data[0].first_name,
          middle_name: data[0].middle_name,
          last_name: data[0].last_name,
          address: data[0].address,
          dateofbirth: data[0].dateofbirth,
          age: data[0].age,
          gender: data[0].gender,
          contact_number: data[0].contact_number,
          pagibig: data[0].pagibig,
          sss: data[0].sss,
          philhealth:data[0].philhealth,
          tin: data[0].tin,
          basic_pay: data[0].basic_pay,
          cola: data[0].cola,
          employment_status: data[0].employment_status,
          datehired: data[0].datehired,
          dateregularized: data[0].dateregularized,
          remarks: data[0].remarks,
          employee_type: data[0].employee_type,
          pag_ibig_prem: data[0].pag_ibig_prem,
          cash_loan: data[0].cash_loan,
          cash_bond: data[0].cash_bond,
          sss_loan: data[0].sss_loan,
          mp2: data[0].mp2,
          emp_liab: data[0].emp_liab,
          health_card: data[0].health_card,
          sss_calamity: data[0].sss_calamity,
          sss_lrp: data[0].sss_lrp,
          hdmf_loan: data[0].hdmf_loan,
          calamity: data[0].calamity,
          cash_loan_amount: data[0].cash_loan_amount,
          sss_loan_amount: data[0].sss_loan_amount,
          hdmf_loan_amount: data[0].hdmf_loan_amount,
          sss_calamity_amount: data[0].sss_calamity_amount,
          health_card_amount: data[0].health_card_amount,
          sss_lrp_amount: data[0].sss_lrp_amount,
          calamity_amount: data[0].calamity_amount,
          cash_loan_term: data[0].cash_loan_term,
          cash_bond_term: data[0].cash_bond_term,
          sss_loan_term: data[0].sss_loan_term,
          mp2_term: data[0].mp2_term,
          hdmf_loan_term: data[0].hdmf_loan_term,
          sss_calamity_term: data[0].sss_calamity_term,
          health_card_term: data[0].health_card_term,
          sss_lrp_term: data[0].sss_lrp_term,
          calamity_term: data[0].calamity_term,
        });
      }
      stopLoading();
    }
    useEffect(() => {
      getEmpdetails();
    }, []);

  //Update Employee
    async function handleUpdate(e) {
      e.preventDefault();

      if(formData.employee_type == "Monthly") {
        formData.sss_loan_amount = parseFloat((formData.sss_loan / formData.sss_loan_term / 2).toFixed(2));
        formData.hdmf_loan_amount = parseFloat((formData.hdmf_loan / formData.hdmf_loan_term / 2).toFixed(2));
        formData.sss_calamity_amount = parseFloat((formData.sss_calamity / formData.sss_calamity_term / 2).toFixed(2));
        formData.sss_lrp_amount = parseFloat((formData.sss_lrp / formData.sss_lrp_term / 2).toFixed(2));
        formData.calamity_amount = parseFloat((formData.calamity / formData.calamity_term / 2).toFixed(2));
        formData.cash_bond_amount = parseFloat((formData.cash_bond / formData.cash_bond_term / 2).toFixed(2));
        formData.mp2_amount = parseFloat((formData.mp2 / formData.mp2_term / 2).toFixed(2));
      } else if(formData.employee_type == "Weekly") {
        formData.sss_loan_amount = parseFloat((formData.sss_loan / formData.sss_loan_term / 4).toFixed(2));
        formData.hdmf_loan_amount = parseFloat((formData.hdmf_loan / formData.hdmf_loan_term / 4).toFixed(2));
        formData.sss_calamity_amount = parseFloat((formData.sss_calamity / formData.sss_calamity_term / 4).toFixed(2));
        formData.sss_lrp_amount = parseFloat((formData.sss_lrp / formData.sss_lrp_term / 4).toFixed(2));
        formData.calamity_amount = parseFloat((formData.calamity / formData.calamity_term / 4).toFixed(2));
        formData.cash_bond_amount = parseFloat((formData.cash_bond / formData.cash_bond_term / 4).toFixed(2));
        formData.mp2_amount = parseFloat((formData.mp2 / formData.mp2_term / 4).toFixed(2));
      }

      console.log(formData.sss_loan_amount);
      const res = await fetch(`/api/masterlists/${id}`, {
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
        setOpen(false);
      } else {
        setStatus(4);
      }
    }

    async function handleDelete(e) {
      e.preventDefault();
        const res = await fetch(`/api/masterlists/${id}`, {
          method: "delete",
          headers: {
              Authorization: `Bearer ${token}`,
          }
        });
        if(res.ok) {
          setStatus(3);
        }
    }
    
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

  // Get Loan Details
  async function getLoanDetails() {
    const res = await fetch(`/api/masterlists/${id}`);
    const data = await res.json();
    if(res.ok) {
      setLoandetails(data);
    }
  }
  useEffect(() => {
    getLoanDetails();
  }, []);

    async function openDelete() {
      setOpen(true);
      setStatus(1);
    }

    async function openDeleteImg(id) {
      setOpen(true);
      setStatus(5);
      setImgId(id);
    }

    async function openToProfileImg(id) {
      setOpen(true);
      setStatus(7);
      setImgId(id);
    }

    async function closeDelete() {
      setOpen(false);
      navigate('/maintenance/employee');
    }

    async function closeImg() {
      setOpen(false);
      navigate(`/maintenance/employee/details/${id}`);
    }
    

    async function openUpdate() {
      setOpen(true);
      setStatus(2);
    }

    async function closeUpdate() {
      setOpen(false);
      navigate('/maintenance/employee');
    }

    function loanTerm(term) {
      return term == 6 ? term + " Months" : term > 6 ? (term/12) + " Year/s" : "Term";  
    }

  return (
    <> 
    <div className="flex items-center font-medium border-b border-slate-300">
      <main className="ml-10 flex-1 mx-auto py-4"><h1>Maintenance - Employee</h1></main>
    </div>

    <div className="flex items-center font-medium flex-1 mx-auto py-4">
      <main className="flex-1 mx-auto p-8">
        <div className="sm:px-6 lg:px-8">  
          <div className="bg-white dark:bg-gray-200 shadow-sm sm:rounded-lg">
            <div className="px-10 py-4 text-gray-900">
            <div className="flex flex-row">
              <div className="flex w-full"><h1 className='py-6'>Employee Details</h1></div>
              <div className="flex mb-3 mt-5">
                <button onClick={() => openUpdate()} className="h-fit flex flex-row mr-3 primary-btn py-3 px-6 text-sm tracking-wider font-semibold rounded-md text-white bg-gray-800 hover:bg-gray-600 focus:outline-none"><FaRegEdit size={16} className="mr-2"/>Update</button>

                <button onClick={() => openDelete()} className="h-fit flex flex-row primary-btn py-3 px-6 text-sm tracking-wider font-semibold rounded-md text-white bg-gray-800 hover:bg-gray-600 focus:outline-none"><FaRegTrashAlt size={16} className="mr-2"/> Delete</button>
              </div>
            </div>
                <div>
                  {profileImage.length > 0 ? (profileImage.map(img => (
                      <img src={`http://localhost:8000/storage/images/${img.photo}`} alt={img.photo} key={img.id} className="mb-4 mr-4 w-48 h-48 object-cover rounded-full shadow-md"/>
                  ))) : (
                    <img src="http://localhost:8000/storage/images/default_pic.jpg" alt="defaultpic" className="mb-4 mr-4 w-48 h-48 object-cover rounded-full shadow-md"/>
                  )} 
                </div>
              <div className="py-4 flex w-full mx-auto space-y-6">
                <div className='flex flex-row border p-4 bg-gray-100'>
                  <div className='p-4 w-1/2'>
                  <label>Branch:</label>
                    <select className='mb-4 form-select bg-white text-sm px-3 w-full py-3 border border-gray-300 rounded-md outline-blue-500' onChange={(e) => setFormData({ ...formData, branch: e.target.value })}>
                      <option>{formData.branch}</option>
                      {Object.keys(branchOptions).map((type) => (
                        <optgroup label={type} key={type}>
                          {branchOptions[type].map(({str_list_id}) => (
                            <option key={str_list_id}>{str_list_id}</option>
                          ))}
                        </optgroup>
                      ))}
                    </select>

                    <label>Employee Number:</label>
                    <input className="mb-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" disabled value={formData.id}/>

                    <label>Department:</label>
                    <select className='mb-4 form-select text-gray-800 bg-white text-sm px-4 w-full py-3 border border-gray-300 rounded-md outline-blue-500' onChange={(e) => setFormData({ ...formData, department: e.target.value })}>
                      <option>{formData.department}</option>
                      {Object.keys(deptOptions).map((department) => (
                        <optgroup label={department} key={department}>
                          {deptOptions[department].map(({department_sub}) => (
                            <option key={department_sub}>{department_sub}</option>
                          ))}
                        </optgroup>
                      ))}
                    </select>

                    <label>Designation:</label>
                    <select className='mb-4 form-select text-gray-800 bg-white text-sm px-4 w-full py-3 border border-gray-300 rounded-md outline-blue-500' onChange={(e) => setFormData({ ...formData, designation: e.target.value })}>
                      <option>{formData.designation}</option>
                      {designation.map((rec, key) =>(
                        <option key={key}>{rec.designation}</option>
                      ))}
                    </select>

                    <label>Payroll Type:</label>
                    <select className='mb-4 form-select text-gray-800 bg-white text-sm px-4 w-full py-3 border border-gray-300 rounded-md outline-blue-500' onChange={(e) => setFormData({ ...formData, employee_type: e.target.value })}>
                      <option>{formData.employee_type}</option>
                      <option>Monthly</option>
                      <option>Weekly</option>
                      <option>Daily</option>
                    </select>

                    <label>Full Name:</label>
                    <div className='flex mb-4'>
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
                        
                    <label>Address:</label>
                    <input className="mb-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="Address" value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    />
                      {errors.address && <p className="error text-red-700 text-left ml-2">{errors.address[0]}</p>}         

                    <label>Date of Birth:</label>
                      <input name='dob' className="mb-2 register-link px-4 py-3 w-full border border-gray-300 text-sm text-gray-800 rounded-md outline-blue-500" type="date" value={formData.dateofbirth = filters.dob || formData.dateofbirth} onChange={handleInputChange}
                      />

                    <label>Age:</label>
                    <input className="mb-2 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="Age" value={formData.age}
                        onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    />
                      {errors.age && <p className="error text-red-700 text-left ml-2">{errors.age[0]}</p>}    

                    <label>Gender:</label>
                    <select className='mb-2 form-select text-gray-800 bg-white text-sm px-4 w-full py-3 border border-gray-300 rounded-md outline-blue-500' onChange={(e) => setFormData({ ...formData, gender: e.target.value })}>
                      <option>{formData.gender}</option>
                      <option>Male</option>
                      <option>Female</option>
                      <option>Others</option>
                    </select>

                    <label>Contact Number:</label>
                    <input className="mb-2 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="Contact Number" value={formData.contact_number}
                        onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
                    />
                      {errors.contact_number && <p className="error text-red-700 text-left ml-2">{errors.contact_number[0]}</p>}  
                  </div>

                  <div className='p-4 w-1/2'>
                    <label>SSS:</label>
                    <input className="mb-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="SSS" value={formData.sss}
                        onChange={(e) => setFormData({ ...formData, sss: e.target.value })}
                    />
                      {errors.sss && <p className="error text-red-700 text-left ml-2">{errors.sss[0]}</p>}

                    <label>Pag-Ibig:</label>
                    <input className="mb-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="Pag-Ibig" value={formData.pagibig}
                        onChange={(e) => setFormData({ ...formData, pagibig: e.target.value })}
                    />
                      {errors.pagibig && <p className="error text-red-700 text-left ml-2">{errors.pagibig[0]}</p>}
                    
                    <label>PhilHealth:</label>
                    <input className="mb-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="PhilHealth" value={formData.philhealth}
                        onChange={(e) => setFormData({ ...formData, philhealth: e.target.value })}
                    />
                      {errors.philhealth && <p className="error text-red-700 text-left ml-2">{errors.philhealth[0]}</p>}

                    <label>TIN:</label>
                    <input className="mb-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="TIN" value={formData.tin}
                        onChange={(e) => setFormData({ ...formData, tin: e.target.value })}
                    />
                      {errors.tin && <p className="error text-red-700 text-left ml-2">{errors.tin[0]}</p>}

                    <label>Salary Type:</label>
                    <select className='mb-4 form-select text-gray-800 bg-white text-sm px-4 w-full py-3 border border-gray-300 rounded-md outline-blue-500' onChange={(e) => setFormData({ ...formData, salary_type: e.target.value })}>
                      <option>{formData.salary_type}</option>
                      <option>Per Trip</option>
                      <option>Daily</option>
                      <option>Semi-Monthly</option>
                    </select> 

                    <label>Basic Salary:</label>
                    <input className="mb-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="Basic Salary" value={formData.basic_pay}
                        onChange={(e) => setFormData({ ...formData, basic_pay: e.target.value })}
                    />
                      {errors.basic_pay && <p className="error text-red-700 text-left ml-2">{errors.basic_pay[0]}</p>}

                    <label>COLA:</label>
                    <input className="mb-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="Cola" value={formData.cola}
                        onChange={(e) => setFormData({ ...formData, cola: e.target.value })}
                    />
                      {errors.cola && <p className="error text-red-700 text-left ml-2">{errors.cola[0]}</p>}

                      <label>Employment Status:</label>
                      <select className='mb-4 form-select text-gray-800 bg-white text-sm px-4 w-full py-3 border border-gray-300 rounded-md outline-blue-500' onChange={(e) => setFormData({ ...formData, employment_status: e.target.value })}>
                        <option>{formData.employment_status}</option>
                        <option>Regular</option>
                        <option>Per Project</option>
                        <option>Terminated</option>
                        <option>Resigned</option>
                        <option>Casual</option>
                        <option>Sub-Contractor</option>
                        <option>Probationary</option>
                        <option>Fixed-Term</option>
                      </select>

                      <label>Date Hired:</label>
                      <input name='dhired' className="mb-4 register-link px-4 py-3 w-full border border-gray-300 text-sm text-gray-800 rounded-md outline-blue-500" type="date" value={formData.datehired = filters.dhired || formData.datehired} onChange={handleInputChange}
                      />

                      <label>Date Regularized:</label>
                      <input name='dregularized' className="mb-4 register-link px-4 py-3 w-full border border-gray-300 text-sm text-gray-800 rounded-md outline-blue-500" type="date" value={formData.dateregularized = filters.dregularized || formData.dateregularized} onChange={handleInputChange}
                      />

                    <label>Remarks:</label>
                    <input className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="Remarks" value={formData.remarks}
                        onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                    />
                  </div>  
                </div>
              </div>

              <div className="flex flex-row w-full py-4"> 
                <fieldset className="w-full border border-slate-400 p-3 bg-gray-100">
                  <legend className="text-xl">Loan Details</legend>
                  <div className="flex flex-row">
                  <div className="flex w-full"></div>
                    <div className="flex">
                      <button onClick={() => {setOpenAddLoan(true)}} className="h-fit flex flex-row mr-3 primary-btn py-2 px-4 text-sm tracking-wider font-semibold rounded-md text-white bg-gray-800 hover:bg-gray-600 focus:outline-none"><FaFile size={16} className="mr-2"/>Loan&nbsp;Details</button>
                    </div>
                  </div>
                  <div className="flex flex-row">
                    <div className="p-4 w-1/2">
                      <div>HDMF Premium</div>
                      <div className="flex">
                        <input className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="Pag-Ibig Premium" value={formData.pag_ibig_prem} onChange={(e) => setFormData({ ...formData, pag_ibig_prem: e.target.value })} />
                        {/* <select className='form-select text-gray-800 bg-white text-sm px-4 w-2/6 py-3 ml-2 border border-gray-300 rounded-md outline-blue-500'>
                          <option value="">Term</option>
                          <option value={6}>6 Months</option>
                          <option value={12}>1 Year</option>
                          <option value={24}>2 Years</option>
                          <option value={36}>3 Years</option>
                        </select> */}
                      </div>  
                      {errors.pag_ibig_prem && <p className="error text-red-700 text-left ml-2">{errors.pag_ibig_prem[0]}</p>}

                      <div className="mt-4">Cash Loan</div>
                      <div className="flex">
                        <input className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="Cash Loan" value={formData.cash_loan} onChange={(e) => setFormData({ ...formData, cash_loan: e.target.value })} />
                      </div>
                      {errors.cash_loan && <p className="error text-red-700 text-left ml-2">{errors.cash_loan[0]}</p>}

                      <div className="mt-4">Cash Bond</div>
                      <div className="flex">
                        <input className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-4/6 py-3 rounded-md outline-blue-500" type="text" placeholder="Cash Bond" value={formData.cash_bond} onChange={(e) => setFormData({ ...formData, cash_bond: e.target.value })} />
                        <select className='form-select text-gray-800 bg-white text-sm px-4 w-2/6 py-3 ml-2 border border-gray-300 rounded-md outline-blue-500' onChange={(e) => setFormData({ ...formData, cash_bond_term: e.target.value })}>
                        <option value="">{loanTerm(formData.cash_bond_term)}</option>
                          <option value={6}>6 Months</option>
                          <option value={12}>1 Year</option>
                          <option value={24}>2 Years</option>
                          <option value={36}>3 Years</option>
                        </select>
                      </div>
                      {errors.cash_bond_term && <p className="error text-red-700 text-left ml-2">{errors.cash_bond_term[0]}</p>}

                      <div className="mt-4">SSS Loan</div>
                      <div className="flex">
                        <input className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-4/6 py-3 rounded-md outline-blue-500" type="text" placeholder="SSS Loan" value={formData.sss_loan} onChange={(e) => setFormData({ ...formData, sss_loan: e.target.value })} />
                        <select className='form-select text-gray-800 bg-white text-sm px-4 w-2/6 py-3 ml-2 border border-gray-300 rounded-md outline-blue-500' onChange={(e) => setFormData({ ...formData, sss_loan_term: e.target.value })}>
                          <option value="">{loanTerm(formData.sss_loan_term)}</option>
                          <option value={6}>6 Months</option>
                          <option value={12}>1 Year</option>
                          <option value={24}>2 Years</option>
                          <option value={36}>3 Years</option>
                        </select>
                      </div>
                      {errors.sss_loan && <p className="error text-red-700 text-left ml-2">{errors.sss_loan[0]}</p>}

                      <div className="mt-4">MP2</div>
                      <div className="flex">
                        <input className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-4/6 py-3 rounded-md outline-blue-500" type="text" placeholder="MP2" value={formData.mp2} onChange={(e) => setFormData({ ...formData, mp2: e.target.value })} />
                        <select className='form-select text-gray-800 bg-white text-sm px-4 w-2/6 py-3 ml-2 border border-gray-300 rounded-md outline-blue-500' onChange={(e) => setFormData({ ...formData, mp2_term: e.target.value })}>
                        <option value="">{loanTerm(formData.mp2_term)}</option>
                          <option value={6}>6 Months</option>
                          <option value={12}>1 Year</option>
                          <option value={24}>2 Years</option>
                          <option value={36}>3 Years</option>
                        </select>
                      </div>
                      {errors.mp2 && <p className="error text-red-700 text-left ml-2">{errors.mp2[0]}</p>}

                      <div className="mt-4">Employee Liabilities</div>
                      <div className="flex">
                        <input className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="Employee Liabilities" value={formData.emp_liab} onChange={(e) => setFormData({ ...formData, emp_liab: e.target.value })} />
                        {/* <select className='form-select text-gray-800 bg-white text-sm px-4 w-2/6 py-3 ml-2 border border-gray-300 rounded-md outline-blue-500'>
                          <option value="">Term</option>
                          <option value={6}>6 Months</option>
                          <option value={12}>1 Year</option>
                          <option value={24}>2 Years</option>
                          <option value={36}>3 Years</option>
                        </select> */}
                      </div>
                      {errors.emp_liab && <p className="error text-red-700 text-left ml-2">{errors.emp_liab[0]}</p>}
                    </div>

                    <div className="p-4 w-1/2">
                      <div >Health Card</div>
                      <div className="flex">
                      <input className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="Health Card" value={formData.health_card} onChange={(e) => setFormData({ ...formData, health_card: e.target.value })} />
                      {/* <select className='form-select text-gray-800 bg-white text-sm px-4 w-2/6 py-3 ml-2 border border-gray-300 rounded-md outline-blue-500' onChange={(e) => setFormData({ ...formData, health_card_term: e.target.value })}>
                      <option value="">{loanTerm(formData.health_card_term)}</option>
                        <option value={6}>6 Months</option>
                        <option value={12}>1 Year</option>
                        <option value={24}>2 Years</option>
                        <option value={36}>3 Years</option>
                      </select> */}
                      </div>  
                      {errors.health_card && <p className="error text-red-700 text-left ml-2">{errors.health_card[0]}</p>}

                      <div className="mt-4">SSS Calamity</div>
                      <div className="flex">
                      <input className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-4/6 py-3 rounded-md outline-blue-500" type="text" placeholder="SSS Calamity" value={formData.sss_calamity} onChange={(e) => setFormData({ ...formData, sss_calamity: e.target.value })} />
                      <select className='form-select text-gray-800 bg-white text-sm px-4 w-2/6 py-3 ml-2 border border-gray-300 rounded-md outline-blue-500' onChange={(e) => setFormData({ ...formData, sss_calamity_term: e.target.value })}>
                          <option value="">{loanTerm(formData.sss_calamity_term)}</option>
                          <option value={6}>6 Months</option>
                          <option value={12}>1 Year</option>
                          <option value={24}>2 Years</option>
                          <option value={36}>3 Years</option>
                        </select>
                      </div>
                      {errors.sss_calamity && <p className="error text-red-700 text-left ml-2">{errors.sss_calamity[0]}</p>}

                      <div className="mt-4">SSS LRP</div>
                      <div className="flex">
                        <input className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-4/6 py-3 rounded-md outline-blue-500" type="text" placeholder="SSS LRP" value={formData.sss_lrp} onChange={(e) => setFormData({ ...formData, sss_lrp: e.target.value })} />
                        <select className='form-select text-gray-800 bg-white text-sm px-4 w-2/6 py-3 ml-2 border border-gray-300 rounded-md outline-blue-500' onChange={(e) => setFormData({ ...formData, sss_lrp_term: e.target.value })}>
                          <option value="">{loanTerm(formData.sss_lrp_term)}</option>
                          <option value={6}>6 Months</option>
                          <option value={12}>1 Year</option>
                          <option value={24}>2 Years</option>
                          <option value={36}>3 Years</option>
                        </select>
                      </div>
                      {errors.sss_lrp && <p className="error text-red-700 text-left ml-2">{errors.sss_lrp[0]}</p>}

                      <div className="mt-4">HDMF Loan</div>
                      <div className="flex">
                        <input className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-4/6 py-3 rounded-md outline-blue-500" type="text" placeholder="HDMF Loan" value={formData.hdmf_loan} onChange={(e) => setFormData({ ...formData, hdmf_loan: e.target.value })} />
                        <select className='form-select text-gray-800 bg-white text-sm px-4 w-2/6 py-3 ml-2 border border-gray-300 rounded-md outline-blue-500' onChange={(e) => setFormData({ ...formData, hdmf_loan_term: e.target.value })}>
                          <option value="">{loanTerm(formData.hdmf_loan_term)}</option>
                          <option value={6}>6 Months</option>
                          <option value={12}>1 Year</option>
                          <option value={24}>2 Years</option>
                          <option value={36}>3 Years</option>
                        </select>
                      </div>
                      {errors.hdmf_loan && <p className="error text-red-700 text-left ml-2">{errors.hdmf_loan[0]}</p>}

                      <div className="mt-4">HDMF Calamity</div>
                      <div className="flex">
                        <input className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-4/6 py-3 rounded-md outline-blue-500" type="text" placeholder="Calamity Loan" value={formData.calamity} onChange={(e) => setFormData({ ...formData, calamity: e.target.value })} />
                        <select className='form-select text-gray-800 bg-white text-sm px-4 w-2/6 py-3 ml-2 border border-gray-300 rounded-md outline-blue-500' onChange={(e) => setFormData({ ...formData, calamity_term: e.target.value })}>
                          <option value="">{loanTerm(formData.calamity_term)}</option>
                          <option value={6}>6 Months</option>
                          <option value={12}>1 Year</option>
                          <option value={24}>2 Years</option>
                          <option value={36}>3 Years</option>
                        </select>
                      </div>
                      {errors.calamity && <p className="error text-red-700 text-left ml-2">{errors.calamity[0]}</p>}
                    </div>
                  </div>
                </fieldset>
              </div>

              <div className="mt-4">
                <fieldset className="w-full border border-slate-400 bg-gray-100 p-3">
                  <legend className="text-xl">Upload Image</legend>
                <div className="py-2 text">
                  <form onSubmit={handleUploadImage} encType="multipart/form-data" className="flex p-2 bg-white rounded-lg">
                    <input type="file" onChange={handleImageChange} accept="image/*" ref={fileInputRef}/><div className="w-full"></div>
                    <input hidden defaultValue={picData.masterlist_id = formData.id}/>
                    <input hidden defaultValue={picData.encoded = formData.branch}/>
                    <input hidden defaultValue={picData.encoder = user.id}/>
                    <input hidden defaultValue={picData.profile_image = 'n'}/>
                    
                    <button className="h-fit flex flex-row primary-btn py-2 px-4 text-sm tracking-wider font-semibold rounded-md text-white bg-gray-800 hover:bg-gray-600 focus:outline-none"><FaUpload size={16} className="mr-2"/>Upload</button>
                  </form>
                  {message && <p className="text-right p-2 text-red-600">{message}</p>}
                  {prevImage && <img src={prevImage} width={300} className="mt-4 w-48 h-48 object-cover rounded-lg shadow-md"/>}
                  {imageSize && <p className="mb-4">{imageSize}MB</p>}
                </div>
                <div className="py-5 px-5 bg-white rounded-lg">
                  <ul className="flex">
                  {imagedisp.length > 0 ? (imagedisp.map((img, key) => (
                    <li key={key}>
                        <img src={`http://localhost:8000/storage/images/${img.photo}`} alt={img.photo} className="mb-4 mr-4 w-48 h-48 object-cover rounded-lg shadow-md"/>
                        <button onClick={() => openDeleteImg(img.id)}><FaRegTrashAlt size={20} className="text-red-600 mr-1"/></button>
                        <button onClick={() => openToProfileImg(img.id)}><FaRegUser size={20} className="text-blue-600" title="Make Profile"/></button>
                    </li>
                  ))) : (
                      <li>No Uploaded Image</li>
                    )}
                  </ul>
                </div>
                </fieldset>
              </div>
            </div>
          </div>
        </div>  
      </main>
    </div>
    
    {/* Add Loan */}
    <Dialog open={openAddLoan} onClose={setOpenAddLoan} className="relative z-[999]">
      <DialogBackdrop
          transition
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
      />
      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <DialogPanel transition className="relative transform overflow-hidden rounded-lg transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-5xl data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"> 
            <div className="flex flex-col font-[sans-serif]">
                <div className="w-full mx-auto border border-gray-300 rounded-2xl p-8 bg-gray-50">
                  <div className="text-center mb-4">
                    <h1 className="text-2xl text-left pb-6"> Employee Loan Details </h1>
                    {loandetails.map((rec, key) => (
                      <div className='flex flex-row text-left border p-2 bg-gray-100' key={key}>
                        <div className='w-full p-4'>
                          <div className=" bg-white p-3 mb-2 font">
                            <div className="font-bold">Pag-Ibig Premium</div><hr/>
                            {rec.pag_ibig_prem == null ? <div className="p-2 mt-2 text-center text-sm">No Record</div> : 
                            <>
                            <div className="p-2 flex text-sm">
                              <div className="w-3/5">Amount: {Currency(rec.pag_ibig_prem)}</div>
                            </div><hr/>
                            <div className="p-2 mt-2 text-sm text-right">
                              Computation Here
                            </div>
                            </>
                            }
                          </div>

                          <div className=" bg-white p-3 mb-2 font">
                            <div className="font-bold">Cash Loan</div><hr/>
                            {rec.cash_loan != null ? <div className="p-2 mt-2 text-center text-sm">No Record <br/> Cash Loan: {Currency(rec.cash_loan)} <br/> Basic Salary: {Currency(rec.basic_pay)} * 30% <br/>Approx. Deduction: {Currency((rec.basic_pay / 2) * 0.3)} <br/> Approx. Months to Pay: {Math.ceil(rec.cash_loan / (rec.basic_pay * 0.3))}</div> : 
                            <>
                            <div className="p-2 flex text-sm">
                              <div className="w-3/5">Amount: {Currency(rec.cash_loan)}</div>
                            </div><hr/>
                            <div className="p-2 mt-2 text-sm text-right">
                              Computation Here
                            </div>
                            </>
                            }
                          </div>

                          <div className=" bg-white p-3 mb-2 font">
                            <div className="font-bold">Cash Bond</div><hr/>
                            {rec.cash_bond == null ? <div className="p-2 mt-2 text-center text-sm">No Record</div> : 
                            <>
                            <div className="p-2 flex text-sm">
                              <div className="w-3/5">Amount: {Currency(rec.cash_bond)}</div>
                            </div><hr/>
                            <div className="p-2 mt-2 text-sm text-right">
                              Computation Here
                            </div>
                            </>
                            }
                          </div>
    
                          <div className=" bg-white p-3 mb-2 font">
                            <div className="font-bold">SSS Loan</div><hr/>
                            {rec.sss_loan == null ? <div className="p-2 mt-2 text-center text-sm">No Loan</div> : 
                            <>
                            <div className="p-2 flex text-sm">
                              <div className="w-3/5">Amount: {Currency(rec.sss_loan)}</div><div>Term: {loanTerm(rec.sss_loan_term)}</div>
                            </div><hr/>
                            <div className="p-2 mt-2 text-sm text-right">
                              Computation: {rec.employee_type} <br/>
                              {rec.employee_type == "Monthly" ?
                               (<> {Currency(rec.sss_loan)} / {rec.sss_loan_term} Months / 2 (Cutoff) <br/> = {Currency(rec.sss_loan_amount)} </>) :
                                rec.employee_type == "Weekly" ?
                                (<> {Currency(rec.sss_loan)} / {rec.sss_loan_term} Months / 4 (Cutoff) <br/> = {Currency(rec.sss_loan_amount)} </>) : ""}
                            </div>
                            </>
                            }
                          </div>
                          
                          <div className=" bg-white p-3 mb-2 font">
                            <div className="font-bold">MP2</div><hr/>
                            {rec.mp2 == null ? <div className="p-2 mt-2 text-center text-sm">No Record</div> : 
                            <>
                            <div className="p-2 flex text-sm">
                              <div className="w-3/5">Amount: {Currency(rec.mp2)}</div>
                            </div><hr/>
                            <div className="p-2 mt-2 text-sm text-right">
                              Computation Here
                            </div>
                            </>
                            }
                          </div>

                          <div className=" bg-white p-3 mb-2 font">
                            <div className="font-bold">Employee Liabilities</div><hr/>
                            {rec.emp_liab == null ? <div className="p-2 mt-2 text-center text-sm">No Record</div> : 
                            <>
                            <div className="p-2 flex text-sm">
                              <div className="w-3/5">Amount: {Currency(rec.emp_liab)}</div>
                            </div><hr/>
                            <div className="p-2 mt-2 text-sm text-right">
                              Computation Here
                            </div>
                            </>
                            }
                          </div>
                        </div>

                        <div className="w-full p-4">
                          <div className=" bg-white p-3 mb-2 font">
                            <div className="font-bold">Health Card</div><hr/>
                            {rec.health_card == null ? <div className="p-2 mt-2 text-center text-sm">No Record</div> : 
                            <>
                            <div className="p-2 flex text-sm">
                              <div className="w-3/5">Amount: {Currency(rec.health_card)}</div>
                            </div><hr/>
                            <div className="p-2 mt-2 text-sm text-right">
                              Computation Here
                            </div>
                            </>
                            }
                          </div>

                          <div className=" bg-white p-3 mb-2 font">
                            <div className="font-bold">SSS Calamity</div><hr/>
                            {rec.sss_calamity == null ? <div className="p-2 mt-2 text-center text-sm">No Loan</div> : 
                            <>
                            <div className="p-2 flex text-sm">
                              <div className="w-3/5">Amount: {Currency(rec.sss_calamity)}</div><div>Term: {loanTerm(rec.sss_calamity_term)}</div>
                            </div><hr/>
                            <div className="p-2 mt-2 text-sm text-right">
                              Computation: {rec.employee_type} <br/>
                              {rec.employee_type == "Monthly" ?
                               (<> {Currency(rec.sss_calamity)} / {rec.sss_calamity_term} Months / 2 (Cutoff) <br/> = {Currency(rec.sss_calamity_amount)} </>) :
                                rec.employee_type == "Weekly" ?
                                (<> {Currency(rec.sss_calamity)} / {rec.sss_calamity_term} Months / 4 (Cutoff) <br/> = {Currency(rec.sss_calamity_amount)} </>) : ""}
                            </div>
                            </>
                            }
                          </div>

                          <div className=" bg-white p-3 mb-2 font">
                            <div className="font-bold">SSS LRP</div><hr/>
                            {rec.sss_lrp == null ? <div className="p-2 mt-2 text-center text-sm">No Loan</div> : 
                            <>
                            <div className="p-2 flex text-sm">
                              <div className="w-3/5">Amount: {Currency(rec.sss_lrp)}</div><div>Term: {loanTerm(rec.sss_lrp_term)}</div>
                            </div><hr/>
                            <div className="p-2 mt-2 text-sm text-right">
                              Computation: {rec.employee_type} <br/>
                              {rec.employee_type == "Monthly" ?
                               (<> {Currency(rec.sss_lrp)} / {rec.sss_lrp_term} Months / 2 (Cutoff) <br/> = {Currency(rec.sss_lrp_amount)} </>) :
                                rec.employee_type == "Weekly" ?
                                (<> {Currency(rec.sss_lrp)} / {rec.sss_lrp_term} Months / 4 (Cutoff) <br/> = {Currency(rec.sss_lrp_amount)} </>) : ""}
                            </div>
                            </>
                            }
                          </div>

                          <div className=" bg-white p-3 mb-2 font">
                            <div className="font-bold">HDMF Loan</div><hr/>
                            {rec.hdmf_loan == null ? <div className="p-2 mt-2 text-center text-sm">No Loan</div> : 
                            <>
                            <div className="p-2 flex text-sm">
                              <div className="w-3/5">Amount: {Currency(rec.hdmf_loan)}</div><div>Term: {loanTerm(rec.hdmf_loan_term)}</div>
                            </div><hr/>
                            <div className="p-2 mt-2 text-sm text-right">
                              Computation: {rec.employee_type} <br/>
                              {rec.employee_type == "Monthly" ?
                               (<> {Currency(rec.hdmf_loan)} / {rec.hdmf_loan_term} Months / 2 (Cutoff) <br/> = {Currency(rec.hdmf_loan_amount)} </>) :
                                rec.employee_type == "Weekly" ?
                                (<> {Currency(rec.hdmf_loan)} / {rec.hdmf_loan_term} Months / 4 (Cutoff) <br/> = {Currency(rec.hdmf_loan_amount)} </>) : ""}
                            </div>
                            </>
                            }
                          </div>

                          <div className=" bg-white p-3 mb-2 font">
                            <div className="font-bold">Calamity Loan</div><hr/>
                            {rec.calamity == null ? <div className="p-2 mt-2 text-center text-sm">No Loan</div> : 
                            <>
                            <div className="p-2 flex text-sm">
                              <div className="w-3/5">Amount: {Currency(rec.calamity)}</div><div>Term: {loanTerm(rec.calamity_term)}</div>
                            </div><hr/>
                            <div className="p-2 mt-2 text-sm text-right">
                              Computation: {rec.employee_type} <br/>
                              {rec.employee_type == "Monthly" ?
                               (<> {Currency(rec.calamity)} / {rec.calamity_term} Months / 2 (Cutoff) <br/> = {Currency(rec.calamity_amount)} </>) :
                                rec.employee_type == "Weekly" ?
                                (<> {Currency(rec.calamity)} / {rec.calamity_term} Months / 4 (Cutoff) <br/> = {Currency(rec.calamity_amount)} </>) : ""}
                            </div>
                            </>
                            }
                          </div>

                        </div>
                      </div>
                    ))}
                        <div className="!mt-8 float-right">
                          <button className="primary-btn py-3 px-4 text-sm tracking-wider font-semibold rounded-md text-white bg-gray-800 hover:bg-gray-600 focus:outline-none"> Print Record </button>
                        </div> 
                    </div>
                  </div>
                </div>
            </DialogPanel>
          </div>
      </div>
    </Dialog>
    <LoadingBox open={showLoading} onClose={stopLoading} setOpen={stopLoading} />


    {status === 1 &&  <DeleteBox open={open} setOpen={setOpen}
      title="Confirm Delete"
      body="Are you sure you want to delete this employee?"
      okConfirm={handleDelete}
      /> 
    }
  
    {status === 2 && <UpdateBox open={open} setOpen={setOpen}
      title="Confirm Update"
      body="Are you sure you want to update this employee?"
      okConfirm={handleUpdate}
      /> 
    }

    {status === 3 &&  <InfoBox open={open} setOpen={setOpen} onClose={setOpen}
      title="Confirm Success"
      body="Employee successfully deleted!"
      okConfirm={closeDelete}
      /> 
    }

    {status === 4 &&  <InfoBox open={open} setOpen={setOpen} onClose={setOpen}
      title="Confirm Success"
      body="Employee successfully updated!"
      okConfirm={closeUpdate}
      /> 
    }

    {status === 5 &&  <DeleteBox open={open} setOpen={setOpen}
      title="Confirm Delete"
      body="Are you sure you want to delete this image?"
      okConfirm={handleDeleteImg}
      /> 
    }

    {status === 6 &&  <InfoBox open={open} setOpen={setOpen} onClose={setOpen}
      title="Confirm Success"
      body="Image successfully deleted!"
      okConfirm={closeImg}
      /> 
    }

    {status === 7 &&  <UpdateBox open={open} setOpen={setOpen}
      title="Confirm Action"
      body="Are you sure you want to set this as profile image?"
      okConfirm={ToProfileImage}
      /> 
    }

    {status === 8 &&  <InfoBox open={open} setOpen={setOpen} onClose={setOpen}
      title="Confirm Success"
      body="Image successfully set as profile!"
      okConfirm={closeImg}
      /> 
    }

    {status === 9 &&  <InfoBox open={open} setOpen={setOpen} onClose={setOpen}
      title="Confirm Success"
      body="Image uploaded successfully!"
      okConfirm={closeImg}
      /> 
    }

    </>
  )
}