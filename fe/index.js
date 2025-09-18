const { useState, useEffect } = React;

/** CONFIG */
const API_BASE = "http://localhost:8000/api";

axios.defaults.baseURL = API_BASE;
function setAuthToken(token) {
  if (token) {
    axios.defaults.headers.common["authorization"] = `Bearer ${token}`;
    localStorage.setItem("todo_token", token);
  } else {
    delete axios.defaults.headers.common["authorization"];
    localStorage.removeItem("todo_token");
  }
}

const savedToken = localStorage.getItem("todo_token");
if (savedToken) setAuthToken(savedToken);


function AuthForm({ onAuthSuccess }) {
  const [mode, setMode] = useState("login"); // 'login' | 'register'
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function submit(e) {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      if (mode === "login") {
        const res = await axios.post("/auth/login", { username, password });
        const { token, user } = res.data;
        setAuthToken(token);
        onAuthSuccess(user);
      } else {
        await axios.post("/auth/register", { username, password });
        setMode("login");
        setUsername("");
        setPassword("");
        alert("Registered — now please log in.");
      }
    } catch (error) {
      console.error(error);
      setErr(error?.response?.data?.error || error.message || "Auth error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-semibold mb-4 text-center">
        {mode === "login" ? "Login" : "Register"}
      </h2>

      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Username
          </label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"
            required
          />
        </div>

        {err && <div className="text-sm text-red-600">{err}</div>}

        <div className="flex items-center justify-between">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            {loading
              ? "Please wait..."
              : mode === "login"
              ? "Login"
              : "Register"}
          </button>

          <button
            type="button"
            onClick={() => {
              setMode(mode === "login" ? "register" : "login");
              setErr("");
            }}
            className="text-sm text-gray-600 hover:underline"
          >
            {mode === "login" ? "Create an account" : "Back to login"}
          </button>
        </div>
      </form>
    </div>
  );
}

function TodoForm({ onCreated }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    try {
      const res = await axios.post("/todo", { title, description });
      onCreated(res.data);
      setTitle("");
      setDescription("");
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.error || "Failed to create");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="bg-white p-4 rounded shadow space-y-3">
      <div className="flex gap-2">
        <input
          placeholder="New todo title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="flex-1 rounded border-gray-300 p-2"
        />
        <button
          className="bg-green-600 text-white px-4 rounded"
          type="submit"
          disabled={loading}
        >
          Add
        </button>
      </div>
      <input
        placeholder="Description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full rounded border-gray-300 p-2"
      />
    </form>
  );
}

function TodoItem({ todo, onToggle, onDelete }) {
  return (
    <div className="flex items-center justify-between bg-white p-3 rounded shadow-sm">
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={!!todo.completed}
          onChange={() => onToggle(todo)}
          className="w-4 h-4"
        />
        <div>
          <div
            className={`font-medium ${
              todo.completed ? "line-through text-gray-500" : ""
            }`}
          >
            {todo.title}
          </div>
          {todo.description && (
            <div className="text-sm text-gray-500">{todo.description}</div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onDelete(todo)}
          className="text-sm text-red-600 hover:underline"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

function TodosPanel({ onLogout }) {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadTodos() {
    setLoading(true);
    try {
      const res = await axios.get("/todo");
      console.log(res);
      setTodos(res.data || []);
    } catch (err) {
      console.error(err);
      if (
        err.response &&
        (err.response.status === 401 || err.response.status === 403)
      ) {
        alert("Authentication required. Please log in again.");
        setAuthToken(null);
        onLogout();
      } else {
        alert("Failed to fetch todos");
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTodos();
  }, []);

  async function handleCreate(newTodo) {
    console.log(newTodo);
    setTodos((prev) => [...prev, newTodo.todo]);
  }

  async function toggleTodo(todo) {
    try {
      const res = await axios.put(`/todo/${todo._id}`, {
        completed: !todo.completed,
      });
      setTodos((prev) =>
        prev.map((t) => (t._id === res.data._id ? res.data : t))
      );
    } catch (err) {
      console.error(err);
      alert("Failed to update");
    }
  }

  async function deleteTodo(todo) {
    if (!confirm("Delete this todo?")) return;
    try {
      await axios.delete(`/todo/${todo._id}`);
      setTodos((prev) => prev.filter((t) => t._id !== todo._id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Your Todos</h2>
        <button
          onClick={() => {
            setAuthToken(null);
            onLogout();
          }}
          className="text-sm text-red-600 hover:underline"
        >
          Logout
        </button>
      </div>

      <TodoForm onCreated={handleCreate} />

      {loading ? (
        <div className="text-center text-gray-600">Loading...</div>
      ) : todos.length === 0 ? (
        <div className="text-center text-gray-500">
          No todos yet — add one above.
        </div>
      ) : (
        <div className="space-y-2">
          {todos.map((todo) => (
            <TodoItem
              key={todo._id}
              todo={todo}
              onToggle={toggleTodo}
              onDelete={deleteTodo}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (localStorage.getItem("todo_token")) {
      setUser({ username: "You" });
    }
  }, []);

  function onAuthSuccess(userData) {
    setUser(userData || { username: "You" });
  }

  function onLogout() {
    setUser(null);
  }

  return (
    <div className="m-auto">
      <div className="mb-3">
        <h1 className="text-3xl font-bold text-center text-blue-600">
          Simple ToDo (JWT)
        </h1>
      </div>

      <div className="bg-gray-50 p-6 rounded-lg shadow">
        {!localStorage.getItem("todo_token") || !user ? (
          <AuthForm onAuthSuccess={onAuthSuccess} />
        ) : (
          <TodosPanel onLogout={onLogout} />
        )}
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
