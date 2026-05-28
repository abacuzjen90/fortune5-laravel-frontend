import { useNavigate } from "react-router-dom";
import { RiLogoutBoxRFill } from "react-icons/ri";
import { AppContext } from "../../context/AppContext";
import { useContext, useState } from "react";
import { Dialog, DialogBackdrop, DialogPanel } from '@headlessui/react';
import { FaList, FaSearch } from "react-icons/fa";
import { Link } from 'react-router-dom';
import useScreenSize from "../../assets/components/useScreenSize";

export default function Header() {
    const { user, token, setUser, setToken } = useContext(AppContext)
    const navigate = useNavigate();
    const [openSearch, setOpenSearch] = useState(false);
    const [productList, setProductList] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [showLoading, setShowLoading] = useState(false);
    const isLoading = () => {setShowLoading(true)};
    const stopLoading = () => {setShowLoading(false)};
    const isMediumScreen = useScreenSize(768);
    const minChars = 4;
    const BASE_URL = "https://111hardware-images.s3.ap-southeast-1.amazonaws.com/";

    const formatAmount = (amount) => Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });


    const idFormat = (empid) => {
        return String(empid).padStart(4, "0");
    };

    async function handleLogout(e) {
        e.preventDefault()
        const res = await fetch("/api/logout", {
            method: "post",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        const data = await res.json();
        console.log(data);

        if (res.ok) {
            setUser(null);
            setToken(null);
            localStorage.removeItem("Token");
            navigate("/login");
        }
    }

    const handleSearch = () => {
      isLoading();
        if (searchTerm.length < minChars) {
        alert(`Please enter at least ${minChars} characters.`);
        return;
        }
        setOpenSearch(true);
        getProductList(searchTerm);
      stopLoading();
    };


    async function getProductList(searchText = "") {
        const res = await fetch(`/api/getproductsearch?search=${encodeURIComponent(searchText)}`, {
        method: "get",
            headers: {
            Authorization: `Bearer ${token}`,
            },
        });
        const data = await res.json();
        console.log(data);
        if(res.ok) {
            setProductList(data);
        }
    }


    const highlightText = (text, searchTerm) => {
        if (!searchTerm) return text;

        const regex = new RegExp(`(${searchTerm})`, "gi");
        const parts = text.split(regex);

        return parts.map((part, i) =>
            part.toLowerCase() === searchTerm.toLowerCase() ? (
            <mark key={i} className="bg-yellow-300 text-black">
                {part}
            </mark>
            ) : (
            part
            )
        );
    };

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
        <header className="flex min-w-max overflow-x-auto items-center justify-between p-2 top-0 bg-slate-800 shadow-md z-50 w-full">
            <div className="flex w-full items-center">
                <div className="flex relative xl:w-50">
                    <input
                        type="search"
                        className="relative block min-w-0 flex-auto rounded border border-solid border-gray-300 bg-transparent bg-clip-padding px-6 py-[0.25rem] text-base font-normal leading-[1.6] text-neutral-100 outline-none transition duration-200 ease-in-out focus:z-[3] focus:border-primary focus:text-neutral-200 focus:shadow-[inset_0_0_0_1px_rgb(59,113,202)] focus:outline-none dark:border-neutral-600 dark:text-neutral-200 dark:placeholder:text-neutral-200 dark:focus:border-primary"
                        id="exampleSearch"
                        placeholder="SEARCH HARDWARE"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            handleSearch(); // your function
                        }
                        }}
                    />
                    </div>

                <div className="w-full bg-slate-50">
                </div>
                <div className="w-20 mr-1">
                    {user?.image ? (
                        <img
                            src={`${BASE_URL}${user?.image}`}
                            className="w-10 h-10 min-w-[40px] min-h-[40px] object-cover shadow-md 
                             transform transition duration-300 
                            hover:scale-105 hover:shadow-xl"
                        />
                        ) : (
                        <img
                            src={`${BASE_URL}images/users/user.png`}
                            className="w-10 h-10 min-w-[40px] min-h-[40px] object-cover shadow-md 
                             transform transition duration-300 
                            hover:scale-105 hover:shadow-xl"
                        />
                    )}  
                </div>
                <div className="flex flex-col mr-10 whitespace-nowrap">
                    <form  onSubmit={handleLogout}>
                    <div className="flex text-slate-300 text-sm"><p className="mr-2">{user?.name} ({idFormat(user?.id)})</p><p className="font-bold">|</p><button className="flex nav-link hover:text-white"><RiLogoutBoxRFill size={20} color='white' className="ml-2"/>Logout</button></div>
                    <div className="text-slate-300 text-sm">{user?.branch } ({user?.role})</div>
                    </form>
                </div>
            </div>
        </header>


        <Dialog open={openSearch} onClose={setOpenSearch} className="relative z-[999]">
            <DialogBackdrop
                transition
                className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
            />
    
            <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                <DialogPanel transition className="relative transform overflow-hidden transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-screen-lg data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"> 
    
                {/* Close button */}
                <button onClick={() => setOpenSearch(false)} className="absolute top-5 right-5 text-gray-500 hover:text-gray-800 transition">✕</button>
                <div className="flex flex-col font-[sans-serif]">
                    <div className="w-full mx-auto border border-gray-300 p-8 bg-gray-50">
                    <div className="text-center mb-4">
                        <h1 className="text-2xl text-left pb-6 flex items-center">
                            <FaSearch size={28} className="mr-2" />
                            Search Result
                            {searchTerm && (
                                <span className="ml-2 text-blue-600 font-semibold">
                                for "{searchTerm}"
                                </span>
                            )}
                        </h1>
                    
                        {/* Details Section */}
                        <div className="bg-white shadow p-6 overflow-x-auto space-y-6">
                        {productList.length > 0 ? (
                        <>
                            {/* Table for STOCK */}
                            {productList.some((rec) => rec.source === "stock") && (
                            <>
                            <h1 className=" font-semibold text-gray-800 text-left">Stock Details</h1>
                            <table className="w-full border-collapse mb-6">
                                <thead className="bg-gray-200 text-xs font-bold uppercase text-gray-600">
                                <tr>
                                    <th className="px-3 py-3">Stock No.</th>
                                    <th className="px-3 py-3">DR No.</th>
                                    <th className="px-3 py-3">Product Name</th>
                                    <th className="px-3 py-3">SKU</th>
                                    <th className="px-3 py-3">Total<br/>Qty</th>
                                    <th className="px-3 py-3">Issued<br/>Qty</th>
                                    <th className="px-3 py-3">Remaining<br/>Qty</th>
                                    <th className="px-3 py-3">Price</th>
                                    <th className="px-3 py-3">Status</th>
                                </tr>
                                </thead>
                                <tbody>
                                {productList
                                    .filter((rec) => rec.source === "stock")
                                    .map((rec) => (
                                    <tr
                                        key={`stock-${rec.id}`}
                                        className="text-xs bg-white border-b hover:bg-gray-50"
                                    >
                                        <td className="px-3 py-3 font-medium text-blue-600">
                                        {String(rec.header_id).padStart(4, "0")}
                                        </td>
                                        <td className="px-3 py-3">
                                        {highlightText(String(rec.delivery_receipt || ""), searchTerm)}
                                        </td>
                                        <td className="px-3 py-3">
                                        {highlightText(String(rec.product_name || ""), searchTerm)}
                                        </td>
                                        <td className="px-3 py-3">
                                        {highlightText(String(rec.sku || ""), searchTerm)}
                                        </td>
                                        <td className="px-3 py-3 font-bold">{rec.quantity}</td>
                                        <td className="px-3 py-3 font-bold text-blue-700">
                                        {rec.quantity - rec.remaining_qty}
                                        </td>
                                        <td className="px-3 py-3 font-bold">{rec.remaining_qty}</td>
                                        <td className="px-3 py-3 font-bold text-right">₱ {formatAmount(rec.price_per_unit)}</td>
                                        <td
                                        className={`px-3 py-3 font-bold whitespace-nowrap ${
                                            rec.remaining_qty <= 0
                                            ? "bg-red-200 text-red-800"
                                            : rec.remaining_qty > rec.reorder_level
                                            ? "bg-green-200 text-green-800"
                                            : "bg-yellow-200 text-yellow-800"
                                        }`}
                                        >
                                        {rec.remaining_qty <= 0
                                            ? "No Stock"
                                            : rec.remaining_qty > rec.reorder_level
                                            ? "In Stock"
                                            : "Low Stock"}
                                        </td>
                                    </tr>
                                    ))}
                                </tbody>
                            </table>
                            </>
                            )}

                            {/* Table for ISSUANCE */}
                            {productList.some((rec) => rec.source === "issuance") && (
                            <>
                            <h1 className="font-semibold text-gray-800 text-left">Issuance Details</h1>
                            <table className="w-full border-collapse">
                                <thead className="bg-gray-200 text-xs font-bold uppercase text-gray-600 ">
                                <tr>
                                    <th className="px-3 py-3">Issuance No.</th>
                                    <th className="px-3 py-3">Transaction Date</th>
                                    <th className="px-3 py-3">DR No.</th>
                                    <th className="px-3 py-3">Customer Name</th>
                                    <th className="px-3 py-3">Product Name</th>
                                    <th className="px-3 py-3">Unit</th>
                                    <th className="px-3 py-3">Qty</th>
                                    <th className="px-3 py-3">Unit Price</th>
                                    <th className="px-3 py-3">Total Price</th>
                                </tr>
                                </thead>
                                <tbody>
                                {productList
                                    .filter((rec) => rec.source === "issuance")
                                    .map((rec) => (
                                    <tr
                                        key={`issuance-${rec.id}`}
                                        className="text-xs bg-white border-b hover:bg-gray-50"
                                    >
                                        <td className="px-3 py-3 font-medium text-blue-600">
                                        {String(rec.ref_id || rec.issuance_id).padStart(4, "0")}
                                        </td>
                                        <td className="px-3 py-3">
                                        {highlightText(String(formatDate(rec.transaction_date) || ""), searchTerm)}
                                        </td>
                                        <td className="px-3 py-3 whitespace-nowrap">
                                            {highlightText(
                                                String(`${rec.drletter || ""} ${rec.drno || ""}`.trim()),
                                                searchTerm
                                            )}
                                        </td>
                                        <td className="px-3 py-3">
                                        {highlightText(String(rec.customer_name || ""), searchTerm)}
                                        </td>
                                        <td className="px-3 py-3 whitespace-nowrap text-left">
                                        {highlightText(String(rec.product_name || ""), searchTerm)}
                                        </td>
                                        <td className="px-3 py-3">
                                        {highlightText(String(rec.sku || ""), searchTerm)}
                                        </td>
                                        <td className={`px-3 py-3 font-bold ${ rec.status === "return" ? "text-red-600" : "text-blue-700" }`}>{rec.quantity}</td>
                                        <td className={`px-3 py-3 text-right font-bold ${ rec.status === "return" ? "text-red-600" : "" }`}>₱ {formatAmount(rec.unit_price)}</td>
                                        <td className={`px-3 py-3 text-right font-bold ${ rec.status === "return" ? "text-red-600" : "" }`}>₱ {formatAmount(rec.quantity * rec.unit_price)}</td>
                                   
                                    </tr>
                                    ))}
                                </tbody>
                            </table>
                            </>
                            )}
                        </>
                        ) : (
                        <p className="text-center py-4 text-gray-600">
                            No results found for <span className="font-semibold">"{searchTerm}"</span>.
                            <br />
                            <span className="text-sm text-gray-500">
                                Try searching with a different keyword for better results.
                            </span>
                        </p>
                        )}

                        </div>
    
                    </div>
                    </div>
                </div>
                </DialogPanel>
                </div>
            </div>
        </Dialog>
        </>
    )
}