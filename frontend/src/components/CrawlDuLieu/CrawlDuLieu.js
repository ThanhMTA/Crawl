import React, { useState, useEffect } from 'react';
import './CrawlDuLieu.css';
import { useLocation } from 'react-router-dom';
import queryString from 'query-string'; // Import thư viện query-string
import search from '../../assets/image/search.png';

const CrawlDuLieu = () => {
  // đặt độ rộng cho từng cột trong table
  const cellWidth = {
    column1: '10%',
    column2: '15%',
    column3: '15%',
    column4: '35%',
    column5: '25%'
  };
  const [editStatus, setEditStatus] = useState({}); // Trạng thái chỉnh sửa
  const [crawlName, setcrawlName] = useState('');
  const [crawlLink, setcrawlLink] = useState('');
  const [NewsPages, setNewsPage] = useState('');
  const [news, setNews] = useState([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // quản lý trạng thái của modal
  const [searchClicked, setSearchClicked] = useState(false);

  // Lấy thông tin về location từ React Router
  const location = useLocation();
  // Kiểm tra xem tham số active có trong URL không
  const isActive = location.search.includes('active=namenews');


  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/api/child-link');
      const data = await response.json();
      setNewsData(data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  // const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const namenews = searchParams.get('namenews') || '';
  const [newsData, setNewsData] = useState([]);

  useEffect(() => {
    fetch(`http://127.0.0.1:5000/api/child-link`)
      .then(response => response.json())
      .then(data => setNewsData(data))
      .catch(error => console.error('Error fetching data:', error));
  }, []);

  useEffect(() => {
    fetch(`http://127.0.0.1:5000/api/newspaper_page`)
      .then(response => response.json())
      .then(data => setNews(data))
      .catch(error => console.error('Error fetching data:', error));
  }, []);




  const [crawlStates, setCrawlStates] = useState(newsData.map(() => false));


  //-------------crawl------------
  const handleCrawlClick = (id, index) => {
    if (!crawlStates[index] && window.confirm("Bạn có chắc chắn muốn crawl trang báo này?")) {
      const updatedStates = [...crawlStates];
      updatedStates[index] = true;
      setCrawlStates(updatedStates);

      fetch(`http://127.0.0.1:5000/api/run_dantri_script/${id}`, {
        method: 'POST'
      })
        .then(response => response.json())
        .then(data => {
          console.log(data);
          const updatedStates = [...crawlStates];
          updatedStates[index] = false;
          setCrawlStates(updatedStates);
          // Gọi lại API để cập nhật danh sách
        })
        .catch(error => {
          console.error('Error crawling:', error);
          const updatedStates = [...crawlStates];
          updatedStates[index] = false;
          setCrawlStates(updatedStates);
          // Xử lý lỗi và dừng quá trình crawl
        });
    }
  };


  //--------------delete-------------
  const handleDeleteButton = (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa trang báo này?")) {
      fetch(`http://127.0.0.1:5000/api/child-link/${id}`, {
        method: 'DELETE'
      })
        .then(response => response.json())
        .then(data => {
          console.log(data);
          // Sau khi xóa thành công, gọi lại API để cập nhật danh sách
          fetch('http://127.0.0.1:5000/api/child-link') // Gọi lại API để lấy danh sách mới
            .then(response => response.json())
            .then(updatedData => setNewsData(updatedData)) // Cập nhật newspage với danh sách mới
            .catch(error => console.error('Error fetching updated data:', error));
        })
        .catch(error => console.error('Error deleting article:', error));
    }

  };
  // ----------------------edit---------------------------------------
  const handleNewspageUpdate = (e, id, field) => {
    const newValue = e.target.textContent.trim();
    const updatedNewspage = newsData.map(childname =>
      childname.Id === id ? { ...childname, [field]: newValue } : childname
    );
    setNewsData(updatedNewspage);
  };
  const handleEditButton = async (childname) => {
    try {
      if (window.confirm("Bạn có chắc chắn muốn sửa thông tin trang báo này?")) {
        const response = await fetch(`http://127.0.0.1:5000/api/child-link/${childname.Id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            NameItem: editStatus[childname.Id]?.NameItem || childname.NameItem,
            Link: editStatus[childname.Id]?.Link || childname.Link
          })
        });
        const data = await response.json();
        console.log(data);
      }
      // Gọi lại API để cập nhật danh sách mới và cập nhật state
      fetch('http://127.0.0.1:5000/api/child-link') // Gọi lại API để lấy danh sách mới
        .then(response => response.json())
        .then(updatedData => setNewsData(updatedData)) // Cập nhật newspage với danh sách mới
        .catch(error => console.error('Error fetching updated data:', error));
      // setWebsiteName('');
      // setWebsiteLink('');
      setEditStatus(prevStatus => ({
        ...prevStatus,
        [childname.Id]: {} // Reset trạng thái chỉnh sửa sau khi cập nhật thành công
      }));
    } catch (error) {
      console.error('Error adding article:', error);
    }
  };
  // -------------------------------------add  new crawler------------------
  const handleAddButtonClick = async () => {
    console.log('NewsPage:', NewsPages);
    try {
      if (window.confirm("Bạn có chắc chắn muốn thêm thông tin này ?")) {
        const response = await fetch('http://127.0.0.1:5000/api/child-link', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            NameNews: NewsPages,
            NameItem: crawlName,
            Link: crawlLink
          })

        });

        const data = await response.json();
        console.log(data);

        // Gọi lại API để cập nhật danh sách mới và cập nhật state
        fetch('http://127.0.0.1:5000/api/child-link') // Gọi lại API để lấy danh sách mới
          .then(response => response.json())
          .then(updatedData => setNewsData(updatedData)) // Cập nhật newspage với danh sách mới
          .catch(error => console.error('Error fetching updated data:', error));
        setcrawlName('');
        setcrawlLink('');
        setNewsPage('');
      }

    } catch (error) {
      console.error('Error adding article:', error);
    }
  };



  //------------------------------search-----------------------------
  const encodedSearchTerm = encodeURIComponent(searchTerm); // Encode chuỗi
  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSearchButtonClick = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/api/child-link/search?search=${encodedSearchTerm}`);
      const data = await response.json();
      setNewsData(data);
      setSearchTerm('');
    } catch (error) {
      console.error('Error fetching updated data:', error);
    }
  };





  return (
    <div>

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
                <label htmlFor="websiteName" className="label11"> Tên tiêu mục:</label>
                <input type="text" id="websiteName"
                  value={crawlName}
                  onChange={(e) => setcrawlName(e.target.value)}
                  required
                />
                <div />
                <div>
                  <label htmlFor="websiteLink" className="label12">Link:</label>
                  <input type="text" id="websiteLink"
                    value={crawlLink}
                    onChange={(e) => setcrawlLink(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="NewsPage" className="label13">Trang báo:</label>
                  <select
                    className="NewsPage_"
                    value={NewsPages}
                    onChange={(e) => setNewsPage(e.target.value)}
                    required
                  >

                    <option value="">-- Chọn trang báo --</option>
                    {news.map((childnews) => (
                      <option value={childnews.NameNews}>{childnews.NameNews}</option>
                    ))}

                  </select>
                </div>




                <div className="button-container">

                  <button className='ThemButton' onClick={handleAddButtonClick} >Thêm mới</button>
                </div>
              </div>
            </form>
          </div>
        </div>

      </div>


      <div className='crawldl' >
        <table>
          <thead>
            <tr>
              <th style={{ width: cellWidth.column1 }}>STT</th>
              <th style={{ width: cellWidth.column2 }}>Trang báo</th>
              <th style={{ width: cellWidth.column3 }}>Tiêu mục</th>
              <th style={{ width: cellWidth.column4 }}>Link</th>
              <th style={{ width: cellWidth.column5 }}>Hành động</th>
            </tr>
          </thead>

          <tbody>
            {newsData.map((childname, index) => (
              <tr key={index}>
                <td style={{ width: cellWidth.column1 }}>{index + 1}</td>
                <td style={{ width: cellWidth.column2 }}>{childname.NameNews}</td>
                <td style={{ width: cellWidth.column3 }} contentEditable={true} onBlur={(e) => handleNewspageUpdate(e, childname.Id, 'NameItem', childname.NameItem)}> {editStatus[childname.Id]?.NameNews || childname.NameItem}</td>
                <td style={{ width: cellWidth.column4 }} contentEditable={true} onBlur={(e) => handleNewspageUpdate(e, childname.Id, 'Link', childname.Link)}> {editStatus[childname.Id]?.Link || childname.Link}</td>
                <td style={{ width: cellWidth.column5 }}>
                  <button className='CrawlButton'
                    onClick={() => handleCrawlClick(childname.Id, index)}
                    disabled={crawlStates[index]}>
                    {crawlStates[index] ? "Đang Crawl..." : "Crawl"}
                  </button>
                  <button className='SuaButton' onClick={() => handleEditButton(childname)}>Sửa</button>
                  <button className='DeleteButton' onClick={() => handleDeleteButton(childname.Id)}>Xóa</button>
                </td>
              </tr>
            ))}


          </tbody>




        </table>
      </div>
      <div>

      </div>
      {isLoading && (
        <div className="modal">
          <div className="modal-content">
            <p>Loading...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CrawlDuLieu;
