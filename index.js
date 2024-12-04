const express = require('express');
const { resolve } = require('path');
const cors = require('cors');
const sqlite = require('sqlite');

const sqlite3 = require('sqlite3').verbose();

const app = express();
const port = 3010;

app.use(express.static('static'));
app.use(cors());
app.use(express.json());

let db;

(async () => {
  db = await sqlite.open({
    filename: './database.sqlite',
    driver: sqlite3.Database,
  });
})();

app.get('/', (req, res) => {
  res.sendFile(resolve(__dirname, 'pages/index.html'));
});

app.get('/restaurants', async (req, res) => {
  let query = 'SELECT * FROM restaurants';
  let results;
  try {
    results = await db.all(query, []);
    if (results.length == 0) {
      return res.status(404).json({ Message: 'No restaurants found' });
    }
  } catch (error) {
    return res.status(505).json({ Error: error.message });
  }
  return res.status(200).json({ Restaurants: results });
});

app.get('/restaurant/details/:id', async (req, res) => {
  let id = parseInt(req.params.id);
  let query = 'SELECT * FROM restaurants WHERE id=?';
  let result;
  try {
    result = await db.get(query, [id]);
    if (result == undefined) {
      return res
        .status(404)
        .json({ Message: 'No restaurant with the id ' + id });
    }
  } catch (error) {
    return res.status(500).json({ Error: error.message });
  }
  return res.status(200).json({ Restaurant: result });
});

app.get('/restaurants/cuisine/:cuisine', async (req, res) => {
  let cuisine = req.params.cuisine;
  let query = 'SELECT * FROM restaurants WHERE cuisine=?';
  let results;
  try {
    results = await db.all(query, [cuisine]);
    if (results.length == 0) {
      return res
        .status(404)
        .json({ Message: 'No restaurants with the cuisine ' + cuisine });
    }
  } catch (error) {
    res.status(505).json({ Error: error.message });
  }

  return res.status(200).json(results);
});

app.get('/restaurants/filter', async (req, res) => {
  let isVeg = req.query.isVeg;
  let hasOutdoorSeating = req.query.hasOutdoorSeating;
  let isLuxury = req.query.isLuxury;

  let query =
    'SELECT * FROM restaurants WHERE isVeg=? AND hasOutdoorSeating=? AND isLuxury=?';

  let results;
  try {
    results = await db.all(query, [isVeg, hasOutdoorSeating, isLuxury]);

    if (results.length == 0) {
      return res
        .status(404)
        .json({ Message: 'No restaurant found for the given parameters' });
    }
  } catch (e) {
    return res.status(500).json({ Error: e.message });
  }
  res.status(200).json({ restaurants: results });
});

app.get('/restaurants/sort-by-rating', async (req, res) => {
  let query = 'SELECT * FROM restaurants ORDER BY rating DESC';
  let results;
  try {
    results = await db.all(query, []);
  } catch (e) {
    return res.status(500).json({ Error: e.error });
  }
  return res.status(200).json({ Restaurants: results });
});

app.get('/dishes', async (req, res) => {
  let query = 'SELECT id, name,  price, rating, isVeg FROM dishes';
  let results;

  try {
    results = await db.all(query, []);
  } catch (e) {
    res.status(500).json({ Error: e.message });
  }
  return res.status(200).json({ dishes: results });
});

app.get('/dishes/details/:id', async (req, res) => {
  let id = parseInt(req.params.id);
  let query = 'SELECT * FROM dishes WHERE id=?';
  let result;
  try {
    result = await db.get(query, [id]);
    if (result.length == 0) {
      return res.status(404).json({ message: 'No dish with the id ' + id });
    }
  } catch (e) {
    return res.status(500).json({ Error: e.message });
  }
  return res.status(200).json({ dish: result });
});

app.get('/dishes/filter', async (req, res) => {
  let isVeg = req.query.isVeg;
  let query = 'SELECT * FROM DISHES WHERE isVeg=?';
  let results;
  try {
    results = await db.all(query, [isVeg]);
    if (results.length == 0) {
      return res.status(404).json({
        Message:
          'No resaurants found that are ' + isVeg == 'true' ? 'veg' : 'non-veg',
      });
    }
    return res.status(200).json({ restaurants: results });
  } catch (e) {
    res.status(500).json({ Error: e.message });
  }
});

app.get('/dishes/sort-by-price', async (req, res) => {
  let query = 'SELECT * FROM dishes  ORDER BY price';
  let results;
  try {
    results = await db.all(query, []);
    if (results.length == 0) {
      return res.status(404).json({ Message: 'Could not find restaurants' });
    }
    return res.status(200).json({ restaurants: results });
  } catch (e) {
    res.status(500).json({ Error: e.message });
  }
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
