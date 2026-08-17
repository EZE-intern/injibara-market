import express from 'express';

const app = express();
const PORT = process.env.PORT || 5000;

// Your middleware, routes, and database connections here...

app.listen(PORT, () => {
  console.log(`Server setup complete on port ${PORT}`);
});
