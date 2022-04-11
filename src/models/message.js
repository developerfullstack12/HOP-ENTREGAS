const Mongoose = require('mongoose');

const schema = new Mongoose.Schema({
    message: {
        type: String,
        maxLength: 60,
        required: true
    },
    sender_id: {
        type: String,
        maxLength: 70,
        required: true
    },
    receiver_id: {
        type: String,
        required: false
    },
    image: {
        type: String,
        required: false
    },
    status: {
        type: Number,
        isIn: [1,2,3],
        defaultsTo: 1
    },
    is_read: {
        type: Number,
        isIn: [0, 1],
        defaultsTo: 1
    }
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    }
});

module.exports = Mongoose.model('Message', schema);
