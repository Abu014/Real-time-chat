// Login.jsx
import React, { useState } from "react";
import "./Login.css";

const Login = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(
        "https://hr2.sibers.com/test/frontend/users.json"
      );
      const users = await response.json();

      const foundUser = users.find(
        (user) => user.email.toLowerCase() === email.toLowerCase()
      );

      if (foundUser) {
        // Загружаем всех пользователей для списка контактов
        const allUsers = users.filter((u) => u.id !== foundUser.id);
        onLoginSuccess(foundUser, allUsers);
      } else {
        setError("Пользователь с такой почтой не найден");
      }
    } catch (error) {
      setError("Ошибка при проверке данных. Попробуйте позже.");
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <h2>Вход в систему</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Введите ваш email"
              required
              disabled={isLoading}
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button
            type="submit"
            className="login-button"
            disabled={isLoading || !email}
          >
            {isLoading ? "Проверка..." : "Войти"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
