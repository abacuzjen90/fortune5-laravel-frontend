import { useState } from "react";
import { Dialog } from '@headlessui/react'
import { FaExclamationCircle, FaExclamationTriangle, FaInfo } from "react-icons/fa";
import { MdClose } from "react-icons/md";

export default function ConfirmBox(props) {
  const { open, setOpen, title, body, okConfirm } = props;
  const [closing, setClosing] = useState(false);

  const handleOkClick = () => {
    setClosing(true);
    setTimeout(() => {
      okConfirm(); 
      setClosing(false);
      setOpen(false);
    }, 300);
  };

  return (
    <Dialog open={open} onClose={setOpen} className="relative z-[999]">
      <div className="fixed inset-0 bg-gray-500 bg-opacity-75" aria-hidden="true" />

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <Dialog.Panel className={`relative transform overflow-hidden rounded-lg text-center transition-all sm:my-8 sm:w-full sm:max-w-md
            ${closing ? 'scale-75 opacity-0 duration-300' : 'scale-100 opacity-100 duration-300'}
          `}>
            <div className="flex flex-col font-[sans-serif] p-4">
              <div className="max-w-sm w-full mx-auto border border-gray-300 rounded-xl p-6 py-8 bg-gray-100">
                <div className='flex justify-end -mt-4 -mr-3'>
                  <MdClose onClick={() => setOpen(false)} size={30} className='text-slate-600 cursor-pointer' />
                </div>
                <div className='flex justify-center'>
                  <FaExclamationTriangle size={70} className="text-red-600" />
                </div>
                <Dialog.Title className="mt-5 font-bold text-2xl text-center text-slate-800">{title}</Dialog.Title>
                <hr className='w-full my-4' />
                <Dialog.Description className="p-5 py-5 mb-4 text-lg">{body}</Dialog.Description>
                <button
                  className='primary-btn py-2 px-10 text-lg tracking-wider font-semibold rounded-md text-white bg-red-600 shadow-lg hover:bg-red-400 focus:outline-none'
                  onClick={handleOkClick}
                >
                  OK
                </button>
              </div>
            </div>
          </Dialog.Panel>
        </div>
      </div>
    </Dialog>
  )
}
