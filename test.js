const dotenv = require("dotenv");
dotenv.config();
const app = require("./app");
const socketio = require("socket.io");
const { promisify } = require("util");
const { QueryTypes } = require("sequelize");
const db = require("./model/index");

const sequelize = db.sequelize;

const jwt = require("jsonwebtoken");
const { users } = require("./model");
//for handling uncaughtexception error
process.on("uncaughtException", (err) => {
  console.log(err.name, err.message);
  console.log("uncaught exception occured shutting down");

  process.exit(1);
});

const PORT = 8080 || process.env.PORT;
const server = app.listen(PORT, () => {
  console.log(`backend server has started at PORT , ${PORT}`);
});

const io = socketio(server, {
  cors: {
    origin: "http://localhost:1233",
    methods: ["GET", "POST"],
  },
});
const updateMapLocation = async (
  organizationNumber,
  deliveryBoyId,
  latitude,
  longitude
) => {
  try {
    const mapquery = await sequelize.query(
      `SELECT * FROM map_org_${organizationNumber} WHERE deliveryBoyId = ?`,
      {
        replacements: [deliveryBoyId],
        type: QueryTypes.SELECT,
      }
    );
    if (mapquery.length > 0) {
      await sequelize.query(
        `UPDATE map_org_${organizationNumber} SET latitude = ?, longitude = ? WHERE deliveryBoyId = ?`,
        {
          replacements: [latitude, longitude, deliveryBoyId],
          type: QueryTypes.UPDATE,
        }
      );
      return true;
    } else {
      await sequelize.query(
        `INSERT INTO map_org_${organizationNumber} (latitude, longitude, deliveryBoyId) VALUES (?, ?, ?)`,
        {
          replacements: [latitude, longitude, deliveryBoyId],
          type: QueryTypes.INSERT,
        }
      );
      return true;
    }
  } catch (error) {
    console.error(error);
    return false;
  }
};

const updateDeliveryBoyStatus = async (organizationNumber, id, status) => {
  try {
    const query = `
      UPDATE deliveryboy_org_${organizationNumber}
      SET deliveryboyStatus = :status
      WHERE id = :id
    `;
    await sequelize.query(query, {
      replacements: {
        status,
        id,
      },
    });
  } catch (error) {
    console.error(error);
  }
};

let onlineUsers = [];
// test

const addNewUser = (socketId, organizationNumber, id, role) => {
  !onlineUsers.some(
    (user) =>
      user.organizationNumber === organizationNumber && user.role === role
  ) && onlineUsers.push({ socketId, organizationNumber, id, role });
  console.log(onlineUsers, "onlineUsers");
  app.locals.onlineUsers = onlineUsers;
};

const removeUser = (socketId) => {
  onlineUsers = onlineUsers?.filter((user) => user.socketId !== socketId);
};

io.on("connection", (socket) => {
  socket.on("addUser", async ({ token }) => {
   
    // verify token  usng jwt

    try {
      const decoded = await promisify(jwt.verify)(
        token,
        process.env.JWT_SECRET
      );

      const userId = decoded.id;
      const user = await users.findByPk(userId);

      if (!decoded.organizationNumber) {
        return addNewUser(
          socket.id,
          user.organizationNumber,
          user.id,
          user.role
        );
      } else {
        addNewUser(
          socket.id,
          decoded.organizationNumber,
          decoded.id,
          "deliveryBoy"
        );
        // update delivery boy status to online test test
        await updateDeliveryBoyStatus(
          decoded.organizationNumber,
          decoded.id,
          "online"
        );
        const deilveryBoy = await sequelize.query(
          `SELECT * FROM deliveryboy_org_${decoded?.organizationNumber} ORDER BY id DESC`,
          { type: QueryTypes.SELECT }
        );
        const receiver = onlineUsers?.find((user) => {
          return (
            user.organizationNumber == decoded.organizationNumber &&
            user.role == "admin"
          );
        });

        if (receiver) {
          io.to(receiver.socketId).emit(
            "deliveryBoy",
            deilveryBoy?.slice(0, 5)
          );
        }
      }
    } catch (error) {
      console.log(error.message);
    }
  });

  socket.on("sendLocation", async (data) => {
    console.log("inside sendLocation", data)
    try {
      const decoded = await promisify(jwt.verify)(
        data.token,
        process.env.JWT_SECRET
      );
      if (decoded.organizationNumber) {
        const organizationNumber = decoded.organizationNumber;
        const deliveryBoyId = decoded.id;
        const latitude = data.latitude;
        const longitude = data.longitude;
        const res = await updateMapLocation(
          organizationNumber,
          deliveryBoyId,
          latitude,
          longitude
        );
        console.log(longitude, latitude, "longitude", "latitude");
        let getMapDatas;

        if (res)
          getMapDatas = await sequelize.query(
            `SELECT * FROM map_org_${organizationNumber} JOIN deliveryboy_org_${organizationNumber} ON map_org_${organizationNumber}.deliveryBoyId = deliveryboy_org_${organizationNumber}.id`,
            {
              type: QueryTypes.SELECT,
            }
          );
        const receiver = onlineUsers?.find((user) => {
          return (
            user.organizationNumber == organizationNumber &&
            user.role == "admin"
          );
        });

        if (receiver) {
          console.log(getMapDatas, "getMapDatas")
          io.to(receiver.socketId).emit("getLocation", getMapDatas);
        }
      }
    } catch (error) {
      console.log(error.message, "error", error);
    }
  });

  socket.on("disconnect", async () => {
    try {
      console.log("a user disconnected");
      removeUser(socket.id);

      // update delivery boy status to inactive
      const onlineDeliveryBoy = app.locals?.onlineUsers?.find(
        (user) => user.socketId === socket.id && user.role === "deliveryBoy"
      );
      console.log(onlineDeliveryBoy, "onlineDeliveryBoy");
      if (onlineDeliveryBoy) {
        await updateDeliveryBoyStatus(
          onlineDeliveryBoy.organizationNumber,
          onlineDeliveryBoy.id,
          "inactive"
        );
        const deilveryBoy = await sequelize.query(
          `SELECT * FROM deliveryboy_org_${onlineDeliveryBoy?.organizationNumber} ORDER BY id DESC`,
          { type: QueryTypes.SELECT }
        );
        const receiver = onlineUsers?.find((user) => {
          return (
            user.organizationNumber == onlineDeliveryBoy.organizationNumber &&
            user.role == "admin"
          );
        });
        if (receiver) {
          io.to(receiver.socketId).emit(
            "deliveryBoy",
            deilveryBoy?.slice(0, 5)
          );
        }
      }
    } catch (error) {
      console.log(error, "error");
    }
  });
});

//for unhandledrejection error
process.on("unhandledRejection", (err) => {
  console.log(err.name, err.message);
  console.log("unhandled rejection occured shutting down");
  server.close(() => {
    process.exit(1);
  });
});

module.exports = (req, res, next) => {
  res.locals.onlineUsers = app.locals.onlineUsers;
  res.locals.io = io;
  next();
};

function getSocketIo() {
  return io;
}
module.exports.getSocketIo = getSocketIo;

// test