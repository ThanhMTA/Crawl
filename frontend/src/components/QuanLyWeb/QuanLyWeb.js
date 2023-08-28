// QuanLyWebsite.js
import React, { useState, useEffect } from 'react';
// import { fetchWebsites, addWebsite, deleteWebsite } from '../../services/api';
import '../SearchBar/SearchBar.js';
import './QuanLyWeb.css';
import search from '../../assets/image/search.png';
import { Link } from 'react-router-dom';
import CrawlDuLieu from '../../components/CrawlDuLieu/CrawlDuLieu.js';



const QuanLyWebsite = () => {
  // đặt độ rộng cho từng cột trong table
  const cellWidth = {
    column1: '10%', // Độ rộng cho cột 1
    column2: '20%',
    column3: '50%',
    column4: '20%'
  };

  const [websiteName, setWebsiteName] = useState('');
  const [websiteLink, setWebsiteLink] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [websites, setWebsites] = useState([]);
  // lay danh sach trang bao 
  const [newspage, setNewspage] = useState([]);
  const [editStatus, setEditStatus] = useState({}); // Trạng thái chỉnh sửa
  const [newsData, setNewsData] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/api/newspaper_page');
      const data = await response.json();
      setNewsData(data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };
  // delete 
  const handleDeleteButtonClick = (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa trang báo này?")) {
      fetch(`http://127.0.0.1:5000/api/newspaper_page/${id}`, {
        method: 'DELETE'
      })
        .then(response => response.json())
        .then(data => {
          console.log(data);
          // Sau khi xóa thành công, gọi lại API để cập nhật danh sách
          fetch('http://127.0.0.1:5000/api/newspaper_page') // Gọi lại API để lấy danh sách mới
            .then(response => response.json())
            .then(updatedData => setNewspage(updatedData)) // Cập nhật newspage với danh sách mới
            .catch(error => console.error('Error fetching updated data:', error));
        })
        .catch(error => console.error('Error deleting article:', error));
    }
  };
  // add new newspage
  const handleAddButtonClick = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/api/newspaper_page', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          NameNews: websiteName,
          Link: websiteLink
        })
      });

      const data = await response.json();
      console.log(data);

      // Gọi lại API để cập nhật danh sách mới và cập nhật state
      fetch('http://127.0.0.1:5000/api/newspaper_page') // Gọi lại API để lấy danh sách mới
        .then(response => response.json())
        .then(updatedData => setNewspage(updatedData)) // Cập nhật newspage với danh sách mới
        .catch(error => console.error('Error fetching updated data:', error));
      setWebsiteName('');
      setWebsiteLink('');
    } catch (error) {
      console.error('Error adding article:', error);
    }
  };

  // edit


  const handleEditButtonClick = async (website) => {
    try {
      if (window.confirm("Bạn có chắc chắn muốn sửa thông tin trang báo này?")) {
        const response = await fetch(`http://127.0.0.1:5000/api/newspaper_page/${website.Id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            NameNews: editStatus[website.Id]?.NameNews || website.NameNews,
            Link: editStatus[website.Id]?.Link || website.Link
            // NameNews: website.NameNews,
            // Link: website.Link
          })
        });
        const data = await response.json();
        console.log(data);
      }



      // Gọi lại API để cập nhật danh sách mới và cập nhật state
      fetch('http://127.0.0.1:5000/api/newspaper_page') // Gọi lại API để lấy danh sách mới
        .then(response => response.json())
        .then(updatedData => setNewspage(updatedData)) // Cập nhật newspage với danh sách mới
        .catch(error => console.error('Error fetching updated data:', error));
      // setWebsiteName('');
      // setWebsiteLink('');
      setEditStatus(prevStatus => ({
        ...prevStatus,
        [website.Id]: {} // Reset trạng thái chỉnh sửa sau khi cập nhật thành công
      }));
    } catch (error) {
      console.error('Error adding article:', error);
    }
  };




  const handleNewspageUpdate = (e, id, field) => {
    const newValue = e.target.textContent.trim();
    const updatedNewspage = newspage.map(websize =>
      websize.Id === id ? { ...websize, [field]: newValue } : websize
    );
    setNewspage(updatedNewspage);
  };

  const encodedSearchTerm = encodeURIComponent(searchTerm); // Encode chuỗi
  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSearchButtonClick = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/api/newspaper_page/search?search=${encodedSearchTerm}`);
      const data = await response.json();
      setNewsData(data);
      setSearchTerm('');
    } catch (error) {
      console.error('Error fetching updated data:', error);
    }
  };





  return (
    <div >
      <div className="container">
        <div className="search-container">
          <input type="text" placeholder="Nhập từ khóa cần tìm..." value={searchTerm} onChange={handleSearch} className="search-input" />
          <button className="search-button" onClick={handleSearchButtonClick}>
            <img src={search} alt='search'></img>
          </button>
        </div>
        <div className="container">
          <div class="form-container">
            <form >
              <div>
                <label htmlFor="websiteName" className="label1"> Tên trang báo:</label>
                <input type="text" id="websiteName"
                  value={websiteName}
                  onChange={(e) => setWebsiteName(e.target.value)}
                  required
                />
                <div />
                <div>
                  <label htmlFor="websiteLink" className="label2">Link:</label>
                  <input type="text" id="websiteLink"
                    value={websiteLink}
                    onChange={(e) => setWebsiteLink(e.target.value)}
                    required
                  />
                </div>
                <div className="button-container">

                  <button className='ThemButton' onClick={handleAddButtonClick}>Thêm mới</button>
                </div>
              </div>
            </form>
          </div>
        </div>

      </div>
      <div ><div className='qlweb'>
        <table>
          <thead>
            <tr>
              <th style={{ width: cellWidth.column1 }}>STT</th>
              <th style={{ width: cellWidth.column2 }}>Tên website</th>
              <th style={{ width: cellWidth.column3 }}>Link</th>
              <th style={{ width: cellWidth.column4 }}>Hành động</th>
            </tr>
          </thead>

          <tbody>
            {newsData.map((website, index) => (
              <tr key={index}>
                <td style={{ width: cellWidth.column1 }}>{index + 1}</td>
                <td style={{ width: cellWidth.column2 }} contentEditable={true} onBlur={(e) => handleNewspageUpdate(e, website.Id, 'NameNews', website.NameNews)}> {editStatus[website.Id]?.NameNews || website.NameNews}</td>
                <td style={{ width: cellWidth.column3 }} contentEditable={true} onBlur={(e) => handleNewspageUpdate(e, website.Id, 'Link', website.Link)}> {editStatus[website.Id]?.Link || website.Link}</td>
                <td style={{ width: cellWidth.column4 }}>
                  <button className='SuaButton' onClick={() => handleEditButtonClick(website)}>Sửa</button>
                  <button className='XoaButton' onClick={() => handleDeleteButtonClick(website.Id)}  >Xóa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div></div>
    </div>
  );
};


export default QuanLyWebsite;


