import { Route, Routes, useParams, Navigate, Outlet, NavLink } from "react-router-dom";
import RootLayout from "./layouts/RootLayout";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import Branch from "./pages/maintenance/Branch";
import BranchDetails from "./pages/maintenance/BranchDetails";
import BranchType from "./pages/maintenance/BranchType";
import Employee from "./pages/maintenance/Employee";
import EmployeeDetails from "./pages/maintenance/EmployeeDetails";
import Department from "./pages/maintenance/Department";
import Designation from "./pages/maintenance/Designation";
import Destination from "./pages/maintenance/Destination";
import StockList from "./pages/maintenance/StockList";
import HardwareList from "./pages/maintenance/HardwareList";
import ProductList from "./pages/maintenance/ProductList";
import ProductIssuance from "./pages/maintenance/ProductIssuance";
import StockPurchase from "./pages/maintenance/StockPurchase";
import StockUpdate from "./pages/maintenance/StockUpdate";
import Customer from "./pages/maintenance/Customer";
import SpecialItem from "./pages/maintenance/CustomerSpecialItem";
import Supplier from "./pages/maintenance/Supplier";
import GenerateSalaries from "./pages/payroll/GenerateSalaries";
import Importfile from "./pages/payroll/ImportFile";
import LeaveEntry from "./pages/payroll/LeaveEntry";
import LeaveEntryApproval from "./pages/payroll/LeaveEntryApproval";
import Loanentry from "./pages/payroll/LoanEntry";
import Menu from "./pages/system/Menu";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Permission from "./pages/auth/Permission";
import { AppContext } from "./context/AppContext";
import { useContext } from "react";
import Header from "./layouts/sidebar/Header";
import Sidebar from "./layouts/sidebar/Index";
import CustomerConsignee from "./pages/maintenance/CustomerConsignee";
import CustomerShipper from "./pages/maintenance/CustomerShipper";
import ChargeTo from "./pages/maintenance/ChargeTo";
import MiniLoading from "./assets/components/miniLoading";
import NotFound from "./assets/components/NotFound";
import WaybillEntry from "./pages/coremodules/WaybillEntry";
import ChartOfAccounts from "./pages/maintenance/ChartOfAccounts";
import VouchersPayable from "./pages/accounting/VouchersPayable";
import PointOfSales from "./pages/maintenance/PointOfSales";
import GeneralSalesRecord from "./pages/GeneralSalesRecord";
import MyCalendar from "./pages/MyCalendar";
import RentalSpace from "./pages/RentalSpace";

const App = () => {
   const { user, loading } = useContext(AppContext);

  const SidebarLayout = () => (
    <>
    <div className="scrollbar-none overflow-x-auto">
      <Header />
      <div className="flex">
        <Sidebar />
        <div className="flex-1">
        <main className="flex-1"><Outlet /></main>
        </div>
      </div>
    </div>
    </>
  );

  return (
    <>
    <RootLayout>
      <Routes>
       
        
      {loading ? (
        <Route path="*" element={<div className="flex items-center justify-center h-screen w-full flex-col gap-2"><MiniLoading /> 
                                  <span className="text-gray-600 text-md">Loading...</span>
                                </div>} />
      ) : user ? (  
        <>
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="/login" element={<Navigate to="/dashboard" />} />

        <Route element={<SidebarLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/authentication/register" element={<Register />} />
          <Route path="/authentication/permission" element={<Permission />} />
          
          <Route path="/settings" element={<Settings />} />
          <Route path="/maintenance/branch" element={<Branch />} />
          <Route path="/maintenance/employee" element={<Employee />} />
          <Route path="/maintenance/branch" element={<Branch />} />
          <Route path="/maintenance/branchtype" element={<BranchType />} />
          <Route path="/maintenance/department" element={<Department />} />
          <Route path="/maintenance/designation" element={<Designation />} />
          <Route path="/maintenance/destination" element={<Destination />} />
          <Route path="/maintenance/customer" element={<Customer />} />
          <Route path="/maintenance/supplier" element={<Supplier />} />
          <Route path="/maintenance/chartofaccounts" element={<ChartOfAccounts />} />
          <Route path="/maintenance/chargeto" element={<ChargeTo />} />

          <Route path="/maintenance/purchasestock" element={<StockList />} />
          <Route path="/maintenance/product" element={<HardwareList />} />
          <Route path="/maintenance/productinventory" element={<ProductList />} />
          <Route path="/maintenance/pointofsales" element={<PointOfSales />} />
          <Route path="/maintenance/stockpurchase" element={<StockPurchase />} />
          <Route path="/maintenance/stockupdate/:id" element={<StockUpdate />} />
          <Route path="/maintenance/reports" element={<ProductIssuance />} />


          <Route path="/payroll/generatesalaries" element={<GenerateSalaries />} />
          <Route path="/payroll/importfile" element={<Importfile />} />
          <Route path="/payroll/leaveentry" element={<LeaveEntry />} />
          <Route path="/payroll/leaveentryapproval" element={<LeaveEntryApproval />} />
          <Route path="/payroll/loanentry" element={<Loanentry />} />
          <Route path="/coremodules/waybillentry" element={<WaybillEntry />} />
          <Route path="/system/menu" element={<Menu />} />
          <Route path="/generalsalesrecord" element={<GeneralSalesRecord />} />
          <Route path="/mycalendar" element={<MyCalendar />} />
          <Route path="/rentalspace" element={<RentalSpace />} />

          <Route path="/accounting/voucherspayable" element={<VouchersPayable />} />

          <Route path="/maintenance/customer/specialitem/:id" element={<SpecialItem />} />
          <Route path="/maintenance/customer/customerconsignee/:id" element={<CustomerConsignee />} />
          <Route path="/maintenance/customer/customershipper/:id" element={<CustomerShipper />} />
          <Route path="/maintenance/employee/details/:id" element={<EmployeeDetails />} />
          <Route path="/maintenance/branch/details/:id" element={<BranchDetails />} />

          <Route path="*" element={<NotFound />} />
        </Route>
        </>
      ) : (
        <>
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Login />} />
        </>
      )}
      
      </Routes>
    </RootLayout>

    
      
    </>
  );
};

export default App;
