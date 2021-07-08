import mongoose from 'mongoose'

const { Schema, model } = mongoose

const PostSchema = new Schema(
    {
        category: {
            type: String,
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        cover: {
            type: String,
        },
        readTime: {
            value: {
                type: Number,
            },
            unit: {
                type: String,
            },
        },
        author: [{
            type: Schema.Types.ObjectId,
            required: true,
            ref: "Author"
        }],
        // {  ======= OLD CONFIG OF AUTHOR ====== 
        //     name: {
        //         type: String,
        //         required: true,
        //     },
        //     avatar: {
        //         type: String,
        //     },
        // },
        content: {
            type: String,
            required: true,
        },
        comments: [
            {
                comment: String,
                rate: {
                    type: Number,
                    min: 1,
                    max: 5,
                    default: 1,
                }
            }
        ]
    },
    {
        timestamps: true,
    }
)

PostSchema.static('findPostsWithAuthors', async function (query) {
    const total = await this.countDocuments(query.criteria)
    const posts = await this.find(query.criteria, query.options.fields)
        .skip(query.options.skip)
        .limit(query.options.limit)
        .sort(query.options.sort)
        .populate("author", { _id: 0, name: 1, avatar: 1})

    return { total, posts }
})

export default model("Post", PostSchema)