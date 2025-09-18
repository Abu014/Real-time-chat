import React, { useState, useEffect, useCallback } from "react";
import {
  collection,
  addDoc,
  onSnapshot,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../firebase";
import UserList from "../UserList/UserList";
import CreateChannelModal from "../Modal/CreateChannelModal";
import JoinChannelModal from "../Modal/JoinChannelModal";
import "./Chat.css";

const Chat = ({ user, allUsers = [], onLogout }) => {
  const [channels, setChannels] = useState([]);
  const [currentChannel, setCurrentChannel] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showChannelMembers, setShowChannelMembers] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Загрузка каналов пользователя
  useEffect(() => {
    if (!user) return;

    setLoading(true);
    const q = query(
      collection(db, "channels"),
      where("members", "array-contains", user.id)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setLoading(false);
        const channelsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setChannels(channelsData);
        setError(null);
      },
      (error) => {
        setLoading(false);
        setError("Ошибка загрузки каналов");
        console.error("Error loading channels:", error);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Загрузка сообщений текущего канала
  useEffect(() => {
    if (!currentChannel) return;

    setLoading(true);
    const q = query(
      collection(db, "channels", currentChannel.id, "messages"),
      orderBy("timestamp", "asc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setLoading(false);
        const messagesData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setMessages(messagesData);
        setError(null);

        // Прокрутка к последнему сообщению
        setTimeout(() => {
          const messagesContainer = document.querySelector(
            ".messages-container"
          );
          if (messagesContainer) {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
          }
        }, 100);
      },
      (error) => {
        setLoading(false);
        setError("Ошибка загрузки сообщений");
        console.error("Error loading messages:", error);
      }
    );

    return () => unsubscribe();
  }, [currentChannel]);

  const handleCreateChannel = async (channelData) => {
    try {
      setLoading(true);
      const docRef = await addDoc(collection(db, "channels"), {
        ...channelData,
        createdAt: serverTimestamp(),
      });
      console.log("Channel created with ID:", docRef.id);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      setError("Ошибка при создании канала");
      console.error("Error creating channel:", error);
    }
  };

  const handleJoinChannel = async (channelId) => {
    try {
      setLoading(true);
      const channelRef = doc(db, "channels", channelId);
      await updateDoc(channelRef, {
        members: arrayUnion(user.id),
      });
      setLoading(false);
    } catch (error) {
      setLoading(false);
      setError("Канал не найден или ошибка присоединения");
      console.error("Error joining channel:", error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentChannel) return;

    try {
      setLoading(true);
      await addDoc(collection(db, "channels", currentChannel.id, "messages"), {
        text: newMessage,
        senderId: user.id,
        senderEmail: user.email,
        senderName: user.name,
        timestamp: serverTimestamp(),
      });
      setNewMessage("");
      setLoading(false);
    } catch (error) {
      setLoading(false);
      setError("Ошибка при отправке сообщения");
      console.error("Error sending message:", error);
    }
  };

  const removeUserFromChannel = async (userId) => {
    if (currentChannel.createdBy !== user.id) {
      setError("Только создатель канала может удалять пользователей");
      return;
    }

    try {
      setLoading(true);
      const channelRef = doc(db, "channels", currentChannel.id);
      await updateDoc(channelRef, {
        members: arrayRemove(userId),
      });
      setLoading(false);
    } catch (error) {
      setLoading(false);
      setError("Ошибка при удалении пользователя");
      console.error("Error removing user:", error);
    }
  };

  // Функция для фильтрации пользователей
  const getFilteredUsers = useCallback(
    (usersList) => {
      if (!searchTerm.trim()) return usersList;

      return usersList.filter(
        (u) =>
          u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    },
    [searchTerm]
  );

  // Получаем участников текущего канала
  const channelMembers = currentChannel
    ? allUsers.filter((u) => currentChannel.members?.includes(u.id))
    : [];

  // Фильтруем участников канала по поисковому запросу
  const filteredChannelMembers = getFilteredUsers(channelMembers);

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    try {
      return timestamp
        .toDate()
        .toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch (error) {
      return "";
    }
  };

  return (
    <div className="chat-container">
      {/* Сайдбар */}
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>Чаты</h2>
          <div className="user-info">
            <span className="user-name">{user.name || user.email}</span>
            <button onClick={onLogout} className="logout-btn">
              Выйти
            </button>
          </div>
        </div>

        <div className="channel-actions">
          <button
            onClick={() => setShowCreateModal(true)}
            className="action-btn"
            disabled={loading}
          >
            Создать группу
          </button>
          <button
            onClick={() => setShowJoinModal(true)}
            className="action-btn"
            disabled={loading}
          >
            Присоединиться
          </button>
        </div>

        <div className="channels-list">
          {loading && channels.length === 0 && (
            <div className="loading">Загрузка каналов...</div>
          )}
          {channels.map((channel) => (
            <div
              key={channel.id}
              className={`channel-item ${
                currentChannel?.id === channel.id ? "active" : ""
              }`}
              onClick={() => setCurrentChannel(channel)}
            >
              <h4>{channel.name}</h4>
              <span className="member-count">
                {channel.members?.length} участников
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Основная область чата */}
      <div className="chat-main">
        {error && <div className="error-message">{error}</div>}

        {currentChannel ? (
          <>
            <div className="chat-header">
              <h3>{currentChannel.name}</h3>
              <span className="online-count">
                {currentChannel.members?.length} участников
              </span>
            </div>

            <div className="messages-container">
              {loading && messages.length === 0 && (
                <div className="loading">Загрузка сообщений...</div>
              )}
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`message ${
                    message.senderId === user.id ? "own-message" : ""
                  }`}
                >
                  <div className="message-sender">
                    {message.senderName || message.senderEmail}
                  </div>
                  <div className="message-text">{message.text}</div>
                  <div className="message-time">
                    {formatTime(message.timestamp)}
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleSendMessage} className="message-input">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Введите сообщение..."
                disabled={loading}
              />
              <button type="submit" disabled={loading || !newMessage.trim()}>
                {loading ? "Отправка..." : "Отправить"}
              </button>
            </form>
          </>
        ) : (
          <div className="no-channel-selected">
            <p>Выберите или создайте канал для общения</p>
          </div>
        )}
      </div>

      {/* Сайдбар участников */}
      <div className="users-sidebar">
        <div className="search-container">
          <input
            type="text"
            placeholder="Поиск пользователей..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled={!currentChannel}
          />
        </div>

        {currentChannel && (
          <>
            <div className="sidebar-section-header">
              <h3>Участники канала ({channelMembers.length})</h3>
              <button
                onClick={() => setShowChannelMembers(!showChannelMembers)}
                className="toggle-btn"
              >
                {showChannelMembers ? "▲" : "▼"}
              </button>
            </div>

            {showChannelMembers && (
              <UserList users={filteredChannelMembers} isSelectable={false} />
            )}

            {currentChannel.createdBy === user.id && (
              <div className="admin-actions">
                <h4>Управление участниками</h4>
                {getFilteredUsers(
                  channelMembers.filter((u) => u.id !== user.id)
                ).map((userItem) => (
                  <div key={userItem.id} className="admin-user-item">
                    <span>{userItem.name || userItem.email}</span>
                    <button
                      onClick={() => removeUserFromChannel(userItem.id)}
                      className="remove-btn"
                      disabled={loading}
                    >
                      Удалить
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Модальные окна */}
      <CreateChannelModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreateChannel={handleCreateChannel}
        allUsers={allUsers}
        currentUser={user}
        loading={loading}
      />

      <JoinChannelModal
        isOpen={showJoinModal}
        onClose={() => setShowJoinModal(false)}
        onJoinChannel={handleJoinChannel}
        loading={loading}
      />
    </div>
  );
};

export default Chat;
