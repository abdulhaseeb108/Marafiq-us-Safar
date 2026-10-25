import mongoose from "mongoose";

const hotelSchema = new mongoose.Schema({
  destination: { type: String, default: "umrah" },
  city: { type: String, enum: ["makkah", "madinah"], required: true },
  name: { type: String, required: true },
  oldName: String,
  area: String,
  distanceM: Number,
  distanceText: String,
  category: String,
  shuttle: { type: Boolean, default: false },
  pricingStyle: { type: String, enum: ["per_person", "room_only", "on_request"], default: "per_person" },
  availableFrom: Date,
  notes: String,
  seasons: [
    { _id: false, start: Date, end: Date, share: Number, quad: Number, triple: Number, double: Number, room: Number },
  ],
  active: { type: Boolean, default: true },
});

export default mongoose.model("Hotel", hotelSchema);