'use client';
import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import { Vortex } from "../components/ui/vortex"; 
import { motion } from "framer-motion";
import { FiCheckCircle } from "react-icons/fi";
import { FaTrash } from "react-icons/fa"; 
import "react-toastify/dist/ReactToastify.css";

export default function Home() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [newTime, setNewTime] = useState("");

  useEffect(() => {
    const savedTasks = JSON.parse(localStorage.getItem("tasks") || "[]");
    const today = new Date().toDateString();
    if (savedTasks.date !== today) {
      resetTasks();
    } else {
      setTasks(savedTasks.tasks || []);
    }

    const resetAtMidnight = () => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0);
      const timeUntilMidnight = midnight - now;
      setTimeout(() => resetTasks(), timeUntilMidnight);
    };

    resetAtMidnight();
  }, []);

  const resetTasks = () => {
    setTasks((prevTasks) =>
      prevTasks.map((task) => ({ ...task, completed: false }))
    );
    localStorage.setItem(
      "tasks",
      JSON.stringify({ date: new Date().toDateString(), tasks: [] })
    );
  };

  useEffect(() => {
    localStorage.setItem(
      "tasks",
      JSON.stringify({ date: new Date().toDateString(), tasks })
    );
  }, [tasks]);

  const addTask = () => {
    if (newTask && newTime) {
      const id = new Date().getTime();
      const task = { id, name: newTask, time: newTime, completed: false };
      setTasks((prev) => [...prev, task]);
      setNewTask("");
      setNewTime("");
      scheduleNotification(task);
    } else {
      toast.error("Please provide task details and time.");
    }
  };

  const completeTask = (id) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, completed: true } : task
      )
    );
    toast.success(`Task marked as done!`);
  };

  const deleteTask = (id) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
    toast.info("Task deleted.");
  };

  const scheduleNotification = (task) => {
    const now = new Date();
    const [hours, minutes] = task.time.split(":").map(Number);
    const notificationTime = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      hours,
      minutes,
      0
    );

    if (notificationTime > now) {
      const timeout = notificationTime - now;
      setTimeout(() => {
        if (Notification.permission === "granted") {
          new Notification(`Reminder: ${task.name}`);
        }
      }, timeout);
    }
  };

  useEffect(() => {
    if (Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  return (
    <div className="h-screen w-full overflow-hidden bg-gradient-to-b from-black to-gray-800">
      <Vortex
        backgroundColor="black"
        rangeY={800}
        particleCount={500}
        baseHue={120}
        className="h-full w-full flex flex-col items-center justify-start pt-10"
      >
        <div className="max-w-3xl text-center z-10 px-4 mt-5">
          <motion.h1
            className="text-4xl font-bold mb-2 text-white"
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1 }}
          >
            🌟 To-Do List 🌟
          </motion.h1>
          <p className="text-lg mb-5 text-gray-300">
            Plan your day and never miss a task!
          </p>
        </div>

        <motion.div
          className="max-w-xl mx-auto bg-white rounded-lg shadow-lg p-6 text-black z-10 w-[90%] md:w-[80%]"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-4">
            <input
              type="text"
              placeholder="Task name"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              className="w-full p-2 rounded-lg border border-gray-300 mb-2"
            />
            <input
              type="time"
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
              className="w-full p-2 rounded-lg border border-gray-300"
            />
          </div>
          <button
            onClick={addTask}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition"
          >
            Add Task
          </button>
        </motion.div>

        <motion.div
          className="flex-grow overflow-y-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8 z-10 w-[80%]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 1 }}
        >
          {tasks.map((task) => (
            <motion.div
              key={task.id}
              className={`p-5 rounded-lg shadow-lg bg-white text-black flex flex-col justify-between ${
                task.completed ? "bg-green-200" : ""
              } transition-all transform hover:scale-105 hover:shadow-xl`}
              whileHover={{ scale: 1.05 }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {task.completed && (
                    <FiCheckCircle className="text-green-600" />
                  )}
                  <span className="font-medium">{task.name}</span>
                </div>
                <button
                  onClick={() => deleteTask(task.id)}
                  className="h-8 w-8 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center transition"
                >
                  <FaTrash className="text-white text-lg" />
                </button>
              </div>
              <div className="flex gap-4 mt-4">
                {!task.completed && (
                  <button
                    onClick={() => completeTask(task.id)}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition"
                  >
                    Mark as Done
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </Vortex>
      <ToastContainer />
    </div>
  );
}
