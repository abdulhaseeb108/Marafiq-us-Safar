import mongoose from "mongoose";

const hotelSchema = new mongoose.Schema({
  city: { type: String, enum: ["makkah", "madinah"], required: true },
  name: { type: String, required: true },
  distanceM: Number,
  pricingStyle: { type: String, default: "per_person" },
  seasons: [
    {
      start: Date,
      end: Date,
      share: Number,
      quad: Number,
      triple: Number,
      double: Number,
      room: Number,
    },
  ],
  active: { type: Boolean, default: true },
});

export default mongoose.model("Hotel", hotelSchema);