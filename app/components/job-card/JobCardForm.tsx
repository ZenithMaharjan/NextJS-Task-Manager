"use client";

import clsx from "clsx";
import { PlusCircle, X, XCircle, FileText } from "lucide-react";
import React, { useCallback, useMemo, useRef, useState } from "react";

import Dropdown from "@/components/Dropdown";
import { useToast } from "@/hooks/useToast";
import apiService from "@/services/api";
import type { CreateJobCardRequest, JobCardServiceType, JobCard } from "@/types/jobCard";
import { APIError, getErrorMessage } from "@/utils/error";

const COMPLAINT_ROW_COUNT = 5;
const KM_READING_MIN = 0;
const VEHICLE_MODELS = [
  "Ntorq125",
  "Apache200",
  "Pulsar150",
  "Splendor",
  "FZS",
  "MT15",
  "Other",
] as const;

const VEHICLE_MODEL_OPTIONS = VEHICLE_MODELS.map(m => ({ label: m, value: m }));

const SERVICE_TYPE_OPTIONS: { label: string; value: JobCardServiceType }[] = [
  { label: "First Service", value: "first_service" },
  { label: "Normal Service", value: "normal_service" },
];

const FINANCIAL_FIELDS = [
  { label: "Parts Amount", name: "partsAmount" },
  { label: "Lube Amount", name: "lubeAmount" },
  { label: "Counter Sale", name: "counterSale" },
  { label: "Labor Amount", name: "laborAmount" },
  { label: "AMC Amount", name: "amcAmount" },
  { label: "Outside Repair", name: "outsideRepair" },
  { label: "Warranty Repair", name: "warrantyRepair" },
] as const;

type FormFieldDef = {
  label: string;
  name: string;
  placeholder?: string;
  required?: boolean;
  type?: string;
};

const CUSTOMER_FIELDS: FormFieldDef[] = [
  { label: "Customer Name", name: "name", placeholder: "Ram Bahadur Shrestha", required: true },
  { label: "Address", name: "address", placeholder: "Putalisadak, Kathmandu" },
  { label: "Contact N.", name: "contactNo", placeholder: "+977-", required: true, type: "tel" },
  { label: "E-mail id", name: "emailId", placeholder: "johndoe@gmail.com", type: "email" },
];

const VEHICLE_FIELDS: FormFieldDef[] = [
  { label: "Regd N.", name: "regdNo", placeholder: "BA 1 PA 1234", required: true },
  { label: "DOS", name: "dos", type: "date" },
  { label: "Frame N.", name: "frameNo", placeholder: "MD634KH30RCA12345" },
  { label: "Engine N.", name: "engineNo", placeholder: "H30ECA12345" },
];

interface JobCardFormProps {
  initialData?: JobCard;
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface AmountsData {
  partsAmount: number;
  lubeAmount: number;
  counterSale: number;
  laborAmount: number;
  amcAmount: number;
  outsideRepair: number;
  warrantyRepair: number;
}

interface FormState {
  date: string;
  timeIn: string;
  customer: {
    name: string;
    address: string;
    contactNo: string;
    emailId: string;
  };
  vehicle: {
    model: string;
    regdNo: string;
    dos: string;
    frameNo: string;
    engineNo: string;
  };
  serviceType: JobCardServiceType;
  kmReading: number;
  customerComplaints: string[];
  observations: string[];
  amounts: AmountsData;
}

const getDefaultFormState = (): FormState => {
  const now = new Date();
  const defaultDate = now.toISOString().split("T")[0];
  const defaultTimeIn = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;

  return {
    date: defaultDate,
    timeIn: defaultTimeIn,
    customer: { name: "", address: "", contactNo: "", emailId: "" },
    vehicle: {
      model: VEHICLE_MODELS[0],
      regdNo: "",
      dos: new Date().toISOString().split("T")[0],
      frameNo: "",
      engineNo: "",
    },
    serviceType: "first_service",
    kmReading: KM_READING_MIN,
    customerComplaints: Array(COMPLAINT_ROW_COUNT).fill(""),
    observations: Array(COMPLAINT_ROW_COUNT).fill(""),
    amounts: {
      partsAmount: 0,
      lubeAmount: 0,
      counterSale: 0,
      laborAmount: 0,
      amcAmount: 0,
      outsideRepair: 0,
      warrantyRepair: 0,
    },
  };
};

const INPUT_CLS =
  "w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm text-gray-700 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm";

const DATE_INPUT_CLS =
  "w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm text-gray-700 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm [color-scheme:light] dark:[color-scheme:dark]";

const LABEL_CLS =
  "block text-xs font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-200 mb-1.5";

const SECTION_CLS =
  "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm";

export default function JobCardForm({ initialData, onSuccess, onCancel }: JobCardFormProps) {
  const { showToast } = useToast();
  const isEditMode = !!initialData;

  const initialFormState = useMemo<FormState>(() => {
    if (initialData) {
      return {
        date: initialData.date.split("T")[0],
        timeIn: initialData.timeIn,
        customer: {
          name: initialData.customer.name,
          address: initialData.customer.address || "",
          contactNo: initialData.customer.contactNo,
          emailId: initialData.customer.emailId || "",
        },
        vehicle: {
          model: initialData.vehicle.model,
          regdNo: initialData.vehicle.regdNo,
          dos: initialData.vehicle.dos || new Date().toISOString().split("T")[0],
          frameNo: initialData.vehicle.frameNo || "",
          engineNo: initialData.vehicle.engineNo || "",
        },
        serviceType: initialData.serviceType,
        kmReading: initialData.kmReading,
        customerComplaints: [
          ...initialData.customerComplaints,
          ...Array(Math.max(0, COMPLAINT_ROW_COUNT - initialData.customerComplaints.length)).fill(
            "",
          ),
        ],
        observations: [
          ...initialData.observations,
          ...Array(Math.max(0, COMPLAINT_ROW_COUNT - initialData.observations.length)).fill(""),
        ],
        amounts: {
          partsAmount: Number(initialData.data?.partsAmount || 0),
          lubeAmount: Number(initialData.data?.lubeAmount || 0),
          counterSale: Number(initialData.data?.counterSale || 0),
          laborAmount: Number(initialData.data?.laborAmount || 0),
          amcAmount: Number(initialData.data?.amcAmount || 0),
          outsideRepair: Number(initialData.data?.outsideRepair || 0),
          warrantyRepair: Number(initialData.data?.warrantyRepair || 0),
        },
      };
    }
    return getDefaultFormState();
  }, [initialData]);

  const [formState, setFormState] = useState<FormState>(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const complaintsScrollRef = useRef<HTMLDivElement>(null);
  const newComplaintInputRef = useRef<HTMLInputElement>(null);

  const totalAmount = useMemo(() => {
    const {
      partsAmount,
      lubeAmount,
      counterSale,
      laborAmount,
      amcAmount,
      outsideRepair,
      warrantyRepair,
    } = formState.amounts;
    return (
      partsAmount +
      lubeAmount +
      counterSale +
      laborAmount +
      amcAmount +
      outsideRepair +
      warrantyRepair
    );
  }, [formState.amounts]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormState(prev => {
      if (name in prev.customer) {
        return { ...prev, customer: { ...prev.customer, [name]: value } };
      }
      if (name in prev.vehicle) {
        return { ...prev, vehicle: { ...prev.vehicle, [name]: value } };
      }
      return { ...prev, [name]: value };
    });
  }, []);

  const handleNumericChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = value === "" ? 0 : Number(value);

    setFormState(prev => {
      if (name in prev.amounts) {
        return { ...prev, amounts: { ...prev.amounts, [name]: numValue } };
      }
      return { ...prev, [name]: numValue };
    });
  }, []);

  const handleArrayChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const index = parseInt(e.target.dataset.index ?? "0", 10);
    const fieldName = name as "customerComplaints" | "observations";

    setFormState(prev => {
      const arr = [...prev[fieldName]];
      arr[index] = value;
      return { ...prev, [fieldName]: arr };
    });
  }, []);

  const handleVehicleModelSelect = useCallback((value: string) => {
    setFormState(prev => ({
      ...prev,
      vehicle: { ...prev.vehicle, model: value === "Other" ? "" : value },
    }));
  }, []);

  const handleCustomVehicleModelChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setFormState(prev => ({ ...prev, vehicle: { ...prev.vehicle, model: value } }));
  }, []);

  const handleServiceTypeSelect = useCallback((value: JobCardServiceType) => {
    setFormState(prev => ({ ...prev, serviceType: value }));
  }, []);

  const handleReset = useCallback(() => {
    setFormState(getDefaultFormState());
  }, []);

  const handleAddComplaintRow = useCallback(() => {
    setFormState(prev => ({
      ...prev,
      customerComplaints: [...prev.customerComplaints, ""],
      observations: [...prev.observations, ""],
    }));

    requestAnimationFrame(() => {
      complaintsScrollRef.current?.scrollTo({
        top: complaintsScrollRef.current.scrollHeight,
        behavior: "smooth",
      });
      newComplaintInputRef.current?.focus();
    });
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      const payload: CreateJobCardRequest = {
        date: formState.date,
        timeIn: formState.timeIn,
        customer: { ...formState.customer },
        vehicle: { ...formState.vehicle },
        serviceType: formState.serviceType,
        kmReading: formState.kmReading,
        customerComplaints: formState.customerComplaints.filter(c => c.trim() !== ""),
        observations: formState.observations.filter(o => o.trim() !== ""),
        data: { ...formState.amounts },
      };

      try {
        setIsSubmitting(true);
        if (isEditMode && initialData?._id) {
          await apiService.updateJobCard(initialData._id, payload);
          showToast("Job card updated successfully", "success");
        } else {
          await apiService.createJobCard(payload);
          showToast("Job card created successfully", "success");
          handleReset();
        }
        onSuccess?.();
      } catch (error) {
        if (error instanceof APIError && error.message === "Conflict") {
          showToast("Job card number already exists", "error");
        } else {
          showToast(getErrorMessage(error as Error) ?? "Failed to save job card", "error");
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [formState, showToast, handleReset, onSuccess, isEditMode, initialData],
  );

  return (
    <div className="relative space-y-6 p-6">
      {onCancel && (
        <div className="sticky top-0 z-50 flex justify-end -mt-4 -mr-4 mb-4">
          <button
            onClick={onCancel}
            className="p-2 rounded-full bg-white dark:bg-gray-800 text-gray-500 hover:text-red-500 shadow-xl border border-gray-100 dark:border-gray-700 transition-all cursor-pointer group hover:scale-110 active:scale-90"
            aria-label="Close form"
          >
            <X className="w-5 h-5 transition-transform group-hover:rotate-90" strokeWidth={3} />
          </button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            {isEditMode ? (
              <>
                Update <span className="text-blue-600">Job Card</span>
              </>
            ) : (
              <>
                New <span className="text-blue-600">Job Card</span>
              </>
            )}
          </h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400 text-sm">
            {isEditMode ? "Update service center record" : "Create a new service center record"}
          </p>
        </div>
        {isEditMode && (
          <div className="bg-blue-50 dark:bg-blue-900/30 px-4 py-2 rounded-xl border border-blue-100 dark:border-blue-900/50">
            <span className="text-xs font-black text-blue-700 dark:text-blue-400 uppercase tracking-widest">
              Job Card No: {initialData?.jobCardNo}
            </span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className={SECTION_CLS}>
          <p className="text-sm font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-4">
            Date &amp; Time
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className={LABEL_CLS}>Date</label>
              <input
                type="date"
                name="date"
                required
                readOnly={isEditMode}
                value={formState.date}
                onChange={handleChange}
                className={clsx(DATE_INPUT_CLS, isEditMode && "opacity-60 cursor-not-allowed")}
              />
            </div>
            <div>
              <label className={LABEL_CLS}>Time In</label>
              <input
                type="time"
                name="timeIn"
                required
                readOnly={isEditMode}
                value={formState.timeIn}
                onChange={handleChange}
                className={clsx(DATE_INPUT_CLS, isEditMode && "opacity-60 cursor-not-allowed")}
              />
            </div>
          </div>
        </div>

        <div className={SECTION_CLS}>
          <p className="text-sm font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-4">
            Customer Details
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {CUSTOMER_FIELDS.map(field => (
              <div key={field.name}>
                <label className={LABEL_CLS}>
                  {field.label} {field.required && <span className="text-red-500">*</span>}
                </label>
                <input
                  type={field.type || "text"}
                  name={field.name}
                  required={field.required}
                  readOnly={isEditMode}
                  value={formState.customer[field.name as keyof typeof formState.customer]}
                  onChange={handleChange}
                  placeholder={field.placeholder}
                  className={clsx(INPUT_CLS, isEditMode && "opacity-60 cursor-not-allowed")}
                />
              </div>
            ))}
          </div>
        </div>

        <div className={SECTION_CLS}>
          <p className="text-sm font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-4">
            Vehicle Details
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
            <div>
              <label className={LABEL_CLS}>Model</label>
              <Dropdown
                value={
                  VEHICLE_MODELS.includes(
                    formState.vehicle.model as (typeof VEHICLE_MODELS)[number],
                  )
                    ? formState.vehicle.model
                    : "Other"
                }
                options={VEHICLE_MODEL_OPTIONS}
                onSelect={handleVehicleModelSelect}
                disabled={isEditMode}
                className={clsx(isEditMode && "opacity-60 cursor-not-allowed")}
              />
              {!VEHICLE_MODELS.slice(0, -1).includes(
                formState.vehicle.model as (typeof VEHICLE_MODELS)[number],
              ) && (
                <input
                  type="text"
                  required
                  readOnly={isEditMode}
                  value={formState.vehicle.model}
                  onChange={handleCustomVehicleModelChange}
                  placeholder="Enter model name…"
                  className={clsx(INPUT_CLS, "mt-2", isEditMode && "opacity-60 cursor-not-allowed")}
                />
              )}
            </div>
            {VEHICLE_FIELDS.map(field => (
              <div key={field.name}>
                <label className={LABEL_CLS}>
                  {field.label} {field.required && <span className="text-red-500">*</span>}
                </label>
                <input
                  type={field.type || "text"}
                  name={field.name}
                  required={field.required}
                  readOnly={isEditMode || field.name === "dos"}
                  value={formState.vehicle[field.name as keyof typeof formState.vehicle]}
                  onChange={handleChange}
                  placeholder={field.placeholder}
                  className={clsx(
                    field.type === "date" ? DATE_INPUT_CLS : INPUT_CLS,
                    (isEditMode || field.name === "dos") && "opacity-60 cursor-not-allowed",
                  )}
                />
              </div>
            ))}
          </div>
        </div>

        <div className={SECTION_CLS}>
          <p className="text-sm font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-4">
            Types of Service
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className={LABEL_CLS}>Service Type</label>
              <Dropdown
                value={formState.serviceType}
                options={SERVICE_TYPE_OPTIONS}
                onSelect={handleServiceTypeSelect}
                disabled={isEditMode}
                className={clsx(isEditMode && "opacity-60 cursor-not-allowed")}
              />
            </div>
            <div>
              <label className={LABEL_CLS}>
                KM Reading <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="kmReading"
                required
                readOnly={isEditMode}
                min={KM_READING_MIN}
                value={formState.kmReading === 0 ? "" : formState.kmReading}
                onChange={handleNumericChange}
                className={clsx(INPUT_CLS, isEditMode && "opacity-60 cursor-not-allowed")}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className={`xl:col-span-2 ${SECTION_CLS}`}>
            <div className="grid grid-cols-2 gap-6 mb-3 pr-2 px-1">
              <p className="text-sm font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">
                Customer Complaint
              </p>
              <p className="text-sm font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">
                Observation
              </p>
            </div>
            <div
              ref={complaintsScrollRef}
              className="space-y-3 max-h-72 overflow-y-auto pt-2 pb-2 px-1 pr-2 premium-scrollbar"
            >
              {formState.customerComplaints.map((_, i) => {
                const isLastRow = i === formState.customerComplaints.length - 1;
                return (
                  <div key={i} className="grid grid-cols-2 gap-6">
                    <input
                      ref={isLastRow ? newComplaintInputRef : null}
                      type="text"
                      name="customerComplaints"
                      data-index={i}
                      value={formState.customerComplaints[i]}
                      onChange={handleArrayChange}
                      placeholder={`Complaint ${i + 1}`}
                      className={INPUT_CLS}
                    />
                    <input
                      type="text"
                      name="observations"
                      data-index={i}
                      value={formState.observations[i]}
                      onChange={handleArrayChange}
                      placeholder={`Observation ${i + 1}`}
                      className={INPUT_CLS}
                    />
                  </div>
                );
              })}
            </div>
            <div className="flex justify-end mt-3 pr-2">
              <button
                type="button"
                onClick={handleAddComplaintRow}
                className="flex items-center gap-2 px-4 py-2 mt-4 rounded-xl text-sm font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 border border-blue-200 dark:border-blue-800/50 transition-colors shadow-sm cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                Add Row
              </button>
            </div>
          </div>

          <div className={SECTION_CLS}>
            <p className="text-sm font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-4">
              Financial
            </p>
            <div className="space-y-3">
              {FINANCIAL_FIELDS.map(field => (
                <div
                  key={field.name}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3"
                >
                  <span className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 shrink-0">
                    {field.label}
                  </span>
                  <input
                    type="number"
                    name={field.name}
                    min="0"
                    readOnly={isEditMode}
                    value={formState.amounts[field.name] === 0 ? "" : formState.amounts[field.name]}
                    onChange={handleNumericChange}
                    className={clsx(
                      "w-full sm:w-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-1.5 text-sm text-left sm:text-right text-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm no-spinner",
                      isEditMode && "opacity-60 cursor-not-allowed",
                    )}
                  />
                </div>
              ))}

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 border-t border-gray-100 dark:border-gray-700 pt-3 mt-2">
                <span className="text-xs sm:text-sm font-black uppercase tracking-widest text-gray-700 dark:text-white">
                  Total Amount
                </span>
                <div className="w-full sm:min-w-40 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-left sm:text-right text-sm font-bold text-blue-700 dark:text-blue-300 break-all">
                  {totalAmount.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
          {!isEditMode && (
            <button
              type="button"
              onClick={handleReset}
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl font-bold text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700 transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-2"
            >
              <XCircle className="w-4 h-4" />
              Reset
            </button>
          )}
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className={clsx(
                "px-6 py-2.5 rounded-xl font-bold text-sm transition-colors cursor-pointer flex items-center gap-2",
                isEditMode
                  ? "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700"
                  : "text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 border border-red-100 dark:border-red-900/50",
              )}
            >
              <XCircle className="w-4 h-4" />
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-8 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {isEditMode ? <FileText className="w-4 h-4" /> : <PlusCircle className="w-4 h-4" />}
            {isSubmitting
              ? isEditMode
                ? "Updating…"
                : "Adding…"
              : isEditMode
                ? "Update Job Card"
                : "Add Data"}
          </button>
        </div>
      </form>
    </div>
  );
}
