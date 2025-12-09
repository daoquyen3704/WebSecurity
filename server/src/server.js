const express = require('express');
const app = express();
const port = 3000;
const fs = require('fs');

const server = require('http').createServer(app);
const io = require("socket.io")(server, {
    cors: {
        origin: process.env.CLIENT_URL,
        methods: ["GET", "POST"],
        credentials: true
    },
    transports: ["websocket", "polling"]
});



require('dotenv').config();

const bodyParser = require('body-parser');
const cookiesParser = require('cookie-parser');
const cors = require('cors');
const path = require('path');
const cookie = require('cookie');

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));

const connectDB = require('./config/ConnectDB');
const routes = require('./routes/index');
const { verifyToken } = require('./services/tokenSevices');
const modelMessager = require('./models/Messager.model');
const { askQuestion } = require('./utils/Chatbot/chatbot');
const { AiSearch } = require('./utils/AISearch/AISearch');
const socketServices = require('./services/socketServices');

app.use(express.static(path.join(__dirname, '../src')));
app.use(cookiesParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

routes(app);

connectDB();

app.use((req, res, next) => {
    req.io = io;
    next();
});

// global.io.on('connect', socketServices.connection);
io.on("connection", (socket) => {
    socketServices.connection(socket);
});

app.post('/chat', async (req, res) => {
    try {
        const { question } = req.body;
        const answer = await askQuestion(question);

        return res.status(200).json({
            success: true,
            answer: answer.answer
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            answer: "Xin lỗi! Tôi đang gặp lỗi xử lý. Vui lòng thử lại."
        });
    }
});


const modelPost = require('./models/post.model');

app.get('/ai-search', async (req, res) => {
    const { question } = req.query;
    console.log('question', question);
    try {
        console.log("Using regex search for:", question);

        // Helper function to escape special regex characters
        const escapeRegex = (str) => {
            return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        };

        const words = question.split(' ').filter(w => w.trim());
        const regexes = words.map(w => new RegExp(escapeRegex(w), 'i'));

        const query = {
            $and: regexes.map(r => ({
                $or: [
                    { title: r },
                    { location: r },
                    { description: r }
                ]
            })),
            status: 'active'
        };

        const data = await modelPost.find(query).limit(20);
        return res.status(200).json(data);
    } catch (error) {
        console.error("Search route error:", error);
        return res.status(200).json([]);
    }
});

app.post('/api/add-search', (req, res) => {
    const { title } = req.body;
    const index = hotSearch.findIndex((item) => item.title === title);
    if (index !== -1) {
        hotSearch[index].count++;
    } else {
        hotSearch.push({ title, count: 1 });
    }
    return res.status(200).json({ message: 'Thêm từ khóa thành công' });
});

server.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
