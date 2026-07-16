const express = require('express');
const path = require('path');
const cors = require('cors');
const config = require('./config');
const authRoutes = require('./routes/auth');
const pageRoutes = require('./routes/pages');
const trackerRoutes = require('./routes/trackers');
const highlightRoutes = require('./routes/highlights');
const visionBoardRoutes = require('./routes/visionBoards');

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/pages', pageRoutes);
app.use('/api/trackers', trackerRoutes);
app.use('/api/highlights', highlightRoutes);
app.use('/api/vision-boards', visionBoardRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Serve static frontend files
app.use(express.static(path.join(__dirname, '..')));

// Fallback to index.html for SPA-style navigation
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'index.html'));
});

if (require.main === module) {
    app.listen(config.port, () => {
        console.log(`My Journal server running at http://localhost:${config.port}`);
    });
}

module.exports = app;
