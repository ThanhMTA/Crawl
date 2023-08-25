import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import './App.css';
import user from '../src/assets/image/user.png';
import QuanLyWeb from './components/QuanLyWeb/QuanLyWeb.js';
import CrawlDuLieu from './components/CrawlDuLieu/CrawlDuLieu.js';
import Show from './components/Show/Show';
import News from './components/news/news';


function App() {
  //khai báo 
  const sidebarItems = [
    { name: 'Quản Lý Website', path: '/quan-ly-web', clickCount: 0 },
    { name: 'Crawl dữ liệu', path: '/crawl-du-lieu', clickCount: 1 },
    { name: 'Show', path: '/show-txt', clickCount: 2 },

  ];

  // Khai báo state để theo dõi index của mục được chọn
  const [selectedSidebarIndex, setSelectedSidebarIndex] = useState(null);

  // Xử lý khi một mục trong sidebar được nhấn
  const toggleSidebarItem = (index) => {
    if (selectedSidebarIndex != index) {
      // Nếu mục đang được chọn, bỏ chọn nó
      setSelectedSidebarIndex(index);
    }
  };


  return (
    <div className="admin-container">
      <nav className="navbar">
        <div className="logo" >
          <a href="/" onClick={(e) => { e.preventDefault(); window.location.href = '/' }} style={{ color: 'inherit', textDecoration: 'none', }}> Crawl Data </a>
        </div>
        <div className="user-info">
          <span>User Name </span>
          <img src={user} alt="User Avatar" />
        </div>
      </nav>
      <Router>
        <div className="content-container">
          <div className="sidebar">
            <ul>
              {sidebarItems.map((item, index) => (
                <li key={index} className={selectedSidebarIndex === index ? 'active' : ''} >
                  <Link
                    to={item.path}
                    activeClassName="active"
                    style={{ color: 'inherit', textDecoration: 'none' }} onClick={() => toggleSidebarItem(index)}> {item.name} </Link>

                </li>
              ))}
            </ul>
          </div>
          <main className="content">
            <div>

              <Routes>
                <Route path="/quan-ly-web" element={<QuanLyWeb />} />
                <Route path="/crawl-du-lieu" element={<CrawlDuLieu />} />
                <Route path="/show-txt" element={<Show />} />
                <Route path="/news/:filename" element={<News />} />



              </Routes>
            </div>
          </main>
        </div>
      </Router>
    </div>
  );
}

export default App;
