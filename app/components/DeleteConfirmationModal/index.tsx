"use client";

import { X, AlertTriangle } from "lucide-react";
import React from "react";

import Modal from "../Modal";

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName: string;
}

const DeleteConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  itemName,
}: DeleteConfirmationModalProps) => {
  return (
    <Modal isOpen={isOpen} closeOnEscape closeOnOutsideClick onClose={onClose}>
      <div className="relative p-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full">
            <AlertTriangle className="text-red-600 dark:text-red-400 w-6 h-6" />
          </div>
          <h2 id="modal-title" className="text-xl font-bold text-gray-900 dark:text-white">
            Confirm Deletion
          </h2>
        </div>

        <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
          Are you sure you want to delete{" "}
          <span className="font-semibold text-gray-900 dark:text-white">{itemName}</span>? This
          action cannot be undone.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors order-2 sm:order-1 cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold shadow-lg shadow-red-200 dark:shadow-none transition-all active:scale-95 order-1 sm:order-2 cursor-pointer"
          >
            Delete
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteConfirmationModal;
