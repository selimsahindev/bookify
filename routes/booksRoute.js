const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Book = require('../models/bookModel');
const Author = require('../models/authorModel');

const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];
const uploadPath = path.join('public', Book.coverImageBasePath);

// Configure Multer.
const upload = multer({
    dest: uploadPath,
    fileFilter: (req, file, callback) => {
        callback(null, imageMimeTypes.includes(file.mimetype));
    },
});

// All Books Route
router.get('/', async (req, res) => {
    let query = Book.find();

    if (req.query.title != null && req.query.title !== '') {
        query = query.regex('title', new RegExp(req.query.title, 'i'));
    }
    if (req.query.publishedBefore != null && req.query.publishedBefore !== '') {
        query = query.lte('publishDate', req.query.publishedBefore);
    }
    if (req.query.publishedAfter != null && req.query.publishedAfter !== '') {
        query = query.gte('publishDate', req.query.publishedAfter);
    }

    try {
        const books = await query.exec();
        res.render('books/index', {
            books: books,
            searchOptions: req.query,
        });
    } catch (e) {
        console.error(e);
        res.redirect('/');
    }
});

// New Book Route
router.get('/new', async (req, res) => {
    renderNewPage(res, new Book());
});

// Create Book Route
router.post('/', upload.single('cover'), async (req, res) => {
    const fileName = req.file != null ? req.file.filename : null;
    console.log(fileName);
    const book = new Book({
        title: req.body.title,
        author: req.body.author,
        publishDate: new Date(req.body.publishDate),
        pageCount: req.body.pageCount,
        coverImageName: fileName,
        description: req.body.description,
    });

    try {
        const newBook = await book.save();
        // res.redirect(`books/${newBook.id}`);
        res.redirect(`books`);
    } catch (e) {
        if (book.coverImageName != null) {
            removeBookCover(book.coverImageName);
        }
        renderNewPage(res, book, e.message);
    }
});

function removeBookCover(fileName) {
    fs.unlink(path.join(uploadPath, fileName), (err) => {
        if (err) {
            console.error(err);
        }
    });
}

async function renderNewPage(res, book, errorMessage = null) {
    try {
        const authors = await Author.find();
        const params = {
            authors: authors,
            book: book,
        };

        if (errorMessage) {
            params.errorMessage = errorMessage;
        }

        res.render('books/new', params);
    } catch (e) {
        res.redirect('/books');
    }
}

module.exports = router;
