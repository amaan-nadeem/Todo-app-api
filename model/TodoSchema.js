const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// tasks Schema
const TodoSchema = new Schema(
  {
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    isCompleted: {
      type: Boolean,
      default: false
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "userData",
      required: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Todo", TodoSchema);
