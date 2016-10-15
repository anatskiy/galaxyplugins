import logging

log = logging.getLogger(__name__)


def main(trans, webhook):
    news = []

    try:
        # Third-party dependency
        try:
            import feedparser
        except ImportError as e:
            log.exception(e)
            return []

        urls = webhook.config['feeds']
        limit = webhook.config['news_per_feed']

        for index, url in enumerate(urls):
            feed = feedparser.parse(url)
            news.append({
                'index': index,
                'title': feed.feed.title,
                'news': [
                    {
                        'title': entry['title'],
                        'link': entry['link'],
                        'description': entry['summary']
                    }
                    for entry in feed.entries[:limit]
                    ]
            })

    except Exception as e:
        log.exception(e)

    return news
