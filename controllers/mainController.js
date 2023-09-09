const auth = (req, res, next) => {
  req.user = { name: "Petr Klepetko" };
  next();
};

const renderIndex = (req, res) => {
  console.log("req.user.name: ", req.user.name);
  res.status(200);
  res.json({
    page: "homepage",
  });
};

const parameterTest = (req, res) => {
  const { id } = req.params;
  res.json({
    status: "success",
    object: "neco",
    id,
  });
};

const postTest = (req, res) => {
  const { id } = req.params;
  res.json({
    status: "success",
    id: id,
  });
};

module.exports = {
  auth,
  renderIndex,
  parameterTest,
  postTest,
};
