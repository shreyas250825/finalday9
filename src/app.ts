import 'reflect-metadata';
import express from 'express';
import { plainToClass } from 'class-transformer';
import { BookDTO } from './book.dto';

const app = express();

// Middleware to force JSON parsing and responses
app.use(express.json()); // This is crucial for POST requests
app.use((req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    next();
});

// POST /books endpoint
app.post('/books', (req, res) => {
    try {
        if (!req.body) {
            throw new Error('No request body received');
        }
        
        const bookDTO = plainToClass(BookDTO, req.body, { 
            excludeExtraneousValues: true 
        });
        
        console.log('Received BookDTO:', bookDTO);
        res.status(201).json(bookDTO);
    } catch (error) {
        res.status(400).json({
            error: (error instanceof Error ? error.message : String(error)),
            details: 'Make sure you sent valid JSON with required fields'
        });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});