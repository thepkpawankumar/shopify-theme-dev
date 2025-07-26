import { createPortal } from "react-dom";

export default function Modal({children, isOpen, setIsOpen}) {

  return (
    <>
      {isOpen &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 sm:p-6">
            {/* Overlay click to close */}
            <div
              className="absolute inset-0"
              onClick={() => setIsOpen(false)}
            />

            {/* Modal container */}
            <div
              className={`
                relative z-10 w-full
                bg-white rounded-t-xl sm:rounded-xl
                shadow-lg overflow-hidden
                max-h-[90vh] overflow-y-auto
                transition-all
                sm:w-1/2 sm:max-w-2xl
                sm:mx-auto
                mt-auto sm:mt-0
              `}
            >
              {/* Close button */}
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-xl"
              >
                &times;
              </button>

              {/* Modal Content */}
              <div className="p-6">
                  {children}
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
    )
}