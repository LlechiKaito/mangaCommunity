"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const app = (0, express_1.default)();
const port = 8080;
// Async function to handle the route logic
const getUsers = async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            include: {
                authority: true,
            },
        });
        console.dir(users, { depth: null });
        res.json(users);
    }
    catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).send('Internal Server Error');
    }
};
// Route definition using the async function
app.get('/users', getUsers);
// Start the server
app.listen(port, () => console.log(`Example app listening on port ${port}!`));
//# sourceMappingURL=app.js.map