const url = require('url');
const axios = require('axios');
const { URL } = url;
const { verifyJwtToken } = require('./jwt_verify');
const ssoServerJWTURL = process.env.SSO_URL + '/.netlify/functions/index/sso/v1/verifytoken';

const ssoRedirect = () => {
  return async function (req, res, next) {
    // check if the req has the queryParameter as ssoToken
    // and who is the referer.
    const { ssoToken } = req.query;

    if (ssoToken) {
      // to remove the ssoToken in query parameter redirect.
      const redirectURL = url.parse(req.url).pathname;
      try {
        const response = await axios.get(
          `${ssoServerJWTURL}?ssoToken=${ssoToken}`,
          {
            headers: {
              Authorization: 'Bearer ' + process.env.SSO_APP_TOKEN,
            }
          }
        );
        const { token, payload } = response.data;

        const decoded = await verifyJwtToken(token);
        // now that we have the decoded jwt, use the,
        // global-session-id as the session id so that
        // the logout can be implemented with the global session.
        req.session.user = decoded;
      } catch (err) {
        return next(err);
      }

      return res.redirect(`${redirectURL}`);
    }

    return next();
  };
};

module.exports = ssoRedirect;
