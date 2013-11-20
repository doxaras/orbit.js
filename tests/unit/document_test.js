import Orbit from 'orbit/core';
import Document from 'orbit/document';

var doc;

///////////////////////////////////////////////////////////////////////////////

module("Unit - Document", {
  setup: function() {
    doc = new Document();
  },

  teardown: function() {
    doc = null;
  }
});

test("it exists", function() {
  ok(doc);
});

/*
  `reset` tests
 */

test("#reset - will clear the document by default", function() {
  doc.reset();
  deepEqual(doc.retrieve(), {});
});

test("#reset - will reset the full document to the value specified", function() {
  var data = {a: 'b', c: ['d', 'e']};
  doc.reset(data);
  deepEqual(doc.retrieve(), data);
});

/*
  `retrieve` tests
 */

test("#retrieve - will retrieve the full document by default", function() {
  deepEqual(doc.retrieve(), {});

  doc.reset({a: 'b', c: ['d', 'e']});
  deepEqual(doc.retrieve(), {a: 'b', c: ['d', 'e']});
});

test("#retrieve - will retrieve a value from a simple object path", function() {
  doc.reset({a: 'b', c: ['d', 'e']});
  deepEqual(doc.retrieve('/a'), 'b');
});

test("#retrieve - will retrieve an array value from a simple object path", function() {
  doc.reset({a: 'b', c: ['d', 'e']});
  deepEqual(doc.retrieve('/c'), ['d', 'e']);
});

test("#retrieve - will retrieve a value at the end of an array", function() {
  doc.reset({a: 'b', c: ['d', 'e', 'f']});
  deepEqual(doc.retrieve('/c/-'), 'f');
});

test("#retrieve - will retrieve a value at a specific position in an array", function() {
  doc.reset({a: 'b', c: ['d', 'e', 'f']});
  deepEqual(doc.retrieve('/c/1'), 'e');
});

test("#retrieve - will retrieve a value with an array in the path", function() {
  doc.reset({a: 'b', c: ['d', {e: 'f'}]});
  deepEqual(doc.retrieve('/c/1/e'), 'f');
});

/*
  `add` tests
 */

test("#transform - `add` - can add a value to the root object", function() {
  doc.reset({foo: 'bar'});
  doc.transform({op: 'add', path: '/', value: {baz: 'boo'}});
  deepEqual(doc.retrieve(), {baz: 'boo'});
});

test("#transform - `add` - can add a value to a parent object path that doesn't exist", function() {
  doc.reset({foo: 'bar'});
  doc.transform({op: 'add', path: '/baz', value: 'boo'});
  deepEqual(doc.retrieve(), {foo: 'bar', baz: 'boo'});
});

test("#transform - `add` - can NOT add data to a grandparent object path that doesn't exist", function() {
  doc.reset({q: 'bar'});
  throws(
    function() {
      doc.transform({op: 'add', path: '/a/b', value: 'boo'});
    },
    Document.PathNotFoundException
  );
});

test("#transform - `add` - can replace an object at a target object path", function() {
  doc.reset({a: 'bar'});
  doc.transform({op: 'add', path: '/a', value: 'baz'});
  deepEqual(doc.retrieve(), {a: 'baz'});
});

test("#transform - `add` - can append a value to the end of a targeted array", function() {
  doc.reset({foo: ['bar', 'baz']});
  doc.transform({op: 'add', path: '/foo/-', value: 'boo'});
  deepEqual(doc.retrieve(), {foo: ['bar', 'baz', 'boo']});
});

test("#transform - `add` - can insert a value in a specific position in a targeted array", function() {
  doc.reset({foo: ['a', 'c']});
  doc.transform({op: 'add', path: '/foo/1', value: 'b'});
  deepEqual(doc.retrieve(), {foo: ['a', 'b', 'c']});

  doc.transform({op: 'add', path: '/foo/3', value: 'd'});
  deepEqual(doc.retrieve(), {foo: ['a', 'b', 'c', 'd']});
});

test("#transform - `add` - can NOT insert a value in a position beyond the end of an targeted array", function() {
  doc.reset({foo: ['a', 'b']});
  throws(
    function() {
      doc.transform({op: 'add', path: '/foo/3', value: 'x'});
    },
    Document.PathNotFoundException
  );
});

/*
  `remove` tests
 */

test("#transform - `remove` - can clear the root object", function() {
  doc.reset({a: 'bar'});
  doc.transform({op: 'remove', path: '/'});
  deepEqual(doc.retrieve(), {});
});

test("#transform - `remove` - can remove an object at a target object path", function() {
  doc.reset({a: 'bar'});
  doc.transform({op: 'remove', path: '/a'});
  deepEqual(doc.retrieve(), {});
});

test("#transform - `remove` - verifies that a target object path exists", function() {
  doc.reset({foo: 'bar'});
  throws(
    function() {
      doc.transform({op: 'remove', path: '/a'});
    },
    Document.PathNotFoundException
  );
});

test("#transform - `remove` - can remove a nested object at a target object path", function() {
  doc.reset({a: {b: 'c'}});
  doc.transform({op: 'remove', path: '/a/b'});
  deepEqual(doc.retrieve(), {a: {}});
});

test("#transform - `remove` - verifies that a nested object path exists", function() {
  doc.reset({foo: {bar: 'baz'}});
  throws(
    function() {
      doc.transform({op: 'remove', path: '/foo/baz'});
    },
    Document.PathNotFoundException
  );
});

test("#transform - `remove` - can remove an object from the end of a targeted array", function() {
  doc.reset({foo: ['bar', 'baz', 'boo']});
  doc.transform({op: 'remove', path: '/foo/-'});
  deepEqual(doc.retrieve(), {foo: ['bar', 'baz']});
});

test("#transform - `remove` - can NOT remove the last value in an empty array", function() {
  doc.reset({foo: []});
  throws(
    function() {
      doc.transform({op: 'remove', path: '/foo/-'});
    },
    Document.PathNotFoundException
  );
});

test("#transform - `remove` - can remove an object from a specific position in a targeted array", function() {
  doc.reset({foo: ['bar', 'baz', 'boo']});
  doc.transform({op: 'remove', path: '/foo/1'});
  deepEqual(doc.retrieve(), {foo: ['bar', 'boo']});
});

test("#transform - `remove` - can NOT an object from a position not present in a targeted array", function() {
  doc.reset({foo: ['bar', 'baz', 'boo']});
  throws(
    function() {
      doc.transform({op: 'remove', path: '/foo/3'});
    },
    Document.PathNotFoundException
  );
});

/*
  `replace` tests
 */

test("#transform - `replace` - can replace the root object", function() {
  doc.reset({a: 'bar'});
  doc.transform({op: 'replace', path: '/', value: {baz: 'boo'}});
  deepEqual(doc.retrieve(), {baz: 'boo'});
});

test("#transform - `replace` - can replace an object at a target object path", function() {
  doc.reset({a: 'bar'});
  doc.transform({op: 'replace', path: '/a', value: 'boo'});
  deepEqual(doc.retrieve(), {a: 'boo'});
});

test("#transform - `replace` - verifies that a target object path exists", function() {
  doc.reset({foo: 'bar'});
  throws(
    function() {
      doc.transform({op: 'replace', path: '/a', value: 'boo'});
    },
    Document.PathNotFoundException
  );
});

test("#transform - `replace` - can replace a nested object at a target object path", function() {
  doc.reset({a: {b: 'c'}});
  doc.transform({op: 'replace', path: '/a/b', value: 'd'});
  deepEqual(doc.retrieve(), {a: {b: 'd'}});
});

test("#transform - `replace` - verifies that a nested object path exists", function() {
  doc.reset({foo: {bar: 'baz'}});
  throws(
    function() {
      doc.transform({op: 'replace', path: '/foo/baz', value: 'boo'});
    },
    Document.PathNotFoundException
  );
});

test("#transform - `replace` - can replace an object from the end of a targeted array", function() {
  doc.reset({foo: ['bar', 'baz', 'boo']});
  doc.transform({op: 'replace', path: '/foo/-', value: 'fuz'});
  deepEqual(doc.retrieve(), {foo: ['bar', 'baz', 'fuz']});
});

test("#transform - `replace` - can NOT replace the last value in an empty array", function() {
  doc.reset({foo: []});
  throws(
    function() {
      doc.transform({op: 'replace', path: '/foo/-', value: 'boo'});
    },
    Document.PathNotFoundException
  );
});

test("#transform - `replace` - can replace an object from a specific position in a targeted array", function() {
  doc.reset({foo: ['bar', 'baz', 'boo']});
  doc.transform({op: 'replace', path: '/foo/1', value: 'fuz'});
  deepEqual(doc.retrieve(), {foo: ['bar', 'fuz', 'boo']});
});

test("#transform - `replace` - can NOT an object from a position not present in a targeted array", function() {
  doc.reset({foo: ['bar', 'baz', 'boo']});
  throws(
    function() {
      doc.transform({op: 'replace', path: '/foo/3', value: 'boo'});
    },
    Document.PathNotFoundException
  );
});

/*
  `move` tests
 */

test("#transform - `move` - can replace the root object with itself (yes, this is silly)", function() {
  doc.reset({a: 'bar'});
  doc.transform({op: 'move', from: '/', path: '/'});
  deepEqual(doc.retrieve(), {a: 'bar'});
});

test("#transform - `move` - can move an object at a target object path", function() {
  doc.reset({a: 'bar'});
  doc.transform({op: 'move', from: '/a', path: '/b'});
  deepEqual(doc.retrieve(), {b: 'bar'});
});

test("#transform - `move` - verifies that a target object path exists", function() {
  doc.reset({foo: 'bar'});
  throws(
    function() {
      doc.transform({op: 'move', from: '/nonexistent', path: '/b'});
    },
    Document.PathNotFoundException
  );
});

test("#transform - `move` - can move a nested object at a target object path", function() {
  doc.reset({a: {b: 'c'}});
  doc.transform({op: 'move', from: '/a/b', path: '/d'});
  deepEqual(doc.retrieve(), {a: {}, d: 'c'});
});

test("#transform - `move` - verifies that a nested object path exists", function() {
  doc.reset({foo: {bar: 'baz'}});
  throws(
    function() {
      doc.transform({op: 'move', from: '/foo/nonexistent', path: '/boo'});
    },
    Document.PathNotFoundException
  );
});

test("#transform - `move` - can move an object from the end of a targeted array", function() {
  doc.reset({foo: ['bar', 'baz', 'boo']});
  doc.transform({op: 'move', from: '/foo/-', path: '/fuz'});
  deepEqual(doc.retrieve(), {foo: ['bar', 'baz'], fuz: 'boo'});
});

test("#transform - `move` - can NOT move the last value in an empty array", function() {
  doc.reset({foo: []});
  throws(
    function() {
      doc.transform({op: 'move', from: '/foo/-', path: '/fuz'});
    },
    Document.PathNotFoundException
  );
});

test("#transform - `move` - can move an object from a specific position in a targeted array", function() {
  doc.reset({foo: ['a', 'b', 'c']});
  doc.transform({op: 'move', from: '/foo/0', path: '/foo/2'});
  deepEqual(doc.retrieve(), {foo: ['b', 'c', 'a']});
});

test("#transform - `move` - can NOT an object from a position not present in a targeted array", function() {
  doc.reset({foo: ['a', 'b', 'c']});
  throws(
    function() {
      doc.transform({op: 'move', from: '/foo/3', path: '/foo/0'});
    },
    Document.PathNotFoundException
  );
});

/*
  `copy` tests
 */

test("#transform - `copy` - can replace the root object with itself (yes, this is silly)", function() {
  doc.reset({a: 'bar'});
  doc.transform({op: 'copy', from: '/', path: '/'});
  deepEqual(doc.retrieve(), {a: 'bar'});
});

test("#transform - `copy` - can copy an object at a target object path", function() {
  doc.reset({a: 'bar'});
  doc.transform({op: 'copy', from: '/a', path: '/b'});
  deepEqual(doc.retrieve(), {a: 'bar', b: 'bar'});
});

test("#transform - `copy` - verifies that a target object path exists", function() {
  doc.reset({foo: 'bar'});
  throws(
    function() {
      doc.transform({op: 'copy', from: '/nonexistent', path: '/b'});
    },
    Document.PathNotFoundException
  );
});

test("#transform - `copy` - can copy a nested object at a target object path", function() {
  doc.reset({a: {b: {c: 'd'}}});
  doc.transform({op: 'copy', from: '/a/b', path: '/e'});
  deepEqual(doc.retrieve(), {a: {b: {c: 'd'}}, e: {c: 'd'}});
});

test("#transform - `copy` - verifies that a nested object path exists", function() {
  doc.reset({foo: {bar: 'baz'}});
  throws(
    function() {
      doc.transform({op: 'copy', from: '/foo/nonexistent', path: '/boo'});
    },
    Document.PathNotFoundException
  );
});

test("#transform - `copy` - can copy an object from the end of a targeted array", function() {
  doc.reset({foo: ['bar', 'baz', 'boo']});
  doc.transform({op: 'copy', from: '/foo/-', path: '/fuz'});
  deepEqual(doc.retrieve(), {foo: ['bar', 'baz', 'boo'], fuz: 'boo'});
});

test("#transform - `copy` - can NOT copy the last value in an empty array", function() {
  doc.reset({foo: []});
  throws(
    function() {
      doc.transform({op: 'copy', from: '/foo/-', path: '/fuz'});
    },
    Document.PathNotFoundException
  );
});

test("#transform - `copy` - can copy an object from a specific position in a targeted array", function() {
  doc.reset({foo: ['a', 'b', 'c']});
  doc.transform({op: 'copy', from: '/foo/0', path: '/foo/3'});
  deepEqual(doc.retrieve(), {foo: ['a', 'b', 'c', 'a']});
});

test("#transform - `copy` - can NOT an object from a position not present in a targeted array", function() {
  doc.reset({foo: ['a', 'b', 'c']});
  throws(
    function() {
      doc.transform({op: 'copy', from: '/foo/3', path: '/foo/0'});
    },
    Document.PathNotFoundException
  );
});