import { useContext, useEffect, useState} from "react";
import { AppContext } from "../../context/AppContext";
import LoadingBox from '../../assets/components/Loading';
import { Dialog, DialogBackdrop, DialogPanel } from '@headlessui/react';
import { FaRegTrashAlt, FaRegEdit, FaUserEdit, FaUserPlus, FaList, FaPlus, FaReply } from "react-icons/fa";
import { Link } from 'react-router-dom';
import ErrorDisplay from "../../assets/components/ErrorDisplay";
import InfoBox from "../../assets/components/InfoBox";
import Select from 'react-select';
import { useLocation } from 'react-router-dom';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";
import { motion } from "framer-motion";


export default function POSPage() {
  const { token } = useContext(AppContext);
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState([]);
  const [showLoading, setShowLoading] = useState(false);
  const isLoading = () => {setShowLoading(true)};
  const stopLoading = () => {setShowLoading(false)};
  const [productList, setProductList] = useState([]);  
  const [openProductPopup, setOpenProductPopup] = useState(false);
  const [status, setStatus] = useState(0);
  const [open, setOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  //const [issuanceId, setIssuanceId] = useState(null);
  const { state } = useLocation();
  const issuanceId = state?.issuanceId;
  const [openImage, setOpenImage] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const BASE_URL = "https://111hardware-images.s3.ap-southeast-1.amazonaws.com/";
  

  const [errors, setErrors] = useState({});

  const [productData, setProductData] = useState({
    id: "", order_date: "", delivery_date: "", delivery_receipt: "", supplier_name: "", remarks: "",
  });

  const [issuanceHeader, setIssuanceHeader] = useState({
    drletter: "DR #", drno: "", customer_name: "", address: "Isabela City", contact_number: "", terms: "",
    transaction_date: new Date().toISOString().split("T")[0], 
  });

  const [issuanceDetails, setIssuanceDetails] = useState([
    { issuance_id: "", stock_id: "", product_id: "", unit: "", quantity: "", unit_price: "", amount: "", discount: "", status: "", unit_type: "",}
  ]);


  async function getProductList() {
    isLoading();
    const res = await fetch("/api/getproductlist", {
        method: "get",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          Authorization: `Bearer ${token}`,
        },
    });
    const data = await res.json();
    if(res.ok) {
      setProductList(data);
    }
    stopLoading();
  }
  useEffect(() => {
    getProductList();
  }, []);

  
  // Get Product Details
  async function getProduct(id) {
    setProductData({});
    if(id){
      const res = await fetch(`/api/stockheader/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json"
        }
      });
      const data = await res.json();
      if(res.ok) {
        setProductData({
          id: data[0].id,
          order_date: data[0].order_date,
          delivery_date: data[0].delivery_date,
          delivery_receipt: data[0].delivery_receipt,
          supplier_name: data[0].supplier_name,
          remarks: data[0].remarks,
        });
      }
    }
  }


  async function saveIssuance(e) {
    isLoading();
    e.preventDefault();

    if (!validatePrices()) {
      stopLoading();
      return;
    }

    if (issuanceDetails.some(item => !item.unit)) {
      setErrors({ stockDetails: ['Issuance details cannot be empty or incomplete.'] });
      stopLoading();
      return;
    }

    const totalAmount = issuanceDetails.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
    const totalQuantity = issuanceDetails.reduce((sum, item) => sum + parseFloat(item.quantity || 0), 0);

    const updatedHeader = {
      ...issuanceHeader,
      total_amount: totalAmount,
      total_quantity: totalQuantity,
    };

    console.log(issuanceDetails);

    // 1. Save or update issuance header
    const headerRes = await fetch(
      issuanceId ? `/api/issuanceheader/${issuanceId}` : "/api/issuanceheader",
      {
        method: issuanceId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedHeader),
      }
    );

    const dataheader = await headerRes.json();
    console.log(dataheader);
    if (dataheader.errors) {
      setErrors(dataheader.errors);
      stopLoading();
      return;
    }

    // 2. Get new or existing issuance ID
    const savedIssuanceId = dataheader.header_id || issuanceId;

    // 3. Prepare details with issuance_id
    const issuanceDetailsWithId = issuanceDetails.map(item => ({
      ...item,
      issuance_id: savedIssuanceId,
      unit: String(item.unit || "").trim(),
    }));

    console.log("Issuance Details Payload:", issuanceDetailsWithId);

    // 4. Save or update issuance details
    const detailsRes = await fetch(
      issuanceId ? `/api/issuancedetails/${issuanceId}` : "/api/issuancedetails",
      {
        method: issuanceId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          issuanceDetails: issuanceDetailsWithId,
        }),
      }
    );
    const datadetails = await detailsRes.json();

    console.log(datadetails);
    if (datadetails.errors) {
      setErrors(datadetails.errors);
    } else {
      setErrors(false);
      setOpen(true);
      setStatus(1);
      setIssuanceHeader({
        drletter: "DR #",
        drno: "",
        customer_name: "",
        address: "ISABELA CITY",
        contact_number: "",
        terms: "",
        transaction_date: new Date().toISOString().split("T")[0],
      });

      setIssuanceDetails([
        {
          issuance_id: "",
          stock_id: "",
          product_id: "",
          unit: "",
          quantity: "",
          unit_price: "",
          amount: "",
          discount: "",
          status: "",
          unit_type: "",
        }
      ]);
      setCart([]);
    }

    stopLoading();
    getProductList();
  }


  async function closeCreate() {
    setOpen(false);
    setIssuanceDetails([]);
  }


  const itemOptions = productList.map(item => ({
    value: item.id,
    label: `${item.sku} - ${item.product_name} — ${item.remaining_qty} in stock`,
  }));


  const handleProductSelect = (selected) => {
    if (selected) {
      const product = productList.find(item => item.id === selected.value);
      if (product) {
        const alreadyInCart = cart.some(cartItem => cartItem.id === product.id);

        if (alreadyInCart) {
          alert(`"${product.product_name}" is already in the cart.`);
          return;
        }

        setSelectedProduct(selected.value);
        addToCart(product); // Pass the full product object
      }
    }  else {
      setSelectedProduct(null);
    }
  };


  const filteredProducts = productList.filter(p =>
    p.product_name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase()))
    .slice(0, 10); // Display only first 10 matches

  
    
  // -------------------- Add to Cart --------------------
  const addToCart = (product, status = "sales") => {
    isLoading();

    setCart(prev => {
      const stockId = product.header_id ?? product.stock_id ?? null;

      // Check if this product + stock + status already exists
      const existing = prev.find(
        item =>
          item.product_id === product.product_id &&
          (item.header_id ?? item.stock_id) === stockId &&
          item.status === status
      );

      const basePrice = product.price_per_unit ?? product.big_price;

      if (existing) {
        const maxQty =
          existing.unit === product.big_unit ? product.big_qty : product.remaining_qty ?? 0;
        const newQty = existing.qty + 1;

        if (newQty > maxQty) {
          alert(`Cannot exceed available stock (${maxQty} in ${existing.unit})`);
          return prev;
        }

        return prev.map(item =>
          item.product_id === product.product_id &&
          (item.header_id ?? item.stock_id) === stockId &&
          item.status === status
            ? {
                ...item,
                qty: newQty,
                unit_price:
                  existing.unit === product.big_unit
                    ? product.big_price ?? product.price_per_unit
                    : basePrice,
                amount:
                  newQty *
                  (existing.unit === product.big_unit
                    ? product.big_price ?? product.price_per_unit
                    : basePrice),
                unit_type: existing.unit === product.big_unit ? "BIG_UNIT" : "SMALL_UNIT",
              }
            : item
        );
      }

      // Add new item
      return [
        ...prev,
        {
          ...product,
          qty: 1,
          status,
          unit: product.unit,
          original_unit: product.unit,
          unit_price: basePrice,
          amount: basePrice,
          unit_type: product.unit ? "SMALL_UNIT" : "BIG_UNIT",
          header_id: stockId,
        },
      ];
    });

    stopLoading();
  };


  // -------------------- Update Quantity --------------------
  const updateQty = (product_id, stock_id, status, qty) => {
    setCart(prev =>
      prev.map(item => {
        if (
          item.product_id !== product_id ||
          (item.header_id ?? item.stock_id) !== stock_id ||
          item.status !== status
        )
          return item;

        const maxQty = item.unit === item.big_unit ? item.big_qty : item.remaining_qty ?? 0;
        const safeQty = Math.max(0, Math.min(qty, maxQty));

        return {
          ...item,
          qty: safeQty,
          amount: safeQty * item.unit_price,
        };
      })
    );
  };


  // -------------------- Remove from Cart --------------------
  const removeFromCart = (product_id, stock_id, status) => {
    setCart(prev =>
      prev.filter(
        item =>
          !(
            item.product_id === product_id &&
            (item.header_id ?? item.stock_id) === stock_id &&
            item.status === status
          )
      )
    );
  };


  // -------------------- Handle Issuance Change --------------------
  const handleIssuanceChange = (item, field, value) => {
    const stockId = item.header_id ?? item.stock_id;

    setIssuanceDetails(prev => {
      const index = prev.findIndex(
        detail =>
          detail.product_id === item.product_id &&
          detail.stock_id === stockId &&
          detail.status === item.status
      );

      const baseItem = {
        stock_id: stockId,
        product_id: item.product_id,
        unit: item.unit ?? item.big_unit,
        quantity: item.qty ?? item.quantity ?? 0,
        unit_price: item.price_per_unit ?? item.unit_price ?? 0,
        amount: 0,
        discount: "",
        status: item.status,
        unit_type: item.unit === item.big_unit ? "BIG_UNIT" : "SMALL_UNIT",
      };

      const existing = index !== -1 ? { ...prev[index] } : baseItem;
      let updatedItem = { ...existing };

      // Handle unit change
      if (field === "unit") {
        if (value === item.big_unit) {
          updatedItem.unit = item.big_unit;
          updatedItem.unit_price = item.big_price ?? 0;
          updatedItem.unit_type = "BIG_UNIT";
        } else {
          updatedItem.unit = item.original_unit || item.unit;
          updatedItem.unit_price = item.price_per_unit ?? 0;
          updatedItem.unit_type = "SMALL_UNIT";
        }
      }

      // Handle quantity change
      if (field === "quantity") {
        const maxQty =
          updatedItem.unit === item.big_unit ? item.big_qty : item.remaining_qty ?? 0;
        let qty = parseFloat(value) || 0;
        if (qty > maxQty) {
          alert(`Quantity exceeds available stock (${maxQty} in ${updatedItem.unit})`);
          qty = maxQty;
        }
        updatedItem.quantity = qty;
      }

      // if (field === "unit_price") {
      //   const price = parseFloat(value) || 0;
      //   console.log(updatedItem.unit_type);
      //   updatedItem.unit_price = price;
      //   if(updatedItem.unit_type === 'BIG_UNIT'){
      //     if(item.unit_price < item.big_cost){
      //       alert(`Unit price is less than the cost price (${item.big_cost})`);
      //     }
      //   } else if(updatedItem.unit_type === 'SMALL_UNIT') {
      //     if(item.unit_price < item.cost_per_unit){
      //       alert(`Unit price is less than the cost price (${item.cost_per_unit})`);
      //     }
      //   }

      //   setCart(prev =>
      //     prev.map(c =>
      //       c.product_id === item.product_id &&
      //       (c.header_id ?? c.stock_id) === (item.header_id ?? item.stock_id) &&
      //       c.status === item.status
      //         ? { ...c, unit_price: price }
      //         : c
      //     )
      //   );
      // }

      // Recalculate amount
      updatedItem.amount =
        parseFloat(updatedItem.quantity) * parseFloat(updatedItem.unit_price);

      if (index !== -1) {
        const updated = [...prev];
        updated[index] = updatedItem;
        return updated;
      } else {
        return [...prev, updatedItem];
      }
    }); 

    // Keep cart in sync
    setCart(prev =>
      prev.map(c =>
        c.product_id === item.product_id &&
        (c.header_id ?? c.stock_id) === stockId &&
        c.status === item.status
          ? {
              ...c,
              unit: field === "unit" ? value : c.unit,
              unit_price:
                field === "unit_price"
                  ? parseFloat(value) || 0
                  : field === "unit"
                  ? value === item.big_unit
                    ? item.big_price
                    : item.price_per_unit
                  : c.unit_price,
              qty: field === "quantity" ? parseFloat(value) || 0 : c.qty,
              unit_type:
                field === "unit"
                  ? value === item.big_unit
                    ? "BIG_UNIT"
                    : "SMALL_UNIT"
                  : c.unit_type,
            }
          : c
      )
    );
  };

  const validateUnitPrice = (item, value) => {
    const price = parseFloat(value) || 0;

    if (item.unit_type === "BIG_UNIT") {
      if (price < item.big_cost) {
        alert(`Unit price is less than the cost price (${item.big_cost})`);
        return;
      }
    } else {
      if (price < item.cost_per_unit) {
        alert(`Unit price is less than the cost price (${item.cost_per_unit})`);
        return;
      }
    }

    setCart(prev =>
      prev.map(c =>
        c.product_id === item.product_id &&
        (c.header_id ?? c.stock_id) === (item.header_id ?? item.stock_id) &&
        c.status === item.status
          ? { ...c, unit_price: price }
          : c
      )
    );
  };

  const validatePrices = () => {
    for (const item of cart) {
      const price = parseFloat(item.unit_price) || 0;

      // BIG UNIT validation
      if (
        item.unit_type === "BIG_UNIT" &&
        price < (parseFloat(item.big_cost) || 0)
      ) {
        alert(
          `${item.product_name}: Unit price is less than the cost price (${item.big_cost})`
        );
        return false;
      }

      // SMALL UNIT validation
      if (
        item.unit_type === "SMALL_UNIT" &&
        price < (parseFloat(item.cost_per_unit) || 0)
      ) {
        alert(
          `${item.product_name}: Unit price is less than the cost price (${item.cost_per_unit})`
        );
        return false;
      }
    }

    return true;
  };

  // -------------------- Sync issuanceDetails with cart --------------------
  useEffect(() => {
    setIssuanceDetails(
      cart.map(item => {
        const stockId = item.header_id ?? item.stock_id ?? null;
        const unit = item.unit || item.big_unit;
        const availableQty = unit === item.big_unit ? item.big_qty : item.remaining_qty ?? 0;
        const qty = Math.min(item.qty, availableQty);
        //const unit_price = unit === item.big_unit ? item.big_price ?? 0 : item.unit_price ?? 0;

        return {
          stock_id: stockId,
          product_id: item.product_id,
          unit,
          quantity: qty,
          unit_price: item.unit_price,
          amount: qty * item.unit_price,
          discount: item.discount ?? "",
          status: item.status,
          unit_type: item.unit_type,
        };
      })
    );
  }, [cart]);


  // -------------------- Calculate total --------------------
  const total = cart.reduce((sum, item) => {
    const lineTotal = item.qty * item.unit_price;
    return sum + (item.status === "return" ? -lineTotal : lineTotal);
  }, 0);




  // Get Issuance Details
  async function getIssuanceDetails(id) {
    if (!id) {
    // Empty state for Add mode
      setIssuanceHeader({
        drletter: "", drno: "", customer_name: "", address: "", contact_number: "", terms: "",
        transaction_date: new Date().toISOString().split("T")[0], 
      });
      setIssuanceDetails([]);
      setCart([]);
      return;
    }

    isLoading();
    try {
      const res = await fetch(`/api/getissuancedetails/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json"
        }
      });
      const data = await res.json();
      console.log(data);

      if (res.ok) {
        setIssuanceHeader(data.header);
        const details = data.details || [];

        // 1. Set issuanceDetails
        setIssuanceDetails(details);

        // 2. Derive cart from details
        const cartItems = details.map(detail => {
          const product = productList.find(
            p => p.product_id === detail.product_id || p.id === detail.product_id
          );

          const isReturn = detail.status === "return"; // or however you're marking it
          const qty = parseFloat(detail.quantity) || 0;
          const unitPrice = parseFloat(detail.unit_price) || 0;
          const price_per_unit = isReturn ? -Math.abs(unitPrice) : Math.abs(unitPrice);
          const amount = price_per_unit * qty;

          return {
            id: product?.id || detail.product_id,
            header_id: detail.stock_id,
            product_id: detail.product_id,
            product_name: product?.product_name || "Unknown",
            price_per_unit,
            unit: detail.unit,
            qty,
            quantity: product?.quantity || 9999,
            status: detail.status || "sales", // include this if needed
            amount,
          };
        });

        setCart(cartItems);
      }
    } catch (err) {
      console.error("Failed to load issuance details", err);
    }
    stopLoading();
  }
  
  useEffect(() => {
    if (productList.length > 0 && issuanceId) {
      getIssuanceDetails(issuanceId);
    }
  }, [productList, issuanceId]);
  

 useEffect(() => {
   //console.log("🛒 Details (cart):", cart);
   //console.log("📦 Total:", total.toFixed(2));
 }, [cart]);


 useEffect(() => {
  console.log("Issuance Details:", issuanceDetails);
}, [issuanceDetails]);

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
    <div className="flex items-center font-medium border-b border-slate-300">
      <p className="text-2xl font-bold p-4">Point of Sales</p>
    </div>
    <div className="min-h-screen py-4">
      {/* Main POS Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
        
        {/* Left: Product Search */}
        <div className="bg-white shadow-md rounded-md p-4 overflow-auto">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">🔍 Product Search</h2>
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full p-2 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <div className="overflow-y-auto rounded border max-h-[800px]">
            <table className="w-full table-auto text-sm text-left text-gray-700">
              <thead className="sticky top-0 bg-gray-100 text-gray-600 text-xs uppercase z-10 shadow-sm">
                <tr>
                  <th className="px-4 py-3 w-1/2 whitespace-nowrap">Product Name</th>
                  <th className="px-2 py-3">SKU</th>
                  <th className="px-2 py-3 text-center">Current Stock</th>
                  <th className="px-2 py-3 text-center">Unit Price</th>
                  <th className="px-2 py-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-xs">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center text-gray-500 py-6">No products found.</td>
                  </tr>
                ) : (
                  filteredProducts.map(product => (
                    <tr
                      key={product.id}
                      className="hover:bg-blue-50 transition duration-100 ease-in-out"
                    >
                      <td className="py-3 text-slate-800 font-bold">
                        <div className="flex items-center">
                        {product.image ? (
                        <img
                            src={`${BASE_URL}${product.image}`}
                            alt={product.image}
                            key={product.id}
                            onClick={() => {
                              setSelectedImage(`${BASE_URL}${product.image}`);
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
                            alt={product.image}
                            key={product.id}
                            className="m-2 w-10 h-10 object-cover shadow-md rounded-md 
                              cursor-zoom-in transform transition duration-300 
                              hover:scale-105 hover:shadow-xl"
                          />
                        )}  
                        <p className="hover:underline cursor-pointer" onClick={() => {
                          setOpenProductPopup(true);
                          getProduct(product.header_id);
                        }}>{product.header_id } - {product.product_name}</p>
                        </div>
                      </td>
                      <td className="px-2 py-3">{product.sku}</td>
                      <td className={`px-2 py-3 text-center font-bold ${ product.remaining_qty < 0 ? "text-red-600" : "text-gray-800" }`}>{product.remaining_qty}</td>
                      <td className="px-2 py-3 text-right font-bold text-teal-800">
                        {Number(product.price_per_unit ?? product.big_price).toFixed(2)}
                      </td>
                      <td className="px-2 py-3 text-center">
                        <div className="inline-flex gap-1">
                          <button
                            onClick={() => addToCart(product, 'sales')}
                            className="w-10 h-10 bg-blue-500 hover:bg-blue-600 text-white text-lg font-bold rounded-md shadow-sm transition"
                            title="Add to cart"
                          >
                            +
                          </button>
                          <button
                            onClick={() => addToCart(product, 'return')}
                            className="w-10 h-10 bg-red-500 hover:bg-red-600 text-white text-lg font-bold rounded-md shadow-sm transition"
                            title="Return item"
                          >
                            -
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        
        {/* Right: Cart */}
        <form
          onSubmit={saveIssuance}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              const targetTag = e.target.tagName.toLowerCase();
              const isTextInput = targetTag === 'input' || targetTag === 'select' || targetTag === 'textarea';
              if (isTextInput) {
                e.preventDefault();
              }
            }
          }}
        >
        <div className="bg-white shadow-md p-6 rounded-md border">
          <h2 className="text-lg font-semibold mb-4 -mt-2 text-gray-700">🛒 Cart</h2>
          <div className="text-sm"><ErrorDisplay errors={errors} clearErrors={() => setErrors({})} /></div>

          
              {/* Header Info Section */}
              {issuanceId && <div className="text-right mb-4 font-bold">Issuance No: {String(issuanceId).padStart(4, "0")}</div>}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs mb-6">
                <div>
                  <label className="font-medium text-gray-700">Customer Name</label>
                  <input
                    type="text"
                    placeholder="Enter customer name"
                    className="w-full mt-1 p-2 border rounded-md uppercase"
                    value={issuanceHeader.customer_name}
                    onChange={(e) =>
                      setIssuanceHeader({ ...issuanceHeader, customer_name: e.target.value.toUpperCase() })
                    }
                  />
                </div>
                <div>
                  <label className="font-medium text-gray-700">Transaction Date</label>
                  {/* <input
                    type="date"
                    className="w-full mt-1 p-2 border rounded-md"
                    value={issuanceHeader.transaction_date}
                    onChange={(e) =>
                      setIssuanceHeader({ ...issuanceHeader, transaction_date: e.target.value })
                    }
                  /> */}
                  <div className="flex flex-col">
                    <DatePicker
                      selected={issuanceHeader.transaction_date}
                      onChange={(date) =>
                        setIssuanceHeader((prev) => ({ ...prev, transaction_date: date ? format(date, "yyyy-MM-dd") : "", }))
                      }
                      dateFormat="MM/dd/yyyy"
                      className="register-link p-2 mt-1 w-full border rounded-md text-gray-800 outline-blue-500"
                      placeholderText="MM/DD/YYYY"
                    />
                  </div>
                </div>
                <div>
                  <label className="font-medium text-gray-700">Address</label>
                  <input
                    type="text"
                    placeholder="Enter address"
                    className="w-full mt-1 p-2 border rounded-md uppercase"
                    value={issuanceHeader.address}
                    onChange={(e) =>
                      setIssuanceHeader({ ...issuanceHeader, address: e.target.value.toUpperCase() })
                    }
                  />
                </div>
                <div>
                  <label className="font-medium text-gray-700">Terms</label>
                  <input
                    type="text"
                    placeholder="Enter terms"
                    className="w-full mt-1 p-2 border rounded-md uppercase"
                    value={issuanceHeader.terms}
                    onChange={(e) =>
                      setIssuanceHeader({ ...issuanceHeader, terms: e.target.value.toUpperCase() })
                    }
                  />
                </div>
                <div>
                  <label className="font-medium text-gray-700">Contact Number</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="Enter contact number"
                    className="w-full mt-1 p-2 border rounded-md"
                    value={issuanceHeader.contact_number}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, ''); // Remove non-digits
                      setIssuanceHeader({ ...issuanceHeader, contact_number: value })
                    }}
                  />
                </div>
              </div>
              
            {cart.length === 0 ? (
            <>
            <hr className="mt-8" />
            <p className="text-gray-500 text-sm mt-4 text-center">Cart is empty.</p>
            </>
            ) : (
            <>
              {/* Cart Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs border-separate border-spacing-y-1">
                  <thead className="bg-gray-100 text-gray-700">
                    <tr>
                      <th className="text-center px-3 py-2 border w-20">Qty</th>
                      <th className="text-center px-3 py-2 border w-20">Unit</th>
                      <th className="text-left px-3 py-2 border">Description</th>
                      <th className="text-right px-3 py-2 border w-24">Unit Price</th>
                      <th className="text-right px-3 py-2 border w-20">Amount</th>
                      <th className="px-3 py-2 border"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {cart
                    .slice() // create a copy to avoid mutating state
                    .sort((a, b) => {
                      // "return" rows go last
                      if (a.status === "return" && b.status !== "return") return 1;
                      if (a.status !== "return" && b.status === "return") return -1;
                      return 0; // keep original order otherwise
                    })
                    .map((item, index) => (
                      <tr
                        key={index}
                        className={`text-center ${item.status === 'return' ? 'bg-red-100' : ''}`}
                      >
                        <td className="px-1 py-2" valign="top">
                          <input
                            type="number"
                            min="0"
                            className="w-20 p-1 border rounded text-center"
                            value={item.qty}
                            onChange={(e) => {
                              const enteredQty = Number(e.target.value);
                              updateQty(item.id, enteredQty);
                              handleIssuanceChange(item, "quantity", enteredQty);
                            }}
                          />
                        </td>
                        <td className="px-1 py-2" valign="top">
                          {/* <input
                            type="text"
                            placeholder="Unit"
                            value={item.unit}
                            className="w-20 p-1 border rounded text-center"
                            onChange={(e) => handleIssuanceChange(item, "unit", e.target.value.toUpperCase())}
                          /> */}
                          <select
                            value={item.unit}
                            className="w-20 p-1 border rounded text-center"
                            onChange={(e) => handleIssuanceChange(item, "unit", e.target.value)}
                          >
                            {item.unit && (
                            <option value={item.original_unit || item.unit}>{item.original_unit || item.unit}</option>
                            )}
                            {item.big_unit && (
                              <option value={item.big_unit}>{item.big_unit}</option>
                            )}
                          </select>
                          <input
                            type="text"
                            placeholder="Unit"
                            value={item.status}
                            className="w-20 p-1 border rounded text-center"
                            onChange={(e) => handleIssuanceChange(item, "status ", e.target.value)}
                            hidden
                          />
                        </td>
                        <td className="px-3 py-2 text-left font-semibold" valign="top">
                          <input
                            type="text"
                            readOnly
                            className={`w-full p-1 bg-transparent focus:outline-none`}
                            value={item.product_name} />
                          {item.status === 'return' && (
                            <input
                              type="text"
                              placeholder="Remarks"
                              value={item.reason || ''}
                              //onChange={(e) => handleReasonChange(index, e.target.value)}
                              className="mt-2 block w-full text-xs border rounded px-1 py-1"
                            />
                          )}
                        </td>
                        <td className="text-right px-1 py-2 font-semibold whitespace-nowrap" valign="top">
                          {/* ₱{item.status === 'return'
                            ? `(${item.unit_price.toFixed(2)})`
                            : item.unit_price.toFixed(2)} */}
                          <input
                            type="number"
                            min="0"
                            className={`w-24 p-1 border rounded text-right ${
                              item.status === "return" ? "text-red-500" : ""
                            }`}
                            value={item.unit_price}
                            onChange={(e) => handleIssuanceChange(item, "unit_price", e.target.value)}
                            onBlur={(e) =>
                              validateUnitPrice(item, e.target.value)
                            }
                          />
                        </td>
                        <td className="text-right px-1 py-2 font-semibold whitespace-nowrap" valign="top">
                          <input
                            type="text"
                            readOnly
                            className={`w-20 p-1 text-right bg-transparent focus:outline-none ${
                              item.status === "return" ? "text-red-500" : ""
                            }`}
                            value={
                              item.status === "return"
                                ? `(${(item.qty * item.unit_price).toFixed(2)})`
                                : (item.qty * item.unit_price).toFixed(2)
                            }
                          />
                        </td>
                        <td className="text-right py-2 px-2" valign="top">
                          <div className="flex justify-end items-center">
                            <button
                              type="button"
                              onClick={() =>
                                removeFromCart(item.product_id, item.header_id ?? item.stock_id, item.status)
                              }
                              className="text-red-500 hover:text-red-700 text-sm"
                              title="Remove item"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 w-3/5">
                <Select
                  name="product_id"
                  placeholder="Search Product"
                  className="text-left text-xs"
                  classNamePrefix="select"
                  value={itemOptions.find(opt => opt.value === selectedProduct)}
                  onChange={handleProductSelect}
                  options={itemOptions}
                  isClearable
                  menuPortalTarget={document.body}
                  styles={{
                    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                    control: (base) => ({ ...base, minHeight: 30, height: 35 }),
                    menu: (base) => ({ ...base, fontSize: '0.75rem', zIndex: 9999 }),
                  }}
                  formatOptionLabel={(option) => {
                    const item = productList.find(p => p.id === option.value);
                    return (
                      <div className="flex justify-between items-center w-full text-xs">
                        <span>{`${item.sku} - ${item.product_name}`}</span>
                        <span className="text-gray-500 ml-2 whitespace-nowrap">
                          {item.remaining_qty} in stock
                        </span>
                      </div>
                    );
                  }}
                />

              </div>

              {/* Total & Checkout */}
              <div className="mt-4 flex flex-col items-end mb-4">
                <div className="text-lg font-semibold text-gray-800 mb-4">
                  Total: ₱{total.toFixed(2)}
                </div>
                <button
                  className="bg-green-600 hover:bg-green-700 text-white text-sm px-6 py-2 rounded"
                  disabled={cart.length === 0}
                >
                  Checkout
                </button>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="DR #"
                  className="p-2 border rounded-md uppercase text-xs w-16"
                  value={issuanceHeader.drletter}
                  onChange={(e) =>
                    setIssuanceHeader({ ...issuanceHeader, drletter: e.target.value.toUpperCase() })
                  }
                />
                <input
                  type="text"
                  placeholder="000000"
                  className="p-2 border rounded-md uppercase text-xs"
                  value={issuanceHeader.drno}
                  onChange={(e) =>
                    setIssuanceHeader({ ...issuanceHeader, drno: e.target.value.toUpperCase() })
                  }
                />
              </div>

            </>
          )}
        </div>

        </form>
      </div>
    </div>

    <Dialog open={openProductPopup} onClose={setOpenProductPopup} className="relative z-[999]">
      <DialogBackdrop
          transition
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
      />

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <DialogPanel transition className="relative transform overflow-hidden transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-xl data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"> 

            <div className="flex flex-col font-[sans-serif]">
                <div className="w-full mx-auto border border-gray-300 p-8 bg-gray-50">
                  <div className="text-center mb-4">
                    <h1 className="text-2xl text-left pb-6 flex"><FaList size={30} className='mr-1'/> Stock Details </h1>
                    
                      <div className="border bg-white shadow-md p-6 w-full max-w-2xl mx-auto">
                        <table className="w-full text-sm text-left text-gray-700">
                          <tbody>
                            <tr className="bg-gray-50">
                              <th className="py-3 px-4 font-semibold text-gray-600 w-1/3">Order Date</th>
                              <td className="py-2 px-3">{formatDate(productData.order_date)}</td>
                            </tr>
                            <tr>
                              <th className="py-3 px-4 font-semibold text-gray-600 w-1/3">Delivery Date</th>
                              <td className="py-2 px-3">{formatDate(productData.delivery_date)}</td>
                            </tr>
                            <tr className="bg-gray-50">
                              <th className="py-3 px-4 font-semibold text-gray-600 w-1/3">Delivery Receipt</th>
                              <td className="py-2 px-3">{productData.delivery_receipt}</td>
                            </tr>
                            <tr>
                              <th className="py-3 px-4 font-semibold text-gray-600 w-1/3">Supplier Name</th>
                              <td className="py-2 px-3">{productData.supplier_name}</td>
                            </tr>
                            <tr className="bg-gray-50">
                              <th className="py-3 px-4 font-semibold text-gray-600 w-1/3">Remarks</th>
                              <td className="py-2 px-3">{productData.remarks}</td>
                            </tr>
                          </tbody>
                        </table>
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

    {status === 1 &&  <InfoBox open={open} setOpen={setOpen} onClose={setOpen}
      title="Confirm Success"
      body="Product sales successfully added!"
      okConfirm={closeCreate}
      /> 
    }
    </>
  );
}
