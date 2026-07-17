import express from "express";

import {
  getCryptoNews
} from "../services/news.js";


const router = express.Router();



router.get("/", async(req,res)=>{


  try {


    const news = await getCryptoNews();


    res.json({

      success:true,

      count:news.length,

      news,

    });



  }catch(error){


    res.status(500).json({

      success:false,

      error:error.message,

    });


  }


});


export default router;