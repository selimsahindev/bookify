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
        res.redirect(`books/${newBook.id}`);
    } catch (e) {
        renderNewPage(res, book, e.message);
    }
});

// Show Book Route
router.get('/:id', async (req, res) => {
    try {
        const book = await Book.findById(req.params.id)
            .populate('author')
            .exec();
        res.render('books/show', { book: book });
    } catch {
        res.redirect('/');
    }
});

// Edit Book Route
router.get('/:id/edit', async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        renderEditPage(res, book);
    } catch {
        res.redirect('/');
    }
});

// Update Book Route
router.put('/:id', async (req, res) => {
    let book;

    try {
        book = await Book.findById(req.params.id);

        book.title = req.body.title;
        book.author = req.body.author;
        book.publishDate = new Date(req.body.publishDate);
        book.pageCount = req.body.pageCount;
        book.description = req.body.description;

        if (req.body.cover != null && req.body.cover !== '') {
            saveCover(book, req.body.cover);
        }

        await book.save();
        res.redirect(`/books/${book.id}`);
    } catch (e) {
        if (book != null) {
            renderEditPage(res, book, e.message);
        } else {
            redirect('/');
        }
    }
});

// Delete Book Route
router.delete('/:id', async (req, res) => {
    let book;

    try {
        book = await Book.findById(req.params.id);
        await book.remove();
        res.redirect('/books');
    } catch {
        if (book != null) {
            res.render('books/show', {
                book: book,
                errorMessage: 'Could not remove the book.',
            });
        } else {
            res.redirect('/');
        }
    }
});

async function renderNewPage(res, book, errorMessage = null) {
    renderFormPage(res, book, 'new', errorMessage);
}

async function renderEditPage(res, book, errorMessage = null) {
    renderFormPage(res, book, 'edit', errorMessage);
}

async function renderFormPage(res, book, form, errorMessage = null) {
    try {
        const authors = await Author.find();
        const params = {
            authors: authors,
            book: book,
        };

        if (errorMessage) {
            params.errorMessage = errorMessage;
        }

        res.render(`books/${form}`, params);
    } catch (e) {
        res.redirect('/books');
    }
}

function saveCover(book, coverEncoded) {
    if (coverEncoded == null) {
        return;
    }

    const cover = JSON.parse(coverEncoded);

    if (cover != null && imageMimeTypes.includes(cover.type)) {
        book.coverImage = new Buffer.from(cover.data, 'base64');
        book.coverImageType = cover.type;
        console.log('properties added to book object');
    }
}

module.exports = router;
