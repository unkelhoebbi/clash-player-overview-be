var express = require('express');
var router = express.Router();

let apiService = require('../services/lolApiService');

/* GET home page. */
router.get('/champion/:name', async (req, res, next) => {
  let name = req.params.name

  let response = await apiService.getMatchHistory(name);

  res.send(response);
});

module.exports = router;
