import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import ChatPanel from '../ChatPanel/ChatPanel';
import './GameUI.css';

const GameUI = () => {
  const user = useSelector((state: RootState) => state.user);
  const hero = useSelector((state: RootState) => state.heroSlice);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activePanel, setActivePanel] = useState<string | null>(null);

  const togglePanel = (panelName: string) => {
    setActivePanel(activePanel === panelName ? null : panelName);
  };

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  return (
    <div className="game-ui">
      {/* Верхняя панель с ресурсами */}
      <div className="top-panel">
        <div className="player-info">
          <div className="player-name">{user.nikName}</div>
          <div className="player-details">
            <div className="player-spec">
              <span className="spec-label">SPEC:</span>
              <span className="spec-value">{hero.specialization || 'FREE'}</span>
            </div>
            <div className="player-rating">
              <i className="rating-icon" />
              <div className="rating-info">
                <span className="rating-label">RATING:</span>
                <span className="rating-value">{hero.rating || 0}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="resources">
          <div className="resource oxygen">
            <i className="resource-icon oxygen-icon" />
            <div className="resource-info">
              <span className="resource-label">OXYGEN:</span>
              <span className="resource-value">{hero.oxigen || 0}</span>
            </div>
          </div>
          <div className="resource energy">
            <i className="resource-icon energy-icon" />
            <div className="resource-info">
              <span className="resource-label">ENERGY:</span>
              <span className="resource-value">{hero.energy || 0}</span>
            </div>
          </div>
          <div className="resource crystals">
            <i className="resource-icon crystal-icon" />
            <div className="resource-info">
              <span className="resource-label">CRYSTALS:</span>
              <span className="resource-value">{hero.cristals || 0}</span>
            </div>
          </div>
        </div>
      </div>
      {/* Нижняя панель с кнопками */}
      <div className="bottom-panel">
        <div className="left-controls">
          <button className={`panel-button ${isChatOpen ? 'active' : ''}`} onClick={toggleChat}>
            <i className="button-icon chat-icon" />
            Chat
          </button>
        </div>
        <div className="right-controls">
          <button
            className={`panel-button ${activePanel === 'missions' ? 'active' : ''}`}
            onClick={() => togglePanel('missions')}
          >
            <i className="button-icon mission-icon" />
            Missions
          </button>
          <button
            className={`panel-button ${activePanel === 'robots' ? 'active' : ''}`}
            onClick={() => togglePanel('robots')}
          >
            <i className="button-icon robot-icon" />
            Robots
          </button>
          <button
            className={`panel-button ${activePanel === 'bonuses' ? 'active' : ''}`}
            onClick={() => togglePanel('bonuses')}
          >
            <i className="button-icon bonus-icon" />
            Bonuses
          </button>
        </div>
      </div>{' '}
      {/* Чат (всегда слева) */}
      <ChatPanel isOpen={isChatOpen} onClose={toggleChat} />
      {/* Правые панели */}
      {activePanel === 'missions' && (
        <div className="side-panel missions-panel right">
          <div className="panel-header">
            <h3>Available Missions</h3>
            <button onClick={() => togglePanel('missions')}>×</button>
          </div>
          <div className="content-list">
            {hero.qvests?.map((quest, index) => (
              <div key={index} className="list-item">
                {/* <h4>{quest.title}</h4>
                <p>{quest.description}</p> */}
              </div>
            ))}
          </div>
        </div>
      )}
      {activePanel === 'robots' && (
        <div className="side-panel robots-panel right">
          <div className="panel-header">
            <h3>Your Robots</h3>
            <button onClick={() => togglePanel('robots')}>×</button>
          </div>
          <div className="content-list">
            {hero.robots?.map((robot, index) => (
              <div key={index} className="list-item robot-item">
                {/* <h4>{robot.name}</h4>
                <p>Status: {robot.status}</p> */}
              </div>
            ))}
          </div>
        </div>
      )}
      {activePanel === 'bonuses' && (
        <div className="side-panel bonuses-panel right">
          <div className="panel-header">
            <h3>Active Bonuses</h3>
            <button onClick={() => togglePanel('bonuses')}>×</button>
          </div>
          <div className="content-list">
            {hero.bonuses?.map((bonus, index) => (
              <div key={index} className="list-item bonus-item">
                {/* <h4>{bonus.name}</h4>
                <p>{bonus.description}</p> */}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GameUI;
