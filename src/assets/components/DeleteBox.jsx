import { Description, Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'
import { FaRegTrashAlt } from "react-icons/fa";
import { MdClose } from "react-icons/md";

export default function ConfirmBox(props) {
  const {open, setOpen, title, body, okConfirm} = props;
  return (
    <Dialog open={open} onClose={setOpen}  className="relative z-[999]">
      <DialogBackdrop transition 
        className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in">
        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <DialogPanel className="relative transform overflow-hidden rounded-lg text-center transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-md data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95">
              <div className="flex flex-col font-[sans-serif] p-4">
                <div className="max-w-sm w-full mx-auto border border-gray-300 rounded-xl p-6 bg-gray-100">
                <div className='flex justify-end -mt-4 -mr-3'><MdClose onClick={() => setOpen(false)} size={30} className='text-slate-600 cursor-pointer' /></div>
                  <div className='flex justify-center'><FaRegTrashAlt size={70} className="text-red-500"/></div>
                  <DialogTitle className="mt-5 font-bold text-2xl text-center text-slate-800"> {title} </DialogTitle>
                  <hr />
                  <Description className="p-5 py-5 mb-4 text-lg">{body}</Description> 
                    <button className='primary-btn py-2 px-5 mr-5 text-lg tracking-wider font-semibold rounded-md text-slate-500 bg-gray-50 shadow-lg hover:bg-gray-100 focus:outline-none' onClick={() => setOpen(false)}>Cancel</button>
                    <button className='primary-btn py-2 px-5 text-lg tracking-wider font-semibold rounded-md text-white bg-red-500 shadow-lg hover:bg-red-400 focus:outline-none' onClick={okConfirm}>Delete</button>
                </div>
              </div>
            </DialogPanel>
          </div>
        </div>
      </DialogBackdrop>
    </Dialog>
  )
}