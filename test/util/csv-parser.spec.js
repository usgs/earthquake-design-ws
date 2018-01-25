/* global afterEach, beforeEach, describe, it */
'use strict';


const CsvParser = require('../../src/lib/util/csv-parser'),
    expect = require('chai').expect,
    sinon = require('sinon'),
    stream = require('stream');


const StringStream = function (str) {
  let s;

  s = new stream.Readable();
  s._read = () => {
    s.push(str);
    s.push(null);
  };

  return s;
};


describe('util/csv-parser', () => {
  describe('constructor', () => {
    it('is defined', () => {
      expect(typeof CsvParser).to.equal('function');
    });
  });

  describe('destroy', () => {
    it('can be called repeatedly', () => {
      let parser;

      parser = CsvParser({url: ''});
      parser.destroy();
      parser.destroy();
    });
  });

  describe('onData', () => {
    it('buffers parsed objects', () => {
      let parser,
          test1,
          test2;

      test1 = {};
      test2 = {};
      parser = CsvParser({url: ''});

      parser.onData(test1);
      expect(parser.data[0]).to.equal(test1);

      parser.onData(test2);
      expect(parser.data[1]).to.equal(test2);

      parser.destroy();
    });
  });

  describe('parse', () => {
    it('parses gzipped urls', (done) => {
      let parser;

      parser = CsvParser({
        url: 'file://' + __dirname + '/../../etc/test.csv.gz'
      });
      parser.parse().then((data) => {
        expect(data).to.deep.equal([
          {
            'header1': 'row1value1',
            'header2': 'row1value2'
          },
          {
            'header1': 'row2value1',
            'header2': 'row2value2'
          }
        ]);
        done();
      }).catch((err) => {
        done(err);
      });
    });

    it('parses a stream', (done) => {
      let parser;

      parser = CsvParser({
        stream: StringStream('header1,header2\nvalue1,value2\n')
      });
      parser.parse().then((data) => {
        expect(data).to.deep.equal([
          {
            'header1': 'value1',
            'header2': 'value2'
          }
        ]);
        done();
      }).catch((err) => {
        done(err);
      });
    });

    it('rejects the promise when there are errors', (done) => {
      let parser;

      parser = CsvParser({
        stream: StringStream('header1,header2\nvalue1,value2,value3\n')
      });
      parser.parse().then(() => {
        done(false);
      }).catch(() => {
        done();
      });
    });

    it('rejects the promise when the urls is invalid', (done) => {
      let parser;

      parser = CsvParser({
        url: 'file://' + __dirname + '../../../etc/doesnotexist.csv.gz'
      });
      parser.parse().then(() => {
        done(false);
      }).catch(() => {
        done();
      });
    });
  });

  describe('parseHeaders', () => {
    it('stores results of splitLine in headers', () => {
      let line,
          parser,
          test;

      line = {};
      parser = CsvParser({url: ''});
      test = {};

      parser._splitLine = sinon.stub();
      parser._splitLine.returns(test);

      parser.parseHeaders(line);
      expect(parser._splitLine.calledWith(line)).to.equal(true);
      expect(parser.headers).to.equal(test);

      parser.destroy();
    });
  });

  describe('parseLine', () => {
    it('treats first line as headers', () => {
      let line1,
          line2,
          parser;

      line1 = 'header1,header2';
      line2 = 'value1,value2';
      parser = CsvParser({url: ''});

      parser.parseLine(line1);
      expect(parser.headers).to.deep.equal(['header1', 'header2']);

      parser.parseLine(line2);
      expect(parser.data[0]).to.deep.equal({
        'header1': 'value1',
        'header2': 'value2'
      });

      parser.destroy();
    });

    it('throws error if header and line column counts differ', () => {
      expect(() => {
        let line1,
            line2,
            parser;

        line1 = 'header1,header2';
        line2 = 'value1,value2,value3';
        parser = CsvParser({url: ''});

        parser.parseLine(line1);
        parser.parseLine(line2);

        parser.destroy();
      }).to.throw(Error);
    });
  });

  describe('_splitLine', () => {
    let parser;

    beforeEach(() => {
      parser = CsvParser({url: ''});
    });

    afterEach(() => {
      parser.destroy();
    });

    it('splits a line without quotes', () => {
      expect(parser._splitLine('header1,header2')).to.deep.equal(
          ['header1', 'header2']);
    });

    it('splits a line with quotes', () => {
      expect(parser._splitLine('"header1","header2"')).to.deep.equal(
          ['header1', 'header2']);
    });

    it('preserves commas between quotes', () => {
      expect(parser._splitLine('"value, with, commas",other value'))
        .to.deep.equal(['value, with, commas', 'other value']);
    });

    it('throws error when quotes are not balanced', () => {
      expect(() => {
        parser._splitLine('"unbalanced quoted value');
      }).to.throw(Error);
    });
  });

});
