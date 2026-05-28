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
import { motion } from "framer-motion";

export default function ProductList() {
  const navigate = useNavigate();
  const [openAddDial, setOpenAddDial] = useState(false);
  const [openUpdateDial, setOpenUpdateDial] = useState(false);
  const [open, setOpen] = useState(false);
  const { user, token } = useContext(AppContext);
  const [showLoading, setShowLoading] = useState(false);
  const isLoading = () => {setShowLoading(true)};
  const stopLoading = () => {setShowLoading(false)};
  const [status, setStatus] = useState(0);
  const [productList, setProductList] = useState([]);
  const [stockHeader, setStockHeader] = useState([]);
  const [id, setId] = useState(null);
  const isMediumScreen = useScreenSize(768);
  const [openImage, setOpenImage] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const BASE_URL = "https://111hardware-images.s3.ap-southeast-1.amazonaws.com/";


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
    setSortdata(productList.slice(startItem, startItem + dataPerPage));
  };

  const handleChange = (value) => {
    changePage(value);
  };

  const formatAmount = (amount) => Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });


  //Search and Table Sorting
  async function searchTable() {
    const filtered = productList.filter(rec => 
      rec.delivery_receipt.toLowerCase().includes(search.toLowerCase()) ||
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
  
  // Get Stock Header
  async function getProductList() {
    isLoading();
    const res = await fetch("/api/getproductlistdashboard", {
       method: "get",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          Authorization: `Bearer ${token}`,
        },
    });
    const data = await res.json();
    console.log(data);
    if(res.ok) {
      setProductList(data);
      setPageCount(Math.ceil(data.length / dataPerPage));
      setSortdata((data).slice(0, dataPerPage));
    }
    stopLoading();
  }
  useEffect(() => {
    getProductList();
  }, [dataPerPage]);



  return (
    <> 
    <div className="flex items-center font-medium border-b border-slate-300 w-full">
      <main className="px-4 flex-1 mx-auto py-4"><h1 className='text-2xl font-bold'>Maintenance - Product</h1></main>
    </div>
    <div className="flex items-center font-medium flex-1 mx-auto py-4 ">
      <main className="flex-1 mx-auto p-4">
        <div className={`overflow-x-auto transition-all duration-75 min-w-0 mx-auto ${isMediumScreen ? "w-[calc(100vw-19rem)]" : "w-[calc(100vw-6rem)]"}`}>
          <div className="bg-gray-50 shadow-md border">
            <div className="p-6 text-gray-900 dark:text-gray-100">
              <div className="text-left caption-top dark:text-gray-800">
                <div className="flex flex-row py-2">
                  <div className="flex w-full"><h1>Product List</h1></div>
                    <div className="flex mb-3">
                      {/* <button type="button" onClick={() => navigate('/maintenance/stockpurchase')} className="ml-2 flex items-center primary-btn py-3 px-5 text-sm tracking-wider font-semibold rounded-md text-white bg-gray-800 hover:bg-gray-600 focus:outline-none"><FaPlus size={20} className='mr-1'/>Purchase&nbsp;Stock</button> */}
                      
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
                        <TableSort title="Stock No." field="header_id" sorteddata={sortdata} setSorteddata={setSortdata} sorting={sorting} setSorting={setSorting} />
                      </th>
                      <th className="px-3 py-3 whitespace-nowrap">
                        <TableSort title="DR No." field="delivery_receipt" sorteddata={sortdata} setSorteddata={setSortdata} sorting={sorting} setSorting={setSorting} />
                      </th>
                      <th className="px-3 py-3 w-1/4">
                        <div className="flex justify-start">
                        <TableSort title="Product Name" field="product_name" sorteddata={sortdata} setSorteddata={setSortdata} sorting={sorting} setSorting={setSorting} />
                        </div>
                      </th>
                      <th className="px-3 py-3">
                        <TableSort title="SKU" field="sku" sorteddata={sortdata} setSorteddata={setSortdata} sorting={sorting} setSorting={setSorting} />
                      </th>
                      <th className="px-3 py-3">
                        <TableSort title="Total Quantity" field="quantity" sorteddata={sortdata} setSorteddata={setSortdata} sorting={sorting} setSorting={setSorting} />
                      </th>
                      <th className="px-3 py-3">
                        <TableSort title="Issued Quantity" field="issued_qty" sorteddata={sortdata} setSorteddata={setSortdata} sorting={sorting} setSorting={setSorting} />
                      </th>
                      <th className="px-3 py-3">
                        <TableSort title="Remaining Quantity" field="remaining_qty" sorteddata={sortdata} setSorteddata={setSortdata} sorting={sorting} setSorting={setSorting} />
                      </th>
                      <th className="px-3 py-3">
                        <TableSort title="Unit Price" field="price_per_unit" sorteddata={sortdata} setSorteddata={setSortdata} sorting={sorting} setSorting={setSorting} />
                      </th>
                      {user.role === 'Manager' && (
                      <th className='px-3 py-3'>
                        <TableSort title="Unit Cost" field="cost_per_unit" sorteddata={sortdata} setSorteddata={setSortdata} sorting={sorting} setSorting={setSorting} />
                      </th>
                      )}
                      <th className='px-3 py-3'> Status </th>
                      {/* <th className="px-3 py-3">Action</th> */}
                      </tr>
                    </thead>
                    <tbody className="text-sm text-center bg-gray-50 dark:bg-gray-100 dark:text-gray-800 border-b-2 border-gray-300">
                    {sortdata.length > 0 ? (sortdata.map(rec => (
                      <tr className="text-xs bg-white border-b dark:bg-gray-100 dark:border-gray-300 hover:bg-gray-50" key={rec.id}>     
                          <th className="px-2 py-2">
                            <Link className="font-medium text-blue-600 dark:text-blue-500 hover:underline mx-1">{String(rec.header_id).padStart(4, "0")}
                            </Link>
                          </th>
                          <td className="px-2 py-2">{rec.delivery_receipt}</td>
                          <td className="px-2 py-2 text-left font-bold">
                            <div className="flex items-center">
                            {rec.image ? (
                              <img
                                  src={`${BASE_URL}${rec.image}`}
                                  alt={rec.image}
                                  key={rec.id}
                                  onClick={() => {
                                    setSelectedImage(`${BASE_URL}${rec.image}`);
                                    setOpenImage(true);
                                    setOpenProductPopup(false);
                                  }}
                                  className="m-2 w-10 h-10 object-cover shadow-md rounded-md 
                                    cursor-zoom-in transform transition duration-300 
                                    hover:scale-105 hover:shadow-xl"
                                />
                              ) : (
                                <img
                                  src={`${BASE_URL}images/hardware/tools.jpg`}
                                  alt={rec.image}
                                  key={rec.id}
                                  className="m-2 w-10 h-10 object-cover shadow-md rounded-md 
                                    cursor-zoom-in transform transition duration-300 
                                    hover:scale-105 hover:shadow-xl"
                                />
                              )}  
                            {rec.product_name}
                            </div>
                          </td>
                          <td className="px-2 py-2">{rec.sku}</td>
                          <td className="px-2 py-2 font-bold text-sm">{rec.quantity ? `${rec.quantity} (${rec.big_qty})` : rec.big_qty}</td>
                          <td className="px-2 py-2 font-bold text-sm text-blue-700">{rec.quantity ? rec.quantity - rec.remaining_qty : rec.big_qty - rec.remaining_qty}</td>
                          <td className={`px-2 py-2 font-bold text-sm ${rec.remaining_qty <= 0 ? "text-red-800" :
                            rec.remaining_qty > rec.reorder_level ? "text-green-800" : "text-yellow-800"
                          }`}
                          >
                            {rec.remaining_qty}</td>
                          <td className="px-2 py-2 text-right text-sm font-bold">{formatAmount(rec.price_per_unit ?? rec.big_price)}</td>
                          {user.role === 'Manager' && (
                          <td className="px-2 py-2 text-right text-sm font-bold">{formatAmount(rec.cost_per_unit ?? rec.big_cost)}</td>
                          )}
                          <td className={`px-2 py-2 font-bold text-sm whitespace-nowrap ${rec.remaining_qty <= 0 ? "bg-red-200 text-red-800" : rec.remaining_qty > rec.reorder_level ? "bg-green-200 text-green-800" : "bg-yellow-200 text-yellow-800"}`}>
                            {rec.remaining_qty <= 0 ? "No Stock" : rec.remaining_qty > rec.reorder_level ? "In Stock" : "Low Stock"}
                          </td>
                          {/* <td>
                            <button className="primary-btn text-sm tracking-wider font-semibold rounded-md">
                              <FaRegEdit size={20} className="text-green-600"/>
                            </button>
                          </td> */}
                          
                        </tr>
                    ))) : (
                      <tr className='text-xs bg-white border-b dark:bg-gray-100 dark:border-gray-300'>
                        <td className='px-3 py-3 text-center' colSpan={9}>No Data</td>
                      </tr>
                    )}
                     </tbody>                        
                  </table>
                </div> 
                <Pagination dataSize={productList.length} dataPPage={dataPerPage} nPages={pageCount} currentPage={currentPage} setCurrentPage={handleChange} />
            </div>
          </div>
        </div>  
      </main> 
    </div>

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
