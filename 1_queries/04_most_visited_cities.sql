-- Get a list of the most visited cities.
-- Select the name of the city and the number of reservations for that city.
-- Order the results from highest number of reservations to lowest number of reservations.

-- count the reservations relate to  properties.city  to get the city
SELECT city, COUNT(reservations) AS total_reservations
FROM properties
JOIN reservations ON properties.id = property_id
GROUP BY city
ORDER BY total_reservations DESC;

-- Compass "Correct Answer":
SELECT properties.city, count(reservations) as total_reservations
FROM reservations
JOIN properties ON property_id = properties.id
GROUP BY properties.city
ORDER BY total_reservations DESC;


-- IDK the order I should use the tables on the FROM/JOIN. I know SQL does it either way, but is there a best practice? Same thing for when should I say table.column (or even schema.table.column) our just column? What is the best practice?