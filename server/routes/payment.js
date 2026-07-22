import express from "express";

import {
  verifyPayment,
} from "../services/paymentVerifier.js";


const router = express.Router();



router.post(
  "/verify",
  async (req, res) => {

    try {

      const {
        txHash,
        wallet,
      } = req.body;



      if (!txHash || !wallet) {

        return res.status(400).json({

          success: false,

          message:
            "Transaction hash and wallet required",

        });

      }



      const verified =
        await verifyPayment(txHash);



      if (!verified) {

        return res.status(400).json({

          success: false,

          message:
            "Payment verification failed",

        });

      }



      return res.json({

        success: true,

        message:
          "Payment verified",

        wallet,

      });



    } catch(error) {


      console.error(
        "Payment route error:",
        error
      );



      return res.status(500).json({

        success: false,

        message:
          "Server error",

      });


    }

  }
);



export default router;