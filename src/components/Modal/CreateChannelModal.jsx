import React, { useState } from "react";
import UserList from "../UserList/UserList";
import "./Modal.css";

const CreateChannelModal = ({
  isOpen,
  onClose,
  onCreateChannel,
  allUsers,
  currentUser,
  loading,
}) => {
  const [channelName, setChannelName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleUserSelect = (userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleCreate = () => {
    if (!channelName.trim()) {
      setError("Введите название канала");
      return;
    }

    if (selectedUsers.length === 0) {
      setError("Выберите хотя бы одного участника");
      return;
    }

    setError("");
    onCreateChannel({
      name: channelName,
      members: [...selectedUsers, currentUser.id],
      createdBy: currentUser.id,
    });
  };

  const handleClose = () => {
    setChannelName("");
    setSelectedUsers([]);
    setError("");
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Создать канал</h2>

        <div className="modal-input-group">
          <label>Название канала</label>
          <input
            type="text"
            value={channelName}
            onChange={(e) => setChannelName(e.target.value)}
            placeholder="Введите название канала"
            disabled={loading}
          />
        </div>

        <div className="modal-input-group">
          <label>Выберите участников</label>
          <UserList
            users={allUsers.filter((user) => user.id !== currentUser.id)}
            onSelectUser={handleUserSelect}
            selectedUsers={selectedUsers}
            isSelectable={true}
          />
        </div>

        {error && <div className="modal-error">{error}</div>}

        <div className="modal-actions">
          <button
            onClick={handleClose}
            className="btn-secondary"
            disabled={loading}
          >
            Отмена
          </button>
          <button
            onClick={handleCreate}
            className="btn-primary"
            disabled={
              loading || !channelName.trim() || selectedUsers.length === 0
            }
          >
            {loading ? "Создание..." : "Создать"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateChannelModal;
