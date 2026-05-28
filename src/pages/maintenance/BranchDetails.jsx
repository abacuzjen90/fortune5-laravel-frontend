import { useContext, useEffect, useState} from "react";
import { AppContext } from "../../context/AppContext";
import { useNavigate, useParams } from 'react-router-dom';
import DeleteBox from "../../assets/components/DeleteBox";
import UpdateBox from "../../assets/components/UpdateBox";
import InfoBox from "../../assets/components/InfoBox";
import LoadingBox from '../../assets/components/Loading';

import { FaRegTrashAlt, FaRegEdit } from "react-icons/fa";

export default function BranchDetails() { 
  const { id } = useParams();
  const { token } = useContext(AppContext);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState(0);
  const [masterlist, setMasterlist] = useState([]);
  const [branchType, setbranchType] = useState([]);
  const [showLoading, setShowLoading] = useState(false);
  const isLoading = () => {setShowLoading(true)};
  const stopLoading = () => {setShowLoading(false)};

  const [formData, setFormData] = useState({
    str_list_id: "", head_person: "", branchtype_id: "", branchtype: "",
    acronym: "", description: "", str_list_address: "",
    contact_number: "", per_cbm: "", per_kilo: "", val_charge: "",
    fcl_value_charge: "", min_charge: "", advalorem: "", ftr10: "",
    ftr20: "", ftr40: "", wheeler4: "", wheeler6: "", wheeler8: "", wheeler10: "", 
    freightliner: "", rolling_cargo: "", ftr10_value: "", ftr20_value: "", ftr40_value: "",
    wheeler4_value: "", wheeler6_value: "",  wheeler8_value: "", wheeler10_value: "",
    freightliner_value: "", rolling_cargo_value: "", airvalue: "", management_fee: "",
    agency_10ftr: "", agency_20ftr: "", agency_40ftr: "",
    small_rate: "", medium_rate: "", large_rate: "", parcel_rate: "", status: "",
  });

  const [errors, setErrors] = useState({});

  // Get Employee
  async function getMasterlist() {
    const res = await fetch("/api/masterlists");
    const data = await res.json();
    if(res.ok) {
      setMasterlist(data);
    }
  }
  useEffect(() => {
    getMasterlist();
  }, []);

  // Get Branch Type
  async function getbranchType() {
    const res = await fetch("/api/branchtype");
    const data = await res.json();
    if(res.ok) {
      setbranchType(data);
    }
  }
  useEffect(() => {
    getbranchType();
  }, []);

  // Get Branch Record
  async function getBranchdetails() {
    isLoading();
    const res = await fetch(`/api/branch/${id}`);
    const data = await res.json();
    if(res.ok) {
      setFormData({
        id: data[0].id,
        str_list_id: data[0].str_list_id,
        head_person: data[0].head_person,
        branchtype_id: data[0].branchtype_id,
        branchtype: data[0].branchtype,
        acronym: data[0].acronym,
        description: data[0].description,
        str_list_address: data[0].str_list_address,
        contact_number: data[0].contact_number,
        per_cbm: data[0].per_cbm,
        per_kilo: data[0].per_kilo,
        val_charge: data[0].val_charge,
        fcl_value_charge: data[0].fcl_value_charge,
        min_charge: data[0].min_charge,
        advalorem: data[0].advalorem,
        ftr10: data[0].ftr10,
        ftr20: data[0].ftr20,
        ftr40: data[0].ftr40,
        wheeler4: data[0].wheeler4,
        wheeler6: data[0].wheeler6,
        wheeler8: data[0].wheeler8,
        wheeler10: data[0].wheeler10,
        freightliner: data[0].freightliner,
        rolling_cargo: data[0].rolling_cargo,
        ftr10_value: data[0].ftr10_value,
        ftr20_value: data[0].ftr20_value,
        ftr40_value: data[0].ftr40_value,
        wheeler4_value: data[0].wheeler4_value,
        wheeler6_value: data[0].wheeler6_value,
        wheeler8_value: data[0].wheeler8_value,
        wheeler10_value: data[0].wheeler10_value,
        freightliner_value: data[0].freightliner_value,
        rolling_cargo_value: data[0].rolling_cargo_value,
        airvalue: data[0].airvalue,
        management_fee: data[0].management_fee,
        agency_10ftr: data[0].agency_10ftr,
        agency_20ftr: data[0].agency_20ftr,
        agency_40ftr: data[0].agency_40ftr,
        small_rate: data[0].small_rate,
        medium_rate: data[0].medium_rate,
        large_rate: data[0].large_rate,
        parcel_rate: data[0].parcel_rate,
        status: data[0].status,
        first_name: data[0].first_name,
        last_name: data[0].last_name,
      });
      stopLoading();
    }
  }
  useEffect(() => {
    getBranchdetails();
  }, []);

  async function handleUpdate(e) {
  const typeres = await fetch(`/api/branchtype/${formData.branchtype_id}`);
  const typedata = await typeres.json();
  formData.branchtype = typedata[0].type;
  
    e.preventDefault();
    const res = await fetch(`/api/branch/${id}`, {
      method: "put",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(formData),
    });
    const data = await res.json();
    if(data.errors) {
      setErrors(data.errors);
      setOpen(false);
    } else {
      setStatus(4);
    }
  }

    async function handleDelete(e) {
      e.preventDefault();
        const res = await fetch(`/api/branch/${id}`, {
          method: "delete",
          headers: {
              Authorization: `Bearer ${token}`,
          }
        });
        const data = await res.json();
        if(res.ok) {
          setStatus(3);
        }
        // console.log(data);
    }
    
  
    async function openDelete() {
      setOpen(true);
      setStatus(1);
    }

    async function closeDelete() {
      setOpen(false);
      navigate('/maintenance/branch');
    }

    async function openUpdate() {
      setOpen(true);
      setStatus(2);
    }

    async function closeUpdate() {
      setOpen(false);
      navigate('/maintenance/branch');
    }

  return (
    <> 
    <div className="flex items-center font-medium border-b border-slate-300 w-full">
      <main className="ml-10 flex-1 mx-auto py-4"><h1>Maintenance - Branch</h1></main>
    </div>

    <div className="flex items-center font-medium flex-1 mx-auto py-4">
      <main className="flex-1 mx-auto p-4">
        <div className="mx-auto">  
          <div className="bg-gray-50 shadow-md border">
            <div className="p-6 text-gray-900">
            <div className="flex flex-row">
              <div className="flex w-full"><h1 className='py-6'>Branch Details</h1></div>
              <div className="flex mb-3 mt-5">
                <button onClick={() => openUpdate()} className="h-fit flex flex-row mr-3 primary-btn py-3 px-6 text-sm tracking-wider font-semibold rounded-md text-white bg-gray-800 hover:bg-gray-600 focus:outline-none"><FaRegEdit size={16} className="mr-2"/>Update</button>

                <button onClick={() => openDelete()} className="h-fit flex flex-row primary-btn py-3 px-6 text-sm tracking-wider font-semibold rounded-md text-white bg-gray-800 hover:bg-gray-600 focus:outline-none"><FaRegTrashAlt size={16} className="mr-2"/> Delete</button>
              </div> 
            </div>
              <div className="py-4 flex w-full mx-auto space-y-6">
                <div className="w-full mx-auto space-y-6">
                  <div className='flex flex-row border p-2 bg-gray-100'>
                    <div className='p-4 w-1/2'> 
                      <label>Branch Code:</label>   
                      <input className="mb-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="Branch Code" value={formData.str_list_id}
                          onChange={(e) => setFormData({ ...formData, str_list_id: e.target.value })}
                      />
                        {errors.str_list_id && <p className="error text-red-700 text-left ml-2">{errors.str_list_id[0]}</p>}

                      <label>Branch Acronym:</label>
                      <input className=" mb-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="Branch Acronym" value={formData.acronym}
                          onChange={(e) => setFormData({ ...formData, acronym: e.target.value })}
                      />
                        {errors.acronym && <p className="error text-red-700 text-left ml-2">{errors.acronym[0]}</p>}

                      <label>Head Person:</label>
                      <select className='mb-4 form-select text-gray-800 bg-white text-sm px-4 w-full py-3 border border-gray-300 rounded-md outline-blue-500' onChange={(e) => setFormData({ ...formData, head_person: e.target.value })}>
                        <option>{formData.head_person && formData.first_name + " " + formData.last_name}</option>
                        {masterlist.map((rec, key) =>(
                        <option value={rec.id} key={key}>{rec.first_name + " " + rec.last_name}</option>
                        ))}
                      </select>
                      {errors.head_person && <p className="error text-red-700 text-left ml-2">{errors.head_person[0]}</p>}                      
                    </div>

                    <div className='p-4 w-1/2'>
                      <label>Branch Type:</label>
                      <select className='mb-4 form-select text-gray-800 bg-white text-sm px-4 w-full py-3 border border-gray-300 rounded-md outline-blue-500'
                        onChange={(e) => setFormData({ ...formData, branchtype_id: e.target.value })}>
                          <option>{formData.branchtype}</option>
                          {branchType.map((rec, key) =>(
                            <option value={rec.id} key={key}>{rec.type}</option>
                          ))}
                      </select>
                        {errors.branchtype_id && <p className="error text-red-700 text-left ml-2">{errors.branchtype_id[0]}</p>}                  

                      <label>Address:</label>
                      <input className="mb-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="Address" value={formData.str_list_address}
                          onChange={(e) => setFormData({ ...formData, str_list_address: e.target.value })}
                      />
                        {errors.str_list_address && <p className="error text-red-700 text-left ml-2 -mt-4">{errors.str_list_address[0]}</p>}

                      <label>Contact Number:</label>
                      <input className=" mb-4 register-link text-gray-800 bg-white border border-gray-300 text-sm px-4 w-full py-3 rounded-md outline-blue-500" type="text" placeholder="Contact Number" value={formData.contact_number}
                          onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
                      />
                        {errors.contact_number && <p className="error text-red-700 text-left ml-2">{errors.contact_number[0]}</p>}
                    </div>
                  </div>
                  
                  <div className='flex flex-col border bg-gray-100 p-3'>                  
                    <table cellPadding={6} className='text-sm w-2/4'>
                      <thead>
                        <tr>
                          <td colSpan={4}><div className='flex text-left text-xl'>Published Rate</div></td>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className='text-left align-bottom'> 
                          <td>Per CBM:</td>
                          <td><input className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-3 w-full py-2 rounded-md outline-blue-500" type="text" placeholder="CBM Rate" value={formData.per_cbm}
                            onChange={(e) => setFormData({ ...formData, per_cbm: e.target.value })}
                          />{errors.per_cbm && <p className="error text-red-700 text-left ml-2">{errors.per_cbm[0]}</p>}</td>
                        </tr>
                        <tr className='text-left align-bottom'>
                          <td>Per Kilo:</td>
                          <td><input className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-3 w-full py-2 rounded-md outline-blue-500" type="text" placeholder="Kilo Rate" value={formData.per_kilo}
                            onChange={(e) => setFormData({ ...formData, per_kilo: e.target.value })}
                          />{errors.per_kilo && <p className="error text-red-700 text-left ml-2">{errors.per_kilo[0]}</p>}</td>
                        </tr>
                        <tr className='text-left align-bottom'>
                          <td>Value Charge:</td>
                          <td><input className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-3 w-full py-2 rounded-md outline-blue-500" type="text" placeholder="Value Charge" value={formData.val_charge}
                            onChange={(e) => setFormData({ ...formData, val_charge: e.target.value })}
                          />{errors.val_charge && <p className="error text-red-700 text-left ml-2">{errors.val_charge[0]}</p>}</td>
                        </tr>
                        <tr className='text-left align-bottom'>
                          <td>Minimum Charge:</td>
                          <td><input className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-3 w-full py-2 rounded-md outline-blue-500" type="text" placeholder="Minimum Charge" value={formData.min_charge}
                            onChange={(e) => setFormData({ ...formData, min_charge: e.target.value })}
                          />{errors.min_charge && <p className="error text-red-700 text-left ml-2">{errors.min_charge[0]}</p>}</td>
                        </tr>
                        <tr className='text-left align-bottom'>
                          <td>Advalorem:</td>
                          <td><input className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-3 w-full py-2 rounded-md outline-blue-500" type="text" placeholder="Advalorem" value={formData.advalorem}
                            onChange={(e) => setFormData({ ...formData, advalorem: e.target.value })}
                          />{errors.advalorem && <p className="error text-red-700 text-left ml-2">{errors.advalorem[0]}</p>}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className='flex flex-col border bg-gray-100 p-3'>
                    <table cellPadding={6} className='text-sm w-3/4'>
                      <thead>
                        <tr>
                          <td colSpan={4}><div className='flex text-left text-xl'>FCL Rate</div></td>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className='text-left align-bottom'> 
                          <td>FCL Value Charge:</td>
                          <td><input className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-3 w-full py-2 rounded-md outline-blue-500" type="text" placeholder="FCL Value Charge" value={formData.fcl_value_charge}
                            onChange={(e) => setFormData({ ...formData, fcl_value_charge: e.target.value })}
                          /></td>
                          <td></td>
                        </tr>
                        <tr className='text-left align-bottom'>
                          <td></td>
                          <td>Rates</td>
                          <td>DV Minimum</td>
                        </tr>
                        <tr className='text-left align-bottom'>
                          <td>10 ftr:</td>
                          <td><input className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-3 w-full py-2 rounded-md outline-blue-500" type="text" placeholder="10FTR Rates" value={formData.ftr10}
                            onChange={(e) => setFormData({ ...formData, ftr10: e.target.value })}
                          />{errors.ftr10 && <p className="error text-red-700 text-left ml-2">{errors.ftr10[0]}</p>}</td>
                          <td><input className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-3 w-full py-2 rounded-md outline-blue-500" type="text" placeholder="10FTR DV Minimum" value={formData.ftr10_value}
                            onChange={(e) => setFormData({ ...formData, ftr10_value: e.target.value })}
                          />{errors.ftr10_value && <p className="error text-red-700 text-left ml-2">{errors.ftr10_value[0]}</p>}</td>
                        </tr>
                        <tr className='text-left align-bottom'>
                          <td>20 ftr:</td>
                          <td><input className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-3 w-full py-2 rounded-md outline-blue-500" type="text" placeholder="20FTR Rates" value={formData.ftr20}
                            onChange={(e) => setFormData({ ...formData, ftr20: e.target.value })}
                          />{errors.ftr20 && <p className="error text-red-700 text-left ml-2">{errors.ftr20[0]}</p>}</td>
                          <td><input className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-3 w-full py-2 rounded-md outline-blue-500" type="text" placeholder="20FTR DV Minimum" value={formData.ftr20_value}
                            onChange={(e) => setFormData({ ...formData, ftr20_value: e.target.value })}
                          />{errors.ftr20_value && <p className="error text-red-700 text-left ml-2">{errors.ftr20_value[0]}</p>}</td>
                        </tr>
                        <tr className='text-left align-bottom'>
                          <td>40 ftr:</td>
                          <td><input className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-3 w-full py-2 rounded-md outline-blue-500" type="text" placeholder="40FTR Rates" value={formData.ftr40}
                            onChange={(e) => setFormData({ ...formData, ftr40: e.target.value })}
                          />{errors.ftr40 && <p className="error text-red-700 text-left ml-2">{errors.ftr40[0]}</p>}</td>
                          <td><input className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-3 w-full py-2 rounded-md outline-blue-500" type="text" placeholder="40FTR DV Minimum" value={formData.ftr40_value}
                            onChange={(e) => setFormData({ ...formData, ftr40_value: e.target.value })}
                          />{errors.ftr40_value && <p className="error text-red-700 text-left ml-2">{errors.ftr40_value[0]}</p>}</td>
                        </tr>
                        <tr className='text-left align-bottom'>
                          <td>4 Wheeler:</td>
                          <td><input className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-3 w-full py-2 rounded-md outline-blue-500" type="text" placeholder="4 Wheeler Rates" value={formData.wheeler4}
                            onChange={(e) => setFormData({ ...formData, wheeler4: e.target.value })}
                          />{errors.wheeler4 && <p className="error text-red-700 text-left ml-2">{errors.wheeler4[0]}</p>}</td>
                          <td><input className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-3 w-full py-2 rounded-md outline-blue-500" type="text" placeholder="4 Wheeler DV Minimum" value={formData.wheeler4_value}
                            onChange={(e) => setFormData({ ...formData, wheeler4_value: e.target.value })}
                          />{errors.wheeler4_value && <p className="error text-red-700 text-left ml-2">{errors.wheeler4_value[0]}</p>}</td>
                        </tr>
                        <tr className='text-left align-bottom'>
                          <td>6 Wheeler:</td>
                          <td><input className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-3 w-full py-2 rounded-md outline-blue-500" type="text" placeholder="6 Wheeler Rates" value={formData.wheeler6}
                            onChange={(e) => setFormData({ ...formData, wheeler6: e.target.value })}
                          />{errors.wheeler6 && <p className="error text-red-700 text-left ml-2">{errors.wheeler6[0]}</p>}</td>
                          <td><input className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-3 w-full py-2 rounded-md outline-blue-500" type="text" placeholder="6 Wheeler DV Minimum" value={formData.wheeler6_value}
                            onChange={(e) => setFormData({ ...formData, wheeler6_value: e.target.value })}
                          />{errors.wheeler6_value && <p className="error text-red-700 text-left ml-2">{errors.wheeler6_value[0]}</p>}</td>
                        </tr>
                        <tr className='text-left align-bottom'>
                          <td>8 Wheeler:</td>
                          <td><input className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-3 w-full py-2 rounded-md outline-blue-500" type="text" placeholder="8 Wheeler Rates" value={formData.wheeler8}
                            onChange={(e) => setFormData({ ...formData, wheeler8: e.target.value })}
                          />{errors.wheeler8 && <p className="error text-red-700 text-left ml-2">{errors.wheeler8[0]}</p>}</td>
                          <td><input className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-3 w-full py-2 rounded-md outline-blue-500" type="text" placeholder="8 Wheeler DV Minimum" value={formData.wheeler8_value}
                            onChange={(e) => setFormData({ ...formData, wheeler8_value: e.target.value })}
                          />{errors.wheeler8_value && <p className="error text-red-700 text-left ml-2">{errors.wheeler8_value[0]}</p>}</td>
                        </tr>
                        <tr className='text-left align-bottom'>
                          <td>10 Wheeler:</td>
                          <td><input className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-3 w-full py-2 rounded-md outline-blue-500" type="text" placeholder="10 Wheeler Rates" value={formData.wheeler10}
                            onChange={(e) => setFormData({ ...formData, wheeler10: e.target.value })}
                          />{errors.wheeler10 && <p className="error text-red-700 text-left ml-2">{errors.wheeler10[0]}</p>}</td>
                          <td><input className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-3 w-full py-2 rounded-md outline-blue-500" type="text" placeholder="10 Wheeler DV Minimum" value={formData.wheeler10_value}
                            onChange={(e) => setFormData({ ...formData, wheeler10_value: e.target.value })}
                          />{errors.wheeler10_value && <p className="error text-red-700 text-left ml-2">{errors.wheeler10_value[0]}</p>}</td>
                        </tr>
                        <tr className='text-left align-bottom'>
                          <td>Freightliner:</td>
                          <td><input className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-3 w-full py-2 rounded-md outline-blue-500" type="text" placeholder="Freightliner Rates" value={formData.freightliner}
                            onChange={(e) => setFormData({ ...formData, freightliner: e.target.value })}
                          />{errors.freightliner && <p className="error text-red-700 text-left ml-2">{errors.freightliner[0]}</p>}</td>
                          <td><input className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-3 w-full py-2 rounded-md outline-blue-500" type="text" placeholder="Freightliner DV Minimum" value={formData.freightliner_value}
                            onChange={(e) => setFormData({ ...formData, freightliner_value: e.target.value })}
                          />{errors.freightliner_value && <p className="error text-red-700 text-left ml-2">{errors.freightliner_value[0]}</p>}</td>
                        </tr>
                        <tr className='text-left align-bottom'>
                          <td>Rolling Cargo:</td>
                          <td><input className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-3 w-full py-2 rounded-md outline-blue-500" type="text" placeholder="Rolling Cargo Rates" value={formData.rolling_cargo}
                            onChange={(e) => setFormData({ ...formData, rolling_cargo: e.target.value })}
                          />{errors.rolling_cargo && <p className="error text-red-700 text-left ml-2">{errors.rolling_cargo[0]}</p>}</td>
                          <td><input className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-3 w-full py-2 rounded-md outline-blue-500" type="text" placeholder="Rolling Cargo DV Minimum" value={formData.rolling_cargo_value}
                            onChange={(e) => setFormData({ ...formData, rolling_cargo_value: e.target.value })}
                          />{errors.rolling_cargo_value && <p className="error text-red-700 text-left ml-2">{errors.rolling_cargo_value[0]}</p>}</td>
                        </tr>   
                      </tbody>                    
                    </table>
                  </div>

                  <div className='flex flex-col border bg-gray-100 p-3'>
                    <table cellPadding={6} className='text-sm w-full'>
                      <thead>
                        <tr>
                          <td colSpan={4}><div className='flex text-left text-xl'>Air Freight Rate</div></td>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className='text-left align-bottom'> 
                          <td>Air Value Charge:</td>
                          <td><input className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-3 w-full py-2 rounded-md outline-blue-500" type="text" placeholder="Air Value Charge" value={formData.airvalue}
                            onChange={(e) => setFormData({ ...formData, airvalue: e.target.value })}
                          /></td>
                          <td></td>
                          <td></td>
                        </tr>
                        <tr className='text-left align-bottom'>
                          <td>WT Break</td>
                          <td>Express/Rate</td>
                          <td>Perishable/Rate</td>
                          <td>Gen. Cargo/Rate</td>
                        </tr>
                        <tr className='text-left align-bottom'>
                          <td>0 - 5 Kilos:</td>
                          <td><input className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-3 w-full py-2 rounded-md outline-blue-500" type="text" placeholder="0 - 5 Kilos Express/Rate"/></td>
                          <td><input className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-3 w-full py-2 rounded-md outline-blue-500" type="text" placeholder="0 - 5 Kilos Perishable/Rate"/></td>
                          <td><input className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-3 w-full py-2 rounded-md outline-blue-500" type="text" placeholder="0 - 5 Kilos Gen. Cargo/Rate"/></td>
                        </tr>
                        <tr className='text-left align-bottom'>
                          <td>6 - 49 Kilos:</td>
                          <td><input className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-3 w-full py-2 rounded-md outline-blue-500" type="text" placeholder="6 - 49 Kilos Express/Rate"/></td>
                          <td><input className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-3 w-full py-2 rounded-md outline-blue-500" type="text" placeholder="6 - 49 Kilos Perishable/Rate"/></td>
                          <td><input className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-3 w-full py-2 rounded-md outline-blue-500" type="text" placeholder="6 - 49 Kilos Gen. Cargo/Rate"/></td>
                        </tr>
                        <tr className='text-left align-bottom'>
                          <td>50 - 249 Kilos:</td>
                          <td><input className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-3 w-full py-2 rounded-md outline-blue-500" type="text" placeholder="50 - 249 Kilos Express/Rate"/></td>
                          <td><input className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-3 w-full py-2 rounded-md outline-blue-500" type="text" placeholder="50 - 249 Kilos Perishable/Rate"/></td>
                          <td><input className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-3 w-full py-2 rounded-md outline-blue-500" type="text" placeholder="50 - 249 Kilos Gen. Cargo/Rate"/></td>
                        </tr>
                        <tr className='text-left align-bottom'>
                          <td>250 - Up Kilos:</td>
                          <td><input className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-3 w-full py-2 rounded-md outline-blue-500" type="text" placeholder="250 - Up Kilos Express/Rate"/></td>
                          <td><input className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-3 w-full py-2 rounded-md outline-blue-500" type="text" placeholder="250 - Up Kilos Perishable/Rate"/></td>
                          <td><input className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-3 w-full py-2 rounded-md outline-blue-500" type="text" placeholder="250 - Up Kilos Gen. Cargo/Rate"/></td>
                        </tr>    
                      </tbody>
                    </table>
                  </div>

                  <div className='flex flex-col border bg-gray-100 p-3'>
                    <table cellPadding={6} className='text-sm w-4/6 mb-4'>
                      <thead>
                        <tr>
                          <td colSpan={4}><div className='flex text-left text-xl'>Documents Rate</div>
                          <p className='text-left'><i>(min. of 5 pieces per pick up)</i></p>
                          </td>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className='text-left align-bottom'> 
                          <td>Small</td>
                          <td><input className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-3 w-full py-2 rounded-md outline-blue-500" type="text" placeholder="Small Rate" value={formData.small_rate}
                            onChange={(e) => setFormData({ ...formData, small_rate: e.target.value })}
                          /></td>
                        </tr>
                        <tr className='text-left align-bottom'>
                          <td>Medium</td>
                          <td><input className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-3 w-full py-2 rounded-md outline-blue-500" type="text" placeholder="Medium Rate" value={formData.medium_rate}
                            onChange={(e) => setFormData({ ...formData, medium_rate: e.target.value })}
                          /></td>
                        </tr>
                        <tr className='text-left align-bottom'>
                          <td>Large <i>(max of 2kg.)</i></td>
                          <td><input className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-3 w-full py-2 rounded-md outline-blue-500" type="text" placeholder="Large Charge" value={formData.large_rate}
                            onChange={(e) => setFormData({ ...formData, large_rate: e.target.value })}
                          /></td>
                        </tr>
                        <tr className='text-left align-bottom'>
                          <td className='whitespace-nowrap'>Non - Documents Rate<p className='text-left'><i>(Three kilos and Below with Commercial Value)</i></p></td>
                          <td></td>
                        </tr>
                        <tr className='text-left align-bottom'>
                          <td>Parcel Rate:</td>
                          <td><input className="register-link text-gray-800 bg-white border border-gray-300 text-sm px-3 w-full py-2 rounded-md outline-blue-500" type="text" placeholder="Parcel Rate" value={formData.parcel_rate}
                            onChange={(e) => setFormData({ ...formData, parcel_rate: e.target.value })}
                          /></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>  
      </main>
    </div>

    <LoadingBox open={showLoading} onClose={stopLoading} setOpen={stopLoading} />

    {status === 1 &&  <DeleteBox open={open} setOpen={setOpen}
      title="Confirm Delete"
      body="Are you sure you want to delete this branch?"
      okConfirm={handleDelete}
      /> 
    }
    
    {status === 2 && <UpdateBox open={open} setOpen={setOpen}
      title="Confirm Update"
      body="Are you sure you want to update this branch?"
      okConfirm={handleUpdate}
      /> 
    }

    {status === 3 &&  <InfoBox open={open} setOpen={setOpen} onClose={setOpen}
      title="Confirm Success"
      body="Branch successfully deleted!"
      okConfirm={closeDelete}
      /> 
    }

    {status === 4 &&  <InfoBox open={open} setOpen={setOpen} onClose={setOpen}
      title="Confirm Success"
      body="Branch successfully updated!"
      okConfirm={closeUpdate}
      /> 
    }

    </>
  )
}