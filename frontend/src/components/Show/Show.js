import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';



function Show() {
  const [fileList, setFileList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const filesPerPage = 10;

  useEffect(() => {
    fetch('http://127.0.0.1:5000/api/files')
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch files');
        }
        return response.json();
      })
      .then(data => {
        setFileList(data.files);
      })
      .catch(error => {
        console.error(error.message);
      });
  }, []);

  const handleClickNext = () => {
    setCurrentPage(prevPage => prevPage + 1);
  };

  const handleClickPrev = () => {
    setCurrentPage(prevPage => prevPage - 1);
  };

  const indexOfLastFile = currentPage * filesPerPage;
  const indexOfFirstFile = indexOfLastFile - filesPerPage;
  const currentFiles = fileList.slice(indexOfFirstFile, indexOfLastFile);

  return (
    <>
      <div>
        <Link to="/crawl-du-lieu">
          <button className='QLButton'>Quay lại</button>
        </Link>
      </div>
      <h1 style={{ marginTop: 0 }}>Danh sách các bài báo đã Crawl</h1>
      <div className="container">
        <table>
          <thead>
            <tr>
              <th>Number</th>
              <th>File Name</th>
              <th>Views</th>
            </tr>
          </thead>
          <tbody>
            {currentFiles.map((file, index) => (
              <tr key={index}>
                <td>{indexOfFirstFile + index + 1}</td>
                <td>{file}</td>
                <td>
                  <Link to={`/news/${encodeURIComponent(file)}`}>
                    <button>Views</button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1em' }}>
        <button onClick={handleClickPrev} disabled={currentPage === 1}>Previous</button>
        {fileList.length > indexOfLastFile && (
          <button onClick={handleClickNext}>Next</button>
        )}
      </div>
    </>
  );
}

export default Show;
