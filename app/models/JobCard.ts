import mongoose, { Schema, Model } from "mongoose";

import { JobCard } from "../types/jobCard";

export interface JobCardDocument extends Omit<JobCard, "_id" | "date"> {
  _id: mongoose.Types.ObjectId;
  date: Date;
}

const customerSchema = new Schema(
  {
    name: { type: String, required: [true, "Customer name is required"], trim: true },
    address: { type: String, trim: true },
    contactNo: { type: String, required: [true, "Contact number is required"], trim: true },
    emailId: { type: String, trim: true, lowercase: true },
  },
  { _id: false },
);

const vehicleSchema = new Schema(
  {
    model: { type: String, required: [true, "Vehicle model is required"], trim: true },
    regdNo: { type: String, required: [true, "Registration number is required"], trim: true },
    dos: { type: String, trim: true }, // Date of Sale
    frameNo: { type: String, trim: true },
    engineNo: { type: String, trim: true },
  },
  { _id: false },
);

const jobCardSchema = new Schema<JobCardDocument>(
  {
    jobCardNo: {
      type: String,
      required: [true, "Job card number is required"],
      unique: true,
      trim: true,
      index: true,
    },
    userId: {
      type: String,
      required: [true, "User ID is required"],
      index: true,
    },
    date: {
      type: Date,
      required: [true, "Date is required"],
    },
    timeIn: {
      type: String,
      required: [true, "Time in is required"],
      trim: true,
    },
    customer: {
      type: customerSchema,
      required: [true, "Customer details are required"],
    },
    vehicle: {
      type: vehicleSchema,
      required: [true, "Vehicle details are required"],
    },
    serviceType: {
      type: String,
      required: [true, "Service type is required"],
      enum: ["first_service", "normal_service"],
    },
    kmReading: {
      type: Number,
      required: [true, "KM reading is required"],
      min: [0, "KM reading must be positive"],
    },
    customerComplaints: {
      type: [String],
      default: [],
    },
    observations: {
      type: [String],
      default: [],
    },
    data: {
      type: Schema.Types.Mixed,
      default: undefined,
    },
  },
  {
    timestamps: true,
  },
);

jobCardSchema.index({ userId: 1, createdAt: -1 });
jobCardSchema.index({ "vehicle.regdNo": 1 });

// Run before validation so the auto-generated jobCardNo satisfies the required constraint
jobCardSchema.pre("validate", async function () {
  if (this.isNew && !this.jobCardNo) {
    const count = await JobCardModel.countDocuments();
    this.jobCardNo = `JC-${String(count + 1).padStart(5, "0")}`;
  }
});

const JobCardModel: Model<JobCardDocument> =
  mongoose.models.JobCard || mongoose.model<JobCardDocument>("JobCard", jobCardSchema);

export default JobCardModel;
