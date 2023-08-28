import React from 'react';
import './news.css';
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
// import Show from '../Show/Show.js';
import back from '../../assets/image/back.png';

const News = () => {
    const { filename } = useParams();
    const [newsData, setNewsData] = useState({});

    useEffect(() => {
        fetch(`http://127.0.0.1:5000/api/file/${encodeURIComponent(filename)}`)
            .then(response => response.json())
            .then(data => setNewsData(data))
            .catch(error => console.error('Error fetching data:', error));
    }, [filename]);
    return (
        <div>
            <div>
               <Link to={'/show-txt'} >
                    <button className="back">
                        <img src ={back}></img>
                         
                    </button>
               </Link>
            </div>
        
        <div className="App">
            <header className="header">
                <p className='title'>{newsData.title}</p>
                <div className="author-info">

                    <p className="publish-date">{newsData.Time}</p>
                </div>
            </header>
            <div className="content-new">
                <div>{newsData.summary}</div>
                <div className='img'>
                    <img src={newsData.img} alt="Hình ảnh minh họa" className='imgNew' />
                    <p className='chuthich'>{newsData.noteImg}</p>
                </div>
                <p>{newsData.content}</p>
                <p>

                </p>
            </div>
        </div>
        </div>
        
    );
}

export default News;
