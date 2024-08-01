import express from 'express';
import mongoose from 'mongoose';
const router = express.Router();

//Middleware
import { protect, admin } from '../middleware/authMw.js';
import { checkObjectId } from '../middleware/checkObjectId.js';

//Importing gfs database
import multer from 'multer';
import Grid from 'gridfs-stream';
import { GridFsStorage } from 'multer-gridfs-storage';
import crypto from 'crypto';
import path from 'path';

import User from '../models/user.js';
import Artworks from '../models/artwork.js';
import Shared from '../models/shared.js';
import Cart from '../models/cart.js';
const { Artwork, Comment } = Artworks;
const { Tag, Sticker, Avatar, Location } = Shared;

import jwt from 'jsonwebtoken';

//Connect gfs to database
const conn = mongoose.connection;
let gfs;

conn.once('open', () => {
    gfs = Grid(conn.db, mongoose.mongo);
    gfs.collection('shareduploads');
});

//Storage for image uploaded
const storage = new GridFsStorage({
    url: process.env.MONGO_URI,
    file: (req, file) => {
        return new Promise((resolve, reject) => {
            crypto.randomBytes(16, (err, buf) => {
                if (err) {
                    return reject(err);
                }
                const filename =
                    buf.toString('hex') + path.extname(file.originalname);
                const fileInfo = {
                    filename: filename,
                    bucketName: 'shareduploads',
                };
                resolve(fileInfo);
            });
        });
    },
});
const upload = multer({ storage });

// @desc    Get all tags
// @route   GET /api/v1.01/users/tags
// @access  Public
router.get("/tags", async (req, res) => {
    try {
        const tags = await Tag.find({});
        res.json(tags);
    } catch (err) {
        return res.status(404).json({ msg: err.name });
    }
});

// @desc    Get all tags
// @route   GET /api/v1.01/users/commonImages
// @access  Public
// router.get("/commonImages", async (req, res) => {
//     try {
//         const shared = await Shared.findOne({});
//         res.json(shared.images);
//     } catch (err) {
//         return res.status(404).json({ msg: err.name });
//     }
// });

// @desc    Get all tags
// @route   GET /api/v1.01/users/assets/
// @access  Public
router.get('/avatars', async (req, res) => {
    try {
        const avatars = await Avatar.find({});
        res.json(avatars);
    } catch (err) {
        return res.status(404).json({ msg: err.name });
    }
});

// @desc    Get all awards
// @route   GET /api/v1.01/users/awards/
// @access  Public
// router.get('/awards', async (req, res) => {
//     try {
//         const shared = await Shared.findOne();
//         res.json(shared.awards);
//     } catch (err) {
//         return res.status(404).json({ msg: err.name });
//     }
// });

// @desc    Get locations
// @route   GET /api/v1.01/users/locations/
// @access  Public
router.get('/locations', async (req, res) => {
    try {
        const locations = await Location.findOne();
        res.json(locations);
    } catch (err) {
        return res.status(404).json({ msg: err.name });
    }
})

// @route   Image Route
// @desc    Image from gridFS storage - /api/users/image/:filename
// @access  Private
router.get('/image/:filename', (req, res) => {
    try {
        gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
            // Check if file
            if (!file || file.length === 0) {
                return res.status(404).json({ err: 'No file exists' });
            }
            // Check if image
            if (
                file.contentType === 'image/jpg' ||
                file.contentType === 'image/jpeg' ||
                file.contentType === 'image/png'
            ) {
                // Read output to browser
                const readstream = gfs.createReadStream({
                    filename: req.params.filename,
                });
                readstream.pipe(res);
            } else {
                res.status(404).json({ err: 'Not an image' });
            }
        });
    } catch (err) {
        console.error(err.message);
        return res.status(500).send('Unable to fetch image');
    }
});

// @desc    Get all tags
// @route   GET /api/v1.01/users/assets/new
// @access  Public
router.post('/assets/new', upload.any(), async (req, res) => {
    try {
        console.log("test", req.files.length);
        req.files.map(file => {
            // // Add awards
            // const award_asset = {
            //     icon: file.filename,
            //     title: ''
            // }
            // shared.awards.push(award_asset);
            // shared.save();

            // Add avatars
            const newAvatar = new Avatar({
                icon: file.filename,
                identity: 'Female'
            });
            Avatar.create(newAvatar, (err, data) => {
                if (err) {
                    console.log(err);
                } else {
                    res.send(data);
                }
            });

            // // Add login and signup image
            // shared.images.signup = file.filename;
            // shared.save();

            // // Add locations
            // shared.locations = req.body;
            // shared.save();
        });
    } catch (err) {
        console.log("error", err)
        return res.status(404).json({ msg: err.name });
    }
});

// @desc    Get user by ID
// @route   GET /api/v1.01/users/:id
// @access  Private/Admin
router.get('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        const payload = {
            id: user._id,
            name: user.name,
            username: user.username,
            email: user.email,
            bio: user.bio,
            avatar: user.avatar,
            created_on: user.createdAt,
            tokens: user.tokens,
            bookmarks: user.bookmarks,
            followers: user.followers,
            likes: user.likes,
        };
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: 31556926 }, (err, token) => {
            res.json({
                success: true,
                token: "Bearer " + token
            });
        })
    } catch (err) {
        return res.status(404).json({ msg: err.name });
    }
});

// @desc    Update user
// @route   PUT /api/v1.01/users/:id
// @access  Private/Admin
router.put('/:id', async (req, res) => {
    try {
        User.findByIdAndUpdate(req.params.id, {
            name: req.body.name,
            username: req.body.username,
            bio: req.body.bio
        }, function (err, data) {
            if (err) {
                console.log('error:', err);
            } else {
                return res.json(data)
            }
        });

    } catch (err) {
        return res.status(404).json({ msg: err.name });
    }
});

// @desc    Delete user
// @route   DELETE /api/v1.01/users/:id
// @access  Private/Admin
router.delete('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (user) {
            await user.remove();
            res.json({ message: 'User removed' });
        } else {
            res.status(404);
            throw new Error('User not found');
        }
    } catch (err) {
        return res.status(404).json({ msg: err.name });
    }
});

// @route       GET api/users/:id/cart
// @desc        Get all cart items
// @access      Public
router.get('/:id/catalog', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(400).send({ msg: 'User not found' });
        }

        const artworks = await Catalog.find({ "user_id": req.params.id });
        const catalogData = {
            catalog: artworks,
            catalog_count: artworks.length
        }
        res.json(catalogData);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Unable to fetch catalog list');
    }
});

// @route       POST api/users/:id/bookmark
// @desc        Bookmark an explore
// @access      Private
router.post('/:id/bookmark', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(400).send({ msg: 'User not found' });
        }
        const bookmarkData = {
            _id: req.body.id,
            files: req.body.files,
            title: req.body.title,
            author: req.body.author,
            description: req.body.description
        }
        user.bookmarked.push(bookmarkData);
        user.save();
        res.json(bookmarkData);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Bookmark failed!');
    }
})

// @route       POST api/users/:id/bookmark/:bookmark_id
// @desc        Bookmark an explore
// @access      Private
router.delete('/:id/bookmark/:bookmark_id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        const bookmark_toDelete = await user.bookmarked.find(bookmark => bookmark._id === req.params.bookmark_id);
        if (!bookmark_toDelete) {
            return res.status(400).send({ msg: 'Bookmark does not exist!' });
        }
        user.bookmarked = user.bookmarked.filter(bookmark => bookmark._id !== bookmark_toDelete._id);
        await user.save();
        res.json(user.bookmarked);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Bookmark failed!');
    }
})

// @route       GET api/users/:id/cart
// @desc        Get all cart items
// @access      Public
router.get('/:id/store', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user.store) {
            return res.status(400).send({ msg: 'Storelist not found' });
        }
        const storeData = {
            store: user.store,
            store_count: user.store_count
        }
        res.json(storeData);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Unable to fetch store items');
    }
});

// ******************** CART CALLS *****************************
// *************************************************************

// @route       GET api/users/:id/cart
// @desc        Get all cart items
// @access      Public
router.get('/:id/cart', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user.cart) {
            return res.status(400).send({ msg: 'Cartlist not found' });
        }
        const cartData = {
            cart: user.cart,
            cart_count: user.cart_count
        }
        res.json(cartData);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Unable to fetch cart items');
    }
});

// @route       POST api/users/:id/cart/add
// @desc        Add to cart
// @access      Public
router.post('/:id/cart/add', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(401).json({ msg: 'User not authorized!' })
        }
        const newCartItem = new Cart({
            title: req.body.title,
            file: req.body.file,
            category: req.body.category,
            price: req.body.price,
            quantity: req.body.quantity,
            subtotal: req.body.subtotal,
            seller: {
                id: user.id,
                username: user.username
            }
        });
        Cart.create(newCartItem, (err, cartItem) => {
            if (err) {
                console.log(err);
            } else {
                cartItem.save();
                user.cart.push(cartItem);
                user.cart_count = user.cart.length;
                user.save();
                res.json(cartItem);
            }
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Adding to cart failed');
    }
});

// @route    PUT api/users/:id/cart/:cart_id
// @desc     Edit a cart item
// @access   Private
router.put('/:id/cart/:cart_id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        const editCartItem = user.cart.find(cartItem => cartItem._id === req.params.cart_id);
        if (!editCartItem) {
            return res.status(401).json({ msg: 'Cart item does not exist!' })
        }
        // // Check user
        // if (explore.author.id !== editComment.author.id) {
        //     return res.status(401).json({ msg: 'User not authorized!' });
        // }
        const newData = { quantity: req.body.quantity, subtotal: req.body.subtotal }
        await Cart.findByIdAndUpdate(
            req.params.cart_id,
            { quantity: newData.quantity, subtotal: newData.subtotal },
            { new: true },
            async (err, cartItem) => {
                if (err) {
                    console.log(err)
                } else {
                    const index = user.cart.findIndex(cartItem => cartItem === editCartItem);
                    user.cart[index] = cartItem;
                    await user.save();
                }
            }
        );
        return res.json(user.cart);
    } catch (err) {
        return res.status(404).json({ msg: err.name });
    }
})

// @route    DELETE api/users/:id/cart/:cart_id
// @desc     Delete a cart item
// @access   Private
router.delete('/:id/cart/:cart_id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        const cartItem = await Cart.findById(req.params.cart_id);
        const deleteCartItem = user.cart.find(cartItem => cartItem._id === req.params.cart_id);
        if (!deleteCartItem) {
            return res.status(404).json({ msg: 'Cart item does not exist!' });
        }
        user.cart = user.cart.filter(cartItem => cartItem._id !== deleteCartItem._id);
        cartItem.deleteOne(deleteCartItem);
        user.cart_count = user.cart.length;
        await user.save();
        return res.json(user.cart);
    } catch (err) {
        console.error(err.message);
        return res.status(500).send('Deleting a cart item failed');
    }
});

// @desc    Logout user
// @route   GET /api/v1.01/users/logout
// @access  Public
router.get("/logout", (req, res, next) => {
    try {
        const { signedCookies = {} } = req;
        const { refreshToken } = signedCookies;
        User.findById(req.user._id).then(
            (user) => {
                const tokenIndex = user.refreshToken.findIndex(
                    (item) => item.refreshToken === refreshToken
                );
                if (tokenIndex !== -1) {
                    user.refreshToken.id(user.refreshToken[tokenIndex]._id).remove();
                }

                user.save((err, user) => {
                    if (err) {
                        res.statusCode = 500;
                        res.send(err);
                    } else {
                        res.clearCookie("refreshToken", COOKIE_OPTIONS);
                        res.send({ success: true });
                    }
                });
            },
            (err) => next(err)
        );
    } catch (err) {
        return res.status(404).json({ msg: err.name });
    }
});

// @route   Edit User Avatar
// @desc    POST /api/v1.01/users/:id/avatar
// @access  Private
router.post('/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        const artwork = await Catalog.find({ "author.id": req.params.id });

        artwork.map(item => {
            item.author.avatar = { ...req.body };
            item.save();
        });
        Catalog.updateMany(
            { 'comments.author.id': req.params.id },
            { $set: { "comments.$[comment].author.avatar": req.body } },
            { arrayFilters: [{ 'comment.author.id': { $in: req.params.id } }] }
        ).then(item => {
            console.log('Success!', item);
        }).catch(err => {
            console.log('Error - ' + err);
        });
        user.avatar = { ...req.body };
        user.save();
        res.json(artwork);
    } catch (err) {
        return res.status(404).json({ msg: err.name });
    }
});

export default router;
