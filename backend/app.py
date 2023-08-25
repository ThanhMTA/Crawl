from flask import Flask, jsonify, request
import os
from flask_cors import CORS
import subprocess
import mysql.connector
db_connection = mysql.connector.connect(
    host="localhost",
    user="root",
    password="123456",
    database="crawl"
)

app = Flask(__name__)
CORS(app)

@app.route('/api/files', methods=['GET'])
def list_files():
    folder_path = "dantri"
    file_list = []
    if os.path.exists(folder_path) and os.path.isdir(folder_path):
        file_list = [filename for filename in os.listdir(folder_path) if filename.endswith('.txt')]
    
    response = {"files": file_list}
    return jsonify(response)



# ---------------------- newspages----------------------
# ---------------------hien thi danh sach_____________________
@app.route('/api/newspaper_page')
def NewsPaper():
    connection = mysql.connector.connect(
    host="localhost",
    user="root",
    password="123456",
    database="crawl"
)

    cursor = connection.cursor()
    cursor.execute("SELECT id,Link, NameNews FROM NewsPages")  # Chọn cả hai cột Link và NameNews
    NewsPapers = cursor.fetchall()
    cursor.close()
    # Trả về dữ liệu dưới dạng list các đối tượng JSON
    NewsPaper_list = []
    for newspage in NewsPapers:
        newspage_dict = {
            "Id": newspage[0],
            "Link": newspage[1],  # Truy cập giá trị của cột Link
            "NameNews": newspage[2]  # Truy cập giá trị của cột NameNews
        }
        NewsPaper_list.append(newspage_dict)
    connection.close()
    return jsonify(NewsPaper_list)
#_____________________________delete ___________________________________
@app.route('/api/newspaper_page/<int:id>', methods=['DELETE'])
def delete_article(id):
    cursor = db_connection.cursor()
    cursor.execute("DELETE FROM NewsPages WHERE id = %s", (id,))
    db_connection.commit()
    cursor.close()
    return jsonify({"message": "Article deleted successfully"})

#----------------------------add new newspaper--------------------
@app.route('/api/newspaper_page', methods=['POST'])
def add_article():
    data = request.json  # Lấy dữ liệu gửi từ frontend
    name = data.get('NameNews')
    link = data.get('Link')
    cursor = db_connection.cursor()
    cursor.execute("INSERT INTO NewsPages (NameNews, Link) VALUES (%s, %s)", (name, link))
    db_connection.commit()
    cursor.close()
   

    return jsonify({"message": "Article added successfully"})
#----------------------------edit new newspaper--------------------
@app.route('/api/newspaper_page/<int:id>', methods=['PUT'])
def update_article(id):
    data = request.get_json()  # Lấy dữ liệu từ request body
    new_name = data.get('NameNews')
    new_link = data.get('Link')

    cursor = db_connection.cursor()
    cursor.execute("UPDATE NewsPages SET NameNews = %s, Link = %s WHERE id = %s", (new_name, new_link, id))
    db_connection.commit()
    cursor.close()

    return jsonify({"message": "Article updated successfully"})


#-------------------------------------- view Aritcle-----------------
def parse_text_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as file:
        lines = file.readlines()
        data = {}
        content_started = False
        content_lines = []
        
        for line in lines:
            if line.startswith("Title:"):
                data['title'] = line[len("Title:"):].strip()
            elif line.startswith("summary:"):
                data['summary'] = line[len("summary:"):].strip()
            elif line.startswith("img:"):
                img= line[len("img:"):].strip()
                image_filename = os.path.basename(img)
                data['img'] = "/images/"+image_filename
            elif line.startswith("Time:"):
                data['Time'] = line[len("Time:"):].strip()
            elif line.startswith("noteImg:"):
                data['noteImg'] = line[len("noteImg:"):].strip()
            elif not content_started and line.strip() != '':
                content_started = True
            if content_started:
                content_lines.append(line.strip())
                
        data['content'] = '\n'.join(content_lines)
        return data

@app.route('/api/file/<filename>', methods=['GET'])
def get_file_data(filename):   
    name =os.path.basename(filename).replace("%20", " ")
    print(name)
    file_path = os.path.join(os.path.dirname(__file__), 'dantri', name)
    try:
        data = parse_text_file(file_path)
        return jsonify(data)
    except Exception as e:
        return jsonify({'error': 'Internal Server Error'}), 500
 #--------------------crawl-------------------------------
 #-----------------------crawl-----------------------------
@app.route('/api/run_dantri_script/<int:id>', methods=['POST'])
def run_dantri_script(id):
    # data = request.get_json()  # Lấy dữ liệu từ request body
    # new_link = data.get('Link')
    cursor = db_connection.cursor()
    cursor.execute("select Link from crawler WHERE id = %s", ( id,))
    name = cursor.fetchone()[0]
    db_connection.commit()
    cursor.close()
    # name = Link.replace("%2F", "/")
  
    
    try:
        subprocess.run(['python', 'dantri.py',name])
        response = {"message": "dantri.py executed successfully"}
    except Exception as e:
        response = {"message": str(e)}
    return jsonify(response)
#-------------------render list child newspage-----------------------
@app.route('/api/child-link',methods=['GET'])
def chilNewsPage():
   
    cursor = db_connection.cursor()
    # if namenews:
    #     cursor.execute("SELECT NP.NameNews, cr.id,cr.NameItem, cr.Link FROM NewsPages as NP join crawler as cr on NP.id= cr.idNewsPage where NP.NameNews=%s",(name,) ) 
    # else:
    cursor.execute("SELECT NP.NameNews, cr.id,cr.NameItem, cr.Link FROM NewsPages as NP join crawler as cr on NP.id= cr.idNewsPage" ) 
         # Chọn cả hai cột Link và NameNews
    ChildNewsPapers = cursor.fetchall()
    cursor.close()
    # Trả về dữ liệu dưới dạng list các đối tượng JSON
    ChildNewsPaper_list = []
    for newspage in ChildNewsPapers:
        Childnewspage_dict = {
            "Id": newspage[1],
            "Link": newspage[3],  # Truy cập giá trị của cột Link
            "NameNews": newspage[0],
            "NameItem": newspage[2],
        }
        ChildNewsPaper_list.append(Childnewspage_dict)
    
    return jsonify(ChildNewsPaper_list)
# -------------------------------delete crawler---------------------------------
@app.route('/api/child-link/<int:id>',methods=['DELETE'])
def delete_chilNewsPage(id):
    cursor = db_connection.cursor()
    cursor.execute("DELETE FROM crawler WHERE id = %s", (id,))
    db_connection.commit()
    cursor.close()
    return jsonify({"message": "Article deleted successfully"})


#  --------------------------edit crawler----------------------------
@app.route('/api/child-link/<int:id>', methods=['PUT'])
def edit_crawler (id):
    data = request.get_json()  # Lấy dữ liệu từ request body
    crawl_name = data.get('NameItem')
    print(crawl_name)
    crawl_link = data.get('Link')

    cursor = db_connection.cursor()
    cursor.execute("UPDATE crawler  SET NameItem = %s, Link = %s WHERE id = %s", (crawl_name, crawl_link, id))
    db_connection.commit()
    cursor.close()

    return jsonify({"message": "Article updated successfully"})
#-----------------------------------add new crawler -----------------------
@app.route('/api/child-link', methods=['POST'])
def add_crawler():
    data = request.json  # Lấy dữ liệu gửi từ frontend
    nameNews= data.get('NameNews')
    print(nameNews)
    nameItem= data.get('NameItem')
    link = data.get('Link')
    cursor = db_connection.cursor()
    cursor.execute("select id from NewsPages new WHERE NameNews = %s", ( nameNews,))
    
    row = cursor.fetchone()

    if row is not None:
        id = int (row[0])
        cursor.execute("INSERT INTO crawler (NameItem, Link, idNewsPage) VALUES (%s, %s, %s)", (nameItem, link, id))
        db_connection.commit()
        cursor.close()
        return jsonify({"message": "Article added successfully"})
    else:
        cursor.close()
        return jsonify({"error": "NewsPage not found"})
if __name__ == '__main__':
    app.run(debug=True)
