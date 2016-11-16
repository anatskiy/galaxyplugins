from flask import Flask, render_template, jsonify

import random

app = Flask(__name__)


@app.route('/')
def index(name='index'):
    return render_template('index.html', name=name)


@app.route('/api/webhooks/time_estimator/get_data')
def get_data(name='get_data', methods=['GET']):
    average = 0

    # data = [2, 3, 2, 3, 2, 2, 2, 2, 2, 2, 2, 2, 3, 2, 2, 2, 3, 2, 2, 2,
    #         2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
    #         2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 2, 2, 2, 2, 3, 2, 3, 3, 2,
    #         2, 2, 2, 2, 2, 2, 3, 2, 2, 3, 3, 3, 2, 2, 2, 4, 3, 3, 2, 3,
    #         2, 3, 3, 3, 3, 3, 2, 3, 3, 2, 2, 3, 3, 3, 2, 3, 2, 2, 3, 3,
    #         3, 3, 3, 2, 3, 3, 3, 2, 2, 3, 2, 3, 3, 3, 2, 2, 2, 2, 3, 2,
    #         2, 4, 3, 2, 3, 3, 3, 3, 4, 3, 3, 3, 3, 3, 3, 3, 3, 3, 4, 3,
    #         3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 3, 3, 4, 3, 4, 3, 4, 4, 4,
    #         4, 4, 4, 3, 3, 3, 4, 4, 4, 3, 3, 4, 4, 3, 4, 3, 3, 4, 4, 5,
    #         4, 3, 4, 3, 3, 4, 3, 4, 5, 4, 4, 3, 4, 4, 3, 4, 4, 3, 4, 4,
    #         3, 2, 4, 4, 3, 3, 4, 3, 3, 4, 3, 3, 5, 4, 4, 4, 4, 4, 4, 4]

    raw_data = [random.randint(1, 3) for _ in range(150)]
    # raw_data = [random.randint(40, 120) for _ in range(150)]
    # raw_data = [random.randint(5 * 3600, 12 * 3600) for _ in range(150)]

    if raw_data:
        average = round(sum(raw_data) / float(len(raw_data)), 1)

    if (average < 60):
        units = 'sec'
        data = raw_data
    elif average >= 60 and average < 3600:
        units = 'min'
        data = list(map(lambda x: round(x / 60, 1), raw_data))
    elif average >= 3600:
        units = 'h'
        data = list(map(lambda x: round(x / 3600, 1), raw_data))

    return jsonify({
        'data': [{'y': y} for y in data],
        'units': units
    })


if __name__ == '__main__':
    app.run()
