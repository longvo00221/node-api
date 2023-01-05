import mongoose from "mongoose";
import crypto from "crypto";
import https from "https";
const momoSchema = mongoose.Schema({
    partnerCode: {
      type: String,
      required: true,
      default: "MOMO0DDM20220908",
    },
    accessKey: {
      type: String,
      required: true,
      default: "eGeQE9L8ub8tM1G4",
    },
    secretkey: {
      type: String,
      required: true,
      default: "p7EObsGMJIEQkZgAms5uh8bUg8pBXcQ7",
    },
    requestId: {
      type: String,
      required: true,
    },
    orderId: {
      type: String,
      required: true,
    },
    orderInfo: {
      type: String,
      required: true,
      default: "Pay Momo",
    },
    redirectUrl: {
      type: String,
      required: true,
    },
    ipnUrl: {
      type: String,
      required: true,
    },
    amount: {
      type: String,
      required: true,
    },
    requestType: {
      type: String,
      required: true,
      default: "captureWallet",
    },
    extraData: {
      type: String,
      default: "",
    },
    signature: {
      type: String,
    },
    lang:{
        type:String,
        default:"en"
    }
  },
  {
      timestamps: true,
  });
momoSchema.methods.generateSignature = function () {
    const rawSignature = `accessKey=${this.accessKey}&amount=${this.amount}&extraData=${this.extraData}&ipnUrl=${this.ipnUrl}&orderId=${this.orderId}&orderInfo=${this.orderInfo}&partnerCode=${this.partnerCode}&redirectUrl=${this.redirectUrl}&requestId=${this.requestId}&requestType=${this.requestType}`;
    this.signature = crypto.createHmac("sha256", this.secretkey)
      .update(rawSignature)
      .digest("hex");
    return this.signature;
  };
  
const Momo = mongoose.model("Momo",momoSchema)
export default Momo
