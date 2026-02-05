import { createPortal } from "react-dom";
import { motion } from "framer-motion";

type Props = {
  onClose: () => void;
};

export default function SearchModal({ onClose }: Props) {
  return createPortal(
    <div
      className="fixed inset-0 bg-black/80 flex items-end justify-center z-[9999]"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="w-full lg:w-1/3 h-1/2 bg-white rounded-t-3xl flex flex-col items-center p-5 gap-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-full flex justify-end">
          <button
            onClick={onClose}
            className="w-10 h-10 bg-black text-white rounded-xl"
          >
            X
          </button>
        </div>

        <input
          type="text"
          className="w-5/6 h-12 border border-slate-800 rounded-md p-2"
          placeholder="Поиск..."
        />
      </motion.div>
    </div>,
    document.body
  );
}
