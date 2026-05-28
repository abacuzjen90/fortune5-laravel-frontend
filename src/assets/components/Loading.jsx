import { Dialog, DialogBackdrop, DialogPanel, Description } from '@headlessui/react';

export default function LoadingBox(props) {
  const {open, setOpen} = props;
  return (


    <Dialog open={open} onClose={setOpen} className="relative z-[999]">
    <DialogBackdrop transition className="fixed inset-0 bg-black transition-opacity bg-opacity-50 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in" />

    <DialogPanel transition className="fixed inset-0 transform transition-all rounded-lg sm:mx-44 sm:my-36 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in">
      <div className="max-w-[25%] mx-auto">
        <svg viewBox="0 0 200 200">
          <circle fill="#FFFFFF" stroke="#FFFFFF" strokeWidth="5" r="15" cx="40" cy="65"><animate attributeName="cy" calcMode="spline" dur="2" values="65;135;65;" keySplines=".5 0 .5 1;.5 0 .5 1" repeatCount="indefinite" begin="-.4"></animate></circle><circle fill="#FFFFFF" stroke="#FFFFFF" strokeWidth="5" r="15" cx="100" cy="65"><animate attributeName="cy" calcMode="spline" dur="2" values="65;135;65;" keySplines=".5 0 .5 1;.5 0 .5 1" repeatCount="indefinite" begin="-.2"></animate></circle><circle fill="#FFFFFF" stroke="#FFFFFF" strokeWidth="5" r="15" cx="160" cy="65"><animate attributeName="cy" calcMode="spline" dur="2" values="65;135;65;" keySplines=".5 0 .5 1;.5 0 .5 1" repeatCount="indefinite" begin="0"></animate></circle>
        </svg>
        <Description className="text-center text-white text-md font-semibold outline-blue-500">Loading... Please wait</Description>
      </div>
    </DialogPanel>
    </Dialog>
  )
}