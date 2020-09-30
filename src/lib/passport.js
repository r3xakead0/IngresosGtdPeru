const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const pool = require('../database');
const helpers = require('./helpers');

passport.use('local.signin', new LocalStrategy({
  usernameField: 'username',
  passwordField: 'password',
  passReqToCallback: true
}, async (req, username, password, done) => {
  const rows = await pool.query('SELECT * FROM usuario WHERE nombreUsuario = ?', [username]);
  if (rows.length > 0) {
    const user = rows[0];
    const validPassword = await helpers.matchPassword(password, user.clave);
    if (validPassword) {
      done(null, user, req.flash('success', 'Bienvenido ' + user.nombreUsuario));
    } else {
      done(null, false, req.flash('message', 'Clave incorrecta'));
    }
  } else {
    return done(null, false, req.flash('message', 'El nombre de usuario no existe'));
  }
}));

passport.use('local.signup', new LocalStrategy({
  usernameField: 'username',
  passwordField: 'password',
  passReqToCallback: true
}, async (req, username, password, done) => {
  const { fullname, email } = req.body;
  let newUser = {
    nombreCompleto: fullname,
    email: email,
    nombreUsuario: username,
    clave: password,
    administrador: false
  };
  newUser.clave = await helpers.encryptPassword(password);
  // Saving in the Database
  const result = await pool.query('INSERT INTO usuario SET ? ', newUser);
  newUser.idUsuario = result.insertId;
  return done(null, newUser);
}));

passport.serializeUser((user, done) => {
  done(null, user.idUsuario);
});

passport.deserializeUser(async (id, done) => {
  const rows = await pool.query('SELECT * FROM usuario where idUsuario = ?', [id]);
  done(null, rows[0]);
});

