const express = require('express');
const router = express.Router();

const dummyData = [
  {
    customerName: "Costco",
    aprilSaleableUnit: 900,
    aprilRate: 3500,
    aprilValue: 4000,
    
    maySaleableUnit: 600,
    mayRate: 700,
    mayValue: 4000,
   
    juneSaleableUnit: 200,
    juneRate: 400,
    juneValue: 4000,
   
    julySaleableUnit: 200,
    julyRate: 400,
    julyValue: 4000,
   
    augustSaleableUnit: 200,
    augustRate: 400,
    augustValue: 4000,
  
    septemberSaleableUnit: 200,
    septemberRate: 400,
    septemberValue: 4000,
   
    octoberSaleableUnit: 200,
    octoberRate: 400,
    octoberValue: 4000,
    
    novemberSaleableUnit: 200,
    novemberRate: 400,
    novemberValue: 4000,
 
    decemberSaleableUnit: 200,
    decemberRate: 400,
    decemberValue: 4000,
   
    januarySaleableUnit: 200,
    januaryRate: 400,
    januaryValue: 4000,
 
    februarySaleableUnit: 200,
    februaryRate: 400,
    februaryValue: 4000,

    marchSaleableUnit: 200,
    marchRate: 400,
    marchValue: 4000,

  },
  {
    customerName: "Walmart",
    aprilSaleableUnit: 100,
    aprilRate: 3000,
    aprilValue: 4000,
   
    maySaleableUnit: 600,
    mayRate: 700,
    mayValue: 4000,

    juneSaleableUnit: 200,
    juneRate: 400,
    juneValue: 4000,
  
    julySaleableUnit: 200,
    julyRate: 400,
    julyValue: 4000,
  
    augustSaleableUnit: 200,
    augustRate: 400,
    augustValue: 4000,
  
    septemberSaleableUnit: 200,
    septemberRate: 400,
    septemberValue: 4000,
  
    octoberSaleableUnit: 200,
    octoberRate: 400,
    octoberValue: 4000,

    novemberSaleableUnit: 200,
    novemberRate: 400,
    novemberValue: 4000,
   
    decemberSaleableUnit: 200,
    decemberRate: 400,
    decemberValue: 4000,
  
    januarySaleableUnit: 200,
    januaryRate: 400,
    januaryValue: 4000,
  
    februarySaleableUnit: 200,
    februaryRate: 400,
    februaryValue: 4000,
  
    marchSaleableUnit: 200,
    marchRate: 400,
    marchValue: 4000,

  }
]


router.get('/',(req,res) => {
  res.json(dummyData);
})

router.post('/', (req, res) => {
  const postData = req.body;
  res.status(201).json({ message: 'post created successfully', data: postData });
});

module.exports = router;
