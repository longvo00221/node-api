import express from "express";
import asyncHandler from "express-async-handler";
import cors from "cors";
import https from "https";
import crypto from 'crypto'

const momoRouter = express.Router();
// CREATE ORDER
momoRouter.post(
  "/",
  cors({
    origin: '*'
  }),
  asyncHandler(async (request, res) => {
    try {
      // read values from the request body
      const {
        partnerCode,
        accessKey,
        secretkey,
        requestId,
        orderId,
        orderInfo,
        redirectUrl,
        ipnUrl,
        amount,
        requestType,
        extraData,
      } = request.body;
      
      // create the raw signature
      const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;

      // compute the signature
    
      const signature = crypto
        .createHmac("sha256", secretkey)
        .update(rawSignature)
        .digest("hex");

      // create the request body
      const requestBody = JSON.stringify({
        partnerCode,
        accessKey,
        requestId,
        amount,
        orderId,
        orderInfo,
        redirectUrl,
        ipnUrl,
        extraData,
        requestType,
        signature,
        lang: "en",
      });
      


      // create the request options
      const options = {
        hostname: "payment.momo.vn",
        port: 443,
        path: "/v2/gateway/api/create",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(requestBody),
        },
      };

      // send the request
      const req = https.request(options, (response) => {
        console.log(`Status: ${response.statusCode}`);
        console.log(`Headers: ${JSON.stringify(response.headers)}`);
        response.setEncoding("utf8");
        response.on("data", (body) => {
          console.log("Body: ");
          console.log(body);
          console.log("payUrl: ");
          console.log(JSON.parse(body).payUrl);
          const payUrl = JSON.parse(body).payUrl;
          res.send({ success: true, payUrl });
        });
        response.on("end", () => {
          console.log("No more data in response.");
        });
      });

      req.on("error", (error) => {
        console.log(`problem with request: ${error.message}`);
      });

      console.log("Sending....");
      req.write(requestBody);
      req.end();

    } catch (error) {
      console.error(error);
      res.send({ success: false, error: error.message });
    }
  })
);

export default momoRouter;
