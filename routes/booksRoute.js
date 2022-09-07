const express = require('express');
const router = express.Router();
const Book = require('../models/bookModel');
const Author = require('../models/authorModel');
const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];

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
router.post('/', async (req, res) => {
    const book = new Book({
        title: req.body.title,
        author: req.body.author,
        publishDate: new Date(req.body.publishDate),
        pageCount: req.body.pageCount,
        description: req.body.description,
    });

    saveCover(book, req.body.cover);

    try {
        const newBook = await book.save();
        // res.redirect(`books/${newBook.id}`);
        res.redirect(`books`);
    } catch (e) {
        renderNewPage(res, book, e.message);
    }
});

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

function saveCover(book, coverEncoded) {
    console.log('saveCover check 1');
    if (coverEncoded == null) {
        return;
    }
    console.log('saveCover check 2');

    const cover = JSON.parse(coverEncoded);

    if (cover != null && imageMimeTypes.includes(cover.type)) {
        book.coverImage = new Buffer.from(cover.data, 'base64');
        book.coverImageType = cover.type;
        console.log('properties added to book object');
    }
    console.log('saveCover check 3');
}

module.exports = router;
