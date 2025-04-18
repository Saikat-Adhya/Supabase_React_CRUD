import { useEffect, useState } from "react";
import "./App.css";
import supabase from "./supabase-client";

function App() {
  const [todoList, setTodoList] = useState([]);
  const [newTodo, setNewTodo] = useState("");

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    const { data, error } = await supabase.from("TodoList").select("*");
    if (error) {
      console.log("Error fetching: ", error);
    } else {
      // Filter out any null or incomplete todos
      const validData = data?.filter(todo => todo?.name);
      console.log("Valid fetched todos:", validData); // Log the valid data
      setTodoList(validData || []); // Ensure it's an empty array if null or undefined
    }
  };

  const addTodo = async () => {
    if (!newTodo.trim()) return; // Prevent adding empty todos

    const newTodoData = {
      name: newTodo,
      isCompleted: false,
    };
    const { data, error } = await supabase
      .from("TodoList")
      .insert([newTodoData])
      .single();

    if (error) {
      console.log("Error adding todo: ", error);
    } else {
      setTodoList((prev) => [...prev, data]);
      setNewTodo("");
    }
  };

  const completeTask = async (id, isCompleted) => {
    const { data, error } = await supabase
      .from("TodoList")
      .update({ isCompleted: !isCompleted })
      .eq("id", id);

    if (error) {
      console.log("Error toggling task: ", error);
    } else {
      const updatedTodoList = todoList.map((todo) =>
        todo.id === id ? { ...todo, isCompleted: !isCompleted } : todo
      );
      setTodoList(updatedTodoList);
    }
  };

  const deleteTask = async (id) => {
    const { data, error } = await supabase
      .from("TodoList")
      .delete()
      .eq("id", id);

    if (error) {
      console.log("Error deleting task: ", error);
    } else {
      setTodoList((prev) => prev.filter((todo) => todo.id !== id));
    }
  };

  return (
    <div>
      <h1>Todo List</h1>
      <div>
        <input
          type="text"
          placeholder="New Todo..."
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
        />
        <button onClick={addTodo}>Add Todo Item</button>
      </div>
      <ul>
        {todoList.map((todo) => {
          // Check if todo is valid before rendering
          if (!todo || !todo.name) {
            console.log("Skipping invalid todo:", todo); // Log invalid todos
            return null; // Skip invalid todo
          }
          return (
            <li key={todo.id}>
              <p>{todo.name}</p>
              <button onClick={() => completeTask(todo.id, todo.isCompleted)}>
                {todo.isCompleted ? "Undo" : "Complete Task"}
              </button>
              <button onClick={() => deleteTask(todo.id)}>Delete Task</button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default App;
