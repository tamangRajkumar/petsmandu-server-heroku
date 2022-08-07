import express from "express";
import formidable from "express-formidable";

const router = express.Router();

//import middlewares
import { requireSignin } from "../middlewares/auth";

// import controllers
import {
  createPost,
  uploadImage,
  userPosts,
  deletePost,
  fetchPostsByCategory,
  fetchIndividualPost,
  fetchPostToEdit,
  updatePost,
  submitPostComment,
  deletePostComment,
  postCommentsDataOnly,
  addFavoritePost,
  userSearchRequest
} from "../controllers/post";

router.post("/create-post", requireSignin, createPost);

router.post("/upload-image", formidable(20 * 1024 * 1024), uploadImage);
router.get("/user-posts", requireSignin, userPosts);
router.delete("/delete-post/:_id", requireSignin, deletePost);
router.post("/fetchpostsbycategory", fetchPostsByCategory);
router.get("/fetchindividualpost/:_id", fetchIndividualPost);
router.post("/fetchposttoedit", fetchPostToEdit);
router.put("/updatepost/:_postId", updatePost);
router.post("/submit-post-comment", requireSignin, submitPostComment);
router.put("/delete-post-comment", requireSignin, deletePostComment);
router.post("/post-comments-data", requireSignin, postCommentsDataOnly);
router.post("/add-favorite-post", requireSignin, addFavoritePost);
router.get("/user-search-request/:query", userSearchRequest);

module.exports = router;
