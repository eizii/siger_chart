import requests
from bs4 import BeautifulSoup
import json
import time
from urllib.parse import urljoin
import re

# --- グローバル設定 ---
BASE_URL = "https://www.tabako-sakuranbo.co.jp/"
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
}

def get_soup(url):
    """URLからBeautifulSoupオブジェクトを取得するヘルパー関数"""
    try:
        response = requests.get(url, headers=HEADERS)
        response.raise_for_status()
        response.encoding = response.apparent_encoding # 文字化け対策
        return BeautifulSoup(response.content, 'html.parser')
    except requests.exceptions.RequestException as e:
        print(f"  !!エラー: {url} の取得に失敗しました: {e}")
        return None

def get_brand_page_links(category_url):
    """ブランド一覧ページから、各ブランドのページURLを収集する"""
    print(f"ステップ1: ブランド一覧ページから各ブランドのリンクを収集中...\n -> {category_url}")
    soup = get_soup(category_url)
    if not soup:
        return []

    links = []
    # ブランドへのリンクは #group_list の中の .group_box > a にある
    group_list = soup.find('div', id='group_list')
    if group_list:
        brand_boxes = group_list.find_all('div', class_='group_box')
        for box in brand_boxes:
            link_tag = box.find('a')
            if link_tag and link_tag.has_attr('href'):
                # 相対URLを絶対URLに変換
                full_url = urljoin(BASE_URL, f"goods/{link_tag['href']}")
                links.append(full_url)

    unique_links = sorted(list(set(links)))
    print(f" -> {len(unique_links)}件のブランドリンクを発見しました。")
    return unique_links

def get_product_details(product_url):
    """商品詳細ページから詳細情報を抽出する"""
    print(f"    -> 商品詳細を取得中: {product_url}")
    soup = get_soup(product_url)
    if not soup:
        return None

    details = {'product_url': product_url}

    # 商品名
    name_tag = soup.find('p', class_='red3')
    details['name'] = name_tag.strong.text.strip() if name_tag and name_tag.strong else None

    # 画像URL
    img_tag = soup.find('div', class_='img_goods_big')
    if img_tag and img_tag.find('img'):
        img_src = img_tag.find('img')['src']
        # 相対URL ('../img/...') を絶対URLに変換
        details['image_url'] = urljoin(product_url, img_src)
    else:
        details['image_url'] = None

    # スペック情報（タール、ニコチン、価格など）
    # div.b10 の中のテーブルに情報がある
    spec_div = soup.find('div', class_='b10')
    if spec_div:
        text = spec_div.get_text(separator=' ')
        # 正規表現を使って情報を抽出
        tar_match = re.search(r'タール\s*：\s*([\d\.]+\s*mg)', text)
        nicotine_match = re.search(r'ニコチン\s*：\s*([\d\.]+\s*mg)', text)
        quantity_match = re.search(r'入数/1個\s*：\s*(\d+\s*本)', text)
        price_match = re.search(r'価格/1個\s*：\s*([\d,]+\s*円)', text)

        details['tar'] = tar_match.group(1).strip() if tar_match else None
        details['nicotine'] = nicotine_match.group(1).strip() if nicotine_match else None
        details['quantity'] = quantity_match.group(1).strip() if quantity_match else None
        details['price'] = price_match.group(1).strip() if price_match else None

    # 商品説明
    # スペック情報の後のテーブル内にある
    desc_table = spec_div.find_next('table')
    if desc_table and desc_table.find_next('table'):
        desc_td = desc_table.find_next('table').find('td')
        if desc_td:
            details['description'] = desc_td.text.strip()
        else:
            details['description'] = None
    else:
        details['description'] = None

    return details

def scrape_sakuranbo_store():
    """
    たばこ専門店さくらんぼのサイトから紙巻日本たばこの情報をスクレイピングするメイン関数
    """
    # 開始URL (紙巻 日本たばこ カテゴリ)
    start_url = "https://www.tabako-sakuranbo.co.jp/goods/c02.php"

    # ステップ1: ブランド一覧ページから各ブランドページへのリンクを取得
    brand_links = get_brand_page_links(start_url)
    if not brand_links:
        print("ブランドリンクが取得できませんでした。処理を終了します。")
        return

    all_products = []

    # ステップ2: 各ブランドページを巡回
    print("\nステップ2: 各ブランドページを巡回し、商品情報を収集します...")
    for brand_url in brand_links:
        print(f"\n  ブランドページを処理中: {brand_url}")

        soup = get_soup(brand_url)
        if not soup:
            continue

        # 銘柄一覧ページから各商品の詳細ページへのリンクを収集
        product_containers = soup.find_all('div', class_='goods_line_waku')
        product_links = []
        for container in product_containers:
            link_tag = container.find('a')
            if link_tag and link_tag.has_attr('href'):
                # 相対URLを絶対URLに変換
                full_url = urljoin(brand_url, link_tag['href'])
                product_links.append(full_url)

        unique_product_links = sorted(list(set(product_links)))
        print(f"  -> {len(unique_product_links)}件の商品を発見。詳細情報を取得します。")

        # ステップ3: 各商品の詳細ページから情報を取得
        for product_url in unique_product_links:
            details = get_product_details(product_url)
            if details:
                # ブランド名を追加
                brand_name_tag = soup.find('h2', class_='goods_title')
                if brand_name_tag:
                    # "紙巻 日本たばこ ウィンストン" -> "ウィンストン"
                    details['brand'] = brand_name_tag.text.strip().split()[-1]
                else:
                    details['brand'] = "不明"
                all_products.append(details)
            time.sleep(0.5) # サーバーへの配慮

    # 最終的なJSONファイルへの書き出し
    output_filename = 'sakuranbo_tobacco_products2.json'
    with open(output_filename, 'w', encoding='utf-8') as f:
        json.dump(all_products, f, ensure_ascii=False, indent=4)

    print(f"\n全ての処理が完了しました。{len(all_products)}件の製品詳細情報を '{output_filename}' に保存しました。")


if __name__ == '__main__':
    scrape_sakuranbo_store()