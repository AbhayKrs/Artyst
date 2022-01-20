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
    avatar: {
        icon: String,
        category: String
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
    store: [{
        title: {
            type: String,
            required: true,
        },
        item: {
            type: String,
            default: 'none',
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        seller: {
            id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
            username: {
                type: String,
            },
            avatar: {
                type: String,
            },
            isSeller: {
                type: Boolean
            },
            seller_rating: {
                type: Number,
                default: 0,
                minimum: 0,
                maximum: 5
            }
        },
        price: {
            type: Number,
            default: 0
        },
        rating: {
            type: Number,
            default: 0
        },
        createdAt: { type: Date },
        updatedAt: { type: Date }
    }],
    store_count: {
        type: Number,
        default: 0
    }
});

const User = mongoose.model("User", UserSchema);
export default User;