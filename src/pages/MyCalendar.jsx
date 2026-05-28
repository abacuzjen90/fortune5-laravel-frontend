import { Dialog, DialogBackdrop, DialogPanel, Tab, TabList, TabPanels, TabPanel, TabGroup } from '@headlessui/react';
import { useContext, useEffect, useState, useMemo} from "react";
import { AppContext } from "../context/AppContext";
import { Link } from 'react-router-dom';
import InfoBox from "../assets/components/InfoBox";
import ConfirmBox from "../assets/components/DeleteBox";
import UpdateBox from "../assets/components/UpdateBox";
import ErrorBox from "../assets/components/ErrorBox";
import AddBox from "../assets/components/AddBox";
import { MdAdd } from "react-icons/md";
import { FaRegTrashAlt, FaPlus, FaTrash, FaRegFile, FaGreaterThan, FaLessThan, FaFileAlt, FaRegSun, FaCalendarPlus, FaCalendarAlt } from "react-icons/fa";
import Pagination from '../assets/components/Pagination';
import TableSort from '../assets/components/TableSort';
import LoadingBox from '../assets/components/Loading';
import sortData from '../assets/components/sortData';
import DayCalculator from '../assets/components/DayCalculator';
import dayjs from "dayjs";
import DatePicker from "react-datepicker";
import { format } from "date-fns";
import useScreenSize from "../assets/components/useScreenSize";
import holidayData from "../data/philippines-holidays.json";

export default function MyCalendar() {

  const [openAddDial, setOpenAddDial] = useState(false);
  const [openUpdateDial, setOpenUpdateDial] = useState(false);
  const [openReplaceCheck, setOpenReplaceCheck] = useState(false);
  const [openBankReportDial, setOpenBankReportDial] = useState(false);
  const [openSettingsDial, setOpenSettingsDial] = useState(false);
  const [openDayCalculatorDial, setOpenDayCalculatorDial] = useState(false);
  const [open, setOpen] = useState(false);
  const { token } = useContext(AppContext);
  const [showLoading, setShowLoading] = useState(false);
  const isLoading = () => {setShowLoading(true)};
  const stopLoading = () => {setShowLoading(false)};
  const [status, setStatus] = useState(0);
  const [bankReport, setBankReport] = useState([]);
  const [id, setId] = useState(null);
  const [filtersDate, setFiltersDate] = useState({ date: ""});
  const [replacedCheckData, setReplacedCheckData] = useState([{ date: "", bank: "", checkno: "", payee: "", amount: "", status: "" }]);
  const [replacedCheckIdData, setReplacedCheckIdData] = useState({ replace_id: "", date: "", bank: "", checkno: "", payee: "", amount: "", status: "" });
  const isMediumScreen = useScreenSize(768);


  const [currentMonth, setCurrentMonth] = useState(dayjs());
  const [selectedDate, setSelectedDate] = useState(null);
  const [events, setEvents] = useState([]);
  const [banks, setBanks] = useState([]);
  const [newEvent, setNewEvent] = useState({ date: "", title: "", description: "" });
  const [newBank, setNewBank] = useState([{ date: "", bank: "", checkno: "", payee: "", amount: "", status: "" }]);
  const daysInMonth = currentMonth.daysInMonth();
  const startOfMonth = currentMonth.startOf("month").day();
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const months = [
    "January", "February", "March", "April",
    "May", "June", "July", "August",
    "September", "October", "November", "December"
  ];

  const years = Array.from({ length: 15 }, (_, i) => dayjs().year() - 5 + i);

  const [dateLimit, setDateLimit] = useState([]);
  const [dateBlocked, setDateBlocked] = useState([]);
  const [dateLimitId, setDateLimitId] = useState(null);
  const [dateBlockedId, setDateBlockedId] = useState(null);

  const [dateLimitData, setDateLimitData] = useState({
    date: "", amount: "",
  });

  const [dateBlockedData, setDateBlockedData] = useState({
    date: "",
  });


  //Table Pagination, Search
  const [sortdata, setSortdata] = useState([]);
  const [sorting, setSorting] = useState({ key: "", ascending: true });
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageCount, setPageCount] = useState(0);
  const [dataPerPage, setDataperpage] = useState(10);

  const [formData, setFormData] = useState({
    designation: "",
  });

  const [errors, setErrors] = useState({});
  const [eventErrors, setEventErrors] = useState("");
  const [success, setSuccess] = useState("");
  const [eventSuccess, setEventSuccess] = useState("");
  const [dateError, setDateError] = useState("");


  const changePage = (i) => {
    setCurrentPage(i);
    const startItem = (i - 1) * dataPerPage;
    setSortdata(designation.slice(startItem, startItem + dataPerPage));
  };

  const handleChange = (value) => {
    changePage(value);
  };

    const handleBankRow = (index, field, value) => {
      const updated = [...newBank];
      updated[index][field] = value; // store raw value while typing
      setNewBank(updated);
    };

    const handleEventRow = (index, field, value) => {
      const updated = [...newEvent];
      updated[index][field] = value; // store raw value while typing
      setNewEvent(updated);
    };


  //Datepicker
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0]; // "YYYY-MM-DD"
    setFiltersDate((prev) => ({
      ...prev,
      date: prev.date || today,
    }));
  }, []);


  const formatAmount = (val) => {
    const num = Number(val.replace(/,/g, ""));
    if (isNaN(num)) return "";
    return num.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };


  //Search and Table Sorting
  async function searchTable() {
    const filtered = bankReport.filter(rec => 
      rec.designation.toLowerCase().includes(search.toLowerCase())
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
    getBankReport();
    setOpenReport(true);
  };


  async function getBankReport() {
    isLoading();
    const queryParams = new URLSearchParams();
    if (fromDate) queryParams.append("from", fromDate);
    if (toDate) queryParams.append("to", toDate);

    const res = await fetch(`/api/getbankreport?${queryParams.toString()}`, {
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
      setBankReport(data);
    }
    stopLoading();
  }
  
  useEffect(() => {
  if (fromDate && toDate) {
    if (new Date(toDate) < new Date(fromDate)) {
      setDateError("To date cannot be earlier than From date.");
    } else {
      setDateError(""); // Clear error
      getBankReport();
    }
  }
  }, [fromDate, toDate]);
  
  useEffect(() => {
    if (!dateError) {
      getBankReport();
    }
  }, [dataPerPage, fromDate, toDate]);



  const addRow = () => {
    setNewBank([
      ...newBank,
      { date: "", bank: "", checkno: "", payee: "", amount: "", status: "", }
    ]);
  };

  const deleteRow = (index) => {
    const updated = newBank.filter((_, i) => i !== index);
    setNewBank(updated);
  };



  async function getEvents() {
    isLoading();
    const res = await fetch("/api/event", {
      method: "GET",
      headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          Authorization: `Bearer ${token}`,
        },
    });
    const data = await res.json();
    
    if(res.ok) {
      setEvents(data);
      stopLoading();
    }
  }
  useEffect(() => {
    getEvents();
  }, []);


  async function getBanks() {
    isLoading();
    const res = await fetch("/api/bankcalendar", {
      method: "GET",
      headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          Authorization: `Bearer ${token}`,
        },
    });
    const data = await res.json();
    
    if(res.ok) {
      setBanks(data);
      stopLoading();
    }
  }
  useEffect(() => {
    getBanks();
  }, []);

  // Add new event
  const handleAddEvent = async () => {
    if (!newEvent.date || !newEvent.title.trim()) {
      setEventErrors("Please select a date and enter a title.");
      return;
    }

    isLoading(); // or setIsLoading(true)
    try {
      const res = await fetch("/api/event", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          date: newEvent.date,
          title: newEvent.title,
          description: newEvent.description,
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || "Failed to add event");
      }

      const data = await res.json();
      setEvents((prev) => [...prev, data]);
      setNewEvent({ title: "", description: "" });
      setEventErrors("");
      setEventSuccess("EVent records saved successfully.");
    } catch (error) {
      console.error("Error adding event:", error);
      setEventErrors(error.message || "Something went wrong while adding the event.");
    } finally {
      stopLoading(); // or setIsLoading(false)
    }
  };


  // Add new bank
  const handleAddBank = async () => {
    isLoading();

    try {
      // ✅ CLEAN AMOUNT FIRST (remove commas)
      const cleanedRows = newBank.map((row) => ({
        ...row,
        amount: Number((row.amount || "0").toString().replace(/,/g, "")),
      }));

      const validRows = cleanedRows.filter(
        (row) => row.date && row.bank && row.checkno && row.payee && row.amount
      );

      if (!validRows.length) {
        setErrors("Please complete all required fields before saving.");
        stopLoading();
        return;
      }

      // Group new input amounts per date
      const groupedByDate = validRows.reduce((acc, row) => {
        if (!acc[row.date]) acc[row.date] = 0;
        acc[row.date] += row.amount; // already clean number
        return acc;
      }, {});

      for (const date in groupedByDate) {
        const inputTotal = groupedByDate[date];

        const formattedDate = dayjs(date, "MM/DD/YYYY").format("YYYY-MM-DD");

        const matchedLimit = dateLimit.find(
          (d) => d.date === formattedDate
        );

        if (!matchedLimit) continue;

        const limitAmount = Number(matchedLimit.amount);

        const existingTotal = banks
          .filter(
            (b) =>
              dayjs(b.date).format("YYYY-MM-DD") === formattedDate &&
              b.status !== "GOOD" &&
              b.status !== "REPLACED"
          )
          .reduce((sum, e) => sum + Number((e.amount || 0).toString().replace(/,/g, "")), 0);

        if (existingTotal + inputTotal > limitAmount) {
          setErrors(
            `Limit exceeded for ${date}. Allowed: ${limitAmount.toLocaleString()}`
          );
          stopLoading();
          return;
        }
      }

      const res = await fetch("/api/bankcalendar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ banks: validRows }), // ✅ clean data sent
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.message || "Failed to save bank records.");
      }

      await res.json();

      setNewBank([
        { date: "", bank: "", checkno: "", payee: "", amount: "", status: "" },
      ]);

      getBanks();
      setErrors("");
      setSuccess("Bank records saved successfully");
    } catch (error) {
      console.error("Error adding bank events:", error);
      setErrors(error.message || "Something went wrong while adding bank events.");
      setSuccess("");
    } finally {
      stopLoading();
    }
  };


  const getEventsByDate = (date) =>
    events.filter((e) => e.date === date.format("YYYY-MM-DD"));


  const getBanksByDate = (date) =>
    banks.filter((e) => e.date === date.format("YYYY-MM-DD"));
  const dateBanks = getBanksByDate(dayjs(selectedDate)) || [];
  const totalAmount = dateBanks
  .filter((e) => e.status !== "GOOD" && e.status !== "REPLACED")
  .reduce((sum, e) => sum + Number(e.amount || 0), 0);


  const totalByMonth = banks.filter((e) =>
    dayjs(e.date).isSame(currentMonth, "month")
  ).reduce((sum, e) => sum + Number(e.amount || 0), 0);
  

  const handleStatusChange = async (id, newStatus) => {
    const prevBanks = [...banks];

    // Optimistic UI update
    setBanks(prev =>
      prev.map(b => (b.id === id ? { ...b, status: newStatus } : b))
    );
    isLoading();

    try {
      const res = await fetch(`/api/bankcalendar/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error("Failed to update status");

      alert("Status updated successfully!");
      console.log("Status updated!");
    } catch (err) {
      console.error("Error updating status:", err);
    } finally {
      stopLoading();
    }
  };


  // Delete function
  const deleteBankRow = async (id) => {
    const prevBanks = [...banks];

    setBanks(prev => prev.filter(b => b.id !== id));
    isLoading();

    try {
      const res = await fetch(`/api/bankcalendar/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to delete row");

    } catch (err) {
      console.error("Error deleting row:", err);
      setBanks(prevBanks);
    } finally {
      stopLoading();
    }
  };


  // Delete function
  const deleteEventRow = async (id) => {
    const prevEvents = [...events];

    setEvents(prev => prev.filter(b => b.id !== id));
    isLoading();

    try {
      const res = await fetch(`/api/event/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to delete row");

    } catch (err) {
      console.error("Error deleting row:", err);
      setEvents(prevEvents);
    } finally {
      stopLoading();
    }
  };


  async function getCheckReplaced(id) {
    setErrors(false);
    if(id){
      const res = await fetch(`/api/bankcheckreplaced/${id}`, {
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
        setReplacedCheckData({
          id: data[0].id,
          bank: data[0].bank,
          checkno: data[0].checkno,
          payee: data[0].payee,
          amount: data[0].amount ? data[0].amount : 0.00,
          date: data[0].date
            ? new Date(data[0].date).toLocaleDateString("en-US", {
                month: "2-digit",
                day: "2-digit",
                year: "numeric",
              })
            : "",
          status: data[0].status,
        });
      }
    }
  }


  async function getCheckReplacedId(id) {
    isLoading();
    setErrors(false);
    setSuccess(false);

    if (!id) return;

    try {
      const res = await fetch(`/api/bankcheckreplacedid/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      console.log("Fetched check data:", data);

      if (res.ok && data && Object.keys(data).length > 0) {
        setReplacedCheckIdData({
          replace_id: data.replace_id,
          bank: data.bank ?? "",
          checkno: data.checkno ?? "",
          payee: data.payee ?? "",
          amount: data.amount ?? "0.00",
          date: data.date
            ? new Date(data.date).toLocaleDateString("en-US", {
                month: "2-digit",
                day: "2-digit",
                year: "numeric",
              })
            : "",
          status: data.status ?? "",
        });
      } else {
        setReplacedCheckIdData({
          replace_id: id,
          bank: "",
          checkno: "",
          payee: "",
          amount: "",
          date: "",
          status: "",
        });
      }
    } catch (err) {
      console.error("Fetch failed:", err);
      setErrors(true);
    }

    stopLoading();
  }


  async function addReplaceCheck(e) {
    e.preventDefault();
    isLoading();

    try {
      const firstRow = replacedCheckIdData;

      // ✅ Normalize amount ONCE
      const amountRaw = (firstRow.amount || "").toString().replace(/,/g, "");
      const inputAmount = Number(amountRaw);

      // ✅ Validate required fields FIRST
      if (
        !firstRow?.date ||
        !firstRow?.bank?.trim() ||
        !firstRow?.checkno?.trim() ||
        !firstRow?.payee?.trim() ||
        firstRow?.amount === "" ||
        firstRow?.amount == null
      ) {
        setErrors("Please fill in all required fields.");
        return;
      }

      // ✅ Validate number properly
      if (isNaN(inputAmount)) {
        setErrors("Amount must be a valid number.");
        return;
      }

      // =========================
      // DATE + LIMIT VALIDATION
      // =========================
      const formattedDate = dayjs(firstRow.date, "MM/DD/YYYY").format("YYYY-MM-DD");

      const matchedLimit = dateLimit.find((d) => d.date === formattedDate);

      if (matchedLimit) {
        const limitAmount = Number(matchedLimit.amount);

        const existingTotal = banks
          .filter(
            (b) =>
              dayjs(b.date).format("YYYY-MM-DD") === formattedDate &&
              b.status !== "GOOD" &&
              b.status !== "REPLACED"
          )
          .reduce(
            (sum, e) =>
              sum + Number((e.amount || 0).toString().replace(/,/g, "")),
            0
          );

        const totalAmount = existingTotal + inputAmount;

        if (totalAmount > limitAmount) {
          setErrors(
            `Limit exceeded for ${firstRow.date}. Allowed: ${limitAmount.toLocaleString()}`
          );
          return;
        }
      }

      // =========================
      // CLEAN PAYLOAD
      // =========================
      const payload = {
        ...firstRow,
        amount: inputAmount, // ✅ no commas sent
      };

      const res = await fetch("/api/savereplacedcheck", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrors(data?.message || "Something went wrong.");
        return;
      }

      setErrors("");
      setSuccess(data.message || "Saved successfully");

      setReplacedCheckIdData({
        date: "",
        bank: "",
        checkno: "",
        payee: "",
        amount: "",
      });

      getBanks();
    } catch (error) {
      console.error(error);
      setErrors(error.message || "Unexpected error occurred.");
    } finally {
      stopLoading();
    }
  }


  async function getDateLimit() {
      isLoading();
      const res = await fetch("/api/datelimit", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            Authorization: `Bearer ${token}`,
          },
      });
      const data = await res.json();
      if(res.ok) {
        setDateLimit(data);
        stopLoading();
      }
    }
    useEffect(() => {
      getDateLimit();
    }, []);
  
    async function createDateLimit(e) {
      e.preventDefault();
      isLoading();
      const res = await fetch("/api/datelimit", {
          method: "post",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(dateLimitData),
      });
      const data = await res.json()
      console.log(data);
  
      if (data.errors) {
        setErrors(data.errors);
      } else {
        setOpen(true);
        setStatus(6);
        setDateLimitData({
          date: "",
          amount: ""
        });
        getDateLimit();
        setErrors(false);
      }
      stopLoading();
    }
  
    async function openDeleteDateLimit(id) {
      setOpen(true);
      setStatus(7);
      setDateLimitId(id);
    }
  
    async function handleDeleteDateLimit(e) {
      isLoading();
      e.preventDefault();
        const res = await fetch(`/api/datelimit/${dateLimitId}`, {
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
          setStatus(8);
          getDateLimit();
        }
        isLoading();
    }
  
    async function closeDeleteDateLimit() {
      setOpen(false);
    }
  
  
    async function getDateBlocked() {
      isLoading();
      const res = await fetch("/api/dateblocked", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            Authorization: `Bearer ${token}`,
          },
      });
      const data = await res.json();
      console.log(data);
      if(res.ok) {
        setDateBlocked(data);
        stopLoading();
      }
    }
    useEffect(() => {
      getDateBlocked();
    }, []);

  
    async function createDateBlocked(e) {
      e.preventDefault();
      isLoading();

      const matchedBanks = banks.filter(
        (e) =>
          dayjs(e.date).format("YYYY-MM-DD") ===
          dayjs(dateBlockedData.date).format("YYYY-MM-DD")
      );

      if (matchedBanks.length > 0) {
        const totalAmount = matchedBanks
          .filter((e) => e.status !== "GOOD" && e.status !== "REPLACED")
          .reduce((sum, e) => sum + Number(e.amount || 0), 0);

        setDateLimitData({
          date: dateBlockedData.date,
          amount: totalAmount,
        });

        setStatus(13);
        setOpen(true);

        stopLoading();
        return;
      }

      const res = await fetch("/api/dateblocked", {
          method: "post",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(dateBlockedData),
      });
      const data = await res.json()
      console.log(data);
  
      if (data.errors) {
        setErrors(data.errors);
      } else {
        setOpen(true);
        setStatus(9);
        setDateBlockedData({
          date: "",
        });
        getDateBlocked();
        setErrors(false);
      }
      stopLoading();
    }

    async function confirmCreateDateLimit() {
      isLoading();

      try {
        const res = await fetch("/api/datelimit", {
          method: "post",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(dateLimitData),
        });

        const data = await res.json();

        if (data.errors) {
          setErrors(data.errors);
          return;
        }

        setStatus(6);
        getDateLimit();
        setErrors(false);

      } catch (error) {
        console.error(error);
      } finally {
        stopLoading();
      }
    }
      
    async function openDeleteDateBlocked(id) {
      setOpen(true);
      setStatus(10);
      setDateBlockedId(id);
    }
  
    async function handleDeleteDateBlocked(e) {
      isLoading();
      e.preventDefault();
        const res = await fetch(`/api/dateblocked/${dateBlockedId}`, {
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
          setStatus(11);
          getDateBlocked();
        }
        isLoading();
    }
  
    async function closeDeleteDateBlocked() {
      setOpen(false);
    }

    async function closeCreate() {
      setOpen(false);
    }

    async function closeBlockedDate() {
      setOpen(false);
    }
  

  return (
    <> 
    <div className="flex items-center font-medium border-b border-slate-300 w-full">
      <main className="px-4 flex-1 mx-auto py-4"><h1 className='text-2xl font-bold'>Calendar</h1></main>
    </div>
    <div className="flex items-center font-medium flex-1 mx-auto py-4 ">
      <main className="flex-1 mx-auto p-4">
        <div className={`overflow-x-auto transition-all duration-75 min-w-0 mx-auto ${isMediumScreen ? "w-[calc(100vw-19rem)]" : "w-[calc(100vw-6rem)]"}`}>
          <div className="bg-gray-50 shadow-md border">
            <div className="p-6 text-gray-900 dark:text-gray-100">
              <div className="text-left caption-top dark:text-gray-800">
                <div className="flex flex-row py-2">
                  <div className="flex w-full"><h1>My Calendar</h1></div>
                  <div className="flex mb-3 gap-2">
                      <button type="button" onClick={() => { setOpenDayCalculatorDial(true); setErrors(false)}} className="h-fit flex flex-row primary-btn py-3 px-3 text-sm tracking-wider font-semibold rounded-md text-white bg-gray-800 hover:bg-gray-600 focus:outline-none"><FaCalendarPlus size={20}/></button>
                      <button type="button" onClick={() => { setOpenSettingsDial(true); setErrors(false)}} className="h-fit flex flex-row primary-btn py-3 px-3 text-sm tracking-wider font-semibold rounded-md text-white bg-gray-800 hover:bg-gray-600 focus:outline-none"><FaRegSun size={20}/></button>
                      <button type="button" onClick={() => {setOpenAddDial(true); setFormData({}); setErrors(false); setEventErrors(false); setSuccess(false); setEventSuccess(false);}} className="h-fit flex flex-row primary-btn py-3 px-3 text-sm tracking-wider font-semibold rounded-md text-white bg-gray-800 hover:bg-gray-600 focus:outline-none"><MdAdd size={20}/></button>
                      <button type="button" onClick={() => {setOpenBankReportDial(true); setFormData({}); setErrors(false); setSuccess(false); setDateError(false); setFromDate(false); setToDate(false); setBankReport(false);}} className="h-fit flex flex-row primary-btn py-3 px-3 text-sm tracking-wider font-semibold rounded-md text-white bg-gray-800 hover:bg-gray-600 focus:outline-none"><FaRegFile size={20}/></button>
                    </div> 
                </div>
                </div>
              
              <div className="min-h-screen flex flex-col items-center">
                {/* Calendar Header */}
                <div className="flex items-center mb-4 gap-4 flex-wrap justify-center">

                  {/* Prev Month */}
                  <button
                    className="px-3 py-3 text-gray-800 hover:text-white hover:bg-slate-400 rounded"
                    onClick={() => setCurrentMonth(currentMonth.subtract(1, "month"))}
                  >
                    <div className="flex">
                      <FaLessThan /><FaLessThan />
                    </div>
                  </button>

                  {/* Month Select */}
                  <select
                    className="px-2 py-1 text-gray-800 bg-transparent text-xl border-b border-gray-400 focus:outline-none focus:border-gray-800 font-[sans-serif] font-semibold"
                    value={currentMonth.month()}
                    onChange={(e) =>
                      setCurrentMonth(currentMonth.month(Number(e.target.value)))
                    }
                  >
                    {months.map((m, i) => (
                      <option key={m} value={i}>
                        {m}
                      </option>
                    ))}
                  </select>

                  {/* Year Select */}
                  <select
                    className="px-2 py-1 text-gray-800 bg-transparent text-xl border-b border-gray-400 focus:outline-none focus:border-gray-800 font-[sans-serif] font-semibold"
                    value={currentMonth.year()}
                    onChange={(e) =>
                      setCurrentMonth(currentMonth.year(Number(e.target.value)))
                    }
                  >
                    {years.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>

                  {/* Next Month */}
                  <button
                    className="px-3 py-3 text-gray-800 hover:text-white hover:bg-slate-400 rounded"
                    onClick={() => setCurrentMonth(currentMonth.add(1, "month"))}
                  >
                    <div className="flex">
                      <FaGreaterThan /><FaGreaterThan />
                    </div>
                  </button>

                </div>

                <div className="flex justify-center mb-2">
                  <div className="w-[280px] border border-gray-300 rounded-lg px-6 py-3 bg-slate-50 shadow-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-800 font-[sans-serif] font-semibold text-xl">
                        Total
                      </span>

                      <span className="text-xl text-gray-800 font-semibold font-[sans-serif] whitespace-nowrap overflow-x-auto">
                        {totalByMonth.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-2 w-full p-4 border rounded-md bg-slate-100">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                    <div key={d} className="text-center font-semibold text-gray-800 border-b-2 border-gray-400 mb-4 py-2">
                      {d}
                    </div>
                  ))}

                  {Array.from({ length: startOfMonth }).map((_, i) => (
                    <div key={i} className=" text-gray-800"></div>
                  ))}

                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const date = currentMonth.date(i + 1);
                    const formattedDate = date.format("YYYY-MM-DD");

                    const dateEvents = getEventsByDate(date);
                    const dateBanks = getBanksByDate(date);

                    const totalAmountDate = dateBanks
                      .filter((e) => e.status !== "GOOD" && e.status !== "REPLACED")
                      .reduce((sum, e) => sum + Number(e.amount || 0), 0);

                    const isBlocked = dateBlocked.some(
                      (d) => d.date === formattedDate
                    );

                    const matchedLimit = dateLimit.find(
                      (d) => d.date === formattedDate
                    );

                    return (
                      <div
                        key={i}
                        onClick={() => {
                          if (!isBlocked) {
                            setSelectedDate(formattedDate);
                          }
                        }}
                        className={`text-gray-800 border rounded-lg px-2 py-1
                          ${isBlocked 
                            ? "bg-white cursor-not-allowed"
                            : "bg-white hover:bg-blue-50 cursor-pointer"}
                          ${selectedDate === formattedDate ? "border-blue-500" : ""}
                          ${date.isSame(dayjs(), "day") ? "bg-yellow-50 border-yellow-400" : ""} 
                          flex flex-col justify-between h-40`}
                      >
                      <div className="flex justify-between items-start">
                        <div className="flex flex-col">
                          <span className="font-bold">{i + 1}</span>
                        </div>
                        {!isBlocked && (
                          <span
                            className={`text-xs font-semibold mt-1 ${
                              new Date(new Date(date).setHours(0, 0, 0, 0)) <
                              new Date(new Date().setHours(0, 0, 0, 0)) &&
                              totalAmountDate > 0
                                ? "text-red-500 blink"
                                : "text-gray-800"
                            }`}
                          >
                            {parseFloat(totalAmountDate).toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                            })}
                          </span>
                        )}
                      </div>

                      {isBlocked ? (
                        <>
                          <hr />
                          <div className="flex items-center justify-center flex-1 text-xs text-red-600 font-semibold">
                            BLOCKED
                          </div>
                        </>
                      ) : (
                        <>
                          <hr />
                          <div className="flex-1 overflow-y-auto mt-1">
                            {dateBanks.map((e) => (
                              <div key={e.id} className="text-xs text-blue-600 truncate">
                                {e.bank} -{" "}
                                {parseFloat(e.amount).toLocaleString(undefined, {
                                  minimumFractionDigits: 2,
                                })}
                              </div>
                            ))}
                            <div className="mt-2 mb-2"></div>
                            {dateEvents.map((e) => (
                              <div key={e.id} className="text-xs text-gray-600 truncate">
                                {e.title}
                              </div>
                            ))}
                          </div>

                          <div className="mt-auto pt-2">
                            {matchedLimit && (
                              <div className="text-xs font-semibold text-purple-500 pt-1">
                                Limit: {parseFloat(matchedLimit.amount).toLocaleString(undefined, {
                                  minimumFractionDigits: 2
                                })}
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                    );
                  })}
                </div>

                {/* Modal */}
                {selectedDate && (
                  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[999] overflow-hidden">
                  <div className="bg-white p-6 shadow-lg w-2/3 max-h-[80vh] overflow-y-auto">
                    <div className="flex justify-between items-center mb-4">
                      <span>
                        <h2 className="text-6xl font-semibold text-gray-600">
                          {selectedDate.split("-")[2]}
                        </h2>
                      </span>
                      <span className='text-gray-800 text-4xl font-semibold'>₱ {parseFloat(totalAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                      <div className="mt-2 w-full px-2">
                        <table className='w-full text-sm text-gray-800 border'> 
                          <thead>
                          <tr className='text-sm font-semibold bg-slate-600 text-gray-100'>
                            <td className='px-2 py-2 border text-center'>No.</td>
                            <td className='px-3 py-2 border w-1/5'>Bank</td>
                            <td className='px-3 py-2 border'>Check Number</td>
                            <td className='px-3 py-2 border w-1/4'>Payee</td>
                            <td className='px-3 py-2 border text-right w-1/6'>Amount</td>
                            <td className='px-3 py-2 border text-center'>Status</td>
                            <td className='px-2 py-2 border text-center'>-</td>
                          </tr>
                          </thead>
                          {getBanksByDate(dayjs(selectedDate)).length > 0 ? (
                          getBanksByDate(dayjs(selectedDate)).map((e, i) => (
                          <>
                          <tbody className='border'>
                            <tr
                              key={i}
                              className={`bg-slate-50 ${
                                e.status === "REPLACED" ? "cursor-pointer" : ""
                              }`}
                              onClick={() => {
                                if (e.status === "REPLACED") {
                                  getCheckReplaced(e.id); 
                                  getCheckReplacedId(e.id);
                                  setOpenReplaceCheck(true); 
                                  setReplacedCheckIdData({
                                    replace_id: "",
                                    date: "",
                                    bank: "",
                                    checkno: "",
                                    payee: "",
                                    amount: "",
                                    status: ""});
                                }
                              }}
                            >
                              <td className='px-1 py-2 border text-center'>{i + 1}.</td>
                              <td
                                className={`px-2 py-1 border ${
                                  e.status === "GOOD"
                                    ? "bg-green-200"
                                    : e.status === "HOLD"
                                    ? "bg-orange-200"
                                    : e.status === "BOUNCED"
                                    ? "bg-red-200"
                                    : e.status === "REPLACED"
                                    ? "bg-yellow-200"
                                    : ""
                                }`}
                              >{e.bank}</td>
                              <td
                                className={`px-2 py-1 border ${
                                  e.status === "GOOD"
                                    ? "bg-green-200"
                                    : e.status === "HOLD"
                                    ? "bg-orange-200"
                                    : e.status === "BOUNCED"
                                    ? "bg-red-200"
                                    : e.status === "REPLACED"
                                    ? "bg-yellow-200"
                                    : ""
                                }`}
                              >{e.checkno}</td>
                              <td
                                className={`px-2 py-1 border ${
                                  e.status === "GOOD"
                                    ? "bg-green-200"
                                    : e.status === "HOLD"
                                    ? "bg-orange-200"
                                    : e.status === "BOUNCED"
                                    ? "bg-red-200"
                                    : e.status === "REPLACED"
                                    ? "bg-yellow-200"
                                    : ""
                                }`}
                              >{e.payee}</td>
                              <td
                                className={`px-2 py-1 border text-right ${
                                  e.status === "GOOD"
                                    ? "bg-green-200"
                                    : e.status === "HOLD"
                                    ? "bg-orange-200"
                                    : e.status === "BOUNCED"
                                    ? "bg-red-200"
                                    : e.status === "REPLACED"
                                    ? "bg-yellow-200"
                                    : ""
                                }`}
                              >{parseFloat(e.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                              <td
                                className={`px-2 py-1 border text-center ${
                                  e.status === "GOOD"
                                    ? "bg-green-200"
                                    : e.status === "HOLD"
                                    ? "bg-orange-200"
                                    : e.status === "BOUNCED"
                                    ? "bg-red-200"
                                    : e.status === "REPLACED"
                                    ? "bg-yellow-200"
                                    : ""
                                }`}
                              >
                                  <select
                                    value={e.status}
                                    onClick={(ev) => ev.stopPropagation()}
                                    onChange={(ev) => handleStatusChange(e.id, ev.target.value)}
                                    className="border rounded p-1"
                                  >
                                    <option value="">Select</option>
                                    <option value="GOOD">GOOD</option>
                                    <option value="HOLD">HOLD</option>
                                    <option value="REPLACED">REPLACED</option>
                                    <option value="BOUNCED">BOUNCED</option>
                                  </select>
                              </td>
                              <td className='px-3 py-1'>
                                <button onClick={() => deleteBankRow(e.id)} className="primary-btn text-sm tracking-wider font-semibold rounded-md">
                                <FaRegTrashAlt size={20} className="text-red-600"/></button>
                              </td>
                            </tr>
                          </tbody>
                        </>
                       ))
                        ) : (
                        <>
                          <tbody>
                            <tr>
                              <td className='px-3 py-8 text-center' colSpan={6}>Empty Record</td>
                            </tr>
                          </tbody>
                        </>
                      )}
                      </table>
                      </div>
                      <div className="mt-20 w-full px-2">
                        <div className='w-full bg-slate-600 px-3 py-2'>
                          <h1 className='text-sm text-slate-100 font-semibold'>Events List</h1>
                        </div>
                        {getEventsByDate(dayjs(selectedDate)).length > 0 ? (
                          getEventsByDate(dayjs(selectedDate)).map((e, i) => (
                          <>
                          <div className='text-slate-800 py-1 px-2 border-b-0 w-full border'>
                            <span className='ml-6'>{i + 1}. {e.title}</span>
                            <div className='flex w-full'>
                              <div className='w-full text-xs text-slate-600 ml-4'> - {e.description}</div>
                              <div className='justify-end mr-4'>
                                <button
                                  type='button'
                                  onClick={() => deleteEventRow(e.id)}
                                  className=" text-red-600 hover:text-red-800"
                                  title="Delete Row"
                                >
                                  <FaRegTrashAlt size={18} />
                                </button>
                              </div>
                            </div>
                          </div>
                          </>
                          ))
                        ) : (
                          <>
                          <div className='text-slate-800 py-8 px-4 text-center'>No events record</div>
                          </>
                        )}
                      </div>
                      <hr/>
                      <div className='text-right py-4'>
                        <button
                          onClick={() => setSelectedDate(null)}
                          className="bg-gray-600 px-4 py-2 rounded"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>  
      </main> 
    </div>

    {/* Add Branch Type */}
    <Dialog open={openAddDial} onClose={setOpenAddDial} className="relative z-[999]">
      <DialogBackdrop
          transition
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
      />

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <DialogPanel transition className="relative transform overflow-hidden transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-4xl data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"> 

            <div className="flex flex-col font-[sans-serif]">
                <div className="w-full mx-auto border border-gray-300 p-6 bg-gray-50">
                  <div className="text-center mb-4">
                    <h1 className="text-2xl text-left pb-2 flex"><MdAdd size={38}/></h1>
                    <hr className='pb-4'/>
                    <div className="max-w-4xl mx-auto">
                    <TabGroup>
                      <TabList className="text-sm">
                        <Tab className="w-1/2 data-[selected]: text-gray-800 py-3 px-10 data-[selected]:sm:rounded-md data-[selected]:bg-slate-200 data-[selected]:border-r data-[selected]:text-gray-800">Check</Tab>
                        <Tab className="w-1/2 data-[selected]: text-gray-800 py-3 px-10 data-[selected]:sm:rounded-md data-[selected]:bg-slate-200 data-[selected]:border-r data-[selected]:text-gray-800">Event</Tab>
                      </TabList>
                      <TabPanels>
                        <TabPanel className="px-5 py-4 bg-white border mt-2">

                          {errors && (
                            <div className="mt-3 text-sm text-red-600 bg-red-50 border border-red-300 p-2 rounded">
                              {errors}
                            </div>
                          )}

                          {success && (
                            <div className="mt-3 text-sm text-green-700 bg-green-50 border border-green-300 p-2 rounded">
                              {success}
                            </div>
                          )}

                          <table className='w-full text-sm text-gray-800'>
                            <caption className="text-left caption-top dark:text-gray-800">
                            <div className="flex flex-row py-2">
                              <div className="flex w-full justify-end">
                                <button type='button' onClick={addRow} className="px-2 py-1 text-xs bg-slate-600 text-white rounded hover:bg-blue-500 flex items-center">
                                  <FaPlus size={12}/>&nbsp;Add Row
                                </button>
                              </div>
                            </div>
                          </caption>
                            <thead>
                            <tr className='text-sm font-semibold bg-slate-600 text-gray-100'>
                              <td className='px-3 py-3 border text-left'>Date</td>
                              <td className='px-3 py-3 border text-left'>Bank</td>
                              <td className='px-3 py-3 border text-left'>Check Number</td>
                              <td className='px-3 py-3 border text-left w-1/4'>Payee</td>
                              <td className='px-3 py-3 border text-right'>Amount</td>
                              <td className='px-3 py-3 border text-center'>-</td>
                            </tr>
                            </thead>
                            <tbody>
                              {newBank.map((row, index) => (
                              <>
                              <tr className='bg-slate-50 text-xs' key={index}>
                                <td className="px-3 py-2 border">
                                  <DatePicker
                                    selected={row.date ? new Date(row.date) : null}
                                    onChange={(date) => {
                                      if (!date) {
                                        handleBankRow(index, "date", "");
                                        return;
                                      }

                                      const formattedDate = format(date, "yyyy-MM-dd");
                                      const displayDate = format(date, "MM/dd/yyyy"); 

                                      const isBlocked = dateBlocked.some(
                                        (d) => d.date === formattedDate
                                      );

                                      if (isBlocked) {
                                        setOpen(true);
                                        setStatus(12);
                                        return;
                                      }

                                      handleBankRow(index, "date", displayDate);
                                    }}
                                    dateFormat="MM/dd/yyyy"
                                    className="register-link p-2 w-full border border-gray-300 text-xs text-gray-800 rounded-md outline-blue-500"
                                    placeholderText="MM/DD/YYYY"
                                  />
                                </td>
                                <td className='px-3 py-2 border'>
                                  <select
                                    name={`newBank[${index}][bank]`}
                                    value={row.bank}
                                    onChange={(e) => handleBankRow(index, "bank", e.target.value)}
                                    className="border rounded p-2"
                                  >
                                    <option value="">Select Bank</option>
                                    <option value="PNB">PNB</option>
                                    <option value="METROBANK">METROBANK</option>
                                    <option value="BDO">BDO</option>
                                    <option value="CHINABANK">CHINABANK</option>
                                  </select>
                                </td>
                                <td className='px-3 py-2 border'>
                                  <input
                                    name={`newBank[${index}][checkno]`}
                                    type="text"
                                    placeholder="Check Number"
                                    className="w-full border p-2 rounded text-gray-800"
                                    value={row.checkno}
                                    onChange={(e) => handleBankRow(index, "checkno", e.target.value)}
                                  />
                                </td>
                                <td className='px-3 py-2 border'>
                                  <input
                                    name={`newBank[${index}][payee]`}
                                    type="text"
                                    placeholder="Payee"
                                    className="w-full border p-2 rounded text-gray-800"
                                    value={row.payee}
                                    onChange={(e) => handleBankRow(index, "payee", e.target.value)}
                                  />
                                </td>
                                <td className='px-3 py-2 border'>
                                  <input
                                    name={`newBank[${index}][amount]`}
                                    type="text"
                                    placeholder="Amount"
                                    className="w-full border p-2 rounded text-gray-800 text-right"
                                    value={row.amount}
                                    onChange={(e) => {
                                      let val = e.target.value;

                                      // remove commas
                                      val = val.replace(/,/g, "");

                                      // allow only numbers + dot
                                      val = val.replace(/[^0-9.]/g, "");

                                      // prevent multiple dots
                                      const parts = val.split(".");
                                      if (parts.length > 2) return;

                                      // limit to 2 decimal places
                                      if (parts[1]?.length > 2) return;

                                      handleBankRow(index, "amount", val);
                                    }}
                                    onBlur={() => {
                                      handleBankRow(index, "amount", formatAmount(row.amount || 0));
                                    }}
                                  />
                                </td> 
                                <td className='px-2 py-2 border'>
                                  {index !== 0 && (
                                    <button
                                      type='button'
                                      onClick={() => deleteRow(index)}
                                      className=" text-red-600 hover:text-red-800"
                                      title="Delete Row"
                                    >
                                      <FaTrash size={18} />
                                    </button>
                                  )}
                                </td>                               
                              </tr>
                              </>
                              ))}
                            </tbody>
                          </table>
                        
                        <div className="flex justify-end gap-2 mt-8">
                          <button
                            onClick={() => {setErrors(""); setSuccess(""); handleAddBank()}}
                            className="bg-blue-500 text-white px-8 py-2 rounded"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setOpenAddDial(false)}
                            className="bg-gray-300 px-6 py-2 rounded text-gray-800"
                          >
                            Close
                          </button>
                        </div>
                        </TabPanel>
                        <TabPanel className="px-5 py-4 bg-white  border mt-2">

                          {eventErrors && (
                            <div className="mt-3 mb-5 text-sm text-red-600 bg-red-50 border border-red-300 p-2 rounded">
                              {eventErrors}
                            </div>
                          )}

                          {eventSuccess && (
                            <div className="mt-3 mb-5 text-sm text-green-700 bg-green-50 border border-green-300 p-2 rounded">
                              {eventSuccess}
                            </div>
                          )}
                        Date:&nbsp;&nbsp;
                        <DatePicker
                        selected={newEvent.date ? new Date(newEvent.date) : null}
                        onChange={(date) =>
                          setNewEvent({
                            ...newEvent,
                            date: date
                              ? date.toLocaleDateString("en-CA") // YYYY-MM-DD (NO timezone shift)
                              : "",
                          })
                        }
                        dateFormat="MM/dd/yyyy"
                        className="w-full border p-2 rounded mb-2 text-gray-800"
                        placeholderText="MM/DD/YYYY"
                      />
              <br></br>
                        <input
                          type="text"
                          placeholder="Title"
                          className="w-2/3 border p-2 rounded mb-2 text-gray-800"
                          value={newEvent.title}
                          onChange={(e) =>
                            setNewEvent({ ...newEvent, title: e.target.value })
                          }
                        />
                        
                        <textarea
                          placeholder="Description"
                          className="w-2/3 border p-2 rounded mb-2 text-gray-800"
                          value={newEvent.description}
                          onChange={(e) =>
                            setNewEvent({ ...newEvent, description: e.target.value })
                          }
                        ></textarea>

                        <div className="flex justify-center gap-2 mt-4">
                          <button
                            onClick={() => {setErrors(""); handleAddEvent()}}
                            className="bg-blue-500 text-white px-8 py-2 rounded"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setOpenAddDial(false)}
                            className="bg-gray-300 px-6 py-2 rounded"
                          >
                            Close
                          </button>
                        </div>
                        </TabPanel>
                      </TabPanels>
                    </TabGroup>
                    </div>

                    </div>
                  </div>
                </div>
            </DialogPanel>
          </div>
      </div>
    </Dialog>


    {/* Check Replacement */}
    <Dialog open={openReplaceCheck} onClose={setOpenReplaceCheck} className="relative z-[999]">
      <DialogBackdrop
          transition
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
      />

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <DialogPanel transition className="relative transform overflow-hidden transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-4xl data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"> 

            <div className="flex flex-col font-[sans-serif]">
                <div className="w-full mx-auto border border-gray-300 p-8 bg-gray-50">
                  <div className="text-center mb-4">
                    <h1 className="text-xl text-left flex">Check Replacement</h1>
                    <hr className='pb-6'/>
                    {errors && (
                      <div className="-mt-4 mb-2 text-sm text-red-600 bg-red-50 border border-red-300 p-2 rounded">
                        {errors}
                      </div>
                    )}

                    {success && (
                      <div className="-mt-4 mb-2 text-green-700 bg-green-50 border border-green-300 p-2 rounded">
                        {success}
                      </div>
                    )}

                      <p className='text-left px-2 font-semibold'>From:</p>
                      <div className="mt-2 w-full px-2">
                        <table className='w-full text-sm text-gray-800 border'> 
                          <thead>
                          <tr className='text-sm font-semibold bg-slate-600 text-gray-100'>
                            <td className='px-3 py-2 border w-1/6'>Date</td>
                            <td className='px-3 py-2 border w-1/5 text-left'>Bank</td>
                            <td className='px-3 py-2 border w-1/5 text-left'>Check Number</td>
                            <td className='px-3 py-2 border w-1/4 text-left'>Payee</td>
                            <td className='px-3 py-2 border text-right w-1/5'>Amount</td>
                            <td className='px-3 py-2 border'>Status</td>
                          </tr>
                          </thead>
                          <tbody>
                          <tr>
                            <td className="border px-3 py-2">{replacedCheckData.date}</td>
                            <td className="border px-3 py-2 text-left">{replacedCheckData.bank}</td>
                            <td className="border px-3 py-2 text-left">{replacedCheckData.checkno}</td>
                            <td className="border px-3 py-2 text-left">{replacedCheckData.payee}</td>
                            <td className="border px-3 py-2 text-right">
                              {parseFloat(replacedCheckData.amount).toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                              })}
                            </td>
                            <td className="border px-3 py-2 font-semibold bg-yellow-200">{replacedCheckData.status}</td>
                          </tr>
                          </tbody>
                        </table>
                        </div>

                        <p className='text-left px-2 font-semibold mt-10'>To:</p>
                        <form onSubmit={addReplaceCheck} className='w-full mx-auto space-y-6'>
                        <div className="mt-2 w-full px-2">
                          <table className='w-full text-sm text-gray-800'>
                            <caption className="text-left caption-top dark:text-gray-800">
                            </caption>
                            <thead>
                            <tr className='text-sm font-semibold bg-slate-600 text-gray-100'>
                              <td className='px-3 py-3 border text-left'>Date</td>
                              <td className='px-3 py-3 border text-left'>Bank</td>
                              <td className='px-3 py-3 border text-left'>Check Number</td>
                              <td className='px-3 py-3 border text-left w-1/4'>Payee</td>
                              <td className='px-3 py-3 border text-right'>Amount</td>
                              <td className='px-3 py-3 border text-center'>-</td>
                            </tr>
                            </thead>
                            <tbody>
                              <tr className='bg-slate-50 text-xs'>
                                <td className="px-3 py-2 border">
                                  <DatePicker
                                    selected={
                                      replacedCheckIdData.date
                                        ? new Date(replacedCheckIdData.date)
                                        : null
                                    }
                                    onChange={(date) => {
                                      if (!date) {
                                        setReplacedCheckIdData((prev) => ({
                                          ...prev,
                                          date: "",
                                        }));
                                        return;
                                      }

                                      const formattedDate = format(date, "yyyy-MM-dd"); 
                                      const displayDate = format(date, "MM/dd/yyyy");  
                                      const isBlocked = dateBlocked.some(
                                        (d) => d.date === formattedDate
                                      );

                                      if (isBlocked) {
                                        setOpen(true);
                                        setStatus(12);
                                        return;
                                      }

                                      setReplacedCheckIdData((prev) => ({
                                        ...prev,
                                        date: displayDate,
                                      }));
                                    }}
                                    dateFormat="MM/dd/yyyy"
                                    className="register-link text-center p-2 w-full border border-gray-300 text-xs text-gray-800 rounded-md outline-blue-500"
                                    placeholderText="MM/DD/YYYY"
                                  />
                                </td>
                                <td className='px-3 py-2 border'>
                                  {/* <input
                                    name="bank"
                                    type="text"
                                    placeholder="Bank"
                                    className="w-full border p-2 rounded text-gray-800"
                                    value={replacedCheckIdData.bank}
                                    onChange={(e) =>
                                      setReplacedCheckIdData(prev => ({ ...prev, bank: e.target.value }))
                                    }
                                  /> */}

                                  <select
                                    name="bank"
                                    value={replacedCheckIdData.bank || ""}
                                    onChange={(e) => setReplacedCheckIdData(prev => ({ ...prev, bank: e.target.value }))}
                                    className="border rounded p-2"
                                  >
                                    <option value="">Select Bank</option>
                                    <option value="PNB">PNB</option>
                                    <option value="METROBANK">METROBANK</option>
                                    <option value="BDO">BDO</option>
                                    <option value="CHINABANK">CHINABANK</option>
                                  </select>
                                </td>
                                <td className='px-3 py-2 border'>
                                  <input
                                    name="checkno"
                                    type="text"
                                    placeholder="Check Number"
                                    className="w-full border p-2 rounded text-gray-800"
                                    value={replacedCheckIdData.checkno}
                                    onChange={(e) =>
                                      setReplacedCheckIdData(prev => ({ ...prev, checkno: e.target.value }))
                                    }
                                  />
                                </td>
                                <td className='px-3 py-2 border'>
                                  <input
                                    name="payee"
                                    type="text"
                                    placeholder="Payee"
                                    className="w-full border p-2 rounded text-gray-800"
                                    value={replacedCheckIdData.payee}
                                    onChange={(e) =>
                                      setReplacedCheckIdData(prev => ({ ...prev, payee: e.target.value }))
                                    }
                                  />
                                </td>
                                <td className="px-3 py-2 border">
                                  <input
                                    name="amount"
                                    type="text"
                                    placeholder="Amount"
                                    className="w-full border p-2 rounded text-gray-800 text-right"
                                    value={replacedCheckIdData.amount}
                                    
                                    onChange={(e) => {
                                      const raw = e.target.value.replace(/,/g, "");

                                      // allow only numbers + dot
                                      if (!isNaN(raw) || raw === "") {
                                        setReplacedCheckIdData((prev) => ({
                                          ...prev,
                                          amount: raw,
                                        }));
                                      }
                                    }}

                                    onBlur={() => {
                                      setReplacedCheckIdData((prev) => ({
                                        ...prev,
                                        amount: formatAmount(prev.amount),
                                      }));
                                    }}
                                  />
                                </td>
                                <td className='px-2 py-2 border'>
                                  
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>

                        <div className="flex justify-end gap-2 mt-8">
                          <button
                            onClick={() => {setErrors(""); setSuccess("")}}
                            className="bg-blue-500 text-white px-8 py-2 rounded"
                          >
                            Save Changes
                          </button>
                        
                          <button type='button' onClick={() => setOpenReplaceCheck(false)} className="primary-btn py-2 px-6 text-sm tracking-wider  rounded-md bg-gray-300  focus:outline-none"> Cancel </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
            </DialogPanel>
          </div>
      </div>
    </Dialog>

    {/* Bank Report */}
    <Dialog open={openBankReportDial} onClose={setOpenBankReportDial} className="relative z-[999]">
      <DialogBackdrop
          transition
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
      />

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <DialogPanel transition className="relative transform overflow-hidden transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-5xl data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"> 

            <div className="flex flex-col font-[sans-serif]">
                <div className="w-full mx-auto border border-gray-300 p-6 bg-gray-50">
                  <div className="text-center mb-4">
                    <h1 className="text-2xl text-left flex"><FaFileAlt size={25} className='text-slate-600'/> Calendar Report</h1>
                    <hr className='pb-4'/>
                  <div className="flex flex-row py-2">
                    <div className='w-1/2'></div>
                    <div className="w-1/2 flex flex-col md:flex-row justify-end gap-4 items-end text-sm text-gray-800 mb-4">
                      {/* From Date */}
                      <div className="flex flex-col w-full">
                        <label htmlFor="from-date" className="mb-1 font-medium text-left">From:</label>
                        <DatePicker
                          selected={fromDate ? new Date(fromDate) : null} // convert string → Date
                          onChange={(date) => setFromDate(date ? format(date, "yyyy-MM-dd") : "")} // store string for backend
                          dateFormat="MM/dd/yyyy" // display MM-DD-YYYY in input
                          className="min-w-[90px] px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-400 w-full text-sm text-gray-800 z-[999]"
                          placeholderText="MM/DD/YYYY"
                        />
                      </div>
  
                      {/* To Date */}
                      <div className="flex flex-col w-full">
                        <label htmlFor="to-date" className="mb-1 font-medium text-left">To:</label>
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
                    <div className="flex text-red-600 text-sm -mt-4 mb-4 justify-end">{dateError}</div>
                  )}
                    <div className="max-w-5xl mx-auto">
                      <table className='w-full text-sm text-gray-800 mb-8'>
                        <thead>
                          <tr className='text-sm font-semibold bg-slate-600 text-gray-100'>
                            <td className='px-2 py-3 border text-center'>No.</td>
                            <td className='px-3 py-3 border text-center'>Date</td>
                            <td className='px-3 py-3 border text-center'>Bank</td>
                            <td className='px-3 py-3 border text-center'>Check Number</td>
                            <td className='px-3 py-3 border text-left w-1/4'>Payee</td>
                            <td className='px-3 py-3 border text-right'>Amount</td>
                            <td className='px-3 py-3 border text-center'>Status</td>
                          </tr>
                        </thead>
                        <tbody>
                          {bankReport.length > 0 ? (bankReport.map((rec, count) => (
                          <tr className='bg-slate-50 text-xs'>
                            <td className="px-2 py-2 border">{count+1}</td> 
                            <td className="px-3 py-2 border">{dayjs(rec.date).format("MM/DD/YYYY")}</td> 
                            <td className="px-3 py-2 border">{rec.bank}</td> 
                            <td className="px-3 py-2 border">{rec.checkno}</td> 
                            <td className="px-3 py-2 border text-left">{rec.payee}</td> 
                            <td className="px-3 py-2 border text-right font-semibold">
                              {parseFloat(rec.amount).toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                              })}  
                            </td> 
                            <td
                                className={`px-2 py-1 border text-center font-bold ${
                                  rec.status === "GOOD"
                                    ? "bg-green-200"
                                    : rec.status === "HOLD"
                                    ? "bg-orange-200"
                                    : rec.status === "BOUNCED"
                                    ? "bg-red-200"
                                    : rec.status === "REPLACED"
                                    ? "bg-yellow-200"
                                    : ""
                                }`}
                              >{rec.status ? rec.status : "--"}</td> 
                          </tr>
                          ))) : (
                            <tr className='text-xs bg-white border-b dark:bg-gray-100 dark:border-gray-300'>
                              <td className='px-3 py-3 text-center' colSpan={7}>Empty Record</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                      <div className="flex justify-end gap-2 mt-20"> 
                        <button type='button' onClick={() => setOpenBankReportDial(false)} className="primary-btn py-2 px-6 text-sm tracking-wider  rounded-md bg-gray-300  focus:outline-none"> Cancel </button>
                      </div>
                    </div>
                  </div>
                </div>
            </DialogPanel>
          </div>
      </div>
    </Dialog>


    <Dialog open={openSettingsDial} onClose={setOpenSettingsDial} className="relative z-[999]">
      <DialogBackdrop
          transition
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
      />

      <div className="fixed inset-0 z-10 w-screen">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <DialogPanel transition className="relative transform overflow-y-auto max-h-[90vh] transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-4xl data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"> 

              <div className="flex flex-col font-[sans-serif]">
                <div className="w-full mx-auto border border-gray-300 p-6 bg-gray-50">
                  <div className="text-center mb-4">
                    <h1 className="text-2xl text-left pb-2 flex"><FaRegSun size={38}/></h1>
                    <hr className='pb-4'/>
                    
                    <div className="max-w-4xl mx-auto">
                      <TabGroup>
                        <div className="flex gap-4">
                          
                          {/* LEFT SIDE TABS */}
                          <TabList className="flex flex-col w-48 text-sm border bg-gray-100 p-2">
                            <Tab
                              className="text-left py-3 px-4 data-[selected]:bg-white data-[selected]:shadow data-[selected]:font-semibold"
                            >
                              Limit Daily Total
                            </Tab>
                            <Tab
                              className="text-left py-3 px-4 data-[selected]:bg-white data-[selected]:shadow data-[selected]:font-semibold"
                            >
                              Blocked Dates
                            </Tab>
                          </TabList>

                          {/* RIGHT SIDE CONTENT */}
                          <TabPanels className="flex-1 min-h-[400px]">
                            
                            {/* DATE LIMIT PANEL */}
                            <TabPanel className="px-5 py-4 bg-white border">
                              <div className="border p-5 mb-8">
                                <form onSubmit={createDateLimit} className='w-full mx-auto space-y-6'>
                                <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="flex flex-col">
                                    <label className="text-sm font-medium text-gray-700 mb-1">
                                      Date
                                    </label>
                                    <DatePicker
                                      selected={dateLimitData.date ? new Date(dateLimitData.date) : null}
                                      onChange={(date) =>
                                        setDateLimitData({
                                          ...dateLimitData,
                                          date: date ? date.toLocaleDateString("en-CA") : ""
                                        })
                                      }
                                      dateFormat="MM/dd/yyyy"
                                      className="register-link p-2 py-2 w-full border border-gray-300 text-xs text-gray-800 rounded-md outline-blue-500"
                                      placeholderText="MM/DD/YYYY"
                                    />
                                    {errors.date && <p className="error text-red-700 text-left ml-2">{errors.date[0]}</p>}
                                  </div>
                                  
                                  <div className="flex flex-col">
                                    <label className="text-sm font-medium text-gray-700 mb-1">
                                      Amount
                                    </label>
                                    <input
                                      type="number"
                                      placeholder="Enter amount"
                                      value={dateLimitData.amount}
                                      onChange={(e) => setDateLimitData({ ...dateLimitData, amount: e.target.value })}
                                      className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    />
                                    {errors.amount && <p className="error text-red-700 text-left ml-2">{errors.amount[0]}</p>}
                                  </div>
                                </div>
                      
                                <div className="flex justify-end gap-2">
                                  <button
                                    className="bg-blue-500 text-white px-8 py-2 rounded"
                                  >
                                    Save
                                  </button>
                                  <button
                                    type='button'
                                    onClick={() => setOpenSettingsDial(false)}
                                    className="bg-gray-300 px-6 py-2 rounded text-gray-800"
                                  >
                                    Close
                                  </button>
                                </div>
                                </form>
                              </div>


                              <table className="w-full text-sm text-gray-800">
                                <thead>
                                  <tr className="font-semibold bg-slate-600 text-gray-100">
                                    <td className="px-3 py-3 border text-center">No.</td>
                                    <td className="px-3 py-3 border text-center">Date</td>
                                    <td className="px-3 py-3 border text-center">Amount Limit</td>
                                    <td className="px-3 py-3 border text-center">Date Added</td>
                                    <td className="px-3 py-3 border text-center">-</td>
                                  </tr>
                                </thead>
                                <tbody className="text-xs text-center bg-gray-50 dark:bg-gray-700 dark:text-gray-800 border-b-2 border-gray-300">
                                  {dateLimit.length > 0 ? (dateLimit.map((rec, i) => (
                                  <tr key={rec.id} className="text-xs bg-white border-b dark:bg-gray-100 dark:border-gray-300 hover:bg-gray-50">     
                                    <th className="px-3 py-3">{i+1}.</th>
                                    <th className="px-3 py-3">{rec.date}</th>  
                                    <th className="px-3 py-3 text-right">{rec.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</th>  
                                    <th className="px-3 py-3">{new Date(rec.created_at).toLocaleString()}</th>  
                                    <td>
                                      <button 
                                      onClick={() => openDeleteDateLimit(rec.id)} 
                                      className="primary-btn text-sm tracking-wider font-semibold rounded-md">
                                        <FaRegTrashAlt size={16} className="text-red-600"/></button>
                                    </td>  
                                  </tr>
                                  ))) : (
                                  <tr className='text-xs bg-white border-b dark:bg-gray-100 dark:border-gray-300'>
                                    <td className='px-3 py-3 text-center' colSpan={5}>No Record</td>
                                  </tr>
                                  )}
                                </tbody>
                              </table>
                            </TabPanel>

                            {/* DATE BLOCK PANEL */}
                            <TabPanel className="px-5 py-4 bg-white border">
                              <div className="border p-5 mb-8">
                                <form onSubmit={createDateBlocked} className='w-full mx-auto space-y-6'>
                                <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="flex flex-col">
                                    <label className="text-sm font-medium text-gray-700 mb-1">
                                      Date
                                    </label>
                                    <DatePicker
                                      selected={dateBlockedData.date ? new Date(dateBlockedData.date) : null}
                                      onChange={(date) =>
                                        setDateBlockedData({
                                          ...dateBlockedData,
                                          date: date ? date.toLocaleDateString("en-CA") : ""
                                        })
                                      }
                                      dateFormat="MM/dd/yyyy"
                                      className="register-link p-2 py-2 w-full border border-gray-300 text-xs text-gray-800 rounded-md outline-blue-500"
                                      placeholderText="MM/DD/YYYY"
                                    />
                                    {errors.date && <p className="error text-red-700 text-left ml-2">{errors.date[0]}</p>}
                                  </div>
                                </div>
                      
                                <div className="flex justify-end gap-2">
                                  <button
                                    className="bg-blue-500 text-white px-8 py-2 rounded"
                                  >
                                    Save
                                  </button>
                                  <button
                                    type='button'
                                    onClick={() => setOpenSettingsDial(false)}
                                    className="bg-gray-300 px-6 py-2 rounded text-gray-800"
                                  >
                                    Close
                                  </button>
                                </div>
                                </form>
                              </div>


                              <table className="w-full text-sm text-gray-800">
                                <thead>
                                  <tr className="font-semibold bg-slate-600 text-gray-100">
                                    <td className="px-3 py-3 border text-center">No.</td>
                                    <td className="px-3 py-3 border text-center">Date</td>
                                    <td className="px-3 py-3 border text-center">Date Added</td>
                                    <td className="px-3 py-3 border text-center">-</td>
                                  </tr>
                                </thead>
                                <tbody className="text-xs text-center bg-gray-50 dark:bg-gray-700 dark:text-gray-800 border-b-2 border-gray-300">
                                  {dateBlocked.length > 0 ? (dateBlocked.map((rec, i) => (
                                  <tr key={rec.id} className="text-xs bg-white border-b dark:bg-gray-100 dark:border-gray-300 hover:bg-gray-50">     
                                    <th className="px-3 py-3">{i+1}.</th>
                                    <th className="px-3 py-3">{rec.date}</th>  
                                    <th className="px-3 py-3">{new Date(rec.created_at).toLocaleString()}</th>  
                                    <td>
                                      <button 
                                      onClick={() => openDeleteDateBlocked(rec.id)} 
                                      className="primary-btn text-sm tracking-wider font-semibold rounded-md">
                                        <FaRegTrashAlt size={16} className="text-red-600"/></button>
                                    </td>  
                                  </tr>
                                  ))) : (
                                  <tr className='text-xs bg-white border-b dark:bg-gray-100 dark:border-gray-300'>
                                    <td className='px-3 py-3 text-center' colSpan={4}>No Record</td>
                                  </tr>
                                  )}
                                </tbody>
                              </table>
                            </TabPanel>

                          </TabPanels>
                        </div>
                      </TabGroup>
                    </div>

                  </div>
                </div>
              </div>
            </DialogPanel>
          </div>
      </div>
    </Dialog>


    <Dialog open={openDayCalculatorDial} onClose={setOpenDayCalculatorDial} className="relative z-[999]">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
      />

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">

        <DialogPanel
          transition
          className="relative transform transition-all
          data-[closed]:translate-y-4 data-[closed]:opacity-0
          data-[enter]:duration-300 data-[leave]:duration-200
          data-[enter]:ease-out data-[leave]:ease-in
          sm:my-8 sm:w-full sm:max-w-3xl
          data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
        >
          <div className="flex flex-col font-[sans-serif]">
            <div className="w-full mx-auto border border-gray-300 p-6 bg-gray-50">

              <div className="text-center mb-4">
                <h1 className="text-2xl text-left pb-2 flex">
                  <FaCalendarPlus size={38} />
                </h1>

                <hr className="pb-4" />

                <div className="max-w-3xl mx-auto">
                  <DayCalculator holidays={holidayData.holidays} />
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
      body="Designation successfully added!"
      okConfirm={closeCreate}
      /> 
    }

    {status === 2 &&  <ConfirmBox open={open} setOpen={setOpen}
      title="Confirm Delete"
      body="Are you sure you want to delete this designation?"
      okConfirm={handleDelete}
      /> 
    }

    {status === 3 && <UpdateBox open={open} setOpen={setOpen}
      title="Confirm Update"
      body="Are you sure you want to update this designation?"
      okConfirm={handleUpdate}
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
      body="Designation successfully deleted!"
      okConfirm={closeDelete}
      /> 
    }

    {status === 6 &&  <InfoBox open={open} setOpen={setOpen} onClose={setOpen}
      title="Confirm Success"
      body="Date limit successfully added!"
      okConfirm={closeCreate}
      /> 
    }

    {status === 7 &&  <ConfirmBox open={open} setOpen={setOpen}
      title="Confirm Delete"
      body="Are you sure you want to delete this date limit?"
      okConfirm={handleDeleteDateLimit}
      /> 
    }

    {status === 8 &&  <InfoBox open={open} setOpen={setOpen} onClose={setOpen}
      title="Confirm Success"
      body="Date limit successfully deleted!"
      okConfirm={closeDeleteDateLimit}
      /> 
    }


    {status === 9 &&  <InfoBox open={open} setOpen={setOpen} onClose={setOpen}
      title="Confirm Success"
      body="Date blocked successfully added!"
      okConfirm={closeCreate}
      /> 
    }

    {status === 10 &&  <ConfirmBox open={open} setOpen={setOpen}
      title="Confirm Delete"
      body="Are you sure you want to delete this date blocked?"
      okConfirm={handleDeleteDateBlocked}
      /> 
    }

    {status === 11 &&  <InfoBox open={open} setOpen={setOpen} onClose={setOpen}
      title="Confirm Success"
      body="Date blocked successfully deleted!"
      okConfirm={closeDeleteDateBlocked}
      /> 
    }

    {status === 12 &&  <ErrorBox open={open} setOpen={setOpen} onClose={setOpen}
      title="Error"
      body="Date selected is blocked."
      okConfirm={closeBlockedDate}
      /> 
    }

    {status === 13 &&  <AddBox open={open} setOpen={setOpen}
      title="Confirm Action"
      body="The selected date already contains data. Would you like to save it as a date limit instead?"
      okConfirm={confirmCreateDateLimit}
      /> 
    }
    
    </>
  )
};
