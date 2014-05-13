#!/usr/bin/env python
# -*- coding: utf-8 -*-

import pymongo
import flask
import json
import bson

flask_server = flask.Flask(__name__)
flask_server.jinja_env.trim_blocks = True
mongo_client = pymongo.MongoClient('localhost', 27017)

@flask_server.route('/load/document')
def load_document():
    database_name = flask.request.args['database_name']
    collection_name = flask.request.args['collection_name']
    document_id = flask.request.args['document_id']
    database = mongo_client[database_name]
    collection = database[collection_name]
    object = collection.find({u'_id':bson.ObjectId(document_id)})[0]
    del object[u'_id']
    return flask.render_template('document.html', object=object, render_primitive=json.dumps) 

@flask_server.route('/load/collection')
def load_collection():
    database_name = flask.request.args['database_name']
    collection_name = flask.request.args['collection_name']
    database = mongo_client[database_name]
    collection = database[collection_name]
    document_ids = [str(document[u'_id']) for document in collection.find({}, {'_id':1})]
    return flask.render_template('collection.html', document_ids=document_ids)

@flask_server.route('/load/database')
def load_database():
    database_name = flask.request.args['database_name']
    database = mongo_client[database_name]
    collection_names = database.collection_names()
    return flask.render_template('database.html', collection_names=collection_names)

@flask_server.route('/load/root')
def load_root():
    database_names = mongo_client.database_names()
    return flask.render_template('root.html', database_names=database_names)

@flask_server.route('/')
def index():
    return flask.render_template('index.html')

if __name__ == '__main__':
    flask_server.run(debug=True)
