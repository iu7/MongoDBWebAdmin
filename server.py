#!/usr/bin/env python
# -*- coding: utf-8 -*-

import functools
import pymongo
import flask
import json
import bson

flask_server = flask.Flask(__name__)
mongo_client = pymongo.MongoClient('localhost', 27017)

@flask_server.route('/render-empty-pair')
def render_empty_pair():
    last = json.loads(flask.request.args['last'])
    return flask.render_template('empty_pair.html', last=last, render_primitive=json.dumps)
    
@flask_server.route('/render-empty-item')
def render_empty_item():
    last = json.loads(flask.request.args['last'])
    return flask.render_template('empty_item.html', last=last, render_primitive=json.dumps) 

@flask_server.route('/render-object')
def render_object():
    object = json.loads(flask.request.args['json'])
    return flask.render_template('object.html', object=object, render_primitive=json.dumps) 

#~ @flask_server.route('/load-document')
#~ def load_document():
    #~ database_name = flask.request.args['database_name']
    #~ collection_name = flask.request.args['collection_name']
    #~ document_id = flask.request.args['document_id']
    #~ database = mongo_client[database_name]
    #~ collection = database[collection_name]
    #~ object = collection.find({u'_id':bson.ObjectId(document_id)})[0]
    #~ del object[u'_id']
    #~ return flask.render_template('document.html', object=object, render_primitive=json.dumps) 
#~ 
#~ @flask_server.route('/load-collection')
#~ def load_collection():
    #~ database_name = flask.request.args['database_name']
    #~ collection_name = flask.request.args['collection_name']
    #~ database = mongo_client[database_name]
    #~ collection = database[collection_name]
    #~ document_ids = [str(document[u'_id']) for document in collection.find({}, {'_id':1})]
    #~ return flask.render_template('collection.html', document_ids=document_ids)


def needs_mongo_client(handler):
    @functools.wraps(handler)
    def needs_mongo_client_wrapper(*args, **kwargs):
        server_address = flask.request.args['server_address']
        if server_address == "":
            return flask.render_template('connection-error.html');
        try:
            mongo_client = pymongo.MongoClient(server_address)
            response = handler(*args, mongo_client=mongo_client, **kwargs)
            mongo_client.close();
            return response
        except pymongo.errors.ConnectionFailure:
            return flask.render_template('connection-error.html');
    return needs_mongo_client_wrapper
    
def needs_database(handler):
    @functools.wraps(handler)
    @needs_mongo_client
    def needs_database_wrapper(mongo_client, *args, **kwargs):
        database_name = flask.request.args['database_name']
        login = flask.request.args['login']
        if login == '':
            login = None
        password = flask.request.args['password']
        if password == '':
            password = None
        database = mongo_client[database_name]
        try:
            if login:
                database.authenticate(login, password)
            response = handler(*args, mongo_client=mongo_client, database=database, **kwargs)
            if login:
                database.logout();
        except pymongo.errors.PyMongoError:
            return flask.render_template('authentication-error.html')
        return response
    return needs_database_wrapper

@flask_server.route('/collection-names')
@needs_database
def get_collection_names(mongo_client, database):
    collection_names = database.collection_names(include_system_collections=False)
    return flask.render_template('collection-name-selector.html', collection_names=collection_names)

@flask_server.route('/database-names')
@needs_mongo_client
def get_database_names(mongo_client):
    database_names = mongo_client.database_names()
    return flask.render_template('database-name-selector.html', database_names=database_names)

@flask_server.route('/')
def index():
    return flask.render_template('index.html')

if __name__ == '__main__':
    flask_server.run(debug=True)
