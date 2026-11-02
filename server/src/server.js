import "dotenv/config";
import app from "./app.js";
import { connectDb } from "./config/database.js";

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
connectDb().catch((error) => {
  console.error("MongoDB connection failed. Development uses the bundled hotel catalog until MongoDB is available.", error);
});
