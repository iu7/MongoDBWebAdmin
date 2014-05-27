#!/usr/bin/env python
# -*- coding: utf-8 -*-

import functools
import pymongo
import flask
import json
import bson

flask_server = flask.Flask(__name__)
mongo_client = pymongo.MongoClient('localhost', 27017)

@flask_server.route('/render-empty-pair', methods=['POST'])
def render_empty_pair():
    last = json.loads(flask.request.form['last'])
    return flask.render_template('empty_pair.html', last=last)
    
@flask_server.route('/render-empty-item', methods=['POST'])
def render_empty_item():
    last = json.loads(flask.request.form['last'])
    return flask.render_template('empty_item.html', last=last, render_primitive=json.dumps) 

@flask_server.route('/render-object', methods=['POST'])
def render_object():
    object = json.loads(flask.request.form['json'])
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
    def wrapper(*args, **kwargs):
        server_address = flask.request.form['server_address']
        if server_address == '':
            return flask.render_template('error.html', message='Server address is empty.');
        try:
            mongo_client = pymongo.MongoClient(server_address)
            response = handler(*args, mongo_client=mongo_client, **kwargs)
            mongo_client.close();
            return response
        except pymongo.errors.ConnectionFailure:
            return flask.render_template('error.html', message='Unable to connect to server.');
    return wrapper
    
def needs_database(handler):
    @functools.wraps(handler)
    @needs_mongo_client
    def wrapper(mongo_client, *args, **kwargs):
        database_name = flask.request.form['database_name']
        if database_name == '':
            return flask.render_template('error.html', message='Database name is empty.')
        login = flask.request.form['login']
        password = flask.request.form['password']
        database = mongo_client[database_name]
        try:
            if login != '' and password == '':
                return flask.render_template('error.html', message='Password required.')
            if login == '' and password != '':
                return flask.render_template('error.html', message='Login required.')
            if login != '' and password != '':
                database.authenticate(login, password)
            response = handler(*args, mongo_client=mongo_client, database=database, **kwargs)
            if login != '' and password != '':
                database.logout();
        except pymongo.errors.PyMongoError:
            return flask.render_template('error.html', message='Unable to log into database.')
        return response
    return wrapper

def needs_collection(handler):
    @functools.wraps(handler)
    @needs_database
    def wrapper(mongo_client, database, *args, **kwargs):
        collection_name = flask.request.form['collection_name']
        if collection_name == '':
            return flask.render_template('error.html', message='Collection name required.')
        collection = database[collection_name]
        return handler(*args, mongo_client=mongo_client, database=database, collection=collection, **kwargs)
    return wrapper

@flask_server.route('/documents', methods=['POST'])
@needs_collection
def documents(mongo_client, database, collection):
    try:
        selector = json.loads(flask.request.form['selector'])
    except ValueError:
        return flask.render_template('error.html', message='Invalid selector.')
    try:
        projector = json.loads(flask.request.form['projector'])
    except ValueError:
        return flask.render_template('error.html', message='Invalid projector.')
    def fix_id(document):
        if u'_id' in document:
            document[u'_id'] = str(document[u'_id'])
        return document
    documents = [fix_id(document) for document in collection.find(selector, projector if projector != {} else None)]    
    return flask.render_template('documents.html', documents=documents, render_primitive=json.dumps)

@flask_server.route('/collection-names', methods=['POST'])
@needs_database
def collection_names(mongo_client, database):
    collection_names = database.collection_names(include_system_collections=False)
    return flask.render_template('collection.html', collection_names=collection_names)

@flask_server.route('/database-names', methods=['POST'])
@needs_mongo_client
def database_names(mongo_client):
    database_names = mongo_client.database_names()
    return flask.render_template('database.html', database_names=database_names)

@flask_server.route('/')
def index():
    return flask.render_template('index.html')

if __name__ == '__main__':
    flask_server.run(debug=True)
