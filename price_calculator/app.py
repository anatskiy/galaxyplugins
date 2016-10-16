from flask import Flask, render_template, jsonify
import yaml

app = Flask(__name__)


@app.route('/')
def index(name='index'):
    return render_template('index.html', name=name)


@app.route('/api/webhooks/price_calculator/get_data')
def get_data(name='get_data', methods=['GET']):
    # Only for Flask plugin version
    config = None
    with open('config.yml', 'r') as f:
        config = yaml.load(f)

    # Main code
    data = []

    try:
        for provider in config['providers']:
            data.append({
                'name': provider['name'],
                'currency': provider['currency'],
                'value': provider['name'].lower().replace(' ', '_'),
                'params': {
                    param_name: param_value
                    for param in provider['params']
                    for param_name, param_value in param.items()
                },
                'controls': provider['controls'],
                'formula': provider['formula']
            })

    except Exception as e:
        print(e)

    return jsonify(data)


if __name__ == '__main__':
    app.run()
