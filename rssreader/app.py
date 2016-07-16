from flask import Flask, render_template, request, jsonify

app = Flask(__name__)


@app.route('/')
def index(name='index'):
    return render_template('index.html', name=name)


if __name__ == '__main__':
    app.run()
