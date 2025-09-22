// //Users Scheema Validation
// await db.command({
//   collMod: "users",
//   validator: {
//     $jsonSchema: {
//       bsonType: "object",
//       required: ["_id", "name", "email", "profileImg"],
//       properties: {
//         _id: {
//           bsonType: "objectId",
//         },
//         name: {
//           bsonType: "string",
//           minLength: 3,
//         },
//         email: {
//           bsonType: "string",
//         },
//         password: {
//           bsonType: "string",
//         },
//         profileImg: {
//           bsonType: "string",
//         },
//       },
//     },
//   },
//   validationAction: "error",
// });

// //Directories Scheema Validation
// await db.command({
//   collMod: "directories",
//   validator: {
//     $jsonSchema: {
//       bsonType: "object",
//       required: ["_id", "name", "dirLocation", "uid"],
//       properties: {
//         _id: {
//           bsonType: "objectId",
//         },
//         name: {
//           bsonType: "string",
//         },
//         dirLocation: {
//           bsonType: ["null", "string"],
//         },
//         uid: {
//           bsonType: "objectId",
//         },
//       },
//     },
//   },
//   validationAction: "error",
// });

// //Files Scheema Validation
// await db.command({
//   collMod: "files",
//   validator: {
//     $jsonSchema: {
//       bsonType: "object",
//       required: ["_id", "name", "dirLocation", "uid", "ext"],
//       properties: {
//         _id: {
//           bsonType: "objectId",
//         },
//         name: {
//           bsonType: "string",
//         },
//         dirLocation: {
//           bsonType: ["null", "string"],
//         },
//         uid: {
//           bsonType: "objectId",
//         },
//         ext: {
//           bsonType: "string",
//         },
//       },
//     },
//   },
//   validationAction: "error",
// });

// //Session Scheema Validation
// await db.command({
//   collMod: "sessions",
//   validator: {
//     $jsonSchema: {
//       bsonType: "object",
//       required: ["userId"],
//       properties: {
//         userId: {
//           bsonType: "objectId",
//         },
//         createdAt: {
//           bsonType: "Date",
//         },
//       },
//     },
//   },
//   validationAction: "error",
// });

// mongoose.disconnect();
// client.disconnect();
