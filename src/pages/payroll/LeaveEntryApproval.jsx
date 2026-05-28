import { AppContext }                                                                                    from "../../context/AppContext";
import { useContext, useState, useEffect }                                                               from "react";
import { Dialog, DialogBackdrop, DialogPanel, Description, Tab, TabList, TabPanels, TabPanel, TabGroup } from '@headlessui/react';
import axios                                                                                             from "axios";
import dateFormat                                                                                        from 'dateformat';


export default function LeaveEntry() {

  const { user }                                         = useContext(AppContext);
  const [employee_details,     setEmployeeDetails      ] = useState([]);
  const [leave_records,        setLeaveRecords         ] = useState([]);
  const [approved_records,     setApprovedRecords      ] = useState([]);
  const [disapproved_records,  setDisapprovedRecords   ] = useState([]);
  const [sick_leave,           setSickLeaveLeft        ] = useState([]);
  const [vacation_leave,       setVacationLeaveLeft    ] = useState([]);
  const [emergency_leave,      setEmergencyLeaveLeft   ] = useState([]);
  const [paternity_leave,      setPaternityLeaveLeft   ] = useState([]);
  const [half_day_leave,       setHalfDayLeaveLeft     ] = useState([]);
  const [alert,                setAlert                ] = useState([]);
  const [confirm_data,         setConfirmData          ] = useState([]);
  const [showAlert,            setShowAlert            ] = useState(false);
  const [showConfirm,          setShowConfirm          ] = useState(false);
  const [showEmpRecord,        setShowEmpRecord        ] = useState(false);
  const [showLoading,          setShowLoading          ] = useState(false);
  const openAlert                                        = () => { setShowAlert(true)      };
  const closeAlert                                       = () => { setShowAlert(false)     };
  const openConfirm                                      = () => { setShowConfirm(true)    };
  const closeConfirm                                     = () => { setShowConfirm(false)   };
  const openEmpRecord                                    = () => { setShowEmpRecord(true)  };
  const closeEmpRecord                                   = () => { setShowEmpRecord(false) };
  const isLoading                                        = () => { setShowLoading(true)    };
  const stopLoading                                      = () => { setShowLoading(false)   };

  useEffect(() => {
    axios.get('/api/leave_records')
      .then(res => {
        setLeaveRecords(res.data.filter(data => data.status == 'n'));
        setApprovedRecords(res.data.filter(data => data.status == 'a'));
        setDisapprovedRecords(res.data.filter(data => data.status == 'c'));
      });
  }, [])

  async function generateDetails(emp_no) {
    axios.post('/api/leave_details', {emp_no: emp_no})
      .then(res => {
        setSickLeaveLeft(res.data.sick_leave_total);
        setVacationLeaveLeft(res.data.vacation_leave_total);
        setEmergencyLeaveLeft(res.data.emergency_leave_total);
        setPaternityLeaveLeft(res.data.paternity_leave_total);
        setHalfDayLeaveLeft(res.data.half_day_leave_total);
      });
  }

  const approveLeaveDetail = (e, leave_id) => {
    e.preventDefault();
    
    isLoading();

    let user_name = user.name;

    axios.post('/api/leave_records/approve', {id: leave_id, status_change_by: user_name})
      .then(res => {
        axios.get('/api/leave_records')
          .then(res => {
            setLeaveRecords(res.data.filter(data => data.status == 'n'));
            setApprovedRecords(res.data.filter(data => data.status == 'a'));
            setDisapprovedRecords(res.data.filter(data => data.status == 'c'));
          });

        stopLoading();
        closeConfirm();
        setAlert(res.data);
        openAlert();

      }).catch(function () {
        stopLoading();
        closeConfirm();
        setAlert({status: 'error', message: 'Oops, Something went wrong.'});
        openAlert();
      });
  }

  const disapproveLeaveDetail = (e, leave_id) => {
    e.preventDefault();
    
    isLoading();

    let user_name = user.name;

    axios.post('/api/leave_records/disapprove', {id: leave_id, status_change_by: user_name})
      .then(res => {
        axios.get('/api/leave_records')
          .then(res => {
            setLeaveRecords(res.data.filter(data => data.status == 'n'));
            setApprovedRecords(res.data.filter(data => data.status == 'a'));
            setDisapprovedRecords(res.data.filter(data => data.status == 'c'));
          });

        stopLoading();
        closeConfirm();
        setAlert(res.data);
        openAlert();

      }).catch(function () {
        stopLoading();
        closeConfirm();
        setAlert({status: 'error', message: 'Oops, Something went wrong.'});
        openAlert();
      });
  }

  const openConfirmApprove = (id) => {
    
    setConfirmData({type: 'approve', leave_id: id})
    openConfirm();
    
  }

  const openConfirmDisapprove = (id) => {
    
    setConfirmData({type: 'disapprove', leave_id: id})
    openConfirm();
    
  }

  const getEmpRecord = (emp_no) => {

    isLoading();

    axios.get('/api/employees')
      .then(res => {
        setEmployeeDetails(res.data.filter(data => data.id == emp_no));
        stopLoading();
      });

    generateDetails(emp_no);
    openEmpRecord();
    
  }

  const reloadTable = (e) => {
    e.preventDefault();
    
    isLoading();
    
    axios.get('/api/leave_records')
      .then(res => {
        setLeaveRecords(res.data.filter(data => data.status == 'n'));
        setApprovedRecords(res.data.filter(data => data.status == 'a'));
        setDisapprovedRecords(res.data.filter(data => data.status == 'c'));
        stopLoading();
      });

  }

  var leaveRecords = leave_records?.map( (leave_record, index) => {
    let date_from = (leave_record.date != leave_record.date_to)? dateFormat(leave_record.date, "mmmm dd") : dateFormat(leave_record.date, "mmmm dd, yyyy") ;
    let date_to   = (dateFormat(leave_record.date_to, "mm") != dateFormat(leave_record.date, "mm"))? dateFormat(leave_record.date_to, "mmmm dd, yyyy") : dateFormat(leave_record.date_to, "dd, yyyy") ;

    return (
      <tr className="hover:bg-slate-200" key={index}>
        <td className="px-6 py-4 border-b border-slate-200 text-sm  text-slate-700 hover:text-teal-700 font-bold"><button onClick={() => getEmpRecord(leave_record.emp_no)}>{leave_record.emp_name}</button></td>
        <td className="px-6 py-4 border-b border-slate-200 text-sm">{leave_record.leave_type.toUpperCase()} LEAVE</td>
        <td className="px-6 py-4 border-b border-slate-200 text-sm">{date_from.toUpperCase()} {leave_record.date_to != leave_record.date? 'to ' + date_to.toUpperCase() : ''}</td>
        <td className="px-6 py-4 border-b border-slate-200">{leave_record.no_of_day != '0.5'? (leave_record.no_of_day) : (<h1>½</h1>)}</td>
        <td className="px-6 py-4 border-b border-slate-200 text-sm">{leave_record.reason != ''? (leave_record.reason) : ('--')}</td>
        <td className="px-6 py-4 border-b border-slate-200 text-sm">{leave_record.encoded_by}</td>
        <td className="px-6 py-04 border-b border-slate-200">
          {/* APPROVE */}
          <button title="Approve" onClick={() => openConfirmApprove(leave_record.id)} className="relative bg-green-500 hover:bg-green-600 text-base text-white flex-auto transition cursor-pointer font-bold border border-solid border-secondary-500 rounded w-11 h-11 duration-300 ease-in-out">
            <svg fill="#ffffff" width="35px" height="35px" viewBox="-3.5 0 15 19" className="cf-icon-svg" stroke="#ffffff" strokeWidth="1.14"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier">
              <path d="M4.63 15.638a1.028 1.028 0 0 1-.79-.37L.36 11.09a1.03 1.03 0 1 1 1.58-1.316l2.535 3.043L9.958 3.32a1.029 1.029 0 0 1 1.783 1.03L5.52 15.122a1.03 1.03 0 0 1-.803.511.89.89 0 0 1-.088.004z"></path></g>
            </svg>
          </button>
          
          {/* DISAPPROVE */}
          <button title="Disapprove" onClick={() => openConfirmDisapprove(leave_record.id)} className="relative bg-red-500 hover:bg-red-600 text-base text-white flex-auto transition cursor-pointer font-bold border border-solid border-secondary-500 rounded w-11 h-11 duration-300 ease-in-out">
            <svg fill="#ffffff" width="35px" height="35px" viewBox="-3.5 0 15 19" className="cf-icon-svg" stroke="#ffffff" strokeWidth="1.14"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier">
              <path d="M11.383 13.644A1.03 1.03 0 0 1 9.928 15.1L6 11.172 2.072 15.1a1.03 1.03 0 1 1-1.455-1.456l3.928-3.928L.617 5.79a1.03 1.03 0 1 1 1.455-1.456L6 8.261l3.928-3.928a1.03 1.03 0 0 1 1.455 1.456L7.455 9.716z"></path></g>
            </svg>
          </button>
        </td>
      </tr>
    )
  });

  var approvedRecords = approved_records?.map( (approved_record, index) => {
    let date_from = (approved_record.date != approved_record.date_to)? dateFormat(approved_record.date, "mmmm dd") : dateFormat(approved_record.date, "mmmm dd, yyyy") ;
    let date_to   = (dateFormat(approved_record.date_to, "mm") != dateFormat(approved_record.date, "mm"))? dateFormat(approved_record.date_to, "mmmm dd, yyyy") : dateFormat(approved_record.date_to, "dd, yyyy") ;

    return (
      <tr className="hover:bg-slate-200" key={index}>
        <td className="px-6 py-4 border-b border-slate-200 text-sm  text-slate-700 hover:text-teal-700 font-bold"><button onClick={() => getEmpRecord(approved_record.emp_no)}>{approved_record.emp_name}</button></td>
        <td className="px-6 py-4 border-b border-slate-200 text-sm">{approved_record.leave_type.toUpperCase()} LEAVE</td>
        <td className="px-6 py-4 border-b border-slate-200 text-sm">{date_from.toUpperCase()} {approved_record.date_to != approved_record.date? 'to ' + date_to.toUpperCase() : ''}</td>
        <td className="px-6 py-4 border-b border-slate-200">{approved_record.no_of_day != '0.5'? (approved_record.no_of_day) : (<h1>½</h1>)}</td>
        <td className="px-6 py-4 border-b border-slate-200 text-sm">{approved_record.reason != ''? (approved_record.reason) : ('--')}</td>
        <td className="px-6 py-4 border-b border-slate-200 text-sm">{approved_record.status_change_by}</td>
        <td className="px-6 py-4 border-b border-slate-200 text-sm">{dateFormat(approved_record.updated_at, "yyyy-mm-dd")}</td>
      </tr>
    )
  });

  var disapprovedRecords = disapproved_records?.map( (disapproved_record, index) => {
    let date_from = (disapproved_record.date != disapproved_record.date_to)? dateFormat(disapproved_record.date, "mmmm dd") : dateFormat(disapproved_record.date, "mmmm dd, yyyy") ;
    let date_to   = (dateFormat(disapproved_record.date_to, "mm") != dateFormat(disapproved_record.date, "mm"))? dateFormat(disapproved_record.date_to, "mmmm dd, yyyy") : dateFormat(disapproved_record.date_to, "dd, yyyy") ;

    return (
      <tr className="hover:bg-slate-200" key={index}>
        <td className="px-6 py-4 border-b border-slate-200 text-sm  text-slate-700 hover:text-teal-700 font-bold"><button onClick={() => getEmpRecord(disapproved_record.emp_no)}>{disapproved_record.emp_name}</button></td>
        <td className="px-6 py-4 border-b border-slate-200 text-sm">{disapproved_record.leave_type.toUpperCase()} LEAVE</td>
        <td className="px-6 py-4 border-b border-slate-200 text-sm">{date_from.toUpperCase()} {disapproved_record.date_to != disapproved_record.date? 'to ' + date_to.toUpperCase() : ''}</td>
        <td className="px-6 py-4 border-b border-slate-200">{disapproved_record.no_of_day != '0.5'? (disapproved_record.no_of_day) : (<h1>½</h1>)}</td>
        <td className="px-6 py-4 border-b border-slate-200 text-sm">{disapproved_record.reason != ''? (disapproved_record.reason) : ('--')}</td>
        <td className="px-6 py-4 border-b border-slate-200 text-sm">{disapproved_record.status_change_by}</td>
        <td className="px-6 py-4 border-b border-slate-200 text-sm">{dateFormat(disapproved_record.updated_at, "yyyy-mm-dd")}</td>
      </tr>
    )
  });

  var employeeDetails = employee_details?.map( (employee_details) => {
    return (
      <thead className="text-sm uppercase font-medium border-b border-slate-100 text-slate-600" key={employee_details}>
        {/* ROW 1 */}
        <tr>
          <th className="w-[8rem] py-4">Employee Number</th><td className="w-[14rem]">: {String(employee_details.id).padStart(4, "0")}</td>
          <th className="w-[10rem]">Available Sick Leave</th><td className="w-[4rem]">: { sick_leave? ( sick_leave ) : ('0') }</td>
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
          <th className="py-6"></th><td></td>
          <th>Available Half-Day Leave</th><td>: { half_day_leave? ( half_day_leave ) : ('0') }</td>
        </tr>
      </thead>
    )
  });

  return (
    <>

      <div className="flex items-center font-medium border-b border-slate-300">
          <main className="ml-10 flex-1 mx-auto py-4"><h1>Payroll - Leave Entry (Approval)</h1></main>
      </div>

      <div className="mx-10 p-10">
        <button onClick={(e) => reloadTable(e)} className="relative bg-blue-500 hover:bg-blue-600 text-base text-white font-bold flex-auto transition cursor-pointer border border-solid border-secondary-500 rounded w-36 h-11 mx-[45%] my-2 px-3 py-[0.32rem] duration-300 ease-in-out">Refresh Page</button>

        <TabGroup>
          <TabList className="text-sm">
            <Tab className="font-bold text-slate-600 py-3 px-5 sm:rounded-t-md data-[selected]:bg-white data-[selected]:border-t data-[selected]:border-l data-[selected]:border-r data-[selected]:text-slate-700">For Approval</Tab>
            <Tab className="font-bold text-green-700 py-3 px-5 data-[selected]:sm:rounded-t-md data-[selected]:bg-white data-[selected]:border-t data-[selected]:border-l data-[selected]:border-r data-[selected]:text-green-800">Approved</Tab>
            <Tab className="font-bold text-red-700 py-3 px-5 data-[selected]:sm:rounded-t-md data-[selected]:bg-white data-[selected]:border-t data-[selected]:border-l data-[selected]:border-r data-[selected]:text-red-800">Disapproved</Tab>
          </TabList>
          <TabPanels>
            {/* FOR APPROVAL PANEL */}
            <TabPanel className="px-5 py-4 bg-white border border-t-0">
              <div className="overflow-auto">
                {/* EMPLOYEE FOR APPROVAL LEAVE TABLE */}
                <div className="mx-10 my-10">
                  <table className="w-full text-base rounded-md shadow-lg overflow-hidden mb-6 table-auto bg-white border-t border-l border-r">
                    <thead className="bg-gray-300 uppercase font-medium border-b border-slate-100 text-slate-600">
                      <tr className="text-center">
                        <th className="w-[20%] px-2 py-4 text-sm">Requested For</th>
                        <th className="w-[15%] px-2 py-4 text-sm">Leave Type</th>
                        <th className="w-[15%] px-2 py-4 text-sm">Date of Leave</th>
                        <th className="w-[5%]  px-2 py-4 text-sm">Total # of Days</th>
                        <th className="w-[30%] px-2 py-4 text-sm">Reasons for Leave</th>
                        <th className="w-[15%] px-2 py-4 text-sm">Created By</th>
                        <th className="w-[10%] px-2 py-4 text-sm"></th>
                      </tr>
                    </thead>
                    <tbody className="text-center">
                      { leaveRecords.length > 0 ? ( leaveRecords ) : ( <tr className="text-center"><td className="px-6 py-4 border-b border-slate-100" colSpan={8}>No Available Data in Table</td></tr> ) }
                    </tbody>
                  </table>
                </div>
              </div>
            </TabPanel>
            {/* APPROVED PANEL */}
            <TabPanel className="px-5 py-4 bg-white border border-t-0">
            <div className="overflow-auto">

            {/* EMPLOYEE APPROVED LEAVE TABLE */}
            <div className="mx-10 my-10">
            <div>
                <table className="w-full text-base rounded-md shadow-lg overflow-hidden mb-6 table-auto bg-white border-t border-l border-r">
                  <thead className="bg-gray-300 uppercase font-medium border-b border-slate-100 text-slate-600">
                    <tr className="text-center">
                      <th className="w-[20%] px-2 py-4 text-sm">Requested For</th>
                      <th className="w-[15%] px-2 py-4 text-sm">Leave Type</th>
                      <th className="w-[15%] px-2 py-4 text-sm">Date of Leave</th>
                      <th className="w-[5%]  px-2 py-4 text-sm">Total # of Days</th>
                      <th className="w-[30%] px-2 py-4 text-sm">Reasons for Leave</th>
                      <th className="w-[15%] px-2 py-4 text-sm">Approved By</th>
                      <th className="w-[10%] px-2 py-4 text-sm">Date Approved</th>
                    </tr>
                  </thead>
                  <tbody className="text-center">
                    { approvedRecords.length > 0 ? ( approvedRecords ) : ( <tr className="text-center"><td className="px-6 py-4 border-b border-slate-100" colSpan={8}>No Available Data in Table</td></tr> ) }
                  </tbody>
                </table>
              </div>
            </div>
            </div>
            </TabPanel>
            {/* DISAPPROVED PANEL */}
            <TabPanel className="px-5 py-4 bg-white border border-t-0">
            <div className="overflow-auto">

            {/* EMPLOYEE DISAPPROVED LEAVE TABLE */}
            <div className="mx-10 my-10">
            <div>
                <table className="w-full text-base rounded-md shadow-lg overflow-hidden mb-6 table-auto bg-white border-t border-l border-r">
                  <thead className="bg-gray-300 uppercase font-medium border-b border-slate-100 text-slate-600">
                    <tr className="text-center">
                      <th className="w-[20%] px-2 py-4 text-sm">Requested For</th>
                      <th className="w-[15%] px-2 py-4 text-sm">Leave Type</th>
                      <th className="w-[15%] px-2 py-4 text-sm">Date of Leave</th>
                      <th className="w-[5%]  px-2 py-4 text-sm">Total # of Days</th>
                      <th className="w-[30%] px-2 py-4 text-sm">Reasons for Leave</th>
                      <th className="w-[15%] px-2 py-4 text-sm">Disapproved By</th>
                      <th className="w-[10%] px-2 py-4 text-sm">Date Disapproved</th>
                    </tr>
                  </thead>
                  <tbody className="text-center">
                    { disapprovedRecords.length > 0 ? ( disapprovedRecords ) : ( <tr className="text-center"><td className="px-6 py-4 border-b border-slate-100" colSpan={8}>No Available Data in Table</td></tr> ) }
                  </tbody>
                </table>
              </div>
            </div>
            </div>
            </TabPanel>
          </TabPanels>
        </TabGroup> 
      </div>

      {/* EMPLOYEE LEAVE RECORD */}
      <Dialog open={showEmpRecord} onClose={closeEmpRecord} className="relative z-[999]">
        <DialogBackdrop transition className="fixed inset-0 bg-black transition-opacity bg-opacity-50 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in" />

        <DialogPanel transition className="fixed inset-0 justify-center transform transition-all rounded-lg sm:m-44 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in">
          <div className="max-w-[80%] bg-gray-100 rounded-2xl border border-gray-300 mx-auto p-8">
            <div className="relative ml-[100%] -mt-6">
              <button title="Close" onClick={closeEmpRecord} className="text-2xl text-gray-500 font-bold">&times;</button>
            </div>
            
            <div className="text-left text-3xl font-mono font-semibold mb-6">
              <span className="bg-teal-200 text-teal-800 rounded px-2.5 py-0.5">
                Employee Leave Record
              </span>
            </div>

            <div className="text-center">
              <table className="shadow-none w-10/12 ml-10 p-4 w-full text-sm text-left rounded-md shadow-lg overflow-hidden mb-6 table-auto">
                
                {/* GENERATE EMPLOYEE DETAILS */}
                {employeeDetails}

              </table>
            </div>
          </div>
        </DialogPanel>
      </Dialog>

      {/* CONFIRM */}
      <Dialog open={showConfirm} onClose={closeConfirm} className="relative z-[999]">
        <DialogBackdrop transition className="fixed inset-0 bg-black transition-opacity bg-opacity-50 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in" />

        <DialogPanel transition className="fixed inset-0 justify-center transform transition-all rounded-lg sm:m-44 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in">
          <div className="max-w-[45%] bg-gray-100 rounded-2xl border border-gray-300 mx-auto p-8">
            <div className="relative ml-[100%] -mt-6">
              <button title="Close" onClick={closeConfirm} className="text-2xl text-gray-500 font-bold">&times;</button>
            </div>
            
            <div className="text-left text-3xl font-mono font-semibold mb-6">
              <span className="bg-teal-200 text-teal-800 rounded px-2.5 py-0.5">
                Confirm
              </span>
            </div>

            <div className="text-center">
              { confirm_data.type == 'approve' ? (
                <Description>Are you sure want to approve this leave request?</Description>
              ) : ( 
                <Description>Are you sure want to disapprove this leave request?</Description>
              ) }
              
              { confirm_data.type == 'approve' ? (
                <button onClick={(e) => approveLeaveDetail(e, confirm_data.leave_id)} className="relative bg-blue-500 hover:bg-blue-600 text-white cursor-pointer font-bold transition rounded mt-6 mr-2 w-16 h-11 duration-300 ease-in-out">
                  Yes
                </button>
              ) : ( 
                <button onClick={(e) => disapproveLeaveDetail(e, confirm_data.leave_id)} className="relative bg-blue-500 hover:bg-blue-600 text-white cursor-pointer font-bold transition rounded mt-6 mr-2 w-16 h-11 duration-300 ease-in-out">
                  Yes
                </button>
              ) }
              
              <button onClick={closeConfirm} className="relative bg-red-500 hover:bg-red-600 text-white cursor-pointer font-bold transition rounded mt-6 w-16 h-11 duration-300 ease-in-out">
                No
              </button>
            </div>
          </div>
        </DialogPanel>
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