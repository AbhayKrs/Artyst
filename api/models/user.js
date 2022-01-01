import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    name: {
        type: String,
        default: "",
        required: true
    },
    email: {
        type: String,
        default: '',
        required: true
    },
    username: {
        type: String,
        default: '',
        required: true
    },
    password: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now,
    },
    artworks: [{
        filename: {
            type: String,
            default: 'none',
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        author: {
            id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
            username: {
                type: String,
            },
        },
        description: {
            type: String,
            required: true,
        },
        avatar: {
            type: String,
        },
        comments: [{
            content: {
                type: String,
            },
            author: {
                id: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User',
                },
                username: {
                    type: String
                }
            },
            likes: [{
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                default: ''
            }],
            createdAt: { type: Date },
            updatedAt: { type: Date }
        }],
        likes: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }],
        like_status: {
            type: Boolean
        },
        comment_count: {
            type: Number,
            default: 0
        },
        tags: [{
            type: String
        }]
    }],
    artwork_count: {
        type: Number,
        default: 0
    },
    cart: [{
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Cart'
        },
        title: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
            default: 0
        },
        quantity: {
            type: Number,
            default: 0
        },
        subtotal: {
            type: Number,
            default: 0
        },
        seller: {
            id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
            username: {
                type: String,
            }
        },
    }],
    cart_count: {
        type: Number,
        default: 0
    },
});

const User = mongoose.model("User", UserSchema);
export default User;