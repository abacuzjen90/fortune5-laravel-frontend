import { useNavigate } from 'react-router-dom';
import { Dialog, DialogBackdrop, DialogPanel } from '@headlessui/react';
import { useContext, useEffect, useState} from "react";
import { AppContext } from "../../context/AppContext";
import { Link } from 'react-router-dom';
import InfoBox from "../../assets/components/InfoBox";
import ConfirmBox from "../../assets/components/DeleteBox";
import UpdateBox from "../../assets/components/UpdateBox";
import { MdAdd } from "react-icons/md";
import { FaRegTrashAlt, FaRegEdit, FaUserEdit, FaUserPlus, FaList, FaPlus } from "react-icons/fa";
import Pagination from '../../assets/components/Pagination';
import TableSort from '../../assets/components/TableSort';
import LoadingBox from '../../assets/components/Loading';
import sortData from '../../assets/components/sortData';
import useScreenSize from "../../assets/components/useScreenSize";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";


export default function ProductIssuance() {
  const navigate = useNavigate();
  const [openAddDial, setOpenAddDial] = useState(false);
  const [openReport, setOpenReport] = useState(false);
  const [openUpdateDial, setOpenUpdateDial] = useState(false);
  const [open, setOpen] = useState(false);
  const { user, token } = useContext(AppContext);
  const [showLoading, setShowLoading] = useState(false);
  const isLoading = () => {setShowLoading(true)};
  const stopLoading = () => {setShowLoading(false)};
  const [status, setStatus] = useState(0);
  const [productIssuance, setProductIssuance] = useState([]);
  const [stockHeader, setStockHeader] = useState([]);
  const [id, setId] = useState(null);
  const isMediumScreen = useScreenSize(768);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [getIssuance, setGetIssuance] = useState([]);


  //Table Pagination, Search
  const [sortdata, setSortdata] = useState([]);
  const [sorting, setSorting] = useState({ key: "", ascending: true });
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageCount, setPageCount] = useState(0);
  const [dataPerPage, setDataperpage] = useState(10);

  const [formData, setFormData] = useState({
    destination: "", rate_cbm: "", rate_kilo: "", value_charge: "", advalorem: "", minimum: "", encoder: "",
  });

  const [stockHeaderData, setStockHeaderData] = useState({
    supplier_name: "", delivery_receipt: "", order_date: "", delivery_date: "", remarks: "",
  });


  const [errors, setErrors] = useState({});
  const [dateError, setDateError] = useState("");


  const changePage = (i) => {
    setCurrentPage(i);
    const startItem = (i - 1) * dataPerPage;
    setSortdata(productIssuance.slice(startItem, startItem + dataPerPage));
  };

  const handleChange = (value) => {
    changePage(value);
  };


  //Search and Table Sorting
  async function searchTable() {
    const filtered = productIssuance.filter(rec => 
      rec.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      rec.product_name.toLowerCase().includes(search.toLowerCase()) ||
      rec.drno.toLowerCase().includes(search.toLowerCase()) ||
      rec.unit.toLowerCase().includes(search.toLowerCase())
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


  const handleViewReport = () => {
    if (!fromDate || !toDate) {
      setDateError("Invalid empty date.");
      return;
    }
    setDateError("");
    getIssuanceList();
    setOpenReport(true);
  };

  
  // Get Stock Header
  async function getIssuanceList() {
    isLoading();

    try {
      const queryParams = new URLSearchParams();

      if (fromDate) queryParams.append("from", fromDate);
      if (toDate) queryParams.append("to", toDate);

      const res = await fetch(`/api/getissuancelist?${queryParams}`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      console.log(data);

      if (res.ok) {
        setProductIssuance(data);
        setPageCount(Math.ceil(data.length / dataPerPage));
        setSortdata(data.slice(0, dataPerPage));
      }

    } catch (error) {
      console.error("Error fetching issuance list:", error);
    } finally {
      stopLoading();
    }
  }

  useEffect(() => {
    if (fromDate && toDate) {
      if (new Date(toDate) < new Date(fromDate)) {
        setDateError("To date cannot be earlier than From date.");
        return;
      }
    }

    setDateError("");
    getIssuanceList();
  }, [dataPerPage, fromDate, toDate]);


  // Get Issuance Details
  async function getIssuanceDetails(id) {
    isLoading();
    setFormData({});
    console.log(id);
    if(id){
      const res = await fetch(`/api/getissuancedetails/${id}`, {
       method: "get",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          Authorization: `Bearer ${token}`,
        },
    });
      const data = await res.json();
      console.log(data.details);
      console.log(res);
      if(res.ok) {
        setGetIssuance(data);
      }
    }
    stopLoading();
  }

  function formatDate(dateString) {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    });
  }

  return (
    <> 
    <div className="flex items-center font-medium border-b border-slate-300 w-full">
      <main className="px-4 flex-1 mx-auto py-4"><h1 className='text-2xl font-bold'>Product Issuance</h1></main>
    </div>
    <div className="flex items-center font-medium flex-1 mx-auto py-4 ">
      <main className="flex-1 mx-auto p-4">
        <div className={`overflow-x-auto transition-all duration-75 min-w-0 mx-auto ${isMediumScreen ? "w-[calc(100vw-19rem)]" : "w-[calc(100vw-6rem)]"}`}>
          <div className="bg-gray-50 shadow-md border">
            <div className="p-6 text-gray-900 dark:text-gray-100">
              <div className="text-left caption-top dark:text-gray-800">
                <div className="flex flex-row py-2">
                  <div className="flex w-full whitespace-nowrap"><h1>Product Sales</h1></div>
                  
                  <div className="w-full flex flex-col md:flex-row justify-end gap-4 items-end text-sm text-gray-800 mb-4">
                    {/* From Date */}
                    <div className="flex flex-col w-full">
                      <label htmlFor="from-date" className="mb-1 font-medium">From:</label>
                      <DatePicker
                        selected={fromDate ? new Date(fromDate) : null} // convert string → Date
                        onChange={(date) => setFromDate(date ? format(date, "yyyy-MM-dd") : "")} // store string for backend
                        dateFormat="MM/dd/yyyy" // display MM-DD-YYYY in input
                        className="min-w-[90px] px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-400 w-full text-sm text-gray-800"
                        placeholderText="MM/DD/YYYY"
                      />
                    </div>

                    {/* To Date */}
                    <div className="flex flex-col w-full">
                      <label htmlFor="to-date" className="mb-1 font-medium">To:</label>
                      <DatePicker
                        selected={toDate ? new Date(toDate) : null} // convert string → Date
                        onChange={(date) => setToDate(date ? format(date, "yyyy-MM-dd") : "")} // store string for backend
                        dateFormat="MM/dd/yyyy" // display MM-DD-YYYY in input
                        className="min-w-[90px] px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-400 w-full text-sm text-gray-800"
                        placeholderText="MM/DD/YYYY"
                      />
                    </div>

                    {/* View Report Button */}
                    <button
                      className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md font-medium whitespace-nowrap"
                      onClick={() => {handleViewReport(); setErrors(false)}}
                    >
                      View Report
                    </button>
                  </div>



                  </div>
                  {dateError && (
                    <div className="text-red-600 text-sm -mt-4 mb-4 text-right">{dateError}</div>
                  )}
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
                  <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-center uppercase bg-gray-200 text-gray-800 border-b border-t border-gray-300">
                      <tr className="text-nowrap">
                      <th className="px-3 py-3">
                        <TableSort title="Issuance No." field="header_id" sorteddata={sortdata} setSorteddata={setSortdata} sorting={sorting} setSorting={setSorting} />
                      </th>
                      <th className="px-3 py-3 w-1/6">
                        <TableSort title="Transaction Date" field="transaction_date" sorteddata={sortdata} setSorteddata={setSortdata} sorting={sorting} setSorting={setSorting} />
                      </th>
                      <th className="px-3 py-3 w-1/6">
                        <TableSort title="DR#" field="drno" sorteddata={sortdata} setSorteddata={setSortdata} sorting={sorting} setSorting={setSorting} />
                      </th>
                      <th className="px-3 py-3 w-1/6">
                        <TableSort title="Customer Name" field="customer_name" sorteddata={sortdata} setSorteddata={setSortdata} sorting={sorting} setSorting={setSorting} />
                      </th>
                      <th className="px-3 py-3 w-1/4">
                        <div className="flex justify-start">
                          <TableSort title="Product Name" field="product_name" sorteddata={sortdata} setSorteddata={setSortdata} sorting={sorting} setSorting={setSorting} />
                        </div>
                      </th>
                      <th className="px-3 py-3">
                        <TableSort title="Unit" field="unit" sorteddata={sortdata} setSorteddata={setSortdata} sorting={sorting} setSorting={setSorting} />
                      </th>
                      <th className="px-3 py-3">
                        <TableSort title="Quantity" field="quantity" sorteddata={sortdata} setSorteddata={setSortdata} sorting={sorting} setSorting={setSorting} />
                      </th>
                      <th className="px-3 py-3 whitespace-nowrap">
                        <TableSort title="Unit Price" field="unit_price" sorteddata={sortdata} setSorteddata={setSortdata} sorting={sorting} setSorting={setSorting} />
                      </th>
                      <th className="px-3 py-3">
                        <TableSort title="Total Amount" field="amount" sorteddata={sortdata} setSorteddata={setSortdata} sorting={sorting} setSorting={setSorting} />
                      </th>
                      {user.role === 'Manager' && (
                      <th className='px-3 py-3'>
                        <TableSort title="Net Amount" field="amount" sorteddata={sortdata} setSorteddata={setSortdata} sorting={sorting} setSorting={setSorting} />
                      </th>
                      )}
                      <th className='px-3 py-3'>Encoded by</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm text-center bg-gray-50 dark:bg-gray-100 dark:text-gray-800 border-b-2 border-gray-300">
                    {sortdata.length > 0 ? (sortdata.map(rec => (
                      <tr className="text-xs bg-white border-b dark:bg-gray-100 dark:border-gray-300 hover:bg-gray-50" key={rec.id}>     
                          <th className="px-3 py-3">
                            <button onClick={() => {getIssuanceDetails(rec.header_id); setOpenAddDial(true); setErrors(false)}} className="font-medium text-blue-600 dark:text-blue-500 hover:underline mx-1">{String(rec.header_id).padStart(4, "0")}
                            </button>
                          </th>
                          <td className="px-3 py-3">{formatDate(rec.transaction_date)}</td>
                          <td className="px-3 py-3 whitespace-nowrap">{rec.drno ? `${rec.drletter} ${rec.drno}` : "-"}</td>
                          <td className="px-3 py-3">{rec.customer_name}</td>
                          <td className="px-3 py-3 w-3/4 text-left">{rec.product_name}</td>
                          <td className="px-3 py-3">{rec.unit}</td>
                          <td className={`px-3 py-2 font-bold whitespace-nowrap ${
                              rec.status === "return" ? "text-red-600" : "text-blue-800"
                            }`}
                          >
                            {rec.quantity} {(rec.unit_type === "BIG_UNIT" && rec.small_conversion) ? "(" + (rec.quantity * rec.small_conversion) + ")" : ""}
                          </td>
                          {/* <td className="px-3 py-2 font-bold">{`${rec.quantity} - ${rec.cost_per_unit}`}</td> */}
                          <td className={`px-3 py-2 font-bold text-right whitespace-nowrap ${
                              rec.status === "return" ? "text-red-600" : "text-blue-800"
                            }`}
                          >
                            {rec.status === "return"
                            ? `(₱${parseFloat(rec.unit_price).toLocaleString(undefined, { minimumFractionDigits: 2 })})`
                            : `₱${parseFloat(rec.unit_price).toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
                          </td>
                          <td className={`px-3 py-2 font-bold text-right whitespace-nowrap ${
                              rec.status === "return" ? "text-red-600" : "text-blue-800"
                            }`}
                          >
                            {rec.status === "return"
                            ? `(₱${parseFloat(rec.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })})`
                            : `₱${parseFloat(rec.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
                          </td>
                          {user.role === 'Manager' && (
                          <td className={`px-3 py-2 font-bold text-right whitespace-nowrap ${
                              rec.status === "return" ? "text-red-700" : "text-blue-900"
                            }`}
                          >
                            ₱ {rec.status === "return"
                              ? `(${parseFloat(
                                  (rec.unit_price - (rec.unit_type === "BIG_UNIT" ? rec.big_cost : rec.cost_per_unit)) *
                                    rec.quantity
                                ).toLocaleString(undefined, { minimumFractionDigits: 2 })})`
                              : parseFloat(
                                  (rec.unit_price - (rec.unit_type === "BIG_UNIT" ? rec.big_cost : rec.cost_per_unit)) *
                                    rec.quantity
                                ).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>
                          )}
                          <td className='px-3 py-2'>{rec.encoded_by}</td>

                            {/* parseFloat(rec.unit_price * rec.quantity).toLocaleString(undefined, { minimumFractionDigits: 2 }) */}
                        </tr>
                    ))) : (
                      <tr className='text-xs bg-white border-b dark:bg-gray-100 dark:border-gray-300'>
                        <td className='px-3 py-3 text-center' colSpan={11}>No Data</td>
                      </tr>
                    )}
                     </tbody>                        
                  </table>
                </div> 
                <Pagination dataSize={productIssuance.length} dataPPage={dataPerPage} nPages={pageCount} currentPage={currentPage} setCurrentPage={handleChange} />
            </div>
          </div>
        </div>  
      </main> 
    </div>

    {/* Issuance Details */}
    <Dialog open={openAddDial} onClose={setOpenAddDial} className="relative z-[999]">
      <DialogBackdrop
          transition
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
      />

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <DialogPanel transition className="relative transform overflow-hidden transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-screen-lg data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"> 

          {/* Close button */}
        <button
          onClick={() => setOpenAddDial(false)}
          className="absolute top-5 right-5 text-gray-500 hover:text-gray-800 transition"
        >
          ✕
        </button>

            <div className="flex flex-col font-[sans-serif]">
                <div className="w-full mx-auto border border-gray-300 p-8 bg-gray-50">
                  <div className="text-center mb-4">
                    <h1 className="text-2xl text-left pb-6 flex"><FaRegEdit size={30} className='mr-1'/> Issuance Details </h1>
                    
                      <div className="flex flex-col border p-4 bg-gray-100 space-y-6">
                        {/* Header Section */}
                        <div className="bg-white shadow p-6">
                          {getIssuance.header && (
                            <>
                          <div className='grid grid-cols-1 md:grid-cols-2 gap-4 '>
                          <div><h2 className="text-lg font-semibold text-gray-800 text-left">Issuance Header</h2></div>
                          <div className='text-right text-md font-bold'><Link to="/maintenance/pointofsales" state={{ issuanceId: getIssuance.header.id }}>Issuance No: {String(getIssuance.header.id).padStart(4, "0")} </Link>
                          </div>
                          </div>
                          <hr className='mb-4'/>
                          
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4 bg-white">
                              <div className='text-left'>
                                <label className="font-bold text-gray-700">Transaction Date</label>
                                <div>{formatDate(getIssuance.header.transaction_date)}</div>
                              </div>
                              <div className='text-left'>
                                <label className="font-bold text-gray-700">Delivery Receipt No.</label>
                                <div>{getIssuance.header.drno ? `${getIssuance.header.drletter} ${getIssuance.header.drno}` : "-"}</div>
                              </div>
                              <div className='text-left'>
                                <label className="font-bold text-gray-700">Customer Name</label>
                                <div className='text-left'>{getIssuance.header.customer_name}</div>
                              </div>
                              <div className='text-left'>
                                <label className="font-bold text-gray-700">Address</label>
                                <div>{getIssuance.header.address}</div>
                              </div>
                              <div className='text-left'>
                                <label className="font-bold text-gray-700">Contact Number</label>
                                <div>{getIssuance.header.contact_number}</div>
                              </div>
                              <div className='text-left'>
                                <label className="font-bold text-gray-700">Terms</label>
                                <div>{getIssuance.header.terms}</div>
                              </div>
                            </div>
                            </>
                          )}
                        </div>

                        {/* Details Section */}
                        <div className="bg-white shadow p-6 overflow-x-auto">
                        <h2 className="text-lg font-semibold text-gray-800 text-left mb-4">Product Details</h2>

                        <table className="w-full text-sm border-collapse">
                          <thead>
                            <tr className="bg-gray-50 text-gray-700 font-bold border-t border-b">
                              <th className="px-3 py-3 text-left w-[50px]">No.</th>
                              <th className="px-3 py-3 text-left min-w-[200px]">Product Name</th>
                              <th className="px-3 py-3 text-center w-[100px]">Unit</th>
                              <th className="px-3 py-3 text-center w-[80px]">Quantity</th>
                              {user.role === 'Manager' && (
                              <th className="px-3 py-3 text-right w-[120px]">Unit Cost</th>
                              )}
                              <th className="px-3 py-3 text-right w-[120px]">Unit Price</th>
                              <th className="px-3 py-3 text-right w-[140px]">Total Amount</th>
                              {user.role === 'Manager' && (
                              <th className="px-3 py-3 text-right w-[140px]">Net Amount</th>
                              )}
                            </tr>
                          </thead>
                          <tbody>
                            {getIssuance.details?.map((item, index) => (
                              <tr key={item.id} className="hover:bg-gray-50 transition border-b">
                                <td className="px-3 py-3 text-center">{index + 1}.</td>
                                <td className="px-3 py-3 text-left">{item.product_name}</td>
                                <td className="px-3 py-3 text-center">{item.unit}</td>
                                <td className={`px-3 py-2 font-bold text-right whitespace-nowrap ${
                                    item.status === "return" ? "text-red-600" : "text-slate-800"
                                  }`}
                                >{item.quantity}</td>
                                {user.role === 'Manager' && (
                                <td className="px-3 py-3 text-right text-blue-900 font-bold">
                                  ₱ {parseFloat((item.unit_type === "BIG_UNIT" ? item.big_cost : item.cost_per_unit)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </td>
                                )}
                                <td className={`px-3 py-2 font-bold text-right whitespace-nowrap ${
                                    item.status === "return" ? "text-red-600" : "text-slate-800"
                                  }`}
                                >
                                  ₱ {parseFloat(item.unit_price).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </td>
                                <td className={`px-3 py-2 font-bold text-right whitespace-nowrap ${
                                    item.status === "return" ? "text-red-600" : "text-slate-800"
                                  }`}
                                >
                                  {item.status === "return"
                                  ? `(₱ ${parseFloat(item.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })})`
                                  : `₱ ${parseFloat(item.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
                                </td>
                                {user.role === 'Manager' && (
                                <td className={`px-3 py-2 font-bold text-right whitespace-nowrap ${
                                    item.status === "return" ? "text-red-700" : "text-blue-900"
                                  }`}
                                >
                                  ₱ {item.status === "return"
                                  ? `(${parseFloat(
                                      (item.unit_price - (item.unit_type === "BIG_UNIT" ? item.big_cost : item.cost_per_unit)) *
                                        item.quantity
                                    ).toLocaleString(undefined, { minimumFractionDigits: 2 })})`
                                  : parseFloat(
                                      (item.unit_price - (item.unit_type === "BIG_UNIT" ? item.big_cost : item.cost_per_unit)) *
                                        item.quantity
                                    ).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </td>
                                )}
                              </tr>
                            ))}
                          </tbody>
                          {getIssuance.details?.length > 0 && (
                            <tfoot>
                              <tr className="font-bold border-t-2 border-t-gray-300">
                                <td colSpan={4} className='px-3 py-3 text-right'>
                                  {getIssuance.details.reduce(
                                    (sum, item) => sum + (item.status === "return" ? -item.quantity : item.quantity),
                                    0
                                  )}
                                </td>
                                <td colSpan={3} className="px-3 py-3 text-right">
                                  {getIssuance.details.reduce(
                                (sum, item) => sum + (item.status === "return" ? -item.amount : item.amount), 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </td>
                                {user.role === 'Manager' && (
                                <td className="px-3 py-3 text-right text-slate-800">
                                  ₱{" "}
                                  {getIssuance.details
                                    .reduce((sum, item) => {
                                      const value =
                                        (item.unit_price -
                                          (item.unit_type === "BIG_UNIT" ? item.big_cost : item.cost_per_unit)) *
                                        item.quantity;

                                      return sum + (item.status === "return" ? -value : value);
                                    }, 0)
                                    .toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </td>
                                )}
                              </tr>
                            </tfoot>
                          )}
                        </table>
                      </div>

                      </div>

                    </div>
                  </div>
                </div>
            </DialogPanel>
          </div>
      </div>
    </Dialog>


    {/* Issuance Reports */}
    <Dialog open={openReport} onClose={setOpenReport} className="relative z-[999]">
      <DialogBackdrop
          transition
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
      />

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <DialogPanel transition className="relative transform overflow-hidden transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-screen-xl data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"> 

          {/* Close button */}
          <button onClick={() => setOpenReport(false)} className="absolute top-5 right-5 text-gray-500 hover:text-gray-800 transition">✕</button>
            <div className="flex flex-col font-[sans-serif]">
              <div className="w-full mx-auto border border-gray-300 p-8 bg-gray-50">
                <div className="text-center mb-4">
                <h1 className="text-2xl text-left pb-6 flex"><FaRegEdit size={30} className='mr-1'/> Issuance Report </h1>
                
                  <div className="flex flex-col border p-4 bg-gray-100 space-y-6">
                    {/* Details Section */}
                    <div className="bg-white shadow p-6 overflow-x-auto">
                    <h2 className="text-lg font-semibold text-gray-800 text-left mb-4">Product Details</h2>
                    <div className="flex w-1/3 py-4">
                      <div className="w-1/2 text-left font-semibold">From: {formatDate(fromDate)}</div>
                      <div className="w-1/2 text-right font-semibold">To: {formatDate(toDate)}</div>
                    </div>
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="bg-gray-50 text-gray-700 font-bold border-t border-b">
                          <th className="px-3 py-3 text-left w-[50px]">No.</th>
                          <th className="px-3 py-3 text-center w-[50px] whitespace-nowrap">Transaction Date</th>
                          <th className="px-3 py-3 text-center w-[50px] whitespace-nowrap">DR. No</th>
                          <th className="px-3 py-3 text-left min-w-[230px]">Product Name</th>
                          <th className="px-3 py-3 text-center w-[100px]">Unit</th>
                          <th className="px-3 py-3 text-center w-[80px]">Quantity</th>
                          {user.role === 'Manager' && (
                          <th className="px-3 py-3 text-right w-[120px] whitespace-nowrap">Unit Cost</th>
                          )}
                          <th className="px-3 py-3 text-right w-[120px] whitespace-nowrap">Unit Price</th>
                          <th className="px-3 py-3 text-right w-[120px] whitespace-nowrap">Total Amount</th>
                          {user.role === 'Manager' && (
                          <th className="px-3 py-3 text-right w-[120px] whitespace-nowrap">Net Amount</th>
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {productIssuance.map((item, index) => (
                          <tr key={item.id} className="hover:bg-gray-50 transition border-b">
                            <td className="px-3 py-3 text-center">{index + 1}.</td>
                            <td className="px-3 py-3 text-center">{formatDate(item.transaction_date)}</td>
                            <td className="px-3 py-3 text-center whitespace-nowrap">{item.drno ? `${item.drletter} ${item.drno}` : "-"}</td>
                            <td className="px-3 py-3 text-left font-bold">{item.product_name}</td>
                            <td className="px-3 py-3 text-center">{item.unit}</td>
                            <td className={`px-3 py-2 font-bold text-center whitespace-nowrap ${
                                item.status === "return" ? "text-red-600" : "text-slate-800"
                              }`}
                            >{item.quantity}</td>
                            {user.role === 'Manager' && (
                            <td className="px-3 py-3 text-right text-blue-900 font-bold whitespace-nowrap">
                              ₱ {parseFloat((item.unit_type === "BIG_UNIT" ? (item.big_cost || 0) : (item.cost_per_unit || 0))).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </td>
                            )}
                            <td className={`px-3 py-2 font-bold text-right whitespace-nowrap ${
                                item.status === "return" ? "text-red-600" : "text-slate-800"
                              }`}
                            >
                              {item.status === "return"
                              ? `(₱ ${parseFloat(item.unit_price).toLocaleString(undefined, { minimumFractionDigits: 2 })})`
                              : `₱ ${parseFloat(item.unit_price).toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
                            </td>
                            <td className={`px-3 py-2 font-bold text-right whitespace-nowrap ${
                                item.status === "return" ? "text-red-600" : "text-slate-800"
                              }`}
                            >
                              {item.status === "return"
                              ? `(₱ ${parseFloat(item.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })})`
                              : `₱ ${parseFloat(item.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
                            </td>
                            {user.role === 'Manager' && (
                            <td className={`px-3 py-2 font-bold text-right whitespace-nowrap ${
                                item.status === "return" ? "text-red-700" : "text-blue-900"
                              }`}
                            >
                              ₱ {item.status === "return"
                              ? `(${parseFloat(
                                  (item.unit_price - (item.unit_type === "BIG_UNIT" ? item.big_cost : item.cost_per_unit)) *
                                    item.quantity
                                ).toLocaleString(undefined, { minimumFractionDigits: 2 })})`
                              : parseFloat(
                                  (item.unit_price - (item.unit_type === "BIG_UNIT" ? item.big_cost : item.cost_per_unit)) *
                                    item.quantity
                                ).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                      {productIssuance.length > 0 && (
                        <tfoot>
                          <tr className="font-bold border-t-2 border-t-gray-300">
                            <td colSpan={5} className="px-3 py-3 text-right">&nbsp;</td>
                            <td className="px-3 py-3 text-center text-slate-800">
                              {productIssuance.reduce(
                                (sum, item) => sum + (item.status === "return" ? -item.quantity : item.quantity),
                                0
                              )}
                            </td>
                            <td colSpan={3} className="px-3 py-3 text-right">
                              ₱ {productIssuance.reduce(
                                (sum, item) => sum + (item.status === "return" ? -item.amount : item.amount), 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </td>
                            {user.role === 'Manager' && (
                            <td className="px-3 py-3 text-right text-slate-800">
                              ₱{" "}
                              {productIssuance
                                .reduce((sum, item) => {
                                  const value =
                                    (item.unit_price -
                                      (item.unit_type === "BIG_UNIT" ? item.big_cost : item.cost_per_unit)) *
                                    item.quantity;

                                  return sum + (item.status === "return" ? -value : value);
                                }, 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </td>
                            )}
                          </tr>
                        </tfoot>
                      )}
                    </table>
                  </div>

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
      body="Destination successfully added!"
      okConfirm={closeCreate}
      /> 
    }

    {status === 2 &&  <ConfirmBox open={open} setOpen={setOpen}
      title="Confirm Delete"
      body="Are you sure you want to delete this purchase stock?"
      okConfirm={handleDelete}
      /> 
    }

    {status === 3 && <UpdateBox open={open} setOpen={setOpen}
      title="Confirm Update"
      body="Are you sure you want to update this destination?"
      okConfirm={handleUpdate}
      /> 
    }

    {status === 4 &&  <InfoBox open={open} setOpen={setOpen} onClose={setOpen}
      title="Confirm Success"
      body="Destination successfully updated!"
      okConfirm={closeUpdate}
      /> 
    }

    {status === 5 &&  <InfoBox open={open} setOpen={setOpen} onClose={setOpen}
      title="Confirm Success"
      body="Purchase stock successfully deleted!"
      okConfirm={closeDelete}
      /> 
    }
    
    </>
  )
};
