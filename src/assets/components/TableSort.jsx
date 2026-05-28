import { FaAngleUp, FaAngleDown } from "react-icons/fa";

export default function TableSort({ field, title, sorting, setSorting }) {
    const isActive = sorting.key === field;
  
    const applySorting = () => {
      setSorting((prev) => ({
        key: field,
        ascending: isActive ? !prev.ascending : true,
      }));
    };
  
    return (
      <div
        className="flex items-center justify-center cursor-pointer gap-2 select-none"
        onClick={applySorting}
      >
        {title}
        <div className="flex flex-col leading-none">
          <FaAngleUp
            className={`w-4 text-slate-500 ${isActive && sorting.ascending ? "text-slate-800" : ""}`}
          />
          <FaAngleDown
            className={`w-4 text-slate-500 ${isActive && !sorting.ascending ? "text-slate-800" : ""}`}
          />
        </div>
      </div>
    );
  }
  
