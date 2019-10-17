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

routes.put("/update-task/:id", auth, async (req, res) => {
  // task id
  const _id = req.params.id;
  try {
    // finding task and update
    const taskToUpdate = await Todo.findByIdAndUpdate({ _id }, req.body);
    await taskToUpdate.save();

    // cross checking the updated task
    const UpdatedTask = await Todo.find({ _id });

    // sending the response
    res.json({
      success: true,
      message: "Task has been updated",
      UpdatedTask
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
  // task id
  const _id = req.params.id;
  try {
    // finding task and delete
    const taskToDelete = await Todo.findByIdAndDelete({ _id }, req.body);
    await taskToDelete.save();

    // cross checking has the task deleted
    const DeletedTask = await Todo.find({ _id });

    // sending the response
    res.json({
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
