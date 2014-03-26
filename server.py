#!/usr/bin/env python
# -*- coding: utf-8 -*-

from pymongo import *
from flask import *

flask_server = Flask(__name__)
mongo_client = MongoClient('localhost', 27017)

@flask_server.route('/')
def root():
    return render_template('root.html',
                           database_names = mongo_client.database_names(),
                           submit_target = url_for('query_result'))

@flask_server.route('/query_result', methods = ['POST'])
def query_result():
    database_name = request.form['database_name']
    query_text = request.form['query_text']
    result = mongo_client[database_name].eval(query_text)
    return render_template('query_result.html', result_text = result)

if __name__ == '__main__':
    flask_server.run(debug = True)

