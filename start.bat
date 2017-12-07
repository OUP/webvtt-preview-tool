@echo off

start "" http://localhost:8082/

cd htdocs

start ../python -m SimpleHTTPServer 8082



