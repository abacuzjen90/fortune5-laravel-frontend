import { useEffect, useState, useContext } from "react";
import { AppContext } from "../../context/AppContext";
import { useRef } from "react";
import SubMenu from "./SubMenu";
import { motion } from "framer-motion";

// * React icons
import { IoIosArrowBack } from "react-icons/io";
import { SlSettings } from "react-icons/sl";
import { AiOutlineAppstore, AiOutlineHome, AiTwotoneCalendar } from "react-icons/ai";
import { useMediaQuery } from "react-responsive";
import { MdMenu } from "react-icons/md";
import { NavLink, useLocation } from "react-router-dom";
import MiniLoading from "../../assets/components/miniLoading";
import { FaRegClipboard } from "react-icons/fa";

import lloyd_logo from '/src/assets/images/PNG-V2-111-White.png';

const Sidebar = () => {
  const {user, token} = useContext(AppContext);
  let isTabletMid = useMediaQuery({ query: "(max-width: 768px)" });
  const [open, setOpen] = useState(isTabletMid ? false : true);
  const sidebarRef = useRef();
  const { pathname } = useLocation();
  const [menu, setMenu] = useState([]);
  const [activeSubMenu, setActiveSubMenu] = useState(null);

  const groupedMenu = menu.reduce((acc, { menu_name, submenu_name }) => {
    if (!acc[menu_name]) {
      acc[menu_name] = [];
    }
    acc[menu_name].push(submenu_name);
    return acc;
  }, {});
  
  const nestedMenu = Object.keys(groupedMenu).map((menu) => ({
    name: menu,
    menus: groupedMenu[menu],
  }));

  
  async function getEmployeeMenu(id) {
    id = user.id;
    if(id){
      const res = await fetch(`/api/getempmenu/${id}`, {
        method: "get",  
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if(res.ok) {
        setMenu(data.empmenu);
      }
    }
  }
  useEffect(() => {
    getEmployeeMenu();
  }, []);

  useEffect(() => {
    setOpen(isTabletMid ? false : true);
  }, [isTabletMid]);


  useEffect(() => {
    isTabletMid && setOpen(false);
  }, [pathname]);


  const Nav_animation = isTabletMid
    ? {
        open: {
          x: 0,
          width: "16rem",
          transition: {
            damping: 40,
          },
        },
        closed: {
          x: -250,
          width: 0,
          transition: {
            damping: 40,
            delay: 0.15,
          },
        },
      }
    : {
        open: {
          width: "16rem",
          transition: {
            damping: 40,
          },
        },
        closed: {
          width: "4rem",
          transition: {
            damping: 40,
          },
        },
      };


  return (
  <>
    <div className="bg-slate-800 text-slate-50 min-h-screen">
      <div
        onClick={() => setOpen(false)}
        className={`md:hidden fixed inset-0 max-h-screen z-[998] bg-black/50  ${
          open ? "block" : "hidden"
        } `}
      ></div>
      
      <motion.div
        ref={sidebarRef}
        variants={Nav_animation}
        initial={{ x: isTabletMid ? -250 : 0 }}
        animate={open ? "open" : "closed"}
        className="bg-slate-800 text-gray z-[999] max-w-[16rem]  w-[16rem] 
            overflow-hidden md:relative fixed h-screen min-h-max top-0">

        <NavLink to="/dashboard">
        <div className="flex items-center gap-3 font-medium border-b py-3 border-slate-300  mx-3">
          <img
            src={lloyd_logo}
            width={70}
            alt=""
          />
          <span className="text-xl whitespace-pre text-slate-50">Hardware</span>
        </div>
        </NavLink>

        <div className="flex flex-col">
          <ul className="whitespace-pre px-3 text-[0.9rem] py-5 flex flex-col gap-1  font-medium overflow-x-hidden scrollbar-thin scrollbar-track-white scrollbar-thumb-slate-100   md:h-[68%] h-[70%]">
            <li>
              <NavLink to={"/dashboard"} className="link">
                <AiOutlineAppstore size={22} className="min-w-max" />
                <p className="-ml-1">Dashboard</p>
              </NavLink>
            </li>
          {user.role === "Manager" && (
            <li>
              <NavLink to={"/mycalendar"} className="link">
                <AiTwotoneCalendar size={22} className="min-w-max" />
                <p className="-ml-1">Calendar</p>
              </NavLink>
            </li>
          )}

            <li>
              <NavLink to={"/generalsalesrecord"} className="link">
                <FaRegClipboard size={22} className="min-w-max" />
                <p className="-ml-1">General Sales Record</p>
              </NavLink>
            </li>
            
          {user.role === "Manager" && (
            <li>
              <NavLink to={"/rentalspace"} className="link">
                <AiOutlineHome size={22} className="min-w-max" />
                <p className="-ml-1">Rental</p>
              </NavLink>
            </li>
          )}

            {/* {(open || isTabletMid) && ( */}
              <div>
                {nestedMenu.length > 0 ? nestedMenu.map((menu) => (
                  <div key={menu.name} className="flex flex-col gap-1">
                    <SubMenu data={menu}
                    activeSubMenu={activeSubMenu}
                    setActiveSubMenu={setActiveSubMenu}
                    open={open} />
                  </div>
                )) : (
                  <MiniLoading />
                )
                }
              </div>
            {/* )} */}
            {/* <li>
              <NavLink to={"/settings"} className="link">
                <SlSettings size={25} className="min-w-max" />
                <p className="-ml-1">Settings</p>
              </NavLink>
            </li> */}
          </ul>
        </div>
        <motion.div
          onClick={() => {
            setOpen(!open);
          }}
          animate={
            open
              ? {
                  x: 0,
                  y: -60,
                  rotate: 0,
                }
              : {
                  x: -10,
                  y: -60,
                  rotate: 180,
                }
          }
          transition={{ duration: 0 }}
          className="absolute w-fit h-fit md:block z-50 hidden right-2 bottom-3 cursor-pointer"
        >
          <IoIosArrowBack size={25} />
        </motion.div>
      </motion.div>
      <div className="m-3 md:hidden  " onClick={() => setOpen(true)}>
        <MdMenu size={25} />
      </div>
    </div>
    </>
  );
};

export default Sidebar;
