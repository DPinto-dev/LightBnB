-- Show all reservations for a user.
-- Select all columns from the reservations table, all columns from the properties table, and the average rating of the property.
-- Order the results from most recent start_date to least recent start_date.
-- These will end up being filtered by either "Upcoming Reservations" or "Past Reservations", so only get reservations where the end_date is in the past.
-- Use now()::date to get today's date.
-- This will only be for a single user, so use 1 for the user_id.
-- Limit the results to 10.
SELECT properties.*, reservations.*, avg(rating) as average_rating
FROM reservations
JOIN properties ON reservations.property_id = properties.id
JOIN property_reviews ON properties.id = property_reviews.property_id 
WHERE reservations.guest_id = 1
AND reservations.end_date < now()::date
GROUP BY properties.id, reservations.id
ORDER BY reservations.start_date
LIMIT 10;

-- IDK: Why? Again what is my table order, FROM/JOIN? Shoul I begin with the junction/join table? 
  --* A: Order doesn't matter much, but it matters if columns have the same name, like in this case with 'id'
-- IDK: Line 10, why can I just say guest_id instead of property_reviews.guest_id and is that how I should be writing it?
  --* A: Better to be explicit and write table_name.column_name
-- IDK: Line 11 order? one goes 1st, than many? 
  --* A: Doesn't matter, ideally do from one to many
-- IDK: Compass tell us to select ALL columns from reservations and properties table. What about same name (id)?
  --* A: It seems like that was part of the challenge, to figure out that when a new domain 'id' is retrieved durying the query execution it will overwrite the previous one, just like a new object value is overwritten when its key is assigned a new value.