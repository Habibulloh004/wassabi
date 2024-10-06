"use client";

import { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import "./../app/app.css";
import { Amplify } from "aws-amplify";
import outputs from "@/amplify_outputs.json";
import "@aws-amplify/ui-react/styles.css";

// Configure Amplify with the outputs from the generated configuration
Amplify.configure(outputs);

// Create a client instance using the schema type
const client = generateClient<Schema>();

// Define the Todo type based on the schema
interface Todo {
  id: string;
  content?: string; // The content field can be optional
  createdAt: string;
  updatedAt: string;
}

export default function App() {
  // Use the defined Todo type for the state
  const [todos, setTodos] = useState<Todo[]>([]);

  // Function to list all todos and update the state
  function listTodos() {
    client.models.Todo.observeQuery().subscribe({
      next: (data) => setTodos([...(data.items as Todo[])]),
    });
  }

  // Function to delete a todo by ID
  function deleteTodo(id: string) {
    client.models.Todo.delete({ id });
  }

  // Function to update an existing todo
  async function updateTodo(todo: Todo) {
    const todoContent = window.prompt("Todo content");
    if (!todoContent) return; // Exit if no content is provided

    const updatedTodo = { ...todo, content: todoContent };
    const { data, errors } = await client.models.Todo.update(updatedTodo);
    if (errors) {
      console.error("Update failed", errors);
    } else {
      console.log("Updated", data);
      listTodos(); // Refresh the list after updating
    }
  }

  // Create a new todo item
  function createTodo() {
    const todoContent = window.prompt("Todo content");
    if (!todoContent) return; // Exit if no content is provided

    client.models.Todo.create({ content: todoContent }).then(() => {
      listTodos(); // Refresh the list after creation
    });
  }

  // Initial data fetch when the component mounts
  useEffect(() => {
    listTodos();
  }, []);

  return (
    <main>
      <h1>My Todos</h1>
      <button onClick={createTodo}>+ New</button>
      <ul>
        {todos.map((todo) => (
          <li key={todo.id}>
            {todo.content || "No content"}{" "}
            {/* Fallback for todos with missing content */}
            <button onClick={() => updateTodo(todo)}>Update</button>
            <button onClick={() => deleteTodo(todo.id)}>Delete</button>
          </li>
        ))}
      </ul>
      <div>
        🥳 App successfully hosted. Try creating a new todo.
        <br />
        <a href="https://docs.amplify.aws/nextjs/start/quickstart/nextjs-app-router-client-components/">
          Review next steps of this tutorial.
        </a>
      </div>
    </main>
  );
}
