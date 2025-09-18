import "./UserList.css";

const UserList = ({ users, onSelectUser, selectedUsers, isSelectable }) => {
  if (!users || users.length === 0) {
    return (
      <div className="user-list">
        <h3>Пользователи</h3>
        <div className="no-users">Пользователи не найдены</div>
      </div>
    );
  }

  const handleUserClick = (userId) => {
    if (isSelectable && onSelectUser) {
      onSelectUser(userId);
    }
  };

  return (
    <div className="user-list">
      <h3>Пользователи ({users.length})</h3>
      <div className="users-container">
        {users.map((user) => (
          <div
            key={user.id}
            className={`user-item ${
              selectedUsers && selectedUsers.includes(user.id) ? "selected" : ""
            } ${isSelectable ? "selectable" : ""}`}
            onClick={() => handleUserClick(user.id)}
          >
            <div className="user-info">
              <span className="user-name">{user.name || "Без имени"}</span>
              <span className="user-email">{user.email}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserList;
