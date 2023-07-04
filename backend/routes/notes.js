const express = require("express");
const Note = require("../models/Notes");
const fetchuser = require("../middleware/fetchuser");
const { body, validationResult } = require("express-validator");
const router = express.Router();

// ROUTE 1  Get all the notes using : GET "/api/notes/getuser"  login require
router.get("/fetchallnotes", fetchuser, async (req, res) => {
  try {
    const notes = await Note.find({ user: req.user.id });
    res.json(notes);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal server error");
  }
});
// ROUTE 2  Add a note using : POST "/api/notes/addnote"  login require
router.post(
  "/addnote",
  fetchuser,
  [
    body("title", "Enter valid title ").isLength({ min: 3 }),
    body("description", "Enter valid description ").isLength({ min: 5 }),
  ],
  async (req, res) => {
    try {
      const { title, description, tag } = req.body;
      // if there are errors , return Bad request and the errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const note = new Note({
        title,
        description,
        tag,
        user: req.user.id,
      });
      const saveNote = await note.save();
      res.json(saveNote);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server error");
    }
  }
);
// ROUTE 3 Update an existing note using : PUT "/api/notes/updatenote"  login require
router.put("/updatenote/:id", fetchuser, async (req, res) => {
  const { title, description, tag } = req.body;
  try {
    // creating new note object
    const newNote = {};
    if (title) {
      newNote.title = title;
    }
    if (description) {
      newNote.description = description;
    }
    if (tag) {
      newNote.tag = tag;
    }

    // find a note to be updated and update it

    let note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).send("Not found");
    }

    if (note.user.toString() !== req.user.id) {
      return res.status(401).send("Not allowed");
    }
    note = await Note.findByIdAndUpdate(
      req.params.id,
      { $set: newNote },
      { new: true }
    );
    res.json({ note });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal server error");
  }
});
// ROUTE 4 Delete an existing note using : DELETE "/api/notes/deletenote"  login require
router.delete("/deletenote/:id", fetchuser, async (req, res) => {
  
  try {
    // find a note to be Deleted and Delete it

    let note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).send("Not found");
    }
    // allow deletion if user owns this note
    if (note.user.toString() !== req.user.id) {
      return res.status(401).send("Not allowed");
    }
    note = await Note.findByIdAndDelete(req.params.id);
    res.json({ "Success ": "Note has been deleted", note: note });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal server error");
  }
});

module.exports = router;
