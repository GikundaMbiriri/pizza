const { admin, db } = require("../util/admin");
const config = require("../util/config");
// import * as sgMail from '@sendgrid/mail'
// const API_KEY =functions.config().sendgrid.key;
// const TEMPLATE_ID=functions.config().sendgrid.template;
// sgMail.setApiKey(API_KEY);
exports.getAllBlogs = (req, res) => {
  db.collection("blogs")
    .orderBy("createdAt", "desc")
    .get()
    .then((data) => {
      let blogs = [];

      data.forEach((doc) => {
        blogs.push({
          blogId: doc.id,
          body: doc.data().body,
          name: doc.data().name,
          createdAt: doc.data().createdAt,
          commentCount: doc.data().commentCount,
          likeCount: doc.data().likeCount,
          image: doc.data().image,
          topic: doc.data().topic,
          catchy: doc.data().catchy,
        });
      });
      return res.json(blogs);
    })
    .catch((err) => {
      return console.error("SORRY");
    });
};
exports.getBlogs = (req, res) => {
  db.collection("blogs")
    .orderBy("createdAt", "desc")
    .get()
    .then((data) => {
      let blogs = [];

      data.forEach((doc) => {
        blogs.push({
          blogId: doc.id,
          body: doc.data().body,
          name: doc.data().name,
          createdAt: doc.data().createdAt,
          commentCount: doc.data().commentCount,
          likeCount: doc.data().likeCount,
          image: doc.data().image,
          topic: doc.data().topic,
          catchy: doc.data().catchy,
        });
      });
      let articlesByTopics = {};
      for (const article of blogs) {
        if (!articlesByTopics[article.topic]) {
          articlesByTopics[article.topic] = [article];
        } else {
          articlesByTopics[article.topic].push(article);
        }
      }
      return res.json(articlesByTopics);
    })
    .catch((err) => {
      return console.error("SORRY");
    });
};
exports.likeBlog = (req, res) => {
  const likeDocument = db
    .collection("likes")
    .where("name", "==", req.user.name)
    .where("blogId", "==", req.params.blogId)
    .limit(1);
  const blogDocument = db.doc(`/blogs/${req.params.blogId}`);
  let blogData;
  blogDocument
    .get()
    .then((doc) => {
      if (doc.exists) {
        blogData = doc.data();
        blogData.blogId = doc.id;
        return likeDocument.get();
      } else {
        return res.status(404).json({ error: "blog not found" });
      }
    })
    .then((data) => {
      if (data.empty) {
        return db
          .collection("likes")
          .add({
            blogId: req.params.blogId,
            name: req.user.name,
          })
          .then(() => {
            blogData.likeCount++;
            return blogDocument.update({ likeCount: blogData.likeCount });
          })
          .then(() => {
            return res.json(blogData);
          });
      } else {
        return res.status(400).json({ error: "blog already liked" });
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: err.code });
    });
};
exports.editOneBlog = (req, res) => {

  const blogDocument = db.doc(`/blogs/${req.params.blogId}`);
  blogDocument.
    update({
      body:req.body.body,
      topic: req.body.topic,
      image: req.body.image,
      catchy: req.body.catchy
    })
    .then((doc) => {
     
     return res.status(200);
    })
    .catch((err) => {
      res.status(500).json({ error: "something went wrong" });
      console.error(err);
    });
};
exports.postOneBlog = (req, res) => {
  const newBlog = {
    body: req.body.body,
    createdAt: new Date().toISOString(),
    likeCount: 0,
    commentCount: 0,
    // email: req.user.email,
    topic: req.body.topic,
    image: req.body.image,
    catchy: req.body.catchy,
  };

  db.collection("blogs")
    .add(newBlog)
    .then((doc) => {
      const resBlog = newBlog;
      resBlog.blogId = doc.id;
      res.json(resBlog);
    })
    .catch((err) => {
      res.status(500).json({ error: "something went wrong" });
      console.error(err);
    });
};
exports.unlikeBlog = (req, res) => {
  const likeDocument = db
    .collection("likes")
    .where("name", "==", req.user.name)
    .where("blogId", "==", req.params.blogId)
    .limit(1);
  const blogDocument = db.doc(`/blogs/${req.params.blogId}`);
  let blogData;
  blogDocument
    .get()
    .then((doc) => {
      if (doc.exists) {
        blogData = doc.data();
        blogData.blogId = doc.id;
        return likeDocument.get();
      } else {
        return res.status(404).json({ error: "blog not found" });
      }
    })
    .then((data) => {
      if (data.empty) {
        return res.status(400).json({ error: "blog already liked" });
      } else {
        return db
          .doc(`/likes/${data.docs[0].id}`)
          .delete()
          .then(() => {
            blogData.likeCount--;
            return blogDocument.update({ likeCount: blogData.likeCount });
          })
          .then(() => {
            res.json(blogData);
          });
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: err.code });
    });
};

exports.deleteblog = (req, res) => {
  const document = db.doc(`/blogs/${req.params.blogId}`);
  document
    .get()
    .then((doc) => {
      if (!doc.exists) {
        return res.status(404).json({ error: "blog not found" });
      }
     
       else {
        return document.delete();
      }
    })
    .then(() => {
      res.json({ message: "blog deleted successfully" });
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).json({ error: err.code });
    });
};
exports.commentOnBlog = (req, res) => {
  if (req.body.message.trim() === "")
    return res.status(400).json({ comment: "Must not be empty" });
  const newComment = {
    body: req.body.message,
    createdAt: new Date().toISOString(),
    blogId: req.params.blogId,
    name: req.body.name,
    email:req.body.email
  };

  if(req.body.sub==="1"){
    const subs={
      email:req.body.email,
      name:req.body.name
    }
    db.collection("emails").add(subs).then((doc)=>{
      return res.json(subs)
    }).catch((err)=>{
      return res.json(err)
    })

  }
  db.doc(`/blogs/${req.params.blogId}`)
    .get()
    .then((doc) => {
      if (!doc.exists) {
        return res.status(404).json({ error: "blog not found" });
      }
      return doc.ref.update({ commentCount: doc.data().commentCount + 1 });
    })
    .then(() => {
      return db.collection("comments").add(newComment);
    })
    .then(() => {
      res.json(newComment);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: err.code });
    });
};
exports.uploadImage = (req, res) => {
  const BusBoy = require("busboy");
  const path = require("path");
  const os = require("os");
  const fs = require("fs");

  const busboy = new BusBoy({ headers: req.headers });
  let imageFileName;
  let imageUrl;
  let imageToBeUploaded = {};
  busboy.on("file", (fieldname, file, filename, encoding, mimetype) => {
    if (
      mimetype !== "image/jpeg" &&
      mimetype !== "image/png" &&
      mimetype !== "video/mp4" &&
      mimetype !== "audio/mpeg"
    ) {
      return res.status(400).json({ error: "wrong file format" });
    }
    const imageExtension = filename.split(".")[filename.split(".").length - 1];
    imageFileName = `${Math.round(
      Math.random() * 1000000000
    )}.${imageExtension}`;
    const filepath = path.join(os.tmpdir(), imageFileName);
    imageToBeUploaded = { filepath, mimetype };
    file.pipe(fs.createWriteStream(filepath));
  });
  busboy.on("finish", () => {
    admin
      .storage()
      .bucket()
      .upload(imageToBeUploaded.filepath, {
        resumable: false,
        metadata: {
          metadata: {
            contentType: imageToBeUploaded.mimetype,
          },
        },
      })
      .then(() => {
        imageUrl = `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${imageFileName}?alt=media`;
      })
      .then(() => {
        return res.status(201).json(imageUrl);
      })
      .catch((err) => {
        console.error(err);
        return res.status(500).json(err);
      });
  });
  busboy.end(req.rawBody);
};
exports.getOne = (req, res) => {
  let screamData = {};
  db.doc(`/blogs/${req.params.blogId}`)
    .get()
    .then((doc) => {
      if (!doc.exists) {
        return res.status(404).json({ error: "scream not found" });
      }
      screamData = doc.data();
      screamData.blogId = doc.id;
      return db
        .collection("comments")
        .orderBy("createdAt", "desc")
        .where("blogId", "==", req.params.blogId)
        .get();
    })
    .then((data) => {
      screamData.comments = [];
      data.forEach((doc) => {
        screamData.comments.push(doc.data());
      });
      return res.json(screamData);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: err });
    });
};
exports.getEmails=(req,res)=>{
let subs=[];

  db.collection("emails").get().then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
        // doc.data() is never undefined for query doc snapshots
        subs.push(doc.data());
        // console.log(doc.id, " => ", doc.data());
    });
    return res.json(subs);
  });
}


// exports.getOne = (req, res) => {
//   const document = db.doc(`/blogs/${req.params.blogId}`);
//   document
//     .get()
//     .then((doc) => {
//       if (!doc.exists) {
//         return res.status(404).json({ error: "blog not found" });
//       }
//       return res.json(doc.data());
//     })
//     .catch((err) => {
//       res.json(err);
//     });
// };