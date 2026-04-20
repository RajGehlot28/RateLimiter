const express = require('express');
const router = express.Router();

router.get("/protected", (req, res) => {
    // request found successfully so return successful page
    return res.render('success.ejs');
});

module.exports = router;