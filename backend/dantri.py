from selenium import webdriver
from selenium.webdriver.chrome.service import Service as ChromeService
from selenium.webdriver.common.by import By
from webdriver_manager.chrome import ChromeDriverManager
import os
from urllib.request import urlretrieve
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait
import sys
# Tạo options cho trình duyệt Chrome
chrome_options = webdriver.ChromeOptions()
chrome_options.add_argument("--headless")  # Chạy ở chế độ headless

# Khởi tạo trình duyệt Chrome với options đã cấu hình
driver = webdriver.Chrome(service=ChromeService(ChromeDriverManager().install()), options=chrome_options)
def crawl_content(url):
    driver.get(url)
    
    title = driver.find_element(By.TAG_NAME, "h1").text
    str= ['@', '"', "'", '!','/',':','\\','?']

    path = ''.join(ky_tu for ky_tu in title if ky_tu not in str)
    folder_path = "dantri"
    file_name = path +".txt"
    if not os.path.exists(folder_path):
        os.makedirs(folder_path)
    file_path = os.path.join(folder_path, file_name)
    if not os.path.exists(file_path):
        with open(file_path, "a", encoding="utf-8") as file:
            title_element = driver.find_element(By.TAG_NAME, "h1").text
            summary=driver.find_element(By.TAG_NAME, "h2").text
            contents=driver.find_elements(By.CSS_SELECTOR, "div>p") 
            times = driver.find_element(By.TAG_NAME,"time").text
            noteImg= driver.find_element(By.CSS_SELECTOR, "figcaption > p").text 
            # get img
            WebDriverWait(driver, 20).until(EC.presence_of_element_located((By.CSS_SELECTOR, "figure > img")))


            # image_element = driver.find_element(By.CSS_SELECTOR, "figure > img")
            file.write("Title: " + title_element + "\n")
            file.write("Time: " + times+ "\n")
            file.write("summary: " + summary + "\n")
            file.write("noteImg: " + noteImg + "\n")
            for content in contents:
                file.write(content.text + "\n")
        
            image_element = driver.find_element(By.CSS_SELECTOR, "figure>img") if driver.find_element(By.CSS_SELECTOR, "figure>img") else None
            if image_element:
                try:
                    WebDriverWait(driver, 20).until(EC.presence_of_element_located((By.CSS_SELECTOR, "figure > img[src]")))
                    image_src = image_element.get_attribute("src")
                    image_filename = os.path.basename(image_src)
                    save_path = "../frontend/public/images/"+image_filename
                    urlretrieve(image_src, save_path)
                    file.write("img: " + save_path + "\n")
                except:
                    print("lỗi")
            print(title)
    else:
        print('file đã tồn tại')
    driver.back()

def crawl_page(url):
    driver.get(url)
    article_links=[]
    title_element = driver.find_elements(By.CSS_SELECTOR, "h3.article-title > a")
    for result in title_element:
        link = result.get_attribute("href")
        article_links.append(link)
    for url in article_links:
        crawl_content(url)


    next_button = driver.find_element(By.CSS_SELECTOR, "a.next") if driver.find_elements(By.CSS_SELECTOR, "a.next") else None
    print("================================================================")
    print(next_button)
    if next_button:
        next_button.click()
        crawl_page(driver.current_url)  # Đệ quy để lấy dữ liệu từ trang tiếp theo
# # URL ban đầu
# initial_url = "https://dantri.com.vn/the-gioi.htm"
# crawl_page(initial_url)
if __name__ == '__main__':
    if len(sys.argv) != 2:
        print("Usage: python dantri.py <url>")
        sys.exit(1)
    url = sys.argv[1]
    crawl_page(url)

driver.quit()
