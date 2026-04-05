

const userController = require('../controllers/user.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

const routes = (app) => {
  // auth
  app.post('/mba/api/v1/users/register', userController.registerUser);
  app.post('/mba/api/v1/users/login', userController.loginUser);

  // protected user operations
  app.get('/mba/api/v1/users/:id', verifyToken, userController.getUser);
  app.get('/mba/api/v1/users', verifyToken, userController.getUsers);
  app.put('/mba/api/v1/users/:id', verifyToken, userController.updateUser);
  app.delete('/mba/api/v1/users/:id', verifyToken, userController.deleteUser);
};

module.exports = routes;