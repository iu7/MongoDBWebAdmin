#!/usr/bin/env python
# -*- coding: utf-8 -*-

from flask import *
from pymongo import *

flask_server = Flask(__name__)
mongo_client = MongoClient('localhost', 27017)

@flask_server.route('/')
def root():
    return '''
	<form name="test" method="post" action="/execute">
	  <p>Database:<input type="text" name="database"></p>
	  <p>Query:<br>
	  <textarea name="query" cols="80" rows="25"></textarea><br>
	  <input type="submit" value="Execute!"></p>
	</form>
    '''

@flask_server.route('/execute', methods = ['POST'])
def foo():
    database = request.form['database']
    query = request.form['query']
    result = mongo_client[database].eval(query)
    return '''
      <p>Result:<br>
      <textarea name="result" cols="80" rows="25">{0}</textarea><p>
    '''.format(result)

if __name__ == '__main__':
    flask_server.run(debug = True)

