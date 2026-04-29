const dashboardRoutes = require('./dashboard.route');
const rolesRoutes = require('./roles.route');
const usersRoutes = require('./users.route');
const categoriesRoutes = require('./categories.route');
const productsRoutes = require('./products.route');
const consignmentsRoutes = require('./consignments.route');
const ordersRoutes = require('./orders.route');
const brandsRoutes = require('./brands.route');
const supportRoutes = require('./support.route');

module.exports = (app) => {
    const PATH_ADMIN = app.locals.prefixAdmin || '/admin';

    app.use(`${PATH_ADMIN}/dashboard`, dashboardRoutes);
    app.use(`${PATH_ADMIN}/roles`, rolesRoutes);
    app.use(`${PATH_ADMIN}/users`, usersRoutes);
    app.use(`${PATH_ADMIN}/categories`, categoriesRoutes);
    app.use(`${PATH_ADMIN}/products`, productsRoutes);
    app.use(`${PATH_ADMIN}/consignments`, consignmentsRoutes);
    app.use(`${PATH_ADMIN}/orders`, ordersRoutes);
    app.use(`${PATH_ADMIN}/brands`, brandsRoutes);
    app.use(`${PATH_ADMIN}/support`, supportRoutes);
};
