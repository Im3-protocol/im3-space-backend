const express = require('express');
const roomRoute = require('./room.route');
const participantsRoute = require('./participants.route');
const config = require('../../config/config');
const adminRoute = require('./admin.route');
const recorderRoute = require('./recorder.route');

const router = express.Router();

const defaultRoutes = [
  {
    path: '/rooms',
    route: roomRoute,
  },
  {
    path: '/participants',
    route: participantsRoute,
  },
  {
    path: '/admin',
    route: adminRoute,
  },
  {
    path: '/recorder',
    route: recorderRoute,
  },
];

const devRoutes = [
  // // routes available only in development mode
  // {
  //   path: '/docs',
  //   route: docsRoute,
  // },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

if (config.env === 'development') {
  devRoutes.forEach((route) => {
    router.use(route.path, route.route);
  });
}

module.exports = router;
