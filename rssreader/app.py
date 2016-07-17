from flask import Flask, render_template, request, jsonify

import feedparser
import json

app = Flask(__name__)


@app.route('/')
def index():
    show_settings = False

    # TODO: add permissions check (later)
    if True:
        show_settings = True

    return render_template('index.html', show_settings=show_settings)


@app.route('/get_rssfeed_news/', methods=['POST'])
def get_feed_news():
    url = request.form.get('feed_url')
    feed = feedparser.parse(url)
    limit = 10

    news = [{
                'title': entry['title'],
                'url': entry['link'],
                'description': entry['summary']
            } for entry in feed['entries'][:limit]]

    return json.dumps(news)


if __name__ == '__main__':
    app.run()
