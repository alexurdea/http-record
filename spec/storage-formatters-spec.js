var storageFormatters = require('../lib/storage-formatters');
var stream = require('stream');
var helperStreams = require('./helpers/streams');

describe('data-formatters', function(){  

  it('should format opening delimiters', function(){
    expect(storageFormatters.startDelimiter('foo')).toEqual('__FOO__\n\n');
  });

  
  it('should format ending delimiters', function(){
    expect(storageFormatters.endDelimiter('foo')).toEqual('\n\n__/FOO__\n\n');
  });


  it('should enclose content in a delimiter', function(){
    expect(storageFormatters.delimitedBlock('foo', 'bar'))
    .toEqual('__FOO__\n\nbar\n\n__/FOO__\n\n');
  });


  describe('should be able to extract a block from a read stream when', function(){
    var streamData, rs, content,
      title = 'sometitle',
      startSeparator = storageFormatters.startDelimiter(title),
      endSeparator = storageFormatters.endDelimiter(title);

    beforeEach(function(){
      streamData = [
        'Lorem ipsum dolor sit amet, consectetur adipisicing elit. ',
        'Blanditiis nisi facere perferendis suscipit beatae rerum ab quod aut voluptas ',
        'quis aspernatur nesciunt consequuntur ex sapiente possimus repellat quam ',
        'accusamus velit.'
      ];
    });

    it('start separator comes in with first chunck, end separator with last chunck', function(done){
      content = streamData.slice(0, streamData.length).join('');
      streamData[0] = startSeparator + streamData[0];
      streamData[streamData.length - 1] = streamData[streamData.length - 1] + endSeparator;

      rs = new helperStreams.ReadStream({
        data: streamData
      });

      storageFormatters.getDelimitedBlock(title, rs)
      .then(function(blockContent){
        expect(blockContent).toEqual(content);
        done();
      });
    });


    it('start separator comes in separate first chunck, end separator in separate last chunck', function(done){
      content = streamData.slice(0).join('');
      streamData.unshift(startSeparator);
      streamData.push(endSeparator);

      rs = new helperStreams.ReadStream({
        data: streamData
      });
      
      storageFormatters.getDelimitedBlock(title, rs)
      .then(function(blockContent){
        expect(blockContent).toEqual(content);
        done();
      });
    });


    it('start separator, content and end separator are all in one chunck', function(done){      
      content = streamData.reduce(function(s, item){
        return s + item;
      }, '');
      streamData = [ startSeparator + content + endSeparator];

      rs = new helperStreams.ReadStream({
        data: streamData
      });
      
      storageFormatters.getDelimitedBlock(title, rs)
      .then(function(blockContent){
        expect(blockContent).toEqual(content);
        done();
      });
    });

    it('the block is not present => returns null, displays warning', function(done){
      rs = new helperStreams.ReadStream({
        data: streamData
      });

      storageFormatters.getDelimitedBlock(title, rs)
      .then(function(blockContent){
        expect(blockContent).toEqual(null);
        done();
      });
    });


  });

});