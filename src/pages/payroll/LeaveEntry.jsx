import { AppContext }                                       from "../../context/AppContext";
import { useContext, useState, useEffect }                  from "react";
import { Dialog, DialogBackdrop, DialogPanel, Description } from '@headlessui/react';
import axios                                                from "axios";
import Select                                               from "react-select";
import dateFormat                                           from 'dateformat';

export default function LeaveEntry() {

  const { user }                                  = useContext(AppContext);
  const [employees,        setEmployees         ] = useState([]);
  const [employee_details, setEmployeeDetails   ] = useState([]);
  const [leave_records,    setLeaveRecords      ] = useState([]);
  const [deleted_records,  setDeletedRecords    ] = useState([]);
  const [sick_leave,       setSickLeaveLeft     ] = useState([]);
  const [vacation_leave,   setVacationLeaveLeft ] = useState([]);
  const [emergency_leave,  setEmergencyLeaveLeft] = useState([]);
  const [paternity_leave,  setPaternityLeaveLeft] = useState([]);
  const [half_day_leave,   setHalfDayLeaveLeft  ] = useState([]);
  const [get_emp_no,       setEmpNo             ] = useState([]);
  const [get_emp_name,     setEmpName           ] = useState([]);
  const [alert,            setAlert             ] = useState([]);
  const [selectedOption,   setSelectedOption    ] = useState(null);
  const [showAdd,          setShowAdd           ] = useState(false);
  const [showView,         setShowView          ] = useState(false);
  const [showRecover,      setShowRecover       ] = useState(false);
  const [showAlert,        setShowAlert         ] = useState(false);
  const [showLoading,      setShowLoading       ] = useState(false);
  const [formEmp,          setFormEmp           ] = useState({ emp_no: "" });
  const [formData,         setFormData          ] = useState({ date: "", date_to: "", leave_type: "", no_of_date: "", reason: "" });
  const [LeaveData,        setSelectedLOption   ] = useState({ leave_type: "" });
  const openAdd                                   = () => { setShowAdd(true)      };
  const closeAdd                                  = () => { setShowAdd(false)     };
  const openView                                  = () => { setShowView(true)     };
  const closeView                                 = () => { setShowView(false)    };
  const openRecover                               = () => { setShowRecover(true)  };
  const closeRecover                              = () => { setShowRecover(false) };
  const openAlert                                 = () => { setShowAlert(true)    };
  const closeAlert                                = () => { setShowAlert(false)   };
  const isLoading                                 = () => { setShowLoading(true)  };
  const stopLoading                               = () => { setShowLoading(false) };

  useEffect(() => {
    axios.get('/api/employees')
      .then(res => {
        setEmployees(res.data);
      });
  }, [])

  async function generateDetails(emp_no) {
    axios.post('/api/leave_details', {emp_no: emp_no})
      .then(res => {
        setEmpNo(res.data.emp_no);
        setEmpName(res.data.emp_name);
        setSickLeaveLeft(res.data.sick_leave_total);
        setVacationLeaveLeft(res.data.vacation_leave_total);
        setEmergencyLeaveLeft(res.data.emergency_leave_total);
        setPaternityLeaveLeft(res.data.paternity_leave_total);
        setHalfDayLeaveLeft(res.data.half_day_leave_total);
      });
  }

  async function handleGenerate(e) {
    e.preventDefault();

    isLoading();

    let emp_no = formEmp.emp_no;
    let user_name = user.name;

    axios.get('/api/employees')
      .then(res => {
        setEmployeeDetails(res.data.filter(data => data.id == emp_no));
      });

    generateDetails(emp_no);

    axios.get('/api/leave_records')
      .then(res => {
        stopLoading();
        setLeaveRecords(res.data.filter(data => data.emp_no == emp_no));
      });

    axios.get('/api/deleted_records')
      .then(res => {
        stopLoading();
        setDeletedRecords(res.data.filter(data => data.emp_no == emp_no && data.deleted_by == user_name ));
      });
  }

  async function handleLeave(e) {
    e.preventDefault();

    isLoading();

    let emp_no    = get_emp_no;
    let emp_name  = get_emp_name;
    let user_id   = user.id;
    let user_name = user.name;

    axios.post('/api/leave', {emp_no: emp_no, emp_name: emp_name, date: formData.date, date_to: formData.date_to, leave_type: formData.leave_type, no_of_day: formData.no_of_day, reason: formData.reason, encoder_id: user_id, encoded_by: user_name})
      .then(function (res) {
        stopLoading();
          
        if (res.data.status == 'success'){
          
          axios.get('/api/leave_records')
            .then(res => {
              setLeaveRecords(res.data.filter(data => data.emp_no == emp_no));
            });

          setShowAdd(false);
          generateDetails(emp_no);
          
        }
        
        setAlert(res.data);
        openAlert();

      }).catch(function () {
        stopLoading();
        setAlert({status: 'error', message: 'Oops, Something went wrong.'});
        openAlert();
      });
  }
  
  const deleteLeaveDetail = (e, id) => {
    e.preventDefault();
    
    isLoading();

    const thisClicked = e.currentTarget;
    thisClicked.innerText = "Deleting...";
    let emp_no    = get_emp_no;
    let user_name = user.name;

    axios.post('/api/leave_records/delete', {id: id, deleted_by: user_name})
      .then(res => {
        axios.get('/api/leave_records')
          .then(res => {
            setLeaveRecords(res.data.filter(data => data.emp_no == emp_no));
          });

        axios.get('/api/deleted_records')
          .then(res => {
            setDeletedRecords(res.data.filter(data => data.emp_no == emp_no && data.deleted_by == user_name));
          });
      
        stopLoading();
        generateDetails(emp_no);
        setAlert(res.data);
        openAlert();

      }).catch(function () {
        thisClicked.innerText = "Delete";
        
        stopLoading();
        setAlert({status: 'error', message: 'Oops, Something went wrong.'});
        openAlert();
      });
  }

  const restoreDeletedLeave = (e, id) => {
    e.preventDefault();
    
    isLoading();

    const thisClicked = e.currentTarget;
    thisClicked.innerText = "Restoring...";
    let emp_no    = get_emp_no;
    let user_name = user.name;

    axios.post('/api/leave_records/restore', {id: id})
      .then(res => {
        axios.get('/api/leave_records')
          .then(res => {
            setLeaveRecords(res.data.filter(data => data.emp_no == emp_no));
          });

        axios.get('/api/deleted_records')
          .then(res => {
            setDeletedRecords(res.data.filter(data => data.emp_no == emp_no && data.deleted_by == user_name));
          });
      
        stopLoading();
        thisClicked.innerText = "Restore";
        generateDetails(emp_no);
        setAlert(res.data);
        openAlert();

      }).catch(function () {
        thisClicked.innerText = "Restore";
        
        stopLoading();
        setAlert({status: 'error', message: 'Oops, Something went wrong.'});
        openAlert();
      });
  }

  var employeeLists = employees?.map( (employee) => {
    return (
      { value: employee.id, label: employee.last_name + ', ' + employee.first_name + ' ' + employee.middle_name }
    )
  });

  var leaveRecords = leave_records?.map( (leave_record, index) => {
    let date_from = (leave_record.date != leave_record.date_to)? dateFormat(leave_record.date, "mmmm dd") : dateFormat(leave_record.date, "mmmm dd, yyyy") ;
    let date_to   = (dateFormat(leave_record.date_to, "mm") != dateFormat(leave_record.date, "mm"))? dateFormat(leave_record.date_to, "mmmm dd, yyyy") : dateFormat(leave_record.date_to, "dd, yyyy") ;
    let status    = (leave_record.status == "n")? <p className='text-orange-500 font-bold'>For Approval</p> : (leave_record.status == "a")? <p className='text-green-500 cursor-help font-bold' title={'Date Approved: '+dateFormat(leave_record.updated_at, "yyyy-mm-dd")}>Approved</p> : <p className='text-red-500 cursor-help font-bold' title={'Date Not Approved: '+dateFormat(leave_record.updated_at, "yyyy-mm-dd")}>Not Approved</p>;
    let action    = (leave_record.status == "n")? (leave_record.encoder_id == user.id)? <button onClick={(e) => deleteLeaveDetail(e, leave_record.id)} className="relative bg-red-500 hover:bg-red-600 text-base text-white flex-auto transition cursor-pointer font-bold border border-solid border-secondary-500 rounded w-36 h-11 duration-300 ease-in-out"> Delete </button> : '--' : <p className='text-sm'><span className='text-gray-600 font-bold'>By:</span> {leave_record.status_change_by}</p>;

    return (
      <tr className="hover:bg-slate-200" key={index}>
        <td className="px-6 py-4 border-b border-slate-200 text-sm">{leave_record.leave_type.toUpperCase()} LEAVE</td>
        <td className="px-6 py-4 border-b border-slate-200 text-sm">{date_from.toUpperCase()} {leave_record.date_to != leave_record.date? 'to ' + date_to.toUpperCase() : ''}</td>
        <td className="px-6 py-4 border-b border-slate-200">{leave_record.no_of_day != '0.5'? (leave_record.no_of_day) : (<h1>½</h1>)}</td>
        <td className="px-6 py-4 border-b border-slate-200 text-sm">{leave_record.reason != ''? (leave_record.reason) : ('--')}</td>
        <td className="px-6 py-4 border-b border-slate-200 text-sm">{leave_record.emp_name}</td>
        <td className="px-6 py-4 border-b border-slate-200 text-sm">{leave_record.encoded_by}</td>
        <td className="px-6 py-4 border-b border-slate-200 text-sm">{status}</td>
        <td className="px-6 py-4 border-b border-slate-200">{action}</td>
      </tr>
    )
  });

  var deletedRecords = deleted_records?.map( (deleted_record, index) => {
    let date_from = (deleted_record.date != deleted_record.date_to)? dateFormat(deleted_record.date, "mmmm dd") : dateFormat(deleted_record.date, "mmmm dd, yyyy") ;
    let date_to   = (dateFormat(deleted_record.date_to, "mm") != dateFormat(deleted_record.date, "mm"))? dateFormat(deleted_record.date_to, "mmmm dd, yyyy") : dateFormat(deleted_record.date_to, "dd, yyyy") ;
    
    return (
      <tr className="hover:bg-slate-200" key={index}>
        <td className="px-6 py-4 border-b border-slate-200 text-sm">{deleted_record.leave_type.toUpperCase()} LEAVE</td>
        <td className="px-6 py-4 border-b border-slate-200 text-sm">{date_from.toUpperCase()} {deleted_record.date_to != deleted_record.date? 'to ' + date_to.toUpperCase() : ''} </td>
        <td className="px-6 py-4 border-b border-slate-200">{deleted_record.no_of_day != '0.5'? (deleted_record.no_of_day) : (<h1>½</h1>)}</td>
        <td className="px-6 py-4 border-b border-slate-200 text-sm">{deleted_record.reason != ''? (deleted_record.reason) : ('--')}</td>
        <td className="px-6 py-4 border-b border-slate-200 text-sm">{deleted_record.emp_name}</td>
        <td className="px-6 py-4 border-b border-slate-200 text-sm">{deleted_record.encoded_by}</td>
        <td className="px-6 py-4 border-b border-slate-200">
          <button onClick={(e) => restoreDeletedLeave(e, deleted_record.id)} className="relative bg-blue-500 hover:bg-blue-600 text-base text-white flex-auto transition cursor-pointer font-bold border border-solid border-secondary-500 rounded w-36 h-11 duration-300 ease-in-out">
            Restore
          </button>
        </td>
      </tr>
    )
  });

  var employeeDetails = employee_details?.map( (employee_details) => {
    return (
      <thead className="text-sm uppercase font-medium border-b border-slate-100 text-slate-600" key={employee_details}>
        <tr>
          <th className="py-4" colSpan="4">
            <div className="ml-[24%]">
              <button onClick={openAdd} className="relative bg-green-500 hover:bg-green-600 text-base text-white font-bold flex-auto transition cursor-pointer border border-solid border-secondary-500 rounded w-36 h-11 duration-300 ease-in-out">
                File a Leave
              </button>
              <span className="ml-4 mr-4 text-xl">|</span>
              <button onClick={openView} className="relative bg-yellow-500 hover:bg-yellow-600 text-base text-white font-bold flex-auto transition cursor-pointer border border-solid border-secondary-500 rounded w-36 h-11 duration-300 ease-in-out">
                View Records
              </button>
              <span className="ml-4 mr-4 text-xl">|</span>
              <button onClick={openRecover} className="relative bg-red-500 hover:bg-red-600 text-base text-white font-bold flex-auto transition cursor-pointer border border-solid border-secondary-500 rounded w-40 h-11 duration-300 ease-in-out">
                Deleted Records
              </button>
            </div>
          </th>
        </tr>
        {/* ROW 1 */}
        <tr>
          <th className="w-20 py-4">Employee Number</th><td className="w-[17rem]">: {String(employee_details.id).padStart(4, "0")}</td>
          <th className="w-36">Available Sick Leave</th><td className="w-20">: { sick_leave? ( sick_leave ) : ('0') }</td>
        </tr>
        {/* ROW 2 */}
        <tr>
          <th className="py-4">Employee Name</th><td>: {employee_details.last_name}, {employee_details.first_name} {employee_details.middle_name}</td>
          <th>Available Vacation Leave</th><td>: { vacation_leave? ( vacation_leave ) : ('0') }</td>
        </tr>
        {/* ROW 3 */}
        <tr>
          <th className="py-4">Employee Address</th><td>: { employee_details.address? ( employee_details.address ) : ('No Data Record') }</td>
          <th>Available Emergency Leave</th><td>: { emergency_leave? ( emergency_leave ) : ('0') }</td>
        </tr>
        {/* ROW 4 */}
        <tr>
          <th className="py-4">Employment Status</th><td>: { employee_details.employment_status? ( employee_details.employment_status ) : ('No Data Record') }</td>
          <th>Available Paternity Leave</th><td>: { paternity_leave? ( paternity_leave ) : ('0') }</td>
        </tr>
        {/* ROW 5 */}
        <tr>
          <th className="py-4"></th><td></td>
          <th>Available Half-Day Leave</th><td>: { half_day_leave? ( half_day_leave ) : ('0') }</td>
        </tr>
      </thead>
    )
  });

  return (
    <>

      <div className="flex items-center font-medium border-b border-slate-300">
         <main className="ml-10 flex-1 mx-auto py-4"><h1>Payroll - Leave Entry (Request)</h1></main>
      </div>
      
      {/* SEARCH EMPLOYEE */}
      <div className="mx-10 p-10">
        <div className="mb-3 ml-[30%]">
          <label className="text-neutral-500 text-xl font-semibold inline-block mb-2">
            Employee Name
          </label>
        </div>
        <div className="mb-3">
          <form onSubmit={handleGenerate} className="w-1/2 ml-[30%]">
          
            <Select placeholder="Select Employee" options={employeeLists} value={selectedOption} onChange={(e) => { setSelectedOption(); setFormEmp({ ...formEmp, emp_no: e.value }) }} className="inline-block w-72 rounded" />

            <button className="relative bg-blue-500 hover:bg-blue-600 text-base text-white font-bold flex-auto transition cursor-pointer border border-solid border-secondary-500 rounded w-36 h-11 ml-4 px-3 py-[0.32rem] duration-300 ease-in-out">
              Generate 
              <svg aria-hidden="true" fill="none" viewBox="0 0 25 25" className="w-6 h-6 float-right">
                <path stroke="currentColor"  strokeLinejoin="round" strokeWidth="2" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm4.28 10.28a.75.75 0 000-1.06l-3-3a.75.75 0 10-1.06 1.06l1.72 1.72H8.25a.75.75 0 000 1.5h5.69l-1.72 1.72a.75.75 0 101.06 1.06l3-3z" />
              </svg>
            </button>

          </form>
        </div>
      </div>

      <table className="shadow-none w-10/12 sm:ml-20 p-4 w-full text-sm text-left rounded-md shadow-lg overflow-hidden mb-6 table-auto">
        
        {/* GENERATE EMPLOYEE DETAILS */}
        {employeeDetails}

      </table>
      
      {/* FILE A LEAVE */}
      <Dialog open={showAdd} onClose={closeAdd} className="relative z-[999]">
        <DialogBackdrop transition className="fixed inset-0 bg-black transition-opacity bg-opacity-50 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in" />

        <div className="fixed inset-0 justify-center max-h-full overflow-y-auto">
          <DialogPanel transition className="relative text-left transform overflow-hidden transition-all rounded-lg sm:my-8 sm:w-full data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in">
            <div className="bg-gray-100 max-w-[80%] w-full border border-gray-300 rounded-2xl mx-auto p-8">
              <div className="relative ml-[100%] -mt-6">
                <button title="Close" onClick={closeAdd} className="text-2xl text-gray-500 font-bold">&times;</button>
              </div>
              
              <div className="text-left mb-6">
                <span className="bg-blue-200 text-teal-800 text-3xl font-mono font-semibold rounded me-2 px-2.5 py-0.5">
                  File a Leave
                </span>
              </div>
              
              <div className="text-center">
                <form onSubmit={handleLeave}>
                  <div className="p-6">
                    <button className="relative bg-green-500 hover:bg-green-600 text-base text-white font-bold flex-auto transition cursor-pointer border border-solid border-secondary-500 rounded w-36 h-11 ml-4 px-3 py-[0.32rem] duration-300 ease-in-out">
                      Save 
                    </button>
                  </div>

                  <table className="w-full text-base rounded-md shadow-lg overflow-hidden mb-6 table-auto bg-white">
                    <tbody>
                      <tr className="bg-gray-300 text-center text-gray-600">
                        <th className="w-60 py-4">Leave Type</th>
                        <th className="w-44 py-4">Date From</th>
                        <th className="w-44 py-4">Date To</th>
                        <th className="w-16 py-4"># of Days</th>
                        <th className="w-60 py-4">Reasons for Leave</th>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 border-b border-slate-100">
                          <select onChange={(e) => { setSelectedLOption({ ...LeaveData, leave_type: e.target.value }); setFormData({ ...formData, leave_type: e.target.value }) }} className="bg-white w-44 cursor-pointer rounded border border-gray-300 px-3 py-3" required>
                            <option value="">Select Type</option>
                            <option value="sick">Sick Leave</option>
                            <option value="vacation">Vacation Leave</option>
                            <option value="emergency">Emergency Leave</option>
                            <option value="paternity">Paternity Leave</option>
                            <option value="half-day">Half-Day Leave</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 border-b border-slate-100">
                          <input type="date" onChange={(e) => setFormData({ ...formData, date: e.target.value })} className="w-44 cursor-pointer rounded border border-gray-300 px-3 py-3" required />
                        </td>
                        <td className="px-6 py-4 border-b border-slate-100">
                          <input type="date" onChange={(e) => setFormData({ ...formData, date_to: e.target.value })} className="w-44 cursor-pointer rounded border border-gray-300 px-3 py-3" required />
                        </td>
                        <td className="px-6 py-4 border-b border-slate-100">
                          <input type="number" min={ LeaveData.leave_type != "half-day" ? ( '1' ) : ( '0.5' ) } max={ LeaveData.leave_type != "half-day" ? ( '15' ) : ( '0.5' ) }  placeholder="0" onChange={(e) => setFormData({ ...formData, no_of_day: e.target.value })} className="w-20 cursor-pointer rounded border border-gray-300 px-3 py-3" required />
                        </td>
                        <td className="px-6 py-4 border-b border-slate-100">
                          <textarea placeholder="(Please Specify)" onChange={(e) => setFormData({ ...formData, reason: e.target.value })} className="w-60 resize-none rounded border border-gray-300 px-3 py-3" required></textarea>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </form>
              </div>
            </div>
          </DialogPanel>
        </div>
      </Dialog>

      {/* EMPLOYEE LEAVE RECORDS */}
      <Dialog open={showView} onClose={closeView} className="relative z-[999]">
        <DialogBackdrop transition className="fixed inset-0 bg-black transition-opacity bg-opacity-50 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in" />
        
        <div className="fixed inset-0 justify-center max-h-full overflow-y-auto">
          <DialogPanel transition className="relative transform rounded-lg sm:w-full sm:my-8 transition-all data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in">
            <div className="bg-gray-100 max-w-[95%] w-full rounded-2xl border border-gray-300 mx-auto p-8">
              <div className="relative ml-[100%] -mt-6">
                <button title="Close" onClick={closeView} className="text-2xl text-gray-500 font-bold">&times;</button>
              </div>
              
              <div className="text-left mb-10">
                <span className="bg-blue-200 text-teal-800 text-3xl font-mono font-semibold rounded me-2 px-2.5 py-0.5">
                  View Records
                </span>
              </div>
              
              <div>
                <Description className="text-left text-red-500 text-sm font-semibold mb-1">Note: Deleting the approved leave will remove it from the records. Please use the delete button with caution.</Description>

                <table className="w-full text-base rounded-md shadow-lg overflow-hidden mb-6 table-auto bg-white">
                  <thead className="bg-gray-300 uppercase font-medium border-b border-slate-100 text-slate-600">
                    <tr className="text-center">
                      <th className="w-[13%] px-2 py-4 text-sm">Leave Type</th>
                      <th className="w-[15%] px-2 py-4 text-sm">Date of Leave</th>
                      <th className="w-[5%]  px-2 py-4 text-sm">Total # of Days</th>
                      <th className="w-[20%] px-2 py-4 text-sm">Reasons for Leave</th>
                      <th className="w-[12%] px-2 py-4 text-sm">Requested For</th>
                      <th className="w-[12%] px-2 py-4 text-sm">Created By</th>
                      <th className="w-[13%] px-2 py-4 text-sm">Status</th>
                      <th className="w-[10%] px-2 py-4 text-sm"></th>
                    </tr>
                  </thead>
                  <tbody className="text-center">
                    { leaveRecords.length > 0 ? ( leaveRecords ) : ( <tr className="text-center"><td className="px-6 py-4 border-b border-slate-100" colSpan={8}>No Available Data in Table</td></tr> ) }
                  </tbody>
                </table>
              </div>
            </div>
          </DialogPanel>
        </div>
      </Dialog>

      {/* RECOVER DELETED RECORDS */}
      <Dialog open={showRecover} onClose={closeRecover} className="relative z-[999]">
        <DialogBackdrop transition className="fixed inset-0 bg-black transition-opacity bg-opacity-50 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in" />
        
        <div className="fixed inset-0 justify-center max-h-full overflow-y-auto">
          <DialogPanel transition className="relative transform rounded-lg sm:w-full sm:my-8 transition-all data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in">
            <div className="bg-gray-100 max-w-[95%] w-full rounded-2xl border border-gray-300 mx-auto p-8">
              <div className="relative ml-[100%] -mt-6">
                <button title="Close" onClick={closeRecover} className="text-2xl text-gray-500 font-bold">&times;</button>
              </div>
              
              <div className="text-left mb-10">
                <span className="bg-blue-200 text-teal-800 text-3xl font-mono font-semibold rounded me-2 px-2.5 py-0.5">
                  Deleted Records
                </span>
              </div>
              
              <div>
                <Description className="text-left text-red-500 text-sm font-semibold mb-1">Note: Deleted records only last 7 days. After the given days, It will be removed permanently. </Description>

                <table className="w-full text-base rounded-md shadow-lg overflow-hidden mb-6 table-auto bg-white">
                  <thead className="bg-gray-300 uppercase font-medium border-b border-slate-100 text-slate-600">
                    <tr className="text-center">
                      <th className="w-[15%] px-6 py-4 text-sm">Leave Type</th>
                      <th className="w-[20%] px-6 py-4 text-sm">Date of Leave</th>
                      <th className="w-[5%]  px-6 py-4 text-sm">Total # of Days</th>
                      <th className="w-[20%] px-6 py-4 text-sm">Reasons for Leave</th>
                      <th className="w-[15%] px-6 py-4 text-sm">Requested For</th>
                      <th className="w-[15%] px-6 py-4 text-sm">Created By</th>
                      <th className="w-[10%] px-6 py-4"></th>
                    </tr>
                  </thead>
                  <tbody className="text-center">
                    { deletedRecords.length > 0 ? ( deletedRecords ) : ( <tr className="text-center"><td className="px-6 py-4 border-b border-slate-100" colSpan={7}>No Available Data in Table</td></tr> ) }
                  </tbody>
                </table>
              </div>
            </div>
          </DialogPanel>
        </div>
      </Dialog>

      {/* ALERT */}
      <Dialog open={showAlert} onClose={closeAlert} className="relative z-[999]">
        <DialogBackdrop transition className="fixed inset-0 bg-black transition-opacity bg-opacity-50 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in" />

        <DialogPanel transition className="fixed inset-0 justify-center transform transition-all rounded-lg sm:m-44 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in">
          <div className="max-w-[45%] bg-gray-100 rounded-2xl border border-gray-300 mx-auto p-8">
            <div className="relative ml-[100%] -mt-6">
              <button title="Close" onClick={closeAlert} className="text-2xl text-gray-500 font-bold">&times;</button>
            </div>
            
            <div className="text-left text-3xl font-mono font-semibold mb-6">
              { alert.status == 'success' ? (
                <span className="bg-green-200 text-green-800 rounded px-2.5 py-0.5">
                  Success
                </span>
              ) : ( 
                <span className="bg-red-200 text-red-800 rounded px-2.5 py-0.5">
                  Error
                </span>
              ) }
            </div>

            <div className="text-center">
              <Description>{alert.message}</Description>

              <button onClick={closeAlert} className="relative bg-blue-500 hover:bg-blue-600 text-white cursor-pointer font-bold transition rounded mt-6 w-16 h-11 duration-300 ease-in-out">
                OK
              </button>
            </div>
          </div>
        </DialogPanel>
      </Dialog>

      {/* LOADING SCREEN */}
      <Dialog open={showLoading} onClose={stopLoading} className="relative z-[999]">
        <DialogBackdrop transition className="fixed inset-0 bg-black transition-opacity bg-opacity-50 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in" />
        
        <DialogPanel transition className="fixed inset-0 transform transition-all rounded-lg sm:mx-44 sm:my-36 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in">
          <div className="max-w-[25%] mx-auto">
            <svg viewBox="0 0 200 200">
              <circle fill="#FFFFFF" stroke="#FFFFFF" strokeWidth="25" r="15" cx="40" cy="65"><animate attributeName="cy" calcMode="spline" dur="2" values="65;135;65;" keySplines=".5 0 .5 1;.5 0 .5 1" repeatCount="indefinite" begin="-.4"></animate></circle><circle fill="#FFFFFF" stroke="#FFFFFF" strokeWidth="25" r="15" cx="100" cy="65"><animate attributeName="cy" calcMode="spline" dur="2" values="65;135;65;" keySplines=".5 0 .5 1;.5 0 .5 1" repeatCount="indefinite" begin="-.2"></animate></circle><circle fill="#FFFFFF" stroke="#FFFFFF" strokeWidth="25" r="15" cx="160" cy="65"><animate attributeName="cy" calcMode="spline" dur="2" values="65;135;65;" keySplines=".5 0 .5 1;.5 0 .5 1" repeatCount="indefinite" begin="0"></animate></circle>
            </svg>
            <Description className="text-center text-white text-xl font-semibold outline-blue-500">Loading... Please wait</Description>
          </div>
        </DialogPanel>
      </Dialog>
        
    </>
  );

}