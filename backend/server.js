require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const connectDB = require('./src/config/db');
const errorHandler = require('./src/middleware/errorHandler');

const app = express();

connectDB();

app.use(helmet());
app.use(compression());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

app.use('/api/', rateLimit({ windowMs: 15 * 60 * 1000, max: 300 }));

app.use('/api/auth', require('./src/routes/auth.routes'));
app.use('/api/projects', require('./src/routes/project.routes'));
app.use('/api/tasks', require('./src/routes/task.routes'));
app.use('/api/users', require('./src/routes/user.routes'));
app.use('/api/notifications', require('./src/routes/notification.routes'));

app.get('/api/health', (req, res) => res.json({ status: 'ok', env: process.env.NODE_ENV }));

app.use(errorHandler);

if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
