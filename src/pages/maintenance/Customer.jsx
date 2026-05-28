import { Dialog, DialogBackdrop, DialogPanel } from '@headlessui/react';
import { useContext, useEffect, useState} from "react";
import { AppContext } from "../../context/AppContext";
import { Link } from 'react-router-dom';
import InfoBox from "../../assets/components/InfoBox";
import ConfirmBox from "../../assets/components/DeleteBox";
import UpdateBox from "../../assets/components/UpdateBox";
import { MdAdd } from "react-icons/md";
import { FaTimes, FaCheck, FaUserPlus, FaCubes, FaUserEdit } from "react-icons/fa";
import { BsCheck2Square } from "react-icons/bs";
import Pagination from '../../assets/components/Pagination';
import TableSort from '../../assets/components/TableSort';
import sortData from '../../assets/components/sortData';
import LoadingBox from '../../assets/components/Loading';
import useScreenSize from "../../assets/components/useScreenSize";
import { motion } from 'framer-motion';

export default function Customer() {

  const [openAddDial, setOpenAddDial] = useState(false);
  const [openUpdateDial, setOpenUpdateDial] = useState(false);
  const [openStatusDial, setOpenStatusDial] = useState(false);
  const [openVerifyDial, setOpenVerifyDial] = useState(false);
  const [open, setOpen] = useState(false);
  const { token } = useContext(AppContext);
  const [showLoading, setShowLoading] = useState(false);
  const isLoading = () => {setShowLoading(true)};
  const stopLoading = () => {setShowLoading(false)};
  const [status, setStatus] = useState(0);
  const [customer, setCustomer] = useState([]);
  const [id, setId] = useState(null);
  const [branch, setBranch] = useState([]);
  const [chargeto, setchargeTo] = useState([]);
  const [branchagency, setBranchAgency] = useState([]);
  const isMediumScreen = useScreenSize(768);
  const [formAirLength, setFormAirLength] = useState(null);
  const [verify, setVerify] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [verifyError, setVerifyError] = useState(null);
  const [hideError, setHideError] = useState(false);
  const [destin, setDestin] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState('');
  const [destiRates, setDestiRates] = useState({drate_cbm: "", drate_kilo: "", dvalue_charge: "", dminimum: "", dadvalorem: ""});

  //Table Pagination, Search
  const [sortdata, setSortdata] = useState([]);
  const [sorting, setSorting] = useState({ key: "", ascending: true });
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageCount, setPageCount] = useState(0);
  const [dataPerPage, setDataperpage] = useState(10);

  const [formData, setFormData] = useState({
    id: "", cust_uniq_id: "", registered_name: "", charge_to: "", tin_number: "",
    contact_person: "", address: "", mobile_number: "", contact_number: "",
    branch_id: "", destination: "", value_charge: "", terms: "", rate_cbm: "", rate_kilo: "",
    airvalue: "", minimum: "", advalorem: "", discount: "", small_rate: "",
    medium_rate: "", large_rate: "", parcel_rate: "", account_type: "",
    agency_type: "", vat: "", applicable_tax: "", fcl_value_charge: "", 
    ftr10: "", ftr20: "", ftr40: "", ftr20_flat: "", ftr40_flat: "",
    wheeler4: "", wheeler6: "", wheeler8: "", wheeler10: "", freightliner: "",
    rolling_cargo: "", ftr10_value: "", ftr20_value: "", ftr40_value: "",
    ftr20_flat_value: "", ftr40_flat_value: "", wheeler4_value: "",
    wheeler6_value: "", wheeler8_value: "", wheeler10_value: "",
    freightliner_value: "", rolling_cargo_value: "", reason: "",
    pickup_charge_remarks: "", customer_dr_attachment: "", rates_to_apply: "",
    disabled_encoder: "", date_disabled: "", status: "", blacklist_status: "",
    date_blacklisted: "", old_status: "", verify: "", rate_status: "",
    rate_status_time: "", rate_status_date: "", rate_status_encoder: "",
    blocklist: "", encoded: "", encoder: "", user_updated: "", deactive_by: "",
    blacklisted_by: "", update_rate_user: "", update_rate_time_date: "",
  });

  const [formDataAir, setFormDataAir] = useState([
    { wtbreak: "0-5", express: "", perishable: "", gen_cargo: "", type: "", consignee: "" },
    { wtbreak: "6-49", express: "", perishable: "", gen_cargo: "", type: "", consignee: "" },
    { wtbreak: "50-249", express: "", perishable: "", gen_cargo: "", type: "", consignee: "" },
    { wtbreak: "250", express: "", perishable: "", gen_cargo: "", type: "", consignee: "" }, 
  ]);

  const [formDataSort, setFormDataSort] = useState({
    branch_id: "",  // Default empty branch
    account_type: "account",  // Default to "Account"
    //Prepaid
    customer_name: "",
  });

  const sumExpress = formDataAir.reduce((acc, curr) => acc + (Number(curr.express) || 0), 0);
  const sumPerishable = formDataAir.reduce((acc, curr) => acc + (Number(curr.perishable) || 0), 0);
  const sumGencargo = formDataAir.reduce((acc, curr) => acc + (Number(curr.gen_cargo) || 0), 0);

  const [errors, setErrors] = useState({});

  const handleAirCharge = (index, field, value) => {
    // Check if input is not a number
    if (value !== "" && isNaN(value)) {
      setErrors((prevErrors) => ({
          ...prevErrors,
          [index]: { ...prevErrors[index], [field]: "Must be a number" }
      }));
    } else {
      // Remove error if input is valid
      setErrors((prevErrors) => {
        const newErrors = { ...prevErrors };
        if (newErrors[index]) {
            delete newErrors[index][field];
            if (Object.keys(newErrors[index]).length === 0) {
                delete newErrors[index];
            }
        }
        return newErrors;
      });

      // Update form data
      setFormDataAir((prevData) =>
          prevData.map((item, i) =>
              i === index ? { ...item, [field]: value } : item
          )
      );
    }
  };

  const changePage = (i) => {
    setCurrentPage(i);
    const startItem = (i - 1) * dataPerPage;
    setSortdata(customer.slice(startItem, startItem + dataPerPage));
  };

  const handleChange = (value) => {
    changePage(value);
  };

  const handleClearAircharge = () => {
    setFormDataAir((prevData) =>
      prevData.map((item) => ({
        ...item,
        express: "",
        perishable: ""
      }))
    );
  };

  //Search
  async function searchTable() {
    const filtered = customer.filter(rec => 
      rec.address.toLowerCase().includes(search.toLowerCase()) ||
      rec.registered_name.toLowerCase().includes(search.toLowerCase())
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

  // Get Destination
  async function getDestination() {
    const res = await fetch("/api/destination", {
      method: "get",  
      headers: {
        Authorization: `Bearer ${token}`,
      },
  });
    const data = await res.json();
    if(res.ok) {
      setDestin(data);
    }
  }
  useEffect(() => {
    getDestination();
  }, []);

  // Get Charge To
  async function getchargeTo(branch) {
    isLoading();
      const res = await fetch(`/api/chargetobranch/${branch}`, {
        method: "get",  
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if(res.ok) {
        setchargeTo(data);
      }  
    stopLoading();
  }
  useEffect(() => {
    formData.charge_to = "";
    getchargeTo(selectedBranch);
  }, [selectedBranch]);


  // Get Destination Rates
  async function getDestinationRates(desti) {
    isLoading();
      const res = await fetch(`/api/destinationrates/${desti}`, {
        method: "get",  
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      console.log(data);
      if(res.ok && data.length > 0) {
        setDestiRates({
          drate_cbm: data[0].rate_cbm ?? '',
          drate_kilo: data[0].rate_kilo ?? '',
          dvalue_charge: data[0].value_charge ?? '',
          dminimum: data[0].minimum ?? '',
          dadvalorem: data[0].advalorem ?? '',
        });
      } else { 
        setDestiRates({
          drate_cbm: '',
          drate_kilo: '',
          dvalue_charge: '',
          dminimum: '',
          dadvalorem: '',
        });
      }
    stopLoading();
  }


  // Get Verify Customer
  async function getVerifyCustomer() {
    isLoading();
    const res = await fetch("/api/getverifycustomer", {
      method: "get",  
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json();
    console.log(data);
    if(res.ok) {
      setVerify(data);
    } else {
      setVerify([]);
    }
    stopLoading();
  }

  const handleCheckboxChange = (id) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedItems.length === verify.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(verify.map((c) => c.id));
    }
  };

   // Update Verify Customer
   async function updateVerifyCustomer(ids) {
    setFormData({});
    
    const idArray = Array.isArray(ids) ? ids : [ids];
      const res = await fetch(`/api/updateverifycustomer`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ids: idArray }),
      });
      const data = await res.json();
      console.log(data);
      if (res.ok) {
        setOpen(true);
        setStatus(7);
        setSelectedItems([]);
        getVerifyCustomer();
      } else {
        setVerifyError(data.message);
      }
      console.log(verify.length);
  }

  // Delete Verify Customer
  async function deleteVerifyCustomer(ids) {
    setFormData({});
    
    const idArray = Array.isArray(ids) ? ids : [ids];
    console.log(ids);
      const res = await fetch(`/api/deleteverifycustomer`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ids: idArray }),
      });
      const data = await res.json();
      if (res.ok) {
        setOpen(true);
        setStatus(8);
        setSelectedItems([]);
        getVerifyCustomer();
      } else {
        setVerifyError(data.message);
      }
  }

  useEffect(() => {
    if (verifyError) {
      setHideError(false); // Make sure it's visible first
  
      const hideTimer = setTimeout(() => {
        setHideError(true); // Fade out
      }, 3500); // Start fade-out a bit before removal
  
      const removeTimer = setTimeout(() => {
        setVerifyError('');
      }, 4000); // Fully remove from DOM
  
      return () => {
        clearTimeout(hideTimer);
        clearTimeout(removeTimer);
      };
    }
  }, [verifyError]);

  async function closeVerify() {
    setOpen(false);
    //setOpenVerifyDial(false);
  }


  // Get Agency BranchType
   async function getAgencyBranchtype() {
    const res = await fetch("/api/branchagency", {
      method: "get",  
      headers: {
        Authorization: `Bearer ${token}`,
      },
  });
    const data = await res.json();
    if(res.ok) {
      setBranchAgency(data);
    }
  }
  useEffect(() => {
    getAgencyBranchtype();
  }, []);

  //Branch Dropdown
  const branchOptions = branch.reduce((acc, rec) => {
    const branchGroup = acc[rec.type] || [];
    return {
      ...acc, [rec.type]: [...branchGroup, rec]
  }}, {});
  

  // Add Customer
  async function handleCreate(e) {
    console.log(formData);
    e.preventDefault();
    (formData.airvalue = (formData.account_type === "Collect" || formData.account_type === "Account") ? formData.airvalue : "");
    const res = await fetch("/api/customer", {
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
      handleClearAircharge();

      //Insert Aircharge
      const customerId = String(data.customer.id);
      if(formData.account_type == "Collect" || formData.account_type == "Account") {
        if (sumExpress === 0 && sumPerishable === 0){
          return "";
        } else {

          const updatedFormDataAir = formDataAir.map(item => ({
            ...item,
            type: formData.account_type,
            consignee: customerId,
            express: Number(item.express) || 0,
            perishable: Number(item.perishable) || 0
          }));

          const resAir = await fetch("/api/aircharge", {
            method: "post",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({rates: updatedFormDataAir}),
          });
          const dataAir = await resAir.json();
          console.log(dataAir);
        }
      } else {
        return "";
      }
    }
  }

  async function closeCreate() {
    setOpen(false);
    setOpenAddDial(false);
  }

  // Get Customer
  async function getCustomerUpdate(id) {
    setFormData({});
    if(id){
      const res = await fetch(`/api/customer/${id}`);
      const data = await res.json();
      console.log(data);
      if(res.ok) {
        setFormData({
          id: data[0].id,
          registered_name: data[0].registered_name,
          charge_to: data[0].charge_to,
          tin_number: data[0].tin_number,
          contact_person: data[0].contact_person,
          address: data[0].address,
          mobile_number: data[0].mobile_number,
          contact_number: data[0].contact_number,
          branch_id: data[0].branch_id,
          destination: data[0].destination,
          value_charge: data[0].value_charge,
          terms: data[0].terms,
          rate_cbm: data[0].rate_cbm,
          rate_kilo: data[0].rate_kilo,
          airvalue: data[0].airvalue,
          minimum: data[0].minimum,
          advalorem: data[0].advalorem,
          discount: data[0].discount,
          small_rate: data[0].small_rate,
          medium_rate: data[0].medium_rate,
          large_rate: data[0].large_rate,
          parcel_rate: data[0].parcel_rate,
          account_type: data[0].account_type,
          agency_type: data[0].agency_type,
          vat: data[0].vat,
          applicable_tax: data[0].applicable_tax,
          fcl_value_charge: data[0].fcl_value_charge,
          ftr10: data[0].ftr10,
          ftr20: data[0].ftr20,
          ftr40: data[0].ftr40,
          ftr20_flat: data[0].ftr20_flat,
          ftr40_flat: data[0].ftr40_flat,
          wheeler4: data[0].wheeler4,
          wheeler6: data[0].wheeler6,
          wheeler8: data[0].wheeler8,
          wheeler10: data[0].wheeler10,
          freightliner: data[0].freightliner,
          rolling_cargo: data[0].rolling_cargo,
          ftr10_value: data[0].ftr10_value,
          ftr20_value: data[0].ftr20_value,
          ftr40_value: data[0].ftr40_value,
          ftr20_flat_value: data[0].ftr20_flat_value,
          ftr40_flat_value: data[0].ftr40_flat_value,
          wheeler4_value: data[0].wheeler4_value,
          wheeler6_value: data[0].wheeler6_value,
          wheeler8_value: data[0].wheeler8_value,
          wheeler10_value: data[0].wheeler10_value,
          freightliner_value: data[0].freightliner_value,
          rolling_cargo_value: data[0].rolling_cargo_value,
          reason: data[0].reason,
          pickup_charge_remarks: data[0].pickup_charge_remarks,
          customer_dr_attachment: data[0].customer_dr_attachment,
          rates_to_apply: data[0].rates_to_apply,
          disabled_encoder: data[0].disabled_encoder,
          date_disabled: data[0].date_disabled,
          status: data[0].status,
          blacklist_status: data[0].blacklist_status,
          date_blacklisted: data[0].date_blacklisted,
          old_status: data[0].old_status,
          verify: data[0].verify,
          rate_status: data[0].rate_status,
          rate_status_time: data[0].rate_status_time,
          rate_status_date: data[0].rate_status_date,
          rate_status_encoder: data[0].rate_status_encoder,
          blocklist: data[0].blocklist,
          encoded: data[0].encoded,
          encoder: data[0].encoder,
          user_updated: data[0].user_updated,
          deactive_by: data[0].deactive_by,
          blacklisted_by: data[0].blacklisted_by,
          update_rate_user: data[0].update_rate_user,
          update_rate_time_date: data[0].update_rate_time_date,
        });
      }
    }
  }
  useEffect(() => {
    getCustomerUpdate();
  }, []);

  useEffect(() => {
    if (formData.destination) {
      console.log(formData.destination);
      getDestinationRates(formData.destination);
    }
  }, [formData.destination]);


  // Get Aircharge
  async function getAirchargeUpdate(id) {
    setFormData({});
    if(id){
      const res = await fetch(`/api/aircharge/${id}`);
      const data = await res.json();
      console.log(data.length);
      setFormAirLength(data.length);
      if(res.ok && data.length > 0) {
        setFormDataAir(
          data.map(item => ({
            type: item.type,
            consignee: item.consignee,
            wtbreak: item.wtbreak,
            express: item.express,
            perishable: item.perishable,
            gen_cargo: item.gen_cargo,
        }))
        );
      } else {
        setFormDataAir([
          { wtbreak: "0-5", express: "", perishable: "", gen_cargo: "", type: "" },
          { wtbreak: "6-49", express: "", perishable: "", gen_cargo: "", type: "" },
          { wtbreak: "50-249", express: "", perishable: "", gen_cargo: "", type: "" },
          { wtbreak: "250", express: "", perishable: "", gen_cargo: "", type: "" },
      ]);
      }
    }
  }
  useEffect(() => {
    getAirchargeUpdate();
  }, []);


  //Update Customer
  async function openUpdate(id) {
    setOpen(true);
    setStatus(3);
    setId(id);
  }

  async function handleUpdate(e) {
    e.preventDefault();
    (formData.airvalue = (formData.account_type === "Collect" || formData.account_type === "Account") ? formData.airvalue : "");
    const res = await fetch(`/api/customer/${id}`, {
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
      //getCustomer();
      console.log(formAirLength);
        if(formAirLength > 0) {
          const updateFormDataAir = formDataAir.map(item => ({
            ...item,
            type: formData.account_type,
            consignee: String(id),
            express: Number(item.express) || 0,
            perishable: Number(item.perishable) || 0,
            gen_cargo: Number(item.gen_cargo) || 0
          }));

          const resss = await fetch(`/api/aircharge/${id}`, {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ rates: updateFormDataAir }),
          });
          const data = await resss.json();
          console.log(data);

        } else {
          if (sumExpress === 0 && sumPerishable === 0 && sumGencargo === 0){
            return "";
          } else {
            const addFormDataAir = formDataAir.map((item) => ({
              ...item,
              type: formData.account_type,
              consignee: String(id),
              express: Number(item.express) || 0,
              perishable: Number(item.perishable) || 0,
              gen_cargo: Number(item.gen_cargo) || 0,
            }));
    
            const ress = await fetch("/api/aircharge", {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ rates: addFormDataAir }),
            });

            const data = await ress.json();
            console.log(data);
          }
        }

    }
  }

  async function closeUpdate() {
    setOpen(false);
    setOpenUpdateDial(false);
    setOpenStatusDial(false);
    //setOpenVerifyDial(false);
    fetchCustomersByBranch(formDataSort.branch_id, formDataSort.account_type);
  }


  // fetch customer collect, account, servicecargo
  async function fetchCustomersByBranch(branchId, accountType) {
    isLoading();
    const queryParams = new URLSearchParams();

    //if (branchId && accountType !== "Prepaid" && accountType !== "Agency") {
    //  queryParams.append("branchId", branchId);
    //}

    if(branchId) queryParams.append("branchId", branchId);
    if (accountType) queryParams.append("accountType", accountType);

    const res = await fetch(`/api/customerbybranch?${queryParams.toString()}`, {
      method: "get",  
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    console.log(data);
    if (res.ok) {
      setCustomer(data);
      setPageCount(Math.ceil(data.length / dataPerPage));
      setSortdata(data.slice(0, dataPerPage));
      stopLoading();
    }
  }
  useEffect(() => {
    setSortdata([]);
    setCustomer([]);
    setFormDataSort(prev => ({ ...prev, branch_id: "", customer_name: "" }));
  }, [formDataSort.account_type]);

  useEffect(() => {
    if (formDataSort.branch_id === ""){
      if (formDataSort.account_type === "Agency" || formDataSort.account_type === "Prepaid") {
        fetchCustomersByBranch(formDataSort.branch_id, formDataSort.account_type);
      }
    }
  }, [formDataSort.account_type, dataPerPage]);

  useEffect(() => {
    if (formDataSort.branch_id || formDataSort.account_type === "Agency" || formDataSort.account_type === "Prepaid") {
      fetchCustomersByBranch(formDataSort.branch_id, formDataSort.account_type);
    }
  }, [formDataSort.branch_id, dataPerPage]);


  //fetch customer by prepaid/customer search
  async function fetchCustomersByPrepaid(customerName) {
    isLoading();

    const queryParams = new URLSearchParams();
    if(customerName) queryParams.append("customerName", customerName);

    const res = await fetch(`/api/customerbyprepaid?${queryParams.toString()}`, {
      method: "get",  
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    console.log(data);
    if (res.ok) {
      setCustomer(data);
      setPageCount(Math.ceil(data.length / dataPerPage));
      setSortdata(data.slice(0, dataPerPage));
      stopLoading();
    }
  }
  useEffect(() => {
    if(formDataSort.account_type === "Prepaid"){
      fetchCustomersByPrepaid();
    }
  }, []);


  async function updateBlacklistStatus(id, blacklistStatus) {
    isLoading();
    console.log(blacklistStatus);
    const res = await fetch(`/api/updateblackliststatus/${id}`, {
      method: "put",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        customer_id: id,
        blacklist_status: blacklistStatus === "n" ? "y" : "n",
      }),
    });
    const data = await res.json();
    console.log(data);
    if(res.ok) {
      fetchCustomersByBranch(formDataSort.branch_id, formDataSort.account_type);
    }
    stopLoading();
  }


  async function updateStatus(id, status) {
    console.log(id);
    const res = await fetch(`/api/updatestatus/${id}`, {
      method: "put",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        customer_id: id,
        status: status === "n" ? "y" : "n",
        reason: formData.reason,
      }),
    });
    const data = await res.json();
    console.log(data);
    if(data.errors) {
      setErrors(data.errors);
    } else {
      setOpen(true);
      setStatus(6);
      fetchCustomersByBranch(formDataSort.branch_id, formDataSort.account_type);
    }
  }


  const tableHeaders = {
    account: [
      { label: "Customer No.", field: "id" },
      { label: "Registered Name", field: "registered_name" },
      { label: "Address", field: "address" },
      { label: "TIN", field: "tin_number" },
      { label: "Discount", field: "discount" },
      { label: "Encoder", field: "encoder" },
      { label: "Consignee", field: "consignee" },
      { label: "Special Item", field: "special_item" },
      { label: "Blacklist Status", field: "blacklist_status" },
      { label: "Status", field: "status" },
    ],
    collect: [
      { label: "Customer No.", field: "id" },
      { label: "Registered Name", field: "registered_name" },
      { label: "Address", field: "address" },
      { label: "Rate/CBM", field: "rate_cbm" },
      { label: "Rate/Kilo", field: "rate_kilo" },
      { label: "Minimum", field: "minimum" },
      { label: "Encoder", field: "encoder" },
      { label: "Shipper", field: "shipper" },
      { label: "Special Item", field: "special_item" },
      { label: "Blacklist Status", field: "blacklist_status" },
      { label: "Status", field: "status" },
    ],
    prepaid: [
      { label: "Customer No.", field: "id" },
      { label: "Registered Name", field: "registered_name" },
      { label: "Address", field: "address" },
      { label: "TIN", field: "tin_number" },
      { label: "Landline No.", field: "contact_number" },
      { label: "Encoder", field: "encoder" },
      { label: "Consignee", field: "consignee" },
      { label: "Status", field: "status" },
    ],
    agency: [
      { label: "Customer No.", field: "id" },
      { label: "Registered Name", field: "registered_name" },
      { label: "Branch", field: "branch_id" },
      { label: "Agency Type Customer", field: "account_type" },
      { label: "Address", field: "address" },
      { label: "Landline No.", field: "contact_number" },
      { label: "Assign", field: "assign" },
      { label: "Special Item", field: "special_item" },
    ],
    servicecargo: [
      { label: "Customer No.", field: "id" },
      { label: "Registered Name", field: "registered_name" },
      { label: "Branch", field: "branch_id" },
      { label: "Address", field: "address" },
      { label: "Landline No.", field: "contact_number" },
      { label: "Shipper", field: "shipper" },
      { label: "Special Item", field: "special_item" },
    ],
  };
  
  const renderTable = (accountType) => {
    const headers = tableHeaders[accountType];
  
    return (
      <motion.div
        key={accountType} // This re-renders the table on change
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.4 }}
        className="overflow-hidden"
      >
      <div className={`overflow-x-auto transition-all duration-75 min-w-0 mx-auto ${isMediumScreen ? "w-[calc(100vw-22rem)]" : "w-[calc(100vw-9rem)]"}`}>
      <table className="min-w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
        {/* Table Head */}
        <thead className="text-xs text-center uppercase bg-gray-200 text-gray-800 border-b border-t border-gray-300">
          <tr className="text-nowrap">
            {headers.map(({ label, field }) => (
              <th key={field} className="px-3 py-3">
                <TableSort
                  sortdata={sortdata}
                  title={label}
                  field={field}
                  sorteddata={sortdata}
                  setSorteddata={setSortdata}
                  sorting={sorting}
                  setSorting={setSorting}
                />
              </th>
            ))}
          </tr>
        </thead>
  
        {/* Table Body */}
        <tbody className="text-xs text-center bg-gray-50 dark:bg-gray-700 dark:text-gray-800 border-b-2 border-gray-300">
          {sortdata.length > 0 ? (
            sortdata.map((rec) => (
              <tr
                key={rec.id}
                className="text-xs bg-white border-b dark:bg-gray-100 dark:border-gray-300 hover:bg-gray-50"
              >
                {headers.map(({ field }) => (
                  <td key={field} className={`px-3 py-3 ${field === "rate_cbm" || field === "rate_kilo" || field === "minimum" ? "text-right" : ""}`}>
                    {field === "id" ? (
                      <Link to="#" onClick={() => { setOpenUpdateDial(true); getCustomerUpdate(rec.id); getAirchargeUpdate(rec.id); setErrors(false); }} className="font-medium text-blue-600 dark:text-blue-500 hover:underline mx-1">
                        {rec[field]}
                      </Link>
                    ) : field === "consignee" ? (
                      <Link to={`/maintenance/customer/customerconsignee/${rec.id}`} target="_blank" rel="noopener noreferrer" className="flex justify-center text-green-700 hover:underline">
                        <FaUserPlus size={20} className="hover:text-green-600 mr-1" />
                        Add
                      </Link>
                    ) : field === "shipper" ? (
                      <Link to={`/maintenance/customer/customershipper/${rec.id}`} target="_blank" rel="noopener noreferrer" className="flex justify-center text-green-700 hover:underline">
                        <FaUserPlus size={20} className="hover:text-green-600 mr-1" />
                        Add
                      </Link>
                    ) : field === "assign" ? (
                      <Link  className="flex justify-center text-green-700 hover:underline">
                        <FaUserPlus size={20} className="hover:text-green-600 mr-1" />
                        Shipper
                      </Link>
                    ) : field === "special_item" ? (
                      <Link to={`/maintenance/customer/specialitem/${rec.id}`} target="_blank" rel="noopener noreferrer" className="flex justify-center hover:underline">
                        <FaCubes size={20} className="hover:text-slate-600 mr-1" />
                        Special Item
                      </Link>
                    ) : field === "blacklist_status" ? (
                      <Link to="#" onClick={() => { updateBlacklistStatus(rec.id, rec.blackliststatus); }} className="text-green-800 font-bold hover:underline">
                        { rec.blacklist_status === "n" ? "Active" : "Blacklisted" }
                      </Link>
                    ) : field === "status" ? (
                      <Link to="#" onClick={() => {setOpenStatusDial(true); getCustomerUpdate(rec.id); setFormData({}); setErrors(false)}} className="text-green-800 font-bold hover:underline">
                        { rec.status === "n" ? "Active" : "Blacklisted" }
                      </Link>
                    ) : (
                      rec[field] ?? "-"
                    )}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr className="text-xs bg-white border-b dark:bg-gray-100 dark:border-gray-300">
              <td className="px-3 py-3 text-center" colSpan={headers.length}>Empty</td>
            </tr>
          )}
        </tbody>
      </table>
      </div>
      </motion.div>
    );
  };
  
  return (
    <> 
    <div className="flex items-center font-medium border-b border-slate-300 w-full">
      <main className="px-4 flex-1 mx-auto py-4"><h1>Maintenance - Customer</h1></main>
    </div>

   <div className="flex items-center font-medium mx-auto py-4">
      <main className="flex-1 mx-auto p-4">
        <div className="mx-auto">
          <div className=" bg-gray-50 shadow-md border">
            <div className="p-6 text-gray-900 dark:text-gray-100">
              <div className="text-left caption-top dark:text-gray-800">
                <div className="flex flex-row py-2">
                  <div className="flex w-full"><h1>Customer Form</h1></div>
                    <div className="flex mb-3">
                      <button type="button" onClick={() => {setOpenAddDial(true); setFormData({}); setErrors(false)}} className="h-fit flex flex-row primary-btn py-3 px-5 text-sm tracking-wider font-semibold rounded-md text-white bg-gray-800 hover:bg-gray-600 focus:outline-none"><MdAdd size={20}/>Add&nbsp;Customer</button>
                      <button type="button" onClick={() => {setOpenVerifyDial(true); getVerifyCustomer(); setVerifyError(false); setFormData({}); setErrors(false)}} className="ml-2 h-fit flex flex-row primary-btn py-3 px-5 text-sm tracking-wider font-semibold rounded-md text-white bg-gray-800 hover:bg-gray-600 focus:outline-none"><BsCheck2Square size={18} className='mr-1'/>Verify&nbsp;Customer</button>
                    </div> 
                  </div>
                </div>
                <div className='lg:w-3/5 sm:w-4/5 text-gray-800'>
                <table className='w-full text-sm' cellPadding={2}>
                  <thead>
                  <tr>
                    <td className='w-2/5'>Customer Type:</td>
                    <td className='w-2/5'>{formDataSort.account_type === "Prepaid" ? "Customer Search:" : "Branch:"}</td>
                    <td className='w-1/5'>&nbsp;</td>
                  </tr>
                  </thead>
                  <tbody>
                  <tr>
                    <td>
                      <select className='mb-4 form-select text-gray-800 bg-white text-sm px-4 w-full py-3 border border-gray-300 rounded-md outline-blue-500' onChange={(e) => setFormDataSort({ ...formDataSort, account_type: e.target.value })}>
                        <option value="account">Account</option>
                        <option value="collect">Collect</option>
                        <option value="prepaid">Prepaid</option>
                        <option value="servicecargo">Service Cargo</option>
                      </select>
                    </td>
                    <td>
                    {formDataSort.account_type === "prepaid" ? (
                      <input className="mb-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="Customer Name" value={formDataSort.customer_name} onChange={(e) => setFormDataSort({ ...formDataSort, customer_name: e.target.value })}/>
                    ) : (
                      <select className='mb-4 form-select bg-white text-sm px-3 w-full py-3 border border-gray-300 rounded-md outline-blue-500' value={formDataSort.branch_id} onChange={(e) => setFormDataSort({ ...formDataSort, branch_id: e.target.value })}>
                        <option value="">Select Branch</option>
                        {Object.keys(branchOptions).map((type) => (
                          <optgroup label={type} key={type}>
                            {branchOptions[type].map(({str_list_id}) => (
                              <option key={str_list_id}>{str_list_id}</option>
                            ))}
                          </optgroup>
                        ))}
                      </select>
                    )}
                    </td>
                    <td>{formDataSort.account_type === "prepaid" ? ( <button onClick={() => fetchCustomersByPrepaid(formDataSort.customer_name)} className="mb-4 primary-btn ml-2 px-6 py-3 text-sm tracking-wider font-semibold rounded-md text-white bg-gray-800 hover:bg-gray-600 focus:outline-none"> Search </button>) : ""} </td>
                  </tr>
                  </tbody>
                </table>
                </div>
                {/* <hr/> */}
                <div className="text-slate-800 mt-4 mb-2">
                  <h1>{`Customer ${formDataSort.account_type === "servicecargo" ? "Service Cargo" : formDataSort.account_type}`}</h1>
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
               
                  {tableHeaders[formDataSort.account_type] ? renderTable(formDataSort.account_type) : null}
                <Pagination dataSize={customer.length} dataPPage={dataPerPage} nPages={pageCount} currentPage={currentPage} setCurrentPage={handleChange} />
            </div>
          </div>
        </div>  
      </main> 
    </div>

    {/* Add Customer */}
    <Dialog open={openAddDial} onClose={setOpenAddDial} className="relative z-[999]">
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
                  <h1 className="text-2xl text-left pb-6 flex"> <FaUserPlus size={30} className='mr-1'/> Add Customer Record </h1>
                
                <form onSubmit={handleCreate} className='w-full mx-auto space-y-6'>
                <div className='text-left border p-2 bg-gray-100'>
                  <div className='p-2 text-xl'>Customer Information<hr/></div>
                  <div className='flex flex-row'>
                    <div className='p-2 w-1/2'>
                      <p>Account Type:</p>
                      <select className='mb-4 form-select text-gray-800 bg-white text-sm px-4 w-full py-3 border border-gray-300 rounded-md outline-blue-500' onChange={(e) => setFormData({ ...formData, account_type: e.target.value })}>
                        <option value="">Customer Type</option>
                        <option value="account">Account</option>
                        <option value="collect">Collect</option>
                        <option value="prepaid">Prepaid</option>
                        <option value="servicecargo">Service Cargo</option>
                      </select>
                      {errors.account_type && <p className="error text-red-700 text-right ml-2 -mt-4">{errors.account_type[0]}</p>} 

                      <p>Registered Name:</p>
                      <input className="mb-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="Registered Name" value={formData.registered_name}
                          onChange={(e) => setFormData({ ...formData, registered_name: e.target.value })}
                      />
                        {errors.registered_name && <p className="error text-red-700 text-right ml-2 -mt-4">{errors.registered_name[0]}</p>}
                     
                      <p>Charge To:</p>
                      <select className='mb-4 form-select text-gray-800 bg-white text-sm px-4 w-full py-3 border border-gray-300 rounded-md outline-blue-500'
                        onChange={(e) => setFormData({ ...formData, charge_to: e.target.value })}>
                          <option value="">Charge To - (Please select branch address...)</option>
                          {chargeto.length > 0 ? (chargeto.map((rec, key) =>(
                            <option key={key}>{rec.payer_name}</option>
                          ))) : (
                            <option>Empty Record</option>
                          )}
                      </select>
                        {errors.charge_to && <p className="error text-red-700 text-right ml-2 -mt-4">{errors.charge_to[0]}</p>}
                      
                      <p>Contact Person:</p>
                      <input className=" mb-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="Contact Person" value={formData.contact_person}
                          onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                      />

                      <p>Tax Identification Number:</p>
                      <input className="mb-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="TIN (Tax Identification Number)" value={formData.tin_number}
                          onChange={(e) => setFormData({ ...formData, tin_number: e.target.value })}
                      />
                        {errors.tin_number && <p className="error text-red-700 text-right ml-2 -mt-4">{errors.tin_number[0]}</p>}

                      <p>Contact Number:</p>
                      <input className="mb-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="Land Line Number" value={formData.contact_number}
                          onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
                      />
                        {errors.contact_number && <p className="error text-red-700 text-right ml-2 -mt-4">{errors.contact_number[0]}</p>}

                      <p>Mobile Number:</p>
                      <input className="mb-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="Mobile Number" value={formData.mobile_number}
                          onChange={(e) => setFormData({ ...formData, mobile_number: e.target.value })}
                      />
                        {errors.mobile_number && <p className="error text-red-700 text-right ml-2 -mt-4">{errors.mobile_number[0]}</p>}
                    </div>

                    <div className='p-2 w-1/2'>
                      <div className='flex'>
                        <div className='w-1/2 mr-2'>Branch Address:</div>
                        <div className='w-1/2'>Area Converage:</div>
                      </div>
                      <div className='mb-4 flex flex-row'> 
                        <select className='form-select bg-white text-sm px-3 w-1/2 py-3 border border-gray-300 rounded-md outline-blue-500 mr-2' onChange={(e) => {setFormData({ ...formData, branch_id: e.target.value }); setSelectedBranch(e.target.value)}}>
                          <option value="">Branch Address</option>
                          {Object.keys(branchOptions).map((type) => (
                            <optgroup label={type} key={type}>
                              {branchOptions[type].map(({str_list_id}) => (
                                <option key={str_list_id}>{str_list_id}</option>
                              ))}
                            </optgroup>
                          ))}
                        </select>
                          
                        <select className='form-select text-gray-800 bg-white text-sm px-4 w-1/2 py-3 border border-gray-300 rounded-md outline-blue-500'
                          onChange={(e) => {setFormData({ ...formData, destination: e.target.value }); getDestinationRates(e.target.value)}}>
                            <option value="">Area Coverage</option>
                            {destin.map((rec, key) => (
                              <option key={key}>{rec.destination}</option>
                            ))}
                        </select>
                      </div>
                        {(errors.branch_id || errors.destination) && <p className="error text-red-700 text-right ml-2 -mt-4">The destination and branch address field is required.</p>}

                      <p>Address:</p>
                      <input className="mb-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="Address" value={formData.address}
                          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      />
                        {errors.address && <p className="error text-red-700 text-right ml-2 -mt-4">{errors.address[0]}</p>}
                      
                      <p>Terms:</p>
                      <input className=" mb-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="Terms" value={formData.terms}
                          onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
                      />
                        {errors.terms && <p className="error text-red-700 text-right ml-2 -mt-4">{errors.terms[0]}</p>}

                      <p>Rate of Discount:</p>
                      <input className="mb-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="Rate of Discount" value={formData.discount}
                          onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                      />
                        {errors.discount && <p className="error text-red-700 text-right ml-2 -mt-4">{errors.discount[0]}</p>}

                      <p>Pick-up Charge Amount:</p>
                      <input className=" mb-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="Pick-up Charge Amount" value={formData.pickup_charge_remarks}
                          onChange={(e) => setFormData({ ...formData, pickup_charge_remarks: e.target.value })}
                      />
                        {errors.pickup_charge_remarks && <p className="error text-red-700 text-right ml-2 -mt-4">{errors.pickup_charge_remarks[0]}</p>}

                      <p>DR Attachments Needed:</p>
                      <input className=" mb-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="DR Attachments Needed" value={formData.customer_dr_attachment}
                          onChange={(e) => setFormData({ ...formData, customer_dr_attachment: e.target.value })}
                      />
                        {errors.customer_dr_attachment && <p className="error text-red-700 text-right ml-2 -mt-4">{errors.customer_dr_attachment[0]}</p>}

                      <p>Rates to Apply:</p>
                      <input className=" mb-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="Rates to Apply" value={formData.rates_to_apply}
                          onChange={(e) => setFormData({ ...formData, rates_to_apply: e.target.value })}
                      />
                        {errors.rates_to_apply && <p className="error text-red-700 text-right ml-2 -mt-4">{errors.rates_to_apply[0]}</p>}
                    </div>          
                  </div>
                  </div>

                  {/* Land and Sea Rate */}
                  <div className='flex flex-col border bg-gray-100 p-3'>
                    <table cellPadding={6} className='text-sm w-3/5'>
                      <thead>
                        <tr>
                          <td className='flex text-left text-xl'>Land And Sea Rate</td>
                        </tr>
                        <tr>
                          <td colSpan={2}><hr/></td>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className='text-left align-bottom'> 
                          <td>Rate/CBM:</td>
                          <td><input className="register-link text-right text-gray-800 bg-white border border-gray-300 text-sm px-3 w-full py-2 rounded-md outline-blue-500" type="text" placeholder="Rate/CBM" value={formData.rate_cbm = destiRates.drate_cbm}
                            onChange={(e) => setDestiRates({ ...destiRates, drate_cbm: e.target.value })}
                          /></td>
                        </tr>
                        <tr className='text-left align-bottom'>
                          <td>Rate/Kilo:</td>
                          <td><input className="register-link text-right text-gray-800 bg-white border border-gray-300 text-sm px-3 w-full py-2 rounded-md outline-blue-500" type="text" placeholder="Rate/Kilo" value={formData.rate_kilo = destiRates.drate_kilo}
                            onChange={(e) => setDestiRates({ ...destiRates, drate_kilo: e.target.value })}
                          /></td>
                        </tr>
                        <tr className='text-left align-bottom'>
                          <td>Declared Value Charge / Php 1,000.00:</td>
                          <td><input className="register-link text-right text-gray-800 bg-white border border-gray-300 text-sm px-3 w-full py-2 rounded-md outline-blue-500" type="text" placeholder="Declared Value Charge" value={formData.value_charge = destiRates.dvalue_charge}
                            onChange={(e) => setDestiRates({ ...destiRates, dvalue_charge: e.target.value })}
                          /></td>
                        </tr>
                        <tr className='text-left align-bottom'>
                          <td>Customer Minimum:</td>
                          <td><input className="register-link text-right text-gray-800 bg-white border border-gray-300 text-sm px-3 w-full py-2 rounded-md outline-blue-500" type="text" placeholder="Customer Minimum" value={formData.minimum = destiRates.dminimum}
                            onChange={(e) => setDestiRates({ ...destiRates, dminimum: e.target.value })}
                          /></td>
                        </tr>
                        <tr className='text-left align-bottom'>
                          <td>Advalorem:</td>
                          <td><input className="register-link text-right text-gray-800 bg-white border border-gray-300 text-sm px-3 w-full py-2 rounded-md outline-blue-500" type="text" placeholder="Advalorem" value={formData.advalorem = destiRates.dadvalorem}
                            onChange={(e) => setDestiRates({ ...destiRates, dadvalorem: e.target.value })}
                          /></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Air Freight Rate */}
                  <div className='flex flex-col border bg-gray-100 p-3'>
                    <table cellPadding={6} className='text-sm w-3/4'>
                      <thead>
                        <tr>
                          <td className='flex text-left text-xl'>Air Freight Rate</td>
                        </tr>
                        <tr>
                          <td colSpan={3}><hr/></td>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className='text-left align-bottom'> 
                          <td>Air Value Charge:</td>
                          <td colSpan={2}><input className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-3 w-full py-2 rounded-md outline-blue-500" type="text" placeholder="FCL Value Charge" value={formData.airvalue}
                            onChange={(e) => setFormData({ ...formData, airvalue: e.target.value })}
                          /></td>
                          <td></td>
                        </tr>
                        <tr className='text-left align-bottom'>
                          <td>WT Break</td>
                          <td>Express Rate</td>
                          <td>Perishable Rate</td>
                        </tr>

                      {formDataAir.map((row, index) => (
                        <tr className='text-left align-bottom' key={index}>
                          <td>{row.wtbreak == 250 ? row.wtbreak + "-up" : row.wtbreak} kilos:</td>
                          <td><input className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-3 w-full py-2 rounded-md outline-blue-500" type="text" placeholder="Enter Express Rate" value={row.express}
                            onChange={(e) => handleAirCharge(index, "express", e.target.value)}
                          />
                          {errors[index]?.express && <p className="text-red-500 text-sm">{errors[index].express}</p>}
                          </td>
                          <td><input className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-3 w-full py-2 rounded-md outline-blue-500" type="text" placeholder="Enter Perishable Rate" value={row.perishable}
                            onChange={(e) => handleAirCharge(index, "perishable", e.target.value)}
                          />
                          {errors[index]?.perishable && <p className="text-red-500 text-sm">{errors[index].perishable}</p>}
                          </td>
                        </tr>
                      ))}

                        <tr className='text-left align-bottom  text-xl'>
                          <td colSpan={3}>Documents Rate <i className='text-sm'>( min. of 5 pieces per pick-up )</i></td>
                        </tr>
                        <tr className='text-left align-bottom'>
                          <td>Small Rate:</td>
                          <td colSpan={2}><input className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-3 w-full py-2 rounded-md outline-blue-500" type="text" placeholder="Enter Small Rate" value={formData.small_rate}
                            onChange={(e) => setFormData({ ...formData, small_rate: e.target.value })}
                          /></td>
                        </tr>
                        <tr className='text-left align-bottom'>
                          <td>Medium Rate:</td>
                          <td colSpan={2}><input className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-3 w-full py-2 rounded-md outline-blue-500" type="text" placeholder="Enter Medium Rate" value={formData.medium_rate}
                            onChange={(e) => setFormData({ ...formData, medium_rate: e.target.value })}
                          /></td>
                        </tr>
                        <tr className='text-left align-bottom'>
                          <td>Large Rate:</td>
                          <td colSpan={2}><input className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-3 w-full py-2 rounded-md outline-blue-500" type="text" placeholder="Enter Large Rate" value={formData.large_rate}
                            onChange={(e) => setFormData({ ...formData, large_rate: e.target.value })}
                          /></td>
                        </tr>
                        <tr className='text-left align-bottom  text-xl'>
                          <td colSpan={3}>Non-Documents Rate <i className='text-sm'>( Three kilos and Below with Commercial Value )</i></td>
                        </tr>
                        <tr className='text-left align-bottom'>
                          <td>Parcel Rate:</td>
                          <td colSpan={2}><input className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-3 w-full py-2 rounded-md outline-blue-500" type="text" placeholder="Enter Large Rate" value={formData.parcel_rate}
                            onChange={(e) => setFormData({ ...formData, parcel_rate: e.target.value })}
                          /></td>
                        </tr>
                      </tbody>                   
                    </table>
                  </div>

                    <div className="!mt-8 float-right">
                      <button className="primary-btn py-3 px-4 text-sm tracking-wider font-semibold rounded-md text-white bg-gray-800 hover:bg-gray-600 focus:outline-none"> Add Customer </button>
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

    {/* Update Customer */}
    <Dialog open={openUpdateDial} onClose={setOpenUpdateDial} className="relative z-[999]">
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
                  <h1 className="text-2xl text-left pb-6 flex"><FaUserEdit size={30} className='mr-1'/> Update Customer Record </h1>
                <div className='text-left border p-2 bg-gray-100'>
                  <div className='p-2 text-xl'>Customer Information<hr/></div>
                  <div className='flex flex-row text-sm'>
                    <div className='p-2 w-1/2'>
                    <p>Customer Number:</p>
                    <input className="mb-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" value={formData.id} disabled/>

                      <p>Account Type:</p>    
                      <select className='mb-4 form-select text-gray-800 bg-white text-sm px-4 w-full py-3 border border-gray-300 rounded-md outline-blue-500' onChange={(e) => setFormData({ ...formData, account_type: e.target.value })}>
                        <option value="">{formData.account_type}</option>
                        <option value="Account">Account</option>
                        <option value="Collect">Collect</option>
                        <option value="Prepaid">Prepaid</option>
                        <option value="Service Cargo">Service Cargo</option>
                      </select>
                      {errors.account_type && <p className="error text-red-700 text-left ml-2">{errors.account_type[0]}</p>}

                      <p>Agency Customer Type:</p>    
                      <select className='mb-4 form-select text-gray-800 bg-white text-sm px-4 w-full py-3 border border-gray-300 rounded-md outline-blue-500' onChange={(e) => setFormData({ ...formData, agency_type: e.target.value })}>
                        <option value="">Customer Type</option>
                        <option value="1">Account</option>
                        <option value="2">Collect</option>
                        <option value="3">Prepaid</option>
                        <option value="4">Agency</option>
                        <option value="5">Service Cargo</option>
                      </select>

                      <p>Registered Name:</p>
                      <input className="mb-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="Registered Name" value={formData.registered_name}
                          onChange={(e) => setFormData({ ...formData, registered_name: e.target.value })}
                      />
                        {errors.registered_name && <p className="error text-red-700 text-right ml-2 -mt4">{errors.registered_name[0]}</p>}

                      <p>Charge To.:</p>
                      <select className='mb-4 form-select text-gray-800 bg-white text-sm px-4 w-full py-3 border border-gray-300 rounded-md outline-blue-500'
                        onChange={(e) => setFormData({ ...formData, charge_to: e.target.value })}>
                          {formData.charge_to ? (
                          <option>{formData.charge_to}</option>
                          ) : (
                            <option value="">Charge To - (Please select branch address...)</option>
                          )} 
                          {chargeto.length > 0 ? (chargeto.map((rec, key) =>(
                            <option key={key}>{rec.payer_name}</option>
                          ))) : (
                            <option>Empty Record</option>
                          )}
                      </select>
                        {errors.charge_to && <p className="error text-red-700 text-right ml-2 -mt-4">{errors.charge_to[0]}</p>}

                      <p>Contact Person:</p>
                      <input className="mb-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="Contact Person" value={formData.contact_person}
                          onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                      />

                      <p>Tax Identification Number:</p>
                      <input className="mb-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="TIN (Tax Identification Number)" value={formData.tin_number}
                          onChange={(e) => setFormData({ ...formData, tin_number: e.target.value })}
                      />
                        {errors.tin_number && <p className="error text-red-700 text-left ml-2">{errors.tin_number[0]}</p>}

                      <p>Land Line Number:</p>
                      <input className="mb-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="Land Line Number" value={formData.contact_number}
                          onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
                      />
                        {errors.contact_number && <p className="error text-red-700 text-left ml-2">{errors.contact_number[0]}</p>}

                      <p>Mobile Number:</p>
                      <input className="mb-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="Mobile Number" value={formData.mobile_number}
                          onChange={(e) => setFormData({ ...formData, mobile_number: e.target.value })}
                      />
                        {errors.mobile_number && <p className="error text-red-700 text-left ml-2">{errors.mobile_number[0]}</p>}
                    </div>

                    <div className='p-2 w-1/2'>
                      <div className='flex'>
                        <div className='w-1/2 mr-2'>Branch Address:</div>
                        <div className='w-1/2'>Area Converage:</div>
                      </div>
                      <div className='flex flex-row mb-4'>  
                      <select className='form-select bg-white text-sm px-3 w-full py-3 border border-gray-300 rounded-md outline-blue-500 mr-2' onChange={(e) => {setFormData({ ...formData, branch_id: e.target.value }); setSelectedBranch(e.target.value)}}>
                          <option>{formData.branch_id}</option>
                          {Object.keys(branchOptions).map((type) => (
                            <optgroup label={type} key={type}>
                              {branchOptions[type].map(({str_list_id}) => (
                                <option key={str_list_id}>{str_list_id}</option>
                              ))}
                            </optgroup>
                          ))}
                        </select>
                          
                        <select className='form-select text-gray-800 bg-white text-sm px-4 w-full py-3 border border-gray-300 rounded-md outline-blue-500'
                          onChange={(e) => {setFormData({ ...formData, destination: e.target.value }); getDestinationRates(e.target.value)}}>
                            <option>{formData.destination ? formData.destination : "Area Coverage"}</option>
                            {destin.map((rec, key) => (
                              <option key={key}>{rec.destination}</option>
                            ))}
                        </select>
                      </div>
                        {(errors.branch_id || errors.destination) && <p className="error text-red-700 text-left ml-2">The destination and branch address field is required.</p>}
                      
                      <p>Address:</p>
                      <input className="mb-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="Address" value={formData.address}
                          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      />
                        {errors.address && <p className="error text-red-700 text-left ml-2">{errors.address[0]}</p>}

                      <p>Terms:</p>
                      <input className="mb-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="Terms" value={formData.terms}
                          onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
                      />
                        {errors.terms && <p className="error text-red-700 text-left ml-2">{errors.terms[0]}</p>}

                      <p>Rate of Discount:</p>
                      <input className="mb-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="Rate of Discount" value={formData.discount}
                          onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                      />
                        {errors.discount && <p className="error text-red-700 text-left ml-2">{errors.discount[0]}</p>}

                      <p className='flex'>Pick-up Charge Amount&nbsp;<p className='text-red-600'>(note:this is for pickup team entry)</p>:</p>
                      <input className="mb-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="Pick-up Charge Amount" value={formData.pickup_charge_remarks}
                          onChange={(e) => setFormData({ ...formData, pickup_charge_remarks: e.target.value })}
                      />
                        {errors.pickup_charge_remarks && <p className="error text-red-700 text-left ml-2">{errors.pickup_charge_remarks[0]}</p>}

                      Customer's with DR Attachment Needed:
                      <input className="mb-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="DR Attachments Needed" value={formData.customer_dr_attachment}
                          onChange={(e) => setFormData({ ...formData, customer_dr_attachment: e.target.value })}
                      />
                        {errors.customer_dr_attachment && <p className="error text-red-700 text-left ml-2">{errors.customer_dr_attachment[0]}</p>}

                      <p>Rates to Apply:</p>
                      <input className="mb-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="Rates to Apply" value={formData.rates_to_apply}
                          onChange={(e) => setFormData({ ...formData, rates_to_apply: e.target.value })}
                      />
                        {errors.rates_to_apply && <p className="error text-red-700 text-left ml-2">{errors.rates_to_apply[0]}</p>}
                    </div>          
                  </div>
                  </div>

                  {/* Land and Sea Rate */}
                  <div className='flex flex-col border bg-gray-100 p-3'>
                    <table cellPadding={6} className='text-sm w-3/5'>
                      <thead>
                        <tr>
                          <td colSpan={2} className='text-left text-xl'>Land And Sea Rate</td>
                        </tr>
                        <tr>
                          <td colSpan={2}><hr/></td>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className='text-left align-bottom'>  
                          <td>Rate/CBM:</td>
                          <td><input className="register-link text-right text-gray-800 bg-white border border-gray-300 text-sm px-3 w-full py-2 rounded-md outline-blue-500" type="text" placeholder="Rate/CBM" value={destiRates.drate_cbm}
                            onChange={(e) => setDestiRates({ ...destiRates, drate_cbm: e.target.value })}
                          /></td>
                        </tr>
                        <tr className='text-left align-bottom'>
                          <td>Rate/Kilo:</td>
                          <td><input className="register-link text-right text-gray-800 bg-white border border-gray-300 text-sm px-3 w-full py-2 rounded-md outline-blue-500" type="text" placeholder="Rate/Kilo" value={destiRates.drate_kilo}
                            onChange={(e) => setDestiRates({ ...destiRates, drate_kilo: e.target.value })}
                          /></td>
                        </tr>
                        <tr className='text-left align-bottom'>
                          <td>Declared Value Charge / Php 1,000.00:</td>
                          <td><input className="register-link text-right text-gray-800 bg-white border border-gray-300 text-sm px-3 w-full py-2 rounded-md outline-blue-500" type="text" placeholder="Declared Value Charge" value={destiRates.dvalue_charge}
                            onChange={(e) => setDestiRates({ ...destiRates, dvalue_charge: e.target.value })}
                          /></td>
                        </tr>
                        <tr className='text-left align-bottom'>
                          <td>Customer Minimum:</td>
                          <td><input className="register-link text-right text-gray-800 bg-white border border-gray-300 text-sm px-3 w-full py-2 rounded-md outline-blue-500" type="text" placeholder="Customer Minimum" value={destiRates.dminimum}
                            onChange={(e) => setDestiRates({ ...destiRates, dminimum: e.target.value })}
                          /></td>
                        </tr>
                        <tr className='text-left align-bottom'>
                          <td>Advalorem:</td>
                          <td><input className="register-link text-right text-gray-800 bg-white border border-gray-300 text-sm px-3 w-full py-2 rounded-md outline-blue-500" type="text" placeholder="Advalorem" value={destiRates.dadvalorem}
                            onChange={(e) => setDestiRates({ ...destiRates, dadvalorem: e.target.value })}
                          /></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Air Freight Rate */}
                  <div className='flex flex-col border bg-gray-100 p-3'>
                    <table cellPadding={6} className='text-sm w-3/4'>
                      <thead >
                        <tr>
                          <td colSpan={4} className='text-left text-xl'>Air Freight Rate</td>
                        </tr>
                        <tr>
                          <td colSpan={4}><hr/></td>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className='text-left align-bottom'> 
                          <td>Air Value Charge:</td>
                          <td colSpan={3}><input className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-3 w-full py-2 rounded-md outline-blue-500" type="text" placeholder="FCL Value Charge" value={formData.airvalue}
                            onChange={(e) => setFormData({ ...formData, airvalue: e.target.value })}
                          /></td>
                          <td></td>
                        </tr>
                        <tr className='text-left align-bottom'>
                          <td>WT Break</td>
                          <td>Express Rate</td>
                          <td>Perishable Rate</td>
                          <td>Gen. Cargo Rate</td>
                        </tr>

                      {formDataAir.map((row, index) => (
                        <tr className='text-left align-bottom' key={index}>
                          <td>{row.wtbreak == 250 ? row.wtbreak + "-up" : row.wtbreak} kilos:</td>
                          <td><input className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-3 w-full py-2 rounded-md outline-blue-500" type="text" placeholder="Enter Express Rate" value={row.express}
                            onChange={(e) => handleAirCharge(index, "express", e.target.value)}
                          />
                          {errors[index]?.express && <p className="text-red-500 text-sm">{errors[index].express}</p>}
                          </td>
                          <td><input className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-3 w-full py-2 rounded-md outline-blue-500" type="text" placeholder="Enter Perishable Rate" value={row.perishable}
                            onChange={(e) => handleAirCharge(index, "perishable", e.target.value)}
                          />
                          {errors[index]?.perishable && <p className="text-red-500 text-sm">{errors[index].perishable}</p>}
                          </td>
                          <td><input className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-3 w-full py-2 rounded-md outline-blue-500" type="text" placeholder="Enter Gen. Cargo Rate" value={row.gen_cargo}
                            onChange={(e) => handleAirCharge(index, "gen_cargo", e.target.value)}
                          />
                          {errors[index]?.gen_cargo && <p className="text-red-500 text-sm">{errors[index].gen_cargo}</p>}
                          </td>
                        </tr>
                      ))}

                        <tr className='text-left align-bottom  text-xl'>
                          <td colSpan={4}>Documents Rate <i className='text-sm'>( min. of 5 pieces per pick-up )</i></td>
                        </tr>
                        <tr className='text-left align-bottom'>
                          <td>Small Rate:</td>
                          <td colSpan={3}><input className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-3 w-full py-2 rounded-md outline-blue-500" type="text" placeholder="Enter Small Rate" value={formData.small_rate}
                            onChange={(e) => setFormData({ ...formData, small_rate: e.target.value })}
                          /></td>
                        </tr>
                        <tr className='text-left align-bottom'>
                          <td>Medium Rate:</td>
                          <td colSpan={3}><input className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-3 w-full py-2 rounded-md outline-blue-500" type="text" placeholder="Enter Medium Rate" value={formData.medium_rate}
                            onChange={(e) => setFormData({ ...formData, medium_rate: e.target.value })}
                          /></td>
                        </tr>
                        <tr className='text-left align-bottom'>
                          <td>Large Rate:</td>
                          <td colSpan={3}><input className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-3 w-full py-2 rounded-md outline-blue-500" type="text" placeholder="Enter Large Rate" value={formData.large_rate}
                            onChange={(e) => setFormData({ ...formData, large_rate: e.target.value })}
                          /></td>
                        </tr>
                        <tr className='text-left align-bottom  text-xl'>
                          <td colSpan={4}>Non-Documents Rate <i className='text-sm'>( Three kilos and Below with Commercial Value )</i></td>
                        </tr>
                        <tr className='text-left align-bottom'>
                          <td>Parcel Rate:</td>
                          <td colSpan={3}><input className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-3 w-full py-2 rounded-md outline-blue-500" type="text" placeholder="Enter Large Rate" value={formData.parcel_rate}
                            onChange={(e) => setFormData({ ...formData, parcel_rate: e.target.value })}
                          /></td>
                        </tr>
                      </tbody>                   
                    </table>
                  </div>

                  <div className="!mt-8 float-right">
                    <button onClick={() => openUpdate(formData.id)} className="primary-btn py-3 px-4 text-sm tracking-wider font-semibold rounded-md text-white bg-gray-800 hover:bg-gray-600 focus:outline-none"> Update Customer </button>
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


    {/* Update Status Reason */}
    <Dialog open={openStatusDial} onClose={setOpenStatusDial} className="relative z-[999]">
      <DialogBackdrop
          transition
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
      />

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <DialogPanel transition className="relative transform overflow-hidden rounded-lg transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-xl data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"> 

            <div className="flex flex-col font-[sans-serif]">
                <div className="w-full mx-auto border border-gray-300 rounded-2xl p-8 bg-gray-50">
                  <div className="text-center mb-4">
                    <div className="text-xl text-left pb-2"> Reason for disabling customer? </div>
                      <div className='flex flex-row border p-2 bg-gray-100'>
                        <div className='w-full p-4'>
                          <input className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="Reason" value={formData.reason}
                              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                          />
                            {errors.reason && <p className="error text-red-700 text-left ml-2">{errors.reason[0]}</p>}
                        </div>          
                      </div>
                        <div className="!mt-8 float-right">
                          <button onClick={() => updateStatus(formData.id, formData.status)} className="primary-btn py-3 px-12 text-sm tracking-wider font-semibold rounded-md text-white bg-gray-800 hover:bg-gray-600 focus:outline-none"> OK </button>
                        </div> 
                        <div className="!mt-8 float-right">
                          <button onClick={() => setOpenStatusDial(false)} className="primary-btn py-3 px-10 mr-4 text-sm tracking-wider font-semibold rounded-md text-white bg-gray-500 hover:bg-gray-600 focus:outline-none"> Cancel </button>
                        </div>
                    </div>
                  </div>
                </div>
            </DialogPanel>
          </div>
      </div>
    </Dialog>


    {/* Verify Customer */}
    <Dialog open={openVerifyDial} onClose={setOpenVerifyDial} className="relative z-[999]">
      <DialogBackdrop
          transition
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
      />

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <DialogPanel transition className="relative transform overflow-hidden rounded-lg transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-screen-xl data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"> 

            <div className="flex flex-col font-[sans-serif]">
                <div className="w-full mx-auto border border-gray-300 rounded-2xl p-8 bg-gray-50">
                  <div className="text-center mb-4">
                    <h1 className="flex text-2xl text-left"><FaUserEdit size={30} className='mr-1'/> Verify Customer Added </h1>
                    <hr/>
                    
                    <div className="text-left mt-6 mb-2"></div>
                    {verifyError ? <div className={`bg-red-100 text-red-600 text-center font-semibold py-3 rounded mb-4 transition-opacity duration-500 ease-in-out ${    hideError ? 'opacity-0' : 'opacity-100'}`}> {verifyError} </div> : ""}
                      <div className='flex flex-row'>
                        <div className="w-full overflow-auto">
                          <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400 overflow-hidden">
                          <thead className="text-sm uppercase bg-gray-200 text-gray-800 border-b border-t border-gray-300">
                              <tr className="text-nowrap">
                              <th className="px-3 py-3"><input type="checkbox" className="h-4 w-4" checked={verify.length > 0 && selectedItems.length === verify.length}
                                  onChange={handleSelectAll} /></th>
                              <th className="px-3 py-4">Registered Name</th>
                              <th className="px-3 py-4 whitespace-nowrap">Account Type</th>
                              <th className="px-3 py-4">Address</th>
                              <th className="px-3 py-4 whitespace-nowrap">Landline Number</th>
                              <th className="px-3 py-4">Branch</th>
                              </tr>
                            </thead>
                            <tbody className="text-xs bg-gray-50 dark:bg-gray-700 dark:text-gray-800 border-b-2 border-gray-300">
                            {verify.length > 0 ? (verify.map((rec) => (
                              <tr className="text-xs bg-white border-b dark:bg-gray-100 dark:border-gray-300 hover:bg-gray-50" key={rec.id}>    
                                  <th className="px-3 py-3"><input type="checkbox" className="h-4 w-4" checked={selectedItems.includes(rec.id)}
                                    onChange={() => handleCheckboxChange(rec.id)} /></th>
                                  <td className="px-3 py-3">{rec.registered_name}</td>
                                  <td className="px-3 py-3 capitalize">{rec.account_type === "servicecargo" ? "Service Cargo" : rec.account_type}</td>
                                  <td className="px-3 py-3">{rec.address}</td>
                                  <td className="px-3 py-3">{rec.contact_number}</td>
                                  <td className="px-3 py-3">{rec.branch_id}</td>
                                </tr>
                            ))) : (
                              <tr className='text-xs bg-white border-b dark:bg-gray-100 dark:border-gray-300'>
                                <td className='px-3 py-3 text-center' colSpan={6}>Empty</td>
                              </tr>
                            )}
                            </tbody>                        
                          </table>
                        </div>        
                      </div>
                        <div className="!mt-8 float-left">
                          <button onClick={() => updateVerifyCustomer(selectedItems)} className="flex primary-btn py-3 px-8 text-md tracking-wider font-semibold rounded-md text-white bg-gray-800 hover:bg-gray-600 focus:outline-none"><FaCheck size={20} className='mr-1'/> Verify </button>
                        </div> 
                        <div className="!mt-8 ml-2 float-left">
                          <button onClick={() => deleteVerifyCustomer(selectedItems)} className="flex primary-btn py-3 px-8 text-md tracking-wider font-semibold rounded-md text-white bg-red-800 hover:bg-red-600 focus:outline-none"><FaTimes size={20} className='mr-1'/> Delete </button>
                        </div> 
                    
                        <div className="!mt-8 float-right">
                          <button onClick={() => setOpenVerifyDial(false)} className="primary-btn py-3 px-10 text-sm tracking-wider font-semibold rounded-md text-white bg-gray-500 hover:bg-gray-600 focus:outline-none"> Cancel </button>
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
      body="Customer successfully added!"
      okConfirm={closeCreate}
      /> 
    }

    {status === 2 &&  <ConfirmBox open={open} setOpen={setOpen}
      title="Confirm Delete"
      body="Are you sure you want to delete this designation?"
      okConfirm={handleDelete}
      /> 
    }

    {status === 3 && <UpdateBox open={open} setOpen={setOpen}
      title="Confirm Update"
      body="Are you sure you want to update this customer?"
      okConfirm={handleUpdate}
      /> 
    }

    {status === 4 &&  <InfoBox open={open} setOpen={setOpen} onClose={setOpen}
      title="Confirm Success"
      body="Customer successfully updated!"
      okConfirm={closeUpdate}
      /> 
    }

    {status === 5 &&  <InfoBox open={open} setOpen={setOpen} onClose={setOpen}
      title="Confirm Success"
      body="Designation successfully deleted!"
      okConfirm={closeDelete}
      /> 
    }

    {status === 6 &&  <InfoBox open={open} setOpen={setOpen} onClose={setOpen}
      title="Confirm Success"
      body="Customer status successfully updated!"
      okConfirm={closeUpdate}
      /> 
    }

    {status === 7 &&  <InfoBox open={open} setOpen={setOpen} onClose={setOpen}
      title="Confirm Success"
      body="Customer/s successfully verified!"
      okConfirm={closeVerify}
      /> 
    }

    {status === 8 &&  <InfoBox open={open} setOpen={setOpen} onClose={setOpen}
      title="Confirm Success"
      body="Customer successfully deleted!"
      okConfirm={closeVerify}
      /> 
    }
    
    </>
  )
};
