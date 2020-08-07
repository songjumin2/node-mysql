function findAndSaveUser(Users) {
  Users.findOne({})
    .then((user) => {
      user.name = "zero";
      return user.save();
    })
    .then((user) => {
      return Users.findOne({ gender: "m" });
    })
    .catch((err) => {
      console.log(err);
    });
}

async function findAndSaveUser(Users) {
  let user = await Users.findOne({});
  user.name = "zero";
  user = await user.save();
  user = await Users.findOne({ gender: "m" });
}
