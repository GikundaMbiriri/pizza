const functions = require("firebase-functions");

const FBAuth = require("./util/fbAuth");
const { db } = require("./util/admin");
const {  login, getAuthenticatedUser,pizza,cont ,subs} = require("./handlers/users"
const {
  getAllBlogs,
  postOneBlog,
  editOneBlog,
  likeBlog,
  unlikeBlog,
  deleteblog,
  commentOnBlog,
  uploadImage,
  getBlogs,
  getOne,
  getEmails
} = require("./handlers/blogs");
const express = require("express");
const app = express();
const cors = require("cors");
app.use(cors());
// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
app.post('/subs',subs)
app.post('/pizza',pizza)
app.post('/cont',cont)
app.post("/upload", uploadImage);
app.get("/user", FBAuth, getAuthenticatedUser);
app.post("/blog", postOneBlog);
app.post("/login", login);
app.get("/screams", getAllBlogs);
app.get("/emails",getEmails);
app.get("/one/:blogId", getOne);
app.put("/edit/:blogId", editOneBlog);
app.get("/topics", getBlogs);
app.get("/blog/:blogId/like", FBAuth, likeBlog);
app.get("/blog/:blogId/unlike", FBAuth, unlikeBlog);
app.delete("/blog/:blogId", deleteblog);
app.post("/blog/:blogId/comment", commentOnBlog);
exports.api = functions.https.onRequest(app);
