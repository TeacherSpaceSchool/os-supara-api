let express = require('express');
let router = express.Router();
const {getOutXMLShoroAzyk, checkOutXMLShoroAzyk} = require('../module/outXMLShoroAzyk');

router.get('/shoro/out/sales', async (req, res, next) => {
    res.set('Content+Type', 'application/xml');
    try{
        await res.status(200);
        await res.end(await getOutXMLShoroAzyk())
    } catch (err) {
        console.error(err)
        res.status(501);
        res.end('error')
    }
});

router.post('/shoro/put/sales/confirm', async (req, res, next) => {
    res.set('Content+Type', 'application/xml');
    try{
        for(let i=0;i<req.body.elements[0].elements.length;i++) {
            await checkOutXMLShoroAzyk(req.body.elements[0].elements[i].attributes.guid)
        }
         await res.status(200);
        await res.end('succes')
    } catch (err) {
        console.error(err)
        res.status(501);
        res.end('error')
    }
});

module.exports = router;