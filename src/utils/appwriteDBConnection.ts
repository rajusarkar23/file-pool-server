import sdk from "node-appwrite";

const client = new sdk.Client();

const database = new sdk.Databases(client);

client
  .setEndpoint(`${process.env.APPWRITE_ENDPOINT}`)
  .setProject(`${process.env.APPWRITE_PROJECT_ID}`)
  .setKey(`${process.env.APPWRITE_SECRET_API_KEY}`);

export { database };
