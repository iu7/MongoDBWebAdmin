#!/usr/bin/env python
# -*- coding: utf-8 -*-

import pymongo
import flask


flask_server = flask.Flask(__name__)
flask_server.jinja_env.trim_blocks = True
mongo_client = pymongo.MongoClient('localhost', 27017)


@flask_server.route('/')
def root():
    c = {x: mongo_client[x].collection_names(False)
         for x in mongo_client.database_names()}
    return flask.render_template('index.html',
                                 database_names=mongo_client.database_names(),
                                 collections=c,
                                 submit_target=flask.url_for('query_result'))


@flask_server.route('/query_result', methods=['POST'])
def query_result():
    database_name = flask.request.form['database_name']
    query_text = flask.request.form['query_text']
    result = mongo_client[database_name].eval(query_text)
    return flask.render_template('query_result.html', result_text=result)


if __name__ == '__main__':
    flask_server.run(debug=True)
