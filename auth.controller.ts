import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from './models/user.model'; // Assume you have a User model

const app = express();
app.use(express.json());

// Mock database
const users: User[] = [];

// 1. User Registration
app.post('/api/register', async (req: Request, res: Response) => {
    try {
        const { email, name, password, user_type_id } = req.body;

        // Validate input
        if (!email || !name || !password || user_type_id === undefined) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Check if user already exists
        if (users.some(user => user.email === email)) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = {
            id: users.length + 1,
            email,
            name,
            password: hashedPassword,
            user_type_id
        };

        users.push(newUser);

        // Generate JWT
        const token = jwt.sign(
            { id: newUser.id, user_type_id: newUser.user_type_id },
            process.env.JWT_SECRET!,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        res.status(201).json({ token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

// 2. User Login
app.post('/api/login', async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = users.find(u => u.email === email);
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate JWT
        const token = jwt.sign(
            { id: user.id, user_type_id: user.user_type_id },
            process.env.JWT_SECRET!,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        res.json({ token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// 3. JWT Verification Middleware
export const verifyUserToken = (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: number; user_type_id: number };
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid token' });
    }
};

// 4. Role-Based Authorization Middleware
export const isUser = (req: Request, res: Response, next: NextFunction) => {
    if (req.user?.user_type_id !== 0) {
        return res.status(403).json({ error: 'Access denied. User role required' });
    }
    next();
};

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
    if (req.user?.user_type_id !== 1) {
        return res.status(403).json({ error: 'Access denied. Admin role required' });
    }
    next();
};

// Protected route examples
app.get('/api/user-dashboard', verifyUserToken, isUser, (req, res) => {
    res.json({ message: 'Welcome to user dashboard' });
});

app.get('/api/admin-dashboard', verifyUserToken, isAdmin, (req, res) => {
    res.json({ message: 'Welcome to admin dashboard' });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});