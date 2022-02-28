import mongoose from "mongoose"
import Entry from "../models/entryModel.js"
import User from "../models/userModel.js"


const getEntries = async (req, res, next) => {
    try {
        const entry = await Entry.find().populate({ path: "author", model: User }).sort({ $natural: -1 })
        res.status(200).json(entry)
    } catch (error) {
        res.status(404).json({ message: "error.message" })
    }
}

const getEntryById = async (req, res, next) => {
    const { id } = req.params
    try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            res.status(404).json({ message: "Id is not valid" })
        }
        const entry = await Entry.findById(id)

        if (!entry) { return }

        res.status(200).json(entry)

    } catch (error) {
        res.status(404).json({ message: "Entry not found" })
    }
}


const postEntry = async (req, res, next) => {
    try {
        const entry = req.body
        const createdEntry = await Entry.create({
            ...entry,
            creatorId: req.creatorId,
            author: req.creatorId
        })
        res.status(201).json(createdEntry)
    } catch (error) {
        res.json({ message: "Create Memory Failed" })
    }
}

const putEntry = async (req, res, next) => {
    const { id } = req.params
    try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            res.status(404).json({ message: "Id is not valid" })
        }

        const oldEntry = await Entry.findById(id)
        if (req.creatorId !== oldEntry.creatorId) return res.status(403)

        const { title, content, creater, image } = req.body
        const updatedEntry = await Entry.findByIdAndUpdate(id, { title, content, creater, image, _id: id }, { new: true })

        res.status(200).json(updatedEntry)

    } catch (error) {
        res.json({ message: "Post cannot be updated" })
    }
}

const deleteEntry = async (req, res, next) => {
    const { id } = req.params
    try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            res.status(404).json({ message: "Id is not valid" })
        }

        const oldEntry = await Entry.findById(id)
        if (req.creatorId !== oldEntry.creatorId) return res.status(403)

        await Entry.findByIdAndDelete(id)
        res.json({ message: "Entry deleted succesfully" })

    } catch (error) {
        res.json({ message: "Post cannot be deleted" })
    }
}

const createComment = async (req, res) => {
    try {
        const { id } = req.params
        const { comment } = req.body

        const entry = await Entry.findById(id)

        await entry.comments.push(comment)

        await entry.save()

        const entryWithComment = await Entry.findByIdAndUpdate(id, comment, { new: true })

        res.status(200).json(entryWithComment)

    } catch (error) {
        res.json({ message: "Comment can't be created" })
    }



}


export default { getEntries, getEntryById, postEntry, putEntry, deleteEntry, createComment }