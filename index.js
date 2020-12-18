const app = require("./app");
const PORT = 3000;

app.listen(PORT, () => {
  console.info(`sso-consumer listening on port ${PORT}`);
});
