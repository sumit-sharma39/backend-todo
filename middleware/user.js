module.exports = (req, res, next) => {
  const user_id = req.headers["user-id"];
  if (user_id) req.user_id = Number(user_id);
  next();
};



