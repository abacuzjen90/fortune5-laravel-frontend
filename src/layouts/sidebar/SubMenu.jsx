import { motion } from "framer-motion";
import { IoIosArrowDown } from "react-icons/io";
import { NavLink, useLocation } from "react-router-dom";
import {
  AiOutlineTool,
  AiOutlineHdd,
  AiFillCalendar,
  AiTwotoneCalendar,
} from "react-icons/ai";
import { BsPersonLock } from "react-icons/bs";
import { TbReportAnalytics, TbCpu } from "react-icons/tb";
import { FaDollarSign, FaRegClipboard, FaRegListAlt, FaSalesforce } from "react-icons/fa";
import { FaUserLock, FaClipboardList, FaShoppingCart, FaBoxOpen, FaCashRegister, FaChartBar, FaBars, FaTags, FaUserPlus } from "react-icons/fa";


const SubMenu = ({ data, activeSubMenu, setActiveSubMenu, open }) => {
  const { pathname } = useLocation();

  const toggleSubMenu = () => {
    setActiveSubMenu(activeSubMenu === data.name ? null : data.name);
  };

  const getMenuIcon = (name) => {
    switch (name) {
      case "Authentication":
        return <BsPersonLock size={22} className="min-w-max text-slate-50" />;
      case "Maintenance":
        return <AiOutlineTool size={22} className="min-w-max text-slate-50" />;
      case "Core Modules":
        return <TbCpu size={22} className="min-w-max text-slate-50" />;
      case "Accounting":
        return <FaRegListAlt size={22} className="min-w-max text-slate-50" />;
      case "Payroll":
        return <TbReportAnalytics size={22} className="min-w-max text-slate-50" />;
      case "Calendar":
        return <AiTwotoneCalendar size={22} className="min-w-max text-slate-50" />;
      case "System":
        return <AiOutlineHdd size={22} className="min-w-max text-slate-50" />;
      default:
        return null;
    }
  };

  const getSubMenuIcon = (submenu) => {
  switch (submenu) {
    case "Register":
      return <FaUserPlus size={16} className="text-slate-400" />;
    case "Permission":
      return <FaClipboardList size={16} className="text-slate-400" />;
    case "Purchase Stock":
      return <FaShoppingCart size={16} className="text-slate-400" />;
    case "Product":
      return <FaTags size={16} className="text-slate-400" />;
    case "Product Inventory":
      return <FaBoxOpen size={16} className="text-slate-400" />;
    case "Point Of Sales":
      return <FaCashRegister size={16} className="text-slate-400" />;
    case "Reports":
      return <FaChartBar size={16} className="text-slate-400" />;
    case "General Sales Record":
      return <FaRegClipboard size={16} className="text-slate-400" />;
    case "My Calendar":
      return <AiFillCalendar size={16} className="text-slate-400" />;
    case "Menu":
      return <FaBars size={16} className="text-slate-400" />;
    default:
      return null;
  }
};
  return (
    <>
      {/* Main menu item */}
      <li
        className={`link relative ${pathname.includes(data.name.toLowerCase()) && "text-blue-600"}`}
        onClick={toggleSubMenu}
      >
        {getMenuIcon(data.name)}
        {open && <p className="flex-1 -ml-1">{data.name}</p>}
        {open && (
          <IoIosArrowDown
            className={` ${activeSubMenu === data.name && "rotate-180"} duration-200 `}
          />
        )}

        {/* Tooltip on hover when collapsed */}
        {!open && (
          <span className="absolute left-14 bg-slate-900 text-slate-50 text-xs px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
            {data.name}
          </span>
        )}
      </li>

      {/* Submenu (inline, same approach for expanded & collapsed) */}
      <motion.ul
        animate={
          activeSubMenu === data.name
            ? { height: "fit-content", opacity: 1 }
            : { height: 0, opacity: 0 }
        }
        className={`flex flex-col text-[0.8rem] font-normal overflow-hidden transition-all ${
          open ? "pl-8" : "pl-2"
        }`}
      >
        {data.menus.map((menu) => (
          <li key={menu} className="group relative py-1">
            <NavLink
              to={`/${data.name.split(" ").join("").toLowerCase()}/${menu
                .split(" ")
                .join("")
                .toLowerCase()}`}
              className="flex items-center gap-2 py-1 px-2 text-slate-50 rounded-md hover:bg-slate-700 transition-colors"
            >
              {getSubMenuIcon(menu)}
              {open && <span>{menu}</span>}
            </NavLink>

            {/* Tooltip when collapsed */}
            {!open && (
              <span className="absolute left-12 bg-slate-900 text-slate-50 text-xs px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                {menu}
              </span>
            )}
          </li>
        ))}
      </motion.ul>
    </>
  );
};

export default SubMenu;
