"use client";

import { PlusCircle, X, XCircle } from "lucide-react";
import React, { useCallback, useMemo, useState } from "react";

import Dropdown from "@/components/Dropdown";
import { useToast } from "@/hooks/useToast";
import apiService from "@/services/api";
import type { CreateJobCardRequest, JobCardServiceType } from "@/types/jobCard";
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

interface JobCardFormProps {
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

export default function JobCardForm({ onSuccess, onCancel }: JobCardFormProps) {
  const { showToast } = useToast();

  const [formState, setFormState] = useState<FormState>(getDefaultFormState);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

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
        await apiService.createJobCard(payload);
        showToast("Job card created successfully", "success");
        handleReset();
        onSuccess?.();
      } catch (error) {
        if (error instanceof APIError && error.message === "Conflict") {
          showToast("Job card number already exists", "error");
        } else {
          showToast(getErrorMessage(error as any) ?? "Failed to save job card", "error");
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [formState, showToast, handleReset, onSuccess],
  );

  return (
    <div className="relative space-y-6 p-6">
      {onCancel && (
        <button
          onClick={onCancel}
          className="absolute -top-0 -right-0 z-50 p-2 rounded-full bg-white dark:bg-gray-800 text-gray-500 hover:text-red-500 shadow-xl border border-gray-100 dark:border-gray-700 transition-all cursor-pointer group hover:scale-110 active:scale-90"
          aria-label="Close form"
        >
          <X className="w-5 h-5 transition-transform group-hover:rotate-90" strokeWidth={3} />
        </button>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            New <span className="text-blue-600">Job Card</span>
          </h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400 text-sm">
            Create a new service center record
          </p>
        </div>
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
                value={formState.date}
                onChange={handleChange}
                className={DATE_INPUT_CLS}
              />
            </div>
            <div>
              <label className={LABEL_CLS}>Time In</label>
              <input
                type="time"
                name="timeIn"
                required
                value={formState.timeIn}
                onChange={handleChange}
                className={DATE_INPUT_CLS}
              />
            </div>
          </div>
        </div>

        <div className={SECTION_CLS}>
          <p className="text-sm font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-4">
            Customer Details
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div>
              <label className={LABEL_CLS}>
                Customer Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                required
                value={formState.customer.name}
                onChange={handleChange}
                placeholder="Ram Bahadur Shrestha"
                className={INPUT_CLS}
              />
            </div>
            <div>
              <label className={LABEL_CLS}>Address</label>
              <input
                type="text"
                name="address"
                value={formState.customer.address}
                onChange={handleChange}
                placeholder="Putalisadak, Kathmandu"
                className={INPUT_CLS}
              />
            </div>
            <div>
              <label className={LABEL_CLS}>
                Contact N. <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="contactNo"
                required
                value={formState.customer.contactNo}
                onChange={handleChange}
                placeholder="+977-"
                className={INPUT_CLS}
              />
            </div>
            <div>
              <label className={LABEL_CLS}>E-mail id</label>
              <input
                type="email"
                name="emailId"
                value={formState.customer.emailId}
                onChange={handleChange}
                placeholder="johndoe@gmail.com"
                className={INPUT_CLS}
              />
            </div>
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
              />
              {!VEHICLE_MODELS.slice(0, -1).includes(
                formState.vehicle.model as (typeof VEHICLE_MODELS)[number],
              ) && (
                <input
                  type="text"
                  required
                  value={formState.vehicle.model}
                  onChange={handleCustomVehicleModelChange}
                  placeholder="Enter model name… (required)"
                  className={`${INPUT_CLS} mt-2`}
                />
              )}
            </div>
            <div>
              <label className={LABEL_CLS}>
                Regd N. <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="regdNo"
                required
                value={formState.vehicle.regdNo}
                onChange={handleChange}
                placeholder="BA 1 PA 1234"
                className={INPUT_CLS}
              />
            </div>
            <div>
              <label className={LABEL_CLS}>DOS</label>
              <input
                type="date"
                name="dos"
                readOnly
                value={formState.vehicle.dos}
                onChange={handleChange}
                className={`${DATE_INPUT_CLS} opacity-75 cursor-not-allowed`}
              />
            </div>
            <div>
              <label className={LABEL_CLS}>Frame N./Chassis no.</label>
              <input
                type="text"
                name="frameNo"
                value={formState.vehicle.frameNo}
                onChange={handleChange}
                placeholder="MD634KH30RCA12345"
                className={INPUT_CLS}
              />
            </div>
            <div>
              <label className={LABEL_CLS}>Engine N.</label>
              <input
                type="text"
                name="engineNo"
                value={formState.vehicle.engineNo}
                onChange={handleChange}
                placeholder="H30ECA12345"
                className={INPUT_CLS}
              />
            </div>
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
                min={KM_READING_MIN}
                value={formState.kmReading === 0 ? "" : formState.kmReading}
                onChange={handleNumericChange}
                className={INPUT_CLS}
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
            <div className="space-y-3 max-h-72 overflow-y-auto pt-2 pb-2 px-1 pr-2 premium-scrollbar">
              {Array.from({ length: COMPLAINT_ROW_COUNT }).map((_, i) => (
                <div key={i} className="grid grid-cols-2 gap-6">
                  <input
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
              ))}
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
                    value={formState.amounts[field.name] === 0 ? "" : formState.amounts[field.name]}
                    onChange={handleNumericChange}
                    className="w-full sm:w-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-1.5 text-sm text-left sm:text-right text-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm no-spinner"
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
          <button
            type="button"
            onClick={onCancel || handleReset}
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-xl font-bold text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700 transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-2"
          >
            <XCircle className="w-4 h-4" />
            {onCancel ? "Cancel" : "Reset"}
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-8 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            {isSubmitting ? "Adding…" : "Add Data"}
          </button>
        </div>
      </form>
    </div>
  );
}
