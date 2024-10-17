const express = require('express');
const { getSimulation, setSimulation, getChartSimulatedData } = require('../Services/Simulation/Simulation');
const router = express.Router();

const jsonData = require('../AppConfig/anjar.json');
const getDataDb = require('../AppConfig/getDataDB.json');
const { json } = require('body-parser');
const logger = require('../logs/logger');
const { DateTime, query } = require('mssql');





router.get('/', (req, res) => {

  // logger.info(`loading data from user ${req.query.name}`);
  try {
    logger.info(`${req.query.name} | \t ${process.env.URL}/summary/`)


    let query = ""
    let qtyquery = ""

    if (req.query.selectedProduct == 'Terry Towel' || req.query.selectedProduct == 'Bathrobe') {
      qtyquery += `( [APRIL_KGS] + [MAY_KGS] + [JUNE_KGS] + [JULY_KGS] + [AUG_KGS] + [SEP_KGS] + [OCT_KGS] + [NOV_KGS] + [DEC_KGS] + [JAN_KGS] + [FEB_KGS] + [MAR_KGS]) as totalKGS`
    }

    if (req.query.selectedProduct == 'Rugs' || req.query.selectedProduct == 'Carpet') {
      qtyquery += `( [APRIL_(SQ_MTR)] + [MAY_(SQ_MTS)] + [JUNE_(SQ_MTS)] + [JULY_(SQ_MTS)] + [AUGUST_(SQ_MTS)] + [SEP_SQ_MTS_] + [OCT_SQ_MTS] + [NOVEMBER_(SQ_MTS)] + [DECEMBER_(SQ_MTS)] + [JANUARY_(SQ_MTS)] + [FEBRUARY(SQ_MTS)] + [MARCH(SQ_MTS)]) as totalSQMT`
    }

    if (req.query.selectedProduct == 'Top of Bed' || req.query.selectedProduct == 'Sheets') {
      qtyquery += `( [APR_MTR] + [MAY_MTR] + [JUNE_MTR] + [JUL_MTR] + [AUG_MTR] + [SEP_MTR] + [OCT_MTR] + [NOV_MTR] + [DEC_MTR] + [JAN_MTR] + [FEB_MTR] + [MAR_MTR]) as totalMTR`
    }

    jsonData.map(({ key, value }, index) => {

      if (index === 0) {
        query += `SELECT TOP(15)
          ( [APR_(SALEABLE_UNITS)] + [MAY_(SALEABLE_UNITS)] + [JUN_(SALEABLE_UNITS)] + [JULY_(SALEABLE_UNITS)] + [AUGUST_(SALEABLE_UNITS)] + [SEP_(SALEABLE_UNITS)] + [OCT_(SALEABLE_UNIT)] + [NOVEMBER_(SALEABLE_UNITS)] + [DECEMBER_(SALEABLE_UNITS)] + [JANUARY_(SALEABLE_UNITS)] + [FEBRUARY_(SALEABLE_UNITS)] + [MARCH_(SALEABLE_UNITS)] ) as totalSU , 
          (( [APR_RATE_AS_PER_CURRENCY] + [MAY_RATE_AS_PER_CURRENCY] + [JUN_RATE_AS_PER_CURRENCY] + [JUL_RATE_AS_PER_CURRENCY] + [AUG_RATE_AS_PER_CURRENCY] + [SEP_RATE_AS_PER_CURRENCY] + [OCT_RATE_AS_PER_CURRENCY] + [NOV_RATE_AS_PER_CURRENCY] + [DEC_RATE_AS_PER_CURRENCY] + [JAN_RATE_AS_PER_CURRENCY] + [FEB_RATE_AS_PER_CURRENCY] + [MAR_RATE_AS_PER_CURRENCY])/12) as totalRate,
          ( [APRIL_VALUE] + [MAY_VALUE] + [JUNE_VALUE] + [JULY_VALUE] + [AUG_VALUE] + [SEPT_VALUE] + [OCT_(VALUE)] + [NOV_VALUE] + [DEC_VALUE] + [JAN_VALUE] + [FEB_VALUE] + [MAR_VALUE]) as totalValue,
          ( [APRIL_USDN] + [MAY_USDN] + [JUNE_USDN] + [JULY_USDN] + [AUG_USDN] + [SEPT_USDN] + [OCTOBER_(USDN)] + [NOV_USDN] + [DEC_USDN] + [JAN_USDN] + [FEB_USDN] + [MAR_USDN]) as totalUSDN ,
          ${qtyquery},
          ${key} as ${value},`
      }

      else if (index > 0 && index !== jsonData.length - 1) {
        query += `${key} as ${value},`
      }
      else {
        query += `${key} as ${value} from SALESPLAN_SIMULATION WHERE [PRODUCT_CAT] = '${req.query.selectedProduct}' AND (MERCHANT = '${req.query.name}' OR TEAM_LEADER = '${req.query.name}') AND [FISCAL_YEAR] = '2024-2025'`
      }
    })

    console.log("this is the initial fetch query", query);
    getSimulation(query).then((data) => {
      res.json(data);

    })
  }
  catch (error) {
    logger.verbose(`${req.query.name} | \t ${process.env.URL}/summary/ | \t ${error}`)
  }

});



router.get('/getPublishedData', (req, res) => {

  try {
    // console.log(req);
    logger.info(`${req.query.teamLeader} | \t ${process.env.URL}/summary/getPublishedData`)

    let query = '';


    let productList = req.query.productList.split(",")
    // console.log(productList);

    let newList = []
    productList.map((item) => {
      newList = [...newList, `'${item}'`]
    })



    if (req.query.teamLeader == 'DEBASHISH BAGG' || req.query.teamLeader == 'ANIL SANGALE' || req.query.teamLeader == 'VISHWAJEET SANKPAL' || req.query.teamLeader == 'SNEHAL SHAH') {
      query += `SELECT
      sp.[VERSION_NO] AS 'versionNo',
      sp.[UNIQUE_IDENTIFICATION_NO] AS 'UNIQUE IDENTIFICATION NO',
      ss.[PLANT] AS 'PLANT',
    ss.[PRODUCT_CAT] AS 'PRODUCT CAT',
    ss.[PRODUCT_SUBCAT] AS 'PRODUCT SUBCAT',
      ss.[SR_NO] AS 'SR NO',
    ss.[REGION] AS 'REGION',
    ss.[PROGRAM] AS 'PROGRAM',
      ss.[PROGRAM_CODE__↑] AS 'PROGRAM CODE ↑',
    ss.[END_CUSTOMER_CODE] AS 'END CUSTOMER CODE',
      sp.[END_CUSTOMER_NAME] AS 'END CUSTOMER NAME',
    ss.[MATCODE] AS 'MATCODE',
    ss.[TEAM_LEADER] AS 'TEAM LEADER',
    ss.[MATERIAL_DESCRIPTION] AS 'MATERIAL DESCRIPTION',
      ss.[MERCHANT] AS 'MERCHANT',
      ss.[PCS_IN_SET] AS 'PCS IN SET',


    sp.[APR_(SALEABLE_UNITS)] AS 'APR (SALEABLE UNITS)',
      (sp.[APR_(SALEABLE_UNITS)] * ss.[NO_OF_PCS_IN_SET]) AS 'APRIL PCS',
    sp.[APR_RATE_AS_PER_CURRENCY] AS 'APR RATE AS PER CURRENCY',
      sp.[APRIL_KGS] AS 'APRIL KGS',
      sp.[APRIL_USDN] AS 'APRIL USDN',
      sp.[APRIL_VALUE] AS 'APRIL VALUE',
      sp.[AUG_KGS] AS 'AUG KGS',
      ss.[APRIL_(SQ_MTR)] AS 'APRIL (SQ MTR)',
      ss.[APR_MTR] AS 'APR MTR',
      ss.[APRIL(TUFTING_KGS)] AS 'APRIL(TUFTING KGS)',
      

    sp.[MAY_KGS] AS 'MAY KGS',
      ss.[MAY_(SQ_MTS)] AS 'MAY (SQ MTS)',
      (sp.[MAY_(SALEABLE_UNITS)]* ss.[NO_OF_PCS_IN_SET]) AS 'MAY(PCS)',
      sp.[MAY_RATE_AS_PER_CURRENCY] AS 'MAY RATE AS PER CURRENCY',
      sp.[MAY_(SALEABLE_UNITS)] AS 'MAY (SALEABLE UNITS)',
      sp.[MAY_USDN] AS 'MAY USDN',
      sp.[MAY_VALUE] AS 'MAY VALUE',


    sp.[JUNE_KGS] AS 'JUNE KGS',
      ss.[JUNE_(SQ_MTS)] AS 'JUNE (SQ MTS)',
      ss.[JUNE_MTR] AS 'JUNE MTR',
      (sp.[JUN_(SALEABLE_UNITS)] * ss.[NO_OF_PCS_IN_SET]) AS 'JUNE(PCS)',
      sp.[JUN_RATE_AS_PER_CURRENCY] AS 'JUN RATE AS PER CURRENCY',
      sp.[JUN_(SALEABLE_UNITS)] AS 'JUN (SALEABLE UNITS)',
      sp.[JUNE_USDN] AS 'JUNE USDN',
      sp.[JUNE_VALUE] AS 'JUNE VALUE',


    sp.[JULY_KGS] AS 'JULY KGS',
      ss.[JULY_(SQ_MTS)] AS 'JULY (SQ MTS)',
      ss.[JUL_MTR] AS 'JUL MTR',
      (sp.[JULY_(SALEABLE_UNITS)] * ss.[NO_OF_PCS_IN_SET]) AS 'JULY(PCS)',
      sp.[JUL_RATE_AS_PER_CURRENCY] AS 'JUL RATE AS PER CURRENCY',
      sp.[JULY_(SALEABLE_UNITS)] AS 'JULY (SALEABLE UNITS)',
      sp.[JULY_USDN] AS 'JULY USDN',
      sp.[JULY_VALUE] AS 'JULY VALUE',


      sp.[AUG_RATE_AS_PER_CURRENCY] AS 'AUG RATE AS PER CURRENCY',
      sp.[AUGUST_(SALEABLE_UNITS)] AS 'AUGUST (SALEABLE UNITS)',
      ss.[AUGUST_(SQ_MTS)] AS 'AUGUST (SQ MTS)',
      ss.[AUG_MTR] AS 'AUG MTR',
      ss.[AUG_(TUFTING_KGS)] AS 'AUG (TUFTING KGS)',
      (sp.[AUGUST_(SALEABLE_UNITS)] * ss.[NO_OF_PCS_IN_SET]) AS 'AUGUST PCS',
      sp.[AUG_USDN] AS 'AUG USDN',
      sp.[AUG_VALUE] AS 'AUG VALUE',
      

    sp.[SEP_KGS] AS 'SEP KGS',
      ss.[SEP_SQ_MTS_] AS 'SEP SQ MTS ',
      ss.[SEP_MTR] AS 'SEP MTR',
      (sp.[SEP_(SALEABLE_UNITS)] * ss.[NO_OF_PCS_IN_SET]) AS 'SEP PCS',
      sp.[SEP_RATE_AS_PER_CURRENCY] AS 'SEP RATE AS PER CURRENCY',
      sp.[SEP_(SALEABLE_UNITS)] AS 'SEP (SALEABLE UNITS)',
      sp.[SEPT_USDN] AS 'SEPT USDN',
      sp.[SEPT_VALUE] AS 'SEPT VALUE',


    sp.[OCT_KGS] AS 'OCT KGS',
      ss.[OCT_SQ_MTS] AS 'OCT SQ MTS',
      ss.[OCT_MTR] AS 'OCT MTR',
      sp.[OCT_(SALEABLE_UNIT)] AS 'OCT (SALEABLE UNIT)',
      sp.[OCT_RATE_AS_PER_CURRENCY] AS 'OCT RATE AS PER CURRENCY',
      (sp.[OCT_(SALEABLE_UNIT)] * ss.[NO_OF_PCS_IN_SET]) AS 'OCTOBER(PCS)',
      sp.[OCTOBER_(USDN)] AS 'OCTOBER (USDN)',
      sp.[OCT_(VALUE)] AS 'OCT (VALUE)',


    sp.[NOV_KGS] AS 'NOV KGS',
      ss.[NOVEMBER_(SQ_MTS)] AS 'NOVEMBER (SQ MTS)',
      ss.[NOV_MTR] AS 'NOV MTR',
      (sp.[NOVEMBER_(SALEABLE_UNITS)] * ss.[NO_OF_PCS_IN_SET]) AS 'NOVEMBER(PCS)',
      sp.[NOV_RATE_AS_PER_CURRENCY] AS 'NOV RATE AS PER CURRENCY',
      sp.[NOVEMBER_(SALEABLE_UNITS)] AS 'NOVEMBER (SALEABLE UNITS)',
      sp.[NOV_USDN] AS 'NOV USDN',
      sp.[NOV_VALUE] AS 'NOV VALUE',


    sp.[DEC_KGS] AS 'DEC KGS',
      (sp.[DECEMBER_(SALEABLE_UNITS)] * ss.[NO_OF_PCS_IN_SET]) AS 'DECEMBER PCS',
      ss.[DECEMBER(TOTAL_KGS)] AS 'DECEMBER(TOTAL KGS)',
      ss.[DECEMBER_(SQ_MTS)] AS 'DECEMBER (SQ MTS)',
      ss.[DECEMBER(TUFTING_KGS)] AS 'DECEMBER(TUFTING KGS)',
      sp.[DEC_RATE_AS_PER_CURRENCY] AS 'DEC RATE AS PER CURRENCY',
      sp.[DECEMBER_(SALEABLE_UNITS)] AS 'DECEMBER (SALEABLE UNITS)',
      sp.[DEC_USDN] AS 'DEC USDN',
      sp.[DEC_VALUE] AS 'DEC VALUE',


    sp.[JAN_KGS] AS 'JAN KGS',
      ss.[JANUARY_(SQ_MTS)] AS 'JANUARY (SQ MTS)',
      ss.[JAN_MTR] AS 'JAN MTR',
      ss.[JANUARY(TUFTING_KGS)] AS 'JANUARY(TUFTING KGS)',
      sp.[JAN_RATE_AS_PER_CURRENCY] AS 'JAN RATE AS PER CURRENCY',
      sp.[JANUARY_(SALEABLE_UNITS)] AS 'JANUARY (SALEABLE UNITS)',
      (sp.[JANUARY_(SALEABLE_UNITS)] * ss.[NO_OF_PCS_IN_SET]) AS 'JANUARY PCS',
      sp.[JAN_USDN] AS 'JAN USDN',
      sp.[JAN_VALUE] AS 'JAN VALUE',



    sp.[FEB_KGS] AS 'FEB KGS',
      ss.[FEBRUARY(TOTAL_KGS)] AS 'FEBRUARY(TOTAL KGS)',
      ss.[FEBRUARY(SQ_MTS)] AS 'FEBRUARY(SQ MTS)',
      ss.[FEB_MTR] AS 'FEB MTR',
      sp.[FEB_RATE_AS_PER_CURRENCY] AS 'FEB RATE AS PER CURRENCY',
      ss.[FEBRUARY(TUFTING_KGS)] AS 'FEBRUARY(TUFTING KGS)',
      sp.[FEBRUARY_(SALEABLE_UNITS)] AS 'FEBRUARY (SALEABLE UNITS)',
      (sp.[FEBRUARY_(SALEABLE_UNITS)] * ss.[NO_OF_PCS_IN_SET]) AS 'FEBRUARY PCS',
      sp.[FEB_USDN] AS 'FEB USDN',
      sp.[FEB_VALUE] AS 'FEB VALUE',


    sp.[MAR_KGS] AS 'MAR KGS',
      ss.[MARCH(SQ_MTS)] AS 'MARCH(SQ MTS)',
      ss.[MAR_MTR] AS 'MAR MTR',
      sp.[MARCH_(SALEABLE_UNITS)] AS 'MARCH(PCS)',

      sp.[MAR_RATE_AS_PER_CURRENCY] AS 'MAR RATE AS PER CURRENCY',
      sp.[MARCH_(SALEABLE_UNITS)] AS 'MARCH (SALEABLE UNITS)',
      sp.[MAR_USDN] AS 'MAR USDN',
      sp.[MAR_VALUE] AS 'MAR VALUE',



    ss.[BILLING(WUSA/WUK/DIRECT)] AS 'BILLING(WUSA/WUK/DIRECT)',
      ss.[BRAND_NAME] AS 'BRAND NAME',
      ss.[BRAND_TYPE_:_OWN_/_RETAILER_LICENCE_/_WE] AS 'BRAND TYPE : OWN / RETAILER LICENCE / WE',
      ss.[CHANNEL] AS 'CHANNEL',
      ss.[DYEING/_WASHING] AS 'DYEING/ WASHING',
      ss.[EMB(Y/_N)] AS 'EMB(Y/ N)',
    
      ss.[ENQ_STATUS(LIKELY/MOST_LIKELY_/CONFIRME] AS 'ENQ STATUS(LIKELY/MOST LIKELY /CONFIRME)',
      ss.[EXPORT/_DOMESTIC] AS 'EXPORT/ DOMESTIC',
      
      ss.[GR._YARN_1] AS 'GR. YARN 1',
      ss.[GROUND_1_PLY] AS 'GROUND 1 PLY',
      ss.[GROUND_2_PLY] AS 'GROUND 2 PLY',
      ss.[GROUND_COUNT] AS 'GROUND COUNT',
      ss.[GROUND_COUNT_2] AS 'GROUND COUNT 2',
      ss.[GROUND_TYPE_1] AS 'GROUND TYPE 1',
      ss.[GROUND_TYPE_2] AS 'GROUND TYPE 2',
      ss.[GROUND_YARN_2_GMS] AS 'GROUND YARN 2 GMS',
      ss.[GROUND_YARN_GMS] AS 'GROUND YARN GMS',
      ss.[GSM] AS 'GSM',
      
      ss.[INNOVATION_TYPE] AS 'INNOVATION TYPE',
      ss.[INNOVATION(YES/_NO)] AS 'INNOVATION(YES/ NO)',
      
      
      

      ss.[LIKE_TO_LIKE/NEW] AS 'LIKE TO LIKE/NEW',
      ss.[LOGO] AS 'LOGO',
      ss.[LOOM] AS 'LOOM',
      
      

      
      ss.[PILE_1_PLY] AS 'PILE 1 PLY',
      ss.[PILE_COUNT_1] AS 'PILE COUNT 1',
      ss.[PILE_COUNT_2] AS 'PILE COUNT 2',
      ss.[PILE_TYPE_1] AS 'PILE TYPE 1',
      ss.[PILE_TYPE_2] AS 'PILE TYPE 2',
      ss.[PILE_YARN_2_GMS] AS 'PILE YARN 2 GMS',
      ss.[PILE_YARN_GMS] AS 'PILE YARN GMS',
      ss.[PILE_YN._1] AS 'PILE YN. 1',
      ss.[PIVOT_KEY] AS 'PIVOT KEY',

      ss.[PROGRAM_CODE_UPDATED] AS 'PROGRAM CODE UPDATED',

      ss.[REPL_/_PROMO] AS 'REPL / PROMO',
      ss.[REMARKS] AS 'REMARKS',
      ss.[SECONDARYBACKING(GSM)] AS 'SECONDARYBACKING(GSM)',
      ss.[SELLING_CURRENCY] AS 'SELLING CURRENCY',
      
      ss.[SET_CODE] AS 'SET CODE',
      ss.[SET_FLOAT] AS 'SET FLOAT',
      ss.[SET/PCS/PP] AS 'SET/PCS/PP',
      ss.[SIZE] AS 'SIZE',
      ss.[STORE_FORMAT] AS 'STORE FORMAT',

      ss.[TERMS_FOB/CIF] AS 'TERMS FOB/CIF',
      ss.[USDN/KGS] AS 'USDN/KGS',
      ss.[UNIT_OF_SPEC] AS 'UNIT OF SPEC',
      
      ss.[WEFT_1_PLY] AS 'WEFT 1 PLY',
      ss.[WEFT_COUNT_1] AS 'WEFT COUNT 1',
      ss.[WEFT_COUNT_2] AS 'WEFT COUNT 2',
      ss.[WEFT_TYPE_1] AS 'WEFT TYPE 1',
      ss.[WEFT_TYPE_2] AS 'WEFT TYPE 2',
      ss.[WEFT_YARN_1_GMS] AS 'WEFT YARN 1 GMS',
      ss.[WEFT_YARN_2_GMS] AS 'WEFT YARN 2 GMS',
      ss.[WELSPUN_UK/US_SALES_REP] AS 'WELSPUN UK/US SALES REP',
      ss.[WELTRACK(_YES/_NO)] AS 'WELTRACK( YES/ NO)',
      ss.[WT/PC] AS 'WT/PC',
      ss.[WUSA/_WUK_WAREHOUSE] AS 'WUSA/ WUK WAREHOUSE',
      
      ss.[NO_OF_SHADES] AS 'NO OF SHADES',
      ss.[YEARLY_UVR] AS 'YEARLY UVR',

    (sp.[APR_(SALEABLE_UNITS)] + sp.[MAY_(SALEABLE_UNITS)] + sp.[JUN_(SALEABLE_UNITS)] + sp.[JULY_(SALEABLE_UNITS)] + sp.[AUGUST_(SALEABLE_UNITS)] + sp.[SEP_(SALEABLE_UNITS)] + sp.[OCT_(SALEABLE_UNIT)] + sp.[NOVEMBER_(SALEABLE_UNITS)] + sp.[DECEMBER_(SALEABLE_UNITS)] + sp.[JANUARY_(SALEABLE_UNITS)] + sp.[FEBRUARY_(SALEABLE_UNITS)] + sp.[MARCH_(SALEABLE_UNITS)]) as 'Total Saleable Unit',
      (sp.[APRIL_VALUE] + sp.[MAY_VALUE] + sp.[JUNE_VALUE] + sp.[JULY_VALUE] + sp.[AUG_VALUE] + sp.[SEPT_VALUE] + sp.[OCT_(VALUE)] + sp.[NOV_VALUE] + sp.[DEC_VALUE] + sp.[JAN_VALUE] + sp.[FEB_VALUE] + sp.[MAR_VALUE]) as 'Total Value' ,
      (sp.[APRIL_USDN] + sp.[MAY_USDN] + sp.[JUNE_USDN] + sp.[JULY_USDN] + sp.[AUG_USDN] + sp.[SEPT_USDN] + sp.[OCTOBER_(USDN)] + sp.[NOV_USDN] + sp.[DEC_USDN] + sp.[JAN_USDN] + sp.[FEB_USDN] + sp.[MAR_USDN]) as 'Total USDN' ,
      (sp.[APR_(SALEABLE_UNITS)] + sp.[MAY_(SALEABLE_UNITS)] + sp.[JUN_(SALEABLE_UNITS)] + sp.[JULY_(SALEABLE_UNITS)] + sp.[AUGUST_(SALEABLE_UNITS)] + sp.[SEP_(SALEABLE_UNITS)] + sp.[OCT_(SALEABLE_UNIT)] + sp.[NOVEMBER_(SALEABLE_UNITS)] + sp.[DECEMBER_(SALEABLE_UNITS)] + sp.[JANUARY_(SALEABLE_UNITS)] + sp.[FEBRUARY_(SALEABLE_UNITS)] +sp.[MARCH_(SALEABLE_UNITS)]) as 'Total PCS',
      (sp.[APRIL_KGS] + sp.[MAY_KGS] + sp.[JUNE_KGS] + sp.[JULY_KGS] + sp.[AUG_KGS] + sp.[SEP_KGS] + sp.[OCT_KGS] + sp.[NOV_KGS] + sp.[DEC_KGS] + sp.[JAN_KGS] + sp.[FEB_KGS] + sp.[MAR_KGS]) as 'Total KGS',
      (sp.[APRIL_(SQ_MTR)] + sp.[MAY_(SQ_MTS)] + sp.[JUNE_(SQ_MTS)] + sp.[JULY_(SQ_MTS)] + sp.[AUGUST_(SQ_MTS)] + sp.[SEP_SQ_MTS_] + sp.[OCT_SQ_MTS] + sp.[NOVEMBER_(SQ_MTS)] + sp.[DECEMBER_(SQ_MTS)] + sp.[JANUARY_(SQ_MTS)] + sp.[FEBRUARY(SQ_MTS)] + sp.[MARCH(SQ_MTS)]) as 'TOTAL SQR MTRS',
      
      ss.[SHEARING] AS 'SHEARING'
      FROM   salesplan_publish AS sp
            INNER JOIN SALESPLAN_SIMULATION AS ss
                    ON sp.[unique_identification_no] = ss.[unique_identification_no]
                        AND sp.[product_cat] in (${newList})`
    }
    else {
      query += `SELECT
          sp.[VERSION_NO] AS 'versionNo',
          sp.[UNIQUE_IDENTIFICATION_NO] AS 'UNIQUE IDENTIFICATION NO',
          ss.[PLANT] AS 'PLANT',
        ss.[PRODUCT_CAT] AS 'PRODUCT CAT',
        ss.[PRODUCT_SUBCAT] AS 'PRODUCT SUBCAT',
          ss.[SR_NO] AS 'SR NO',
        ss.[REGION] AS 'REGION',
        ss.[PROGRAM] AS 'PROGRAM',
          ss.[PROGRAM_CODE__↑] AS 'PROGRAM CODE ↑',
        ss.[END_CUSTOMER_CODE] AS 'END CUSTOMER CODE',
          sp.[END_CUSTOMER_NAME] AS 'END CUSTOMER NAME',
        ss.[MATCODE] AS 'MATCODE',
        ss.[TEAM_LEADER] AS 'TEAM LEADER',
        ss.[MATERIAL_DESCRIPTION] AS 'MATERIAL DESCRIPTION',
          ss.[MERCHANT] AS 'MERCHANT',
          ss.[PCS_IN_SET] AS 'PCS IN SET',
        
        
        sp.[APR_(SALEABLE_UNITS)] AS 'APR (SALEABLE UNITS)',
          (sp.[APR_(SALEABLE_UNITS)] * ss.[NO_OF_PCS_IN_SET]) AS 'APRIL PCS',
        sp.[APR_RATE_AS_PER_CURRENCY] AS 'APR RATE AS PER CURRENCY',
          sp.[APRIL_KGS] AS 'APRIL KGS',
          sp.[APRIL_USDN] AS 'APRIL USDN',
          sp.[APRIL_VALUE] AS 'APRIL VALUE',
          sp.[AUG_KGS] AS 'AUG KGS',
          ss.[APRIL_(SQ_MTR)] AS 'APRIL (SQ MTR)',
          ss.[APR_MTR] AS 'APR MTR',
          ss.[APRIL(TUFTING_KGS)] AS 'APRIL(TUFTING KGS)',
          
        
        sp.[MAY_KGS] AS 'MAY KGS',
          ss.[MAY_(SQ_MTS)] AS 'MAY (SQ MTS)',
          (sp.[MAY_(SALEABLE_UNITS)]* ss.[NO_OF_PCS_IN_SET]) AS 'MAY(PCS)',
          sp.[MAY_RATE_AS_PER_CURRENCY] AS 'MAY RATE AS PER CURRENCY',
          sp.[MAY_(SALEABLE_UNITS)] AS 'MAY (SALEABLE UNITS)',
          sp.[MAY_USDN] AS 'MAY USDN',
          sp.[MAY_VALUE] AS 'MAY VALUE',
        
        
        sp.[JUNE_KGS] AS 'JUNE KGS',
          ss.[JUNE_(SQ_MTS)] AS 'JUNE (SQ MTS)',
          ss.[JUNE_MTR] AS 'JUNE MTR',
          (sp.[JUN_(SALEABLE_UNITS)] * ss.[NO_OF_PCS_IN_SET]) AS 'JUNE(PCS)',
          sp.[JUN_RATE_AS_PER_CURRENCY] AS 'JUN RATE AS PER CURRENCY',
          sp.[JUN_(SALEABLE_UNITS)] AS 'JUN (SALEABLE UNITS)',
          sp.[JUNE_USDN] AS 'JUNE USDN',
          sp.[JUNE_VALUE] AS 'JUNE VALUE',
        
        
        sp.[JULY_KGS] AS 'JULY KGS',
          ss.[JULY_(SQ_MTS)] AS 'JULY (SQ MTS)',
          ss.[JUL_MTR] AS 'JUL MTR',
          (sp.[JULY_(SALEABLE_UNITS)] * ss.[NO_OF_PCS_IN_SET]) AS 'JULY(PCS)',
          sp.[JUL_RATE_AS_PER_CURRENCY] AS 'JUL RATE AS PER CURRENCY',
          sp.[JULY_(SALEABLE_UNITS)] AS 'JULY (SALEABLE UNITS)',
          sp.[JULY_USDN] AS 'JULY USDN',
          sp.[JULY_VALUE] AS 'JULY VALUE',
        
        
          sp.[AUG_RATE_AS_PER_CURRENCY] AS 'AUG RATE AS PER CURRENCY',
          sp.[AUGUST_(SALEABLE_UNITS)] AS 'AUGUST (SALEABLE UNITS)',
          ss.[AUGUST_(SQ_MTS)] AS 'AUGUST (SQ MTS)',
          ss.[AUG_MTR] AS 'AUG MTR',
          ss.[AUG_(TUFTING_KGS)] AS 'AUG (TUFTING KGS)',
          (sp.[AUGUST_(SALEABLE_UNITS)] * ss.[NO_OF_PCS_IN_SET]) AS 'AUGUST PCS',
          sp.[AUG_USDN] AS 'AUG USDN',
          sp.[AUG_VALUE] AS 'AUG VALUE',
          
        
        sp.[SEP_KGS] AS 'SEP KGS',
          ss.[SEP_SQ_MTS_] AS 'SEP SQ MTS ',
          ss.[SEP_MTR] AS 'SEP MTR',
          (sp.[SEP_(SALEABLE_UNITS)] * ss.[NO_OF_PCS_IN_SET]) AS 'SEP PCS',
          sp.[SEP_RATE_AS_PER_CURRENCY] AS 'SEP RATE AS PER CURRENCY',
          sp.[SEP_(SALEABLE_UNITS)] AS 'SEP (SALEABLE UNITS)',
          sp.[SEPT_USDN] AS 'SEPT USDN',
          sp.[SEPT_VALUE] AS 'SEPT VALUE',
        
        
        sp.[OCT_KGS] AS 'OCT KGS',
          ss.[OCT_SQ_MTS] AS 'OCT SQ MTS',
          ss.[OCT_MTR] AS 'OCT MTR',
          sp.[OCT_(SALEABLE_UNIT)] AS 'OCT (SALEABLE UNIT)',
          sp.[OCT_RATE_AS_PER_CURRENCY] AS 'OCT RATE AS PER CURRENCY',
          (sp.[OCT_(SALEABLE_UNIT)] * ss.[NO_OF_PCS_IN_SET]) AS 'OCTOBER(PCS)',
          sp.[OCTOBER_(USDN)] AS 'OCTOBER (USDN)',
          sp.[OCT_(VALUE)] AS 'OCT (VALUE)',
        
        
        sp.[NOV_KGS] AS 'NOV KGS',
          ss.[NOVEMBER_(SQ_MTS)] AS 'NOVEMBER (SQ MTS)',
          ss.[NOV_MTR] AS 'NOV MTR',
          (sp.[NOVEMBER_(SALEABLE_UNITS)] * ss.[NO_OF_PCS_IN_SET]) AS 'NOVEMBER(PCS)',
          sp.[NOV_RATE_AS_PER_CURRENCY] AS 'NOV RATE AS PER CURRENCY',
          sp.[NOVEMBER_(SALEABLE_UNITS)] AS 'NOVEMBER (SALEABLE UNITS)',
          sp.[NOV_USDN] AS 'NOV USDN',
          sp.[NOV_VALUE] AS 'NOV VALUE',
        
        
        sp.[DEC_KGS] AS 'DEC KGS',
          (sp.[DECEMBER_(SALEABLE_UNITS)] * ss.[NO_OF_PCS_IN_SET]) AS 'DECEMBER PCS',
          ss.[DECEMBER(TOTAL_KGS)] AS 'DECEMBER(TOTAL KGS)',
          ss.[DECEMBER_(SQ_MTS)] AS 'DECEMBER (SQ MTS)',
          ss.[DECEMBER(TUFTING_KGS)] AS 'DECEMBER(TUFTING KGS)',
          sp.[DEC_RATE_AS_PER_CURRENCY] AS 'DEC RATE AS PER CURRENCY',
          sp.[DECEMBER_(SALEABLE_UNITS)] AS 'DECEMBER (SALEABLE UNITS)',
          sp.[DEC_USDN] AS 'DEC USDN',
          sp.[DEC_VALUE] AS 'DEC VALUE',
        
        
        sp.[JAN_KGS] AS 'JAN KGS',
          ss.[JANUARY_(SQ_MTS)] AS 'JANUARY (SQ MTS)',
          ss.[JAN_MTR] AS 'JAN MTR',
          ss.[JANUARY(TUFTING_KGS)] AS 'JANUARY(TUFTING KGS)',
          sp.[JAN_RATE_AS_PER_CURRENCY] AS 'JAN RATE AS PER CURRENCY',
          sp.[JANUARY_(SALEABLE_UNITS)] AS 'JANUARY (SALEABLE UNITS)',
          (sp.[JANUARY_(SALEABLE_UNITS)] * ss.[NO_OF_PCS_IN_SET]) AS 'JANUARY PCS',
          sp.[JAN_USDN] AS 'JAN USDN',
          sp.[JAN_VALUE] AS 'JAN VALUE',
        
        
        
        sp.[FEB_KGS] AS 'FEB KGS',
          ss.[FEBRUARY(TOTAL_KGS)] AS 'FEBRUARY(TOTAL KGS)',
          ss.[FEBRUARY(SQ_MTS)] AS 'FEBRUARY(SQ MTS)',
          ss.[FEB_MTR] AS 'FEB MTR',
          sp.[FEB_RATE_AS_PER_CURRENCY] AS 'FEB RATE AS PER CURRENCY',
          ss.[FEBRUARY(TUFTING_KGS)] AS 'FEBRUARY(TUFTING KGS)',
          sp.[FEBRUARY_(SALEABLE_UNITS)] AS 'FEBRUARY (SALEABLE UNITS)',
          (sp.[FEBRUARY_(SALEABLE_UNITS)] * ss.[NO_OF_PCS_IN_SET]) AS 'FEBRUARY PCS',
          sp.[FEB_USDN] AS 'FEB USDN',
          sp.[FEB_VALUE] AS 'FEB VALUE',
        
        
        sp.[MAR_KGS] AS 'MAR KGS',
          ss.[MARCH(SQ_MTS)] AS 'MARCH(SQ MTS)',
          ss.[MAR_MTR] AS 'MAR MTR',
          sp.[MARCH_(SALEABLE_UNITS)] AS 'MARCH(PCS)',
      
          sp.[MAR_RATE_AS_PER_CURRENCY] AS 'MAR RATE AS PER CURRENCY',
          sp.[MARCH_(SALEABLE_UNITS)] AS 'MARCH (SALEABLE UNITS)',
          sp.[MAR_USDN] AS 'MAR USDN',
          sp.[MAR_VALUE] AS 'MAR VALUE',
        
        
        
        ss.[BILLING(WUSA/WUK/DIRECT)] AS 'BILLING(WUSA/WUK/DIRECT)',
          ss.[BRAND_NAME] AS 'BRAND NAME',
          ss.[BRAND_TYPE_:_OWN_/_RETAILER_LICENCE_/_WE] AS 'BRAND TYPE : OWN / RETAILER LICENCE / WE',
          ss.[CHANNEL] AS 'CHANNEL',
          ss.[DYEING/_WASHING] AS 'DYEING/ WASHING',
          ss.[EMB(Y/_N)] AS 'EMB(Y/ N)',
        
          ss.[ENQ_STATUS(LIKELY/MOST_LIKELY_/CONFIRME] AS 'ENQ STATUS(LIKELY/MOST LIKELY /CONFIRME)',
          ss.[EXPORT/_DOMESTIC] AS 'EXPORT/ DOMESTIC',
          
          ss.[GR._YARN_1] AS 'GR. YARN 1',
          ss.[GROUND_1_PLY] AS 'GROUND 1 PLY',
          ss.[GROUND_2_PLY] AS 'GROUND 2 PLY',
          ss.[GROUND_COUNT] AS 'GROUND COUNT',
          ss.[GROUND_COUNT_2] AS 'GROUND COUNT 2',
          ss.[GROUND_TYPE_1] AS 'GROUND TYPE 1',
          ss.[GROUND_TYPE_2] AS 'GROUND TYPE 2',
          ss.[GROUND_YARN_2_GMS] AS 'GROUND YARN 2 GMS',
          ss.[GROUND_YARN_GMS] AS 'GROUND YARN GMS',
          ss.[GSM] AS 'GSM',
          
          ss.[INNOVATION_TYPE] AS 'INNOVATION TYPE',
          ss.[INNOVATION(YES/_NO)] AS 'INNOVATION(YES/ NO)',
          
          
          
        
          ss.[LIKE_TO_LIKE/NEW] AS 'LIKE TO LIKE/NEW',
          ss.[LOGO] AS 'LOGO',
          ss.[LOOM] AS 'LOOM',
          
          

          
          ss.[PILE_1_PLY] AS 'PILE 1 PLY',
          ss.[PILE_COUNT_1] AS 'PILE COUNT 1',
          ss.[PILE_COUNT_2] AS 'PILE COUNT 2',
          ss.[PILE_TYPE_1] AS 'PILE TYPE 1',
          ss.[PILE_TYPE_2] AS 'PILE TYPE 2',
          ss.[PILE_YARN_2_GMS] AS 'PILE YARN 2 GMS',
          ss.[PILE_YARN_GMS] AS 'PILE YARN GMS',
          ss.[PILE_YN._1] AS 'PILE YN. 1',
          ss.[PIVOT_KEY] AS 'PIVOT KEY',
        
          ss.[PROGRAM_CODE_UPDATED] AS 'PROGRAM CODE UPDATED',
      
          ss.[REPL_/_PROMO] AS 'REPL / PROMO',
          ss.[REMARKS] AS 'REMARKS',
          ss.[SECONDARYBACKING(GSM)] AS 'SECONDARYBACKING(GSM)',
          ss.[SELLING_CURRENCY] AS 'SELLING CURRENCY',
          
          ss.[SET_CODE] AS 'SET CODE',
          ss.[SET_FLOAT] AS 'SET FLOAT',
          ss.[SET/PCS/PP] AS 'SET/PCS/PP',
          ss.[SIZE] AS 'SIZE',
          ss.[STORE_FORMAT] AS 'STORE FORMAT',
      
          ss.[TERMS_FOB/CIF] AS 'TERMS FOB/CIF',
          ss.[USDN/KGS] AS 'USDN/KGS',
          ss.[UNIT_OF_SPEC] AS 'UNIT OF SPEC',
          
          ss.[WEFT_1_PLY] AS 'WEFT 1 PLY',
          ss.[WEFT_COUNT_1] AS 'WEFT COUNT 1',
          ss.[WEFT_COUNT_2] AS 'WEFT COUNT 2',
          ss.[WEFT_TYPE_1] AS 'WEFT TYPE 1',
          ss.[WEFT_TYPE_2] AS 'WEFT TYPE 2',
          ss.[WEFT_YARN_1_GMS] AS 'WEFT YARN 1 GMS',
          ss.[WEFT_YARN_2_GMS] AS 'WEFT YARN 2 GMS',
          ss.[WELSPUN_UK/US_SALES_REP] AS 'WELSPUN UK/US SALES REP',
          ss.[WELTRACK(_YES/_NO)] AS 'WELTRACK( YES/ NO)',
          ss.[WT/PC] AS 'WT/PC',
          ss.[WUSA/_WUK_WAREHOUSE] AS 'WUSA/ WUK WAREHOUSE',
          
          ss.[NO_OF_SHADES] AS 'NO OF SHADES',
          ss.[YEARLY_UVR] AS 'YEARLY UVR',
        
        (sp.[APR_(SALEABLE_UNITS)] + sp.[MAY_(SALEABLE_UNITS)] + sp.[JUN_(SALEABLE_UNITS)] + sp.[JULY_(SALEABLE_UNITS)] + sp.[AUGUST_(SALEABLE_UNITS)] + sp.[SEP_(SALEABLE_UNITS)] + sp.[OCT_(SALEABLE_UNIT)] + sp.[NOVEMBER_(SALEABLE_UNITS)] + sp.[DECEMBER_(SALEABLE_UNITS)] + sp.[JANUARY_(SALEABLE_UNITS)] + sp.[FEBRUARY_(SALEABLE_UNITS)] + sp.[MARCH_(SALEABLE_UNITS)]) as 'Total Saleable Unit',
          (sp.[APRIL_VALUE] + sp.[MAY_VALUE] + sp.[JUNE_VALUE] + sp.[JULY_VALUE] + sp.[AUG_VALUE] + sp.[SEPT_VALUE] + sp.[OCT_(VALUE)] + sp.[NOV_VALUE] + sp.[DEC_VALUE] + sp.[JAN_VALUE] + sp.[FEB_VALUE] + sp.[MAR_VALUE]) as 'Total Value' ,
          (sp.[APRIL_USDN] + sp.[MAY_USDN] + sp.[JUNE_USDN] + sp.[JULY_USDN] + sp.[AUG_USDN] + sp.[SEPT_USDN] + sp.[OCTOBER_(USDN)] + sp.[NOV_USDN] + sp.[DEC_USDN] + sp.[JAN_USDN] + sp.[FEB_USDN] + sp.[MAR_USDN]) as 'Total USDN' ,
          (sp.[APR_(SALEABLE_UNITS)] + sp.[MAY_(SALEABLE_UNITS)] + sp.[JUN_(SALEABLE_UNITS)] + sp.[JULY_(SALEABLE_UNITS)] + sp.[AUGUST_(SALEABLE_UNITS)] + sp.[SEP_(SALEABLE_UNITS)] + sp.[OCT_(SALEABLE_UNIT)] + sp.[NOVEMBER_(SALEABLE_UNITS)] + sp.[DECEMBER_(SALEABLE_UNITS)] + sp.[JANUARY_(SALEABLE_UNITS)] + sp.[FEBRUARY_(SALEABLE_UNITS)] +sp.[MARCH_(SALEABLE_UNITS)]) as 'Total PCS',
          (sp.[APRIL_KGS] + sp.[MAY_KGS] + sp.[JUNE_KGS] + sp.[JULY_KGS] + sp.[AUG_KGS] + sp.[SEP_KGS] + sp.[OCT_KGS] + sp.[NOV_KGS] + sp.[DEC_KGS] + sp.[JAN_KGS] + sp.[FEB_KGS] + sp.[MAR_KGS]) as 'Total KGS',
          (sp.[APRIL_(SQ_MTR)] + sp.[MAY_(SQ_MTS)] + sp.[JUNE_(SQ_MTS)] + sp.[JULY_(SQ_MTS)] + sp.[AUGUST_(SQ_MTS)] + sp.[SEP_SQ_MTS_] + sp.[OCT_SQ_MTS] + sp.[NOVEMBER_(SQ_MTS)] + sp.[DECEMBER_(SQ_MTS)] + sp.[JANUARY_(SQ_MTS)] + sp.[FEBRUARY(SQ_MTS)] + sp.[MARCH(SQ_MTS)]) as 'TOTAL SQR MTRS',
          
          ss.[SHEARING] AS 'SHEARING'
          FROM   salesplan_publish AS sp
                INNER JOIN SALESPLAN_SIMULATION AS ss
                        ON sp.[unique_identification_no] = ss.[unique_identification_no]
                            AND sp.[product_cat] in (${newList}) AND (sp.[VERSION_NO] like '%${req.query.teamLeader}%' OR sp.[TEAM_LEADER] like '%${req.query.teamLeader}%')
            `;
    }

    // else if (req.query.productName == 'Rugs') {

    //   query += `
    //   SELECT
    //   sp.[VERSION_NO] AS 'versionNo',
    //   sp.[UNIQUE_IDENTIFICATION_NO] AS 'UNIQUE IDENTIFICATION NO',

    //   (sp.[APR_(SALEABLE_UNITS)] + sp.[MAY_(SALEABLE_UNITS)] + sp.[JUN_(SALEABLE_UNITS)] + sp.[JULY_(SALEABLE_UNITS)] + sp.[AUGUST_(SALEABLE_UNITS)] + sp.[SEP_(SALEABLE_UNITS)] + sp.[OCT_(SALEABLE_UNIT)] + sp.[NOVEMBER_(SALEABLE_UNITS)] + sp.[DECEMBER_(SALEABLE_UNITS)] + sp.[JANUARY_(SALEABLE_UNITS)] + sp.[FEBRUARY_(SALEABLE_UNITS)] + sp.[MARCH_(SALEABLE_UNITS)]) as 'Total Saleable Unit',
    //   (sp.[APRIL_VALUE] + sp.[MAY_VALUE] + sp.[JUNE_VALUE] + sp.[JULY_VALUE] + sp.[AUG_VALUE] + sp.[SEPT_VALUE] + sp.[OCT_(VALUE)] + sp.[NOV_VALUE] + sp.[DEC_VALUE] + sp.[JAN_VALUE] + sp.[FEB_VALUE] + sp.[MAR_VALUE]) as 'Total Value' ,
    //   (sp.[APRIL_USDN] + sp.[MAY_USDN] + sp.[JUNE_USDN] + sp.[JULY_USDN] + sp.[AUG_USDN] + sp.[SEPT_USDN] + sp.[OCTOBER_(USDN)] + sp.[NOV_USDN] + sp.[DEC_USDN] + sp.[JAN_USDN] + sp.[FEB_USDN] + sp.[MAR_USDN]) as 'Total USDN' ,
    //   (sp.[APR_(SALEABLE_UNITS)] + sp.[MAY_(SALEABLE_UNITS)] + sp.[JUN_(SALEABLE_UNITS)] + sp.[JULY_(SALEABLE_UNITS)] + sp.[AUGUST_(SALEABLE_UNITS)] + sp.[SEP_(SALEABLE_UNITS)] + sp.[OCT_(SALEABLE_UNIT)] + sp.[NOVEMBER_(SALEABLE_UNITS)] + sp.[DECEMBER_(SALEABLE_UNITS)] + sp.[JANUARY_(SALEABLE_UNITS)] + sp.[FEBRUARY_(SALEABLE_UNITS)] +sp.[MARCH_(SALEABLE_UNITS)]) as 'Total PCS',

    //   ss.[APRIL_(SQ_MTR)] AS 'APRIL (SQ MTR)',
    //   ss.[APRIL(TUFTING_KGS)] AS 'APRIL(TUFTING KGS)',
    //   sp.[APR_RATE_AS_PER_CURRENCY] AS 'APR RATE AS PER CURRENCY',
    //   sp.[APR_(SALEABLE_UNITS)] AS 'APR (SALEABLE UNITS)',
    //   (sp.[APR_(SALEABLE_UNITS)] * ss.[NO_OF_PCS_IN_SET]) AS 'APRIL PCS',

    //   sp.[APRIL_USDN] AS 'APRIL USDN',
    //   sp.[APRIL_VALUE] AS 'APRIL VALUE',
    //   sp.[AUG_KGS] AS 'AUG KGS',

    //   (sp.[AUGUST_(SALEABLE_UNITS)] * ss.[NO_OF_PCS_IN_SET]) AS 'AUGUST PCS',

    //   ss.[AUGUST_(SQ_MTS)] AS 'AUGUST (SQ MTS)',
    //   ss.[AUG_(TOTAL_KGS)] AS 'AUG (TOTAL KGS)',
    //   ss.[AUG_(TUFTING_KGS)] AS 'AUG (TUFTING KGS)',
    //   sp.[AUG_RATE_AS_PER_CURRENCY] AS 'AUG RATE AS PER CURRENCY',
    //   sp.[AUGUST_(SALEABLE_UNITS)] AS 'AUGUST (SALEABLE UNITS)',
    //   sp.[AUG_USDN] AS 'AUG USDN',
    //   sp.[AUG_VALUE] AS 'AUG VALUE',
    //   ss.[BILLING(WUSA/WUK/DIRECT)] AS 'BILLING(WUSA/WUK/DIRECT)',
    //   ss.[BRAND_NAME] AS 'BRAND NAME',
    //   ss.[BRAND_TYPE_:_OWN_/_RETAILER_LICENCE_/_WE] AS 'BRAND TYPE : OWN / RETAILER LICENCE / WE',
    //   ss.[BACKING(GSM)] AS 'BACKING(GSM)',
    //   ss.[BACKINGTYPE] AS 'BACKINGTYPE',
    //   ss.[CHANNEL] AS 'CHANNEL',
    //   ss.[COUNTRY] AS 'COUNTRY',
    //   ss.[COATING] AS 'COATING',

    //   (sp.[DECEMBER_(SALEABLE_UNITS)] * ss.[NO_OF_PCS_IN_SET]) AS 'DECEMBER (PCS)',

    //   ss.[DECEMBER_(SQ_MTS)] AS 'DECEMBER (SQ MTS)',
    //   ss.[DECEMBER(TOTAL_KGS)] AS 'DECEMBER(TOTAL KGS)',
    //   ss.[DECEMBER(TUFTING_KGS)] AS 'DECEMBER(TUFTING KGS)',
    //   sp.[DEC_RATE_AS_PER_CURRENCY] AS 'DEC RATE AS PER CURRENCY',
    //   sp.[DECEMBER_(SALEABLE_UNITS)] AS 'DECEMBER (SALEABLE UNITS)',
    //   sp.[DEC_USDN] AS 'DEC USDN',
    //   sp.[DEC_VALUE] AS 'DEC VALUE',
    //   ss.[DYEING/_WASHING] AS 'DYEING/ WASHING',
    //   ss.[END_CUSTOMER_CODE] AS 'END CUSTOMER CODE',
    //   sp.[END_CUSTOMER_NAME] AS 'END CUSTOMER NAME',
    //   ss.[ENQ_STATUS(LIKELY/MOST_LIKELY_/CONFIRME] AS 'ENQ STATUS(LIKELY/MOST LIKELY /CONFIRME',
    //   ss.[EXPORT/_DOMESTIC] AS 'EXPORT/ DOMESTIC',
    //   (sp.[FEBRUARY_(SALEABLE_UNITS)] * ss.[NO_OF_PCS_IN_SET]) AS 'FEBRUARY(PCS)',
    //   ss.[FEBRUARY(SQ_MTS)] AS 'FEBRUARY(SQ MTS)',
    //   ss.[FEBRUARY(TOTAL_KGS)] AS 'FEBRUARY(TOTAL KGS)',
    //   ss.[FEBRUARY(TUFTING_KGS)] AS 'FEBRUARY(TUFTING KGS)',
    //   sp.[FEB_RATE_AS_PER_CURRENCY] AS 'FEB RATE AS PER CURRENCY',
    //   sp.[FEBRUARY_(SALEABLE_UNITS)] AS 'FEBRUARY (SALEABLE UNITS)',
    //   sp.[FEB_USDN] AS 'FEB USDN',
    //   sp.[FEB_VALUE] AS 'FEB VALUE',
    //   ss.[FIBRE_TYPE] AS 'FIBRE TYPE',
    //   ss.[FINISH_GSM] AS 'FINISH GSM',
    //   ss.[INNOVATION(YES/_NO)] AS 'INNOVATION(YES/ NO)',
    //   (sp.[JANUARY_(SALEABLE_UNITS)] * SS.[NO_OF_PCS_IN_SET]) AS 'JAN PCS',
    //   ss.[JANUARY_(SQ_MTS)] AS 'JANUARY (SQ MTS)',
    //   ss.[JANUARY(TOTAL_KGS)] AS 'JANUARY(TOTAL KGS)',
    //   ss.[JANUARY(TUFTING_KGS)] AS 'JANUARY(TUFTING KGS)',
    //   sp.[JAN_RATE_AS_PER_CURRENCY] AS 'JAN RATE AS PER CURRENCY',
    //   sp.[JANUARY_(SALEABLE_UNITS)] AS 'JANUARY (SALEABLE UNITS)',
    //   sp.[JAN_USDN] AS 'JAN USDN',
    //   sp.[JAN_VALUE] AS 'JAN VALUE',
    //   (sp.[JULY_(SALEABLE_UNITS)] * ss.[NO_OF_PCS_IN_SET]) AS 'JULY(PCS)',
    //   ss.[JULY_(SQ_MTS)] AS 'JULY (SQ MTS)',
    //   ss.[JULY_(TOTAL_KGS)] AS 'JULY (TOTAL KGS)',
    //   ss.[JULY_(TUFTING_KGS)] AS 'JULY (TUFTING KGS)',
    //   sp.[JUL_RATE_AS_PER_CURRENCY] AS 'JUL RATE AS PER CURRENCY',
    //   sp.[JULY_(SALEABLE_UNITS)] AS 'JULY (SALEABLE UNITS)',
    //   sp.[JULY_USDN] AS 'JULY USDN',
    //   sp.[JULY_VALUE] AS 'JULY VALUE',
    //   (sp.[JUN_(SALEABLE_UNITS)] * ss.[NO_OF_PCS_IN_SET]) AS 'JUNE(PCS)',
    //   ss.[JUNE_(SQ_MTS)] AS 'JUNE (SQ MTS)',
    //   ss.[JUNE_(TOTAL_KGS)] AS 'JUNE (TOTAL KGS)',
    //   ss.[JUNE_(TUFTING_KGS)] AS 'JUNE (TUFTING KGS)',
    //   sp.[JUN_RATE_AS_PER_CURRENCY] AS 'JUN RATE AS PER CURRENCY',
    //   sp.[JUN_(SALEABLE_UNITS)] AS 'JUN (SALEABLE UNITS)',
    //   sp.[JUNE_USDN] AS 'JUNE USDN',
    //   sp.[JUNE_VALUE] AS 'JUNE VALUE',
    //   ss.[LIKE_TO_LIKE/NEW] AS 'LIKE TO LIKE/NEW',
    //   ss.[LOGO] AS 'LOGO',
    //   ss.[LATEX(GSM)] AS 'LATEX(GSM)',
    //   (sp.[MARCH_(SALEABLE_UNITS)] * ss.[NO_OF_PCS_IN_SET]) AS 'MARCH(PCS)',
    //   ss.[MARCH(SQ_MTS)] AS 'MARCH(SQ MTS)',
    //   ss.[MARCH(TOTAL_KGS)] AS 'MARCH(TOTAL KGS)',
    //   ss.[MARCH(TUFTING_KGS)] AS 'MARCH(TUFTING KGS)',
    //   sp.[MAR_RATE_AS_PER_CURRENCY] AS 'MAR RATE AS PER CURRENCY',
    //   sp.[MARCH_(SALEABLE_UNITS)] AS 'MARCH (SALEABLE UNITS)',
    //   sp.[MAR_USDN] AS 'MAR USDN',
    //   sp.[MAR_VALUE] AS 'MAR VALUE',
    //   ss.[MATCODE] AS 'MATCODE',
    //   ss.[MATERIAL_DESCRIPTION] AS 'MATERIAL DESCRIPTION',
    //   ss.[MAY_KGS] AS 'MAY KGS',
    //   (sp.[MAY_(SALEABLE_UNITS)] * ss.[NO_OF_PCS_IN_SET]) AS 'MAY(PCS)',
    //   ss.[MAY_(SQ_MTS)] AS 'MAY (SQ MTS)',
    //   ss.[MAY_(TOTAL_KGS)] AS 'MAY (TOTAL KGS)',
    //   ss.[MAY_(TUFTING_KGS)] AS 'MAY (TUFTING KGS)',
    //   sp.[MAY_RATE_AS_PER_CURRENCY] AS 'MAY RATE AS PER CURRENCY',
    //   sp.[MAY_(SALEABLE_UNITS)] AS 'MAY (SALEABLE UNITS)',
    //   sp.[MAY_USDN] AS 'MAY USDN',
    //   sp.[MAY_VALUE] AS 'MAY VALUE',
    //   ss.[MERCHANT] AS 'MERCHANT',
    //   ss.[MM/TT/KNIT] AS 'MM/TT/KNIT',
    //   ss.[MULTIPLY] AS 'MULTIPLY',
    //   ss.[MERCHANT_ID] AS 'MERCHANT ID',
    //   ss.[NO._OF_SKU] AS 'NO. OF SKU',
    //   ss.[NON_WASH] AS 'NON WASH',
    //   ss.[NEW_PROGRAM] AS 'NEW PROGRAM',
    //   ss.[NO_OF_PCS_IN_SET] AS 'NO OF PCS IN SET',
    //   (sp.[NOVEMBER_(SALEABLE_UNITS)] * ss.[NO_OF_PCS_IN_SET]) AS 'NOVEMBER(PCS)',
    //   ss.[NOVEMBER_(SQ_MTS)] AS 'NOVEMBER (SQ MTS)',
    //   ss.[NOVEMBER_(TUFTING_KGS)] AS 'NOVEMBER (TUFTING KGS)',
    //   ss.[NOVEMBER(TOTAL_KGS)] AS 'NOVEMBER(TOTAL KGS)',
    //   sp.[NOV_RATE_AS_PER_CURRENCY] AS 'NOV RATE AS PER CURRENCY',
    //   sp.[NOVEMBER_(SALEABLE_UNITS)] AS 'NOVEMBER (SALEABLE UNITS)',
    //   sp.[NOV_USDN] AS 'NOV USDN',
    //   sp.[NOV_VALUE] AS 'NOV VALUE',
    //   sp.[OCT_(SALEABLE_UNIT)] AS 'OCT (SALEABLE UNIT)',
    //   sp.[OCT_RATE_AS_PER_CURRENCY] AS 'OCT RATE AS PER CURRENCY',
    //   ss.[OCT_SQ_MTS] AS 'OCT SQ MTS',
    //   ss.[OCTOBER(TOTAL_KGS)] AS 'OCTOBER(TOTAL KGS)',
    //   ss.[OCTOBER(TUFTING_KGS)] AS 'OCTOBER(TUFTING KGS)',
    //   (ss.[OCT_(SALEABLE_UNIT)] * ss.[NO_OF_PCS_IN_SET]) AS 'OCTOBER(PCS)',
    //   sp.[OCTOBER_(USDN)] AS 'OCTOBER (USDN)',
    //   sp.[OCT_(VALUE)] AS 'OCT (VALUE)',
    //   ss.[ORDER_TYPE] AS 'ORDER TYPE',
    //   ss.[PCS_IN_SET] AS 'PCS IN SET',
    //   ss.[PROGRAM] AS 'PROGRAM',
    //   ss.[PROGRAM_CODE__↑] AS 'PROGRAM CODE ↑',
    //   ss.[PROGRAM_CODE_UPDATED] AS 'PROGRAM CODE UPDATED',
    //   ss.[PRINTING] AS 'PRINTING',
    //   ss.[PROD_INSP_MEMO] AS 'PROD INSP MEMO',
    //   ss.[PRODUCT_TYPE_QUALITY] AS 'PRODUCT TYPE QUALITY',
    //   ss.[REGION] AS 'REGION',
    //   ss.[SECONDARY_BACKING_TYPE] AS 'SECONDARY BACKING TYPE',
    //   ss.[SECONDARYBACKING(GSM)] AS 'SECONDARYBACKING(GSM)',
    //   ss.[SELLING_CURRENCY] AS 'SELLING CURRENCY',
    //   (sp.[SEP_(SALEABLE_UNITS)] * ss.[NO_OF_PCS_IN_SET]) AS 'SEP PCS',
    //   ss.[SEP_SQ_MTS_] AS 'SEP SQ MTS ',
    //   ss.[SEPT_TOTAL_KGS] AS 'SEPT TOTAL KGS',
    //   ss.[SEPT_TUFTING_KGS] AS 'SEPT TUFTING KGS',
    //   sp.[SEP_RATE_AS_PER_CURRENCY] AS 'SEP RATE AS PER CURRENCY',
    //   sp.[SEP_(SALEABLE_UNITS)] AS 'SEP (SALEABLE UNITS)',
    //   sp.[SEPT_USDN] AS 'SEPT USDN',
    //   sp.[SEPT_VALUE] AS 'SEPT VALUE',
    //   ss.[SET_CODE] AS 'SET CODE',
    //   ss.[SET/PCS/PP] AS 'SET/PCS/PP',
    //   ss.[STITCHING_TYPE] AS 'STITCHING TYPE',
    //   ss.[SIZE] AS 'SIZE',
    //   ss.[SIZE_(L)_CMS] AS 'SIZE (L) CMS',
    //   ss.[SIZE_(L)_INCH] AS 'SIZE (L) INCH',
    //   ss.[SIZE_(W)_CMS] AS 'SIZE (W) CMS',
    //   ss.[SIZE_(W)_INCH] AS 'SIZE (W) INCH',
    //   ss.[STORE_FORMAT] AS 'STORE FORMAT',
    //   ss.[TEAM_LEADER] AS 'TEAM LEADER',
    //   ss.[TERMS_FOB/CIF] AS 'TERMS FOB/CIF',

    //   ss.[TYPE_OF_INNOVATION] AS 'TYPE OF INNOVATION',
    //   ss.[TOTAL_(GSM)] AS 'TOTAL (GSM)',
    //   ss.[TOTAL_AVERAGE_GSM] AS 'TOTAL AVERAGE GSM',
    //   ss.[TOTAL_SQR_MTRS] AS 'TOTAL SQR MTRS',

    //   ss.[TOTAL(TOTAL_KGS)] AS 'TOTAL(TOTAL KGS)',
    //   ss.[TOTAL(TUFTING_KGS)] AS 'TOTAL(TUFTING KGS)',
    //   ss.[TPR_GSM] AS 'TPR GSM',
    //   ss.[TUFT_(GSM)] AS 'TUFT (GSM)',
    //   ss.[TUFTING/KNITTING_MACHINE] AS 'TUFTING/KNITTING MACHINE',
    //   ss.[TOTAL_SATEEN_MTR] AS 'TOTAL SATEEN MTR',
    //   ss.[UNIT_OF_SPEC] AS 'UNIT OF SPEC',
    //   ss.[WELSPUN_UK/US_SALES_REP] AS 'WELSPUN UK/US SALES REP',
    //   ss.[WELTRACK(_YES/_NO)] AS 'WELTRACK( YES/ NO)',
    //   ss.[WUSA/_WUK_WAREHOUSE] AS 'WUSA/ WUK WAREHOUSE',
    //   ss.[YEARLY_UVR] AS 'YEARLY UVR',
    //   ss.[PRODUCT_CAT] AS 'PRODUCT CAT',
    //   ss.[PRODUCT_SUBCAT] AS 'PRODUCT SUBCAT',
    //   ss.[PLANT] AS 'PLANT',
    //   ss.[SR_NO] AS 'SR NO'
    //   FROM   salesplan_publish AS sp
    //         INNER JOIN SALESPLAN_SIMULATION AS ss
    //                 ON sp.[unique_identification_no] = ss.[unique_identification_no]
    //                     AND sp.[product_cat] = 'Rugs' AND (sp.[VERSION_NO] like '%${req.query.teamLeader}%' OR sp.[TEAM_LEADER] like '%${req.query.teamLeader}%')
    //   `;
    // }

    // else if (req.query.productName == 'Bath') {

    //   query += `
    //   SELECT
    //   sp.[VERSION_NO] AS 'versionNo',
    //   sp.[UNIQUE_IDENTIFICATION_NO] AS 'UNIQUE IDENTIFICATION NO',

    //   (sp.[APR_(SALEABLE_UNITS)] + sp.[MAY_(SALEABLE_UNITS)] + sp.[JUN_(SALEABLE_UNITS)] + sp.[JULY_(SALEABLE_UNITS)] + sp.[AUGUST_(SALEABLE_UNITS)] + sp.[SEP_(SALEABLE_UNITS)] + sp.[OCT_(SALEABLE_UNIT)] + sp.[NOVEMBER_(SALEABLE_UNITS)] + sp.[DECEMBER_(SALEABLE_UNITS)] + sp.[JANUARY_(SALEABLE_UNITS)] + sp.[FEBRUARY_(SALEABLE_UNITS)] + sp.[MARCH_(SALEABLE_UNITS)]) as 'Total Saleable Unit',
    //   (sp.[APRIL_VALUE] + sp.[MAY_VALUE] + sp.[JUNE_VALUE] + sp.[JULY_VALUE] + sp.[AUG_VALUE] + sp.[SEPT_VALUE] + sp.[OCT_(VALUE)] + sp.[NOV_VALUE] + sp.[DEC_VALUE] + sp.[JAN_VALUE] + sp.[FEB_VALUE] + sp.[MAR_VALUE]) as 'Total Value' ,
    //   (sp.[APRIL_USDN] + sp.[MAY_USDN] + sp.[JUNE_USDN] + sp.[JULY_USDN] + sp.[AUG_USDN] + sp.[SEPT_USDN] + sp.[OCTOBER_(USDN)] + sp.[NOV_USDN] + sp.[DEC_USDN] + sp.[JAN_USDN] + sp.[FEB_USDN] + sp.[MAR_USDN]) as 'Total USDN' ,
    //   (sp.[APR_(SALEABLE_UNITS)] + sp.[MAY_(SALEABLE_UNITS)] + sp.[JUN_(SALEABLE_UNITS)] + sp.[JULY_(SALEABLE_UNITS)] + sp.[AUGUST_(SALEABLE_UNITS)] + sp.[SEP_(SALEABLE_UNITS)] + sp.[OCT_(SALEABLE_UNIT)] + sp.[NOVEMBER_(SALEABLE_UNITS)] + sp.[DECEMBER_(SALEABLE_UNITS)] + sp.[JANUARY_(SALEABLE_UNITS)] + sp.[FEBRUARY_(SALEABLE_UNITS)] +sp.[MARCH_(SALEABLE_UNITS)]) as 'Total PCS',
    //   (sp.[APRIL_KGS] + sp.[MAY_KGS] + sp.[JUNE_KGS] + sp.[JULY_KGS] + sp.[AUG_KGS] + sp.[SEP_KGS] + sp.[OCT_KGS] + sp.[NOV_KGS] + sp.[DEC_KGS] + sp.[JAN_KGS] + sp.[FEB_KGS] + sp.[MAR_KGS]) as 'Total KGS',

    //   ss.[APRIL_(TOTAL_KGS)] AS 'APRIL (TOTAL KGS)',

    //   sp.[APRIL_KGS] AS 'APRIL KGS',
    //   sp.[APR_RATE_AS_PER_CURRENCY] AS 'APR RATE AS PER CURRENCY',
    //   sp.[APR_(SALEABLE_UNITS)] AS 'APR (SALEABLE UNITS)',
    //   (sp.[APR_(SALEABLE_UNITS)] * ss.[NO_OF_PCS_IN_SET]) AS 'APRIL PCS',

    //   sp.[APRIL_USDN] AS 'APRIL USDN',
    //   sp.[APRIL_VALUE] AS 'APRIL VALUE',

    //   sp.[AUG_KGS] AS 'AUG KGS',
    //   (sp.[AUGUST_(SALEABLE_UNITS)] * ss.[NO_OF_PCS_IN_SET]) AS 'AUGUST(PCS)',
    //   sp.[AUG_RATE_AS_PER_CURRENCY] AS 'AUG RATE AS PER CURRENCY',
    //   sp.[AUGUST_(SALEABLE_UNITS)] AS 'AUGUST (SALEABLE UNITS)',
    //   sp.[AUG_USDN] AS 'AUG USDN',
    //   sp.[AUG_VALUE] AS 'AUG VALUE',
    //   ss.[BILLING(WUSA/WUK/DIRECT)] AS 'BILLING(WUSA/WUK/DIRECT)',
    //   ss.[BRAND_NAME] AS 'BRAND NAME',
    //   ss.[BRAND_TYPE_:_OWN_/_RETAILER_LICENCE_/_WE] AS 'BRAND TYPE : OWN / RETAILER LICENCE / WE',
    //   ss.[CHANNEL] AS 'CHANNEL',
    //   ss.[COUNTRY] AS 'COUNTRY',
    //   sp.[DEC_KGS] AS 'DEC KGS',
    //   (sp.[DECEMBER_(SALEABLE_UNITS)] * ss.[NO_OF_PCS_IN_SET]) AS 'DECEMBER (PCS)',
    //   sp.[DEC_RATE_AS_PER_CURRENCY] AS 'DEC RATE AS PER CURRENCY',
    //   sp.[DECEMBER_(SALEABLE_UNITS)] AS 'DECEMBER (SALEABLE UNITS)',
    //   sp.[DEC_USDN] AS 'DEC USDN',
    //   sp.[DEC_VALUE] AS 'DEC VALUE',
    //   ss.[DYEING/_WASHING] AS 'DYEING/ WASHING',
    //   ss.[EMB(Y/_N)] AS 'EMB(Y/ N)',
    //   ss.[END_CUSTOMER_CODE] AS 'END CUSTOMER CODE',
    //   sp.[END_CUSTOMER_NAME] AS 'END CUSTOMER NAME',
    //   ss.[ENQ_STATUS(LIKELY/MOST_LIKELY_/CONFIRME] AS 'ENQ STATUS(LIKELY/MOST LIKELY /CONFIRME',
    //   ss.[EXPORT/_DOMESTIC] AS 'EXPORT/ DOMESTIC',
    //   sp.[FEB_KGS] AS 'FEB KGS',
    //   (sp.[FEBRUARY_(SALEABLE_UNITS)] * ss.[NO_OF_PCS_IN_SET]) AS 'FEBRUARY(PCS)',
    //   ss.[FEBRUARY(TOTAL_KGS)] AS 'FEBRUARY(TOTAL KGS)',
    //   sp.[FEB_RATE_AS_PER_CURRENCY] AS 'FEB RATE AS PER CURRENCY',
    //   sp.[FEBRUARY_(SALEABLE_UNITS)] AS 'FEBRUARY (SALEABLE UNITS)',
    //   sp.[FEB_USDN] AS 'FEB USDN',
    //   sp.[FEB_VALUE] AS 'FEB VALUE',
    //   ss.[FIBRE_TYPE] AS 'FIBRE TYPE',
    //   ss.[GROUND_1_PLY] AS 'GROUND 1 PLY',
    //   ss.[GROUND_COUNT] AS 'GROUND COUNT',
    //   ss.[GROUND_TYPE_1] AS 'GROUND TYPE 1',
    //   ss.[GROUND_YARN_2_GMS] AS 'GROUND YARN 2 GMS',
    //   ss.[GROUND_YARN_GMS] AS 'GROUND YARN GMS',
    //   ss.[GSM] AS 'GSM',
    //   ss.[INNOVATION_TYPE] AS 'INNOVATION TYPE',
    //   ss.[INNOVATION(YES/_NO)] AS 'INNOVATION(YES/ NO)',
    //   sp.[JAN_KGS] AS 'JAN KGS',
    //   (sp.[JANUARY_(SALEABLE_UNITS)] * ss.[NO_OF_PCS_IN_SET]) AS 'JAN PCS',
    //   sp.[JAN_RATE_AS_PER_CURRENCY] AS 'JAN RATE AS PER CURRENCY',
    //   sp.[JANUARY_(SALEABLE_UNITS)] AS 'JANUARY (SALEABLE UNITS)',
    //   sp.[JAN_USDN] AS 'JAN USDN',
    //   sp.[JAN_VALUE] AS 'JAN VALUE',
    //   sp.[JULY_KGS] AS 'JULY KGS',
    //   (sp.[JULY_(SALEABLE_UNITS)] * ss.[NO_OF_PCS_IN_SET]) AS 'JULY(PCS)',
    //   sp.[JUL_RATE_AS_PER_CURRENCY] AS 'JUL RATE AS PER CURRENCY',
    //   sp.[JULY_(SALEABLE_UNITS)] AS 'JULY (SALEABLE UNITS)',
    //   sp.[JULY_USDN] AS 'JULY USDN',
    //   sp.[JULY_VALUE] AS 'JULY VALUE',
    //   sp.[JUNE_KGS] AS 'JUNE KGS',
    //   (sp.[JUN_(SALEABLE_UNITS)] * ss.[NO_OF_PCS_IN_SET]) AS 'JUNE(PCS)',
    //   sp.[JUN_RATE_AS_PER_CURRENCY] AS 'JUN RATE AS PER CURRENCY',
    //   sp.[JUN_(SALEABLE_UNITS)] AS 'JUN (SALEABLE UNITS)',
    //   sp.[JUNE_USDN] AS 'JUNE USDN',
    //   sp.[JUNE_VALUE] AS 'JUNE VALUE',
    //   ss.[LIKE_TO_LIKE/NEW] AS 'LIKE TO LIKE/NEW',
    //   ss.[LOGO] AS 'LOGO',
    //   ss.[LOOM] AS 'LOOM',
    //   (sp.[MARCH_(SALEABLE_UNITS)] * ss.[NO_OF_PCS_IN_SET]) AS 'MARCH(PCS)',
    //   sp.[MAR_KGS] AS 'MAR KGS',
    //   sp.[MAR_RATE_AS_PER_CURRENCY] AS 'MAR RATE AS PER CURRENCY',
    //   sp.[MARCH_(SALEABLE_UNITS)] AS 'MARCH (SALEABLE UNITS)',
    //   sp.[MAR_USDN] AS 'MAR USDN',
    //   sp.[MAR_VALUE] AS 'MAR VALUE',
    //   ss.[MATCODE] AS 'MATCODE',
    //   ss.[MATERIAL_DESCRIPTION] AS 'MATERIAL DESCRIPTION',
    //   sp.[MAY_KGS] AS 'MAY KGS',
    //   (sp.[MAY_(SALEABLE_UNITS)] * ss.[NO_OF_PCS_IN_SET]) AS 'MAY(PCS)',
    //   sp.[MAY_RATE_AS_PER_CURRENCY] AS 'MAY RATE AS PER CURRENCY',
    //   sp.[MAY_(SALEABLE_UNITS)] AS 'MAY (SALEABLE UNITS)',
    //   sp.[MAY_USDN] AS 'MAY USDN',
    //   sp.[MAY_VALUE] AS 'MAY VALUE',
    //   ss.[MERCHANT] AS 'MERCHANT',
    //   ss.[MERCHANT_ID] AS 'MERCHANT ID',
    //   ss.[NEW_PROGRAM] AS 'NEW PROGRAM',
    //   ss.[NO_OF_PCS_IN_SET] AS 'NO OF PCS IN SET',
    //   sp.[NOV_KGS] AS 'NOV KGS',
    //   (sp.[NOVEMBER_(SALEABLE_UNITS)] * ss.[NO_OF_PCS_IN_SET]) AS 'NOVEMBER(PCS)',
    //   sp.[NOV_RATE_AS_PER_CURRENCY] AS 'NOV RATE AS PER CURRENCY',
    //   sp.[NOVEMBER_(SALEABLE_UNITS)] AS 'NOVEMBER (SALEABLE UNITS)',
    //   sp.[NOV_USDN] AS 'NOV USDN',
    //   sp.[NOV_VALUE] AS 'NOV VALUE',
    //   sp.[OCT_KGS] AS 'OCT KGS',
    //   sp.[OCT_(SALEABLE_UNIT)] AS 'OCT (SALEABLE UNIT)',
    //   sp.[OCT_RATE_AS_PER_CURRENCY] AS 'OCT RATE AS PER CURRENCY',
    //   (sp.[OCT_(SALEABLE_UNIT)] * ss.[NO_OF_PCS_IN_SET]) AS 'OCTOBER(PCS)',
    //   sp.[OCTOBER_(USDN)] AS 'OCTOBER (USDN)',
    //   sp.[OCT_(VALUE)] AS 'OCT (VALUE)',
    //   ss.[PILE_1_PLY] AS 'PILE 1 PLY',
    //   ss.[PILE_COUNT_1] AS 'PILE COUNT 1',
    //   ss.[PILE_TYPE_1] AS 'PILE TYPE 1',
    //   ss.[PILE_TYPE_2] AS 'PILE TYPE 2',
    //   ss.[PILE_YARN_2_GMS] AS 'PILE YARN 2 GMS',
    //   ss.[PILE_YARN_GMS] AS 'PILE YARN GMS',
    //   ss.[PROGRAM] AS 'PROGRAM',
    //   ss.[PROGRAM_CODE__↑] AS 'PROGRAM CODE ↑',
    //   ss.[PROGRAM_CODE_UPDATED] AS 'PROGRAM CODE UPDATED',

    //   ss.[REGION] AS 'REGION',
    //   ss.[REPL_/_PROMO] AS 'REPL / PROMO',
    //   ss.[REMARKS] AS 'REMARKS',
    //   ss.[SCM_DATA_NEEDED] AS 'SCM DATA NEEDED',

    //   ss.[SELLING_CURRENCY] AS 'SELLING CURRENCY',
    //   sp.[SEP_KGS] AS 'SEP KGS',
    //   (sp.[SEP_(SALEABLE_UNITS)] * ss.[NO_OF_PCS_IN_SET]) AS 'SEP PCS',
    //   sp.[SEP_RATE_AS_PER_CURRENCY] AS 'SEP RATE AS PER CURRENCY',
    //   sp.[SEP_(SALEABLE_UNITS)] AS 'SEP (SALEABLE UNITS)',
    //   sp.[SEPT_USDN] AS 'SEPT USDN',
    //   sp.[SEPT_VALUE] AS 'SEPT VALUE',
    //   ss.[SET/PCS/PP] AS 'SET/PCS/PP',
    //   ss.[SIZE] AS 'SIZE',
    //   ss.[TEAM_LEADER] AS 'TEAM LEADER',
    //   ss.[TERMS_FOB/CIF] AS 'TERMS FOB/CIF',

    //   ss.[USDN/KGS] AS 'USDN/KGS',
    //   ss.[UNIT_OF_SPEC] AS 'UNIT OF SPEC',
    //   ss.[WEFT_1_PLY] AS 'WEFT 1 PLY',
    //   ss.[WEFT_2_PLY] AS 'WEFT 2 PLY',
    //   ss.[WEFT_COUNT_1] AS 'WEFT COUNT 1',
    //   ss.[WEFT_TYPE_1] AS 'WEFT TYPE 1',
    //   ss.[WEFT_YARN_1_GMS] AS 'WEFT YARN 1 GMS',
    //   ss.[WEFT_YARN_2_GMS] AS 'WEFT YARN 2 GMS',
    //   ss.[WELSPUN_UK/US_SALES_REP] AS 'WELSPUN UK/US SALES REP',
    //   ss.[WELTRACK(_YES/_NO)] AS 'WELTRACK( YES/ NO)',
    //   ss.[WT/PC] AS 'WT/PC',
    //   ss.[WUSA/_WUK_WAREHOUSE] AS 'WUSA/ WUK WAREHOUSE',
    //   ss.[YEARLY_UVR] AS 'YEARLY UVR',
    //   ss.[PRODUCT_CAT] AS 'PRODUCT CAT',
    //   ss.[PRODUCT_SUBCAT] AS 'PRODUCT SUBCAT',
    //   ss.[PLANT] AS 'PLANT',
    //   ss.[SR_NO] AS 'SR NO',
    //   ss.[SHEARING] AS 'SHEARING'
    //   FROM   salesplan_publish AS sp
    //         INNER JOIN SALESPLAN_SIMULATION AS ss
    //                 ON sp.[unique_identification_no] = ss.[unique_identification_no]
    //                     AND sp.[product_cat] in ${productList} AND (sp.[VERSION_NO] like '%${req.query.teamLeader}%' OR sp.[TEAM_LEADER] like '%${req.query.teamLeader}%')
    //   `;

    // }


    // else if (req.query.productName == 'Sheets') {

    //   query += `
    //   SELECT

    //   sp.[VERSION_NO] AS 'versionNo',
    //   sp.[UNIQUE_IDENTIFICATION_NO] AS 'UNIQUE IDENTIFICATION NO',

    //   (sp.[APR_(SALEABLE_UNITS)] + sp.[MAY_(SALEABLE_UNITS)] + sp.[JUN_(SALEABLE_UNITS)] + sp.[JULY_(SALEABLE_UNITS)] + sp.[AUGUST_(SALEABLE_UNITS)] + sp.[SEP_(SALEABLE_UNITS)] + sp.[OCT_(SALEABLE_UNIT)] + sp.[NOVEMBER_(SALEABLE_UNITS)] + sp.[DECEMBER_(SALEABLE_UNITS)] + sp.[JANUARY_(SALEABLE_UNITS)] + sp.[FEBRUARY_(SALEABLE_UNITS)] + sp.[MARCH_(SALEABLE_UNITS)]) as 'Total Saleable Unit',
    //   (sp.[APRIL_VALUE] + sp.[MAY_VALUE] + sp.[JUNE_VALUE] + sp.[JULY_VALUE] + sp.[AUG_VALUE] + sp.[SEPT_VALUE] + sp.[OCT_(VALUE)] + sp.[NOV_VALUE] + sp.[DEC_VALUE] + sp.[JAN_VALUE] + sp.[FEB_VALUE] + sp.[MAR_VALUE]) as 'Total Value' ,
    //   (sp.[APRIL_USDN] + sp.[MAY_USDN] + sp.[JUNE_USDN] + sp.[JULY_USDN] + sp.[AUG_USDN] + sp.[SEPT_USDN] + sp.[OCTOBER_(USDN)] + sp.[NOV_USDN] + sp.[DEC_USDN] + sp.[JAN_USDN] + sp.[FEB_USDN] + sp.[MAR_USDN]) as 'Total USDN' ,
    //   (sp.[APR_(SALEABLE_UNITS)] + sp.[MAY_(SALEABLE_UNITS)] + sp.[JUN_(SALEABLE_UNITS)] + sp.[JULY_(SALEABLE_UNITS)] + sp.[AUGUST_(SALEABLE_UNITS)] + sp.[SEP_(SALEABLE_UNITS)] + sp.[OCT_(SALEABLE_UNIT)] + sp.[NOVEMBER_(SALEABLE_UNITS)] + sp.[DECEMBER_(SALEABLE_UNITS)] + sp.[JANUARY_(SALEABLE_UNITS)] + sp.[FEBRUARY_(SALEABLE_UNITS)] +sp.[MARCH_(SALEABLE_UNITS)]) as 'Total PCS',

    //   ss.[APR_MTR] AS 'APR MTR',
    //   sp.[APR_RATE_AS_PER_CURRENCY] AS 'APR RATE AS PER CURRENCY',
    //   sp.[APR_(SALEABLE_UNITS)] AS 'APR (SALEABLE UNITS)',
    //   (sp.[APR_(SALEABLE_UNITS)] * ss.[NO_OF_PCS_IN_SET]) AS 'APRIL PCS',

    //   sp.[APRIL_USDN] AS 'APRIL USDN',
    //   sp.[APRIL_VALUE] AS 'APRIL VALUE',
    //   ss.[AUG_MTR] AS 'AUG MTR',
    //   (sp.[AUGUST_(SALEABLE_UNITS)] * ss.[NO_OF_PCS_IN_SET]) AS 'AUGUST(PCS)',
    //   sp.[AUG_RATE_AS_PER_CURRENCY] AS 'AUG RATE AS PER CURRENCY',
    //   sp.[AUGUST_(SALEABLE_UNITS)] AS 'AUGUST (SALEABLE UNITS)',
    //   sp.[AUG_USDN] AS 'AUG USDN',
    //   sp.[AUG_VALUE] AS 'AUG VALUE',
    //   ss.[BILLING(WUSA/WUK/DIRECT)] AS 'BILLING(WUSA/WUK/DIRECT)',
    //   ss.[BRAND_NAME] AS 'BRAND NAME',
    //   ss.[BRAND_TYPE_:_OWN_/_RETAILER_LICENCE_/_WE] AS 'BRAND TYPE : OWN / RETAILER LICENCE / WE',
    //   ss.[CHANNEL] AS 'CHANNEL',
    //   ss.[CONSTRUCTION] AS 'CONSTRUCTION',
    //   (sp.[DECEMBER_(SALEABLE_UNITS)] * ss.[NO_OF_PCS_IN_SET]) AS 'DECEMBER (PCS)',
    //   sp.[DEC_RATE_AS_PER_CURRENCY] AS 'DEC RATE AS PER CURRENCY',
    //   sp.[DECEMBER_(SALEABLE_UNITS)] AS 'DECEMBER (SALEABLE UNITS)',
    //   sp.[DEC_USDN] AS 'DEC USDN',
    //   sp.[DEC_VALUE] AS 'DEC VALUE',
    //   ss.[DYEING/_WASHING] AS 'DYEING/ WASHING',
    //   ss.[DYED/_PRINTED_TO_REFER] AS 'DYED/ PRINTED TO REFER',
    //   ss.[EMBROIDARY] AS 'EMBROIDARY',
    //   ss.[END_CUSTOMER_CODE] AS 'END CUSTOMER CODE',
    //   sp.[END_CUSTOMER_NAME] AS 'END CUSTOMER NAME',
    //   ss.[ENQ_STATUS(LIKELY/MOST_LIKELY_/CONFIRME] AS 'ENQ STATUS(LIKELY/MOST LIKELY /CONFIRME',
    //   ss.[EXPORT/_DOMESTIC] AS 'EXPORT/ DOMESTIC',
    //   (sp.[FEBRUARY_(SALEABLE_UNITS)] * ss.[NO_OF_PCS_IN_SET]) AS 'FEBRUARY(PCS)',
    //   ss.[FEB_MTR] AS 'FEB MTR',
    //   sp.[FEB_RATE_AS_PER_CURRENCY] AS 'FEB RATE AS PER CURRENCY',
    //   sp.[FEBRUARY_(SALEABLE_UNITS)] AS 'FEBRUARY (SALEABLE UNITS)',
    //   sp.[FEB_USDN] AS 'FEB USDN',
    //   sp.[FEB_VALUE] AS 'FEB VALUE',
    //   ss.[FINISH_TYPE] AS 'FINISH TYPE',
    //   ss.[FINISH_WIDTH] AS 'FINISH WIDTH',
    //   ss.[GLM] AS 'GLM',
    //   ss.[GREIGE_WIDTH_GABRIC_2] AS 'GREIGE WIDTH GABRIC 2',
    //   ss.[GRELGE_WLDTH] AS 'GRELGE WLDTH',
    //   ss.[INNOVATION(YES/_NO)] AS 'INNOVATION(YES/ NO)',
    //   (sp.[JANUARY_(SALEABLE_UNITS)] * ss.[NO_OF_PCS_IN_SET]) AS 'JAN PCS',
    //   ss.[JAN_MTR] AS 'JAN MTR',
    //   sp.[JAN_RATE_AS_PER_CURRENCY] AS 'JAN RATE AS PER CURRENCY',
    //   sp.[JANUARY_(SALEABLE_UNITS)] AS 'JANUARY (SALEABLE UNITS)',
    //   sp.[JAN_USDN] AS 'JAN USDN',
    //   sp.[JAN_VALUE] AS 'JAN VALUE',
    //   (sp.[JULY_(SALEABLE_UNITS)] * ss.[NO_OF_PCS_IN_SET]) AS 'JULY(PCS)',
    //   ss.[JUL_MTR] AS 'JUL MTR',
    //   sp.[JUL_RATE_AS_PER_CURRENCY] AS 'JUL RATE AS PER CURRENCY',
    //   sp.[JULY_(SALEABLE_UNITS)] AS 'JULY (SALEABLE UNITS)',
    //   sp.[JULY_USDN] AS 'JULY USDN',
    //   sp.[JULY_VALUE] AS 'JULY VALUE',
    //   (sp.[JUN_(SALEABLE_UNITS)] * ss.[NO_OF_PCS_IN_SET]) AS 'JUNE(PCS)',
    //   ss.[JUNE_MTR] AS 'JUNE MTR',
    //   sp.[JUN_RATE_AS_PER_CURRENCY] AS 'JUN RATE AS PER CURRENCY',
    //   sp.[JUN_(SALEABLE_UNITS)] AS 'JUN (SALEABLE UNITS)',
    //   sp.[JUNE_USDN] AS 'JUNE USDN',
    //   sp.[JUNE_VALUE] AS 'JUNE VALUE',
    //   ss.[KNITTED_FINISH_WIDTH] AS 'KNITTED FINISH WIDTH',
    //   ss.[KNITTED_MTRS] AS 'KNITTED MTRS',
    //   ss.[LIKE_TO_LIKE/NEW] AS 'LIKE TO LIKE/NEW',
    //   ss.[LOGO] AS 'LOGO',
    //   ss.[LOOM] AS 'LOOM',
    //   ss.[LYCRA_FLNSH_WLDTH] AS 'LYCRA FLNSH WLDTH',
    //   (sp.[MARCH_(SALEABLE_UNITS)] * ss.[NO_OF_PCS_IN_SET]) AS 'MARCH(PCS)',
    //   ss.[MAR_MTR] AS 'MAR MTR',
    //   sp.[MAR_RATE_AS_PER_CURRENCY] AS 'MAR RATE AS PER CURRENCY',
    //   sp.[MARCH_(SALEABLE_UNITS)] AS 'MARCH (SALEABLE UNITS)',
    //   sp.[MAR_USDN] AS 'MAR USDN',
    //   sp.[MAR_VALUE] AS 'MAR VALUE',
    //   ss.[MATCODE] AS 'MATCODE',
    //   ss.[MATERIAL_DESCRIPTION] AS 'MATERIAL DESCRIPTION',
    //   (sp.[MAY_(SALEABLE_UNITS)] * ss.[NO_OF_PCS_IN_SET]) AS 'MAY(PCS)',
    //   ss.[MAY_MTR] AS 'MAY MTR',
    //   sp.[MAY_RATE_AS_PER_CURRENCY] AS 'MAY RATE AS PER CURRENCY',
    //   sp.[MAY_(SALEABLE_UNITS)] AS 'MAY (SALEABLE UNITS)',
    //   sp.[MAY_USDN] AS 'MAY USDN',
    //   sp.[MAY_VALUE] AS 'MAY VALUE',
    //   ss.[MERCHANT] AS 'MERCHANT',
    //   ss.[MARKER_EFFICIENCY_ITEM_KNITTED] AS 'MARKER EFFICIENCY ITEM KNITTED',
    //   ss.[MARKER_EFFLCLENCY__PROGRAM] AS 'MARKER EFFLCLENCY PROGRAM',
    //   ss.[MARKER_EFFLCLENCY_LTEM] AS 'MARKER EFFLCLENCY LTEM',
    //   ss.[MTR._CONSUMP_FABRIC_-1] AS 'MTR. CONSUMP FABRIC -1',
    //   ss.[MTR._CONSUMP_FABRIC_-2] AS 'MTR. CONSUMP FABRIC -2',
    //   ss.[MTR._CONSUMP_LYCRA] AS 'MTR. CONSUMP LYCRA',
    //   ss.[MTR._CONSUMP_NON_WOVEN] AS 'MTR. CONSUMP NON WOVEN',
    //   ss.[NON_WOVEN_FINISH_WIDTH] AS 'NON WOVEN FINISH WIDTH',
    //   ss.[NON_WOVEN_MTRS] AS 'NON WOVEN MTRS',
    //   ss.[MTR._CONSUMP_KNITTED] AS 'MTR. CONSUMP KNITTED',
    //   ss.[NON_WOVEN_LAMINATED__FINISH_WIDTH] AS 'NON WOVEN LAMINATED FINISH WIDTH',
    //   ss.[NEW_PROGRAM] AS 'NEW PROGRAM',
    //   ss.[NO_OF_PCS_IN_SET] AS 'NO OF PCS IN SET',
    //   (sp.[NOVEMBER_(SALEABLE_UNITS)] * ss.[NO_OF_PCS_IN_SET]) AS 'NOVEMBER(PCS)',
    //   ss.[NOV_MTR] AS 'NOV MTR',
    //   sp.[NOV_RATE_AS_PER_CURRENCY] AS 'NOV RATE AS PER CURRENCY',
    //   sp.[NOVEMBER_(SALEABLE_UNITS)] AS 'NOVEMBER (SALEABLE UNITS)',
    //   sp.[NOV_USDN] AS 'NOV USDN',
    //   sp.[NOV_VALUE] AS 'NOV VALUE',
    //   sp.[OCT_(SALEABLE_UNIT)] AS 'OCT (SALEABLE UNIT)',
    //   sp.[OCT_RATE_AS_PER_CURRENCY] AS 'OCT RATE AS PER CURRENCY',
    //   ss.[OCT_MTR] AS 'OCT MTR',
    //   (sp.[OCT_(SALEABLE_UNIT)] * ss.[NO_OF_PCS_IN_SET]) AS 'OCTOBER(PCS)',
    //   sp.[OCTOBER_(USDN)] AS 'OCTOBER (USDN)',
    //   sp.[OCT_(VALUE)] AS 'OCT (VALUE)',
    //   ss.[ORDER_TYPE] AS 'ORDER TYPE',
    //   ss.[PROGRAM] AS 'PROGRAM',
    //   ss.[PROGRAM_CODE__↑] AS 'PROGRAM CODE ↑',
    //   ss.[PROGRAM_CODE_UPDATED] AS 'PROGRAM CODE UPDATED',
    //   ss.[PRINTING] AS 'PRINTING',
    //   ss.[PROD_INSP_MEMO] AS 'PROD INSP MEMO',
    //   ss.[PRODUCT_TYPE_QUALITY] AS 'PRODUCT TYPE QUALITY',
    //   ss.[Q1_PCS] AS 'Q1 PCS',
    //   ss.[Q1_SATEEN_MTR] AS 'Q1 SATEEN MTR',
    //   ss.[Q1_TOTAL_(USDN)] AS 'Q1 TOTAL (USDN)',
    //   ss.[Q1_UVR] AS 'Q1 UVR',
    //   ss.[Q2_PCS] AS 'Q2 PCS',
    //   ss.[Q2_SATEEN_MTR] AS 'Q2 SATEEN MTR',
    //   ss.[Q2_TOTAL_(USDN)] AS 'Q2 TOTAL (USDN)',
    //   ss.[Q2_UVR] AS 'Q2 UVR',
    //   ss.[Q3_PCS] AS 'Q3 PCS',
    //   ss.[Q3_SATEEN_MTR] AS 'Q3 SATEEN MTR',
    //   ss.[Q3_TOTAL_(USDN)] AS 'Q3 TOTAL (USDN)',
    //   ss.[Q3_UVR] AS 'Q3 UVR',
    //   ss.[Q4__(USDN)] AS 'Q4 (USDN)',
    //   ss.[Q4_PCS] AS 'Q4 PCS',
    //   ss.[Q4_SATEEN_MTR] AS 'Q4 SATEEN MTR',
    //   ss.[Q4_UVR] AS 'Q4 UVR',
    //   ss.[REGION] AS 'REGION',
    //   ss.[SELLING_CURRENCY] AS 'SELLING CURRENCY',
    //   (sp.[SEP_(SALEABLE_UNITS)] * ss.[NO_OF_PCS_IN_SET]) AS 'SEP PCS',
    //   ss.[SEP_MTR] AS 'SEP MTR',
    //   sp.[SEP_RATE_AS_PER_CURRENCY] AS 'SEP RATE AS PER CURRENCY',
    //   sp.[SEP_(SALEABLE_UNITS)] AS 'SEP (SALEABLE UNITS)',
    //   sp.[SEPT_USDN] AS 'SEPT USDN',
    //   sp.[SEPT_VALUE] AS 'SEPT VALUE',
    //   ss.[SET/PCS/PP] AS 'SET/PCS/PP',
    //   ss.[STITCHING_TYPE] AS 'STITCHING TYPE',
    //   ss.[SIZE] AS 'SIZE',
    //   ss.[SIZE_(L)_CMS] AS 'SIZE (L) CMS',
    //   ss.[SIZE_(L)_INCH] AS 'SIZE (L) INCH',
    //   ss.[SIZE_(W)_CMS] AS 'SIZE (W) CMS',
    //   ss.[SIZE_(W)_INCH] AS 'SIZE (W) INCH',
    //   ss.[STORE_FORMAT] AS 'STORE FORMAT',
    //   ss.[TEAM_LEADER] AS 'TEAM LEADER',
    //   ss.[TERMS_FOB/CIF] AS 'TERMS FOB/CIF',

    //   ss.[TYPE_OF_INNOVATION] AS 'TYPE OF INNOVATION',

    //   ss.[TOTAL_SATEEN_MTR] AS 'TOTAL SATEEN MTR',
    //   ss.[TC] AS 'TC',
    //   ss.[TOTAL_CONSUMPTION_OF_SATEEN] AS 'TOTAL CONSUMPTION OF SATEEN',
    //   ss.[WADDING_CONSUMPTION] AS 'WADDING CONSUMPTION',
    //   ss.[WADDING_MTRS] AS 'WADDING MTRS',
    //   ss.[WELSPUN_UK/US_SALES_REP] AS 'WELSPUN UK/US SALES REP',
    //   ss.[WELTRACK(_YES/_NO)] AS 'WELTRACK( YES/ NO)',
    //   ss.[WUSA/_WUK_WAREHOUSE] AS 'WUSA/ WUK WAREHOUSE',
    //   ss.[WADDING_TYPE] AS 'WADDING TYPE',
    //   ss.[WARP_COUNT] AS 'WARP COUNT',
    //   ss.[WARP_PLY] AS 'WARP PLY',
    //   ss.[WARP_WT] AS 'WARP WT',
    //   ss.[WARP_YARN_TYPES] AS 'WARP YARN TYPES',
    //   ss.[WEAVE] AS 'WEAVE',
    //   ss.[WEFT_COUNT] AS 'WEFT COUNT',
    //   ss.[WEFT_PLY] AS 'WEFT PLY',
    //   ss.[WEFT_WT] AS 'WEFT WT',
    //   ss.[YEARLY_UVR] AS 'YEARLY UVR',
    //   ss.[PRODUCT_CAT] AS 'PRODUCT CAT',
    //   ss.[PRODUCT_SUBCAT] AS 'PRODUCT SUBCAT',
    //   ss.[PLANT] AS 'PLANT',
    //   ss.[SR_NO] AS 'SR NO'
    //   FROM   salesplan_publish AS sp
    //         INNER JOIN SALESPLAN_SIMULATION AS ss
    //                 ON sp.[unique_identification_no] = ss.[unique_identification_no]
    //                     AND sp.[product_cat] = 'Sheets' AND (sp.[VERSION_NO] like '%${req.query.teamLeader}%' OR sp.[TEAM_LEADER] like '%${req.query.teamLeader}%')
    //   `;

    // }

    // else if (req.query.productName == 'Top of Bed') {

    //   query += `
    //   SELECT

    //   sp.[VERSION_NO] AS 'versionNo',
    //   sp.[UNIQUE_IDENTIFICATION_NO] AS 'UNIQUE IDENTIFICATION NO',

    //   (sp.[APR_(SALEABLE_UNITS)] + sp.[MAY_(SALEABLE_UNITS)] + sp.[JUN_(SALEABLE_UNITS)] + sp.[JULY_(SALEABLE_UNITS)] + sp.[AUGUST_(SALEABLE_UNITS)] + sp.[SEP_(SALEABLE_UNITS)] + sp.[OCT_(SALEABLE_UNIT)] + sp.[NOVEMBER_(SALEABLE_UNITS)] + sp.[DECEMBER_(SALEABLE_UNITS)] + sp.[JANUARY_(SALEABLE_UNITS)] + sp.[FEBRUARY_(SALEABLE_UNITS)] + sp.[MARCH_(SALEABLE_UNITS)]) as 'Total Saleable Unit',
    //   (sp.[APRIL_VALUE] + sp.[MAY_VALUE] + sp.[JUNE_VALUE] + sp.[JULY_VALUE] + sp.[AUG_VALUE] + sp.[SEPT_VALUE] + sp.[OCT_(VALUE)] + sp.[NOV_VALUE] + sp.[DEC_VALUE] + sp.[JAN_VALUE] + sp.[FEB_VALUE] + sp.[MAR_VALUE]) as 'Total Value' ,
    //   (sp.[APRIL_USDN] + sp.[MAY_USDN] + sp.[JUNE_USDN] + sp.[JULY_USDN] + sp.[AUG_USDN] + sp.[SEPT_USDN] + sp.[OCTOBER_(USDN)] + sp.[NOV_USDN] + sp.[DEC_USDN] + sp.[JAN_USDN] + sp.[FEB_USDN] + sp.[MAR_USDN]) as 'Total USDN' ,
    //   (sp.[APR_(SALEABLE_UNITS)] + sp.[MAY_(SALEABLE_UNITS)] + sp.[JUN_(SALEABLE_UNITS)] + sp.[JULY_(SALEABLE_UNITS)] + sp.[AUGUST_(SALEABLE_UNITS)] + sp.[SEP_(SALEABLE_UNITS)] + sp.[OCT_(SALEABLE_UNIT)] + sp.[NOVEMBER_(SALEABLE_UNITS)] + sp.[DECEMBER_(SALEABLE_UNITS)] + sp.[JANUARY_(SALEABLE_UNITS)] + sp.[FEBRUARY_(SALEABLE_UNITS)] +sp.[MARCH_(SALEABLE_UNITS)]) as 'Total PCS',

    //   ss.[APR_MTR] AS 'APR MTR',
    //   sp.[APR_RATE_AS_PER_CURRENCY] AS 'APR RATE AS PER CURRENCY',
    //   sp.[APR_(SALEABLE_UNITS)] AS 'APR (SALEABLE UNITS)',
    //   (sp.[APR_(SALEABLE_UNITS)] * ss.[NO_OF_PCS_IN_SET]) AS 'APRIL PCS',

    //   sp.[APRIL_USDN] AS 'APRIL USDN',
    //   sp.[APRIL_VALUE] AS 'APRIL VALUE',
    //   ss.[AUG_MTR] AS 'AUG MTR',
    //   (sp.[AUGUST_(SALEABLE_UNITS)] * ss.[NO_OF_PCS_IN_SET]) AS 'AUGUST(PCS)',
    //   sp.[AUG_RATE_AS_PER_CURRENCY] AS 'AUG RATE AS PER CURRENCY',
    //   sp.[AUGUST_(SALEABLE_UNITS)] AS 'AUGUST (SALEABLE UNITS)',
    //   sp.[AUG_USDN] AS 'AUG USDN',
    //   sp.[AUG_VALUE] AS 'AUG VALUE',
    //   ss.[BILLING(WUSA/WUK/DIRECT)] AS 'BILLING(WUSA/WUK/DIRECT)',
    //   ss.[BRAND_NAME] AS 'BRAND NAME',
    //   ss.[BRAND_TYPE_:_OWN_/_RETAILER_LICENCE_/_WE] AS 'BRAND TYPE : OWN / RETAILER LICENCE / WE',
    //   ss.[CHANNEL] AS 'CHANNEL',
    //   ss.[CONSTRUCTION] AS 'CONSTRUCTION',
    //   (sp.[DECEMBER_(SALEABLE_UNITS)] * ss.[NO_OF_PCS_IN_SET]) AS 'DECEMBER (PCS)',
    //   sp.[DEC_RATE_AS_PER_CURRENCY] AS 'DEC RATE AS PER CURRENCY',
    //   sp.[DECEMBER_(SALEABLE_UNITS)] AS 'DECEMBER (SALEABLE UNITS)',
    //   sp.[DEC_USDN] AS 'DEC USDN',
    //   sp.[DEC_VALUE] AS 'DEC VALUE',
    //   ss.[DYEING/_WASHING] AS 'DYEING/ WASHING',
    //   ss.[DYED/_PRINTED_TO_REFER] AS 'DYED/ PRINTED TO REFER',
    //   ss.[EMBROIDARY] AS 'EMBROIDARY',
    //   ss.[END_CUSTOMER_CODE] AS 'END CUSTOMER CODE',
    //   sp.[END_CUSTOMER_NAME] AS 'END CUSTOMER NAME',
    //   ss.[ENQ_STATUS(LIKELY/MOST_LIKELY_/CONFIRME] AS 'ENQ STATUS(LIKELY/MOST LIKELY /CONFIRME',
    //   ss.[EXPORT/_DOMESTIC] AS 'EXPORT/ DOMESTIC',
    //   (sp.[FEBRUARY_(SALEABLE_UNITS)] * ss.[NO_OF_PCS_IN_SET]) AS 'FEBRUARY(PCS)',
    //   ss.[FEB_MTR] AS 'FEB MTR',
    //   sp.[FEB_RATE_AS_PER_CURRENCY] AS 'FEB RATE AS PER CURRENCY',
    //   sp.[FEBRUARY_(SALEABLE_UNITS)] AS 'FEBRUARY (SALEABLE UNITS)',
    //   sp.[FEB_USDN] AS 'FEB USDN',
    //   sp.[FEB_VALUE] AS 'FEB VALUE',
    //   ss.[FINISH_TYPE] AS 'FINISH TYPE',
    //   ss.[FINISH_WIDTH] AS 'FINISH WIDTH',
    //   ss.[GLM] AS 'GLM',
    //   ss.[GREIGE_WIDTH_GABRIC_2] AS 'GREIGE WIDTH GABRIC 2',
    //   ss.[GRELGE_WLDTH] AS 'GRELGE WLDTH',
    //   ss.[INNOVATION(YES/_NO)] AS 'INNOVATION(YES/ NO)',
    //   (sp.[JANUARY_(SALEABLE_UNITS)] * ss.[NO_OF_PCS_IN_SET]) AS 'JAN PCS',
    //   ss.[JAN_MTR] AS 'JAN MTR',
    //   sp.[JAN_RATE_AS_PER_CURRENCY] AS 'JAN RATE AS PER CURRENCY',
    //   sp.[JANUARY_(SALEABLE_UNITS)] AS 'JANUARY (SALEABLE UNITS)',
    //   sp.[JAN_USDN] AS 'JAN USDN',
    //   sp.[JAN_VALUE] AS 'JAN VALUE',
    //   (sp.[JULY_(SALEABLE_UNITS)] * ss.[NO_OF_PCS_IN_SET]) AS 'JULY(PCS)',
    //   ss.[JUL_MTR] AS 'JUL MTR',
    //   sp.[JUL_RATE_AS_PER_CURRENCY] AS 'JUL RATE AS PER CURRENCY',
    //   sp.[JULY_(SALEABLE_UNITS)] AS 'JULY (SALEABLE UNITS)',
    //   sp.[JULY_USDN] AS 'JULY USDN',
    //   sp.[JULY_VALUE] AS 'JULY VALUE',
    //   (sp.[JUN_(SALEABLE_UNITS)] * ss.[NO_OF_PCS_IN_SET]) AS 'JUNE(PCS)',
    //   ss.[JUNE_MTR] AS 'JUNE MTR',
    //   sp.[JUN_RATE_AS_PER_CURRENCY] AS 'JUN RATE AS PER CURRENCY',
    //   sp.[JUN_(SALEABLE_UNITS)] AS 'JUN (SALEABLE UNITS)',
    //   sp.[JUNE_USDN] AS 'JUNE USDN',
    //   sp.[JUNE_VALUE] AS 'JUNE VALUE',
    //   ss.[KNITTED_FINISH_WIDTH] AS 'KNITTED FINISH WIDTH',
    //   ss.[KNITTED_MTRS] AS 'KNITTED MTRS',
    //   ss.[LIKE_TO_LIKE/NEW] AS 'LIKE TO LIKE/NEW',
    //   ss.[LOGO] AS 'LOGO',
    //   ss.[LOOM] AS 'LOOM',
    //   ss.[LYCRA_FLNSH_WLDTH] AS 'LYCRA FLNSH WLDTH',
    //   (sp.[MARCH_(SALEABLE_UNITS)] * ss.[NO_OF_PCS_IN_SET]) AS 'MARCH(PCS)',
    //   ss.[MAR_MTR] AS 'MAR MTR',
    //   sp.[MAR_RATE_AS_PER_CURRENCY] AS 'MAR RATE AS PER CURRENCY',
    //   sp.[MARCH_(SALEABLE_UNITS)] AS 'MARCH (SALEABLE UNITS)',
    //   sp.[MAR_USDN] AS 'MAR USDN',
    //   sp.[MAR_VALUE] AS 'MAR VALUE',
    //   ss.[MATCODE] AS 'MATCODE',
    //   ss.[MATERIAL_DESCRIPTION] AS 'MATERIAL DESCRIPTION',
    //   (sp.[MAY_(SALEABLE_UNITS)] * ss.[NO_OF_PCS_IN_SET]) AS 'MAY(PCS)',
    //   ss.[MAY_MTR] AS 'MAY MTR',
    //   sp.[MAY_RATE_AS_PER_CURRENCY] AS 'MAY RATE AS PER CURRENCY',
    //   sp.[MAY_(SALEABLE_UNITS)] AS 'MAY (SALEABLE UNITS)',
    //   sp.[MAY_USDN] AS 'MAY USDN',
    //   sp.[MAY_VALUE] AS 'MAY VALUE',
    //   ss.[MERCHANT] AS 'MERCHANT',
    //   ss.[MARKER_EFFICIENCY_ITEM_KNITTED] AS 'MARKER EFFICIENCY ITEM KNITTED',
    //   ss.[MARKER_EFFLCLENCY__PROGRAM] AS 'MARKER EFFLCLENCY PROGRAM',
    //   ss.[MARKER_EFFLCLENCY_LTEM] AS 'MARKER EFFLCLENCY LTEM',
    //   ss.[MTR._CONSUMP_FABRIC_-1] AS 'MTR. CONSUMP FABRIC -1',
    //   ss.[MTR._CONSUMP_FABRIC_-2] AS 'MTR. CONSUMP FABRIC -2',
    //   ss.[MTR._CONSUMP_LYCRA] AS 'MTR. CONSUMP LYCRA',
    //   ss.[MTR._CONSUMP_NON_WOVEN] AS 'MTR. CONSUMP NON WOVEN',
    //   ss.[NON_WOVEN_FINISH_WIDTH] AS 'NON WOVEN FINISH WIDTH',
    //   ss.[NON_WOVEN_MTRS] AS 'NON WOVEN MTRS',
    //   ss.[MTR._CONSUMP_KNITTED] AS 'MTR. CONSUMP KNITTED',
    //   ss.[NON_WOVEN_LAMINATED__FINISH_WIDTH] AS 'NON WOVEN LAMINATED FINISH WIDTH',
    //   ss.[NEW_PROGRAM] AS 'NEW PROGRAM',
    //   ss.[NO_OF_PCS_IN_SET] AS 'NO OF PCS IN SET',
    //   (sp.[NOVEMBER_(SALEABLE_UNITS)] * ss.[NO_OF_PCS_IN_SET]) AS 'NOVEMBER(PCS)',
    //   ss.[NOV_MTR] AS 'NOV MTR',
    //   sp.[NOV_RATE_AS_PER_CURRENCY] AS 'NOV RATE AS PER CURRENCY',
    //   sp.[NOVEMBER_(SALEABLE_UNITS)] AS 'NOVEMBER (SALEABLE UNITS)',
    //   sp.[NOV_USDN] AS 'NOV USDN',
    //   sp.[NOV_VALUE] AS 'NOV VALUE',
    //   sp.[OCT_(SALEABLE_UNIT)] AS 'OCT (SALEABLE UNIT)',
    //   sp.[OCT_RATE_AS_PER_CURRENCY] AS 'OCT RATE AS PER CURRENCY',
    //   ss.[OCT_MTR] AS 'OCT MTR',
    //   (sp.[OCT_(SALEABLE_UNIT)] * ss.[NO_OF_PCS_IN_SET]) AS 'OCTOBER(PCS)',
    //   sp.[OCTOBER_(USDN)] AS 'OCTOBER (USDN)',
    //   sp.[OCT_(VALUE)] AS 'OCT (VALUE)',
    //   ss.[ORDER_TYPE] AS 'ORDER TYPE',
    //   ss.[PROGRAM] AS 'PROGRAM',
    //   ss.[PROGRAM_CODE__↑] AS 'PROGRAM CODE ↑',
    //   ss.[PROGRAM_CODE_UPDATED] AS 'PROGRAM CODE UPDATED',
    //   ss.[PRINTING] AS 'PRINTING',
    //   ss.[PROD_INSP_MEMO] AS 'PROD INSP MEMO',
    //   ss.[PRODUCT_TYPE_QUALITY] AS 'PRODUCT TYPE QUALITY',
    //   ss.[Q1_PCS] AS 'Q1 PCS',
    //   ss.[Q1_SATEEN_MTR] AS 'Q1 SATEEN MTR',
    //   ss.[Q1_TOTAL_(USDN)] AS 'Q1 TOTAL (USDN)',
    //   ss.[Q1_UVR] AS 'Q1 UVR',
    //   ss.[Q2_PCS] AS 'Q2 PCS',
    //   ss.[Q2_SATEEN_MTR] AS 'Q2 SATEEN MTR',
    //   ss.[Q2_TOTAL_(USDN)] AS 'Q2 TOTAL (USDN)',
    //   ss.[Q2_UVR] AS 'Q2 UVR',
    //   ss.[Q3_PCS] AS 'Q3 PCS',
    //   ss.[Q3_SATEEN_MTR] AS 'Q3 SATEEN MTR',
    //   ss.[Q3_TOTAL_(USDN)] AS 'Q3 TOTAL (USDN)',
    //   ss.[Q3_UVR] AS 'Q3 UVR',
    //   ss.[Q4__(USDN)] AS 'Q4 (USDN)',
    //   ss.[Q4_PCS] AS 'Q4 PCS',
    //   ss.[Q4_SATEEN_MTR] AS 'Q4 SATEEN MTR',
    //   ss.[Q4_UVR] AS 'Q4 UVR',
    //   ss.[REGION] AS 'REGION',
    //   ss.[SELLING_CURRENCY] AS 'SELLING CURRENCY',
    //   (sp.[SEP_(SALEABLE_UNITS)] * ss.[NO_OF_PCS_IN_SET]) AS 'SEP PCS',
    //   ss.[SEP_MTR] AS 'SEP MTR',
    //   sp.[SEP_RATE_AS_PER_CURRENCY] AS 'SEP RATE AS PER CURRENCY',
    //   sp.[SEP_(SALEABLE_UNITS)] AS 'SEP (SALEABLE UNITS)',
    //   sp.[SEPT_USDN] AS 'SEPT USDN',
    //   sp.[SEPT_VALUE] AS 'SEPT VALUE',
    //   ss.[SET/PCS/PP] AS 'SET/PCS/PP',
    //   ss.[STITCHING_TYPE] AS 'STITCHING TYPE',
    //   ss.[SIZE] AS 'SIZE',
    //   ss.[SIZE_(L)_CMS] AS 'SIZE (L) CMS',
    //   ss.[SIZE_(L)_INCH] AS 'SIZE (L) INCH',
    //   ss.[SIZE_(W)_CMS] AS 'SIZE (W) CMS',
    //   ss.[SIZE_(W)_INCH] AS 'SIZE (W) INCH',
    //   ss.[STORE_FORMAT] AS 'STORE FORMAT',
    //   ss.[TEAM_LEADER] AS 'TEAM LEADER',
    //   ss.[TERMS_FOB/CIF] AS 'TERMS FOB/CIF',

    //   ss.[TYPE_OF_INNOVATION] AS 'TYPE OF INNOVATION',

    //   ss.[TOTAL_SATEEN_MTR] AS 'TOTAL SATEEN MTR',
    //   ss.[TC] AS 'TC',
    //   ss.[TOTAL_CONSUMPTION_OF_SATEEN] AS 'TOTAL CONSUMPTION OF SATEEN',
    //   ss.[WADDING_CONSUMPTION] AS 'WADDING CONSUMPTION',
    //   ss.[WADDING_MTRS] AS 'WADDING MTRS',
    //   ss.[WELSPUN_UK/US_SALES_REP] AS 'WELSPUN UK/US SALES REP',
    //   ss.[WELTRACK(_YES/_NO)] AS 'WELTRACK( YES/ NO)',
    //   ss.[WUSA/_WUK_WAREHOUSE] AS 'WUSA/ WUK WAREHOUSE',
    //   ss.[WADDING_TYPE] AS 'WADDING TYPE',
    //   ss.[WARP_COUNT] AS 'WARP COUNT',
    //   ss.[WARP_PLY] AS 'WARP PLY',
    //   ss.[WARP_WT] AS 'WARP WT',
    //   ss.[WARP_YARN_TYPES] AS 'WARP YARN TYPES',
    //   ss.[WEAVE] AS 'WEAVE',
    //   ss.[WEFT_COUNT] AS 'WEFT COUNT',
    //   ss.[WEFT_PLY] AS 'WEFT PLY',
    //   ss.[WEFT_WT] AS 'WEFT WT',
    //   ss.[YEARLY_UVR] AS 'YEARLY UVR',
    //   ss.[PRODUCT_CAT] AS 'PRODUCT CAT',
    //   ss.[PRODUCT_SUBCAT] AS 'PRODUCT SUBCAT',
    //   ss.[PLANT] AS 'PLANT',
    //   ss.[SR_NO] AS 'SR NO'
    //   FROM   salesplan_publish AS sp
    //         INNER JOIN SALESPLAN_SIMULATION AS ss
    //                 ON sp.[unique_identification_no] = ss.[unique_identification_no]
    //                     AND sp.[product_cat] = 'Top of Bed' AND (sp.[VERSION_NO] like '%${req.query.teamLeader}%' OR sp.[TEAM_LEADER] like '%${req.query.teamLeader}%')
    //   `;

    // }

    console.log("this is the fetch publish data query", query)
    setSimulation(query).then((data) => {

      res.json(data);

    })


  }
  catch (error) {
    logger.verbose(`${req.query.teamLeader} | \t ${process.env.URL}/summary/getPublishedData | \t ${error}`)
  }
})


//Get Lead level data for simulation from salesplan publish table

router.get('/getLeadLevelPublishedData', (req, res) => {

  try {
    let query = ``

    jsonData.map(({ key, value }, index) => {

      if (index == 0) {
        query += `    SELECT ${key} as ${value},`
      }

      else if (index > 0 && index !== jsonData.length - 1) {
        query += `${key} as ${value},`
      }

      else if (index == jsonData.length - 1) {
        query += `${key} as ${value} from SALESPLAN_PUBLISH WHERE TEAM_LEADER Like '%${req.query.name}%' AND PRODUCT_CAT Like '%${req.query.selectedProduct}%'`
      }
    })

    console.log("this is the lead level publish data fetch query", query);
    getSimulation(query).then((data) => {
      res.json(data);
    })
  }
  catch (error) {
    console.log("error in fetching published data", error)
  }
})


//Get Head Level data for final simulation from salesplan publish table 

router.get('/getHeadLevelPublishedData', (req, res) => {

  try {
    let query = ``

    jsonData.map(({ key, value }, index) => {

      if (index == 0) {
        query += `SELECT ${key} as ${value},`
      }

      else if (index > 0 && index !== jsonData.length - 1) {
        query += `${key} as ${value},`
      }

      else if (index == jsonData.length - 1) {
        query += `${key} as ${value} from SALESPLAN_PUBLISH WHERE SALES_HEAD LIKE '%${req.query.name}%' AND PRODUCT_CAT Like '%${req.query.selectedProduct}%'`
      }
    })

    console.log("this is the lead level publish data fetch query", query);
    getSimulation(query).then((data) => {
      res.json(data);
    })
  }

  catch (error) {
    console.log("error in fetching published data", error)
  }
})






//querry to save a version in SIMULATION_OUTPUT.

router.post('/save-data', async (req, res) => {
  try {

    logger.info(`${req.body.textValue} | \t ${process.env.URL}/summary/save-data`)

    var query = ""

    jsonData.map(({ key, value }, index) => {
      if (index === 0) {
        query += `Insert INTO SIMULATION_OUTPUT ( [VERSION_NO] , ${key},`
      }
      else if (index > 0 && index !== jsonData.length - 1) {
        query += `${key},`
      }
      else if (index == jsonData.length - 1) {
        query += ` ${key}) Values`
      }
    })
    var summaryData = ""
    req.body.dataTableAnnual.map(({ customerName, region, plant, thisYear, productSubCat, matcode }, index) => {
      if (index == 0) {

        summaryData += `( '${req.body.textValue}-V-${req.body.numberValue}', '${customerName}' , '${thisYear.wtPerPC}' , '${thisYear.program}' , '${thisYear.productCat}' , '${plant}', '${matcode}' , '${thisYear.uniqueIdentificationNo}' , '${productSubCat}' , '${thisYear.teamLeader}' , '${region}' , ${thisYear.aprilSaleableUnit} , ${thisYear.aprilQuantity} , ${thisYear.aprilSqMt} , ${thisYear.aprilMt} ,${thisYear.aprilRate},${thisYear.aprilValue},${thisYear.aprilUSDN} , ${thisYear.maySaleableUnit}, ${thisYear.maySqMt} , ${thisYear.mayMt} ,${thisYear.mayRate} , ${thisYear.mayQuantity} ,${thisYear.mayValue},${thisYear.mayUSDN},${thisYear.juneSaleableUnit}, ${thisYear.juneSqMt} , ${thisYear.juneMt} , ${thisYear.juneQuantity} , ${thisYear.juneRate} , ${thisYear.juneValue} , ${thisYear.juneUSDN} , ${thisYear.julySaleableUnit}, ${thisYear.julyMt} , ${thisYear.julySqMt} , ${thisYear.julyQuantity},${thisYear.julyRate},${thisYear.julyValue},${thisYear.julyUSDN},${thisYear.augustSaleableUnit}, ${thisYear.augustSqMt} , ${thisYear.augMt} , ${thisYear.augustQuantity} ,${thisYear.augustRate},${thisYear.augustValue},${thisYear.augustUSDN},${thisYear.septemberSaleableUnit}, ${thisYear.septemberSqMt} , ${thisYear.septemberMt} ,${thisYear.septemberQuantity} ,${thisYear.septemberRate},${thisYear.septemberValue},${thisYear.septemberUSDN},${thisYear.octoberSaleableUnit} , ${thisYear.octSqMt} , ${thisYear.octMt} , ${thisYear.octoberQuantity} ,${thisYear.octoberRate},${thisYear.octoberValue},${thisYear.octoberUSDN},${thisYear.novemberSaleableUnit}, ${thisYear.novSqMt} , ${thisYear.novMt} , ${thisYear.novemberQuantity} ,${thisYear.novemberRate},${thisYear.novemberValue},${thisYear.novemberUSDN},${thisYear.decemberSaleableUnit}, ${thisYear.decSqMt} , ${thisYear.decMt} ,${thisYear.decemberQuantity},${thisYear.decemberRate},${thisYear.decemberValue},${thisYear.decemberUSDN},${thisYear.januarySaleableUnit}, ${thisYear.janSqMt} , ${thisYear.janMt} , ${thisYear.januaryQuantity} ,${thisYear.januaryRate},${thisYear.januaryValue},${thisYear.januaryUSDN},${thisYear.februarySaleableUnit} , ${thisYear.febSqMt} , ${thisYear.febMt} , ${thisYear.februaryQuantity},${thisYear.februaryRate},${thisYear.februaryValue},${thisYear.februaryUSDN},${thisYear.marchSaleableUnit}, ${thisYear.marchSqMt} , ${thisYear.marMt} , ${thisYear.marchQuantity} ,${thisYear.marchRate},${thisYear.marchValue}, ${thisYear.marchUSDN}),`
      }
      else if (index > 0 && index !== req.body.dataTableAnnual.length - 1) {
        summaryData += `( '${req.body.textValue}-V-${req.body.numberValue}', '${customerName}' ,  '${thisYear.wtPerPC}' , '${thisYear.program}' , '${thisYear.productCat}' , '${plant}', '${matcode}' , '${thisYear.uniqueIdentificationNo}' , '${productSubCat}' , '${thisYear.teamLeader}' , '${region}' , ${thisYear.aprilSaleableUnit} , ${thisYear.aprilQuantity} , ${thisYear.aprilSqMt} , ${thisYear.aprilMt} ,${thisYear.aprilRate},${thisYear.aprilValue},${thisYear.aprilUSDN} , ${thisYear.maySaleableUnit}, ${thisYear.maySqMt} , ${thisYear.mayMt} ,${thisYear.mayRate} , ${thisYear.mayQuantity} ,${thisYear.mayValue},${thisYear.mayUSDN},${thisYear.juneSaleableUnit}, ${thisYear.juneSqMt} , ${thisYear.juneMt} , ${thisYear.juneQuantity} , ${thisYear.juneRate} , ${thisYear.juneValue} , ${thisYear.juneUSDN} , ${thisYear.julySaleableUnit}, ${thisYear.julyMt} , ${thisYear.julySqMt} , ${thisYear.julyQuantity},${thisYear.julyRate},${thisYear.julyValue},${thisYear.julyUSDN},${thisYear.augustSaleableUnit}, ${thisYear.augustSqMt} , ${thisYear.augMt} , ${thisYear.augustQuantity} ,${thisYear.augustRate},${thisYear.augustValue},${thisYear.augustUSDN},${thisYear.septemberSaleableUnit}, ${thisYear.septemberSqMt} , ${thisYear.septemberMt} ,${thisYear.septemberQuantity} ,${thisYear.septemberRate},${thisYear.septemberValue},${thisYear.septemberUSDN},${thisYear.octoberSaleableUnit} , ${thisYear.octSqMt} , ${thisYear.octMt} , ${thisYear.octoberQuantity} ,${thisYear.octoberRate},${thisYear.octoberValue},${thisYear.octoberUSDN},${thisYear.novemberSaleableUnit}, ${thisYear.novSqMt} , ${thisYear.novMt} , ${thisYear.novemberQuantity} ,${thisYear.novemberRate},${thisYear.novemberValue},${thisYear.novemberUSDN},${thisYear.decemberSaleableUnit}, ${thisYear.decSqMt} , ${thisYear.decMt} ,${thisYear.decemberQuantity},${thisYear.decemberRate},${thisYear.decemberValue},${thisYear.decemberUSDN},${thisYear.januarySaleableUnit}, ${thisYear.janSqMt} , ${thisYear.janMt} , ${thisYear.januaryQuantity} ,${thisYear.januaryRate},${thisYear.januaryValue},${thisYear.januaryUSDN},${thisYear.februarySaleableUnit} , ${thisYear.febSqMt} , ${thisYear.febMt} , ${thisYear.februaryQuantity},${thisYear.februaryRate},${thisYear.februaryValue},${thisYear.februaryUSDN},${thisYear.marchSaleableUnit}, ${thisYear.marchSqMt} , ${thisYear.marMt} , ${thisYear.marchQuantity} ,${thisYear.marchRate},${thisYear.marchValue}, ${thisYear.marchUSDN}),`
      }
      else {
        summaryData += `( '${req.body.textValue}-V-${req.body.numberValue}', '${customerName}' , '${thisYear.wtPerPC}' , '${thisYear.program}' , '${thisYear.productCat}' , '${plant}', '${matcode}' , '${thisYear.uniqueIdentificationNo}' , '${productSubCat}' , '${thisYear.teamLeader}' , '${region}' , ${thisYear.aprilSaleableUnit} , ${thisYear.aprilQuantity} , ${thisYear.aprilSqMt} , ${thisYear.aprilMt} ,${thisYear.aprilRate},${thisYear.aprilValue},${thisYear.aprilUSDN} , ${thisYear.maySaleableUnit}, ${thisYear.maySqMt} , ${thisYear.mayMt} ,${thisYear.mayRate} , ${thisYear.mayQuantity} ,${thisYear.mayValue},${thisYear.mayUSDN},${thisYear.juneSaleableUnit}, ${thisYear.juneSqMt} , ${thisYear.juneMt} , ${thisYear.juneQuantity} , ${thisYear.juneRate} , ${thisYear.juneValue} , ${thisYear.juneUSDN} , ${thisYear.julySaleableUnit}, ${thisYear.julyMt} , ${thisYear.julySqMt} , ${thisYear.julyQuantity},${thisYear.julyRate},${thisYear.julyValue},${thisYear.julyUSDN},${thisYear.augustSaleableUnit}, ${thisYear.augustSqMt} , ${thisYear.augMt} , ${thisYear.augustQuantity} ,${thisYear.augustRate},${thisYear.augustValue},${thisYear.augustUSDN},${thisYear.septemberSaleableUnit}, ${thisYear.septemberSqMt} , ${thisYear.septemberMt} ,${thisYear.septemberQuantity} ,${thisYear.septemberRate},${thisYear.septemberValue},${thisYear.septemberUSDN},${thisYear.octoberSaleableUnit} , ${thisYear.octSqMt} , ${thisYear.octMt} , ${thisYear.octoberQuantity} ,${thisYear.octoberRate},${thisYear.octoberValue},${thisYear.octoberUSDN},${thisYear.novemberSaleableUnit}, ${thisYear.novSqMt} , ${thisYear.novMt} , ${thisYear.novemberQuantity} ,${thisYear.novemberRate},${thisYear.novemberValue},${thisYear.novemberUSDN},${thisYear.decemberSaleableUnit}, ${thisYear.decSqMt} , ${thisYear.decMt} ,${thisYear.decemberQuantity},${thisYear.decemberRate},${thisYear.decemberValue},${thisYear.decemberUSDN},${thisYear.januarySaleableUnit}, ${thisYear.janSqMt} , ${thisYear.janMt} , ${thisYear.januaryQuantity} ,${thisYear.januaryRate},${thisYear.januaryValue},${thisYear.januaryUSDN},${thisYear.februarySaleableUnit} , ${thisYear.febSqMt} , ${thisYear.febMt} , ${thisYear.februaryQuantity},${thisYear.februaryRate},${thisYear.februaryValue},${thisYear.februaryUSDN},${thisYear.marchSaleableUnit}, ${thisYear.marchSqMt} , ${thisYear.marMt} , ${thisYear.marchQuantity} ,${thisYear.marchRate},${thisYear.marchValue}, ${thisYear.marchUSDN})`
      }
    })
    setSimulation(query + summaryData).then((data) => {
      console.log("this is the insert querry", query + summaryData)
      res.json(data);
    })
  }

  catch (error) {
    logger.verbose(`${req.body.textValue} | \t ${process.env.URL}/summary/save-data | \t ${error}`)
    res.status(500).json({ message: 'Internal server error' });
  }
});


//check duplicate publish versions

router.get('/already-published', async (req, res) => {
  try {
    logger.info(`${req.query.userName} | \t ${process.env.URL}/summary/already-published`)
    var query = `SELECT COUNT(*) As total_count FROM SALESPLAN_PUBLISH WHERE [VERSION_NO] like '%${req.query.userName}%' AND [PRODUCT_CAT] like '%${req.query.product}%'`;
    setSimulation(query).then((data) => {

      res.json(data.recordsets[0][0]["total_count"]);

    })
  }
  catch (error) {
    logger.verbose(`${req.query.userName} | \t ${process.env.URL}/summary/already-published | \t ${error}`)
  }
})


//publish data api

router.post('/publish-version', async (req, res) => {
  try {
    logger.info(`${req.body.publishVersion} | \t ${process.env.URL}/summary/publish-version`)
    var query = '';
    // console.log(req);

    jsonData.map(({ key, value }, index) => {
      if (index === 0) {
        query += `Insert INTO SALESPLAN_PUBLISH ([SALES_HEAD] , [VERSION_NO] , ${key},`
      }
      else if (index > 0 && index !== jsonData.length - 1) {
        query += `${key},`
      }
      else if (index == jsonData.length - 1) {
        query += ` ${key}) Values`
      }
    })

    var summaryData = ""
    console.log(req.body.dataTableAnnual)

    req.body.dataTableAnnual.map(({ customerName, thisYear, productSubCat, plant, region }, index) => {

      if (index == 0) {

        summaryData += `( 'Keyur Parekh' , '${req.body.publishVersion}' , '${customerName}' , '${thisYear.wtPerPC}' , '${thisYear.program}' , '${thisYear.productCat}' , '${plant}', '${thisYear.matcode}' , '${thisYear.uniqueIdentificationNo}' , '${productSubCat}' , '${thisYear.teamLeader}' , '${region}' , ${thisYear.aprilSaleableUnit} , ${thisYear.aprilQuantity} ,${thisYear.aprilSqMt} , ${thisYear.aprilMt} ,${thisYear.aprilRate},${thisYear.aprilValue},${thisYear.aprilUSDN} , ${thisYear.maySaleableUnit}, ${thisYear.maySqMt} , ${thisYear.mayMt} ,${thisYear.mayRate} , ${thisYear.mayQuantity} ,${thisYear.mayValue},${thisYear.mayUSDN},${thisYear.juneSaleableUnit}, ${thisYear.juneSqMt} , ${thisYear.juneMt} , ${thisYear.juneQuantity} , ${thisYear.juneRate} , ${thisYear.juneValue} , ${thisYear.juneUSDN} , ${thisYear.julySaleableUnit}, ${thisYear.julyMt} , ${thisYear.julySqMt} , ${thisYear.julyQuantity},${thisYear.julyRate},${thisYear.julyValue},${thisYear.julyUSDN},${thisYear.augustSaleableUnit}, ${thisYear.augustSqMt} , ${thisYear.augMt} , ${thisYear.augustQuantity} ,${thisYear.augustRate},${thisYear.augustValue},${thisYear.augustUSDN},${thisYear.septemberSaleableUnit}, ${thisYear.septemberSqMt} , ${thisYear.septemberMt} ,${thisYear.septemberQuantity} ,${thisYear.septemberRate},${thisYear.septemberValue},${thisYear.septemberUSDN},${thisYear.octoberSaleableUnit} , ${thisYear.octSqMt} , ${thisYear.octMt} , ${thisYear.octoberQuantity} ,${thisYear.octoberRate},${thisYear.octoberValue},${thisYear.octoberUSDN},${thisYear.novemberSaleableUnit}, ${thisYear.novSqMt} , ${thisYear.novMt} , ${thisYear.novemberQuantity} ,${thisYear.novemberRate},${thisYear.novemberValue},${thisYear.novemberUSDN},${thisYear.decemberSaleableUnit}, ${thisYear.decSqMt} , ${thisYear.decMt} ,${thisYear.decemberQuantity},${thisYear.decemberRate},${thisYear.decemberValue},${thisYear.decemberUSDN},${thisYear.januarySaleableUnit}, ${thisYear.janSqMt} , ${thisYear.janMt} , ${thisYear.januaryQuantity} ,${thisYear.januaryRate},${thisYear.januaryValue},${thisYear.januaryUSDN},${thisYear.februarySaleableUnit} , ${thisYear.febSqMt} , ${thisYear.febMt} , ${thisYear.februaryQuantity},${thisYear.februaryRate},${thisYear.februaryValue},${thisYear.februaryUSDN},${thisYear.marchSaleableUnit}, ${thisYear.marchSqMt} , ${thisYear.marMt} , ${thisYear.marchQuantity} ,${thisYear.marchRate},${thisYear.marchValue}, ${thisYear.marchUSDN}),`
      }
      else if (index > 0 && index !== req.body.dataTableAnnual.length - 1) {
        summaryData += `( 'Keyur Parekh' , '${req.body.publishVersion}' , '${customerName}' , '${thisYear.wtPerPC}' , '${thisYear.program}' , '${thisYear.productCat}' , '${plant}', '${thisYear.matcode}' , '${thisYear.uniqueIdentificationNo}' , '${productSubCat}' , '${thisYear.teamLeader}' , '${region}' , ${thisYear.aprilSaleableUnit} , ${thisYear.aprilQuantity} ,${thisYear.aprilSqMt} , ${thisYear.aprilMt} ,${thisYear.aprilRate},${thisYear.aprilValue},${thisYear.aprilUSDN} , ${thisYear.maySaleableUnit}, ${thisYear.maySqMt} , ${thisYear.mayMt} ,${thisYear.mayRate} , ${thisYear.mayQuantity} ,${thisYear.mayValue},${thisYear.mayUSDN},${thisYear.juneSaleableUnit}, ${thisYear.juneSqMt} , ${thisYear.juneMt} , ${thisYear.juneQuantity} , ${thisYear.juneRate} , ${thisYear.juneValue} , ${thisYear.juneUSDN} , ${thisYear.julySaleableUnit}, ${thisYear.julyMt} , ${thisYear.julySqMt} , ${thisYear.julyQuantity},${thisYear.julyRate},${thisYear.julyValue},${thisYear.julyUSDN},${thisYear.augustSaleableUnit}, ${thisYear.augustSqMt} , ${thisYear.augMt} , ${thisYear.augustQuantity} ,${thisYear.augustRate},${thisYear.augustValue},${thisYear.augustUSDN},${thisYear.septemberSaleableUnit}, ${thisYear.septemberSqMt} , ${thisYear.septemberMt} ,${thisYear.septemberQuantity} ,${thisYear.septemberRate},${thisYear.septemberValue},${thisYear.septemberUSDN},${thisYear.octoberSaleableUnit} , ${thisYear.octSqMt} , ${thisYear.octMt} , ${thisYear.octoberQuantity} ,${thisYear.octoberRate},${thisYear.octoberValue},${thisYear.octoberUSDN},${thisYear.novemberSaleableUnit}, ${thisYear.novSqMt} , ${thisYear.novMt} , ${thisYear.novemberQuantity} ,${thisYear.novemberRate},${thisYear.novemberValue},${thisYear.novemberUSDN},${thisYear.decemberSaleableUnit}, ${thisYear.decSqMt} , ${thisYear.decMt} ,${thisYear.decemberQuantity},${thisYear.decemberRate},${thisYear.decemberValue},${thisYear.decemberUSDN},${thisYear.januarySaleableUnit}, ${thisYear.janSqMt} , ${thisYear.janMt} , ${thisYear.januaryQuantity} ,${thisYear.januaryRate},${thisYear.januaryValue},${thisYear.januaryUSDN},${thisYear.februarySaleableUnit} , ${thisYear.febSqMt} , ${thisYear.febMt} , ${thisYear.februaryQuantity},${thisYear.februaryRate},${thisYear.februaryValue},${thisYear.februaryUSDN},${thisYear.marchSaleableUnit}, ${thisYear.marchSqMt} , ${thisYear.marMt} , ${thisYear.marchQuantity} ,${thisYear.marchRate},${thisYear.marchValue}, ${thisYear.marchUSDN}),`
      }
      else {
        summaryData += `( 'Keyur Parekh' , '${req.body.publishVersion}' , '${customerName}', '${thisYear.wtPerPC}' , '${thisYear.program}' , '${thisYear.productCat}' , '${plant}', '${thisYear.matcode}' , '${thisYear.uniqueIdentificationNo}' , '${productSubCat}' , '${thisYear.teamLeader}', '${region}' , ${thisYear.aprilSaleableUnit} , ${thisYear.aprilQuantity} ,${thisYear.aprilSqMt} , ${thisYear.aprilMt} ,${thisYear.aprilRate},${thisYear.aprilValue},${thisYear.aprilUSDN} , ${thisYear.maySaleableUnit}, ${thisYear.maySqMt} , ${thisYear.mayMt} ,${thisYear.mayRate} , ${thisYear.mayQuantity} ,${thisYear.mayValue},${thisYear.mayUSDN},${thisYear.juneSaleableUnit}, ${thisYear.juneSqMt} , ${thisYear.juneMt} , ${thisYear.juneQuantity} , ${thisYear.juneRate} , ${thisYear.juneValue} , ${thisYear.juneUSDN} , ${thisYear.julySaleableUnit}, ${thisYear.julyMt} , ${thisYear.julySqMt} , ${thisYear.julyQuantity},${thisYear.julyRate},${thisYear.julyValue},${thisYear.julyUSDN},${thisYear.augustSaleableUnit}, ${thisYear.augustSqMt} , ${thisYear.augMt} , ${thisYear.augustQuantity} ,${thisYear.augustRate},${thisYear.augustValue},${thisYear.augustUSDN},${thisYear.septemberSaleableUnit}, ${thisYear.septemberSqMt} , ${thisYear.septemberMt} ,${thisYear.septemberQuantity} ,${thisYear.septemberRate},${thisYear.septemberValue},${thisYear.septemberUSDN},${thisYear.octoberSaleableUnit} , ${thisYear.octSqMt} , ${thisYear.octMt} , ${thisYear.octoberQuantity} ,${thisYear.octoberRate},${thisYear.octoberValue},${thisYear.octoberUSDN},${thisYear.novemberSaleableUnit}, ${thisYear.novSqMt} , ${thisYear.novMt} , ${thisYear.novemberQuantity} ,${thisYear.novemberRate},${thisYear.novemberValue},${thisYear.novemberUSDN},${thisYear.decemberSaleableUnit}, ${thisYear.decSqMt} , ${thisYear.decMt} ,${thisYear.decemberQuantity},${thisYear.decemberRate},${thisYear.decemberValue},${thisYear.decemberUSDN},${thisYear.januarySaleableUnit}, ${thisYear.janSqMt} , ${thisYear.janMt} , ${thisYear.januaryQuantity} ,${thisYear.januaryRate},${thisYear.januaryValue},${thisYear.januaryUSDN},${thisYear.februarySaleableUnit} , ${thisYear.febSqMt} , ${thisYear.febMt} , ${thisYear.februaryQuantity},${thisYear.februaryRate},${thisYear.februaryValue},${thisYear.februaryUSDN},${thisYear.marchSaleableUnit}, ${thisYear.marchSqMt} , ${thisYear.marMt} , ${thisYear.marchQuantity} ,${thisYear.marchRate},${thisYear.marchValue}, ${thisYear.marchUSDN})`
      }
    })
    setSimulation(query + summaryData).then((data) => {

      res.json(data);

    })
  }
  catch (error) {
    logger.verbose(`${req.body.publishVersion} | \t ${process.env.URL}/summary/publish-version | \t ${error}`)
    console.log('error', error);
  }

})





// Get Saved simulated data 

//get version list

router.get("/getVersion", (req, res) => {

  // var query = `SELECT [VERSION_NO] FROM SIMULATION_OUTPUT where [VERSION_NO] like '%${req.query.userName}%' AND [PRODUCT_CAT] like '%${req.query.product}%' GROUP BY [VERSION_NO]`
  try {
    logger.info(`${req.query.userName} | \t ${process.env.URL}/summary/getVersion`)
    var query = `Select Distinct td.VERSION_NO,
                  (CASE
                    WHEN sp.VERSION_NO IS NULL THEN 0
                    Else 1
                  END) as isPublished
                from SALESPLAN_PUBLISH sp right join SIMULATION_OUTPUT td on  sp.VERSION_NO = td.VERSION_NO
                where td.VERSION_NO like '%${req.query.userName}%' AND td.PRODUCT_CAT like '%${req.query.product}%' GROUP BY td.VERSION_NO, sp.VERSION_NO`

    // console.log(query)

    setSimulation(query).then((data) => {
      // console.log(data);
      res.json(data.recordset);
    })
  }
  catch (error) {
    logger.verbose(`${req.query.userName} | \t ${process.env.URL}/summary/getVersion | \t ${error}`)
  }
})


router.get("/savedSimulatedData", (req, res) => {
  // console.log("version name---------- ",req.query);
  try {
    logger.info(`${req.query.name} | \t ${process.env.URL}/summary/savedSimulatedData`)
    var query = ""
    jsonData.map(({ key, value }, index) => {
      if (index === 0) {
        query += `Select ${key} as ${value},`
      }
      else if (index > 0 && index !== jsonData.length - 1) {
        query += `${key} as ${value},`
      }
      else if (index == jsonData.length - 1) {
        query += `${key} as ${value} from SIMULATION_OUTPUT WHERE [VERSION_NO] = '${req.query.version}'`

      }
      // console.log("querry---->",query);

    })

    getSimulation(query).then((data) => {

      res.json(data);

    })
  }
  catch (error) {
    logger.verbose(`${req.query.name} | \t ${process.env.URL}/summary/savedSimulatedData | \t ${error}`)
  }

})


router.get("/checkDuplicateVersion", (req, res) => {

  try {
    logger.info(`${req.query.userName} | \t ${process.env.URL}/summary/checkDuplicateVersion`)
    var query = `SELECT COUNT(*) As total_count FROM SIMULATION_OUTPUT WHERE [VERSION_NO] = '${req.query.textValue}-V-${req.query.numberValue}'`;

    setSimulation(query).then((data) => {

      // console.log("data------", data.recordsets[0][0]["total_count"]);

      res.json(data.recordsets[0][0]["total_count"]);

    })
  }
  catch (error) {
    logger.verbose(`${req.query.userName} | \t ${process.env.URL}/summary/checkDuplicateVersion | \t ${error}`)
  }
});








// API to get chart Data

router.get("/chartsData", (req, res) => {
  try {
    logger.info(`${req.query.userName} | \t ${process.env.URL}/summary/chartsData`)
    var query = `select Sum([APRIL_VALUE] + [MAY_VALUE] + [JUNE_VALUE] + [JULY_VALUE] + [AUG_VALUE] + [SEPT_VALUE] + [OCT_(VALUE)] + [NOV_VALUE] + [DEC_VALUE] + [JAN_VALUE] + [FEB_VALUE] + [MAR_VALUE]) as 'totalValue', [REGION] from SIMULATION_OUTPUT where [VERSION_NO] = '${req.query.version}' group by [REGION]`

    getChartSimulatedData(query).then((data) => {

      res.json(data);
    })
  }
  catch (error) {
    logger.verbose(`${req.query.userName} | \t ${process.env.URL}/summary/chartsData | \t ${error}`)
  }
})

router.get("/pieChartCustomer", (req, res) => {
  try {
    logger.info(`${req.query.userName} | \t ${process.env.URL}/summary/pieChartCustomer`)
    var query = `
select TOP(5) Sum([APRIL_VALUE] + [MAY_VALUE] + [JUNE_VALUE] + [JULY_VALUE] + [AUG_VALUE] + [SEPT_VALUE] + [OCT_(VALUE)] + [NOV_VALUE] + [DEC_VALUE] + [JAN_VALUE] + [FEB_VALUE] + [MAR_VALUE]) as 'totalValue', [END_CUSTOMER_NAME] as 'endCustomerName' from SIMULATION_OUTPUT where [VERSION_NO] = '${req.query.version}' group by [END_CUSTOMER_NAME] ORDER BY 'totalValue' DESC`

    // console.log("get pie chart data for customers ---------",query)

    getChartSimulatedData(query).then((data) => {

      res.json(data);


    })
  }
  catch (error) {
    logger.verbose(`${req.query.userName} | \t ${process.env.URL}/summary/pieChartCustomer | \t ${error}`)
  }
})

router.get("/barCharData", (req, res) => {
  try {
    logger.info(`${req.query.userName} | \t ${process.env.URL}/summary/barCharData`)
    var query = `with NEW_SIMULATION_OUTPUT AS (
    select * from SIMULATION_OUTPUT where [VERSION_NO] = '${req.query.version}'
   )
   SELECT 
      
       SUM(old.[APR_(SALEABLE_UNITS)]) AS old_apr_saleableUnit,
       SUM(new.[APR_(SALEABLE_UNITS)]) AS new_apr_saleableUnit,
       SUM(old.[APRIL_VALUE]) AS old_apr_value,
       SUM(new.[APRIL_VALUE]) AS new_apr_value,
       SUM(old.[MAY_(SALEABLE_UNITS)]) AS old_may_saleableUnit,
       SUM(new.[MAY_(SALEABLE_UNITS)]) AS new_may_saleableUnit,
       SUM(old.[MAY_VALUE]) AS old_may_value,
       SUM(new.[MAY_VALUE]) AS new_may_value,
       SUM(old.[JUN_(SALEABLE_UNITS)]) AS old_jun_saleableUnit,
       SUM(new.[JUN_(SALEABLE_UNITS)]) AS new_jun_saleableUnit,
       SUM(old.[JUNE_VALUE]) AS old_jun_value,
       SUM(new.[JUNE_VALUE]) AS new_jun_value,
       SUM(old.[JULY_(SALEABLE_UNITS)]) AS old_july_saleableUnit,
       SUM(new.[JULY_(SALEABLE_UNITS)]) AS new_july_saleableUnit,
       SUM(old.[JULY_VALUE]) AS old_july_value,
       SUM(new.[JULY_VALUE]) AS new_july_value,
       SUM(old.[AUGUST_(SALEABLE_UNITS)]) AS old_aug_saleableUnit,
       SUM(new.[AUGUST_(SALEABLE_UNITS)]) AS new_aug_saleableUnit,
       SUM(old.[AUG_VALUE]) AS old_aug_value,
       SUM(new.[AUG_VALUE]) AS new_aug_value,
       SUM(old.[SEP_(SALEABLE_UNITS)]) AS old_sep_saleableUnit,
       SUM(new.[SEP_(SALEABLE_UNITS)]) AS new_sep_saleableUnit,
       SUM(old.[SEPT_VALUE]) AS old_sep_value,
       SUM(new.[SEPT_VALUE]) AS new_sep_value,
       SUM(old.[OCT_(SALEABLE_UNIT)]) AS old_oct_saleableUnit,
       SUM(new.[OCT_(SALEABLE_UNIT)]) AS new_oct_saleableUnit,
       SUM(old.[OCT_(VALUE)]) AS old_oct_value,
       SUM(new.[OCT_(VALUE)]) AS new_oct_value,
       SUM(old.[NOVEMBER_(SALEABLE_UNITS)]) AS old_nov_saleableUnit,
       SUM(new.[NOVEMBER_(SALEABLE_UNITS)]) AS new_nov_saleableUnit,
       SUM(old.[NOV_VALUE]) AS old_nov_value,
       SUM(new.[NOV_VALUE]) AS new_nov_value,
       SUM(old.[DECEMBER_(SALEABLE_UNITS)]) AS old_dec_saleableUnit,
       SUM(new.[DECEMBER_(SALEABLE_UNITS)]) AS new_dec_saleableUnit,
       SUM(old.[DEC_VALUE]) AS old_dec_value,
       SUM(new.[DEC_VALUE]) AS new_dec_value,
       SUM(old.[JANUARY_(SALEABLE_UNITS)]) AS old_jan_saleableUnit,
       SUM(new.[JANUARY_(SALEABLE_UNITS)]) AS new_jan_saleableUnit,
       SUM(old.[JAN_VALUE]) AS old_jan_value,
       SUM(new.[JAN_VALUE]) AS new_jan_value,
       SUM(old.[FEBRUARY_(SALEABLE_UNITS)]) AS old_feb_saleableUnit,
       SUM(new.[FEBRUARY_(SALEABLE_UNITS)]) AS new_feb_saleableUnit,
       SUM(old.[FEB_VALUE]) AS old_feb_value,
       SUM(new.[FEB_VALUE]) AS new_feb_value,
       SUM(old.[MARCH_(SALEABLE_UNITS)]) AS old_mar_saleableUnit,
       SUM(new.[MARCH_(SALEABLE_UNITS)]) AS new_mar_saleableUnit,
       SUM(old.[MAR_VALUE]) AS old_mar_value,
       SUM(new.[MAR_VALUE]) AS new_mar_value
     
   FROM 
       SALESPLAN_SIMULATION AS old
   INNER JOIN 
       NEW_SIMULATION_OUTPUT AS new 
   ON 
       old.unique_identification_no = new.unique_identification_no
   GROUP BY
       old.plant;
   `;

    getChartSimulatedData(query).then((data) => {

      const oldValues = []
      const newValues = []
      const oldSaleableUnit = []
      const newSaleableUnit = []

      data.forEach((item) => {

        Object.keys(item).forEach((key => {
          if (key.startsWith("old_") && key.endsWith("_value")) {
            oldValues.push(item[key]);
          }
        }));

        Object.keys(item).forEach((key => {
          if (key.startsWith("new_") && key.endsWith("_value")) {
            newValues.push(item[key]);
          }
        }));

        Object.keys(item).forEach((key => {
          if (key.startsWith("old_") && key.endsWith("_saleableUnit")) {
            oldSaleableUnit.push(item[key]);
          }
        }));


        Object.keys(item).forEach((key => {
          if (key.startsWith("new_") && key.endsWith("_saleableUnit")) {
            newSaleableUnit.push(item[key]);
          }
        }));


      });
      res.json({ "oldValues": oldValues, "newValues": newValues, "oldSaleableUnit": oldSaleableUnit, "newSaleableUnit": newSaleableUnit });

    });
  }
  catch (error) {
    logger.verbose(`${req.query.userName} | \t ${process.env.URL}/summary/barCharData | \t ${error}`)

  }
});





// API to update SALEPLAN FOR NEXT QUATER

function formatDate(date) {
  var d = new Date(date),
    month = '' + (d.getMonth() + 1),
    day = '' + d.getDate(),
    year = d.getFullYear();

  if (month.length < 2)
    month = '0' + month;
  if (day.length < 2)
    day = '0' + day;

  return [year, month, day].join('-');
}



router.post("/updateSalePlan", (req, res) => {

  let query = `
    INSERT INTO SALESPLAN_SIMULATION_backup
    SELECT  * , '${formatDate(new Date())}' AS [CREATED_AT] from SALESPLAN_SIMULATION
    WHERE ([MERCHANT] LIKE '%${req.query.name}%' AND [PRODUCT_CAT] LIKE '%${req.query.selectedProduct}%') OR ([TEAM_LEADER] LIKE '%${req.query.name}%' AND [PRODUCT_CAT] LIKE '%${req.query.selectedProduct}%');

    UPDATE [SALESPLAN_SIMULATION]
    SET
  `
  jsonData.map(({ key, value }, index) => {
    if (index == 0 || index < jsonData.length - 1 && key != "[WT/PC]") {
      query += `[SALESPLAN_SIMULATION].${key} = [SALESPLAN_PUBLISH].${key},`
    }
    else if (index == jsonData.length - 1 && key != "[WT/PC]") {
      query += `[SALESPLAN_SIMULATION].${key} = [SALESPLAN_PUBLISH].${key}`
    }
  })

  query += ` FROM [SALESPLAN_SIMULATION],[SALESPLAN_PUBLISH] 
  WHERE [SALESPLAN_SIMULATION].UNIQUE_IDENTIFICATION_NO = [SALESPLAN_PUBLISH].UNIQUE_IDENTIFICATION_NO AND 
        ([SALESPLAN_SIMULATION].[TEAM_LEADER] = '${req.query.name}' OR [SALESPLAN_SIMULATION].[MERCHANT] = '${req.query.name}') AND
        ([SALESPLAN_SIMULATION].[PRODUCT_CAT] = '${req.query.selectedProduct}')
  `

  console.log("this is the update sale plan API", query);

  setSimulation(query).then((data) => {

    res.json(data);

  })

})




router.get("/getFiscalData", (req, res) => {
  let query = '';


  jsonData.map(({ key, value }, index) => {

    if (index == 0) {
      query += `SELECT TOP(100) ${key},`
    }
    else if (index > 0 && index != jsonData.length - 1) {
      query += `${key},`
    }
    else if (index == jsonData.length - 1) {
      query += `${key} from SALESPLAN_SIMULATION WHERE [PRODUCT_CAT] = '${req.query.product}' AND [FISCAL_YEAR] = '${req.query.fiscalYear}'`
    }
  })

  console.log(query);
  try {
    setSimulation(query).then((data) => {
      res.json(data);

    })
  }
  catch (error) {
    logger.verbose(`${process.env.URL}/summary/getFiscalData | \t ${error}`)
    console.log("error in fetching fiscal data");
  }

})


















// QR Scanner Project

function return_bit(value) {
  return value ? 1 : 0
}


router.post(`/setQRCodeData`, (req, res) => {
  console.log("inside the setQrCodeData", req.body)
  let query = `INSERT INTO QR_SCANNER_ECOM (  Name , Email , Phone_Number , Is_Submited , Is_Checked) 
                Values (  '${req.body.name}' , '${req.body.email}' , '${req.body.phone}' , ${return_bit(req.body.isSubmitted)} ,  ${return_bit(req.body.receiveUpdates)})`

  setSimulation(query).then((data) => {

    res.json(data);

  })


})

module.exports = router;
