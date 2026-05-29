import { useContext, useEffect, useState} from "react";
import { AppContext } from "../context/AppContext";
import { FaBoxes, FaRegEdit, FaCheckCircle, FaExclamationTriangle, FaTimesCircle, FaDollarSign, FaMoneyBillWave } from 'react-icons/fa';
import LoadingBox from '../assets/components/Loading';
import { Link } from 'react-router-dom';
import { Dialog, DialogBackdrop, DialogPanel } from '@headlessui/react';

export default function Dashboard() {
  const [openViewStock, setOpenViewStock] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]); 
  const [summary, setSummary] = useState({
    products: 0,
    inStocks: 0,
    lowStocks: 0,
    outOfStocks: 0,
    inventoryValue: 0,
    inventoryCost: 0,
    inStockIds: 0,
    lowStockIds: 0,
    outOfStockIds: 0,
  });

  const { token } = useContext(AppContext);
  const[prodqty, setProdqty] = useState(0);
  const [showLoading, setShowLoading] = useState(false);
  const isLoading = () => {setShowLoading(true)};
  const stopLoading = () => {setShowLoading(false)};
  const [recentSales, setRecentSales] = useState([]);  
  const [stockList, setStockList] = useState([]);
  const [stockLabel, setStockLabel] = useState("");


  // Get Hardware List
  async function getHardware() {
    const res = await fetch("/api/inventoryitem", {
      method: "GET",
      headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          Authorization: `Bearer ${token}`,
        },
    });
    const data = await res.json();
    setProdqty(data.length);
  }
  useEffect(() => {
    getHardware();
  }, []);


  // Get Stock List
  async function getStockList(ids) {
    isLoading();
    console.log(selectedIds);
    const query = new URLSearchParams({
      ids: ids.join(","),
    });

    const res = await fetch(`/api/getdashboardstock?${query.toString()}`, {
       method: "get",
        headers: {
          Authorization: `Bearer ${token}`,
        },
    });
    const data = await res.json();
    console.log(data);
    if(res.ok) {
      setStockList(data);
    }
    stopLoading();
  }


  // Get Stock Header
  const DISPLAY_LIMIT = 5;
  async function getIssuanceList() {
    isLoading();
    const res = await fetch("/api/getissuancelistdashboard", {
       method: "get",
        headers: {
          Authorization: `Bearer ${token}`,
        },
    });
    const data = await res.json();
    if(res.ok) {
      setRecentSales(data);
    }
    stopLoading();
  }
  useEffect(() => {
    getIssuanceList();
  }, []);


  useEffect(() => {
    const fetchData = async () => {
        try {
          const res = await fetch("/api/getproductlistdashboard", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) throw new Error("Failed to fetch products");
    const data = await res.json();
    console.log(data);

    const totalProducts = data.length;

    // Step 1: Aggregate by product_id
    const grouped = data.reduce((acc, item) => {
      if (!acc[item.product_id]) {
        acc[item.product_id] = {
          product_id: item.product_id,
          product_name: item.product_name,
          sku: item.sku,
          reorder_level: item.reorder_level,
          image: item.image,
          remaining_qty: 0,
        };
      }
      acc[item.product_id].remaining_qty += Number(item.remaining_qty ?? 0);
      return acc;
    }, {});

    // Step 2: Convert back to array
    const products = Object.values(grouped);

    // Step 3: Categorize
    const inStocks = products.filter(
      item => item.remaining_qty > item.reorder_level
    );
    const lowStocks = products.filter(
      item => item.remaining_qty > 0 && item.remaining_qty <= item.reorder_level
    );
    const outOfStocks = products.filter(item => item.remaining_qty <= 0);

    console.log({ totalProducts, inStocks, lowStocks, outOfStocks });

      const inventoryValue = data.reduce(
        (sum, item) => sum + (item.price_per_unit ?? item.big_price) * item.remaining_qty,
        0
      );
      const inventoryCost = data.reduce(
        (sum, item) => sum + (item.cost_per_unit ?? item.big_cost) * item.remaining_qty,
        0
      );

      setSummary({
        products: totalProducts,
        inStocks: inStocks.length,
        lowStocks: lowStocks.length,
        outOfStocks: outOfStocks.length,
        inventoryValue,
        inventoryCost,
        inStockIds: inStocks.map(item => item.product_id),
        lowStockIds: lowStocks.map(item => item.product_id),
        outOfStockIds: outOfStocks.map(item => item.product_id),
      });
    } catch (err) {
      console.error("Error loading product list:", err);
    }
  };


    fetchData();
  }, []);

  const totalStocks = summary.inStocks + summary.lowStocks + summary.outOfStocks;

  const getPercentage = count =>
    totalStocks === 0 ? 0 : Math.round((count / totalStocks) * 100);


  function formatDate(dateString) {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    });
  }

  // useEffect(() => {
  //   console.log(selectedIds);
  // }, [selectedIds]);

  return (
    <> 
    <div className="flex items-center font-medium border-b border-slate-300 w-full">
      <main className="ml-10 flex-1 mx-auto py-4"><h1 className='text-2xl font-bold'>Inventory Dashboard</h1></main>
    </div>
    <div className="flex items-center font-medium flex-1 mx-auto py-4">
        <main className="flex-1 mx-auto p-4">
        <div className="w-full mx-auto sm:px-4 lg:px-4">
          <div className="overflow-hidden shadow-sm sm:rounded-lg">
              <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-100 text-blue-800 p-6 rounded-2xl shadow text-center">
                  <FaBoxes className="mx-auto text-3xl mb-2" />
                  <h2 className="text-2xl font-bold">{prodqty}</h2>
                  <p className="text-sm">Total Products</p>
                </div>
                <div className="bg-purple-100 text-purple-800 p-6 rounded-2xl shadow text-center">
                  <FaDollarSign className="mx-auto text-3xl mb-2" />
                  <h2 className="text-2xl font-bold">₱{summary.inventoryValue.toLocaleString()}</h2>
                  <p className="text-sm">Current Inventory Value</p>
                </div>
                <div className="bg-indigo-100 text-indigo-800 p-6 rounded-2xl shadow text-center">
                  <FaMoneyBillWave className="mx-auto text-3xl mb-2" />
                  <h2 className="text-2xl font-bold">₱{summary.inventoryCost.toLocaleString()}</h2>
                  <p className="text-sm">Current Inventory Cost</p>
                </div>

                <div className="col-span-1 md:col-span-3 bg-white p-6 rounded-2xl shadow mt-6">
                  <h2 className="text-xl font-bold mb-4">Stock Levels Overview</h2>
                  <div className="flex flex-col gap-4">
                    <div
                      onClick={() =>
                        {setOpenViewStock(true); 
                          setStockLabel("In Stock");
                          setSelectedIds(summary.inStockIds); 
                          getStockList(summary.inStockIds);
                        }
                      }
                      className="cursor-pointer"
                    >
                      <div className="flex justify-between mb-1">
                        <span className="font-semibold text-green-700">In Stocks</span>
                        <span className="text-sm text-gray-700">{getPercentage(summary.inStocks)}%</span>
                      </div>
                      <div className="w-full bg-green-100 rounded-full h-5">
                        <div className="bg-green-500 h-5 rounded-full" style={{ width: `${getPercentage(summary.inStocks)}%` }}></div>
                      </div>
                    </div>
                    <div
                      onClick={() =>
                        {setOpenViewStock(true); 
                          setStockLabel("Low Stock");
                          setSelectedIds(summary.lowStockIds); 
                          getStockList(summary.lowStockIds);
                        }
                      }
                      className="cursor-pointer"
                    >
                      <div className="flex justify-between mb-1">
                        <span className="font-semibold text-yellow-700">Low Stocks</span>
                        <span className="text-sm text-gray-700">{getPercentage(summary.lowStocks)}%</span>
                      </div>
                      <div className="w-full bg-yellow-100 rounded-full h-5">
                        <div className="bg-yellow-500 h-5 rounded-full" style={{ width: `${getPercentage(summary.lowStocks)}%` }}></div>
                      </div>
                    </div>
                    <div
                      onClick={() =>
                        {setOpenViewStock(true);
                          setStockLabel("Out of Stock");
                          setSelectedIds(summary.outOfStockIds);
                          getStockList(summary.outOfStockIds);
                        }
                      }
                      className="cursor-pointer"
                    >
                      <div className="flex justify-between mb-1">
                        <span className="font-semibold text-red-700">Out of Stocks</span>
                        <span className="text-sm text-gray-700">{getPercentage(summary.outOfStocks)}%</span>
                      </div>
                      <div className="w-full bg-red-100 rounded-full h-5">
                        <div className="bg-red-500 h-5 rounded-full" style={{ width: `${getPercentage(summary.outOfStocks)}%` }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl md:col-span-3 shadow mt-6 overflow-x-auto">
                  <h2 className="text-xl font-bold mb-4">Recent Sales</h2>
                  <div className="overflow-x-auto rounded-md shadow-sm border border-gray-200">
                    <table className="min-w-full text-sm text-left bg-white">
                      <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
                        <tr>
                          <th className="px-4 py-3 text-center">Issuance No.</th>
                          <th className="px-4 py-3 text-center">Date Purchase</th>
                          <th className="px-4 py-3">Customer Name</th>
                          <th className="px-4 py-3">Product Name</th>
                          <th className="px-4 py-3 text-center">Unit</th>
                          <th className="px-4 py-3 text-center">Quantity</th>
                          <th className="px-4 py-3 text-right">Unit Price</th>
                          <th className="px-4 py-3 text-right">Amount</th>
                          <th className="px-4 py-3 text-center">Encoded by</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {recentSales.length === 0 ? (
                          <tr>
                            <td colSpan="9" className="text-center text-gray-500 py-6">
                              No data found.
                            </td>
                          </tr>
                        ) : (
                          recentSales.slice(0, DISPLAY_LIMIT).map(rec => (
                            <tr key={rec.id} className="hover:bg-gray-50 even:bg-gray-50/50 text-xs">
                              <td className="px-4 py-3 text-center">{String(rec.header_id).padStart(4, "0")}</td>
                              <td className="px-4 py-3 text-center">{formatDate(rec.transaction_date)}</td>
                              <td className="px-4 py-3">{rec.customer_name}</td>
                              <td className="px-4 py-3">{rec.product_name}</td>
                              <td className="px-4 py-3 text-center">{rec.unit}</td>
                              <td className="px-4 py-3 text-center font-bold">{rec.quantity}</td>
                              <td className="px-4 py-3 text-right font-bold text-green-900">
                                ₱{parseFloat(rec.unit_price).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                              </td>
                              <td className="px-4 py-3 text-right font-bold text-blue-900">
                                ₱{parseFloat(rec.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                              </td>
                              <td className="px-4 py-3 text-center">{rec.encoded_by}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>

                      <div className="flex justify-end p-4">
                        <Link
                          to="/maintenance/reports"
                          className="text-blue-600 font-semibold hover:underline"
                        >
                          View More &rarr;
                        </Link>
                      </div>
                  </div>
                </div>
              </div>
          </div>
        </div>
    </main>
    </div>


    <Dialog open={openViewStock} onClose={setOpenViewStock} className="relative z-[999]">
      <DialogBackdrop
          transition
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
      />

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <DialogPanel transition className="relative transform overflow-hidden transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-screen-md data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"> 

          {/* Close button */}
        <button
          onClick={() => setOpenViewStock(false)}
          className="absolute top-5 right-5 text-gray-500 hover:text-gray-800 transition"
        >
          ✕
        </button>

            <div className="flex flex-col font-[sans-serif]">
                <div className="w-full mx-auto border border-gray-300 p-8 bg-gray-50">
                  <div className="p-2 text-center mb-4 mt-4">
                    <h1 className={`text-2xl text-left p-4 flex text-white ${
                      stockLabel === "In Stock"
                        ? "bg-green-700"
                        : stockLabel === "Low Stock"
                        ? "bg-yellow-500"
                        : stockLabel === "Out of Stock"
                        ? "bg-red-600"
                        : "bg-gray-500" // default
                    }`}><FaRegEdit size={30} className='mr-1'/> Stock Details - {stockLabel}</h1>
                    
                      <div className="flex flex-col  space-y-6">
                        {/* Details Section */}
                        <div className="bg-white shadow p-6 overflow-x-auto">
                        <h2 className="text-lg font-semibold text-gray-800 text-left mb-4">Product Details</h2>

                        <table className="w-full text-sm border-collapse">
                          <thead>
                            <tr className="bg-gray-50 text-gray-700 font-bold border-t border-b">
                              <th className="px-3 py-3 text-left w-[50px]">No.</th>
                              <th className="px-3 py-3 text-left min-w-[200px]">Product Name</th>
                              <th className="px-3 py-3 text-center w-[150px]">SKU</th>
                              <th className="px-3 py-3 text-center w-[150px]">Current Stock</th>
                            </tr>
                          </thead>
                          <tbody>
                            {stockList.length > 0 ? (stockList.map((item, index) => (
                              <tr key={index} className="hover:bg-gray-50 transition border-b">
                                <td className="px-3 py-3 text-center">{index + 1}.</td>
                                <td className="px-3 py-3 text-left">{item.product_name}</td>
                                <td className="px-3 py-3 text-center">{item.sku}</td>
                                <td className={`px-3 py-3 text-center font-semibold ${
                                  stockLabel === "In Stock"
                                    ? "text-green-700"
                                    : stockLabel === "Low Stock"
                                    ? "text-yellow-600"
                                    : stockLabel === "Out of Stock"
                                    ? "text-red-600"
                                    : "text-gray-700"
                                }`}>{item.remaining_qty}</td>
                              </tr>
                            ))) : (
                            <tr className='text-xs bg-white border-b dark:bg-gray-100 dark:border-gray-300'>
                              <td className='px-3 py-3 text-center' colSpan={13}>No Record Found</td>
                            </tr>
                          )}
                          </tbody>
                          {/* {getIssuance.details?.length > 0 && (
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
                                <td className="px-3 py-3 text-right text-slate-800">
                                  ₱ {getIssuance.details
                                    .reduce((sum, item) => sum + (item.status === 'return' ? 0 : (item.unit_price - (item.unit_type === "BIG_UNIT" ? item.big_cost : item.cost_per_unit)) * item.quantity), 0)
                                    .toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </td>
                              </tr>
                            </tfoot>
                          )} */}
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
    </>
  )
};
