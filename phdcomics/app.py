from flask import Flask, render_template, request, jsonify

from bs4 import BeautifulSoup
import urllib2
import re
from random import randint

app = Flask(__name__)


@app.route('/')
def index(name='index'):
    return render_template('index.html', name=name)


@app.route('/get_latest_id/', methods=['POST'])
def get_latest_id():
    url = 'http://phdcomics.com/gradfeed.php'
    content = urllib2.urlopen(url).read()
    soap = BeautifulSoup(content, 'html.parser')
    pattern = '(?:http://www\.phdcomics\.com/comics\.php\?f=)(\d+)'
    latest_id = \
        max([int(re.search(pattern, link.text).group(1))
             for link in soap.find_all('link', text=re.compile(pattern))])
    return jsonify({'latestId': latest_id})


@app.route('/get_phdcomics/', methods=['POST'])
def get_phdcomics():
    latest_id = int(request.form.get('latestId'))
    random_id = randint(1, latest_id)
    url = 'http://www.phdcomics.com/comics/archive.php?comicid=%d' % random_id
    content = urllib2.urlopen(url).read()
    soap = BeautifulSoup(content, 'html.parser')
    comics_src = soap.find_all('img', id='comic')[0].attrs.get('src')
    return jsonify({'src': comics_src})


if __name__ == '__main__':
    app.run()
