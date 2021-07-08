import express from 'express'
import PostModel from './schema.js'
import createError from 'http-errors'

const blogPostsRouter = express.Router()

// ===============  CREATES NEW BLOG POST =======================
blogPostsRouter.post('/', async (req, res, next) => {
    try {
        const newPost = new PostModel(req.body)
        const { _id } = await newPost.save()

        res.status(201).send({ _id })

    } catch (error) {
        if(error.name === "validationError") {
            next(createError(400, error))
        } else {
            console.log(error)
            next(createError(500, "An Error ocurred while creating a new post"))
        }
    }
})

// ===============  RETURNS BLOG POST LIST =======================
blogPostsRouter.get('/', async (req, res, next) => {
    try {
        const posts = await PostModel.find()
        res.send(posts)
    } catch (error) {
        next(createError(500, "An Error ocurred while getting the list of posts"))
    }
})

// ===============  RETURNS SINGLE BLOG POST =======================
blogPostsRouter.get('/:postId', async (req, res, next) => {
    try {
        const postId = req.params.postId
        const post = await PostModel.findById(postId)

        if(post) {
            res.send(post)
        } else {
            next(createError(404, `Post with _id ${postId} Not Found!`))
        }
    } catch (error) {
        next(createError(500, "An Error ocurred while getting the post"))
    }
})

// ===============  UPDATES A BLOG POST =======================
blogPostsRouter.put('/:postId', async (req, res, next) => {
    try {
        const postId = req.params.postId
        const modifiedPost = await PostModel.findByIdAndUpdate(postId, req.body, {
            new: true,
            runValidators: true,
        } )

        if(modifiedPost) {
            res.send(modifiedPost)
        } else {
            next(createError(404, `Post with _id ${postId} Not Found!`))
        }
    } catch (error) {
        next(createError(500, `An Error ocurred while updating the post ${req.params.postId}`))
    }
})

// ===============  DELETES A BLOG POST =======================
blogPostsRouter.delete('/:postId', async (req, res, next) => {
    try {
        const postId = req.params.postId
        const deletedPost = await PostModel.findByIdAndDelete(postId)

        if (deletedPost) {
            res.status(204).send()
        } else {
            next(createError(404, `Post with _id ${postId} Not Found!`))
        }
    } catch (error) {
        next(createError(500, `An Error ocurred while deleting the post ${req.params.postId}`))
    }
})

// =============================================================
// =============================================================

// =========  CREATES A NEW COMMENT ON A BLOG POST =============

blogPostsRouter.post('/:postId', async (req, res, next) => {
    try {
        const commentToInsert = {...req.body, createdAt: new Date(), updatedAt: new Date()}

        const postId = req.params.postId
        const updatedPost = await PostModel.findByIdAndUpdate(postId, { $push: {comments: commentToInsert}}, { new: true, runValidators: true })

        if(updatedPost) {
            res.send(updatedPost)
        } else {
            next(createError(404, `Post with _id ${postId} Not Found!`))
        }
    } catch (error) {
        if(error.name === "validationError") {
            next(createError(400, error))
        } else {
        next(createError(500, `An Error ocurred while creating a comment on post ID: ${req.params.postId}`))
        }
    }
})

// =========  RETRIEVES A LIST OF COMMENTS FROM A BLOG POST =============

blogPostsRouter.get('/:postId/comments', async (req, res, next) => {
    try {
        const postId = req.params.postId
        const post = await PostModel.findById(postId)

        if (post) {
            res.send(post.comments)
        } else {
            next(createError(404, `Post with _id ${postId} Not Found!`))
        }
    } catch (error) {
        next(createError(500, "An Error ocurred while getting the list of comments"))
    }
})

// =========  RETRIEVES A SINGLE COMMENT FROM A BLOG POST =============

blogPostsRouter.get('/:postId/comments/:commentId', async (req, res, next) => {
    try {
        const postId = req.params.postId
        const commentId = req.params.commentId
        const postComment = await PostModel.findById(postId, { comments: { $elemMatch: { _id: commentId}}})
        
        if (postComment) {
            if (postComment.comments.length > 0) {
                res.send(postComment.comments[0])
            } else {
                next(createError(404, `Comment with _id ${commentId} Not Found!`))
            }

        } else {
            next(createError(404, `Post with _id ${postId} Not Found!`))
        }
    } catch (error) {
        next(createError(500, `An Error ocurred while getting comment with ID: ${req.params.commentId}`))
    }
})

// =========  DELETES A COMMENT FROM A BLOG POST =============

blogPostsRouter.delete('/:postId/comments/:commentId', async (req, res, next) => {
    try {
        const postId = req.params.postId
        const commentId = req.params.commentId
        const post = await PostModel.findByIdAndUpdate(postId, { $pull: { comments: {_id: commentId}}}, { new: true })

        if (post) {
            res.send(post)
        } else {
            next(createError(404, `Post with _id ${postId} Not Found!`))
        }
    } catch (error) {
        next(createError(500, `An Error ocurred while deleting comment with ID: ${req.params.commentId}`))
    }
})

// =========  UPDATES A COMMENT ON A BLOG POST =============

blogPostsRouter.put('/:postId/comments/:commentId', async (req, res, next) => {
    try {
        const postId = req.params.postId
        const commentId = req.params.commentId

        const post = await PostModel.findOneAndUpdate( 
            { _id: postId , "comments._id": commentId, }, 
            { $set: { "comments.$": req.body, }}, 
            { new: true, runValidators: true, }
        )
        if (post) {
            res.send(post)
        } else {
            next(createError(404, `Post with _id ${postId} Not Found!`))
        }
    } catch (error) {
        next(createError(500, `An Error ocurred while updating comment with ID: ${req.params.commentId}`))
    }
})
export default blogPostsRouter