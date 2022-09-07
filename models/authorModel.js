const mongoose = require('mongoose');
const Book = require('./bookModel');

const authorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
});

authorSchema.pre('remove', function (next) {
    Book.find({ author: this.id }, (err, books) => {
        if (err) {
            next(err);
        } else if (books.length > 0) {
            next(
                new Error(
                    'There are books assigned to this author. The author could not be deleted.'
                )
            );
        } else {
            next();
        }
    });
});

module.exports = mongoose.model('Author', authorSchema);
