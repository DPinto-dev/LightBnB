const properties = require("./json/properties.json");
const users = require("./json/users.json");
const { Pool } = require("pg");

const pool = new Pool(
  {
    user: "vagrant",
    password: "123",
    host: "localhost",
    database: "lightbnb"
  },
  console.log("Connected!")
);

/// Users

/**
 * Get a single user from the database given their email.
 * @param {String} email The email of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithEmail = function(email) {
  return pool
    .query(`SELECT * FROM users WHERE email = $1;`, [email])
    .then(result => result.rows[0] || null)
    .catch(err => console.log(err));
};
exports.getUserWithEmail = getUserWithEmail;

/**
 * Get a single user from the database given their id.
 * @param {string} id The id of the user.
 * @return {Promise<{}>} A promise to the user.
 */
// const getUserWithId = function(id) {
//   return Promise.resolve(users[id]);
// };
const getUserWithId = function(id) {
  return pool
    .query(`SELECT * FROM users WHERE id = $1;`, [id])
    .then(result => result.rows[0] || null)
    .catch(err => console.log(err));
};
exports.getUserWithId = getUserWithId;

/**
 * Add a new user to the database.
 * @param {{name: string, password: string, email: string}} user
 * @return {Promise<{}>} A promise to the user.
 */
// const addUser = function(user) {
//   const userId = Object.keys(users).length + 1;
//   user.id = userId;
//   users[userId] = user;
//   return Promise.resolve(user);
// };
const addUser = function(user) {
  return pool
    .query(
      `INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *;`,
      [user.name, user.email, user.password]
    )
    .then(result => result.rows[0] || null)
    .catch(err => console.log("Error inside addUser:", err.stack));
};
exports.addUser = addUser;

/// Reservations

/**
 * Get all reservations for a single user.
 * @param {string} guest_id The id of the user.
 * @return {Promise<[{}]>} A promise to the reservations.
 */
const getAllReservations = (guest_id, limit = 10) => {
  return pool
    .query(
      `SELECT properties.*, reservations.*, avg(rating) as average_rating
    FROM reservations
    JOIN properties ON reservations.property_id = properties.id
    JOIN property_reviews ON properties.id = property_reviews.property_id 
    WHERE reservations.guest_id = $1
    AND reservations.end_date < now()::date
    GROUP BY properties.id, reservations.id
    ORDER BY reservations.start_date
    LIMIT $2;`,
      [guest_id, limit]
    )
    .then(result => result.rows || null)
    .catch(err => console.log("Error inside getAllReservations:", err.stack));
};
exports.getAllReservations = getAllReservations;

/// Properties

/**
 * Get all properties.
 * @param {{}} options An object containing query options.
 * @param {*} limit The number of results to return.
 * @return {Promise<[{}]>}  A promise to the properties.
 */
const getAllProperties = (options, limit = 10) => {
  const values = []; //queryParams
  const {
    city,
    owner_id,
    minimum_price_per_night,
    maximum_price_per_night,
    minimum_rating
  } = options;

  let queryStr = `SELECT properties.*, AVG(property_reviews.rating) as average_rating
  FROM properties
  LEFT JOIN property_reviews ON properties.id = property_reviews.property_id `;

  if (city) {
    values.push(`%${city}%`);
    queryStr += ` WHERE city LIKE $${values.length} `;
  }
  if (owner_id) {
    // If one of the params have been set by the user append an 'AND' otherwise it'll be the first so append a 'WHERE'
    queryStr += values.length ? `AND` : `WHERE`;
    values.push(owner_id); //! Does it need to be a str? `${}`
    queryStr += ` owner_id = $${values.length} `;
  }
  if (minimum_price_per_night && maximum_price_per_night) {
    queryStr += values.length ? `AND` : `WHERE`;
    values.push(minimum_price_per_night * 100);
    values.push(maximum_price_per_night * 100);
    queryStr += ` cost_per_night BETWEEN $${values.length - 1} AND $${
      values.length
    } `;
  }

  queryStr += ` GROUP BY properties.id `;

  if (minimum_rating) {
    values.push(minimum_rating);
    queryStr += ` HAVING AVG(property_reviews.rating) >= $${values.length} `;
  }

  values.push(limit);
  queryStr += ` ORDER BY cost_per_night LIMIT $${values.length} `;

  console.log(queryStr, values);
  return pool
    .query(queryStr, values)
    .then(res => res.rows)
    .catch(err => console.log("Error inside getAllProperties:", err.stack));
};

exports.getAllProperties = getAllProperties;

/**
 * Add a property to the database
 * @param {{}} property An object containing all of the property details.
 * @return {Promise<{}>} A promise to the property.
 */
const addProperty = function(property) {
  const {
    owner_id,
    title,
    description,
    thumbnail_photo_url,
    cover_photo_url,
    cost_per_night,
    parking_spaces,
    number_of_bathrooms,
    number_of_bedrooms,
    country,
    street,
    city,
    province,
    post_code
  } = property;

  // For the query string I'm defaulting the properties.id and properties.active
  return pool
    .query(
      `INSERT INTO properties
    VALUES (default, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, default) RETURNING *;`,
      [
        owner_id,
        title,
        description,
        thumbnail_photo_url,
        cover_photo_url,
        cost_per_night * 100,
        parking_spaces,
        number_of_bathrooms,
        number_of_bedrooms,
        country,
        street,
        city,
        province,
        post_code
      ]
    )
    .then(result => result.rows[0] || null)
    .catch(err => console.log("Error inside addProperty:", err.stack));
};
exports.addProperty = addProperty;
