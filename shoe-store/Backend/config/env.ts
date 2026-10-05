// Reads and validates the required environment variables once, at import
// time, so every other module can rely on non-optional, already-validated
// values instead of re-checking `string | undefined` everywhere (notably
// mongoose.connect(), app.listen(), and jwt.sign(), which requires a
// non-undefined Secret).

// process.env[name] has the type `string | undefined` — TypeScript can't
// know at compile time whether an environment variable was actually set.
// This helper turns that "maybe a string" into a guaranteed `string` by
// throwing immediately if it's missing, so every caller below gets back a
// plain, non-optional string.
function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

const rawPort = requireEnv("PORT");
const PORT = Number(rawPort);
if (Number.isNaN(PORT)) {
  // Node's net.Server#listen() treats a string port as an IPC socket path,
  // not a TCP port — so PORT must be a real number, not just a non-empty
  // string, or the server would silently try to listen on a named pipe.
  throw new Error(`Environment variable PORT must be a number, got: ${rawPort}`);
}

const MONGO_URI = requireEnv("MONGO_URI");
const JWT_SECRET = requireEnv("JWT_SECRET");

export const env = {
  PORT,
  MONGO_URI,
  JWT_SECRET,
};

export default env;
