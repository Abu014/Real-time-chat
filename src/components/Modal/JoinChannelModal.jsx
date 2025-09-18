import React, { useState } from "react";
import "./Modal.css";

const JoinChannelModal = ({ isOpen, onClose, onJoinChannel, loading }) => {
  const [channelId, setChannelId] = useState("");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleJoin = () => {
    if (!channelId.trim()) {
      setError("Введите ID канала");
      return;
    }

    setError("");
    onJoinChannel(channelId.trim());
  };

  const handleClose = () => {
    setChannelId("");
    setError("");
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Присоединиться к каналу</h2>

        <div className="modal-input-group">
          <label>ID канала</label>
          <input
            type="text"
            value={channelId}
            onChange={(e) => setChannelId(e.target.value)}
            placeholder="Введите ID канала"
            disabled={loading}
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
            onClick={handleJoin}
            className="btn-primary"
            disabled={loading || !channelId.trim()}
          >
            {loading ? "Присоединение..." : "Присоединиться"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default JoinChannelModal;
