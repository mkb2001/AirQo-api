const mongoose = require("mongoose");
const stageConfig = {
  MONGO_URI: process.env.STAGE_MONGO_URI,
  ENVIRONMENT: "STAGING ENVIRONMENT",
  DB_NAME: process.env.STAGE_MONGO_DB,
  REDIS_SERVER: process.env.STAGE_REDIS_SERVER,
  REDIS_PORT: process.env.STAGE_REDIS_PORT,
  XENTE_BASE_URL: process.env.STAGE_XENTE_BASE_URL,
  XENTE_ACCOUNT_ID: process.env.STAGE_XENTE_ACCOUNT_ID,
  XENTE_PASSWORD: process.env.STAGE_XENTE_PASSWORD,
  XENTE_USERNAME: process.env.STAGE_XENTE_USERNAME,
  XENTE_COLLECTIONS_PRODUCT_ITEM:
    process.env.STAGE_XENTE_COLLECTIONS_PRODUCT_ITEM,
  XENTE_COLLECTIONS_PRODUCT_REFERENCE:
    process.env.STAGE_XENTE_COLLECTIONS_PRODUCT_REFERENCE,
  XENTE_C0LLECTIONS_TYPE: process.env.STAGE_XENTE_C0LLECTIONS_TYPE,
  XENTE_PAYOUTS_PAYMENT_REFERENCE:
    process.env.STAGE_XENTE_PAYOUTS_PAYMENT_REFERENCE,
  XENTE_PAYOUTS_TYPE: process.env.STAGE_XENTE_PAYOUTS_TYPE,
  XENTE_PAYOUTS_PAYMENT_PROVIDER:
    process.env.STAGE_XENTE_PAYOUTS_PAYMENT_PROVIDER,
  XENTE_DATA_PAYMENT_PROVIDER: process.env.STAGE_XENTE_DATA_PAYMENT_PROVIDER,
  XENTE_DATA_PAYMENT_REFERENCE: process.env.STAGE_XENTE_DATA_PAYMENT_REFERENCE,
  XENTE_DATA_TYPE: process.env.STAGE_XENTE_DATA_TYPE,
  THINGS_MOBILE_RECHARGE_URL: process.env.STAGE_THINGS_MOBILE_RECHARGE_URL,
  THINGS_MOBILE_UPDATE_SIM_NAME_URL:
    process.env.STAGE_THINGS_MOBILE_UPDATE_SIM_NAME_URL,
  THINGS_MOBILE_DEACTIVATE_URL: process.env.STAGE_THINGS_MOBILE_DEACTIVATE_URL,
  THINGS_MOBILE_ACTIVATE_URL: process.env.STAGE_THINGS_MOBILE_ACTIVATE_URL,
  THINGS_MOBILE_STATUS_URL: process.env.STAGE_THINGS_MOBILE_STATUS_URL,
  THINGS_MOBILE_BASE_URL: process.env.STAGE_THINGS_MOBILE_BASE_URL,
  THINGS_MOBILE_TOKEN: process.env.STAGE_THINGS_MOBILE_TOKEN,
  THINGS_MOBILE_USERNAME: process.env.STAGE_THINGS_MOBILE_USERNAME,
};

module.exports = stageConfig;