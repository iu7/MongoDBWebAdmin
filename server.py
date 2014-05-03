#!/usr/bin/env python
# -*- coding: utf-8 -*-

import pymongo
import flask
import json
import bson

flask_server = flask.Flask(__name__)
flask_server.jinja_env.trim_blocks = True
mongo_client = pymongo.MongoClient('localhost', 27017)

@flask_server.route('/get_object')
def get_object():
    database_name = flask.request.args['database_name']
    collection_name = flask.request.args['collection_name']
    document_id = bson.ObjectId(flask.request.args['document_id'])
    database = mongo_client[database_name]
    collection = database[collection_name]
    object = collection.find({u'_id':document_id})[0]
    del object[u'_id']
    return json.dumps(object)

@flask_server.route('/get_document_ids')
def get_document_ids():
    database_name = flask.request.args['database_name']
    collection_name = flask.request.args['collection_name']
    database = mongo_client[database_name]
    collection = database[collection_name]
    document_ids = [str(document[u'_id']) for document in collection.find({}, {'_id':1})]
    return json.dumps(document_ids)

@flask_server.route('/get_collection_names')
def get_collection_names():
    database_name = flask.request.args['database_name']
    database = mongo_client[database_name]
    collection_names = database.collection_names()
    return json.dumps(collection_names)

@flask_server.route('/get_database_names')
def get_database_names():
    database_names = mongo_client.database_names()
    return json.dumps(database_names)

@flask_server.route('/')
def index():
    return flask_server.send_static_file('index.html')

if __name__ == '__main__':
    flask_server.run(debug=True)
