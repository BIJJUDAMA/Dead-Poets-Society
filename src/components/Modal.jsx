import { motion } from 'framer-motion';
import { X } from 'lucide-react';

const Modal = ({ children, onClose }) => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
    >
        <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="bg-gray-800 p-6 rounded-lg max-w-3xl w-full relative max-h-[90vh] overflow-y-auto text-white"
        >
            <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X /></button>
            {children}
        </motion.div>
    </motion.div>
);

export default Modal;
