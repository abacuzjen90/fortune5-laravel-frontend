import { Dialog, DialogBackdrop, DialogPanel, Tab, TabList, TabPanels, TabPanel, TabGroup } from '@headlessui/react';
import React, { useContext, useEffect, useState} from "react";
import { AppContext } from "../context/AppContext";
import { Link } from 'react-router-dom';
import InfoBox from "../assets/components/InfoBox";
import ConfirmBox from "../assets/components/DeleteBox";
import UpdateBox from "../assets/components/UpdateBox";
import AddBox from "../assets/components/AddBox";
import { MdAdd, MdDelete, MdCurrencyBitcoin, MdCurrencyExchange, MdEdit, MdMoney, MdMonitor } from "react-icons/md";
import { FaRegTrashAlt, FaRegEdit, FaUserEdit, FaUserPlus, FaRegFile, FaSearch } from "react-icons/fa";
import Pagination from '../assets/components/Pagination';
import TableSort from '../assets/components/TableSort';
import LoadingBox from '../assets/components/Loading';
import sortData from '../assets/components/sortData';
import useScreenSize from "../assets/components/useScreenSize";
import dayjs from "dayjs";
import DatePicker from "react-datepicker";
import { format } from "date-fns";

export default function GeneralSalesRecord() {

  const [openAddDial, setOpenAddDial] = useState(false);
  const [openSearchDial, setOpenSearchDial] = useState(false);
  const [openPettyDial, setOpenPettyDial] = useState(false);
  const [openCashDial, setOpenCashDial] = useState(false);
  const [openMonitoringDial, setOpenMonitoringDial] = useState(false);
  const [open, setOpen] = useState(false);
  const { token } = useContext(AppContext);
  const [showLoading, setShowLoading] = useState(false);
  const isLoading = () => {setShowLoading(true)};
  const stopLoading = () => {setShowLoading(false)};
  const [status, setStatus] = useState(0);
  const [pettyCashData, setPettyCashData] = useState([]);
  const [cashCountData, setCashCountData] = useState([]);
  const [monitoringData, setMonitoringData] = useState([]);
  const [pettyCashDataHistory, setPettyCashDataHistory] = useState([]);
  const [cashCountDataHistory, setCashCountDataHistory] = useState([]);
  const [monitoringDataHistory, setMonitoringDataHistory] = useState([]);
  const isMediumScreen = useScreenSize(768);
  const [totalSales, setTotalSales] = useState(0);
  const [totalCreditCollection, setTotalCreditCollection] = useState(0);
  const [totalCredit, setTotalCredit] = useState(0);
  const [totalOut, setTotalOut] = useState(0);
  const [totalSalesHistory, setTotalSalesHistory] = useState(0);
  const [totalCreditCollectionHistory, setTotalCreditCollectionHistory] = useState(0);
  const [totalCreditHistory, setTotalCreditHistory] = useState(0);
  const [totalOutHistory, setTotalOutHistory] = useState(0);
  const [historyDate, setHistoryDate] = useState("");
  const [encoder, setEncoder] = useState(null);
  const [pettyCashEncoder, setPettyCashEncoder] = useState([]);
  const [cashCountEncoder, setCashCountEncoder] = useState([]);
  const [monitoringEncoder, setMonitoringEncoder] = useState([]);
  const [pettyCashEntries, setPettyCashEntries] = useState([]);
  const [references, setReferences] = useState([""]);
  const [errors, setErrors] = useState({});
  const [search, setSearch] = useState("");

  const [formData, setFormData] = useState({
    designation: "",
  });

  const [selectedDate, setSelectedDate] = useState(new Date());
  const today = format(new Date(), "M/d/yyyy");
  const denominations = [1000, 500, 200, 100, 50, 20, 10, 5, 1];

  const [pettyCashItems, setPettyCashItems] = useState(
    denominations.map((denom) => ({
      denomination: denom,
      quantity: "",
      amount: 0,
    }))
  );

  const [pettyCash, setPettyCash] = useState({
    date: today, // mm/dd/yyyy
    items: denominations.map((denom) => ({
      denomination: denom,
      quantity: "",
      amount: 0,
      encoder: "",
    })),
  });

  const [pettyCashHistory, setPettyCashHistory] = useState({
    entries: [], // history entries only
  });


  const [cashCount, setCashCount] = useState({
    date: today, // mm/dd/yyyy
    items: denominations.map((denom) => ({
      denomination: denom,
      quantity: "",
      amount: 0,
    })),
  });


  const [cashCountHistory, setCashCountHistory] = useState({
    date: "", // mm/dd/yyyy
    items: denominations.map((denom) => ({
      denomination: denom,
      quantity: "",
      amount: 0,
      encoder: "",
      encoder_name: "",
    })),
  });

  const [monitoring, setMonitoring] = useState({
    date: today,
    type: "",
    referenceno: "",
    name: "",
    description: "",
    mode_of_payment: "",
    gcash_referenceno: "",
    bank: "",
    bank_date: "",
    checkno: "",
    amount: "",
    receiving_bank: "",
    bank_transfer_refno: "",
  });

  const [monitoringHistory, setMonitoringHistory] = useState({
    date: "",
    type: "",
    referenceno: "",
    name: "",
    description: "",
    mode_of_payment: "",
    gcash_referenceno: "",
    bank: "",
    bank_date: "",
    checkno: "",
    amount: "",
  });


  const handleAddRef = () => {
    setReferences((prev) => [...prev, ""]);
  };

  const handleDeleteRef = (index) => {
    const updated = references.filter((_, i) => i !== index);
    setReferences(updated);

    setMonitoring((prev) => ({
      ...prev,
      referenceno: updated.filter(Boolean).join(", "),
    }));
  };

  const handleChangeRef = (index, value) => {
    const updated = [...references];
    updated[index] = value;
    setReferences(updated);

    setMonitoring((prev) => ({
      ...prev,
      referenceno: updated.filter(Boolean).join(", "),
    }));
  };


  // Get Petty Cash 
  async function getPettyCash() {
    isLoading();

    const res = await fetch(
      `/api/generalsalespettycash?date=${pettyCash.date}`,
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await res.json();
    console.log("Petty cash:", data);

    if (res.ok && Array.isArray(data)) {
      // group by created_at (or batch_id if you add one later)
      const grouped = data.reduce((acc, rec) => {
        const key = rec.created_at;

        if (!acc[key]) {
          acc[key] = {
            id: rec.id,
            created_at: rec.created_at,
            encoder: rec.encoder ?? "User",
            items: [],
            total: 0,
          };
        }

        acc[key].items.push({
          denomination: Number(rec.denomination),
          quantity: Number(rec.quantity),
          amount: Number(rec.amount),
        });

        acc[key].total += Number(rec.amount || 0);

        return acc;
      }, {});

      setPettyCashEntries(Object.values(grouped));
      stopLoading();
    }
  }

  useEffect(() => {
    getPettyCash();
  }, [pettyCash.date]);

  const totalPettyCash = Array.isArray(pettyCashData)
  ? pettyCashData.reduce((sum, rec) => sum + Number(rec.amount || 0), 0)
  : 0;

  const grandTotalPettyCash = pettyCashEntries.reduce(
    (sum, entry) => sum + entry.total,
    0
  );


  // Get Petty Cash History
  async function getPettyCashHistory() {
    isLoading();

    try {
      const res = await fetch(
        `/api/generalsalespettycashhistory?date=${historyDate}`,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();
      console.log("History petty cash:", data);

      if (res.ok) {
        setPettyCashEncoder(data); // already grouped
      }
    } catch (err) {
      console.error(err);
    } finally {
      stopLoading();
    }
  }

  useEffect(() => {
    if (!historyDate) return;
    getPettyCashHistory();
  }, [historyDate]);


  async function getCashCount() {
    isLoading();

    const res = await fetch(`/api/generalsalescashcount?date=${pettyCash.date}`, {
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json();
    console.log("Fetched cash count:", data);
    
    if (res.ok) {
      setCashCountData(data);
      // merge backend data into pettyCash.items
      setCashCount((prev) => {
        const updatedItems = prev.items.map((item) => {
          const existing = data.find(
            (rec) => Number(rec.denomination) === Number(item.denomination)
          );
          
          return existing
            ? {
                ...item,
                quantity: Number(existing.quantity) || 0,
                amount: Number(existing.amount) || 0,
              }
            : item;
        });

        return { ...prev, items: updatedItems };
      });
      stopLoading();
    }
  }
  useEffect(() => {
    getCashCount();
  }, [cashCount.date]);

  const totalCashCount = Array.isArray(cashCountData)
  ? cashCountData.reduce((sum, rec) => sum + Number(rec.amount || 0), 0)
  : 0;



  // Get Cash Count History
  async function getCashCountHistory() {
    isLoading();

    const res = await fetch(`/api/generalsalescashcounthistory?date=${historyDate}`, {
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json();
    console.log("History cash count:", data);
    
    if (res.ok) {
      const encoderMap = new Map();

      data.forEach((r) => {
        const id = Number(r.encoder);

        if (!encoderMap.has(id)) {
          encoderMap.set(id, {
            encoder: id,
            encoder_name: r.encoder_name,
          });
        }
      });

      const uniqueEncoderObjects = Array.from(encoderMap.values());
      uniqueEncoderObjects.sort((a, b) => a.encoder - b.encoder);

      setCashCountEncoder(uniqueEncoderObjects);
      stopLoading();
    }
  }
  useEffect(() => {
    if (!historyDate) return;
    getCashCountHistory();
  }, [historyDate]);


  async function getMonitoring() {
    isLoading();

    const res = await fetch(`/api/generalsalesmonitoring?date=${pettyCash.date}`, {
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json();
    console.log("Fetched cash count:", data);
    
    if (res.ok) {
      setMonitoringData(data);

      const {
        totalSales,
        totalCreditCollection,
        totalCredit,
        totalOut
      } = data.reduce(
        (acc, item) => {
          const amount = parseFloat(item.amount || 0);

          //Update also conditions for history below
          if (item.mode_of_payment === "Check") acc.totalOut += amount;
          if (item.mode_of_payment === "GCash") acc.totalOut += amount;
          if (item.mode_of_payment === "BankTransfer") acc.totalOut += amount;
          if (item.type === "Sales" || item.type === "Sales-P") acc.totalSales += amount;
          if (item.type === "Credit Collection") acc.totalCreditCollection += amount;
          if (item.type === "Credit") acc.totalCredit += amount;
          if (item.type === "Out") acc.totalOut += amount;

          return acc;
        },
        {
          totalSales: 0,
          totalCreditCollection: 0,
          totalCredit: 0,
          totalOut: 0,
        }
      );

      setTotalSales(totalSales);
      setTotalCreditCollection(totalCreditCollection);
      setTotalCredit(totalCredit);
      setTotalOut(totalOut);

      stopLoading();
    }
  }
  useEffect(() => {
    getMonitoring();
  }, [monitoring.date]);



  async function getMonitoringHistory() {
    isLoading();

    const res = await fetch(`/api/generalsalesmonitoringhistory?date=${historyDate}`, {
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json();
    console.log("History monitoring:", data);
    
    if (res.ok) {
      const encoderMap = new Map();

      data.forEach((r) => {
        const id = Number(r.encoder);

        if (!encoderMap.has(id)) {
          encoderMap.set(id, {
            encoder: id,
            encoder_name: r.encoder_name,
          });
        }
      });

      const uniqueEncoderObjects = Array.from(encoderMap.values());
      uniqueEncoderObjects.sort((a, b) => a.encoder - b.encoder);

      setMonitoringEncoder(uniqueEncoderObjects);
      stopLoading();
    }
  }
  useEffect(() => {
    if (!historyDate) return;
    getMonitoringHistory();
  }, [historyDate]);

  const encodersForDate = [
      ...pettyCashEncoder,
      ...cashCountEncoder,
      ...monitoringEncoder,
    ].filter(enc => enc.encoder);

  const uniqueEncoders = Array.from(
    new Map(encodersForDate.map(enc => [enc.encoder, enc])).values()
  );

  const handleQtyPettyCash = (index, value) => {
    const qty = Number(value) || 0;

    setPettyCashItems((prev) => {
      const updatedItems = [...prev];

      updatedItems[index] = {
        ...updatedItems[index],
        quantity: value, // keep as string for input
        amount: updatedItems[index].denomination * qty,
      };

      return updatedItems;
    });
  };

  const grandTotal_pettyCash = pettyCashItems.reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0
  );

  
  const handleQtyCashCount = (index, value) => {
    const updatedItems = [...cashCount.items];
    const qty = Number(value) || 0;
    updatedItems[index] = {
      ...updatedItems[index],
      quantity: qty,
      amount: updatedItems[index].denomination * qty,
    };

    setCashCount((prev) => ({
      ...prev,
      items: updatedItems,
    }));
  };

  const grandTotal_cashCount = cashCount.items.reduce((sum, item) => sum + item.amount, 0);

  function confirmAdd(e) {
    e.preventDefault();

    // check if at least one qty > 0
    const hasInput = pettyCashItems.some(
      (item) => Number(item.quantity) > 0
    );

    if (!hasInput || grandTotal_pettyCash <= 0) {
      setErrors({
        petty_cash: ["Please enter at least one petty cash amount."],
      });
      return;
    }

    // clear previous errors
    setErrors({});

    setStatus(3); // confirm add
    setOpen(true);
  }

  //Add Petty Cash
  const addPettyCash = async () => {

    const payload = {
      date: pettyCash.date,
      items: pettyCashItems,
      total: grandTotal_pettyCash,
    };

    console.log("Submitting petty cash:", payload);

    try {
      const res = await fetch("/api/generalsalespettycash", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      console.log("Response:", data);

      if (data.errors) {
        setErrors(data.errors);
      } else {
        setOpen(true);
        setStatus(1);

        getPettyCash(); // for viewing/history only

        // ✅ reset ONLY the input rows
        setPettyCashItems(
          denominations.map((denom) => ({
            denomination: denom,
            quantity: "",
            amount: 0,
          }))
        );
      }
    } catch (err) {
      console.error("Failed to submit petty cash:", err);
    }
  };



  //Add Petty Cash
  const addCashCount = async (e) => {
    e.preventDefault();

    const payload = {
      ...cashCount,
      total: grandTotal_cashCount,
    };

    console.log("Submitting cash count:", payload);

    try {
      const res = await fetch("/api/generalsalescashcount", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      console.log("Response:", data);

      if (data.errors) {
        setErrors(data.errors);
      } else {
        setOpen(true);
        setStatus(1);
        getCashCount();
        // reset petty cash form
        setCashCount((prev) => ({
          ...prev, // keep prev.date
          items: denominations.map((denom) => ({
            denomination: denom,
            quantity: "",
            amount: 0,
          })),
        }));
        
      }
    } catch (err) {
      console.error("Failed to submit petty cash:", err);
    }
  };


  //Add Monitoring
  const addMonitoring = async (e) => {
    e.preventDefault();

    console.log(monitoring);
    try {
      const res = await fetch("/api/generalsalesmonitoring", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(monitoring),
      });

      const data = await res.json();
      console.log("Response:", data);

      if (data.errors) {
        setErrors(data.errors);
      } else {
        setOpen(true);
        setStatus(1);
        getMonitoring();
         setMonitoring((prev) => ({
          ...prev, // keep prev.date
          type: "",
          referenceno: "",
          name: "",
          description: "",
          mode_of_payment: "",
          gcash_referenceno: "",
          bank: "",
          bank_date: "",
          checkno: "",
          receiving_bank: "",
          bank_transfer_refno: "",
          amount: "",
        }));

        setReferences([""]);
        setErrors(false);
      }
    } catch (err) {
      console.error("Failed to submit transaction:", err);
    }
  };


  async function closeCreate() {
    setOpen(false);
    setOpenPettyDial(false);
    setOpenCashDial(false);
  }


  // Delete transaction
  async function deleteTransaction(e, trId) {
    console.log(trId);
    e.preventDefault();
      const res = await fetch(`/api/generalsalesmonitoring/${trId}`, {
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
        setOpen(true);
        setStatus(5);
        getMonitoring();
      }
  }

  async function closeDelete() {
    setOpen(false);
  }



  async function getPettyCashEncoder() {
    isLoading();

    const res = await fetch(
      `/api/generalsalespettycashencoder?date=${historyDate}&encoder=${encoder}`,
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await res.json();
    console.log("Petty cash encoder:", data);

    if (res.ok) {
      const grouped = groupPettyCashEntries(data);

      setPettyCashHistory({
        entries: grouped,
      });

      stopLoading();
    }
  }


  const totalPettyCashHistory = Array.isArray(pettyCashDataHistory)
  ? pettyCashDataHistory.reduce((sum, rec) => sum + Number(rec.amount || 0), 0)
  : 0;

  const grandTotalPettyCashHistory = pettyCashHistory.entries.reduce(
  (sum, entry) => sum + Number(entry.total || 0),
  0
);

  function groupPettyCashEntries(rows) {
    const map = new Map();

    rows.forEach((r) => {
      const key = r.created_at; // entry identifier

      if (!map.has(key)) {
        map.set(key, {
          created_at: r.created_at,
          items: [],
          total: 0,
        });
      }

      map.get(key).items.push({
        denomination: Number(r.denomination),
        quantity: Number(r.quantity),
        amount: Number(r.amount),
      });

      map.get(key).total += Number(r.amount || 0);
    });

    return Array.from(map.values());
  }


  async function getCashCountEncoder() {
    isLoading();

    const res = await fetch(`/api/generalsalescashcountencoder?date=${historyDate}&encoder=${encoder}`, {
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json();
    console.log("Cash count encoder:", data);
    
    if (res.ok) {
      setCashCountDataHistory(data);
      setCashCountHistory((prev) => {
        const updatedItems = prev.items.map((item) => {
          const existing = data.find(
            (rec) => Number(rec.denomination) === Number(item.denomination)
          );

          return {
            ...item,
            quantity: existing ? Number(existing.quantity) : 0,
            amount: existing ? Number(existing.amount) : 0,
          };
        });

        return { ...prev, items: updatedItems };
      });
      stopLoading();
    }
  }

  const totalCashCountHistory = Array.isArray(cashCountDataHistory)
  ? cashCountDataHistory.reduce((sum, rec) => sum + Number(rec.amount || 0), 0)
  : 0;

  async function getMonitoringEncoder() {
    isLoading();

    const res = await fetch(`/api/generalsalesmonitoringencoder?date=${historyDate}&encoder=${encoder}`, {
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json();
    console.log("Fetched cash count:", data);
    
    if (res.ok) {
      setMonitoringDataHistory(data);

      const {
        totalSalesHistory,
        totalCreditCollectionHistory,
        totalCreditHistory,
        totalOutHistory
      } = data.reduce(
        (acc, item) => {
          const amount = parseFloat(item.amount || 0);

          if (item.mode_of_payment === "Check") acc.totalOutHistory += amount;
          if (item.mode_of_payment === "GCash") acc.totalOutHistory += amount;
          if (item.mode_of_payment === "BankTransfer") acc.totalOutHistory += amount;
          if (item.type === "Sales" || item.type === "Sales-P") acc.totalSalesHistory += amount;
          if (item.type === "Credit Collection") acc.totalCreditCollectionHistory += amount;
          if (item.type === "Credit") acc.totalCreditHistory += amount;
          if (item.type === "Out") acc.totalOutHistory += amount;

          return acc;
        },
        {
          totalSalesHistory: 0,
          totalCreditCollectionHistory: 0,
          totalCreditHistory: 0,
          totalOutHistory: 0,
        }
      );

      setTotalSalesHistory(totalSalesHistory);
      setTotalCreditCollectionHistory(totalCreditCollectionHistory);
      setTotalCreditHistory(totalCreditHistory);
      setTotalOutHistory(totalOutHistory);

      stopLoading();
    }
  }
  useEffect(() => {
    if (encoder) {
      getPettyCashEncoder();
      getCashCountEncoder();
      getMonitoringEncoder();
    }
  }, [encoder]);


  useEffect(() => {
    setEncoder(null);
    setCashCountHistory((prev) => ({
      ...prev,
      items: prev.items.map((item) => ({
        ...item,
        quantity: 0,
        amount: 0,
      })),
    }));

    setPettyCashHistory({ entries: [] });

    setTotalSalesHistory(0);
    setTotalCreditCollectionHistory(0);
    setTotalCreditHistory(0);
    setTotalOutHistory(0);

    // Reset total
    setPettyCashDataHistory([]);
    setCashCountDataHistory([]);
    setMonitoringDataHistory([]);
  }, [historyDate]);


  useEffect(() => {
    const newDate = format(selectedDate, "M/d/yyyy");
    // Reset pettyCash
    setPettyCash({
      date: newDate,
      items: denominations.map((denom) => ({
        denomination: denom,
        quantity: "",
        amount: 0,
        encoder: "",
      })),
    });

    // Reset cashCount
    setCashCount({
      date: newDate,
      items: denominations.map((denom) => ({
        denomination: denom,
        quantity: "",
        amount: 0,
      })),
    });

    // Reset monitoring
    setMonitoring({
      date: newDate,
      type: "",
      referenceno: "",
      name: "",
      description: "",
      mode_of_payment: "",
      gcash_referenceno: "",
      bank: "",
      bank_date: "",
      checkno: "",
      amount: "",
    });
  }, [selectedDate]);


  const fetchTransactionHistory = async () => {
    try {
      isLoading();

      const params = new URLSearchParams({
        keyword: search || "",
      });

      const response = await fetch(`/api/transactionhistory?${params.toString()}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch transaction history");
      }

      const data = await response.json();
      setMonitoringDataHistory(data.records || []);
    } catch (error) {
      console.error("Search error:", error);
      setMonitoringDataHistory([]);
    } finally {
      stopLoading();
    }
  }


  const highlightText = (text) => {
    if (!text || !search) return text;

    const regex = new RegExp(`(${search})`, "gi");

    return text.toString().split(regex).map((part, index) =>
      part.toLowerCase() === search.toLowerCase() ? (
        <mark key={index} className="bg-yellow-200 px-1 rounded">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };



  const cashAvailable = ((totalSales+totalCreditCollection+grandTotalPettyCash)-totalOut);
  const cashAvailableHistory = ((totalSalesHistory+totalCreditCollectionHistory+grandTotalPettyCashHistory)-totalOutHistory);

  return (
    <> 
    <div className="flex items-center font-medium border-b border-slate-300 w-full">
      <main className="px-4 flex-1 mx-auto py-4"><h1 className='text-2xl font-bold'>General Sales Record</h1></main>
    </div>
    <div className="flex items-center font-medium flex-1 mx-auto py-4 ">
      <main className="flex-1 mx-auto p-4">
        <div className={`overflow-x-auto transition-all duration-75 min-w-0 mx-auto ${isMediumScreen ? "w-[calc(100vw-19rem)]" : "w-[calc(100vw-6rem)]"}`}>
          <div className="bg-gray-50 shadow-md border">
            <div className="p-6 text-gray-900 dark:text-gray-100">
              <div className="text-left caption-top dark:text-gray-800">
                <div className="flex flex-col py-2">
                  <div className="flex w-full"><h1>Sales Record</h1></div>
                  <div className='flex flex-row justify-end mb-6'>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => { setOpenAddDial(true); setFormData({}); setErrors(false)}} className="h-fit flex flex-row primary-btn py-3 px-3 text-sm tracking-wider font-semibold rounded-md text-white bg-gray-800 hover:bg-gray-600 focus:outline-none"><FaRegFile size={20}/></button>
                      <button type="button" onClick={() => { setOpenSearchDial(true); setFormData({}); setErrors(false)}} className="h-fit flex flex-row primary-btn py-3 px-3 text-sm tracking-wider font-semibold rounded-md text-white bg-gray-800 hover:bg-gray-600 focus:outline-none"><FaSearch size={20}/></button>
                    </div> 
                  </div>
                    {/* <p className="text-center text-2xl font-bold mb-4 text-gray-600">{new Date().toLocaleDateString("en-US")}</p> */}
                    <div className='flex justify-center'>
                      <DatePicker
                        selected={selectedDate}
                        onChange={(date) => {
                          if (!date) return;
                          setSelectedDate(date);
                          const d = format(date, "M/d/yyyy");
                          setPettyCash((prev) => ({ ...prev, date: d }));
                          setCashCount((prev) => ({ ...prev, date: d }));
                          setMonitoring((prev) => ({ ...prev, date: d }));
                        }}
                        dateFormat="M/d/yyyy"
                        className="
                          mb-4
                          w-[200px]
                          px-3 py-2
                          text-center
                          text-2xl font-bold
                          focus:outline-none
                          focus:ring-blue-200
                          bg-transparent
                        "
                        placeholderText="MM/DD/YYYY"
                      />

                    </div>
                    <div className="w-full flex flex-col lg:flex-row gap-4">
                      {/* Petty Cash (In) */}
                      <div className="relative p-4 w-full lg:w-1/3 border shadow-sm bg-white">
                        <h4 className="text-center font-semibold">Petty Cash (In)</h4>
                        <button
                          type="button"
                          onClick={() => {
                            setOpenPettyDial(true);
                            setFormData({});
                            setErrors(false);
                          }}
                          className="absolute top-2 right-2 flex flex-row py-1 px-1 text-sm tracking-wider font-semibold rounded-md text-white bg-gray-800 hover:bg-gray-600 focus:outline-none"
                        >
                          <MdEdit size={10} />
                        </button>

                        <div className="mt-4 overflow-x-auto">
                        {pettyCashEntries.length > 0 ? (
                          pettyCashEntries.map((entry, idx) => (
                            <table key={idx} className="w-full border text-xs mb-4">
                              <thead className="bg-gray-100">
                                {/* Entry header */}
                                <tr>
                                  <th colSpan="5" className="px-2 py-1 font-semibold">
                                    <div className="flex justify-between">
                                      <span>{`Entry #${idx + 1}`}</span>
                                      <span>{new Date(entry.created_at).toLocaleTimeString()}</span>
                                    </div>
                                  </th>
                                </tr>

                                {/* Table headers only for the first entry */}
                                {idx === 0 && (
                                  <tr>
                                    <th className="border px-2 py-1 text-right">Denomination</th>
                                    <th className="border px-2 py-1 text-center">×</th>
                                    <th className="border px-2 py-1 text-center">Qty</th>
                                    <th className="border px-2 py-1 text-center">=</th>
                                    <th className="border px-2 py-1 text-right">Amount</th>
                                  </tr>
                                )}
                              </thead>
                              <tbody>
                                {/* Display items only for the first entry */}
                                {idx === 0 &&
                                entry.items.map((item, i) => (
                                  <tr key={i}>
                                    <td className="border px-2 py-1 text-right">{item.denomination.toLocaleString()}</td>
                                    <td className="border px-2 py-1 text-center">x</td>
                                    <td className="border px-2 py-1 text-center">{item.quantity}</td>
                                    <td className="border px-2 py-1 text-center">=</td>
                                    <td className="border px-2 py-1 text-right">
                                      {item.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </td>
                                  </tr>
                                ))}

                                {/* Total row for every entry */}
                                <tr className="font-semibold">
                                  <td colSpan="4" className="border px-2 py-1 text-right">
                                    {idx === 0 ? "Entry Total" : "Total"}
                                  </td>
                                  <td className="border px-2 py-1 text-right">
                                    {entry.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          ))
                        ) : (
                          // Fallback table when no entries exist
                          <table className="w-full border text-xs">
                            <thead className="bg-gray-100">
                              <tr>
                                <th className="border px-2 py-1 text-right">Denomination</th>
                                <th className="border px-2 py-1 text-center">×</th>
                                <th className="border px-2 py-1 text-center">Qty</th>
                                <th className="border px-2 py-1 text-center">=</th>
                                <th className="border px-2 py-1 text-right">Amount</th>
                              </tr>
                            </thead>
                            <tbody>
                              {denominations.map((denom, i) => (
                                <tr key={i}>
                                  <td className="border px-2 py-1 text-right">{denom.toLocaleString()}</td>
                                  <td className="border px-2 py-1 text-center">x</td>
                                  <td className="border px-2 py-1 text-center">0</td>
                                  <td className="border px-2 py-1 text-center">=</td>
                                  <td className="border px-2 py-1 text-right">0.00</td>
                                </tr>
                              ))}
                              <tr className="bg-gray-100 font-semibold">
                                <td colSpan="4" className="border px-2 py-1 text-right">
                                  Total
                                </td>
                                <td className="border px-2 py-1 text-right">
                                  0.00
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        )}
                        </div>
                        {/* Grand total at the bottom, only if entries exist */}
                        {pettyCashEntries.length > 0 && (
                          <div className="text-right font-bold mr-1">
                            Grand Total:{" "}
                            {grandTotalPettyCash.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </div>
                        )}
                      </div>

                      {/* Monitoring */}
                      <div className="relative p-4 w-full lg:w-1/3 border shadow-sm bg-white">
                        <h4 className="text-center font-semibold">Monitoring</h4>
                        <div className="fixed bottom-6 right-6 z-50 group">
                          <button
                            type="button"
                            onClick={() => {
                              setOpenMonitoringDial(true);
                              setFormData({});
                              setErrors(false);
                            }}
                            className="
                              w-12 h-12
                              flex items-center justify-center
                              text-white
                              bg-gray-800 hover:bg-gray-600
                              rounded-full
                              shadow-lg
                              focus:outline-none
                              transition duration-200
                              transform hover:scale-110
                            "
                          >
                            <MdEdit size={24} />
                          </button>

                          {/* Tooltip */}
                          <span className="
                            absolute right-full mr-2 bottom-1/2 translate-y-1/2
                            px-2 py-2
                            text-xs font-semibold
                            text-white
                            bg-gray-700
                            rounded
                            opacity-0
                            group-hover:opacity-100
                            transition-opacity duration-200
                            whitespace-nowrap
                          ">
                            Add Transaction
                          </span>
                        </div>

                        <div className="mt-4 mb-2 overflow-x-auto">
                          <table className="min-w-full border border-gray-300 text-xs">
                            <thead className="bg-gray-100">
                              <tr>
                                <th className="border px-2 py-1 text-center w-1/2">Particulars</th>
                                <th className="border px-2 py-1 text-center w-1/2">Amount</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td className="border px-2 py-1 text-right">Sales:</td>
                                <td className="border px-2 py-1 text-right">{totalSales.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                              </tr>
                              <tr>
                                <td className="border px-2 py-1 text-right">Credit Collection:</td>
                                <td className="border px-2 py-1 text-right">{totalCreditCollection.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                              </tr>
                              <tr>
                                <td className="border px-2 py-1 text-right">Cash Out:</td>
                                <td className="border px-2 py-1 text-right"><span className='text-red-500 font-bold'>(</span> {totalOut.toLocaleString(undefined, { minimumFractionDigits: 2 })} <span className='text-red-500 font-bold'>)</span></td>
                              </tr>
                              <tr>
                                <td className="border px-2 py-1 text-right">Total Cash Available:</td>
                                <td className="border px-2 py-1 text-right border-t-2 border-t-slate-400 border-b-2 border-b-slate-400 font-bold">{(cashAvailable).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                              </tr>
                              <tr>
                                <td className="border px-2 py-1 text-right">Cash Count (Out):</td>
                                <td className="border px-2 py-1 text-right">
                                  {totalCashCount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </td>
                              </tr>
                              <tr>
                                <td className="border px-2 py-1 text-right">Difference:</td>
                                <td className="border px-2 py-1">
                                  <div className='flex flex-row'>
                                    <div
                                      className={`flex justify-start w-full px-2 rounded 
                                        ${cashAvailable === totalCashCount
                                          ? "bg-green-500 text-white"
                                          : cashAvailable > totalCashCount
                                          ? "bg-red-500 text-white"
                                          : "bg-yellow-500 text-white"
                                        }`}
                                    >
                                      {cashAvailable === totalCashCount
                                        ? "TALLY"
                                        : cashAvailable > totalCashCount
                                        ? "SHORT"
                                        : "OVER"}
                                    </div>
                                    <div className='flex justify-end w-full'>
                                      {(() => {
                                        const diff = totalCashCount - cashAvailable;
                                        const formatted = Math.abs(diff).toLocaleString(undefined, {
                                          minimumFractionDigits: 2,
                                        });

                                        if (diff < 0) {
                                          return (
                                            <>
                                              <span className="text-red-500 font-bold">(&nbsp;</span>{formatted}<span className="text-red-500 font-bold">&nbsp;)</span>
                                            </>
                                          );
                                        } else if (diff > 0) {
                                          return `+${formatted}`;
                                        } else {
                                          return formatted;
                                        }
                                      })()}
                                    </div>
                                  </div>
                                </td>
                              </tr>
                              <tr>
                                <td className="border px-2 py-1 text-right">Total Credit:</td>
                                <td className="border px-2 py-1 text-right">{totalCredit.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Cash Count (Out) */}
                      <div className="relative p-4 w-full lg:w-1/3 border shadow-sm bg-white">
                        <h4 className="text-center font-semibold">Cash Count (Out)</h4>
                        <button
                          type="button"
                          onClick={() => {
                            setOpenCashDial(true);
                            setFormData({});
                            setErrors(false);
                          }}
                          className="absolute top-2 right-2 flex flex-row py-1 px-1 text-sm tracking-wider font-semibold rounded-md text-white bg-gray-800 hover:bg-gray-600 focus:outline-none"
                        >
                          <MdEdit size={10} />
                        </button>

                        <div className="mt-4 mb-2 overflow-x-auto">
                          <table className="min-w-full border border-gray-300 text-xs">
                            <thead className="bg-gray-100">
                              <tr>
                                <th className="border px-2 py-1 text-right">Denomination</th>
                                <th className="border px-2 py-1 text-center">×</th>
                                <th className="border px-2 py-1 text-center">Qty</th>
                                <th className="border px-2 py-1 text-center">=</th>
                                <th className="border px-2 py-1 text-right">Amount</th>
                              </tr>
                            </thead>
                            <tbody>
                              {cashCount.items.map((rec, i) => (
                                <tr key={rec.denomination || i}>
                                  <td className="border px-2 py-1 text-right">{rec.denomination}</td>
                                  <td className="border px-2 py-1 text-center">x</td>
                                  <td className="border px-2 py-1 text-center w-16">{rec.quantity || "0"}</td>
                                  <td className="border px-2 py-1 text-center">=</td>
                                  <td className="border px-2 py-1 text-right">
                                    {rec.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                  </td>
                                </tr>
                              ))}
                              <tr className="bg-gray-100 font-semibold">
                                <td colSpan="4" className="border px-2 py-1 text-right">
                                  Total
                                </td>
                                <td className="border px-2 py-1 text-right">
                                  {totalCashCount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
                <div className='text-gray-800 text-sm relative mb-4'>
                </div>
                <div className=" py-3 text-gray-800 font-bold">Transaction Log</div>
                <div className="overflow-auto">
                  <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400 overflow-hidden">
                  {/* {message && <p className="error opacity-100 delay-300 text-blue-700 text-left ml-2">{message}</p>} */}
                  <thead className="text-xs text-center uppercase bg-gray-200 text-gray-800 border-b border-t border-gray-300">
                    <tr className="text-nowrap border-gray-300 border-b">
                      
                    </tr>
                    <tr className="text-nowrap">
                      <th className="px-3 py-3 w-1/12">No.</th>
                      <th className="px-3 py-3 w-1/12">Type</th>
                      <th className="px-3 py-3 w-1/12 whitespace-nowrap">Reference No.</th>
                      <th className="px-3 py-3">Name & Description</th>
                      <th className="px-3 py-3 w-1/12">Sales</th>
                      <th className="px-3 py-3 w-1/12 whitespace-nowrap">Credit Col.</th>
                      <th className="px-3 py-3 w-1/12">Credit</th>
                      <th className="px-3 py-3 w-1/12">Out</th>
                      <th className="px-1 py-3 text-center">-</th>
                    </tr>
                    </thead>
                    <tbody className="text-xs text-center bg-gray-50 dark:bg-gray-700 dark:text-gray-800 border-b-2 border-gray-300">
                      {monitoringData.length > 0 ? (monitoringData.map((rec, i) => (
                      <tr key={rec.id} className="text-xs bg-white border-b dark:bg-gray-100 dark:border-gray-300 hover:bg-gray-50">     
                        <th className="px-3 py-3">{i+1}.</th>
                        <td className="px-3 py-3">{rec.type}</td>  
                        <td className="px-3 py-3">
                          {rec.referenceno}
                          {rec.gcash_referenceno ? <><br />{rec.gcash_referenceno}</> : ""}
                        </td>  
                        <td className="px-3 py-3">{rec.name} - {rec.description}</td>  
                        <td className="px-3 py-3">{(rec.type === "Sales" || rec.type === "Sales-P") ? rec.amount.toLocaleString(undefined, { minimumFractionDigits: 2 }) : ""}</td>  
                        <td className="px-3 py-3">{rec.type === "Credit Collection" ? rec.amount.toLocaleString(undefined, { minimumFractionDigits: 2 }) : ""}</td>  
                        <td className="px-3 py-3">{rec.type === "Credit" ? rec.amount.toLocaleString(undefined, { minimumFractionDigits: 2 }) : ""}</td>  
                        <td className="px-3 py-3 whitespace-nowrap">
                          {((rec.type === "Out") || (rec.mode_of_payment === "GCash") || (rec.mode_of_payment === "Check") || (rec.mode_of_payment === "BankTransfer"))  && (
                            <>
                              <span className="text-red-500 font-bold">(</span> {rec.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })} <span className="text-red-500 font-bold">)</span>
                            </>
                          )}
                        </td>
                        <td className='px-1 py-1'>
                          <button onClick={(e) => deleteTransaction(e, rec.id)} className="primary-btn text-sm tracking-wider font-semibold rounded-md">
                          <FaRegTrashAlt size={20} className="text-red-600"/></button>
                        </td>
                      </tr>
                      ))) : (
                      <tr className='text-xs bg-white border-b dark:bg-gray-100 dark:border-gray-300'>
                        <td className='px-3 py-3 text-center' colSpan={15}>No Record</td>
                      </tr>
                      )}
                     </tbody>                        
                  </table>
                </div> 
            </div>
          </div>
        </div>  
      </main> 
    </div>

    {/* Add Petty Cash */}
    <Dialog open={openPettyDial} onClose={setOpenPettyDial} className="relative z-[999]">
      <DialogBackdrop
          transition
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
      />

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <DialogPanel transition className="relative transform overflow-hidden transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-lg data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"> 

            <div className="flex flex-col font-[sans-serif]">
                <div className="w-full mx-auto border border-gray-300 p-8 bg-gray-50">
                  <div className="text-center">
                    <h1 className="text-xl text-left pb-2 flex"> Add Petty Cash </h1>
                    <form onSubmit={confirmAdd} className="w-full mx-auto">
                      {errors?.petty_cash && (
                        <div className="bg-red-100 text-red-700 text-xs px-3 py-2 rounded">
                          {errors.petty_cash[0]}
                        </div>
                      )}
                      <div className="flex flex-row p-2">
                        <table className="p-2 w-full border border-gray-300 text-xs">
                          <thead className="bg-gray-100">
                            <tr>
                              <th className="border px-2 py-2 text-right">Denomination</th>
                              <th className="border px-2 py-2 text-center">x</th>
                              <th className="border px-2 py-2 text-center">Qty</th>
                              <th className="border px-2 py-2 text-center">=</th>
                              <th className="border px-2 py-2 text-right">Amount</th>
                            </tr>
                          </thead>
                          <tbody>
                            {pettyCashItems.map((item, i) => (
                              <tr key={item.denomination}>
                                <td className="border px-2 py-1 text-right">
                                  {item.denomination.toLocaleString()}
                                </td>
                                <td className="border px-2 py-1 text-center">x</td>
                                <td className="border px-2 py-1 text-center w-16">
                                  <input
                                    type="text"
                                    className="w-16 py-1 text-center border border-gray-300 rounded"
                                    placeholder="0"
                                    value={item.quantity}
                                    onChange={(e) => handleQtyPettyCash(i, e.target.value)}
                                  />
                                </td>
                                <td className="border px-2 py-1 text-center">=</td>
                                <td className="border px-2 py-1 text-right">
                                  {item.amount.toLocaleString(undefined, {
                                    minimumFractionDigits: 2,
                                  })}
                                </td>
                              </tr>
                            ))}

                            <tr className="bg-gray-100 font-semibold">
                              <td colSpan="4" className="border px-2 py-1 text-right">Total</td>
                              <td className="border px-2 py-1 text-right">
                                {grandTotal_pettyCash.toLocaleString(undefined, {
                                  minimumFractionDigits: 2,
                                })}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                      <div className="!mt-8 float-right">
                        <button className="primary-btn py-2 px-3 text-sm font-semibold rounded-md text-white bg-gray-800 hover:bg-gray-600">
                          Add Cash
                        </button>
                      </div>
                    </form>
                      <div className="!mt-8 float-right">
                        <button onClick={() => setOpenPettyDial(false)} className="primary-btn py-2 px-3 mr-2 text-sm tracking-wider font-semibold rounded-md text-white bg-gray-500 hover:bg-gray-600 focus:outline-none"> Cancel </button>
                      </div>
                    </div>
                  </div>
                </div>
            </DialogPanel>
          </div>
      </div>
    </Dialog>


    {/* Add Cash Count */}
    <Dialog open={openCashDial} onClose={setOpenCashDial} className="relative z-[999]">
      <DialogBackdrop
          transition
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
      />

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <DialogPanel transition className="relative transform overflow-hidden transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-lg data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"> 

            <div className="flex flex-col font-[sans-serif]">
                <div className="w-full mx-auto border border-gray-300 p-8 bg-gray-50">
                  <div className="text-center">
                    <h1 className="text-xl text-left pb-2 flex"> Add Cash Count </h1>
                    
                    <form onSubmit={addCashCount} className='w-full mx-auto space-y-6'>
                      <div className='flex flex-row p-2'>
                        <table className="p-2 w-full border border-gray-300 text-xs">
                            <thead className="bg-gray-100">
                              <tr>
                                <th className="border px-2 py-2 text-right">Denomination</th>
                                <th className="border px-2 py-2 text-center">x</th>
                                <th className="border px-2 py-2 text-center">Qty</th>
                                <th className="border px-2 py-2 text-center">=</th>
                                <th className="border px-2 py-2 text-right">Amount</th>
                              </tr>
                            </thead>
                            <tbody>
                              {cashCount.items.map((item, i) => (
                                <tr key={item.denomination}>
                                  <td className="border px-2 py-1 text-right">
                                    {item.denomination.toLocaleString()}
                                  </td>
                                  <td className="border px-2 py-1 text-center">x</td>
                                  <td className="border px-2 py-1 text-center w-16">
                                    <input
                                      type="text"
                                      className="w-16 py-1 text-center border border-gray-300 rounded"
                                      placeholder="0"
                                      value={item.quantity}
                                      onChange={(e) => handleQtyCashCount(i, e.target.value)}
                                    />
                                  </td>
                                  <td className="border px-2 py-1 text-center">=</td>
                                  <td className="border px-2 py-1 text-right">
                                    {item.amount.toLocaleString(undefined, {
                                      minimumFractionDigits: 2,
                                    })}
                                  </td>
                                </tr>
                              ))}
                              <tr className="bg-gray-100 font-semibold">
                                <td colSpan="4" className="border px-2 py-1 text-right">
                                  Total
                                </td>
                                <td className="border px-2 py-1 text-right">
                                  {grandTotal_cashCount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </td>
                              </tr>
                            </tbody>
                          </table>
                      </div>
                        <div className="!mt-8 float-right">
                          <button className="primary-btn py-2 px-3 text-sm tracking-wider font-semibold rounded-md text-white bg-gray-800 hover:bg-gray-600 focus:outline-none"> Add Cash </button>
                        </div> 
                    </form>
                        <div className="!mt-8 float-right">
                          <button onClick={() => setOpenCashDial(false)} className="primary-btn py-2 px-3 mr-2 text-sm tracking-wider font-semibold rounded-md text-white bg-gray-500 hover:bg-gray-600 focus:outline-none"> Cancel </button>
                        </div>
                    </div>
                  </div>
                </div>
            </DialogPanel>
          </div>
      </div>
    </Dialog>


    {/* Add Monitoring */}
    <Dialog open={openMonitoringDial} onClose={setOpenMonitoringDial} className="relative z-[999]">
      <DialogBackdrop
          transition
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
      />

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <DialogPanel transition className="relative transform overflow-hidden transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-lg data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"> 

            <div className="flex flex-col font-[sans-serif]">
                <div className="w-full mx-auto border border-gray-300 p-8 bg-gray-50">
                  <div className="text-center">
                    <h1 className="text-xl text-left pb-2 flex"> Add Transaction </h1>
                    
                    <form onSubmit={addMonitoring} className='w-full mx-auto space-y-6'>
                      <div className='flex flex-row p-2'>
                        <table className="p-2 w-full border border-gray-300 text-xs text-gray-800">
                          <thead className="bg-gray-100">
                            <tr>
                              <th className="border px-2 py-1 text-center w-1/2">Particulars</th>
                              <th className="border px-2 py-1 text-center w-1/2">Amount</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td className="border px-2 py-1 text-right" valign='top'>Type:</td>
                              <td className="border px-2 py-1 text-right">
                                <select
                                  value={monitoring.type}
                                  onChange={(e) => setMonitoring({...monitoring, type: e.target.value})}
                                  className="border rounded p-1 w-2/3"
                                >
                                  <option value="">Select</option>
                                  <option value="Sales">Sales</option>
                                  <option value="Sales-P">Sales-P</option>
                                  <option value="Credit Collection">Credit Collection</option>
                                  <option value="Credit">Credit</option>
                                  <option value="Out">Out</option>
                                </select>
                                  {errors.type && <p className="error text-red-700 text-right ml-2 mt-1">{errors.type[0]}</p>}
                              </td>
                            </tr>
                            <tr>
                              <td className="border px-2 py-1 text-right">Reference No:</td>
                              <td className="border px-2 py-1 text-right align-top">
                                <div className="flex flex-col gap-2 items-end">
                                  {/* First input row with + button */}
                                  <div className="flex items-center gap-2 justify-end w-full">
                                    <button
                                      type="button"
                                      onClick={handleAddRef}
                                      className="flex items-center justify-center w-4 h-4 bg-green-600 hover:bg-green-500 text-white rounded"
                                      title="Add reference"
                                    >
                                      <MdAdd size={11} />
                                    </button>
                                    <input
                                      type="text"
                                      value={references[0] || ""}
                                      onChange={(e) => handleChangeRef(0, e.target.value)}
                                      className="w-2/3 py-1 px-2 text-left border border-gray-300 rounded"
                                      placeholder="Reference No. 1"
                                    />
                                  </div>

                                  {/* Render additional inputs (each with delete button) */}
                                  {references.slice(1).map((ref, i) => (
                                    <div key={i + 1} className="flex items-center gap-2 justify-end w-full">
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteRef(i + 1)}
                                        className="flex items-center justify-center w-4 h-4 bg-red-600 hover:bg-red-500 text-white rounded"
                                        title="Remove reference"
                                      >
                                        <MdDelete size={11} />
                                      </button>
                                      <input
                                        type="text"
                                        value={ref}
                                        onChange={(e) => handleChangeRef(i + 1, e.target.value)}
                                        className="w-2/3 py-1 px-2 text-left border border-gray-300 rounded"
                                        placeholder={`Reference No. ${i + 2}`}
                                      />
                                    </div>
                                  ))}
                                </div>

                                {errors.referenceno && (
                                  <p className="error text-red-700 text-right ml-2 mt-1">
                                    {errors.referenceno[0]}
                                  </p>
                                )}
                              </td>
                            </tr>
                            <tr>
                              <td className="border px-2 py-1 text-right">Name:</td>
                              <td className="border px-2 py-1 text-right">
                                <input
                                  type="text"
                                  value={monitoring.name}
                                  onChange={(e) => setMonitoring({ ...monitoring, name: e.target.value })}
                                  min="0"
                                  className="w-2/3 py-1 px-2 text-left border border-gray-300 rounded"
                                  placeholder="Name"                                
                                />
                                {errors.name && <p className="error text-red-700 text-right ml-2 mt-1">{errors.name[0]}</p>}
                              </td>
                            </tr>
                            <tr>
                              <td className="border px-2 py-1 text-right">Description:</td>
                              <td className="border px-2 py-1 text-right">
                                <input
                                  type="text"
                                  value={monitoring.description}
                                  onChange={(e) => setMonitoring({ ...monitoring, description: e.target.value })}
                                  min="0"
                                  className="w-2/3 py-1 px-2 text-left border border-gray-300 rounded"
                                  placeholder="Description"                                
                                />
                                {errors.description && <p className="error text-red-700 text-right ml-2 mt-1">{errors.description[0]}</p>}
                              </td>
                            </tr>
                            <tr>
                              <td className="border px-2 py-1 text-right">Mode of Payment:</td>
                              <td className="border px-2 py-1 text-right">
                                <select
                                  value={monitoring.mode_of_payment}
                                  onChange={(e) => setMonitoring({...monitoring, mode_of_payment: e.target.value})}
                                  className="border rounded p-1 w-2/3"
                                >
                                  <option value="">Select</option>
                                  <option value="Cash">Cash</option>
                                  <option value="GCash">GCash</option>
                                  <option value="Check">Check</option>
                                  <option value="BankTransfer">Bank Transfer</option>
                                </select>
                                  {errors.mode_of_payment && <p className="error text-red-700 text-right ml-2 mt-1">{errors.mode_of_payment[0]}</p>}
                              </td>
                            </tr>
                            {(monitoring.mode_of_payment === "BankTransfer") && (
                            <>
                            <tr>
                              <td className="border px-2 py-1 text-right">Receiving Bank:</td>
                              <td className="border px-2 py-1 text-right">
                                <input
                                  type="text"
                                  value={monitoring.receiving_bank}
                                  onChange={(e) => setMonitoring({ ...monitoring, receiving_bank: e.target.value })}
                                  min="0"
                                  className="w-2/3 py-1 px-2 text-left border border-gray-300 rounded"
                                  placeholder="Receiving Bank"                                
                                />
                              </td>
                            </tr>
                            <tr>
                              <td className="border px-2 py-1 text-right">Reference No:</td>
                              <td className="border px-2 py-1 text-right">
                                <input
                                  type="text"
                                  value={monitoring.bank_transfer_refno}
                                  onChange={(e) => setMonitoring({ ...monitoring, bank_transfer_refno: e.target.value })}
                                  min="0"
                                  className="w-2/3 py-1 px-2 text-left border border-gray-300 rounded"
                                  placeholder="Reference No."                                
                                />
                              </td>
                            </tr>
                            </>
                            )}
                            {(monitoring.mode_of_payment === "GCash") && (
                            <tr>
                              <td className="border px-2 py-1 text-right">GCash Reference No.:</td>
                              <td className="border px-2 py-1 text-right">
                                <input
                                  type="text"
                                  value={monitoring.gcash_referenceno}
                                  onChange={(e) => setMonitoring({ ...monitoring, gcash_referenceno: e.target.value })}
                                  className="w-2/3 py-1 px-2 text-left border border-gray-300 rounded"
                                  placeholder="Reference No."                                
                                />
                              </td>
                            </tr>
                            )}
                            {(monitoring.mode_of_payment === "Check") && (
                              <>
                            <tr>
                              <td className="border px-2 py-1 text-right">Bank:</td>
                              <td className="border px-2 py-1 text-right">
                                <input
                                  type="text"
                                  value={monitoring.bank}
                                  onChange={(e) => setMonitoring({ ...monitoring, bank: e.target.value })}
                                  className="w-2/3 py-1 px-2 text-left border border-gray-300 rounded"
                                  placeholder="Bank"                                
                                />
                              </td>
                            </tr>
                            <tr>
                              <td className="border px-2 py-1 text-right">Date:</td>
                              <td className="border px-2 py-1 text-right">
                                <DatePicker
                                  selected={monitoring.bank_date ? new Date(monitoring.bank_date) : null}
                                  onChange={(bank_date) =>
                                    setMonitoring((prev) => ({
                                      ...prev,
                                      bank_date: bank_date ? format(bank_date, "MM/dd/yyyy") : "",
                                    }))
                                  }
                                  dateFormat="MM/dd/yyyy"
                                  className="w-2/3 py-1 px-2 text-left border border-gray-300 rounded"
                                  placeholderText="MM/DD/YYYY"
                                />
                              </td>
                            </tr>
                            <tr>
                              <td className="border px-2 py-1 text-right">Check No.:</td>
                              <td className="border px-2 py-1 text-right">
                                <input
                                  type="text"
                                  value={monitoring.checkno}
                                  onChange={(e) => setMonitoring({ ...monitoring, checkno: e.target.value })}
                                  className="w-2/3 py-1 px-2 text-left border border-gray-300 rounded"
                                  placeholder="Check No."                                
                                />
                              </td>
                            </tr>
                            </>
                            )}
                            <tr>
                              <td className="border px-2 py-1 text-right">Amount:</td>
                              <td className="border px-2 py-1 text-right">
                                <input
                                  type="text"
                                  value={monitoring.amount}
                                  onChange={(e) => setMonitoring({ ...monitoring, amount: e.target.value })}
                                  className="w-2/3 py-1 px-2 text-left border border-gray-300 rounded"
                                  placeholder="0.00"                                
                                />
                                {errors.amount && <p className="error text-red-700 text-right ml-2 mt-1">{errors.amount[0]}</p>}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                        <div className="!mt-8 float-right">
                          <button className="primary-btn py-2 px-3 text-sm tracking-wider font-semibold rounded-md text-white bg-gray-800 hover:bg-gray-600 focus:outline-none"> Add Cash </button>
                        </div> 
                    </form>
                        <div className="!mt-8 float-right">
                          <button onClick={() => setOpenMonitoringDial(false)} className="primary-btn py-2 px-3 mr-2 text-sm tracking-wider font-semibold rounded-md text-white bg-gray-500 hover:bg-gray-600 focus:outline-none"> Cancel </button>
                        </div>
                    </div>
                  </div>
                </div>
            </DialogPanel>
          </div>
      </div>
    </Dialog>


    <Dialog open={openAddDial} onClose={setOpenAddDial} className="relative z-[999]">
      <DialogBackdrop
          transition
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
      />

      <div className="fixed inset-0 z-10 w-screen">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <DialogPanel transition className="relative transform overflow-y-auto max-h-[90vh] transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-7xl data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"> 

              <div className="flex flex-col font-[sans-serif]">
                <div className="w-full mx-auto border border-gray-300 p-6 bg-gray-50">
                  <div className="text-center mb-4">
                    <h1 className="text-2xl text-left pb-2 flex"><FaRegFile size={38}/></h1>
                    <hr className='pb-4'/>
                    
                    <div className="max-w-6xl mx-auto mb-20">
                      <div className="flex flex-col md:flex-row items-start md:items-end gap-4 mb-5 text-left ">

                          {/* Date Picker */}
                          <div className="flex flex-col w-full md:w-1/4">
                            <label className="mb-1 font-medium text-sm">Select Date</label>
                            <DatePicker
                              selected={historyDate ? new Date(historyDate) : null}
                              onChange={(date) => 
                                setHistoryDate(date ? format(date, "M/d/yyyy") : "")
                              }
                              dateFormat="M/d/yyyy"
                              className="
                                w-full min-w-[90px]
                                px-3 py-2 
                                border border-gray-300 
                                rounded-md 
                                bg-white 
                                focus:outline-none 
                                focus:ring-1 
                                focus:ring-blue-400 
                                text-sm text-gray-800
                                relative z-[998]
                              "
                              placeholderText="MM/DD/YYYY"
                            />
                          </div>
                              
                          {/* Encoder Select */}
                          <div className="flex flex-col w-full md:w-1/4">
                            <label className="mb-1 font-medium text-sm">Select Encoder</label>
                            <select
                              name="encoder"
                              value={encoder}
                              onChange={(e) => setEncoder(e.target.value)}
                              className="
                                w-full 
                                px-3 py-2 
                                border border-gray-300 
                                rounded-md 
                                bg-white 
                                text-sm 
                                focus:outline-none 
                                focus:ring-1 
                                focus:ring-blue-400
                              "
                            >
                              <option value="">Select Encoder</option>

                              {uniqueEncoders.length > 0 ? (
                                uniqueEncoders.map((enc, i) => (
                                  <option key={enc.encoder + "-" + i} value={enc.encoder}>
                                    {enc.encoder_name}
                                  </option>
                                ))
                              ) : (
                                <option value="">No Record</option>
                              )}
                            </select>
                          </div>
                        </div>
                        <hr className='pb-8'/>
                        
                          <div className="w-full flex flex-col lg:flex-row gap-4">
                            {/* Petty Cash (In) */}
                            <div className="relative p-4 w-full lg:w-1/3 border shadow-sm bg-white">
                              <h4 className="text-center font-semibold">Petty Cash (In)</h4>
                              <div className="mt-4 mb-2 overflow-x-auto">
                                <table className="min-w-full border border-gray-300 text-xs">
                                  <thead className="bg-gray-100">
                                    {pettyCashHistory.entries.length === 0 && (
                                      <tr>
                                        <th className="border px-2 py-1 text-right">Denomination</th>
                                        <th className="border px-2 py-1 text-center">×</th>
                                        <th className="border px-2 py-1 text-center">Qty</th>
                                        <th className="border px-2 py-1 text-center">=</th>
                                        <th className="border px-2 py-1 text-right">Amount</th>
                                      </tr>
                                    )}
                                  </thead>
                                  <tbody>
                                  {pettyCashHistory.entries.map((entry, idx) => (
                                    <React.Fragment key={idx}>
                                      {/* Entry header */}
                                      <tr className="bg-gray-50 font-semibold">
                                        <td colSpan="5" className="border px-2 py-1">
                                          <div className="flex justify-between">
                                            <span>Entry #{idx + 1}</span>
                                            <span className="text-xs text-gray-600">
                                              {new Date(entry.created_at).toLocaleTimeString()}
                                            </span>
                                          </div>
                                        </td>
                                      </tr>

                                      {/* FULL breakdown only for FIRST entry */}
                                      {idx === 0 && (
                                        <>
                                          <tr className="bg-gray-100">
                                            <th className="border px-2 py-1 text-right">Denomination</th>
                                            <th className="border px-2 py-1 text-center">×</th>
                                            <th className="border px-2 py-1 text-center">Qty</th>
                                            <th className="border px-2 py-1 text-center">=</th>
                                            <th className="border px-2 py-1 text-right">Amount</th>
                                          </tr>

                                          {denominations.map((denom, i) => {
                                            const rec =
                                              entry.items.find((x) => x.denomination === denom) || {
                                                quantity: 0,
                                                amount: 0,
                                              };

                                            return (
                                              <tr key={i}>
                                                <td className="border px-2 py-1 text-right">
                                                  {denom.toLocaleString()}
                                                </td>
                                                <td className="border px-2 py-1 text-center">×</td>
                                                <td className="border px-2 py-1 text-center">
                                                  {rec.quantity}
                                                </td>
                                                <td className="border px-2 py-1 text-center">=</td>
                                                <td className="border px-2 py-1 text-right">
                                                  {rec.amount.toLocaleString(undefined, {
                                                    minimumFractionDigits: 2,
                                                  })}
                                                </td>
                                              </tr>
                                            );
                                          })}
                                        </>
                                      )}

                                      {/* Entry total */}
                                      <tr className="bg-gray-100 font-semibold">
                                        <td colSpan="4" className="border px-2 py-1 text-right">
                                          Entry Total
                                        </td>
                                        <td className="border px-2 py-1 text-right">
                                          {entry.total.toLocaleString(undefined, {
                                            minimumFractionDigits: 2,
                                          })}
                                        </td>
                                      </tr>

                                      {/* spacer */}
                                      <tr>
                                        <td colSpan="5" className="h-3"></td>
                                      </tr>
                                    </React.Fragment>
                                  ))}

                                  {/* EMPTY STATE */}
                                  {pettyCashHistory.entries.length === 0 && (
                                    <>
                                      {denominations.map((denom, i) => (
                                      <tr key={i}>
                                        <td className="border px-2 py-1 text-right">
                                          {denom.toLocaleString()}
                                        </td>
                                        <td className="border px-2 py-1 text-center">x</td>
                                        <td className="border px-2 py-1 text-center">0</td>
                                        <td className="border px-2 py-1 text-center">=</td>
                                        <td className="border px-2 py-1 text-right">0.00</td>
                                      </tr>
                                      ))}
                                      <tr className="bg-gray-100 font-semibold">
                                        <td colSpan="4" className="border px-2 py-1 text-right">
                                          Total
                                        </td>
                                        <td className="border px-2 py-1 text-right">
                                          0.00
                                        </td>
                                      </tr>
                                    </>
                                  )}
                                </tbody>
                                {pettyCashHistory.entries.length > 0 && (
                                  <tfoot>
                                    <tr className="bg-gray-200 font-bold">
                                      <td colSpan="4" className="border px-2 py-2 text-right">
                                        GRAND TOTAL
                                      </td>
                                      <td className="border px-2 py-2 text-right">
                                        {grandTotalPettyCashHistory.toLocaleString(undefined, {
                                          minimumFractionDigits: 2,
                                        })}
                                      </td>
                                    </tr>
                                  </tfoot>
                                )}
                                </table>
                              </div>
                            </div>

                            {/* Monitoring */}
                            <div className="relative p-4 w-full lg:w-1/3 border shadow-sm bg-white">
                              <h4 className="text-center font-semibold">Monitoring</h4>
                              <div className="mt-4 mb-2 overflow-x-auto">
                                <table className="min-w-full border border-gray-300 text-xs">
                                  <thead className="bg-gray-100">
                                    <tr>
                                      <th className="border px-2 py-1 text-center w-1/2">Particulars</th>
                                      <th className="border px-2 py-1 text-center w-1/2">Amount</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr>
                                      <td className="border px-2 py-1 text-right">Sales:</td>
                                      <td className="border px-2 py-1 text-right">{totalSalesHistory.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                    </tr>
                                    <tr>
                                      <td className="border px-2 py-1 text-right">Credit Collection:</td>
                                      <td className="border px-2 py-1 text-right">{totalCreditCollectionHistory.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                    </tr>
                                    <tr>
                                      <td className="border px-2 py-1 text-right">Cash Out:</td>
                                      <td className="border px-2 py-1 text-right"><span className='text-red-500 font-bold'>(</span> {totalOutHistory.toLocaleString(undefined, { minimumFractionDigits: 2 })} <span className='text-red-500 font-bold'>)</span></td>
                                    </tr>
                                    <tr>
                                      <td className="border px-2 py-1 text-right">Total Cash Available:</td>
                                      <td className="border px-2 py-1 text-right border-t-2 border-t-slate-400 border-b-2 border-b-slate-400 font-bold">{(cashAvailableHistory).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                    </tr>
                                    <tr>
                                      <td className="border px-2 py-1 text-right">Cash Count (Out):</td>
                                      <td className="border px-2 py-1 text-right">
                                        {totalCashCountHistory.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                      </td>
                                    </tr>
                                    <tr>
                                      <td className="border px-2 py-1 text-right">Difference:</td>
                                      <td className="border px-2 py-1">
                                        <div className='flex flex-row'>
                                          <div
                                            className={`flex justify-start w-full px-2 rounded 
                                              ${cashAvailableHistory === totalCashCountHistory
                                                ? "bg-green-500 text-white"
                                                : cashAvailableHistory > totalCashCountHistory
                                                ? "bg-red-500 text-white"
                                                : "bg-yellow-500 text-white"
                                              }`}
                                          >
                                            {cashAvailableHistory === totalCashCountHistory
                                              ? "TALLY"
                                              : cashAvailableHistory > totalCashCountHistory
                                              ? "SHORT"
                                              : "OVER"}
                                          </div>
                                          <div className='flex justify-end w-full'>
                                            {(() => {
                                              const diff = totalCashCountHistory - cashAvailableHistory;
                                              const formatted = Math.abs(diff).toLocaleString(undefined, {
                                                minimumFractionDigits: 2,
                                              });

                                              if (diff < 0) {
                                                return (
                                                  <>
                                                    <span className="text-red-500 font-bold">(&nbsp;</span>{formatted}<span className="text-red-500 font-bold">&nbsp;)</span>
                                                  </>
                                                );
                                              } else if (diff > 0) {
                                                return `+${formatted}`;
                                              } else {
                                                return formatted;
                                              }
                                            })()}
                                          </div>
                                        </div>
                                      </td>
                                    </tr>
                                    <tr>
                                      <td className="border px-2 py-1 text-right">Total Credit:</td>
                                      <td className="border px-2 py-1 text-right">{totalCreditHistory.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>

                            {/* Cash Count (Out) */}
                            <div className="relative p-4 w-full lg:w-1/3 border shadow-sm bg-white">
                              <h4 className="text-center font-semibold">Cash Count (Out)</h4>
                              <div className="mt-4 mb-2 overflow-x-auto">
                                <table className="min-w-full border border-gray-300 text-xs">
                                  <thead className="bg-gray-100">
                                    <tr>
                                      <th className="border px-2 py-1 text-right">Denomination</th>
                                      <th className="border px-2 py-1 text-center">×</th>
                                      <th className="border px-2 py-1 text-center">Qty</th>
                                      <th className="border px-2 py-1 text-center">=</th>
                                      <th className="border px-2 py-1 text-right">Amount</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {cashCountHistory.items.map((rec, i) => (
                                      <tr key={rec.denomination || i}>
                                        <td className="border px-2 py-1 text-right">{rec.denomination}</td>
                                        <td className="border px-2 py-1 text-center">x</td>
                                        <td className="border px-2 py-1 text-center w-16">{rec.quantity || "0"}</td>
                                        <td className="border px-2 py-1 text-center">=</td>
                                        <td className="border px-2 py-1 text-right">
                                          {rec.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </td>
                                      </tr>
                                    ))}
                                    <tr className="bg-gray-100 font-semibold">
                                      <td colSpan="4" className="border px-2 py-1 text-right">
                                        Total
                                      </td>
                                      <td className="border px-2 py-1 text-right">
                                        {totalCashCountHistory.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>

                          </div>
                          <div className='text-gray-800 text-sm relative mb-4'>
                          </div>
                          <div className=" py-3 text-gray-800 font-bold text-left">Transaction Log</div>
                          <div className="overflow-auto">
                            <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400 overflow-hidden">
                            {/* {message && <p className="error opacity-100 delay-300 text-blue-700 text-left ml-2">{message}</p>} */}
                            <thead className="text-xs text-center uppercase bg-gray-200 text-gray-800 border-b border-t border-gray-300">
                              <tr className="text-nowrap border-gray-300 border-b">
                                
                              </tr>
                              <tr className="text-nowrap">
                                <th className="px-3 py-3 w-1/12">No.</th>
                                <th className="px-3 py-3 w-1/12">Type</th>
                                <th className="px-3 py-3 w-1/12 whitespace-nowrap">Reference No.</th>
                                <th className="px-3 py-3">Name & Description</th>
                                <th className="px-3 py-3 w-1/12">Sales</th>
                                <th className="px-3 py-3 w-1/12 whitespace-nowrap">Credit Col.</th>
                                <th className="px-3 py-3 w-1/12">Credit</th>
                                <th className="px-3 py-3 w-1/12">Out</th>
                              </tr>
                              </thead>
                              <tbody className="text-xs text-center bg-gray-50 dark:bg-gray-700 dark:text-gray-800 border-b-2 border-gray-300">
                                {monitoringDataHistory.length > 0 ? (monitoringDataHistory.map((rec, i) => (
                                <tr key={rec.id} className="text-xs bg-white border-b dark:bg-gray-100 dark:border-gray-300 hover:bg-gray-50">     
                                  <th className="px-3 py-3">{i+1}.</th>
                                  <td className="px-3 py-3">{rec.type}</td>  
                                  <td className="px-3 py-3">{rec.referenceno}</td>  
                                  <td className="px-3 py-3">{rec.name} - {rec.description}</td>  
                                  <td className="px-3 py-3">{(rec.type === "Sales" || rec.type === "Sales-P") ? rec.amount.toLocaleString(undefined, { minimumFractionDigits: 2 }) : ""}</td>  
                                  <td className="px-3 py-3">{rec.type === "Credit Collection" ? rec.amount.toLocaleString(undefined, { minimumFractionDigits: 2 }) : ""}</td>  
                                  <td className="px-3 py-3">{rec.type === "Credit" ? rec.amount.toLocaleString(undefined, { minimumFractionDigits: 2 }) : ""}</td>  
                                  <td className="px-3 py-3 whitespace-nowrap">
                                    {((rec.type === "Out") || (rec.mode_of_payment === "Gcash") || (rec.mode_of_payment === "Check") || (rec.mode_of_payment === "BankTransfer"))  && (
                                      <>
                                        <span className="text-red-500 font-bold">(</span> {rec.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })} <span className="text-red-500 font-bold">)</span>
                                      </>
                                    )}
                                  </td>
                                </tr>
                                ))) : (
                                <tr className='text-xs bg-white border-b dark:bg-gray-100 dark:border-gray-300'>
                                  <td className='px-3 py-3 text-center' colSpan={15}>No Record</td>
                                </tr>
                                )}
                              </tbody>                        
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


    <Dialog open={openSearchDial} onClose={setOpenSearchDial} className="relative z-[999]">
      <DialogBackdrop
          transition
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
      />

      <div className="fixed inset-0 z-10 w-screen">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <DialogPanel transition className="relative transform overflow-y-auto max-h-[90vh] transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-6xl data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"> 

              <div className="flex flex-col font-[sans-serif]">
                <div className="w-full mx-auto border border-gray-300 p-6 bg-gray-50">
                  <div className="text-center mb-4">
                    <h1 className="text-2xl text-left pb-2 flex"><FaSearch size={38}/></h1>
                    <hr className='pb-4'/>
                    
                    <div className="max-w-6xl mx-auto mb-20">
                      <div className="flex flex-col md:flex-row items-start md:items-end gap-4 mb-5 text-left">
                        {/* Global Search */}
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            fetchTransactionHistory();
                          }}
                          className="flex flex-col md:flex-row gap-4 w-full"
                        >
                          <div className="flex flex-col w-full md:w-1/3">
                            <label className="mb-1 font-medium text-sm">
                              Search (Name, DR#, SOA#, SI#, PR#)
                            </label>
                            <input
                              type="text"
                              value={search}
                              onChange={(e) => setSearch(e.target.value)}
                              placeholder="Type name or reference number..."
                              className="w-full px-3 py-2 border rounded-md text-sm"
                            />
                          </div>

                          <div className="flex items-end md:items-end">
                            <button
                              type="submit"
                              className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
                            >
                              Search
                            </button>
                          </div>
                        </form>
                      </div>
                        <hr/>
                          <div className=" py-3 text-gray-800 font-bold text-left">Search Result</div>
                          <div className="overflow-auto">
                            <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400 overflow-hidden">
                              <thead className="text-xs text-center uppercase bg-gray-200 text-gray-800 border-b border-t border-gray-300">
                                <tr className="text-nowrap border-gray-300 border-b">
                                  
                                </tr>
                                <tr className="text-nowrap">
                                  <th className="px-3 py-3 w-1/12">No.</th>
                                  <th className="px-3 py-3 w-1/12">Type</th>
                                  <th className="px-3 py-3 w-1/12 whitespace-nowrap">Reference No.</th>
                                  <th className="px-3 py-3">Name & Description</th>
                                  <th className="px-3 py-3 w-1/12">Sales</th>
                                  <th className="px-3 py-3 w-1/12 whitespace-nowrap">Credit Col.</th>
                                  <th className="px-3 py-3 w-1/12">Credit</th>
                                  <th className="px-3 py-3 w-1/12">Out</th>
                                  <th className="px-3 py-3 w-1/12">Encoder</th>
                                  <th className="px-3 py-3 w-1/12 whitespace-nowrap">Date Created</th>
                                </tr>
                              </thead>
                              <tbody className="text-xs text-center bg-gray-50 border-b-2 border-gray-300">
                                {monitoringDataHistory.length > 0 ? (
                                  monitoringDataHistory.map((rec, i) => (
                                    <tr
                                      key={rec.id || i}
                                      className="bg-white border-b hover:bg-gray-50 text-slate-800"
                                    >
                                      <td className="px-3 py-2">{i + 1}</td>
                                      <td className="px-3 py-2">{highlightText(rec.type)}</td>
                                      <td className="px-3 py-2">{highlightText(rec.referenceno) || "-"}</td>
                                      <td className="px-3 py-2">
                                        {highlightText(
                                          `${rec.name}${rec.description ? " - " + rec.description : ""}`,
                                          search
                                        )}
                                      </td>
                                      {/* Sales */}
                                      <td className="px-3 py-2 text-right">
                                        {(rec.type === "Sales" || rec.type === "Sales-P") &&
                                          Number(rec.amount).toLocaleString(undefined, {
                                            minimumFractionDigits: 2,
                                          })}
                                      </td>

                                      {/* Credit Collection */}
                                      <td className="px-3 py-2 text-right">
                                        {rec.type === "Credit Collection" &&
                                          Number(rec.amount).toLocaleString(undefined, {
                                            minimumFractionDigits: 2,
                                          })}
                                      </td>

                                      {/* Credit */}
                                      <td className="px-3 py-2 text-right">
                                        {rec.type === "Credit" &&
                                          Number(rec.amount).toLocaleString(undefined, {
                                            minimumFractionDigits: 2,
                                          })}
                                      </td>

                                      {/* Out */}
                                      <td className="px-3 py-2 text-red-600 whitespace-nowrap text-right">
                                        {(rec.type === "Out" ||
                                          rec.mode_of_payment === "Gcash" ||
                                          rec.mode_of_payment === "Check" ||
                                          rec.mode_of_payment === "BankTransfer") && (
                                          <>
                                            (<span>
                                              {Number(rec.amount).toLocaleString(undefined, {
                                                minimumFractionDigits: 2,
                                              })}
                                            </span>)
                                          </>
                                        )}
                                      </td>
                                      <td className="px-3 py-2">{rec.encoder_name}</td>
                                      <td className="px-3 py-2">{highlightText(
                                        new Date(rec.created_at).toLocaleString(),
                                          search
                                        )}</td>
                                    </tr>
                                  ))
                                ) : (
                                  <tr>
                                    <td colSpan={10} className="py-6 text-gray-500">
                                      No record found
                                    </td>
                                  </tr>
                                )}
                              </tbody>
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
      body="Transaction successfully added!"
      okConfirm={closeCreate}
      /> 
    }

    {status === 2 &&  <ConfirmBox open={open} setOpen={setOpen}
      title="Confirm Delete"
      body="Are you sure you want to delete this designation?"
      okConfirm={handleDelete}
      /> 
    }

    {status === 3 && <AddBox open={open} setOpen={setOpen}
      title="Confirm Add"
      body="Continue adding petty cash?"
      okConfirm={addPettyCash}
      /> 
    }

    {status === 4 &&  <InfoBox open={open} setOpen={setOpen} onClose={setOpen}
      title="Confirm Success"
      body="Designation successfully updated!"
      okConfirm={closeUpdate}
      /> 
    }

    {status === 5 &&  <InfoBox open={open} setOpen={setOpen} onClose={setOpen}
      title="Confirm Success"
      body="Transasction successfully deleted!"
      okConfirm={closeDelete}
      /> 
    }
    
    </>
  )
};
