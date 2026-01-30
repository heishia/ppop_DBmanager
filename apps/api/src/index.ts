import express from 'express';
import cors from 'cors';
import { customerRouter } from './routes/customer.routes';
import { contactRouter } from './routes/contact.routes';
import { emailRouter } from './routes/email.routes';
import { importRouter } from './routes/import.routes';
import { groupRouter } from './routes/group.routes';
import { settingsRouter } from './routes/settings.routes';
import { errorHandler } from './middleware/error.middleware';
import { API_CONFIG } from '@ppop/config';

const app = express();
const port = process.env.API_PORT || API_CONFIG.DEFAULT_PORT;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/customers', customerRouter);
app.use('/api/contacts', contactRouter);
app.use('/api/email', emailRouter);
app.use('/api/import', importRouter);
app.use('/api/groups', groupRouter);
app.use('/api/settings', settingsRouter);

// Health check
app.get('/health', (_, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling
app.use(errorHandler);

app.listen(port, () => {
  console.log(`API server running on port ${port}`);
});
