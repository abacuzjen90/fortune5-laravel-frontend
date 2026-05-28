import { useContext, useEffect, useState} from "react";
import { AppContext } from "../../context/AppContext";
import LoadingBox from "../../assets/components/Loading";
import InfoBox from "../../assets/components/InfoBox";

export default function Permission() {
  const { token } = useContext(AppContext);
  const [menu, setMenu] = useState([]);
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState(0);
  const [user, setUser] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showLoading, setShowLoading] = useState(false);
  const isLoading = () => {setShowLoading(true)};
  const stopLoading = () => {setShowLoading(false)};
  const [menuCheck, setMenuCheck] = useState({});
  const [subMenuCheck, setSubMenuCheck] = useState({});
    const [verifyError, setVerifyError] = useState(null);
    const [hideError, setHideError] = useState(false);

  const [errors, setErrors] = useState();

  const handleEmployeeChange = (e) => {
    const empId = e.target.value;
    setSelectedEmployee(empId);
    getEmployeeMenu(empId);
  };

  const groupedMenu = menu.reduce((acc, item) => {
    if (!acc[item.menu_id]) acc[item.menu_id] = [];
    acc[item.menu_id].push(item);
    return acc;
  }, {});

  // useEffect(() => {
  //   const initialMenuCheck = {};
  //   const initialSubMenuCheck = {};
  
  //   Object.keys(groupedMenu).forEach(menu_id => {
  //     groupedMenu[menu_id].forEach(({ submenu_id }) => {
  //       initialSubMenuCheck[submenu_id] = true; // Check existing submenu permissions
  //     });
  
  //     // Check menu_id if at least one submenu is checked
  //     initialMenuCheck[menu_id] = groupedMenu[menu_id].length > 0;
  //   });
  
  //   setMenuCheck(initialMenuCheck);
  //   setSubMenuCheck(initialSubMenuCheck);
  // }, []);

  const submenuCheckboxChange = (e, submenu_id, menu_id) => {
    const isChecked = e.target.checked;
  
    setSubMenuCheck((prev) => {
      const updatedSubMenuCheck = { ...prev, [submenu_id]: isChecked };
      const hasCheckedSubmenus = groupedMenu[menu_id].some(({ submenu_id }) => updatedSubMenuCheck[submenu_id]);
    setMenuCheck((prevMenu) => ({ ...prevMenu, [menu_id]: hasCheckedSubmenus }));
    
    return updatedSubMenuCheck;
    });
  };

  const menuCheckboxChange = (e, menu_id) => {
    const isChecked = e.target.checked;
  
    setMenuCheck((prev) => ({ ...prev, [menu_id]: isChecked }));
    setSubMenuCheck((prev) => {
      const updatedSubMenuCheck = { ...prev };
      groupedMenu[menu_id].forEach(({ submenu_id }) => {
        updatedSubMenuCheck[submenu_id] = isChecked;
      });
      return updatedSubMenuCheck;
    });
  };
  

  // Get Menu
  async function getMenu() {
    isLoading();
    const res = await fetch("/api/menudata", {
      method: "get",  
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json();
    if(res.ok) {
      setMenu(data);
      stopLoading();
    }
  }
  useEffect(() => {
    getMenu();
  }, []);

  // Get Employee
  async function getUser() {
    const res = await fetch("/api/employee", {
      method: "get",  
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json();
    if(res.ok) {
      setUser(data);
    }
  }
  useEffect(() => {
    getUser();
  }, []);

  async function getEmployeeMenu(id) {
  if(id){
    isLoading();
    const res = await fetch(`/api/getempmenu/${id}`, {
      method: "get",  
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if(res.ok) {
      const updatedMenuCheck = {};
      const updatedSubmenuCheck = {};
      data.empmenu.forEach((perm) => {
        updatedMenuCheck[perm.menu_id] = true;
        updatedSubmenuCheck[perm.submenu_id] = true;
      });
      setMenuCheck(updatedMenuCheck);
      setSubMenuCheck(updatedSubmenuCheck);
      stopLoading();
      setErrors(null);
    }
  }
  }
  useEffect(() => {
    getEmployeeMenu();
  }, []);

  // Add Menu Access
  async function handleCreate(e) {
    e.preventDefault();
    isLoading();
    if (!selectedEmployee) {
      stopLoading();
      setErrors("Please select an employee.");
      return;
    }

    if (!Object.values(menuCheck).some(Boolean)) {
      stopLoading();
      setErrors("Cannot save empty permission.");
      return;
    }

    const updatedMenu = [];
    Object.keys(menuCheck).forEach((menu_id) => {
      if (menuCheck[menu_id]) {
        groupedMenu[menu_id].forEach(({ submenu_id }) => {
          if (subMenuCheck[submenu_id]) {
            updatedMenu.push({ menu_id, submenu_id });
          }
        });
      }
    });

    const res = await fetch("/api/emp_menu_access", {
      method: "post",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        employee_id: selectedEmployee, 
        menu: updatedMenu,
      }),
    });
    const data = await res.json();
    console.log(data);
    if (data.errors) {
      setErrors(data.errors);
      stopLoading();
    } else {
      stopLoading();
      setOpen(true);
      setStatus(1);
      setMenuCheck({});
      setSubMenuCheck({});
      setSelectedEmployee(null);
      setErrors(null);
    }
  }

  async function closeCreate() {
    setOpen(false);
  }


  useEffect(() => {
      if (errors) {
        setHideError(false); // Make sure it's visible first
    
        const hideTimer = setTimeout(() => {
          setHideError(true); // Fade out
        }, 3500); // Start fade-out a bit before removal
    
        const removeTimer = setTimeout(() => {
          setVerifyError('');
        }, 4000); // Fully remove from DOM
    
        return () => {
          clearTimeout(hideTimer);
          clearTimeout(removeTimer);
        };
      }
    }, [errors]);


  return (
    <> 
    <div className="flex items-center font-medium border-b border-slate-300 w-full">
      <main className="ml-10 flex-1 mx-auto py-4"><h1 className="text-2xl font-bold">Authentication - Permission</h1></main>
    </div>
    <div className="flex items-center font-medium flex-1 mx-auto py-4">
      <main className="flex-1 mx-auto p-4">
        <div className="max-w-full mx-auto sm:px-6 lg:px-8">
          <div className="bg-gray-50 overflow-hidden shadow-md">
            <div className="p-6 text-gray-900 dark:text-gray-100">
              <form onSubmit={handleCreate}>
              <div className="text-left caption-top dark:text-gray-800">
                <div className="flex flex-row">
                  <div className="flex w-full mb-4"><h1>User Level Access</h1></div>

                  <div className="flex">
                    <button className="h-fit flex flex-row primary-btn py-3 px-5 text-sm tracking-wider font-semibold rounded-md text-white bg-gray-800 hover:bg-gray-600 focus:outline-none">Save&nbsp;User&nbsp;Access</button>
                  </div> 
                </div>
              </div>
              <div className="overflow-auto">
                <div className='w-full mb-5'>
                  <select className='form-select text-gray-800 bg-white text-sm px-2 w-1/3 py-3 border border-gray-300 rounded-md outline-blue-500' value={selectedEmployee || ""} onChange={handleEmployeeChange}>
                    <option value="">Select Employee</option>
                    {user.map((rec, key) => (
                    <option value={rec.id} key={key}>{rec.id + " - " + rec.name + " (" + rec.branch + ")"}</option>
                    ))}
                  </select>
                </div>
                {errors ? <div className={`bg-red-100 text-red-600 text-center font-semibold py-3 rounded mb-4 transition-opacity duration-500 ease-in-out ${ hideError ? 'opacity-0' : 'opacity-100'}`}> {errors} </div> : ""}
                <div className='flex text-gray-900'>
                  {Object.entries(groupedMenu).map(([menu_id, menudata]) => (
                    <div className='flex-row w-full' key={menu_id}>
                      <div className='text-gray-800 font-bold mb-2 mr-2'>
                        <label>
                          <input type="checkbox" className='mr-1' 
                            checked={menuCheck[menu_id] || false}
                            onChange={(e) => menuCheckboxChange(e, menu_id)}
                          />
                          {menudata[0].menu_name}<hr/>
                        </label>
                      </div>
                      {groupedMenu[menu_id].map(({submenu_id, submenu_name}) => (
                      <div key={submenu_id} className='text-sm mb-1'>
                        <label>
                          <input type='checkbox' className='mr-1' 
                            checked={subMenuCheck[submenu_id] || false}
                            onChange={(e) => submenuCheckboxChange(e, submenu_id, menu_id)}
                          />
                          {submenu_name}
                        </label>
                      </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
              </form>
            </div>
          </div>
        </div>  
      </main> 
    </div>
    <LoadingBox open={showLoading} onClose={stopLoading} setOpen={stopLoading} />

    {status === 1 &&  <InfoBox open={open} setOpen={setOpen} onClose={setOpen}
      title="Confirm Success"
      body={"Menu access successfully updated!"}
      okConfirm={closeCreate}
      /> 
    }
    </>
  )
};
