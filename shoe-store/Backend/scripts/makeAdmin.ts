import "dotenv/config";
import mongoose from "mongoose";
import User from "../models/user.js";

// Promotes an existing account to admin, so it can open /admin.
//
//   npx tsx scripts/makeAdmin.ts you@example.com
//
// With no email it just lists the accounts that exist, so you can pick one.
//
// This is a standalone command-line script, run directly with `tsx`
// rather than through the running server — that's why it re-reads
// process.env.MONGO_URI and connects to the database itself instead of
// importing config/env.ts or index.ts.
async function run() {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    throw new Error("Missing required environment variable: MONGO_URI");
  }
  await mongoose.connect(mongoUri);

  // process.argv holds the command-line arguments; argv[0] is the node
  // executable, argv[1] is this script's path, so the first real argument
  // (the email) is argv[2].
  const email = process.argv[2];

  if (!email) {
    // .lean() returns plain JavaScript objects instead of full Mongoose
    // documents — faster and simpler here since we only need to print the
    // data, not call any document methods on it or save changes back.
    const users = await User.find().select("name email role").lean();

    console.log("\nAccounts in the database:\n");
    users.forEach((user) => {
      console.log(`  ${user.email}  —  ${user.role}`);
    });
    console.log("\nRe-run with an email to make that account an admin:");
    console.log("  npx tsx scripts/makeAdmin.ts you@example.com\n");

    await mongoose.disconnect();
    return;
  }

  // .toLowerCase() matches the `lowercase: true` schema option on
  // User.email (models/user.ts), which lowercases emails before storing
  // them — without this, an email typed with different casing here
  // wouldn't match any stored document.
  const result = await User.updateOne(
    { email: email.toLowerCase() },
    { $set: { role: "admin" } },
  );

  if (result.matchedCount === 0) {
    console.log(`No account found for ${email}`);
  } else {
    console.log(
      `${email} is now an admin — log out and back in to pick it up.`,
    );
  }

  await mongoose.disconnect();
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
