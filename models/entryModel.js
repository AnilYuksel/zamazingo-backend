import mongoose from "mongoose";
const Schema = mongoose.Schema;

const entrySchema = mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    image: {
        type: String
    },
    date: {
        type: Date,
        default: Date.now
    },
    creatorId: {
        type: String,
        required: true
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'Users'
    },
    comments: {
        type: [String],
        default: []
    }
})

const Entry = mongoose.model('entry', entrySchema)

export default Entry