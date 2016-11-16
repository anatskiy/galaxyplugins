from flask import Flask, render_template, jsonify

app = Flask(__name__)


@app.route('/')
def index(name='index'):
    return render_template('index.html', name=name)


@app.route('/api/webhooks/time_estimator/get_data')
def get_data(name='get_data', methods=['GET']):
    average = 0

    data = [2, 3, 2, 3, 2, 2, 2, 2, 2, 2, 2, 2, 3, 2, 2, 2, 3, 2, 2, 2,
            2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
            2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 2, 2, 2, 2, 3, 2, 3, 3, 2,
            2, 2, 2, 2, 2, 2, 3, 2, 2, 3, 3, 3, 2, 2, 2, 4, 3, 3, 2, 3,
            2, 3, 3, 3, 3, 3, 2, 3, 3, 2, 2, 3, 3, 3, 2, 3, 2, 2, 3, 3,
            3, 3, 3, 2, 3, 3, 3, 2, 2, 3, 2, 3, 3, 3, 2, 2, 2, 2, 3, 2,
            2, 4, 3, 2, 3, 3, 3, 3, 4, 3, 3, 3, 3, 3, 3, 3, 3, 3, 4, 3,
            3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 3, 3, 4, 3, 4, 3, 4, 4, 4,
            4, 4, 4, 3, 3, 3, 4, 4, 4, 3, 3, 4, 4, 3, 4, 3, 3, 4, 4, 5,
            4, 3, 4, 3, 3, 4, 3, 4, 5, 4, 4, 3, 4, 4, 3, 4, 4, 3, 4, 4,
            3, 2, 4, 4, 3, 3, 4, 3, 3, 4, 3, 3, 5, 4, 4, 4, 4, 4, 4, 4]

    if data:
        average = round(sum(data) / float(len(data)), 1)

    labels = [x for x in range(len(data))]
    average_line = [average for _ in range(len(data))]

    return jsonify({
        'labels': labels,
        'data': data,
        'averageLine': average_line
    })


if __name__ == '__main__':
    app.run()
