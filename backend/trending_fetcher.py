"""
GitHub Trending 爬虫（修复版）
抓取 GitHub 热门仓库数据
"""

import requests
from bs4 import BeautifulSoup
import json
import os
from datetime import datetime
import time
import re

# 数据存储路径
DATA_DIR = 'data'
DATA_FILE = os.path.join(DATA_DIR, 'github_trending.json')

# GitHub Trending URL
TRENDING_URL = 'https://github.com/trending'


def fetch_trending(language='', since='daily'):
    """
    抓取 GitHub Trending 数据

    Args:
        language: 编程语言，空字符串表示全部
        since: 时间范围 - daily, weekly, monthly

    Returns:
        list: 热门仓库列表
    """
    params = {}
    if language:
        params['language'] = language
    if since:
        params['since'] = since

    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
    }

    try:
        print(f"正在抓取 GitHub Trending: 语言={language or '全部'}, 时间={since}")
        response = requests.get(TRENDING_URL, params=params, headers=headers, timeout=30)
        response.raise_for_status()

        soup = BeautifulSoup(response.text, 'html.parser')

        repositories = []

        # 查找所有仓库条目 - 尝试多种选择器
        repo_articles = soup.find_all('article', class_='Box-row')
        if not repo_articles:
            # 尝试其他可能的类名
            repo_articles = soup.find_all('div', class_='js-navigation-item')
        if not repo_articles:
            # 直接查找所有包含链接的列表项
            repo_articles = soup.select('li[itemprop="itemListElement"]')

        print(f"找到 {len(repo_articles)} 个仓库条目")

        for article in repo_articles:
            try:
                repo = {}

                # 查找仓库链接 - 使用更通用的方式
                repo_link = article.find('a', href=re.compile(r'^/[\w-]+/[\w-]+$'))
                if not repo_link:
                    repo_link = article.find('a', href=re.compile(r'^/[\w-]+/[\w-]+'))

                if repo_link:
                    # 从链接提取作者和仓库名
                    href_parts = repo_link['href'].strip('/').split('/')
                    if len(href_parts) >= 2:
                        repo['author'] = href_parts[0]
                        repo['name'] = href_parts[1]
                        repo['url'] = 'https://github.com' + repo_link['href']

                    # 如果链接元素有文本，尝试从中提取仓库名
                    link_text = repo_link.get_text(strip=True)
                    if link_text and '/' in link_text:
                        parts = link_text.split('/')
                        if len(parts) == 2:
                            repo['author'] = parts[0].strip()
                            repo['name'] = parts[1].strip()

                # 备用方法：从 h2/h3 标签提取
                if 'name' not in repo:
                    title_element = article.find(['h2', 'h3'])
                    if title_element:
                        title_text = title_element.get_text(strip=True)
                        if '/' in title_text:
                            parts = title_text.split('/')
                            if len(parts) == 2:
                                repo['author'] = parts[0].strip()
                                repo['name'] = parts[1].strip()
                                # 查找链接
                                link_in_title = title_element.find('a')
                                if link_in_title and 'href' in link_in_title:
                                    repo['url'] = 'https://github.com' + link_in_title['href']

                # 如果还是找不到，尝试从其他元素提取
                if 'name' not in repo:
                    # 尝试从所有链接中找到 GitHub 仓库链接
                    all_links = article.find_all('a', href=True)
                    for link in all_links:
                        href = link['href']
                        if href.startswith('/') and len(href.split('/')) == 3:
                            parts = href.strip('/').split('/')
                            if len(parts) == 2 and parts[0] and parts[1]:
                                repo['author'] = parts[0]
                                repo['name'] = parts[1]
                                repo['url'] = 'https://github.com' + href
                                break

                # 描述
                desc_element = article.find('p')
                if desc_element:
                    repo['description'] = desc_element.get_text(strip=True)

                # 编程语言 - 尝试多种方式
                language_element = article.find('span', itemprop='programmingLanguage')
                if not language_element:
                    language_element = article.find('span', class_='d-inline-block')
                if language_element:
                    lang_text = language_element.get_text(strip=True)
                    if lang_text and len(lang_text) < 30:  # 语言名通常很短
                        repo['language'] = lang_text

                # 星标数 - 提取数字
                stars_link = article.find('a', href=re.compile(r'/stargazers'))
                if stars_link:
                    stars_text = stars_link.get_text(strip=True)
                    repo['stars'] = stars_text
                    repo['stars_count'] = parse_count(stars_text)

                # 分支数
                forks_link = article.find('a', href=re.compile(r'/forks'))
                if forks_link:
                    repo['forks'] = forks_link.get_text(strip=True)

                # 今日星标
                today_element = article.find('span', class_=re.compile(r'd-inline'))
                if today_element:
                    today_text = today_element.get_text(strip=True)
                    if 'star' in today_text.lower():
                        repo['today_stars'] = today_text
                        repo['today_stars_count'] = parse_count(today_text)

                # 添加时间戳
                repo['fetched_at'] = datetime.now().isoformat()
                repo['category'] = language or 'all'

                # 只添加有基本信息的仓库
                if 'url' in repo or ('name' in repo and 'author' in repo):
                    repositories.append(repo)

            except Exception as e:
                print(f"解析仓库时出错: {e}")
                continue

        print(f"成功抓取 {len(repositories)} 个仓库")
        return repositories

    except requests.RequestException as e:
        print(f"网络请求失败: {e}")
        return []
    except Exception as e:
        print(f"抓取失败: {e}")
        return []


def parse_count(text):
    """
    将数字文本转换为数值
    如 "1.2k" -> 1200, "5k" -> 5000
    """
    text = text.lower().strip()
    multipliers = {'k': 1000, 'm': 1000000}

    for suffix, multiplier in multipliers.items():
        if suffix in text:
            try:
                # 提取数字部分
                number = float(re.sub(r'[^\d.]', '', text))
                return int(number * multiplier)
            except:
                return 0

    try:
        return int(text.replace(',', '').strip())
    except:
        return 0


def fetch_all_categories():
    """
    抓取所有分类的热门仓库
    """
    os.makedirs(DATA_DIR, exist_ok=True)

    # 语言列表 - 减少分类以加快抓取速度
    languages = [
        '',
        'python',
        'javascript',
        'typescript',
    ]

    all_data = {
        'updated_at': datetime.now().isoformat(),
        'categories': {}
    }

    for lang in languages:
        try:
            repos = fetch_trending(language=lang, since='daily')

            if repos:
                category_key = lang if lang else 'all'
                all_data['categories'][category_key] = repos

            # 避免请求过快
            time.sleep(2)

        except Exception as e:
            print(f"抓取 {lang} 时出错: {e}")
            continue

    # 保存到文件
    with open(DATA_FILE, 'w', encoding='utf-8') as f:
        json.dump(all_data, f, ensure_ascii=False, indent=2)

    print(f"\n数据已保存到: {DATA_FILE}")
    print(f"总共抓取 {len(all_data['categories'])} 个分类")
    return all_data


def load_cached_data():
    """
    加载缓存的数据
    """
    if os.path.exists(DATA_FILE):
        try:
            with open(DATA_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        except:
            pass
    return None


if __name__ == '__main__':
    print("=" * 50)
    print("GitHub Trending 爬虫")
    print("=" * 50)

    # 抓取最新数据
    data = fetch_all_categories()

    # 显示统计
    print("\n" + "=" * 50)
    print("抓取完成！")
    print("=" * 50)
    for category, repos in data['categories'].items():
        print(f"{category or '全部'}: {len(repos)} 个仓库")
        if repos:
            print(f"  示例: {repos[0].get('author', 'N/A')}/{repos[0].get('name', 'N/A')}")
