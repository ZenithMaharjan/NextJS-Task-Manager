"use client";

import clsx from "clsx";
import React, { useEffect, useRef, useCallback, ReactNode } from "react";

import Portal from "./Portal";

interface ModalProps {
  isOpen: boolean;
  children: ReactNode;
  className?: string;
  overlayClassName?: string;
  closeOnEscape?: boolean;
  closeOnOutsideClick?: boolean;
  onClose?: (reason: { escape?: boolean; outsideClick?: boolean }) => void;
}

const Modal = ({
  isOpen,
  children,
  className,
  overlayClassName,
  closeOnEscape = false,
  closeOnOutsideClick = false,
  onClose,
}: ModalProps) => {
  const wrapperRef = useRef<HTMLDivElement>(null);

  const handleKeyPressed = useCallback(
    (event: KeyboardEvent) => {
      if (closeOnEscape && event.key === "Escape") {
        onClose?.({ escape: true });
      }
    },
    [closeOnEscape, onClose],
  );

  const handleClickOutside = useCallback(
    (event: MouseEvent) => {
      if (
        closeOnOutsideClick &&
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        onClose?.({ outsideClick: true });
      }
    },
    [closeOnOutsideClick, onClose],
  );

  useEffect(() => {
    if (!isOpen) return;

    document.addEventListener("keydown", handleKeyPressed);
    document.addEventListener("mousedown", handleClickOutside);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyPressed);
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleKeyPressed, handleClickOutside]);

  if (!isOpen) return null;

  return (
    <Portal>
      <div
        className={clsx(
          "fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300",
          overlayClassName,
        )}
      >
        <div
          ref={wrapperRef}
          className={clsx(
            "bg-white dark:bg-gray-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden transform animate-in zoom-in-95 duration-200",
            className,
          )}
          role="dialog"
          aria-modal="true"
        >
          {children}
        </div>
      </div>
    </Portal>
  );
};

export default Modal;
