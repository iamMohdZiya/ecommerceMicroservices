const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "name is required"],
      trim: true,
    },
    description:{
      type: String,
      required: [false],
      trim: true,
      default: "NA"
    },
    category:{
      type: String,
      required: [false],
      default: "NA"
    },
    rate: {
      type: Number,
      min: [0, "rate cannot be negative"],
      required: [true, "rate is required"],
      default: 0,
    },
    qty: {
      type: Number,
      min: [0, "qty cannot be negative"],
      required: [true, "qty is required"],
      default: 0,
    },
    rating: {
      type: Number,
      min: [1, "min rating can be 1 only"],
      max: [5, "max rating can be 5 only"],
      required: [false],
      default: 5,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Item", itemSchema);
