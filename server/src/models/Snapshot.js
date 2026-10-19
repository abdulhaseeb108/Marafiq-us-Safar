import mongoose from "mongoose";

const snapshotSchema = new mongoose.Schema({
  inputs: Object,
  result: Object,
  createdAt: { type: Date, default: Date.now },
  expiresAt: Date,
});

export default mongoose.model("Snapshot", snapshotSchema);