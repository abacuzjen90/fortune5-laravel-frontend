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

export default function SupplyInventory() {
  const navigate = useNavigate();
  const [openAddDial, setOpenAddDial] = useState(false);
  const [openUpdateDial, setOpenUpdateDial] = useState(false);
  const [open, setOpen] = useState(false);
  const { token } = useContext(AppContext);
  const [showLoading, setShowLoading] = useState(false);
  const isLoading = () => {setShowLoading(true)};
  const stopLoading = () => {setShowLoading(false)};
  const [status, setStatus] = useState(0);
  const [stockHeader, setStockHeader] = useState([]);
  const [id, setId] = useState(null);
  const isMediumScreen = useScreenSize(768);

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

  const changePage = (i) => {
    setCurrentPage(i);
    const startItem = (i - 1) * dataPerPage;
    setSortdata(stockHeader.slice(startItem, startItem + dataPerPage));
  };

  const handleChange = (value) => {
    changePage(value);
  };



  //Search and Table Sorting
  async function searchTable() {
    const filtered = stockHeader.filter(rec => 
      rec.supplier_name.toLowerCase().includes(search.toLowerCase()) ||
      rec.delivery_receipt.toLowerCase().includes(search.toLowerCase()) ||
      rec.remarks.toLowerCase().includes(search.toLowerCase()) 
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
  
  // Get Stock Header
  async function getStockHeader() {
    isLoading();

    const res = await fetch("/api/stockheader", {
      method: "GET",
      headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          Authorization: `Bearer ${token}`,
        },
    });
    const data = await res.json();
    if(res.ok) {
      setStockHeader(data);
      setPageCount(Math.ceil(data.length / dataPerPage));
      setSortdata(data.slice(0, dataPerPage));
    }
    stopLoading();
  }
  useEffect(() => {
    getStockHeader();
  }, [dataPerPage]);


  async function closeCreate() {
    setOpen(false);
    setOpenAddDial(false);
  }


  //Delete Stock
  async function openDelete(id) {
    setOpen(true);
    setStatus(2);
    setId(id);
  }

  async function handleDelete(e) {
    e.preventDefault();
      const res = await fetch(`/api/stockheader/${id}`, {
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
        getStockHeader();
      }
  }

  async function closeDelete() {
    setOpen(false);
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
      <main className="px-4 flex-1 mx-auto py-4"><h1 className='text-2xl font-bold'>Maintenance - Stock</h1></main>
    </div>
    <div className="flex items-center font-medium flex-1 mx-auto py-4 ">
      <main className="flex-1 mx-auto p-4">
        <div className={`overflow-x-auto transition-all duration-75 min-w-0 mx-auto ${isMediumScreen ? "w-[calc(100vw-19rem)]" : "w-[calc(100vw-6rem)]"}`}>
          <div className="bg-gray-50 shadow-md border">
            <div className="p-6 text-gray-900 dark:text-gray-100">
              <div className="text-left caption-top dark:text-gray-800">
                <div className="flex flex-row py-2">
                  <div className="flex w-full"><h1>Stock Purchases</h1></div>
                    <div className="flex mb-3">
                      <button type="button" onClick={() => navigate('/maintenance/stockpurchase')} className="ml-2 flex items-center primary-btn py-3 px-5 text-sm tracking-wider font-semibold rounded-md text-white bg-gray-800 hover:bg-gray-600 focus:outline-none"><FaPlus size={20} className='mr-1'/>Purchase&nbsp;Stock</button>
                      
                      {/* <button type="button" onClick={() => navigate('/maintenance/hardwarelist')} className="ml-2 flex items-center primary-btn py-3 px-5 text-sm tracking-wider font-semibold rounded-md text-white bg-gray-800 hover:bg-gray-600 focus:outline-none"><FaList size={20} className='mr-1'/>Hardware&nbsp;List</button> */}
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
                  <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-center uppercase bg-gray-200 text-gray-800 border-b border-t border-gray-300">
                      <tr className="text-nowrap">
                      <th className="px-3 py-3">
                        <TableSort title="No." field="id" sorteddata={sortdata} setSorteddata={setSortdata} sorting={sorting} setSorting={setSorting} />
                      </th>
                      <th className="px-3 py-3">
                        <div className="flex justify-start">
                        <TableSort title="Supplier Name" field="supplier_name" sorteddata={sortdata} setSorteddata={setSortdata} sorting={sorting} setSorting={setSorting} />
                        </div>
                      </th>
                      <th className="px-3 py-3">
                        <TableSort title="Delivery Receipt" field="delivery_receipt" sorteddata={sortdata} setSorteddata={setSortdata} sorting={sorting} setSorting={setSorting} />
                      </th>
                      <th className="px-3 py-3">
                        <TableSort title="Order Date" field="order_date" sorteddata={sortdata} setSorteddata={setSortdata} sorting={sorting} setSorting={setSorting} />
                      </th>
                      <th className="px-3 py-3">
                        <TableSort title="Delivery Date" field="delivery_date" sorteddata={sortdata} setSorteddata={setSortdata} sorting={sorting} setSorting={setSorting} />
                      </th>
                      <th className="px-3 py-3">
                        <TableSort title="Remarks" field="remarks" sorteddata={sortdata} setSorteddata={setSortdata} sorting={sorting} setSorting={setSorting} />
                      </th>
                      <th className="px-3 py-3">Encoded by</th>
                      <th className="px-3 py-3">Action</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm text-center bg-gray-50 dark:bg-gray-100 dark:text-gray-800 border-b-2 border-gray-300">
                    {sortdata.length > 0 ? (sortdata.map(rec => (
                      <tr className="text-xs bg-white border-b dark:bg-gray-100 dark:border-gray-300 hover:bg-gray-50" key={rec.id}>     
                          <th className="px-3 py-3">
                            <Link className="font-medium text-blue-600 dark:text-blue-500 hover:underline mx-1">{rec.id}
                            </Link>
                          </th>
                          <td className="px-3 py-3 text-left">{rec.supplier_name}</td>
                          <td className="px-3 py-3">{rec.delivery_receipt}</td>
                          <td className="px-3 py-3">{formatDate(rec.order_date)}</td>
                          <td className="px-3 py-3">{formatDate(rec.delivery_date)}</td>
                          <td className="px-3 py-3">{rec.remarks}</td>
                          <td className="px-3 py-3">{rec.encoded_by}</td>
                          <td>
                            <button className="primary-btn text-sm tracking-wider font-semibold rounded-md">
                            <Link to={`/maintenance/stockupdate/${rec.id}`} ><FaRegEdit size={20} className="mr-2 text-green-600"/></Link></button>
                            <button onClick={() => openDelete(rec.id)} className="primary-btn text-sm tracking-wider font-semibold rounded-md">
                              <FaRegTrashAlt size={20} className="text-red-600"/></button>
                          </td>
                          
                        </tr>
                    ))) : (
                      <tr className='text-xs bg-white border-b dark:bg-gray-100 dark:border-gray-300'>
                        <td className='px-3 py-3 text-center' colSpan={9}>No Data</td>
                      </tr>
                    )}
                     </tbody>                        
                  </table>
                </div> 
                <Pagination dataSize={stockHeader.length} dataPPage={dataPerPage} nPages={pageCount} currentPage={currentPage} setCurrentPage={handleChange} />
            </div>
          </div>
        </div>  
      </main> 
    </div>



    
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
