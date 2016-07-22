from flask import Flask, render_template, request

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


@app.route('/get_rssfeed_news/', methods=['GET'])
def get_feed_news():
    url = request.args.get('feed_url')
    feed = feedparser.parse(url)
    limit = 10
    news = ''

    for entry in feed['entries'][:limit]:
        news += '<div class="feednews"><div class="feednews-title"><a href="' + entry['link'] + '" target="_blank">' + \
                entry['title'] + '</a></div><div class="feednews-description"><p>' + entry['summary'] + '</p></div></div>'

    return news


if __name__ == '__main__':
    app.run()
