import Post from "../models/post";
import User from "../models/user";

import cloudinary from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

// Upload Image to cloudinary and response back image url and public id
export const uploadImage = async (req, res) => {
  console.log("req files=> ", req.files);
  const imagePath = req.files.image.path;

  try {
    const result = await cloudinary.uploader.upload(imagePath);
    console.log("Uploaded image result=> ", result);
    res.json({
      url: result.secure_url,
      public_id: result.public_id,
    });
  } catch (error) {
    console.log("Error=> ", error);
  }
};

// create post submit to database
export const createPost = (req, res) => {
  // console.log(req.body);
  // console.log(req.auth._id)
  const { title, description, address, category, image, favoritePost } =
    req.body;
  // console.log(description, address, image)
  if (!(description.length && address.length && category.length)) {
    return res.json({
      error: "Description is needed",
    });
  }
  try {
    const post = new Post({
      title,
      description,
      address,
      category,
      image,
      postedBy: req.auth._id,
      favoritePost,
    });
    post.save();
    return res.json({
      saved: "true",
      post,
    });
  } catch (error) {
    console.log("Error=> ", error);
  }
};

// Fetch user post in dashboard
export const userPosts = async (req, res) => {
  // console.log(req.auth);
  try {
    const posts = await Post.find({ postedBy: req.auth._id })
      .populate("postedBy", "_id fname lname image")
      .sort({ createdAt: -1 })
      .limit(10);
    console.log(posts);
    return res.json(posts);
  } catch (error) {
    console.log("Error=>", error);
  }
};

// delete post
export const deletePost = async (req, res) => {
  // console.log(req.params._id);
  try {
    const post = await Post.findByIdAndDelete(req.params._id);
    // console.log(post.image)
    if (post.image && post.image.public_id) {
      const deleteImage = await cloudinary.uploader.destroy(
        post.image.public_id
      );
    }
    res.json({ deleted: "true" });
  } catch (error) {
    console.log("Error=> ", error);
  }
};

export const fetchPostsByCategory = async (req, res) => {
  // console.log(req.body.category);
  const category = req.body.category;

  // console.log(category);

  try {
    const posts = await Post.find({ category: category })
      .populate("postedBy", "_id image")
      .sort({ createdAt: -1 })
      .limit(10);
    // console.log(posts);
    const postCategory = posts[0].category;
    console.log(postCategory);
    return res.json({ category: postCategory, posts });
  } catch (error) {
    console.log("Error=> ", error);
  }
};

//Fetch individual post
export const fetchIndividualPost = async (req, res) => {
  // const userId = req.auth._id;
  // console.log("user id is=>", userId);
  try {
    const postId = req.params._id;
    // console.log(postId);

    const post = await Post.findById(postId)
      .populate("postedBy", "_id fname lname image email ")
      .populate("comments.postedBy", "_id fname lname image ");

    // console.log("User found", user);
    console.log(post);
    return res.json(post);
  } catch (error) {
    console.log("Error=> ", error);
  }
};

//Fetch post to edit in Modal
export const fetchPostToEdit = async (req, res) => {
  // console.log(req.body);
  try {
    const postId = req.body.postId;
    const post = await Post.findById(postId);
    // console.log(post);
    return res.json(post);
  } catch (error) {
    console.log("Error=> ", error);
  }
};

// Update Post
export const updatePost = async (req, res) => {
  // console.log(req.params._postId);
  // console.log(req.body);
  try {
    const postId = req.params._postId;
    const postData = req.body;
    // console.log(postId);
    // console.log(postData);
    const post = await Post.findByIdAndUpdate(postId, postData, { new: true });

    return res.json({ updated: "true", post });
  } catch (error) {
    console.log("Error=> ", error);
  }
};

// Submit Post Comment
export const submitPostComment = async (req, res) => {
  const userId = req.auth._id;
  // console.log(req.body.addComment)
  const comment = req.body.addComment;
  console.log(comment);
  const postId = req.body.postId;
  // console.log(req.body);
  // console.log(comment.length);
  if (comment.length == 0) {
    return res.status(400).send("Comment is required");
  }
  try {
    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      {
        $push: {
          comments: {
            text: comment,
            postedBy: userId,
          },
        },
      },
      { new: true }
    )
      .populate("postedBy", "_id fname lname image ")
      .populate("comments.postedBy", "_id fname lname image");

    console.log(updatedPost);
    return res.json({ commentPosted: "true", updatedPost });
  } catch (error) {
    console.log("Error=> ", error);
  }
};

// Delete Post Comment
export const deletePostComment = async (req, res) => {
  // console.log(req.body);
  const { postId, commentId } = req.body;

  try {
    const post = await Post.findByIdAndUpdate(
      postId,
      {
        $pull: {
          comments: {
            _id: commentId,
          },
        },
      },
      { new: true }
    );

    return res.json({ postCommentDeleted: "true" });
  } catch (error) {
    console.log("Error=> ", error);
  }
};

// Post Comments Data Only
export const postCommentsDataOnly = async (req, res) => {
  // console.log(req.body);
  const { postId } = req.body;
  // console.log(postId);
  try {
    const post = await Post.findById(postId).populate(
      "comments.postedBy",
      "_id fname lname image"
    );
    // console.log(post.comments);
    return res.json(post.comments);
  } catch (error) {
    console.log("Error=> ", error);
  }
};

// Add Favorite post
export const addFavoritePost = async (req, res) => {
  const post = req.body.post;
  const userId = req.auth._id;
  console.log(userId);
  console.log(post);
  try {
    const favoritePost = await User.findById(
      userId,
      {
        $push: {
          favoritePostsList: {
            post: post,
          },
        },
      },
      { new: true }
    );
    return res.json({ addedToFavoriteList: "true" });
  } catch (error) {}
};
