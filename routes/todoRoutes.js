const mongoose = require("mongoose");
const express = require("express");
const routes = express.Router();
const Todo = require("../model/TodoSchema");
const auth = require("../middlewares/auth");
const Joi = require("@hapi/joi");
const postApiParamsSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().required(),
  isCompleted: Joi.bool()
});

//  @route GET api/vi/todo/get-tasks
// desc get todo from database
// access Private

routes.get("/get-tasks", auth, async (req, res) => {
  try {
    const tasks = await Todo.find({ createdBy: req.user.id }).populate(
      "createdBy",
      { password: 0 }
    );

    if (tasks.length < 1) {
      return res.json({
        success: true,
        message: "You do not have created any task yet"
      });
    }

    return res.json({
      success: true,
      tasks
    });
  } catch (error) {
    console.log("Error: ", error.message);
    res.status(500).json({
      message: "Internal server error",
      success: false,
      error: error.message
    });
  }
});

// @Post api/v1/todo/create-tasks
// @desc create task
// @access private

routes.post("/create-tasks", auth, async (req, res) => {
  // Checking the Error
  const { title, description, isCompleted } = req.body;
  const { error } = postApiParamsSchema.validate({
    title,
    description,
    isCompleted
  });

  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }

  try {
    // create task
    let task = await new Todo({
      title,
      description,
      isCompleted,
      createdBy: req.user.id,
      isCompleted: isCompleted ? isCompleted : false
    });

    // saving task to database
    await task.save();

    // populate created task
    task = await task.populate("createdBy", { password: 0 }).execPopulate();

    return res.json({
      success: true,
      message: "Task created successfully",
      task
    });
  } catch (error) {
    console.log("Error: ", error.message);
    res.status(500).send({
      message: "Internal server error",
      success: false,
      error: error.message
    });
  }
});

// @route api/v1/todo/update-task/:id
// @desc update task
// @access private

const putApiParamsSchema = Joi.object({
  title: Joi.string(),
  description: Joi.string(),
  isCompleted: Joi.bool()
});

routes.put("/update-task/:id", auth, async (req, res) => {
  const { title, description, isCompleted } = req.body;
  const isValidId = mongoose.Types.ObjectId.isValid(req.params.id);

  // checking todo id
  if (!isValidId) {
    return res.status(400).json({
      success: false,
      message: "Invalid todo id"
    });
  }

  // checking typo in returning body
  const { error } = putApiParamsSchema.validate({
    title,
    description,
    isCompleted
  });

  // checking allowed params
  const updates = Object.keys(req.body);
  const allowdUpdates = ["title", "description", "isCompleted"];
  const isValidOperations = updates.every(update =>
    updates.includes(allowdUpdates)
  );

  if (!isValidOperations) {
    return res.status(400).json({
      success: false,
      message: "Invalid API parameters"
    });
  }

  // when no object is being given to be updated
  if (Object.keys(req.body) < 1) {
    return res.status(400).json({
      success: false,
      message: "Nothing to given to be Updated"
    });
  }

  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }

  // task id
  const _id = req.params.id;
  try {
    // finding task and update
    const taskToUpdate = await Todo.findByIdAndUpdate({ _id }, req.body, {
      new: true
    });

    // sending the response
    res.json({
      success: true,
      message: "Task has been Updated",
      taskToUpdate
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// @route api/v1/todo/delete-task/:id
// @desc delete task
// @access private

routes.delete("/delete-task/:id", auth, async (req, res) => {
  // regular expression of id check!
  const isValidId = mongoose.Types.ObjectId.isValid(req.params.id);
  if (!isValidId) {
    return res.status(400).json({
      success: false,
      message: "Invalid Todo ID"
    });
  }

  // task id
  const _id = req.params.id;
  try {
    // finding task and delete
    const taskToDelete = await Todo.findByIdAndDelete({ _id });
    console.log(taskToDelete);
    if (!taskToDelete) {
      return res.status(400).json({
        success: false,
        message: "No Task found against the given Task ID"
      });
    }

    // sending the response
    return res.json({
      success: true,
      message: "Task has been Deleted",
      taskToDelete
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

module.exports = routes;
