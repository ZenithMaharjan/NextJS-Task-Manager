import mongoose, { Schema, Model, Document } from "mongoose";

export interface WishlistDocument extends Document {
  userId: string;
  inventoryId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const wishlistSchema = new Schema<WishlistDocument>(
  {
    userId: {
      type: String,
      required: [true, "User ID is required"],
      index: true,
    },
    inventoryId: {
      type: Schema.Types.ObjectId,
      ref: "Inventory",
      required: [true, "Inventory ID is required"],
    },
  },
  {
    timestamps: true,
  },
);

// Compound index to ensure a user can't add the same item twice
wishlistSchema.index({ userId: 1, inventoryId: 1 }, { unique: true });

const WishlistModel: Model<WishlistDocument> =
  mongoose.models.Wishlist || mongoose.model<WishlistDocument>("Wishlist", wishlistSchema);

export default WishlistModel;
