import mongoose from 'mongoose'

const { Schema, model } = mongoose

const AuthorSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
        },
        surname: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
        },
        dateOfBirth: {
            type: String,
            required: true,
        },
        avatar: {
            type: String,
            default: `https://ui-avatars.com/api/?name=John+Doe`,
        },
    },
    {
        timestamps: true
    }
)

export default model('Author', AuthorSchema)