import express from 'express';
import { Express, Request, Response } from 'express'; // Import types
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const app: Express = express();
const port = 8080;

// Async function to handle the route logic
const getUsers = async (req: Request, res: Response) => {
    try {
        const users = await prisma.user.findMany({
            include: {
                authority: true,
            },
        });
        console.dir(users, { depth: null });
        res.json(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).send('Internal Server Error');
    }
};

// Route definition using the async function
app.get('/users', getUsers);

// Start the server
app.listen(port, () => console.log(`Example app listening on port ${port}!`));
