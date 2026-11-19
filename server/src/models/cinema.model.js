import mongoose from "mongoose";

const cinemaSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Cinema name is required"],
      unique: true,
      trim: true
    },

    bundleSizes: {
      type: [Number],
      required: true,

      validate: {
        validator: function (sizes) {
          if (!Array.isArray(sizes)) {
            return false;
          }

          // Must contain 1-10 bundle sizes
          if (sizes.length < 1 || sizes.length > 10) {
            return false;
          }

          // Every size must be an integer between 1 and 500
          const validSizes = sizes.every(
            size =>
              Number.isInteger(size) &&
              size >= 1 &&
              size <= 500
          );

          if (!validSizes) {
            return false;
          }

          // Bundle sizes must be unique
          const uniqueSizes = new Set(sizes);

          return uniqueSizes.size === sizes.length;
        },

        message:
          "Bundle sizes must contain 1-10 unique integers between 1 and 500"
      }
    }
  },
  {
    timestamps: true
  }
);

const Cinema = mongoose.model("Cinema", cinemaSchema);

export default Cinema;