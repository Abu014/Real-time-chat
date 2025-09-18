import React, { useState } from "react";
import Login from "./components/Login/Login";
import Chat from "./components/Chat/Chat";
import "./App.css";

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [allUsers, setAllUsers] = useState([]);

  const handleLoginSuccess = (user, usersList) => {
    setCurrentUser(user);
    setAllUsers(usersList);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setAllUsers([]);
  };

  return (
    <div className="App">
      {!currentUser ? (
        <Login onLoginSuccess={handleLoginSuccess} />
      ) : (
        <Chat user={currentUser} allUsers={allUsers} onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;
