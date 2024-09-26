const express = require('express')
const cors = require('cors')
const { getConnection } = require('./crowdfunding_db')
const app = express()
app.use(cors())
const port = 3000

const conn = getConnection()

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.get('/fundraiser', (req, res) => {
  const query = `
     SELECT f.FUNDRAISER_ID, f.ORGANIZER, f.CAPTION, f.TARGET_FUNDING, 
               f.CURRENT_FUNDING, f.CITY, f.ACTIVE, c.NAME AS CATEGORY_NAME
        FROM FUNDRAISER f
        JOIN CATEGORY c ON f.CATEGORY_ID = c.CATEGORY_ID
        WHERE f.active = ?
  `
  // execute will internally call prepare and query
  conn.execute(
    query,
    [true],
    function (err, results, fields) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      console.log(results); // results contains rows returned by server
      console.log(fields); // fields contains extra meta data about results, if available
      res.json(results);
    }
  );
})

app.get('/category', (req, res) => {
  // execute will internally call prepare and query
  conn.execute(
    'SELECT CATEGORY_ID, NAME FROM category',
    [true],
    function (err, results, fields) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      console.log(results); // results contains rows returned by server
      console.log(fields); // fields contains extra meta data about results, if available
      res.json(results);
    }
  );
})

// GET route to retrieve active fundraisers with categories
app.get('/search', (req, res) => {
  let query = `
        SELECT f.FUNDRAISER_ID, f.ORGANIZER, f.CAPTION, f.TARGET_FUNDING, 
               f.CURRENT_FUNDING, f.CITY, f.ACTIVE, c.NAME AS CATEGORY_NAME
        FROM FUNDRAISER f
        JOIN CATEGORY c ON f.CATEGORY_ID = c.CATEGORY_ID
        WHERE f.ACTIVE = ?
    `;

  const { organizer, city, category_id } = req.query;

  const queryVals = [true];

  // Add to condition if query parameters exists.
  if (organizer) {
    query += ' AND f.ORGANIZER = ?';
    queryVals.push(organizer);
  }

  if (city) {
    query += ' AND f.CITY = ?';
    queryVals.push(city);
  }

  if (category_id) {
    query += ' AND f.CATEGORY_ID = ?';
    queryVals.push(category_id);
  }

  console.log(query)

  conn.query(query, queryVals, (err, results, fields) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    console.log(results); // results contains rows returned by server
    console.log(fields); // fields contains extra meta data about results, if available
    res.json(results);
  });
});

// GET route to retrieve fundraiser details by ID
app.get('/fundraiser/:id', (req, res) => {
  const fundraiserId = req.params.id;
  const query = `
        SELECT f.FUNDRAISER_ID, f.ORGANIZER, f.CAPTION, f.TARGET_FUNDING, 
               f.CURRENT_FUNDING, f.CITY, f.ACTIVE, c.NAME AS CATEGORY_NAME
        FROM FUNDRAISER f
        JOIN CATEGORY c ON f.CATEGORY_ID = c.CATEGORY_ID
        WHERE f.FUNDRAISER_ID = ?
    `;

  conn.query(query, [fundraiserId], (err, results, fields) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    console.log(results); // results contains rows returned by server
    console.log(fields); // fields contains extra meta data about results, if available
    if (results.length === 0) {
      return res.status(404).json({ message: 'No fundraiser' });
    }
    res.json(results[0]);
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
