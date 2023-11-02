export function auth(req, res, next) {
  if (!req.session.loggedin) {
    res.redirect("/loginaB3dFXYZa");
  } else {
    next();
  }
}
