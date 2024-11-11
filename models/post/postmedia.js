const mongoose = require('mongoose');
const post = require('./post');

const postmediaschema  = mongoose.Schema({
    Post:{
        type: mongoose.Schema.ObjectId,
        ref: 'post',
    },
    media:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'media',
    },
    Community:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'community',
    },
});

const postmedia = mongoose.model('postmedia', postmediaschema);

module.exports = postmedia;