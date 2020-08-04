const Device = require("../models/Device");
const Maintenance = require("../models/maintenance_log");
const LocationActivity = require("../models/location_activity");
const Location = require("../models/Location");
const HTTPStatus = require("http-status");
const iot = require("@google-cloud/iot");
const isEmpty = require("is-empty");
const client = new iot.v1.DeviceManagerClient();
const device_registry =
  "projects/airqo-250220/locations/europe-west1/registries/device-registry";
const uuidv1 = require("uuid/v1");
const mqtt = require("mqtt");
const projectId = "airqo-250220";
const region = `europe-west1`;
const registryId = `device-registry`;
const algorithm = `RS256`;
// const privateKeyFile = `./rsa_private.pem`;
const mqttBridgeHostname = `mqtt.googleapis.com`;
const mqttBridgePort = 8883;
const messageType = `events`;
const numMessages = 5;
const fetch = require("node-fetch");
const request = require("request");
const axios = require("axios");
const constants = require("../config/constants");
const { logObject, logElement, logText } = require("../utils/log");

const doesDeviceExist = async (deviceName) => {
  const device = await Device.find({ name: deviceName }).exec();
  if (!isEmpty(device)) {
    return true;
  } else if (isEmpty(device)) {
    return false;
  }
};

const getChannelID = async (req, res, deviceName) => {
  try {
    logText("...................................");
    logText("getting channel ID...");
    const deviceDetails = await Device.find({ name: deviceName }).exec();
    logObject("the device details", deviceDetails[0]._doc);
    logElement("the channel ID", deviceDetails[0]._doc.channelID);
    let channeID = deviceDetails[0]._doc.channelID;
    return channeID;
  } catch (e) {
    return res.status(HTTPStatus.BAD_GATEWAY).json({
      success: false,
      message: "unable to get the corresponding TS ID",
      error: e.message,
    });
  }
};

const getApiKeys = async (deviceName) => {
  logText("...................................");
  logText("getting api keys...");
  const deviceDetails = await Device.find({ name: deviceName }).exec();
  logElement("the write key", deviceDetails.writeKey);
  logElement("the read key", deviceDetails.readKey);
  const writeKey = deviceDetails.writeKey;
  const readKey = deviceDetails.readKey;
  return { writeKey, readKey };
};

const doesLocationExist = async (locationName) => {
  let location = await Location.find({ name: locationName }).exec();
  if (location) {
    return true;
  } else {
    return false;
  }
};

const getGpsCoordinates = async (locationName) => {
  logText("...................................");
  logText("Getting the GPS coordinates...");
  let location = await Location.find({ name: locationName }).exec();
  if (location) {
    const lat = `${location.latitude}`;
    const lon = `${location.longitude}`;
    if (lat && lon) {
      logText(
        "Successfully retrieved the GPS coordinates from the location..."
      );
      return { lat, lon };
    } else {
      logText("Unable to retrieve the GPS coordinates from location...");
    }
  } else {
    logText(`Unable to find location ${locationName}`);
  }
};

const isDeviceNotDeployed = async (deviceName) => {
  try {
    // const query = Device.find({ name: deviceName });
    // device = query.getFilter(); // `{ name: 'Jean-Luc Picard' }`

    const device = await Device.find({ name: deviceName }).exec();
    logElement("....................");
    logElement("checking isDeviceNotDeployed....");
    logObject("device is here", device[0]._doc);
    const isNotDeployed = isEmpty(device[0]._doc.locationID) ? true : false;
    logText("locationID", device[0]._doc.locationID);
    logText("isNotDeployed", isNotDeployed);
    return isNotDeployed;
  } catch (e) {
    logText("error", e);
  }
};

const isDeviceNotRecalled = async (deviceName) => {
  try {
    const device = await Device.find({ name: deviceName }).exec();
    logElement("....................");
    logElement("checking isDeviceNotRecalled....");
    logObject("device is here", device[0]._doc);
    const isNotRecalled = device[0]._doc.isActive == true ? true : false;
    logText("isActive", device[0]._doc.isActive);
    logText("isNotRecalled", isNotRecalled);
    return isNotRecalled;
  } catch (e) {
    logText("error", e);
  }
};

function threeMonthsFromNow(date) {
  d = new Date(date);
  var targetMonth = d.getMonth() + 3;
  d.setMonth(targetMonth);
  if (d.getMonth() !== targetMonth % 12) {
    d.setDate(0); // last day of previous month
  }
  return d;
}

const locationActivityRequestBodies = (req, res) => {
  try {
    const type = req.query.type;
    logElement("....................");
    logElement("locationActivityRequestBodies...");
    logText("activityType", type);
    let locationActivityBody = {};
    let deviceBody = {};
    const {
      deviceName,
      locationName,
      height,
      mountType,
      powerType,
      description,
      latitude,
      longitude,
      date,
      tags,
      isPrimaryInLocation,
      isUserForCollocaton,
    } = req.body;

    //location and device body to be used for deploying....
    if (type == "deploy") {
      locationActivityBody = {
        location: locationName,
        device: deviceName,
        date: date,
        description: "device deployed",
        activityType: "deployment",
      };

      /**
       * in case we decide to use the location ID to get the latitude and longitude
       */
      // if (doesLocationExist(locationName)) {
      //   let { lat, lon } = getGpsCoordinates(locationName);
      //   deviceBody = {
      //     name: deviceName,
      //     locationID: locationName,
      //     height: height,
      //     mountType: mountType,
      //     powerType: powerType,
      //     isPrimaryInLocation: isPrimaryInLocation,
      //     isUserForCollocaton: isUserForCollocaton,
      //     nextMaintenance: threeMonthsFromNow(date),
      //     isActive: true,
      //     latitude: lat,
      //     longitude: lon,
      //   };
      // }
      // {
      //   res.status(500).json({
      //     message: "the location does not exist",
      //     success: false,
      //   });
      // }

      deviceBody = {
        name: deviceName,
        locationID: locationName,
        height: height,
        mountType: mountType,
        powerType: powerType,
        isPrimaryInLocation: isPrimaryInLocation,
        isUserForCollocaton: isUserForCollocaton,
        nextMaintenance: threeMonthsFromNow(date),
        isActive: true,
        latitude: latitude,
        longitude: longitude,
      };
      logObject("locationActivityBody", locationActivityBody);
      logObject("deviceBody", deviceBody);
      return { locationActivityBody, deviceBody };
    } else if (type == "recall") {
      /****** recalling bodies */
      locationActivityBody = {
        location: locationName,
        device: deviceName,
        date: date,
        description: "device recalled",
        activityType: "recallment",
      };
      deviceBody = {
        name: deviceName,
        locationID: "",
        height: "",
        mountType: "",
        powerType: "",
        isPrimaryInLocation: false,
        isUserForCollocaton: false,
        nextMaintenance: "",
        longitude: "",
        latitude: "",
        isActive: false,
      };
      logObject("locationActivityBody", locationActivityBody);
      logObject("deviceBody", deviceBody);
      return { locationActivityBody, deviceBody };
    } else if (type == "maintain") {
      /******** maintaining bodies */
      logObject("the tags", tags);
      locationActivityBody = {
        location: locationName,
        device: deviceName,
        date: date,
        description: description,
        activityType: "maintenance",
        nextMaintenance: threeMonthsFromNow(date),
        // $addToSet: { tags: { $each: tags } },
        tags: tags,
      };
      if (description == "preventive") {
        deviceBody = {
          name: deviceName,
          nextMaintenance: threeMonthsFromNow(date),
        };
      } else if (description == "corrective") {
        deviceBody = {
          name: deviceName,
        };
      }
      logObject("locationActivityBody", locationActivityBody);
      logObject("deviceBody", deviceBody);
      return { locationActivityBody, deviceBody };
    } else {
      /****incorrect query parameter....... */
      return res.status(HTTPStatus.BAD_GATEWAY).json({
        message: "incorrect query parameter",
        success: false,
      });
    }
  } catch (e) {
    console.log("error" + e);
  }
};

const updateThingBodies = (req, res) => {
  let {
    name,
    latitude,
    longitude,
    description,
    public_flag,
    readKey,
    writeKey,
    mobility,
    height,
    mountType,
    visibility,
    ISP,
    phoneNumber,
    device_manufacturer,
    product_name,
    powerType,
    locationID,
    host,
    isPrimaryInLocation,
    isUsedForCollocation,
    nextMaintenance,
    channelID,
    isActive,
    tags,
    elevation,
  } = req.body;

  let deviceBody = {
    ...(!isEmpty(name) && { name: name }),
    ...(!isEmpty(readKey) && { readKey: readKey }),
    ...(!isEmpty(writeKey) && { writeKey: writeKey }),
    ...(!isEmpty(host) && { host: host }),
    ...(!isEmpty(isActive) && { isActive: isActive }),
    ...(!isEmpty(latitude) && { latitude: latitude }),
    ...(!isEmpty(longitude) && { longitude: longitude }),
    ...(!isEmpty(description) && { description: description }),
    ...(!isEmpty(visibility) && { visibility: visibility }),
    ...(!isEmpty(product_name) && { product_name: product_name }),
    ...(!isEmpty(powerType) && { powerType: powerType }),
    ...(!isEmpty(mountType) && { mountType: mountType }),
    ...(!isEmpty(device_manufacturer) && {
      device_manufacturer: device_manufacturer,
    }),
    ...(!isEmpty(phoneNumber) && { phoneNumber: phoneNumber }),
    ...(!isEmpty(channelID) && { channelID: channelID }),
    ...(!isEmpty(isPrimaryInLocation) && {
      isPrimaryInLocation: isPrimaryInLocation,
    }),
    ...(!isEmpty(isUsedForCollocation) && {
      isUsedForCollocation: isUsedForCollocation,
    }),
    ...(!isEmpty(ISP) && { ISP: ISP }),
    ...(!isEmpty(height) && { height: height }),
    ...(!isEmpty(mobility) && { mobility: mobility }),
    ...(!isEmpty(locationID) && { locationID: locationID }),
    ...(!isEmpty(nextMaintenance) && { nextMaintenance: nextMaintenance }),
  };

  let tsBody = {
    ...(!isEmpty(elevation) && { elevation: elevation }),
    ...(!isEmpty(tags) && { tags: tags }),
    ...(!isEmpty(latitude) && { latitude: latitude }),
    ...(!isEmpty(longitude) && { longitude: longitude }),
    ...(!isEmpty(description) && { description: description }),
    ...(!isEmpty(visibility) && { public_flag: visibility }),
  };

  return { deviceBody, tsBody };
};

const clearDeviceBody = () => {
  let deviceBody = {
    name: "",
    latitude: null,
    longitude: null,
    description: "",
    public_flag: false,
    readKey: "",
    writeKey: "",
    mobility: false,
    height: null,
    mountType: "",
    ISP: "",
    phoneNumber: null,
    device_manufacturer: "",
    product_name: "",
    powerType: "",
    locationID: "",
    host: {},
    isPrimaryInLocation: false,
    isUsedForCollocation: false,
    nextMaintenance: "",
    channelID: "",
    isActive: false,
  };

  return { deviceBody };
};

const doLocationActivity = async (
  res,
  deviceBody,
  activityBody,
  deviceName,
  type,
  deviceExists,
  isNotDeployed,
  isNotRecalled
) => {
  const deviceFilter = { name: deviceName };

  let check = "";
  if (type == "deploy") {
    check = isNotDeployed;
  } else if (type == "recall") {
    check = isNotRecalled;
  } else if (type == "maintain") {
    check = true;
  } else {
    check = false;
  }

  logElement("....................");
  logElement("doLocationActivity...");
  logText("activityType", type);
  logText("deviceExists", isNotDeployed);
  logText("isNotDeployed", isNotDeployed);
  logText("isNotRecalled", isNotRecalled);
  logObject("activityBody", activityBody);
  logText("check", check);
  logObject("deviceBody", deviceBody);

  logElement("....................");

  if (check) {
    //first update device body
    await Device.findOneAndUpdate(
      deviceFilter,
      deviceBody,
      {
        new: true,
      },
      (error, updatedDevice) => {
        if (error) {
          return res.status(HTTPStatus.BAD_GATEWAY).json({
            message: `unable to ${type} `,
            error,
            success: false,
          });
        } else if (updatedDevice) {
          //then log the operation
          const log = LocationActivity.createLocationActivity(activityBody);
          log.then((log) => {
            return res.status(HTTPStatus.OK).json({
              message: `${type} successfully carried out`,
              updatedDevice,
              success: true,
            });
          });
        } else {
          return res.status(HTTPStatus.BAD_REQUEST).json({
            message: `device does not exist, please first create the device you are trying to ${type} `,
            success: false,
          });
        }
      }
    );
  } else {
    return res.status(HTTPStatus.BAD_REQUEST).json({
      message: `The ${type} activity was already done for this device, please crosscheck `,
      success: false,
    });
  }
};

const device = {
  listAll: async (req, res) => {
    const limit = parseInt(req.query.limit, 0);
    const skip = parseInt(req.query.skip, 0);

    try {
      const devices = await Device.list({ limit, skip });
      return res.status(HTTPStatus.OK).json(devices);
    } catch (e) {
      return res.status(HTTPStatus.BAD_REQUEST).json(e);
    }
  },

  listAllByLocation: async (req, res) => {
    const location = req.query.loc;
    logText("location ", location);
    try {
      const devices = await Device.find({ locationID: location }).exec();
      return res.status(HTTPStatus.OK).json(devices);
    } catch (e) {
      return res.status(HTTPStatus.BAD_REQUEST).json(e);
    }
  },

  listAllGcp: (req, res) => {
    const formattedParent = client.registryPath(
      "airqo-250220",
      "europe-west1",
      "device-registry"
    );
    const options = { autoPaginate: false };
    const callback = (responses) => {
      // The actual resources in a response.
      const resources = responses[0];
      // The next request if the response shows that there are more responses.
      const nextRequest = responses[1];
      // The actual response object, if necessary.
      // var rawResponse = responses[2];
      for (let i = 0; i < resources.length; i += 1) {
        // doThingsWith(resources[i]);
      }
      if (nextRequest) {
        // Fetch the next page.
        return client.listDevices(nextRequest, options).then(callback);
      }
      let response = responses[0];
      return res.status(HTTPStatus.OK).json(response);
    };
    client
      .listDevices({ parent: formattedParent }, options)
      .then(callback)
      .catch((err) => {
        console.error(err);
      });
  },

  createOne: async (req, res) => {
    try {
      console.log("creating one device....");
      const device = await Device.createDevice(req.body);
      return res.status(HTTPStatus.CREATED).json(device);
    } catch (e) {
      return res.status(400).json(e);
    }
  },

  createOneGcp: (req, res) => {
    const formattedParent = client.registryPath(
      "airqo-250220",
      "europe-west1",
      "device-registry"
    );
    const device = {
      id: req.body.id,
      metadata: req.body.metadata,
    };
    const request = {
      parent: formattedParent,
      device: device,
    };
    client
      .createDevice(request)
      .then((responses) => {
        const response = responses[0];
        return res.status(HTTPStatus.OK).json(response);
      })
      .catch((err) => {
        console.error(err);
        return res.status(HTTPStatus.BAD_REQUEST).json(err);
      });
    //connect the device to Cloud IoT core using MQTT bridge
  },

  /********************************* create Thing ****************************** */
  createThing: async (req, res) => {
    const baseUrl = constants.CREATE_THING_URL;
    let bodyPrep = {
      ...req.body,
      ...constants.DEVICE_CREATION,
    };
    try {
      if (!doesDeviceExist(req.body.name)) {
        logText("adding device on TS...");
        await axios
          .post(baseUrl, bodyPrep)
          .then(async (response) => {
            logObject("the response from TS", response);
            let writeKey = response.data.api_keys[0].write_flag
              ? response.data.api_keys[0].api_key
              : "";
            let readKey = !response.data.api_keys[1].write_flag
              ? response.data.api_keys[1].api_key
              : "";
            let deviceBody = {
              ...req.body,
              channelID: `${response.data.id}`,
              writeKey: writeKey,
              readKey: readKey,
            };
            logText("adding the device in the DB...");
            const device = await Device.createDevice(deviceBody);
            logObject("DB addition response", device);
            device.then((device) => {
              logObject("the added device", device);
              return res.status(HTTPStatus.CREATED).json({
                success: true,
                message: "successfully created the device",
                device,
              });
            });
          })
          .catch((e) => {
            let errors = e.message;
            res.status(400).json({
              success: false,
              message:
                "unable to create the device, please crosscheck the validity of all your input values",
              errors,
            });
          });
      } else {
        res.status(400).json({
          success: false,
          message: "device already exists!",
        });
      }
    } catch (e) {
      return res.status(400).json({
        success: false,
        message: "unable to create the device",
        error: e,
      });
    }
  },

  doActivity: async (req, res) => {
    const { deviceName } = req.body;
    const type = req.query.type;
    const deviceExists = await doesDeviceExist(deviceName);
    const isNotDeployed = await isDeviceNotDeployed(deviceName);
    const isNotRecalled = await isDeviceNotRecalled(deviceName);
    const { locationActivityBody, deviceBody } = locationActivityRequestBodies(
      req,
      res
    );

    doLocationActivity(
      res,
      deviceBody,
      locationActivityBody,
      deviceName,
      type,
      deviceExists,
      isNotDeployed,
      isNotRecalled
    );
  },

  fetchDeployments: async (req, res) => {
    const limit = parseInt(req.query.limit, 0);
    const skip = parseInt(req.query.skip, 0);

    try {
      const locationActivities = await LocationActivity.list({ limit, skip });
      return res.status(HTTPStatus.OK).json(locationActivities);
    } catch (e) {
      return res.status(HTTPStatus.BAD_REQUEST).json(e);
    }
  },

  /********************************* delete Thing ****************************** */
  deleteThing: async (req, res) => {
    try {
      const { device } = req.query;
      if (doesDeviceExist(device)) {
        const channelID = getChannelID(req, res, device);
        logText("deleting device from TS.......");
        await axios
          .delete(constants.DELETE_THING_URL(channelID))
          .then(async (response) => {
            logText("successfully deleted device from TS");
            logObject("TS response data", response.data);
            logText("deleting device from DB.......");
            const deviceRemovedFromDB = await Device.findOneAndRemove({
              name: device,
            }).exec();
            if (deviceRemovedFromDB) {
              let deviceDeleted = response.data;
              logText("successfully deleted device from DB");
              res.status(200).json({
                message: "successfully deleted the device from DB",
                success: true,
                deviceDeleted,
              });
            } else if (!deviceRemovedFromDB) {
              res.status(500).json({
                message: "unable to the device from DB",
                success: false,
                deviceDetails: device,
              });
            }
          })
          .catch(function(error) {
            logElement("unable to delete device from TS", error);
            res.status(500).json({
              message: "unable to delete the device from TS",
              success: false,
              error,
            });
          });
      } else {
        logText("device does not exist in DB");
        res.status(500).json({
          message: "device does not exist in DB",
          success: false,
        });
      }
    } catch (e) {
      logElement("unable to carry out the entire deletion of device", e);
      logObject("unable to carry out the entire deletion of device", e);
    }
  },

  /********************************* clear Thing ****************************** */
  clearThing: async (req, res) => {
    try {
      let { device } = req.query;
      if (doesDeviceExist(device)) {
        //get the thing's channel ID
        logText("...................................");
        logText("clearing the Thing....");
        //lets first get the channel ID
        const channelID = getChannelID(req, res, device);
        if (channelID) {
          await axios
            .delete(CLEAR_THING_URL(deviceDetails.channelID))
            .then(async (response) => {
              logText("successfully cleared the device in TS");
              logObject("response from TS", response.data);
              logText("clearing the device in DB....");
              //this is more like updating a document
              //first get the body I need
              let { deviceBody } = clearDeviceBody();
              //use the body to update the document.
              let updatedDevice = await Device.findOneAndUpdate(
                { name: device },
                deviceBody,
                { new: true }
              );
              if (updatedDevice) {
                res.status(200).json({
                  message: `successfully cleared the data for device ${device}`,
                  success: true,
                  updatedDevice,
                });
              } else {
                logText(
                  `unable to clear the data for device ${device} in the DB`
                );
                res.status(500).json({
                  message: `unable to clear the data for device ${device} in the DB`,
                  success: false,
                });
              }
              logText("...................................");
            })
            .catch(function(error) {
              console.log(error);
              res.status(500).json({
                message: `unable to clear the device data, device ${device} does not exist`,
                success: false,
                //   error,
              });
            });
        } else {
          logText(`failed to find the channel ID of device ${device}`);
        }
      } else {
        logText(`device ${device} does not exist in the system`);
      }
    } catch (e) {
      logText(`unable to clear device ${device}`);
    }
  },

  /********************************* Thing Settings ****************************** */
  updateThingSettings: async (req, res) => {
    try {
      const { device } = req.query;
      const channelID = await getChannelID(req, res, device);
      logText(".............................................");
      logText("updating the thing...");
      const deviceFilter = { name: device };
      if (!doesDeviceExist(device)) {
        logText(`device ${device} does not exist in DB`);
        res.status(500).json({
          message: `device ${device} does not exist`,
          success: false,
        });
      }
      let { tsBody, deviceBody } = updateThingBodies(req, res);
      logObject("TS body", tsBody);
      logObject("device body", deviceBody);
      const config = {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      };
      //update the device in TS
      //on success update, then update the device details accordingly.
      if (!isEmpty(channelID)) {
        await axios
          .put(constants.UPDATE_THING(channelID), tsBody, config)
          .then(async (response) => {
            logText(`successfully updated device ${device} in TS`);
            logElement("response from TS", response.data);
            const updatedDevice = await Device.findOneAndUpdate(
              deviceFilter,
              deviceBody,
              {
                new: true,
              }
            );
            if (updatedDevice) {
              return res.status(HTTPStatus.OK).json({
                message: "successfully updated the device settings in DB",
                updatedDevice,
                success: true,
              });
            } else if (!updatedDevice) {
              return res.status(HTTPStatus.BAD_GATEWAY).json({
                message: "unable to update device in DB but updated in TS",
                success: false,
              });
            } else {
              logText("just unable to update device in DB but updated in TS");
            }
          })
          .catch(function(error) {
            logElement("unable to update the device settings in TS", error);
            res.status(500).json({
              message: "unable to update the device settings in TS",
              success: false,
              error: error.message,
            });
          });
      } else if (isEmpty(channelID)) {
        logText("channel ID does not exist in TS");
        return res.status(HTTPStatus.BAD_GATEWAY).json({
          message: `channel ID for device "${device}" does not exist in TS`,
          success: false,
        });
      }
    } catch (e) {
      logElement("unable to perform update operation", e);
      res.status(500).json({
        message: "unable to perform update operation",
        success: false,
        error: e,
      });
    }
  },

  /********************************* push data to Thing ****************************** */
  writeToThing: async (req, res) => {
    await axios
      .get(constants.ADD_VALUE(field, value, apiKey))
      .then(function(response) {
        console.log(response.data);
        updateUrl = `https://api.thingspeak.com/update.json?api_key=${response.data.api_keys[0].api_key}`;
        axios
          .post(updateUrl, req.body)
          .then(function(response) {
            console.log(response.data);
            let output = response.data;
            res.status(200).json({
              message: "successfully written data to the device",
              success: true,
              output,
            });
          })
          .catch(function(error) {
            console.log(error);
            res.status(500).json({
              message: "unable to write data to the device",
              success: false,
              error,
            });
          });
      })
      .catch(function(error) {
        console.log(error);
        res.status(500).json({
          message:
            "unable to get channel details necessary for writing this data",
          success: false,
          error,
        });
      });
  },

  bulkWriteToThing: (req, res) => {},

  /**************************** end of using ThingSpeak **************************** */

  //getting the device by its ID:
  listOne: async (req, res) => {
    try {
      const device = await Device.findById(req.params.id);
      return res.status(HTTPStatus.OK).json(device);
    } catch (e) {
      return res.status(HTTPStatus.BAD_REQUEST).json(e);
    }
  },

  listOneGcp: (req, res) => {
    let device = req.params.name;
    const formattedName = client.devicePath(
      "airqo-250220",
      "europe-west1",
      "device-registry",
      `${device}`
    );
    client
      .getDevice({ name: formattedName })
      .then((responses) => {
        var response = responses[0];
        // doThingsWith(response)
        return res.status(HTTPStatus.OK).json(response);
      })
      .catch((err) => {
        console.error(err);
      });
  },

  delete: async (req, res) => {
    try {
      const device = await Device.findById(req.params.id);

      if (!device.device.equals(req.device._id)) {
        return res.sendStatus(HTTPStatus.UNAUTHORIZED);
      }

      await device.remove();
      return res.sendStatus(HTTPStatus.OK);
    } catch (e) {
      return res.status(HTTPStatus.BAD_REQUEST).json(e);
    }
  },

  deleteGcp: (req, res) => {
    let device = req.params.name;
    const formattedName = client.devicePath(
      "airqo-250220",
      "europe-west1",
      "device-registry",
      `${device}`
    );
    client
      .deleteDevice({ name: formattedName })
      .then((responses) => {
        let result = {
          status: "OK",
          message: `device ${device} has successfully been deleted`,
        };
        return res.status(HTTPStatus.OK).json(result);
      })
      .catch((err) => {
        console.error(err);
        return res.status(HTTPStatus.BAD_REQUEST).json(err);
      });
  },

  updateDevice: async (req, res) => {
    try {
      const device = await Device.findById(req.params.id);
      if (!device.device.equals(req.device._id)) {
        return res.sendStatus(HTTPStatus.UNAUTHORIZED);
      }

      Object.keys(req.body).forEach((key) => {
        device[key] = req.body[key];
      });

      return res.status(HTTPStatus.OK).json(await device.save());
    } catch (e) {
      return res.status(HTTPStatus.BAD_REQUEST).json(e);
    }
  },

  updateDeviceGcp: (req, res) => {
    let device = req.params.name;
    const formattedName = client.devicePath(
      "airqo-250220",
      "europe-west1",
      "device-registry",
      `${device}`
    );

    var deviceUpdate = {
      name: req.params.name,
      blocked: req.body.blocked,
      metadata: req.body.metadata,
    };
    var updateMask = {
      blocked: device.blocked,
      metadata: device.metadata,
    };
    var request = {
      device: deviceUpdate,
      updateMask: updateMask,
    };
    client
      .updateDevice(request)
      .then((responses) => {
        var response = responses[0];
        return res.status(HTTPStatus.OK).json(response);
      })
      .catch((err) => {
        console.error(err);
        return res.status(HTTPStatus.BAD_REQUEST).json(err);
      });
  },
};

module.exports = device;
