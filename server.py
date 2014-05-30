#!/usr/bin/env python
# -*- coding: utf-8 -*-

import functools
import pymongo
import flask
import json
import bson

flask_server = flask.Flask(__name__)

def remove_id_if(object, condition):
    if condition:
        del object['_id']
    return object
    
flask_server.jinja_env.globals.update(remove_id_if=remove_id_if)

flask_server.jinja_env.globals.update(render_primitive=json.dumps)


@flask_server.route('/render-empty-pair', methods=['POST'])
def render_empty_pair():
    last = json.loads(flask.request.form['last'])
    return flask.render_template('empty_pair.html', last=last)
    
    
@flask_server.route('/render-empty-item', methods=['POST'])
def render_empty_item():
    last = json.loads(flask.request.form['last'])
    return flask.render_template('empty_item.html', last=last) 


@flask_server.route('/render-object', methods=['POST'])
def render_object():
    object = json.loads(flask.request.form['json'])
    return flask.render_template('object.html', object=object) 


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


def fix_document_id(document):
    document[u'_id'] = str(document[u'_id'])
    return document


@flask_server.route('/find-documents', methods=['POST'])
@needs_collection
def find_documents(mongo_client, database, collection):
    try:
        selector = json.loads(flask.request.form['selector'])
    except ValueError:
        return flask.render_template('error.html', message='Invalid selector.')
    try:
        projector = json.loads(flask.request.form['projector'])
    except ValueError:
        return flask.render_template('error.html', message='Invalid projector.')
    exclude_id = u'_id' in projector and projector[u'_id'] == False
    if exclude_id:
         del projector[u'_id']
    if projector == {}:
        projector = None
    documents = [fix_document_id(document) for document in collection.find(selector, projector)]    
    return ''.join([flask.render_template('document.html', document=document, exclude_id=exclude_id) for document in documents])


@flask_server.route('/new-document', methods=['POST'])
@needs_collection
def new_document(mongo_client, database, collection):
    document_id = str(collection.insert({}, manipulate=True))
    return flask.render_template('document.html', document={u'_id': document_id}, exclude_id=False)


@flask_server.route('/update-document', methods=['POST'])
@needs_collection
def update_document(mongo_client, database, collection):
    document_id = bson.ObjectId(flask.request.form['document_id'])
    try:
        document_object = json.loads(flask.request.form['document_text'])
    except ValueError:
        return flask.render_template('error.html', message='Invalid document.')
    document_object[u'_id'] = document_id
    collection.update({u'_id': document_id}, document_object)
    return ''


@flask_server.route('/reload-document', methods=['POST'])
@needs_collection
def reload_document(mongo_client, database, collection):
    document_id = bson.ObjectId(flask.request.form['document_id'])
    try:
        projector = json.loads(flask.request.form['projector'])
    except ValueError:
        return flask.render_template('error.html', message='Invalid projector.')
    exclude_id = u'_id' in projector and projector[u'_id'] == False
    if exclude_id:
         del projector[u'_id']
    if projector == {}:
        projector = None
    document_object = fix_document_id(collection.find({u'_id': document_id}, projector)[0])
    document_object = remove_id_if(document_object, exclude_id)
    return flask.render_template('object.html', object=document_object)


@flask_server.route('/delete-document', methods=['POST'])
@needs_collection
def delete_document(mongo_client, database, collection):
    document_id = bson.ObjectId(flask.request.form['document_id'])
    collection.remove({u'_id': document_id})
    return ''


@flask_server.route('/open-collection', methods=['POST'])
@needs_collection
def open_collection(mongo_client, database, collection):
    collection_stats = database.command('collstats', flask.request.form['collection_name'])   
    return flask.render_template('collection-stats.html', collection_stats=collection_stats) + \
           flask.render_template('documents.html',)

@flask_server.route('/open-database', methods=['POST'])
@needs_database
def open_database(mongo_client, database):
    database_stats = database.command('dbstats')
    collection_names = database.collection_names(include_system_collections=False)
    return flask.render_template('database-stats.html', database_stats=database_stats) + \
           flask.render_template('collection.html', collection_names=collection_names)


@flask_server.route('/connect', methods=['POST'])
@needs_mongo_client
def connect(mongo_client):
    database_names = mongo_client.database_names()
    return flask.render_template('database.html', database_names=database_names)


@flask_server.route('/')
def index():
    return flask.render_template('index.html')


@flask_server.route('/execute-command', methods=['POST'])
@needs_database
def execute_command(mongo_client, database):
    return flask.render_template('execute-command.html')

@flask_server.route('/execute', methods=['POST'])
@needs_database
def execute(mongo_client, database):
    command = json.loads(flask.request.form['command'])
    try:
        result = database.command(command)
        return flask.render_template('object.html', object=result)
    except pymongo.errors.PyMongoError:
        return flask.render_template('error.html', message='Invalid command.')


if __name__ == '__main__':
    flask_server.run(debug=True)
