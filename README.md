HTTP get /hello?lalala=1
HTTPS post /hello
  user=me
  password=somepass

gzip -> plain text
get headers

use a simple database - url -> code, header file id, body file id

transparently follow redirects


run:
  forever start index.js &
  jasmine-node spec/ --autotest --watch ./lib/ &