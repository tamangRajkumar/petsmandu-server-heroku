import mongoose from "mongoose";

const { ObjectId } = mongoose.Schema;

const postSchema = new mongoose.Schema(
  {
    title: {
      type: {},
      require: true,
    },
    description: {
      type: {},
      required: true,
    },
    address: {
      type: {},
      required: true,
    },
    category: {
      type: {},
      require: true,
    },
    postedBy: {
      type: ObjectId,
      ref: "User",
    },
    image: {
      url: String,
      public_id: String,
    },

    favoritePost: "",

    likes: [{ type: ObjectId, ref: "user" }],

    comments: [
      {
        text: String,

        created: {
          type: Date,
          default: Date.now,
        },

        postedBy: {
          type: ObjectId,
          ref: "User",
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Post", postSchema);
