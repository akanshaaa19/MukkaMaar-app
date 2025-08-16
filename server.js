import dotenv from "dotenv";
import app from "./src/app.js";

dotenv.config();

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => console.log(`API running http://localhost:${PORT}`));
