const mongoose = require("mongoose");
require("dotenv").config();

const models = require("../modelData/models.js");
const User = require("../db/userModel.js");
const Photo = require("../db/photoModel.js");
const SchemaInfo = require("../db/schemaInfo.js");

const versionString = "1.0";

async function dbLoad() {
  try {
    await mongoose.connect(process.env.DB_URL);
    console.log("Successfully connected to MongoDB!");
  } catch (error) {
    console.log("Unable to connect to MongoDB!");
    console.error(error);
    return;
  }

  // Xoá data cũ
  await User.deleteMany({});
  await Photo.deleteMany({});
  await SchemaInfo.deleteMany({});
  console.log("Cleared old data.");

  // Load users
  const userModels = models.userListModel();
  const mapFakeId2RealId = {};

  for (const user of userModels) {
    try {
      const userObj = new User({
        first_name:  user.first_name,
        last_name:   user.last_name,
        location:    user.location,
        description: user.description,
        occupation:  user.occupation,
        // login_name = first_name lowercase, password = "password" mặc định
        login_name:  user.first_name.toLowerCase(),
        password:    "password",
      });
      await userObj.save();
      mapFakeId2RealId[user._id] = userObj._id;
      user.objectID = userObj._id;
      console.log(`Added user: ${user.first_name} ${user.last_name} (login: ${userObj.login_name})`);
    } catch (error) {
      console.error("Error creating user:", error.message);
    }
  }

  // Load photos + comments
  const photoModels = [];
  Object.keys(mapFakeId2RealId).forEach((id) => {
    photoModels.push(...models.photoOfUserModel(id));
  });

  for (const photo of photoModels) {
    try {
      const photoObj = await Photo.create({
        file_name: photo.file_name,
        date_time: photo.date_time,
        user_id:   mapFakeId2RealId[photo.user_id],
      });
      photo.objectID = photoObj._id;

      if (photo.comments) {
        photo.comments.forEach((comment) => {
          photoObj.comments.push({
            comment:   comment.comment,
            date_time: comment.date_time,
            user_id:   comment.user.objectID,
          });
        });
        await photoObj.save();
      }
      console.log(`Added photo: ${photo.file_name}`);
    } catch (error) {
      console.error("Error creating photo:", error.message);
    }
  }

  // SchemaInfo
  try {
    await SchemaInfo.create({ version: versionString });
    console.log("SchemaInfo created, version:", versionString);
  } catch (error) {
    console.error("Error creating schemaInfo:", error.message);
  }

  await mongoose.disconnect();
  console.log("Done! Database loaded successfully.");
}

dbLoad();

