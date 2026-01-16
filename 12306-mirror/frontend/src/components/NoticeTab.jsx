import React from 'react';

const NoticeTab = () => {
  return (
    <div className="notice-tab" data-testid="notice-tab">
      <div className="tab-header">
        <span className="tab-item active">最新发布</span>
        <span className="tab-item">常见问题</span>
        <span className="tab-item">信用信息</span>
      </div>
      <div className="tab-content">
        <ul className="notice-list">
          <li><span>公告：铁路12306系统维护通知</span> <span className="date">2023-10-01</span></li>
          <li><span>公告：关于调整部分票价的说明</span> <span className="date">2023-09-28</span></li>
        </ul>
      </div>
    </div>
  );
};

export default NoticeTab;
