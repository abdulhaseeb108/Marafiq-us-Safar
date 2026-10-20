import mongoose from "mongoose";

const leadSchema = new mongoose.Schema({
  referenceNo: { type: String, unique: true },
  snapshotId: { type: mongoose.Schema.Types.ObjectId, ref: "Snapshot", unique: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  note: String,
  consent: { type: Boolean, required: true },
  consentAt: Date,
  status: { type: String, default: "new" },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Lead", leadSchema);